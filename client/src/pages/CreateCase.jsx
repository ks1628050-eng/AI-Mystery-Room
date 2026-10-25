import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Dices, Shield, Zap, Search, ArrowRight, AlertCircle } from 'lucide-react';
import { createCase } from '../services/api';
import TypewriterLoader from '../components/TypewriterLoader';

const RANDOM_PREMISES = [
  "A priceless Renaissance sapphire vanishes from a subterranean vault guarded by laser sensors during a power outage.",
  "The reclusive owner of a vintage jazz club is poisoned in his private booth while the trumpet solo plays.",
  "A quantum encryption researcher is found dead in a sealed laboratory with only a cryptic line of binary code.",
  "An eccentric billionaire is found murdered in the conservatory of his snowbound Alpine chalet.",
  "A master art forger is eliminated in his studio minutes before testifying against an international syndicate.",
  "The lead soprano is found strangled backstage at the Royal Opera House during the standing ovation.",
];

const GENRES = [
  { id: 'Classic Noir', icon: '🕵️', label: 'Classic Noir' },
  { id: 'Locked-Room Mystery', icon: '🔐', label: 'Locked Room' },
  { id: 'High-Stakes Heist', icon: '💎', label: 'Art / Museum Heist' },
  { id: 'Victorian Gothic', icon: '🏰', label: 'Victorian Gothic' },
  { id: 'Cyber Intrigue', icon: '💾', label: 'Cyber Syndicate' },
];

const DIFFICULTY_TIERS = [
  {
    id: 'Easy',
    name: 'Easy',
    color: 'border-emerald-500/60 text-emerald-400 bg-emerald-950/30',
    suspects: 3,
    clues: 5,
    hints: 2,
    actionPoints: 12,
    basePoints: 100,
    desc: 'Ideal for novice detectives. Fewer suspects and generous action points.',
  },
  {
    id: 'Medium',
    name: 'Medium',
    color: 'border-amber-500/60 text-amber-400 bg-amber-950/30',
    suspects: 4,
    clues: 7,
    hints: 3,
    actionPoints: 10,
    basePoints: 150,
    desc: 'Standard detective challenge. Multiple conflicting alibis and intricate motives.',
  },
  {
    id: 'Hard',
    name: 'Hard',
    color: 'border-rose-500/60 text-rose-400 bg-rose-950/30',
    suspects: 5,
    clues: 9,
    hints: 3,
    actionPoints: 8,
    basePoints: 200,
    desc: 'Master sleuth difficulty. Tight action points, 5 suspects, and deceptive forensic trails.',
  },
];

export default function CreateCase() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [genre, setGenre] = useState('Classic Noir');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRandomize = () => {
    const random = RANDOM_PREMISES[Math.floor(Math.random() * RANDOM_PREMISES.length)];
    setPremise(random);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const newCase = await createCase({
        premise: premise.trim() || 'A mysterious midnight murder in a secluded estate library',
        difficulty,
        genre,
      });

      const caseId = newCase._id || newCase.id;
      navigate(`/case/${caseId}`);
    } catch (err) {
      setError(err.message || 'Failed to initialize mystery. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {isLoading && <TypewriterLoader message="Commissioning Case File with Google Gemini..." />}

      <div className="bg-noir-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-detective-amber block mb-1">
              • BUREAU DISPATCH ORDER •
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-100 tracking-wide">
              Initialize New Detective Case
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 font-mono mt-1">
              Select difficulty parameters, theme, and optional premise to procedurally generate a bespoke investigation.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Premise Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-stone-300 font-semibold">
                  1. Case Premise / Crime Scenario:
                </label>
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="flex items-center gap-1.5 text-xs font-mono text-detective-amber hover:text-amber-300 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Randomize Premise</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="Enter a custom mystery premise (e.g. 'A heist at the Royal Museum during a thunderstorm'). Or leave blank to randomize..."
                className="w-full bg-noir-950 border border-stone-700/80 rounded-xl p-4 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-detective-amber font-sans leading-relaxed shadow-inner"
              />
            </div>

            {/* 2. Genre Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-stone-300 font-semibold block">
                2. Mystery Style & Atmosphere:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {GENRES.map((g) => {
                  const isSelected = genre === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGenre(g.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-amber-950/50 border-detective-amber text-stone-100 shadow-noir-glow'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="text-lg mb-1">{g.icon}</div>
                      <div className="text-xs font-mono font-medium truncate">{g.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Difficulty Scaling Matrix */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-stone-300 font-semibold block">
                3. Difficulty Scaling Matrix:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DIFFICULTY_TIERS.map((tier) => {
                  const isSelected = difficulty === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setDifficulty(tier.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? `${tier.color} shadow-lg ring-1 ring-amber-500/50`
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif font-bold text-base text-stone-100">
                            {tier.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-stone-900 border border-stone-700 text-stone-300">
                            Base: {tier.basePoints} pts
                          </span>
                        </div>
                        <p className="text-xs text-stone-300/80 mb-3 font-sans">
                          {tier.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-stone-400 block">Suspects:</span>
                          <span className="text-stone-200 font-bold">{tier.suspects}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Clues:</span>
                          <span className="text-stone-200 font-bold">{tier.clues}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Hints:</span>
                          <span className="text-stone-200 font-bold">{tier.hints}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Action Points:</span>
                          <span className="text-amber-400 font-bold">{tier.actionPoints} AP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-detective-amber hover:bg-amber-400 text-noir-950 font-serif font-black text-sm uppercase tracking-wider shadow-noir-glow transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Initialize Case Investigation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
