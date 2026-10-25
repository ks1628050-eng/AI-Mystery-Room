import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, ShieldCheck, Target, FileText } from 'lucide-react';
import { useDetective } from '../context/DetectiveContext';
import { useNoirAudio } from '../context/AudioContext';

export default function AccusationModal({
  caseData,
  onClose,
  onSubmitAccusation,
  isSubmitting,
}) {
  const { detectiveName } = useDetective();
  const { playSfx } = useNoirAudio();
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [deductionNotes, setDeductionNotes] = useState('');
  const [isConfirmStep, setIsConfirmStep] = useState(false);

  const suspects = caseData.suspects || [];
  const selectedSuspect = suspects.find(
    (s) => s._id?.toString() === selectedSuspectId || s.id === selectedSuspectId
  );

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (!selectedSuspectId) return;
    setIsConfirmStep(true);
  };

  const handleFinalSubmit = () => {
    playSfx('gavel');
    onSubmitAccusation({
      suspectId: selectedSuspectId,
      deductionNotes: deductionNotes.trim(),
      detectiveName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-noir-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-noir-900 border border-stone-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-noir-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚖️</span>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-stone-100">
                Official Formal Accusation
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Case: {caseData.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {!isConfirmStep ? (
            <form onSubmit={handleProceedToConfirm} className="space-y-5">
              {/* Suspect Selection Grid */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-2 font-semibold">
                  1. Select the Prime Culprit:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suspects.map((s) => {
                    const id = s._id?.toString() || s.id;
                    const isSelected = selectedSuspectId === id;
                    return (
                      <div
                        key={id}
                        onClick={() => setSelectedSuspectId(id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-500 text-stone-100 shadow-crimson-glow'
                            : 'bg-noir-950 border-stone-800 hover:border-stone-700 text-stone-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-lg shrink-0">
                          👤
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-serif font-bold text-sm truncate">
                            {s.name}
                          </h4>
                          <span className="text-[11px] text-stone-400 font-mono block truncate">
                            {s.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deduction Notes */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5 font-semibold">
                  2. Summary of Deductive Reasoning (Optional):
                </label>
                <textarea
                  rows={3}
                  value={deductionNotes}
                  onChange={(e) => setDeductionNotes(e.target.value)}
                  placeholder="Explain why their alibi broke down and which key clues exposed them..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-detective-amber font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSuspectId}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  Review Accusation →
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Warning Step */
            <div className="space-y-5">
              <div className="p-4 bg-rose-950/40 border border-rose-600/60 rounded-xl flex items-start gap-3 text-rose-200">
                <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block font-mono text-rose-400 mb-1">
                    WARNING: Accusations Are Final & Irreversible!
                  </span>
                  Once submitted, the case file will close immediately. The court will render its verdict, score your deduction, and reveal the true story.
                </div>
              </div>

              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-stone-500 block mb-1">
                  Accused Individual:
                </span>
                <h4 className="text-lg font-serif font-bold text-rose-400">
                  {selectedSuspect?.name}
                </h4>
                <p className="text-xs text-stone-400 font-mono mt-0.5">
                  {selectedSuspect?.role}
                </p>
                {deductionNotes && (
                  <div className="mt-3 pt-3 border-t border-stone-800 text-xs text-stone-300 font-mono italic">
                    "{deductionNotes}"
                  </div>
                )}
              </div>

              {/* Final Confirm Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmStep(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-stone-400 hover:text-stone-200"
                >
                  ← Go Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-crimson-glow transition-all flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  <span>{isSubmitting ? 'Deliberating...' : 'Confirm & Close Case'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
