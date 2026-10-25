import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';
import { CaseZodSchema } from '../schemas/mysterySchema.js';
import { generateProceduralMystery } from './proceduralFallback.js';

// Helper to clean JSON string from LLM responses (stripping markdown backticks, etc.)
export function cleanJsonText(rawText) {
  if (!rawText) return '';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  }
  return cleaned.trim();
}

export async function generateMysteryWithGemini({ premise, difficulty = 'Medium', genre = 'Classic Noir' }) {
  const diffConfig = {
    Easy: { suspectCount: 3, cluesCount: 5, hintsCount: 2, actionPoints: 12, basePoints: 100 },
    Medium: { suspectCount: 4, cluesCount: 7, hintsCount: 3, actionPoints: 10, basePoints: 150 },
    Hard: { suspectCount: 5, cluesCount: 9, hintsCount: 3, actionPoints: 8, basePoints: 200 },
  }[difficulty] || { suspectCount: 4, cluesCount: 7, hintsCount: 3, actionPoints: 10, basePoints: 150 };

  const systemPrompt = `You are the Master Storyteller and Game Architect for an elite noir detective mystery game titled "AI Mystery Room".
Generate a high-stakes, logically airtight mystery case tailored to the following requirements:
- Difficulty: ${difficulty}
- Target Suspect Count: ${diffConfig.suspectCount}
- Target Clues Count: ${diffConfig.cluesCount}
- Target Hints Count: ${diffConfig.hintsCount}
- User Premise/Theme: "${premise || 'An enigmatic murder in a locked private study during a violent storm'}"
- Genre: ${genre}

CRITICAL RULES:
1. Output MUST be valid JSON adhering EXACTLY to this structure:
{
  "title": "Compelling noir case title",
  "premise": "Short premise summary",
  "difficulty": "${difficulty}",
  "crimeSceneStory": "Atmospheric, vivid description of the crime scene, victim, and setting (150-250 words)",
  "suspects": [
    {
      "name": "Full name",
      "role": "Social title or profession",
      "bio": "Detailed background and relationship to victim (2-3 sentences)",
      "alibi": "Where they claim they were and what they claim they were doing",
      "isCulprit": boolean (EXACTLY ONE suspect must have isCulprit: true, others false),
      "motive": "Hidden motive or grievance"
    }
  ],
  "clues": [
    {
      "title": "Short evocative clue title",
      "description": "Specific physical evidence, forensic detail, or document found",
      "discovered": false,
      "locationFound": "Specific place in or around crime scene"
    }
  ],
  "hints": [
    {
      "text": "Subtle deductive hint pointing player in the right direction without directly naming the culprit",
      "unlocked": false
    }
  ],
  "solutionExplanation": "Comprehensive explanation revealing the true culprit, exposing their motive, explaining why their alibi collapses, and showing how at least 2 clues prove their guilt."
}

2. Exactly ONE suspect must have isCulprit: true.
3. Clues must logically point toward the culprit through deductive reasoning (motive, means, or broken alibi).
4. No meta text, markdown explanations, or comments outside the JSON. Return only the JSON object.`;

  // If no Gemini key is provided in environment, use procedural generator
  const apiKey = ENV.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('[GeminiService] No GEMINI_API_KEY provided; utilizing procedural AI mystery engine.');
    return generateProceduralMystery({ premise, difficulty, genre });
  }

  // Attempt generation via Gemini API (fast fallback to procedural if rate-limited or unavailable)
  for (let attempt = 1; attempt <= 1; attempt++) {
    try {
      console.log(`[GeminiService] Calling Gemini API...`);
      let jsonText = '';

      const withTimeout = (p, ms = 5000) =>
        Promise.race([
          p,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API timeout')), ms)),
        ]);

      // Try @google/genai SDK with modern models
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: systemPrompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.8,
            },
          }),
          4500
        );
        jsonText = response.text || '';
      } catch (genAiError) {
        console.warn(`[GeminiService] gemini-3.8-flash attempt failed (${genAiError.message}), trying fallback...`);
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await withTimeout(
            ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: systemPrompt,
              config: { responseMimeType: 'application/json' },
            }),
            4000
          );
          jsonText = response.text || '';
        } catch (e2) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
          });
          const result = await withTimeout(model.generateContent(systemPrompt), 4000);
          jsonText = result.response.text();
        }
      }

      const cleaned = cleanJsonText(jsonText);
      const parsed = JSON.parse(cleaned);

      // Validate with Zod
      const validated = CaseZodSchema.parse(parsed);

      // Attach playerProgress conforming to difficulty matrix
      return {
        ...validated,
        playerProgress: {
          actionPointsRemaining: diffConfig.actionPoints,
          cluesDiscoveredCount: 0,
          hintsUsedCount: 0,
          status: 'IN_PROGRESS',
        },
      };
    } catch (error) {
      console.error(`[GeminiService] Error on attempt ${attempt}:`, error.message);
      if (attempt === 2) {
        console.warn('[GeminiService] Gemini attempts exhausted or failed validation; using procedural AI engine.');
        return generateProceduralMystery({ premise, difficulty, genre });
      }
    }
  }

  return generateProceduralMystery({ premise, difficulty, genre });
}

