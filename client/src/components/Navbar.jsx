import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShieldAlert, Award, Archive, Volume2, VolumeX, PlusCircle, UserCheck } from 'lucide-react';
import { useDetective } from '../context/DetectiveContext';
import { useNoirAudio } from '../context/AudioContext';

export default function Navbar() {
  const location = useLocation();
  const { detectiveName, setDetectiveName, currentRank } = useDetective();
  const { isPlaying, toggleAmbience } = useNoirAudio();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(detectiveName);

  const handleNameSave = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setDetectiveName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const navLinks = [
    { to: '/', label: 'Briefing', icon: Search },
    { to: '/create', label: 'New Case File', icon: PlusCircle },
    { to: '/archive', label: 'Cold Cases', icon: Archive },
    { to: '/leaderboard', label: 'Hall of Fame', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 bg-noir-950/85 backdrop-blur-md border-b border-stone-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-700/80 flex items-center justify-center shadow-inner group-hover:border-detective-amber transition-colors">
              <span className="text-xl">🕵️</span>
            </div>
            <div>
              <span className="font-serif font-black tracking-wider text-xl text-stone-100 group-hover:text-detective-amber transition-colors block leading-tight">
                AI MYSTERY ROOM
              </span>
              <span className="text-[10px] tracking-widest text-stone-400 uppercase font-mono">
                Noir Bureau of Deduction
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-stone-900 text-detective-amber border border-detective-amber/40 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar: Audio Toggle + Detective Persona Badge */}
          <div className="flex items-center gap-3">
            {/* Ambient Noir Audio Toggle */}
            <button
              onClick={toggleAmbience}
              title={isPlaying ? 'Mute Noir Ambience & Rain' : 'Play Atmospheric Noir Ambience'}
              className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                isPlaying
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 shadow-noir-glow'
                  : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {isPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-detective-amber animate-pulse" />
                  <span className="hidden sm:inline font-mono text-[11px]">Rain & Ambient On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-[11px]">Ambience Muted</span>
                </>
              )}
            </button>

            {/* Detective Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
              {isEditingName ? (
                <form onSubmit={handleNameSave} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-stone-900 border border-stone-700 text-xs px-2 py-1 rounded text-stone-200 focus:outline-none focus:border-detective-amber w-32"
                    autoFocus
                    onBlur={handleNameSave}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  title="Click to change Detective Call-sign"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-xs">
                    🔍
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold text-stone-200 truncate max-w-[110px]">
                      {detectiveName}
                    </div>
                    <div className={`text-[10px] font-mono leading-none ${currentRank.badgeColor.split(' ')[0]}`}>
                      {currentRank.title}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
