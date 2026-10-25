import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, AlertCircle, CornerDownLeft } from 'lucide-react';
import { interrogateSuspect } from '../services/api';

const QUICK_PROMPTS = [
  "Where exactly were you when the crime took place?",
  "Did you have any disagreements or debts with the victim?",
  "How do you explain the evidence found at the scene?",
  "Can anyone corroborate your alibi?",
];

export default function InterrogationModal({ suspect, caseId, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'suspect',
      text: `Detective, I am cooperating fully, but I resent these baseless insinuations. What do you wish to know?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionText) => {
    const q = (questionText || inputText).trim();
    if (!q || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'detective', text: q }]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await interrogateSuspect(caseId, suspect._id || suspect.id, q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'suspect',
          text: result.response || `No comment, Detective.`,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'suspect',
          text: `(The suspect glances away nervously) My lawyer advised me not to answer that right now.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-noir-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-noir-900 border border-stone-700/80 rounded-2xl w-full max-w-2xl h-[90vh] max-h-[680px] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-noir-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-xl shadow-inner">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-100">
                  {suspect.name}
                </h3>
                <span className="text-[10px] font-mono uppercase bg-amber-950/60 text-amber-400 border border-amber-600/40 px-1.5 py-0.5 rounded">
                  Interrogation Room
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                {suspect.role} • Alibi: "{suspect.alibi.substring(0, 45)}..."
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-noir-950/60">
          {messages.map((msg, idx) => {
            const isDetective = msg.sender === 'detective';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isDetective ? 'justify-end' : 'justify-start'}`}
              >
                {!isDetective && (
                  <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs shrink-0 shadow">
                    👤
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isDetective
                      ? 'bg-amber-600 text-noir-950 font-medium rounded-tr-none shadow-md font-sans'
                      : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none font-serif shadow-inner'
                  }`}
                >
                  <span className="block text-[10px] font-mono uppercase mb-1 opacity-70">
                    {isDetective ? 'Detective Vance' : suspect.name}
                  </span>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                {isDetective && (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs shrink-0 text-amber-400 shadow">
                    🕵️
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs shrink-0">
                👤
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl rounded-tl-none p-3.5 flex items-center gap-1.5 text-stone-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-[11px] text-stone-400">{suspect.name} is calculating their response...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2 border-t border-stone-800/80 bg-noir-900/95 overflow-x-auto whitespace-nowrap flex gap-2">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] font-mono text-stone-300 hover:text-amber-300 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-full px-3 py-1 transition-colors shrink-0 disabled:opacity-50"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-noir-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Confront ${suspect.name} with questions or evidence...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-detective-amber font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-noir-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs uppercase font-mono">Inquire</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
