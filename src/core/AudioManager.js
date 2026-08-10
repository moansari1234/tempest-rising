export class AudioManager {
  constructor() {
    this.sounds = {};
    this.poolSize = 4;
    this.masterVolume = 0.7;
    this.muted = false;
    this.bgm = null;
    this.loaded = new Set();
  }

  async init() {
    const soundFiles = {
      jump:         '/public/audio/jump.mp3',
      dash:         '/public/audio/dash.mp3',
      attack_light: '/public/audio/attack_light.mp3',
      attack_heavy: '/public/audio/attack_heavy.mp3',
      parry:        '/public/audio/parry.mp3',
      hit:          '/public/audio/hit.mp3',
      player_hurt:  '/public/audio/player_hurt.mp3',
      absorb:       '/public/audio/absorb.mp3',
      level_up:     '/public/audio/level_up.mp3',
      boss_roar:    '/public/audio/boss_roar.mp3',
      victory:      '/public/audio/victory.mp3',
    };

    // Only create audio pools for files that actually exist
    for (const [key, path] of Object.entries(soundFiles)) {
      try {
        const resp = await fetch(path, { method: 'HEAD' });
        if (resp.ok) {
          this.sounds[key] = Array.from({ length: this.poolSize }, () => {
            const a = new Audio(path);
            a.volume = this.masterVolume;
            return a;
          });
          this.loaded.add(key);
        }
      } catch (e) {
        // File doesn't exist, skip silently
      }
    }

    // BGM
    try {
      const bgmResp = await fetch('/public/audio/bgm_chapter1.mp3', { method: 'HEAD' });
      if (bgmResp.ok) {
        this.bgm = new Audio('/public/audio/bgm_chapter1.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.4;
      }
    } catch (e) {}

    console.log(`[AudioManager] Loaded ${this.loaded.size} sound effects`);
  }

  play(key) {
    if (this.muted || !this.sounds[key]) return;
    const pool = this.sounds[key];
    const free = pool.find(a => a.paused || a.ended) ?? pool[0];
    try {
      free.currentTime = 0;
      free.play().catch(() => {});
    } catch (e) {}
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
