import { z } from 'zod';

export const SuspectZodSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  bio: z.string().min(10),
  alibi: z.string().min(10),
  isCulprit: z.boolean(),
  motive: z.string().min(5),
});

export const ClueZodSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  discovered: z.boolean().default(false),
  locationFound: z.string().min(2),
});

export const HintZodSchema = z.object({
  text: z.string().min(10),
  unlocked: z.boolean().default(false),
});

export const CaseZodSchema = z.object({
  title: z.string().min(3),
  premise: z.string().min(5),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  crimeSceneStory: z.string().min(50),
  suspects: z.array(SuspectZodSchema),
  clues: z.array(ClueZodSchema),
  hints: z.array(HintZodSchema),
  solutionExplanation: z.string().min(50),
}).refine((data) => {
  const culpritCount = data.suspects.filter((s) => s.isCulprit).length;
  return culpritCount === 1;
}, {
  message: 'Exactly one suspect must be designated as the culprit (isCulprit: true).',
  path: ['suspects'],
});

export const CreateCaseInputSchema = z.object({
  premise: z.string().optional().default('A rainy midnight murder in an old Victorian mansion library'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  genre: z.string().optional().default('Classic Noir'),
});

export const InterrogateInputSchema = z.object({
  suspectId: z.string().min(1),
  question: z.string().min(1).max(500),
});

export const AccusationInputSchema = z.object({
  suspectId: z.string().min(1),
  supportingClueId: z.string().optional(),
  deductionNotes: z.string().optional(),
});
