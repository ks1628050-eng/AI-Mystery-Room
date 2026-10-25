import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Compass, AlertCircle } from 'lucide-react';

const DETECTIVE_TIPS = [
  "Tip #1: In a locked-room case, the killer's greatest weapon is always a fabricated alibi.",
  "Tip #2: Beware the suspect who volunteers too much detail; innocence rarely memorizes every second.",
  "Tip #3: Cross-reference physical traces like mud, fibers, and grease with suspects' apparel.",
  "Tip #4: Every unlocked clue tightens the net, but spend your Action Points with surgical caution.",
  "Tip #5: Consult the Evidence Board often; pinning red yarn reveals connections invisible in the dark.",
  "Tip #6: Requesting hints incurs a -10 point penalty on your final deduction score.",
];

export default function TypewriterLoader({ message = "Generating Case Dossier with Gemini AI..." }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTip = DETECTIVE_TIPS[tipIndex];
    let timeout;

    if (!isDeleting && displayedText.length < currentTip.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentTip.substring(0, displayedText.length + 1));
      }, 35);
    } else if (!isDeleting && displayedText.length === currentTip.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 3000);
    } else if (isDeleting && displayedText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(currentTip.substring(0, displayedText.length - 1));
      }, 15);
    } else if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false);
      setTipIndex((prev) => (prev + 1) % DETECTIVE_TIPS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, tipIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-noir-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-noir-900 border border-stone-700/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Top Stamp */}
        <div className="absolute top-3 right-4 font-mono text-[10px] tracking-widest text-amber-500/70 uppercase border border-amber-500/30 px-2 py-0.5 rounded">
          CLASSIFIED • DOSSIER DISPATCH
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-stone-800 border border-amber-500/40 flex items-center justify-center shadow-noir-glow">
              <Search className="w-8 h-8 text-detective-amber animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
              !
            </div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 tracking-wide mb-2">
          {message}
        </h3>
        <p className="text-xs text-stone-400 font-mono mb-6">
          Synthesizing suspects, forensic clues, locked alibis, and logical solution...
        </p>

        {/* Typewriter Terminal Box */}
        <div className="bg-noir-950 border border-stone-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-left min-h-[85px] flex items-center text-amber-300/90 shadow-inner">
          <span className="typewriter-cursor">
            {displayedText}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-stone-400 font-mono">
          <Compass className="w-3.5 h-3.5 text-detective-amber animate-pulse" />
          <span>Formulating airtight deduction tree via Google Gemini structured JSON</span>
        </div>
      </motion.div>
    </div>
  );
}
