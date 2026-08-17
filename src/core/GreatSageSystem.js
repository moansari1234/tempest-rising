export class GreatSageSystem {
  constructor() {
    this.queue = [];
    this.current = null;
    this.timer = 0;
    this.typewriterIndex = 0;
    this.typewriterTimer = 0;
  }

  notify(title, message, options = {}) {
    const item = {
      title: title || '« REPORT: GREAT SAGE »',
      message: message || '',
      type: options.type || 'info', // 'level_up', 'devour', 'skill_acquired', 'info'
      duration: options.duration || 4.5,
      skillBadge: options.skillBadge || null,
      sound: options.sound || 'absorb'
    };

    if (!this.current) {
      this.current = item;
      this.timer = item.duration;
      this.typewriterIndex = 0;
      this.typewriterTimer = 0;
    } else {
      this.queue.push(item);
    }
  }

  update(dt, context) {
    if (!this.current) {
      if (this.queue.length > 0) {
        this.current = this.queue.shift();
        this.timer = this.current.duration;
        this.typewriterIndex = 0;
        this.typewriterTimer = 0;
        if (context && context.audio && this.current.sound) {
          context.audio.play(this.current.sound);
        }
      }
      return;
    }

    this.timer -= dt;

    // Typewriter effect progression
    this.typewriterTimer += dt;
    if (this.typewriterTimer >= 0.025) {
      this.typewriterTimer = 0;
      if (this.typewriterIndex < this.current.message.length) {
        this.typewriterIndex += 2;
        if (this.typewriterIndex > this.current.message.length) {
          this.typewriterIndex = this.current.message.length;
        }
      }
    }

    if (this.timer <= 0) {
      this.current = null;
    }
  }
}
