import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, Search, Pin, AlertCircle, Sparkles, Target, Compass, Lock } from 'lucide-react';
import { fetchCaseById, discoverClue, unlockHint, submitAccusation } from '../services/api';
import CaseHeader from '../components/CaseHeader';
import SuspectCard from '../components/SuspectCard';
import ClueCard from '../components/ClueCard';
import EvidenceBoard from '../components/EvidenceBoard';
import InterrogationModal from '../components/InterrogationModal';
import AccusationModal from '../components/AccusationModal';
import HintModal from '../components/HintModal';
import { useDetective } from '../context/DetectiveContext';

export default function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordCaseResult } = useDetective();

  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier', 'board', 'clues'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [activeSuspectToInterrogate, setActiveSuspectToInterrogate] = useState(null);
  const [showAccusationModal, setShowAccusationModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [isSubmittingAccusation, setIsSubmittingAccusation] = useState(false);
  const [isUnlockingHint, setIsUnlockingHint] = useState(false);

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    try {
      setLoading(true);
      const data = await fetchCaseById(id);
      setCaseData(data);
      // If already solved or failed, redirect to result screen
      if (data.playerProgress?.status === 'SOLVED' || data.playerProgress?.status === 'FAILED') {
        navigate(`/case/${id}/result`);
      }
    } catch (err) {
      setError(err.message || 'Failed to load case investigation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverClue = async (clueId) => {
    try {
      const res = await discoverClue(id, clueId);
      if (res.data) {
        setCaseData(res.data);
      }
    } catch (err) {
      alert(err.message || 'Could not uncover clue');
    }
  };

  const handleUnlockHint = async () => {
    try {
      setIsUnlockingHint(true);
      const res = await unlockHint(id);
      if (res.data) {
        setCaseData(res.data);
      }
    } catch (err) {
      alert(err.message || 'Could not unlock hint');
    } finally {
      setIsUnlockingHint(false);
    }
  };

  const handleAccusationSubmit = async (accusationPayload) => {
    try {
      setIsSubmittingAccusation(true);
      const res = await submitAccusation(id, accusationPayload);
      if (res.success) {
        recordCaseResult({
          isCorrect: res.isCorrect,
          score: res.scoreBreakdown?.finalScore || 0,
        });
        navigate(`/case/${id}/result`, { state: { verdictData: res } });
      }
    } catch (err) {
      alert(err.message || 'Accusation failed');
      setIsSubmittingAccusation(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-stone-400">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p>Retrieving classified crime dossier #{id?.substring(0, 8)}...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-6 bg-rose-950/40 border border-rose-600/60 rounded-2xl text-rose-300 font-mono text-sm">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p>{error || 'Case file not found.'}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs uppercase"
        >
          Return to Headquarters
        </button>
      </div>
    );
  }

  const discoveredCluesCount = (caseData.clues || []).filter((c) => c.discovered).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header with Action Points & Quick CTAs */}
      <CaseHeader
        caseData={caseData}
        onOpenHintModal={() => setShowHintModal(true)}
        onOpenAccusationModal={() => setShowAccusationModal(true)}
      />

      {/* Navigation Tabs (Mobile & Desktop) */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
            activeTab === 'dossier'
              ? 'bg-stone-900 text-detective-amber border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Case File & Suspects ({caseData.suspects?.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
            activeTab === 'board'
              ? 'bg-stone-900 text-detective-amber border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Pin className="w-4 h-4 text-rose-500" />
          <span>Evidence Corkboard (Interactive)</span>
        </button>

        <button
          onClick={() => setActiveTab('clues')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
            activeTab === 'clues'
              ? 'bg-stone-900 text-detective-amber border border-amber-500/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Physical Clues ({discoveredCluesCount}/{caseData.clues?.length})</span>
        </button>
      </div>

      {/* Tab 1: Case Dossier & Suspects */}
      {activeTab === 'dossier' && (
        <div className="space-y-8">
          {/* Crime Scene Overview Story */}
          <div className="bg-noir-900 border border-stone-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-stone-400 font-mono text-xs uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4 text-detective-amber" />
              <span>Crime Scene Narrative • First-Hand Dispatch</span>
            </div>
            <p className="font-serif text-sm sm:text-base text-stone-200 leading-relaxed whitespace-pre-line">
              {caseData.crimeSceneStory}
            </p>
          </div>

          {/* Suspects Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-serif font-black text-stone-100 tracking-wide">
                  Persons of Interest & Suspects
                </h3>
                <p className="text-xs text-stone-400 font-mono">
                  Inspect their biographies and question each suspect individually to spot holes in their timeline.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {caseData.suspects?.map((suspect, idx) => (
                <SuspectCard
                  key={suspect._id || suspect.id || idx}
                  suspect={suspect}
                  index={idx}
                  onInterrogate={(s) => setActiveSuspectToInterrogate(s)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Evidence Corkboard */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          <EvidenceBoard
            suspects={caseData.suspects || []}
            clues={caseData.clues || []}
          />
        </div>
      )}

      {/* Tab 3: Physical Clues Grid */}
      {activeTab === 'clues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-black text-stone-100 tracking-wide">
                Physical Traces & Forensic Evidence
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Spend Action Points (1 AP per clue) to examine sealed evidence bags and reveal forensic details.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-stone-900 border border-stone-800 rounded-lg text-amber-400">
              {caseData.playerProgress.actionPointsRemaining} Action Points Left
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseData.clues?.map((clue, idx) => (
              <ClueCard
                key={clue._id || clue.id || idx}
                clue={clue}
                index={idx}
                onDiscover={handleDiscoverClue}
                actionPointsRemaining={caseData.playerProgress.actionPointsRemaining}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interrogation Chat Modal */}
      <AnimatePresence>
        {activeSuspectToInterrogate && (
          <InterrogationModal
            suspect={activeSuspectToInterrogate}
            caseId={caseData._id || caseData.id}
            onClose={() => setActiveSuspectToInterrogate(null)}
          />
        )}
      </AnimatePresence>

      {/* Accusation Modal */}
      <AnimatePresence>
        {showAccusationModal && (
          <AccusationModal
            caseData={caseData}
            onClose={() => setShowAccusationModal(false)}
            onSubmitAccusation={handleAccusationSubmit}
            isSubmitting={isSubmittingAccusation}
          />
        )}
      </AnimatePresence>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHintModal && (
          <HintModal
            caseData={caseData}
            onClose={() => setShowHintModal(false)}
            onUnlockNextHint={handleUnlockHint}
            isUnlocking={isUnlockingHint}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
