import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const rainGainRef = useRef(null);
  const synthIntervalRef = useRef(null);

  const startNoirAmbience = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 1. Synthesize Rain Noise (Brownian / Lowpass Pink Noise)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // Gain factor
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rainfall softness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      rainGainRef.current = gainNode;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();

      // 2. Play gentle moody noir jazz chord intervals
      const moodyNotes = [174.61, 207.65, 261.63, 311.13, 349.23]; // F minor 7 / 9
      synthIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        try {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          const note = moodyNotes[Math.floor(Math.random() * moodyNotes.length)];
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, ctx.currentTime);

          oscGain.gain.setValueAtTime(0.001, ctx.currentTime);
          oscGain.gain.exponentialRampToValueAtTime(0.015, ctx.currentTime + 1.5);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 5.5);

          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 6);
        } catch (e) {
          // ignore
        }
      }, 7000);

      setIsPlaying(true);
    } catch (e) {
      console.warn('AudioContext initialization notice:', e);
    }
  };

  const stopNoirAmbience = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.suspend();
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
    }
    setIsPlaying(false);
  };

  const toggleAmbience = () => {
    if (isPlaying) {
      stopNoirAmbience();
    } else {
      startNoirAmbience();
    }
  };

  // Play subtle sound effects
  const playSfx = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'clue') {
        // High crystalline discovery chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'typewriter') {
        // Quick subtle click
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'gavel') {
        // Deep resonance for final accusation
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {
      // Audio not permitted yet
    }
  };

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAmbience, playSfx }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useNoirAudio = () => useContext(AudioContext);