export async function interrogateSuspectWithGemini({ suspect, caseStory, question, clues = [] }) {
  const apiKey = ENV.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return generateProceduralInterrogation(suspect, question);
  }

  try {
    const prompt = `You are roleplaying as ${suspect.name}, a character in a noir detective mystery game.
Your Profile:
- Role: ${suspect.role}
- Bio: ${suspect.bio}
- Stated Alibi: "${suspect.alibi}"
- Private Truth: You are ${suspect.isCulprit ? 'GUILTY of the crime. Your real motive is: ' + suspect.motive + '. You must try to defend yourself and maintain your alibi without outright confessing, but show subtle stress if asked sharp questions about your alibi.' : 'INNOCENT. You did not commit the crime, but you might have secrets or gossip to share about other suspects.'}

Case Setting:
${caseStory}

The detective is currently interrogating you and just asked:
"${question}"

Respond in-character directly to the detective in 2 to 4 sentences. Speak naturally in your persona's voice (e.g. aristocratic, defensive, frightened, sarcastic, or cold). Do NOT break character or include stage directions in brackets.`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 250,
        },
      });
      return response.text.trim();
    } catch (sdkError) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    }
  } catch (error) {
    console.warn(`[GeminiService] Interrogation API error (${error.message}). Using fallback dialogue.`);
    return generateProceduralInterrogation(suspect, question);
  }
}

function generateProceduralInterrogation(suspect, question) {
  const q = question.toLowerCase();

  if (q.includes('where were you') || q.includes('alibi') || q.includes('time')) {
    return `I already stated this for the record: ${suspect.alibi}. Why don't you look at the other guests instead of harassing someone with a clean conscience?`;
  }

  if (q.includes('kill') || q.includes('murder') || q.includes('crime') || q.includes('culprit')) {
    if (suspect.isCulprit) {
      return `How dare you point fingers at me without hard evidence! I may have had my disagreements with them, but murder? That is preposterous... and you'll find nothing to prove it!`;
    }
    return `Murder? Good heavens, no! I was terrified the moment the screams started. You ought to question those who stood to gain from the inheritance or business deals!`;
  }

  if (q.includes('motive') || q.includes('money') || q.includes('will') || q.includes('safe') || q.includes('secret')) {
    if (suspect.isCulprit) {
      return `My personal finances and private affairs are none of your concern, Detective. Focus on the facts rather than spinning cheap conspiracy theories.`;
    }
    return `Everyone in this house had something to hide, Detective. But hiding a few debts or family squabbles is a far cry from taking a human life.`;
  }

  if (q.includes('clue') || q.includes('watch') || q.includes('fingerprint') || q.includes('ledger') || q.includes('footprint')) {
    if (suspect.isCulprit) {
      return `Traces? Items get moved around this mansion all the time! Someone could easily have planted that to frame me. You can't pin this on me!`;
    }
    return `That sounds peculiar... I certainly didn't leave anything like that behind. You should check whose monogram and shoe size matches.`;
  }

  // General in-character response
  return `Listen to me closely, Detective. ${suspect.bio.split('.')[0]}. I have answered your questions honestly. If you want the truth, keep digging into the physical evidence instead of wasting time.`;
}
