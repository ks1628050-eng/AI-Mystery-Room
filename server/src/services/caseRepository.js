import mongoose from 'mongoose';
import { Case } from '../models/Case.js';
import { Leaderboard } from '../models/Leaderboard.js';

// Memory fallback store if MongoDB is offline
const memoryCases = new Map();
const memoryLeaderboard = [];

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export const CaseRepository = {
  async createCase(caseData) {
    if (isMongoConnected()) {
      const doc = new Case(caseData);
      return await doc.save();
    }
    // Fallback in-memory
    const id = 'case_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const newCase = {
      _id: id,
      ...caseData,
      createdAt: new Date(),
      toPublicJSON() {
        const copy = JSON.parse(JSON.stringify(this));
        if (copy.playerProgress?.status !== 'SOLVED' && copy.playerProgress?.status !== 'FAILED') {
          delete copy.solutionExplanation;
          if (copy.suspects) {
            copy.suspects = copy.suspects.map((s) => {
              const { isCulprit, motive, ...rest } = s;
              return rest;
            });
          }
        }
        return copy;
      },
    };
    // Ensure nested IDs
    newCase.suspects = (newCase.suspects || []).map((s, idx) => ({
      _id: s._id || `suspect_${idx + 1}`,
      ...s,
    }));
    newCase.clues = (newCase.clues || []).map((c, idx) => ({
      _id: c._id || `clue_${idx + 1}`,
      ...c,
    }));
    newCase.hints = (newCase.hints || []).map((h, idx) => ({
      _id: h._id || `hint_${idx + 1}`,
      ...h,
    }));

    memoryCases.set(id, newCase);
    return newCase;
  },

  async findCaseById(id) {
    if (isMongoConnected()) {
      return await Case.findById(id);
    }
    return memoryCases.get(id) || null;
  },

  async saveCase(caseObj) {
    if (isMongoConnected() && typeof caseObj.save === 'function') {
      return await caseObj.save();
    }
    const id = caseObj._id?.toString() || caseObj.id;
    memoryCases.set(id, caseObj);
    return caseObj;
  },

  async listRecentCases(limit = 10) {
    if (isMongoConnected()) {
      return await Case.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title premise difficulty playerProgress createdAt');
    }
    return Array.from(memoryCases.values())
      .slice(-limit)
      .reverse()
      .map((c) => ({
        _id: c._id,
        title: c.title,
        premise: c.premise,
        difficulty: c.difficulty,
        playerProgress: c.playerProgress,
        createdAt: c.createdAt,
      }));
  },

  async addLeaderboardEntry(entryData) {
    if (isMongoConnected()) {
      const doc = new Leaderboard(entryData);
      return await doc.save();
    }
    const entry = {
      _id: 'lb_' + Date.now(),
      ...entryData,
      solvedAt: new Date(),
    };
    memoryLeaderboard.unshift(entry);
    return entry;
  },

  async getLeaderboard(limit = 20) {
    if (isMongoConnected()) {
      return await Leaderboard.find({})
        .sort({ score: -1, solvedAt: -1 })
        .limit(limit);
    }
    return [...memoryLeaderboard]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
};
