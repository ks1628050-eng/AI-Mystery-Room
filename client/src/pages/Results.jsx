import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';
import { fetchCaseById } from '../services/api';
import { calculateDetectiveRank } from '../utils/ranks';
import { useDetective } from '../context/DetectiveContext';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { detectiveName } = useDetective();

  const [caseData, setCaseData] = useState(null);
  const [verdictData, setVerdictData] = useState(location.state?.verdictData || null);
  const [loading, setLoading] = useState(!verdictData);

  useEffect(() => {
    if (!verdictData) {
      fetchCaseById(id)
        .then((data) => {
          setCaseData(data);
          const isSolved = data.playerProgress?.status === 'SOLVED';
          const basePoints = { Easy: 100, Medium: 150, Hard: 200 }[data.difficulty] || 150;
          const cluesBonus = (data.playerProgress?.cluesDiscoveredCount || 0) * 5;
          const hintsPenalty = (data.playerProgress?.hintsUsedCount || 0) * 10;
          const finalScore = isSolved ? Math.max(0, basePoints + cluesBonus - hintsPenalty) : 0;

          setVerdictData({
            isCorrect: isSolved,
            verdict: data.playerProgress?.status,
            accusedName: data.accusationResult?.suspectAccused || 'Unknown',
            trueCulpritName: data.suspects?.find((s) => s.isCulprit)?.name || 'The Real Killer',
            scoreBreakdown: {
              basePoints: isSolved ? basePoints : 0,
              cluesDiscovered: data.playerProgress?.cluesDiscoveredCount || 0,
              cluesBonus: isSolved ? cluesBonus : 0,
              hintsUsed: data.playerProgress?.hintsUsedCount || 0,
              hintsPenalty: isSolved ? hintsPenalty : 0,
              finalScore,
              rankTitle: calculateDetectiveRank(finalScore).title,
            },
            solutionExplanation: data.solutionExplanation,
            confession: isSolved
              ? `The accused hangs their head as you present the indisputable evidence: "Alright, Detective... you got me. I thought the storm and my alibi would protect me, but you saw straight through the deception."`
              : `The court declares a mistrial! An innocent suspect was falsely accused while the true mastermind slipped into the shadows without a trace.`,
          });
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, verdictData]);

  // Trigger celebratory confetti on victory!
  useEffect(() => {
    if (verdictData?.isCorrect) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#e11d48', '#38bdf8', '#10b981'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [verdictData]);

  if (loading || !verdictData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center font-mono text-stone-400">
        Reviewing official court proceedings...
      </div>
    );
  }

  const isWin = verdictData.isCorrect;
  const score = verdictData.scoreBreakdown?.finalScore || 0;
  const rank = calculateDetectiveRank(score);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Grand Verdict Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-3xl border p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl ${
          isWin
            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-emerald-950/40'
            : 'bg-rose-950/30 border-rose-600/60 shadow-rose-950/40'
        }`}
      >
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full font-mono text-xs uppercase tracking-widest bg-stone-950/80 border border-stone-800">
            {isWin ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Case Closed • Justice Served
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Case Unsolved • The Killer Escaped
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-stone-100">
            {isWin ? 'Perceptive Deduction, Detective!' : 'Miscarriage of Justice!'}
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto font-sans leading-relaxed">
            {isWin
              ? `Your accusation of ${verdictData.accusedName} was verified without a shadow of a doubt.`
              : `You wrongfully accused ${verdictData.accusedName}. The true mastermind was ${verdictData.trueCulpritName}.`}
          </p>
        </div>
      </motion.div>

      {/* Confession & Narrative Breakdown */}
      <div className="bg-noir-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 block mb-1">
            OFFICIAL TRANSCRIPT & DEPOSITION
          </span>
          <h3 className="text-xl font-serif font-bold text-stone-100">
            {isWin ? "Culprit's Sworn Confession" : "Aftermath & Police Report"}
          </h3>
        </div>

        <blockquote className="p-4 bg-stone-950/80 border-l-4 border-amber-500 rounded-r-xl text-stone-200 font-serif italic text-sm sm:text-base leading-relaxed">
          {verdictData.confession}
        </blockquote>

        {verdictData.solutionExplanation && (
          <div className="pt-4 border-t border-stone-800/80 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">
              The Real Solution & Chain of Evidence:
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
              {verdictData.solutionExplanation}
            </p>
          </div>
        )}
      </div>

      {/* Score Breakdown Card */}
      <div className="bg-noir-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-100">
              Deduction Performance & Scoring Analytics
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Scoring Formula: max(0, Base Points + (Clues Discovered × 5) - (Hints Used × 10))
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">Calculated Score</span>
            <span className="text-2xl font-mono font-black text-amber-400">{score} PTS</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">Base Accusation:</span>
            <span className="text-stone-100 font-bold text-sm">
              +{verdictData.scoreBreakdown?.basePoints || 0} pts
            </span>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">
              Clues Found ({verdictData.scoreBreakdown?.cluesDiscovered || 0}):
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              +{verdictData.scoreBreakdown?.cluesBonus || 0} pts
            </span>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">
              Hints Penalty ({verdictData.scoreBreakdown?.hintsUsed || 0}):
            </span>
            <span className="text-rose-400 font-bold text-sm">
              -{verdictData.scoreBreakdown?.hintsPenalty || 0} pts
            </span>
          </div>
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">Detective Rank:</span>
            <span className={`font-bold text-sm ${rank.badgeColor.split(' ')[0]}`}>
              {rank.title}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          to="/archive"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-mono text-xs transition-colors"
        >
          <BookOpen className="w-4 h-4 opacity-75" />
          <span>Cold Case Archives</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-mono text-xs transition-colors"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </Link>

          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-detective-amber hover:bg-amber-400 text-noir-950 font-serif font-black text-xs uppercase tracking-wider shadow-noir-glow transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Investigate Another Mystery</span>
          </button>
        </div>
      </div>
    </div>
  );
}
