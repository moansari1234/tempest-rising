export class AudioManager {
  constructor() {
    this.masterVolume = 0.5;
    this.muted = false;
    this.bgm = null;
    this.ctx = null;
  }

  async init() {
    // Setup Web Audio Context for zero-dependency procedural retro sound effects
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('[AudioManager] Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  play(key) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    try {
      switch (key) {
        case 'jump': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(160, t);
          osc.frequency.exponentialRampToValueAtTime(480, t + 0.12);
          gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.12);
          break;
        }

        case 'dash': {
          const bufferSize = this.ctx.sampleRate * 0.15;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, t);
          filter.frequency.exponentialRampToValueAtTime(300, t + 0.15);
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          noise.start(t);
          break;
        }

        case 'attack_light': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(650, t);
          osc.frequency.exponentialRampToValueAtTime(180, t + 0.09);
          gain.gain.setValueAtTime(0.35 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.09);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.09);
          break;
        }

        case 'attack_heavy': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.exponentialRampToValueAtTime(35, t + 0.28);
          gain.gain.setValueAtTime(0.5 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.28);
          break;
        }

        case 'parry': {
          // Metallic high bell chime
          [1200, 2400].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime((0.3 / (i + 1)) * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.35);
          });
          break;
        }

        case 'hit': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
          gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }

        case 'player_hurt': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
          gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
          break;
        }

        case 'absorb': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(400, t + 0.1);
          osc.frequency.linearRampToValueAtTime(150, t + 0.25);
          gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
          break;
        }

        case 'level_up': {
          // Triumphant 4-note 8-bit arpeggio: C5 (523), E5 (659), G5 (784), C6 (1046)
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t + i * 0.08);
            gain.gain.setValueAtTime(0.25 * this.masterVolume, t + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.01, t + i * 0.08 + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.12);
          });
          break;
        }

        case 'boss_roar': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
          gain.gain.setValueAtTime(0.5 * this.masterVolume, t);
          gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
        }

        case 'victory': {
          const melody = [523.25, 659.25, 783.99, 1046.50, 880.00, 1046.50];
          melody.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.1);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, t + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.01, t + i * 0.1 + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.18);
          });
          break;
        }
      }
    } catch (e) {
      // Audio playback failed silently
    }
  }

  playBGM() {}
  stopBGM() {}

  toggleMute() {
    this.muted = !this.muted;
  }
}
