/**
 * Web Audio API helper that plays exactly two short electronic beeps (880Hz)
 * when a Focus session completes.
 */
export function playCompletionBeep(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Beep 1: 880Hz for 120ms
    playTone(880, 0, 0.12);
    // Beep 2: 880Hz for 150ms starting after 180ms
    playTone(880, 0.18, 0.15);
  } catch (err) {
    console.error('Focus completion audio playback failed:', err);
  }
}
