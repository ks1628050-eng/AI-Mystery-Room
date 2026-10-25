import express from 'express';
import { CreateCaseInputSchema, InterrogateInputSchema, AccusationInputSchema } from '../schemas/mysterySchema.js';
import { generateMysteryWithGemini, interrogateSuspectWithGemini } from '../services/geminiService.js';
import { CaseRepository } from '../services/caseRepository.js';

const router = express.Router();

const BASE_POINTS = {
  Easy: 100,
  Medium: 150,
  Hard: 200,
};

function getDetectiveRank(score) {
  if (score >= 180) return 'Master Detective';
  if (score >= 130) return 'Senior Detective';
  if (score >= 80) return 'Private Eye';
  return 'Junior Sleuth';
}

// POST /api/cases - Generates new mystery via Gemini and saves to DB
router.post('/cases', async (req, res, next) => {
  try {
    const parsedInput = CreateCaseInputSchema.parse(req.body);
    const caseData = await generateMysteryWithGemini({
      premise: parsedInput.premise,
      difficulty: parsedInput.difficulty,
      genre: parsedInput.genre,
    });

    const savedCase = await CaseRepository.createCase(caseData);
    const publicCase = typeof savedCase.toPublicJSON === 'function' ? savedCase.toPublicJSON() : savedCase;

    return res.status(201).json({
      success: true,
      data: publicCase,
      message: 'New case generated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases - List recent case files
router.get('/cases', async (req, res, next) => {
  try {
    const cases = await CaseRepository.listRecentCases(15);
    return res.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id - Retrieves active case state (sanitized)
router.get('/cases/:id', async (req, res, next) => {
  try {
    const caseItem = await CaseRepository.findCaseById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const publicCase = typeof caseItem.toPublicJSON === 'function' ? caseItem.toPublicJSON() : caseItem;
    return res.json({
      success: true,
      data: publicCase,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/clues/:clueId/discover - Unlocks a specific clue and deducts Action Points
router.post('/cases/:id/clues/:clueId/discover', async (req, res, next) => {
  try {
    const caseItem = await CaseRepository.findCaseById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    if (caseItem.playerProgress.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Case is already closed' });
    }

    if (caseItem.playerProgress.actionPointsRemaining <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No Action Points remaining! You must proceed to Accusation.',
      });
    }

    const clue = caseItem.clues.find(
      (c) => c._id?.toString() === req.params.clueId || c.id === req.params.clueId
    );

    if (!clue) {
      return res.status(404).json({ success: false, message: 'Clue not found' });
    }

    if (clue.discovered) {
      return res.status(200).json({
        success: true,
        message: 'Clue already uncovered',
        data: typeof caseItem.toPublicJSON === 'function' ? caseItem.toPublicJSON() : caseItem,
      });
    }

    // Unlock clue and spend 1 action point
    clue.discovered = true;
    caseItem.playerProgress.actionPointsRemaining = Math.max(0, caseItem.playerProgress.actionPointsRemaining - 1);
    caseItem.playerProgress.cluesDiscoveredCount += 1;

    await CaseRepository.saveCase(caseItem);

    return res.json({
      success: true,
      message: `Clue "${clue.title}" discovered!`,
      discoveredClue: clue,
      data: typeof caseItem.toPublicJSON === 'function' ? caseItem.toPublicJSON() : caseItem,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/hints - Unlocks the next available hint and records usage
router.post('/cases/:id/hints', async (req, res, next) => {
  try {
    const caseItem = await CaseRepository.findCaseById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    if (caseItem.playerProgress.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Case is already closed' });
    }

    const nextHint = caseItem.hints.find((h) => !h.unlocked);
    if (!nextHint) {
      return res.status(400).json({ success: false, message: 'All available hints have been revealed' });
    }

    nextHint.unlocked = true;
    caseItem.playerProgress.hintsUsedCount += 1;

    await CaseRepository.saveCase(caseItem);

    return res.json({
      success: true,
      message: 'Hint unlocked (-10 score penalty applied at final scoring)',
      unlockedHint: nextHint,
      data: typeof caseItem.toPublicJSON === 'function' ? caseItem.toPublicJSON() : caseItem,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/interrogate - Sends a question to a specific suspect and returns AI response
router.post('/cases/:id/interrogate', async (req, res, next) => {
  try {
    const { suspectId, question } = InterrogateInputSchema.parse(req.body);

    const caseItem = await CaseRepository.findCaseById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const suspect = caseItem.suspects.find(
      (s) => s._id?.toString() === suspectId || s.id === suspectId
    );

    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    const answer = await interrogateSuspectWithGemini({
      suspect,
      caseStory: caseItem.crimeSceneStory,
      question,
      clues: caseItem.clues.filter((c) => c.discovered),
    });

    return res.json({
      success: true,
      suspectId,
      suspectName: suspect.name,
      question,
      response: answer,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/accuse - Submits final accusation, calculates score, and returns full solution
router.post('/cases/:id/accuse', async (req, res, next) => {
  try {
    const { suspectId, deductionNotes } = AccusationInputSchema.parse(req.body);

    const caseItem = await CaseRepository.findCaseById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    if (caseItem.playerProgress.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Case is already closed' });
    }

    const accusedSuspect = caseItem.suspects.find(
      (s) => s._id?.toString() === suspectId || s.id === suspectId
    );

    if (!accusedSuspect) {
      return res.status(404).json({ success: false, message: 'Accused suspect not found in case file' });
    }

    const isCorrect = Boolean(accusedSuspect.isCulprit);
    const base = BASE_POINTS[caseItem.difficulty] || 150;
    const cluesBonus = (caseItem.playerProgress.cluesDiscoveredCount || 0) * 5;
    const hintsPenalty = (caseItem.playerProgress.hintsUsedCount || 0) * 10;

    let finalScore = 0;
    if (isCorrect) {
      finalScore = Math.max(0, base + cluesBonus - hintsPenalty);
    } else {
      // Partial consolation score if clues discovered, or 0
      finalScore = 0;
    }

    const rankTitle = getDetectiveRank(finalScore);

    // Update case record
    caseItem.playerProgress.status = isCorrect ? 'SOLVED' : 'FAILED';
    caseItem.accusationResult = {
      suspectAccused: accusedSuspect.name,
      isCorrect,
      finalScore,
      deductionNotes: deductionNotes || '',
    };

    await CaseRepository.saveCase(caseItem);

    // Save to leaderboard
    const detectiveName = req.body.detectiveName?.trim() || 'Anonymous Detective';
    await CaseRepository.addLeaderboardEntry({
      detectiveName,
      caseId: caseItem._id.toString(),
      caseTitle: caseItem.title,
      difficulty: caseItem.difficulty,
      score: finalScore,
      rankTitle,
      cluesDiscovered: caseItem.playerProgress.cluesDiscoveredCount,
      hintsUsed: caseItem.playerProgress.hintsUsedCount,
      actionPointsLeft: caseItem.playerProgress.actionPointsRemaining,
      verdict: caseItem.playerProgress.status,
    });

    const fullCase = typeof caseItem.toObject === 'function' ? caseItem.toObject() : caseItem;

    // Find the real culprit info for confession presentation
    const trueCulprit = fullCase.suspects.find((s) => s.isCulprit);

    return res.json({
      success: true,
      verdict: isCorrect ? 'SOLVED' : 'FAILED',
      isCorrect,
      accusedName: accusedSuspect.name,
      trueCulpritName: trueCulprit?.name,
      scoreBreakdown: {
        basePoints: isCorrect ? base : 0,
        cluesDiscovered: caseItem.playerProgress.cluesDiscoveredCount,
        cluesBonus: isCorrect ? cluesBonus : 0,
        hintsUsed: caseItem.playerProgress.hintsUsedCount,
        hintsPenalty: isCorrect ? hintsPenalty : 0,
        finalScore,
        rankTitle,
      },
      solutionExplanation: fullCase.solutionExplanation,
      confession: isCorrect
        ? `"${trueCulprit?.name} hangs their head as you lay out the indisputable evidence: 'Alright, Detective... you got me. My motive was ${trueCulprit?.motive}. I thought the storm and my alibi would protect me, but you saw straight through the deception.'"`
        : `"${accusedSuspect.name} looks at you in utter disbelief: 'You're arresting the wrong person! While you pin the blame on an innocent bystander, ${trueCulprit?.name} is slipping into the night!' The real killer escaped justice."`,
      data: fullCase,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/leaderboard - Top detective scores
router.get('/leaderboard', async (req, res, next) => {
  try {
    const list = await CaseRepository.getLeaderboard(25);
    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
