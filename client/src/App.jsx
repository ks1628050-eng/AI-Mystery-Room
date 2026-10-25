import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateCase from './pages/CreateCase';
import InvestigationRoom from './pages/InvestigationRoom';
import Results from './pages/Results';
import Archive from './pages/Archive';
import Leaderboard from './pages/Leaderboard';
import { DetectiveProvider } from './context/DetectiveContext';
import { AudioProvider } from './context/AudioContext';

export default function App() {
  return (
    <AudioProvider>
      <DetectiveProvider>
        <Router>
          <div className="min-h-screen bg-noir-950 text-stone-200 flex flex-col relative">
            {/* Subtle atmospheric scanlines */}
            <div className="noir-scanlines fixed inset-0 z-30 pointer-events-none opacity-20" />

            {/* Navigation Bar */}
            <Navbar />

            {/* Main Page Content */}
            <main className="flex-1 relative z-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateCase />} />
                <Route path="/case/:id" element={<InvestigationRoom />} />
                <Route path="/case/:id/result" element={<Results />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-800/80 bg-noir-950/90 py-6 text-center text-xs font-mono text-stone-500 relative z-20">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>AI Mystery Room • Powered by Google Gemini & Structured JSON</span>
                <span className="text-[11px] text-stone-600">
                  Tactile Corkboard UI • Prompt-Chained AI Interrogation • Anti-Cheat Architecture
                </span>
              </div>
            </footer>
          </div>
        </Router>
      </DetectiveProvider>
    </AudioProvider>
  );
}
