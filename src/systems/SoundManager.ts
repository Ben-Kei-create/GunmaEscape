class SoundManager {
  private static instance: SoundManager | null = null;
  private audioContext: AudioContext | null = null;
  private currentBgm: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private seGainNode: GainNode | null = null;
  private bgmVolume: number = 0.5;
  private seVolume: number = 0.7;

  private constructor() {
    this.initializeAudioContext();
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.bgmGainNode = this.audioContext.createGain();
      this.seGainNode = this.audioContext.createGain();
      
      this.bgmGainNode.connect(this.audioContext.destination);
      this.seGainNode.connect(this.audioContext.destination);
      
      this.bgmGainNode.gain.value = this.bgmVolume;
      this.seGainNode.gain.value = this.seVolume;
    } catch (error) {
      console.warn('AudioContext initialization failed:', error);
    }
  }

  private async resumeAudioContext(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Procedural sound generation using Web Audio API
  private generateDiceHitSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1; // 100ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a short noise burst with quick decay
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 30); // Quick decay
      data[i] = (Math.random() * 2 - 1) * decay * 0.3;
    }

    return buffer;
  }

  private generateDamageSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2; // 200ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a low-frequency rectangular wave (ズドン)
    const freq = 80; // Hz
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 5);
      const phase = (t * freq * 2 * Math.PI) % (2 * Math.PI);
      data[i] = (phase < Math.PI ? 1 : -1) * decay * 0.5;
    }

    return buffer;
  }

  private generateWinSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0; // 1 second
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate an ascending arpeggio (ピロリロリン♪)
    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C (major chord)
    const noteDuration = duration / notes.length;

    for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
      const freq = notes[noteIndex];
      const startSample = Math.floor(noteIndex * noteDuration * sampleRate);
      const endSample = Math.floor((noteIndex + 1) * noteDuration * sampleRate);

      for (let i = startSample; i < endSample && i < data.length; i++) {
        const t = (i - startSample) / sampleRate;
        const decay = Math.exp(-t * 3);
        const phase = (t * freq * 2 * Math.PI) % (2 * Math.PI);
        data[i] = Math.sin(phase) * decay * 0.4;
      }
    }

    return buffer;
  }

  private generateButtonClickSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.05; // 50ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a short, high-pitched click
    const freq = 800;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 40);
      const phase = (t * freq * 2 * Math.PI) % (2 * Math.PI);
      data[i] = Math.sin(phase) * decay * 0.2;
    }

    return buffer;
  }

  private playBuffer(buffer: AudioBuffer, gainNode: GainNode): void {
    if (!this.audioContext || !buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    source.start(0);
  }

  // BGM Management
  async playBgm(key: string): Promise<void> {
    await this.resumeAudioContext();
    
    // For now, we'll use procedural generation or placeholder
    // In production, load actual BGM files here
    console.log(`[SoundManager] BGM requested: ${key}`);
    
    // Stop current BGM with fade out
    if (this.currentBgm) {
      const fadeOutDuration = 0.5;
      if (this.bgmGainNode) {
        this.bgmGainNode.gain.linearRampToValueAtTime(
          0,
          this.audioContext!.currentTime + fadeOutDuration
        );
      }
      
      setTimeout(() => {
        if (this.currentBgm) {
          this.currentBgm.stop();
          this.currentBgm = null;
        }
        if (this.bgmGainNode) {
          this.bgmGainNode.gain.value = this.bgmVolume;
        }
        // Start new BGM with fade in
        // This would load and play actual BGM file
      }, fadeOutDuration * 1000);
    }
  }

  // SE Playback
  playSe(key: string): void {
    this.resumeAudioContext();

    let buffer: AudioBuffer | null = null;

    switch (key) {
      case 'dice_hit':
        buffer = this.generateDiceHitSound();
        break;
      case 'damage':
        buffer = this.generateDamageSound();
        break;
      case 'win':
        buffer = this.generateWinSound();
        break;
      case 'button_click':
        buffer = this.generateButtonClickSound();
        break;
      case 'text_advance':
        buffer = this.generateButtonClickSound(); // Reuse button sound
        break;
      default:
        console.log(`[SoundManager] Unknown SE: ${key}`);
        return;
    }

    if (buffer && this.seGainNode) {
      this.playBuffer(buffer, this.seGainNode);
    }
  }

  // Volume Control
  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.bgmVolume;
    }
  }

  setSeVolume(volume: number): void {
    this.seVolume = Math.max(0, Math.min(1, volume));
    if (this.seGainNode) {
      this.seGainNode.gain.value = this.seVolume;
    }
  }

  getBgmVolume(): number {
    return this.bgmVolume;
  }

  getSeVolume(): number {
    return this.seVolume;
  }
}

export const soundManager = SoundManager.getInstance();


