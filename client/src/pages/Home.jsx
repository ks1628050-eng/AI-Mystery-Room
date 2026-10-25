import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, PlusCircle, Award, ShieldAlert, Zap, BookOpen, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDetective } from '../context/DetectiveContext';
import { fetchRecentCases } from '../services/api';

export default function Home() {
  const { detectiveName, currentRank, careerStats } = useDetective();
  const [recentCases, setRecentCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    fetchRecentCases()
      .then((cases) => setRecentCases(cases))
      .catch((err) => console.warn('Could not load recent cases:', err))
      .finally(() => setLoadingCases(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-noir-900 border border-stone-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/80 border border-amber-500/30 text-amber-400 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Procedural Noir Detective Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-black text-stone-100 tracking-tight leading-none">
            Step Into the <span className="text-detective-amber italic">Shadows</span> of Deduction.
          </h1>

          <p className="text-base sm:text-lg text-stone-300 font-sans leading-relaxed">
            Welcome to <strong className="text-stone-100 font-serif">AI Mystery Room</strong>. Every case is uniquely generated in real-time by Google Gemini—featuring airtight locked-room puzzles, dynamic suspect interrogations, interactive evidence corkboards, and high-stakes deduction scoring.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/create"
              className="px-7 py-3.5 rounded-xl bg-detective-amber hover:bg-amber-400 text-noir-950 font-serif font-black text-base tracking-wide shadow-noir-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Open New Case File</span>
            </Link>

            <Link
              to="/archive"
              className="px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white font-mono text-sm transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 opacity-75" />
              <span>Browse Case Archives</span>
            </Link>
          </div>
        </div>

        {/* Career Dossier Card */}
        <div className="mt-8 lg:mt-0 lg:absolute lg:top-12 lg:right-12 w-full lg:w-72 bg-noir-950/90 border border-stone-800 rounded-2xl p-5 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
            <span className="text-stone-400 uppercase tracking-wider text-[10px]">
              Detective Dossier
            </span>
            <span className="text-emerald-400 text-[10px]">VERIFIED AGENT</span>
          </div>
          <div className="space-y-2 text-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-400">Agent:</span>
              <span className="font-bold text-stone-100">{detectiveName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Bureau Rank:</span>
              <span className={`font-bold ${currentRank.badgeColor.split(' ')[0]}`}>
                {currentRank.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Cases Solved:</span>
              <span className="text-emerald-400 font-bold">{careerStats.casesSolved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">High Score:</span>
              <span className="text-amber-400 font-bold">{careerStats.bestScore} pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detective Agency Protocols / Rules Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-black text-stone-100 tracking-wide">
              Standard Investigation Protocols
            </h2>
            <p className="text-xs text-stone-400 font-mono mt-1">
              Rules of engagement for solving cases in the AI Mystery Room.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-noir-900 border border-stone-800 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
              ⚡
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-100">
              1. Spend Action Points Wisely
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Every case grants a limited allowance of Action Points (Easy: 12, Medium: 10, Hard: 8). Every physical clue you uncover costs 1 AP. Choose what to investigate strategically.
            </p>
          </div>

          <div className="bg-noir-900 border border-stone-800 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400">
              💬
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-100">
              2. Interrogate Suspects via AI
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Question suspects directly in real-time. Powered by Google Gemini persona-chaining, suspects defend their alibis, deflect suspicion, and react dynamically to your pressure.
            </p>
          </div>

          <div className="bg-noir-900 border border-stone-800 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-xl text-rose-400">
              📌
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-100">
              3. Connect the Evidence Board
            </h3>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              Use our interactive tactile corkboard to tie suspects to clues with red yarn strings, pin custom detective notes, and visually expose the single flaw in the culprit’s alibi.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Open Case Files Feed */}
      <section className="bg-noir-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📂</span>
            <h3 className="text-xl font-serif font-bold text-stone-100">
              Recent Case Dossiers
            </h3>
          </div>
          <Link
            to="/archive"
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Archives</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingCases ? (
          <div className="p-8 text-center text-xs font-mono text-stone-500">
            Scanning police archives...
          </div>
        ) : recentCases.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-stone-500 bg-stone-950/50 rounded-xl border border-stone-800/80">
            No previous cases on record. You are the lead investigator on our inaugural file!
          </div>
        ) : (
          <div className="divide-y divide-stone-800/60">
            {recentCases.slice(0, 5).map((c) => (
              <Link
                key={c._id}
                to={`/case/${c._id}`}
                className="py-3.5 flex items-center justify-between group hover:bg-stone-950/60 px-3 rounded-lg transition-colors"
              >
                <div>
                  <h4 className="text-sm font-serif font-bold text-stone-200 group-hover:text-amber-400 transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs text-stone-400 font-mono truncate max-w-xl">
                    {c.premise}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase border border-stone-700 text-stone-400">
                    {c.difficulty}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                      c.playerProgress?.status === 'SOLVED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                        : c.playerProgress?.status === 'FAILED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-700/50'
                        : 'bg-amber-950 text-amber-400 border border-amber-700/50'
                    }`}
                  >
                    {c.playerProgress?.status || 'IN_PROGRESS'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
