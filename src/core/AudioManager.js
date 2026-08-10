export class AudioManager {
  constructor() {
    this.sounds = {};
    this.poolSize = 4;
    this.masterVolume = 0.7;
    this.muted = false;
    this.bgm = null;
  }

  async init() {
    const soundFiles = {
      jump:         '/audio/jump.mp3',
      dash:         '/audio/dash.mp3',
      attack_light: '/audio/attack_light.mp3',
      attack_heavy: '/audio/attack_heavy.mp3',
      parry:        '/audio/parry.mp3',
      hit:          '/audio/hit.mp3',
      player_hurt:  '/audio/player_hurt.mp3',
      absorb:       '/audio/absorb.mp3',
      level_up:     '/audio/level_up.mp3',
      boss_roar:    '/audio/boss_roar.mp3',
      victory:      '/audio/victory.mp3',
    };

    for (const [key, path] of Object.entries(soundFiles)) {
      this.sounds[key] = Array.from({ length: this.poolSize }, () => {
        const a = new Audio(path);
        a.volume = this.masterVolume;
        return a;
      });
    }
    this.bgm = new Audio('/audio/bgm_chapter1.mp3');
    this.bgm.loop = true;
    this.bgm.volume = 0.4;
  }

  play(key) {
    if (this.muted || !this.sounds[key]) return;
    const pool = this.sounds[key];
    const free = pool.find(a => a.paused || a.ended) ?? pool[0];
    free.currentTime = 0;
    free.play().catch(() => {});
  }

  playBGM() {
    if (!this.muted && this.bgm) {
        this.bgm.currentTime = 0;
        this.bgm.play().catch(() => {});
    }
  }

  stopBGM() {
      if (this.bgm) this.bgm.pause();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
        this.stopBGM();
    } else {
        this.playBGM();
    }
  }
}
