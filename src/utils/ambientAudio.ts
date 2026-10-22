// Web Audio API procedural sound synthesizer for Focus Room
// Generates genuine, calming ambient sound (Rain, Ocean Waves, Soft Pink Noise) without external asset latency

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: 'rain' | 'waves' | 'whitenoise' | 'none' = 'none';
  private gainNode: GainNode | null = null;
  private sourceNodes: AudioNode[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'rain' | 'waves' | 'whitenoise' | 'none', volume: number = 0.5) {
    this.stop();
    this.currentType = type;
    this.volume = volume;

    if (type === 'none') return;

    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, this.ctx.currentTime);

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink / Brown noise generator
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    if (type === 'rain') {
      // Bandpass filter for rain droplets
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      this.sourceNodes = [whiteNoise, filter];
    } else if (type === 'waves') {
      // Lowpass filter with slow undulating LFO for ocean wave swells
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      this.sourceNodes = [whiteNoise, filter, lfo, lfoGain];
    } else {
      // Soft ambient pink noise
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      this.sourceNodes = [whiteNoise, filter];
    }

    whiteNoise.start();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx && !this.isMuted) {
      this.gainNode.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : this.volume * 0.4, this.ctx.currentTime);
    }
  }

  public stop() {
    this.sourceNodes.forEach((node) => {
      try {
        if ('stop' in node) (node as any).stop();
        node.disconnect();
      } catch (e) {
        // Ignored
      }
    });
    this.sourceNodes = [];
    this.currentType = 'none';
  }

  public getCurrentType() {
    return this.currentType;
  }
}

export const ambientSound = new AmbientSoundEngine();
