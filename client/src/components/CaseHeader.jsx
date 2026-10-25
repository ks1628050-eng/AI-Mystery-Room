import React from 'react';
import { ShieldAlert, Lightbulb, Zap, HelpCircle, Target } from 'lucide-react';

export default function CaseHeader({
  caseData,
  onOpenHintModal,
  onOpenAccusationModal,
}) {
  const { title, difficulty, playerProgress, clues, hints } = caseData;
  const { actionPointsRemaining, cluesDiscoveredCount, hintsUsedCount } = playerProgress;
  const totalClues = clues?.length || 0;
  const availableHints = hints?.length || 0;

  const difficultyColors = {
    Easy: 'bg-emerald-950/60 text-emerald-400 border-emerald-600/50',
    Medium: 'bg-amber-950/60 text-amber-400 border-amber-600/50',
    Hard: 'bg-rose-950/60 text-rose-400 border-rose-600/50',
  }[difficulty] || 'bg-stone-900 text-stone-300 border-stone-700';

  const isLowAP = actionPointsRemaining <= 2;

  return (
    <div className="bg-noir-900 border border-stone-800 rounded-xl p-4 sm:p-6 shadow-xl mb-6 relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side: Title & Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${difficultyColors}`}>
              {difficulty} TIER
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded font-mono text-stone-400 bg-stone-950/80 border border-stone-800">
              ACTIVE CASE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-100 tracking-wide">
            {title}
          </h1>
        </div>

        {/* Right Side: Key Stats & CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Points Counter */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono transition-all ${
              isLowAP
                ? 'bg-rose-950/40 border-rose-600 text-rose-300 animate-pulse'
                : 'bg-stone-950/80 border-stone-700 text-amber-400'
            }`}
            title="Investigation Action Points remaining. 1 AP is spent per discovered clue."
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-stone-400 block uppercase leading-none">Action Points</span>
              <span className="text-base font-bold leading-tight">{actionPointsRemaining} AP</span>
            </div>
          </div>

          {/* Clues Discovered Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-950/80 border border-stone-800 font-mono text-stone-300">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <span className="text-[10px] text-stone-400 block uppercase leading-none">Clues Found</span>
              <span className="text-base font-bold leading-tight">{cluesDiscoveredCount} / {totalClues}</span>
            </div>
          </div>

          {/* Request Hint Button */}
          <button
            onClick={onOpenHintModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-300 transition-colors text-xs font-mono font-medium"
            title="Unlock contextual hint (-10 deduction score penalty)"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Hint ({hintsUsedCount}/{availableHints})</span>
          </button>

          {/* Submit Final Accusation CTA */}
          <button
            onClick={onOpenAccusationModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-serif font-bold text-sm tracking-wide shadow-crimson-glow transition-all hover:scale-105 active:scale-95"
          >
            <Target className="w-4 h-4" />
            <span>Make Accusation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
