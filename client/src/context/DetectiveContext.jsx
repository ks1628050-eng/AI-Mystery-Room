import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateDetectiveRank } from '../utils/ranks.js';

const DetectiveContext = createContext();

export function DetectiveProvider({ children }) {
  const [detectiveName, setDetectiveName] = useState(() => {
    return localStorage.getItem('ai_mystery_detective_name') || 'Detective J. Vance';
  });

  const [careerStats, setCareerStats] = useState(() => {
    const saved = localStorage.getItem('ai_mystery_career_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      casesSolved: 0,
      casesFailed: 0,
      totalScore: 0,
      bestScore: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('ai_mystery_detective_name', detectiveName);
  }, [detectiveName]);

  useEffect(() => {
    localStorage.setItem('ai_mystery_career_stats', JSON.stringify(careerStats));
  }, [careerStats]);

  const recordCaseResult = ({ isCorrect, score }) => {
    setCareerStats((prev) => {
      const nextScore = prev.totalScore + score;
      return {
        casesSolved: prev.casesSolved + (isCorrect ? 1 : 0),
        casesFailed: prev.casesFailed + (isCorrect ? 0 : 1),
        totalScore: nextScore,
        bestScore: Math.max(prev.bestScore, score),
      };
    });
  };

  const currentRank = calculateDetectiveRank(careerStats.bestScore);

  return (
    <DetectiveContext.Provider
      value={{
        detectiveName,
        setDetectiveName,
        careerStats,
        recordCaseResult,
        currentRank,
      }}
    >
      {children}
    </DetectiveContext.Provider>
  );
}

export const useDetective = () => useContext(DetectiveContext);
