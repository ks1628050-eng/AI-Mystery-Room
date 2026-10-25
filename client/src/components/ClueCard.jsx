import React from 'react';
import { Lock, Unlock, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import { useNoirAudio } from '../context/AudioContext';

export default function ClueCard({ clue, index, onDiscover, actionPointsRemaining }) {
  const { playSfx } = useNoirAudio();

  const handleDiscover = () => {
    playSfx('clue');
    onDiscover(clue._id || clue.id);
  };

  const isDiscovered = clue.discovered;
  const canAfford = actionPointsRemaining > 0;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ${
        isDiscovered
          ? 'bg-noir-900 border-amber-600/40 shadow-lg shadow-amber-950/20'
          : 'bg-noir-950/90 border-stone-800/80 hover:border-stone-700'
      }`}
    >
      <div>
        {/* Header: Status & Index */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
            CLUE #{index + 1}
          </span>
          {isDiscovered ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-600/40 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" />
              <span>UNCOVERED (+5 PTS)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>SEALED</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-base font-serif font-bold text-stone-100 mb-2">
          {isDiscovered ? clue.title : `Unexamined Physical Trace #${index + 1}`}
        </h4>

        {/* Location Tag */}
        <div className="flex items-center gap-1.5 text-xs text-amber-500/90 font-mono mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Location: {clue.locationFound || 'Crime Scene'}</span>
        </div>

        {/* Description or Obfuscated preview */}
        <div className="text-xs text-stone-300 leading-relaxed font-sans min-h-[60px]">
          {isDiscovered ? (
            <p className="bg-stone-950/80 border border-stone-900 rounded p-3 text-stone-200">
              {clue.description}
            </p>
          ) : (
            <div className="bg-stone-950/40 border border-dashed border-stone-800 rounded p-3 text-stone-400 italic font-mono flex items-center justify-center text-center">
              Forensic evidence sealed in evidence bag. Spend 1 Action Point to examine.
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {!isDiscovered && (
        <button
          onClick={handleDiscover}
          disabled={!canAfford}
          className={`w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-mono text-xs font-semibold transition-all ${
            canAfford
              ? 'bg-stone-800 hover:bg-amber-600 hover:text-noir-950 text-stone-200 border border-stone-700 shadow-sm cursor-pointer'
              : 'bg-stone-900/50 text-stone-400 border border-stone-800 cursor-not-allowed opacity-60'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-400 group-hover:text-noir-950" />
          <span>{canAfford ? 'Examine Clue (Cost: 1 AP)' : 'Insufficient AP'}</span>
        </button>
      )}
    </div>
  );
}
