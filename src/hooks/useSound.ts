import { useCallback, useRef } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  // Gentle temple bell shake sound
  const playShake = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      // Rattle: burst of soft noise
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800 + Math.random() * 1200;
        osc.type = 'triangle';
        const start = t + i * 0.06;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.04, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
        osc.start(start);
        osc.stop(start + 0.1);
      }
    } catch {}
  }, [getCtx]);

  // Resonant chime when stick emerges
  const playChime = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;

      const frequencies = [523.25, 659.25, 783.99]; // C5 E5 G5 — pentatonic feel
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const reverb = ctx.createConvolver();

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';

        const start = t + i * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 2.5);

        osc.start(start);
        osc.stop(start + 2.6);
      });
    } catch {}
  }, [getCtx]);

  // Soft reveal whoosh
  const playReveal = useCallback(() => {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    } catch {}
  }, [getCtx]);

  return { playShake, playChime, playReveal };
}
