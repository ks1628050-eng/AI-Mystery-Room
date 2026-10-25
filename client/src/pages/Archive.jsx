import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Archive as ArchiveIcon, Filter, ChevronRight, PlusCircle } from 'lucide-react';
import { fetchRecentCases } from '../services/api';

export default function Archive() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  useEffect(() => {
    fetchRecentCases()
      .then((data) => setCases(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.premise?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'ALL' || c.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗄️</span>
            <h1 className="text-3xl font-serif font-black text-stone-100 tracking-wide">
              Cold Case Dossiers & Police Archives
            </h1>
          </div>
          <p className="text-xs text-stone-400 font-mono mt-1">
            Access previous investigation logs, active files, and verified verdicts.
          </p>
        </div>

        <Link
          to="/create"
          className="px-5 py-2.5 rounded-xl bg-detective-amber hover:bg-amber-400 text-noir-950 font-serif font-bold text-xs uppercase tracking-wider shadow-noir-glow flex items-center gap-2 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Case</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-noir-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search by case title or scenario keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-detective-amber font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                difficultyFilter === diff
                  ? 'bg-amber-500 text-noir-950 font-bold'
                  : 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-stone-500">
          Retrieving classified files from database...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-noir-900 border border-stone-800 rounded-2xl space-y-3">
          <p className="font-mono text-xs text-stone-400">
            No case files matching your search filter.
          </p>
          <Link
            to="/create"
            className="inline-block px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono"
          >
            Create Your First Case
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => {
            const isSolved = c.playerProgress?.status === 'SOLVED';
            const isFailed = c.playerProgress?.status === 'FAILED';

            return (
              <Link
                key={c._id}
                to={`/case/${c._id}`}
                className="bg-noir-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-lg hover:scale-[1.01] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-700 text-stone-400 uppercase">
                      {c.difficulty}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        isSolved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                          : isFailed
                          ? 'bg-rose-950 text-rose-400 border border-rose-600/40'
                          : 'bg-amber-950 text-amber-400 border border-amber-600/40'
                      }`}
                    >
                      {c.playerProgress?.status || 'IN_PROGRESS'}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-100 group-hover:text-amber-400 transition-colors mb-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed font-sans mb-4">
                    {c.premise}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-400">
                  <span>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active File'}
                  </span>
                  <span className="text-detective-amber group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                    Inspect File <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
