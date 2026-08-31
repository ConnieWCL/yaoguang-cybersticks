import { useCallback, useEffect, useRef, useState } from 'react';

const SOUND_KEY = 'yaoguang_sound_enabled';

type WebkitWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const [enabled, setEnabled] = useState(() => localStorage.getItem(SOUND_KEY) !== 'false');

  const getAudio = useCallback(() => {
    if (!ctxRef.current) {
      const AudioContextClass = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (!AudioContextClass) return null;
      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      master.gain.value = 0.72;
      compressor.threshold.value = -22;
      compressor.knee.value = 18;
      compressor.ratio.value = 5;
      master.connect(compressor);
      compressor.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return { ctx: ctxRef.current, master: masterRef.current! };
  }, []);

  const withAudio = useCallback((schedule: (ctx: AudioContext, master: GainNode) => void) => {
    if (!enabled) return;
    const audio = getAudio();
    if (!audio) return;
    const run = () => schedule(audio.ctx, audio.master);
    if (audio.ctx.state === 'suspended') void audio.ctx.resume().then(run).catch(() => undefined);
    else run();
  }, [enabled, getAudio]);

  const playShake = useCallback(() => withAudio((ctx, master) => {
    const t = ctx.currentTime + 0.015;
    for (let i = 0; i < 7; i++) {
      const length = Math.floor(ctx.sampleRate * 0.055);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let n = 0; n < length; n++) channel[n] = (Math.random() * 2 - 1) * (1 - n / length);
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 1450 + Math.random() * 950;
      filter.Q.value = 2.4;
      gain.gain.setValueAtTime(0, t + i * 0.055);
      gain.gain.linearRampToValueAtTime(0.11, t + i * 0.055 + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.055 + 0.065);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(t + i * 0.055);
    }
  }), [withAudio]);

  const playChime = useCallback(() => withAudio((ctx, master) => {
    const t = ctx.currentTime + 0.01;
    [293.66, 440, 587.33].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, t + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.12 : 0.055, t + index * 0.08 + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8 + index * 0.08);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(t + index * 0.08);
      oscillator.stop(t + 2.9 + index * 0.08);
    });
  }), [withAudio]);

  const playReveal = useCallback(() => withAudio((ctx, master) => {
    const t = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(174.61, t);
    oscillator.frequency.exponentialRampToValueAtTime(523.25, t + 0.55);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.45);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.065, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    oscillator.start(t);
    oscillator.stop(t + 0.7);
  }), [withAudio]);

  const toggleSound = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      localStorage.setItem(SOUND_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => () => {
    if (ctxRef.current) void ctxRef.current.close();
  }, []);

  return { enabled, toggleSound, playShake, playChime, playReveal };
}
