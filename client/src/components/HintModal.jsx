import React from 'react';
import { motion } from 'framer-motion';
import { X, Lightbulb, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';

export default function HintModal({ caseData, onClose, onUnlockNextHint, isUnlocking }) {
  const hints = caseData.hints || [];
  const unlockedHints = hints.filter((h) => h.unlocked);
  const hasMoreHints = unlockedHints.length < hints.length;

  return (
    <div className="fixed inset-0 z-50 bg-noir-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-noir-900 border border-stone-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-noir-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-detective-amber" />
            <h3 className="text-lg font-serif font-bold text-stone-100">
              Detective Intelligence Hints
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-stone-300 font-sans leading-relaxed">
            Need guidance? Hints point you toward contradictory alibis and crucial clues, but each hint used deducts <span className="text-rose-400 font-bold font-mono">10 points</span> from your final deduction score.
          </div>

          {/* List of currently unlocked hints */}
          <div className="space-y-3">
            {unlockedHints.length === 0 ? (
              <div className="p-4 bg-stone-950 border border-stone-800/80 rounded-xl text-center text-xs font-mono text-stone-500">
                No hints requested yet. Trust your instincts, Detective!
              </div>
            ) : (
              unlockedHints.map((hint, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 font-mono leading-relaxed flex items-start gap-2.5"
                >
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-400 mb-1">
                      Hint #{idx + 1} Revealed:
                    </span>
                    <p>{hint.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Unlock Next Action */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-stone-400">
              Available: {unlockedHints.length} / {hints.length}
            </span>

            {hasMoreHints ? (
              <button
                onClick={onUnlockNextHint}
                disabled={isUnlocking}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-noir-950 font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>{isUnlocking ? 'Deciphering...' : 'Unlock Next Hint (-10 Pts)'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs font-mono text-stone-500">
                All hints unlocked
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
