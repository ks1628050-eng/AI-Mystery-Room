import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pin, Plus, Trash2, Link as LinkIcon, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function EvidenceBoard({ suspects = [], clues = [] }) {
  // Pinned items state (suspects, clues, and user sticky notes)
  const [boardItems, setBoardItems] = useState([]);
  // Connections between item IDs: [{ fromId, toId, color: '#ef4444' }]
  const [connections, setConnections] = useState([]);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [stickyText, setStickyText] = useState('');
  const [isAddingSticky, setIsAddingSticky] = useState(false);
  const boardRef = useRef(null);

  // Initialize board items when suspects and clues change
  useEffect(() => {
    const items = [];

    // Place suspects along the top/left area
    suspects.forEach((suspect, idx) => {
      const id = suspect._id?.toString() || suspect.id || `suspect_${idx}`;
      items.push({
        id,
        type: 'suspect',
        title: suspect.name,
        subtitle: suspect.role,
        data: suspect,
        x: 40 + (idx % 3) * 220,
        y: 30 + Math.floor(idx / 3) * 210,
        rotation: (idx % 2 === 0 ? -1.5 : 1.5) * ((idx + 1) * 0.7),
      });
    });

    // Place uncovered clues along the bottom/right area
    const discoveredClues = clues.filter((c) => c.discovered);
    discoveredClues.forEach((clue, idx) => {
      const id = clue._id?.toString() || clue.id || `clue_${idx}`;
      items.push({
        id,
        type: 'clue',
        title: clue.title,
        subtitle: clue.locationFound || 'Crime Scene Evidence',
        data: clue,
        x: 40 + (idx % 3) * 220,
        y: 260 + Math.floor(idx / 3) * 190,
        rotation: (idx % 2 === 0 ? 2 : -2) * ((idx + 1) * 0.6),
      });
    });

    setBoardItems((prev) => {
      // Preserve existing positions if already initialized
      if (prev.length === 0) return items;
      const map = new Map(prev.map((i) => [i.id, i]));
      return items.map((newItem) => {
        const existing = map.get(newItem.id);
        return existing ? { ...newItem, x: existing.x, y: existing.y, rotation: existing.rotation } : newItem;
      });
    });
  }, [suspects, clues]);

  // Handle pin click for red yarn connection
  const handlePinClick = (itemId) => {
    if (!selectedPinId) {
      // First node selected
      setSelectedPinId(itemId);
    } else if (selectedPinId === itemId) {
      // Deselect if clicking the same node
      setSelectedPinId(null);
    } else {
      // Connect or disconnect the pair
      const from = selectedPinId;
      const to = itemId;

      setConnections((prev) => {
        const existingIndex = prev.findIndex(
          (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from)
        );
        if (existingIndex >= 0) {
          // Remove existing string
          return prev.filter((_, i) => i !== existingIndex);
        } else {
          // Add vibrant red yarn string
          return [...prev, { from, to, color: '#e11d48' }];
        }
      });

      setSelectedPinId(null);
    }
  };

  const handleAddStickyNote = (e) => {
    e.preventDefault();
    if (!stickyText.trim()) return;

    const newSticky = {
      id: 'sticky_' + Date.now(),
      type: 'note',
      title: 'Detective Hypothesis',
      subtitle: stickyText.trim(),
      x: 520 + Math.random() * 80,
      y: 80 + Math.random() * 120,
      rotation: (Math.random() * 8 - 4),
    };

    setBoardItems((prev) => [...prev, newSticky]);
    setStickyText('');
    setIsAddingSticky(false);
  };

  const handleClearStrings = () => {
    setConnections([]);
    setSelectedPinId(null);
  };

  const discoveredCluesCount = clues.filter((c) => c.discovered).length;

  return (
    <div className="bg-noir-900 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
      {/* Evidence Board Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📌</span>
            <h3 className="text-xl font-serif font-black text-stone-100 tracking-wide">
              Investigation Evidence Corkboard
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-mono mt-0.5">
            Pin clues, link suspects with red yarn strings, and formulate deductive hypotheses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Sticky Note Button */}
          <button
            onClick={() => setIsAddingSticky(!isAddingSticky)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Sticky Note</span>
          </button>

          {/* Reset Red Strings */}
          {connections.length > 0 && (
            <button
              onClick={handleClearStrings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:text-rose-400 text-xs font-mono transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Yarn ({connections.length})</span>
            </button>
          )}

          {/* Connection Status Helper */}
          {selectedPinId && (
            <div className="text-xs font-mono px-3 py-1 bg-rose-950/80 border border-rose-600/60 text-rose-300 rounded-full animate-pulse flex items-center gap-1">
              <LinkIcon className="w-3 h-3" />
              <span>Click a second pin to tie red yarn</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Note Creator Modal / Dropdown */}
      {isAddingSticky && (
        <form onSubmit={handleAddStickyNote} className="mb-4 p-4 bg-stone-950 border border-stone-800 rounded-xl flex gap-2">
          <input
            type="text"
            placeholder="Type your hypothesis or deduction (e.g. 'Vincent's muddy shoes match Pier 42 footprint')..."
            value={stickyText}
            onChange={(e) => setStickyText(e.target.value)}
            className="flex-1 bg-stone-900 border border-stone-700 text-xs px-3 py-2 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-noir-950 font-bold text-xs rounded-lg font-mono"
          >
            Pin Note
          </button>
        </form>
      )}

      {/* Corkboard Container */}
      <div
        ref={boardRef}
        className="corkboard-pattern rounded-xl border-8 border-detective-corkDark shadow-cork-inner relative min-h-[520px] overflow-x-auto overflow-y-hidden select-none"
        style={{ minWidth: '780px' }}
      >
        {/* Subtle Vignette & Frame Shadow */}
        <div className="absolute inset-0 bg-vignette pointer-events-none" />

        {/* SVG Overlay for Connecting Red Strings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ minWidth: '780px' }}>
          {connections.map((conn, idx) => {
            const fromItem = boardItems.find((i) => i.id === conn.from);
            const toItem = boardItems.find((i) => i.id === conn.to);
            if (!fromItem || !toItem) return null;

            // Compute pin centers
            const x1 = fromItem.x + 95;
            const y1 = fromItem.y + 12;
            const x2 = toItem.x + 95;
            const y2 = toItem.y + 12;

            // Slight natural string droop (catenary curve approximation)
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + 18;

            return (
              <g key={idx}>
                {/* Yarn shadow */}
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY + 2} ${x2} ${y2}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth="3.5"
                />
                {/* Vibrant red yarn */}
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  className="red-yarn-line"
                />
              </g>
            );
          })}
        </svg>

        {/* Pinned Items (Suspects, Clues, Sticky Notes) */}
        <div className="relative p-6 min-h-[500px]" style={{ minWidth: '760px' }}>
          {boardItems.map((item) => {
            const isSelected = selectedPinId === item.id;
            const isSuspect = item.type === 'suspect';
            const isClue = item.type === 'clue';
            const isNote = item.type === 'note';

            return (
              <motion.div
                key={item.id}
                drag
                dragConstraints={boardRef}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  rotate: `${item.rotation}deg`,
                }}
                className={`w-[190px] rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-xl z-20 transition-all ${
                  isSuspect
                    ? 'bg-stone-100 text-stone-900 border-2 border-stone-300'
                    : isClue
                    ? 'bg-amber-100 text-stone-900 border-2 border-amber-300'
                    : 'bg-yellow-200 text-stone-900 border border-yellow-400 font-mono text-xs'
                }`}
              >
                {/* Push Pin */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(item.id);
                  }}
                  title={isSelected ? 'Selected pin' : 'Click pin to link with red yarn'}
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-30 shadow-md ${
                    isSelected
                      ? 'bg-rose-600 ring-4 ring-rose-400 animate-ping'
                      : isSuspect
                      ? 'bg-rose-700'
                      : isClue
                      ? 'bg-amber-600'
                      : 'bg-stone-800'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white/80 shadow-inner" />
                </div>

                {/* Content according to item type */}
                {isSuspect && (
                  <div>
                    <div className="w-full h-24 bg-stone-900 rounded mb-2 flex items-center justify-center text-3xl shadow-inner border border-stone-300">
                      👤
                    </div>
                    <div className="text-[10px] font-mono uppercase text-rose-800 font-bold tracking-wider">
                      SUSPECT FILE
                    </div>
                    <h5 className="font-serif font-black text-sm text-stone-950 leading-tight">
                      {item.title}
                    </h5>
                    <p className="text-[11px] font-sans text-stone-700 font-medium truncate">
                      {item.subtitle}
                    </p>
                  </div>
                )}

                {isClue && (
                  <div>
                    <div className="text-[10px] font-mono uppercase text-amber-900 font-bold tracking-wider mb-1 flex items-center gap-1">
                      <span>🔍</span> FORENSIC PROOF
                    </div>
                    <h5 className="font-serif font-bold text-xs text-stone-950 leading-tight mb-1">
                      {item.title}
                    </h5>
                    <p className="text-[11px] font-sans text-stone-800 line-clamp-3 leading-snug">
                      {item.data?.description}
                    </p>
                  </div>
                )}

                {isNote && (
                  <div>
                    <div className="text-[10px] font-mono uppercase text-yellow-800 font-bold tracking-wider mb-1">
                      📝 DETECTIVE NOTE
                    </div>
                    <p className="text-xs text-stone-900 font-mono leading-tight">
                      {item.subtitle}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-stone-400 font-mono">
        <div>
          <span>Pinned Evidence: {discoveredCluesCount} of {clues.length}</span> • 
          <span className="ml-2">Active Yarn Connections: {connections.length}</span>
        </div>
        <div className="text-[11px] text-amber-400/90 italic">
          💡 Drag cards freely. Click any push pin to connect or disconnect suspects with evidence!
        </div>
      </div>
    </div>
  );
}
