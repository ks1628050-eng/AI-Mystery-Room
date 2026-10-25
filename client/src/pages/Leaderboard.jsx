import React, { useEffect, useState } from 'react';
import { Award, Trophy, Medal, Shield, Sparkles } from 'lucide-react';
import { fetchLeaderboard } from '../services/api';
import { RANKS } from '../utils/ranks';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950 border border-amber-500/30 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Bureau Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-100 tracking-wide">
          Distinguished Sleuths & Rankings
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 font-mono">
          Top deduction scores achieved in active field investigations.
        </p>
      </div>

      {/* Detective Rank Hierarchy Reference */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {RANKS.map((r, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${r.badgeColor}`}>
            <span className="text-[10px] text-stone-400 block uppercase">
              Rank {idx + 1} • {r.minScore}+ pts
            </span>
            <h4 className="font-serif font-bold text-sm text-stone-100 mt-0.5">
              {r.title}
            </h4>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-noir-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-stone-500">
            Scanning police honours ledger...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-stone-400">
            No closed cases recorded yet. Solve an investigation to enter the Hall of Fame!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-noir-950 border-b border-stone-800 text-stone-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Detective</th>
                  <th className="py-3.5 px-4">Rank Title</th>
                  <th className="py-3.5 px-4">Case Title</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4 text-right">Score</th>
                  <th className="py-3.5 px-4 text-center">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {leaderboard.map((item, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <tr key={item._id || idx} className="hover:bg-stone-950/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-stone-200">
                        {item.detectiveName || 'Anonymous Sleuth'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-[11px]">
                          {item.rankTitle}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300 max-w-[200px] truncate">
                        {item.caseTitle}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {item.difficulty}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-400 text-sm">
                        {item.score} pts
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.verdict === 'SOLVED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                              : 'bg-rose-950 text-rose-400 border border-rose-700/50'
                          }`}
                        >
                          {item.verdict}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
