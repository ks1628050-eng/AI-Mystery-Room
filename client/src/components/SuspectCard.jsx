import React from 'react';
import { MessageSquareText, Shield, FileText, User } from 'lucide-react';

const SUSPECT_ICONS = ['👤', '🕵️‍♂️', '👠', '🎩', '💼', '🍷', '🎭'];

export default function SuspectCard({ suspect, index, onInterrogate }) {
  const icon = SUSPECT_ICONS[index % SUSPECT_ICONS.length];

  return (
    <div className="bg-noir-900 border border-stone-800 rounded-xl p-5 shadow-lg hover:border-stone-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Avatar & Name */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-lg bg-stone-950 border border-stone-700/80 flex items-center justify-center text-2xl shadow-inner group-hover:border-amber-500/60 transition-colors shrink-0">
            {icon}
          </div>
          <div className="overflow-hidden">
            <span className="font-mono text-[10px] text-amber-500/80 uppercase tracking-wider block">
              SUSPECT #{index + 1}
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-100 truncate group-hover:text-amber-400 transition-colors">
              {suspect.name}
            </h3>
            <span className="text-xs text-stone-400 font-mono italic block truncate">
              {suspect.role}
            </span>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-3.5 bg-stone-950/60 border border-stone-900 rounded-lg p-3 text-xs text-stone-300 leading-relaxed">
          <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px] mb-1">
            <User className="w-3 h-3 text-stone-400" />
            <span className="uppercase tracking-wider">Background Dossier</span>
          </div>
          <p className="line-clamp-3">{suspect.bio}</p>
        </div>

        {/* Alibi Section */}
        <div className="mb-4 bg-stone-950/60 border border-stone-900 rounded-lg p-3 text-xs text-stone-300 leading-relaxed">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] mb-1">
            <FileText className="w-3 h-3 text-amber-400" />
            <span className="uppercase tracking-wider">Stated Alibi</span>
          </div>
          <p className="italic text-stone-300/90 font-serif">"{suspect.alibi}"</p>
        </div>
      </div>

      {/* Interrogation CTA */}
      <button
        onClick={() => onInterrogate(suspect)}
        className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 hover:text-amber-300 transition-all text-xs font-mono font-semibold group-hover:border-amber-500/50 shadow-sm"
      >
        <MessageSquareText className="w-4 h-4 text-detective-amber" />
        <span>Interrogate Suspect</span>
      </button>
    </div>
  );
}
