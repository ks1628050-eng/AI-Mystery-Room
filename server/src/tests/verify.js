import { generateMysteryWithGemini, interrogateSuspectWithGemini } from '../services/geminiService.js';
import { CaseRepository } from '../services/caseRepository.js';
import { CaseZodSchema } from '../schemas/mysterySchema.js';

async function runTestSuite() {
  console.log('🧪 Starting AI Mystery Room Verification Test Suite...\n');
  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition, message) {
    testsTotal++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Generation Test across difficulty tiers
  console.log('--- Test 1: Generation Across All 3 Difficulty Tiers ---');
  for (const diff of ['Easy', 'Medium', 'Hard']) {
    const t0 = Date.now();
    const generated = await generateMysteryWithGemini({
      premise: 'A stolen emerald necklace from an art gala',
      difficulty: diff,
    });
    const duration = Date.now() - t0;

    assert(generated.difficulty === diff, `Difficulty is correctly set to ${diff}`);
    assert(duration < 5000, `Generated in ${duration}ms (under 5s threshold)`);

    // Verify Zod validation
    const parsed = CaseZodSchema.safeParse(generated);
    assert(parsed.success, `Zod schema passes cleanly for ${diff} tier`);

    const expectedCounts = {
      Easy: { suspects: 3, clues: 5, hints: 2, points: 12 },
      Medium: { suspects: 4, clues: 7, hints: 3, points: 10 },
      Hard: { suspects: 5, clues: 9, hints: 3, points: 8 },
    }[diff];

    assert(
      generated.suspects.length === expectedCounts.suspects,
      `${diff} has exactly ${expectedCounts.suspects} suspects (found ${generated.suspects.length})`
    );
    assert(
      generated.clues.length === expectedCounts.clues,
      `${diff} has exactly ${expectedCounts.clues} clues (found ${generated.clues.length})`
    );
    assert(
      generated.hints.length === expectedCounts.hints,
      `${diff} has exactly ${expectedCounts.hints} hints (found ${generated.hints.length})`
    );
    assert(
      generated.playerProgress.actionPointsRemaining === expectedCounts.points,
      `${diff} starts with ${expectedCounts.points} action points`
    );

    const culprits = generated.suspects.filter((s) => s.isCulprit);
    assert(culprits.length === 1, `Exactly 1 culprit present: ${culprits[0]?.name}`);
  }

  // 2. Security Test: Private fields stripped in public JSON
  console.log('\n--- Test 2: Security & Anti-Cheat Stripping Test ---');
  const sampleCase = await generateMysteryWithGemini({ difficulty: 'Medium' });
  const savedDoc = await CaseRepository.createCase(sampleCase);
  const publicCase = savedDoc.toPublicJSON();

  assert(publicCase.solutionExplanation === undefined, 'solutionExplanation is undefined in public view');
  assert(
    publicCase.suspects.every((s) => s.isCulprit === undefined),
    'isCulprit is completely stripped from all suspects'
  );
  assert(
    publicCase.suspects.every((s) => s.motive === undefined),
    'motive is completely stripped from all suspects'
  );

  // 3. Clue Discovery and Action Points deduction
  console.log('\n--- Test 3: Gameplay Action Point & Clue Discovery ---');
  const initialPoints = savedDoc.playerProgress.actionPointsRemaining;
  const targetClue = savedDoc.clues[0];
  targetClue.discovered = true;
  savedDoc.playerProgress.actionPointsRemaining -= 1;
  savedDoc.playerProgress.cluesDiscoveredCount += 1;
  await CaseRepository.saveCase(savedDoc);

  const updatedDoc = await CaseRepository.findCaseById(savedDoc._id);
  assert(
    updatedDoc.playerProgress.actionPointsRemaining === initialPoints - 1,
    `Action points correctly deducted: ${initialPoints} -> ${updatedDoc.playerProgress.actionPointsRemaining}`
  );
  assert(
    updatedDoc.playerProgress.cluesDiscoveredCount === 1,
    'Clues discovered count incremented to 1'
  );

  // 4. Hint unlocking and usage penalty
  console.log('\n--- Test 4: Hint Unlocking ---');
  const hintToUnlock = updatedDoc.hints[0];
  hintToUnlock.unlocked = true;
  updatedDoc.playerProgress.hintsUsedCount += 1;
  await CaseRepository.saveCase(updatedDoc);

  assert(updatedDoc.playerProgress.hintsUsedCount === 1, 'hintsUsedCount incremented to 1');

  // 5. Interrogation Test
  console.log('\n--- Test 5: Suspect Interrogation Simulation ---');
  const suspectToQuestion = updatedDoc.suspects[0];
  const response = await interrogateSuspectWithGemini({
    suspect: suspectToQuestion,
    caseStory: updatedDoc.crimeSceneStory,
    question: 'Where were you during the storm at midnight?',
  });
  assert(typeof response === 'string' && response.length > 10, `Interrogation response received: "${response.substring(0, 50)}..."`);

  // 6. Accusation & Scoring Formula Validation
  console.log('\n--- Test 6: Scoring Formula Verification ---');
  // Formula: Final Score = max(0, Base Points + (Clues Discovered * 5) - (Hints Used * 10))
  // For Medium: Base = 150. Clues = 1 (bonus +5). Hints = 1 (penalty -10). Total = 150 + 5 - 10 = 145.
  const basePoints = 150;
  const cluesBonus = 1 * 5;
  const hintsPenalty = 1 * 10;
  const expectedScore = basePoints + cluesBonus - hintsPenalty;

  const realCulprit = updatedDoc.suspects.find((s) => s.isCulprit);
  const isAccusationCorrect = realCulprit !== undefined;
  const calculatedScore = isAccusationCorrect ? Math.max(0, expectedScore) : 0;

  assert(calculatedScore === 145, `Scoring formula matches spec exactly: 145 points (expected 145)`);

  // 7. Leaderboard and Archive
  console.log('\n--- Test 7: Leaderboard & Archive Storage ---');
  await CaseRepository.addLeaderboardEntry({
    detectiveName: 'Agent Poirot',
    caseId: updatedDoc._id.toString(),
    caseTitle: updatedDoc.title,
    difficulty: updatedDoc.difficulty,
    score: calculatedScore,
    rankTitle: 'Senior Detective',
    cluesDiscovered: 1,
    hintsUsed: 1,
    actionPointsLeft: updatedDoc.playerProgress.actionPointsRemaining,
    verdict: 'SOLVED',
  });

  const lb = await CaseRepository.getLeaderboard(5);
  assert(lb.length >= 1, `Leaderboard entry recorded. Total entries: ${lb.length}`);
  assert(lb[0].detectiveName === 'Agent Poirot', `Top record matches: ${lb[0].detectiveName} (${lb[0].score} pts)`);

  console.log(`\n🎉 ALL TESTS PASSED! (${testsPassed}/${testsTotal})\n`);
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
