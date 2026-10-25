import mongoose from 'mongoose';

export const SuspectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  alibi: { type: String, required: true },
  isCulprit: { type: Boolean, required: true }, // PRIVATE TO BACKEND
  motive: { type: String, required: true } // PRIVATE TO BACKEND
});

export const ClueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discovered: { type: Boolean, default: false },
  locationFound: { type: String }
});

export const HintSchema = new mongoose.Schema({
  text: { type: String, required: true },
  unlocked: { type: Boolean, default: false }
});

export const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  premise: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  crimeSceneStory: { type: String, required: true },
  suspects: [SuspectSchema],
  clues: [ClueSchema],
  hints: [HintSchema],
  solutionExplanation: { type: String, required: true }, // PRIVATE TO BACKEND
  playerProgress: {
    actionPointsRemaining: { type: Number, default: 10 },
    cluesDiscoveredCount: { type: Number, default: 0 },
    hintsUsedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'SOLVED', 'FAILED'],
      default: 'IN_PROGRESS'
    }
  },
  accusationResult: {
    suspectAccused: { type: String },
    isCorrect: { type: Boolean },
    finalScore: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

// Method to safely return public case data (strips isCulprit, motive, solutionExplanation unless solved or failed)
CaseSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  const isFinished = obj.playerProgress?.status === 'SOLVED' || obj.playerProgress?.status === 'FAILED';

  if (!isFinished) {
    delete obj.solutionExplanation;
    if (obj.suspects && Array.isArray(obj.suspects)) {
      obj.suspects = obj.suspects.map((suspect) => {
        const { isCulprit, motive, ...publicSuspect } = suspect;
        return publicSuspect;
      });
    }
  }

  return obj;
};

export const Case = mongoose.models.Case || mongoose.model('Case', CaseSchema);
export default Case;
