class AudioManagerImpl {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private masterVolume: number = 0.8;
  private initialized: boolean = false;

  constructor() {
    // Lazy init on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  public resume() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public playRotate() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playGateToggle() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.25 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // 1. Move / Flow: 0.2s (soft glassy pipe flow hum)
  public playBallMoveFlow() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.2);

    gain.gain.setValueAtTime(0.06 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playFlowStream() {
    this.playBallMoveFlow();
  }

  // 2. Enter Container: 0.15s (satisfying liquid/crystal drop pop)
  public playBallEnterContainer(pitchMultiplier = 1) {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 580 * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, t + 0.15);

    gain.gain.setValueAtTime(0.22 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playBallDrop(pitchMultiplier = 1) {
    this.playBallEnterContainer(pitchMultiplier);
  }

  // 3. Bounce (Soft): 0.1s (soft rubbery/glass clink bounce)
  public playBallBounce(pitchMultiplier = 1) {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = 740 * pitchMultiplier;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.1);

    gain.gain.setValueAtTime(0.14 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 4. Complete (Satisfying): 0.5s (celebratory fanfare / chime)
  public playBallComplete() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5 to E6 major chime
    freqs.forEach((freq, idx) => {
      const noteTime = t + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.26 * this.masterVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.48);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.48);
    });
  }

  public playTargetComplete() {
    this.playBallComplete();
  }

  public playLevelWin() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [
      { f: [523.25, 659.25, 783.99], delay: 0 },
      { f: [587.33, 739.99, 880.0], delay: 0.14 },
      { f: [659.25, 830.61, 987.77], delay: 0.28 },
      { f: [783.99, 987.77, 1174.66, 1567.98], delay: 0.44 },
    ];

    chords.forEach((chord) => {
      chord.f.forEach((freq) => {
        const noteTime = t + chord.delay;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.15 * this.masterVolume, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    });
  }

  public playButtonClick() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.05);

    gain.gain.setValueAtTime(0.12 * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playCloudWhoosh() {
    if (!this.sfxEnabled) return;
    this.resume();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const duration = 0.44;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.08) * 0.35;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.18);
      filter.frequency.exponentialRampToValueAtTime(450, t + duration);
      filter.Q.value = 1.6;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, t + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + duration);
    } catch {
      // Audio fallback
    }
  }
}

export const AudioManager = new AudioManagerImpl();
