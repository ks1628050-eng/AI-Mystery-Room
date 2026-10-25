import mongoose from 'mongoose';

export const LeaderboardSchema = new mongoose.Schema({
  detectiveName: { type: String, default: 'Anonymous Sleuth' },
  caseId: { type: String, required: true },
  caseTitle: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  score: { type: Number, required: true },
  rankTitle: {
    type: String,
    enum: ['Junior Sleuth', 'Private Eye', 'Senior Detective', 'Master Detective'],
    default: 'Junior Sleuth'
  },
  cluesDiscovered: { type: Number, default: 0 },
  hintsUsed: { type: Number, default: 0 },
  actionPointsLeft: { type: Number, default: 0 },
  verdict: { type: String, enum: ['SOLVED', 'FAILED'], required: true },
  solvedAt: { type: Date, default: Date.now }
});

export const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', LeaderboardSchema);
export default Leaderboard;
