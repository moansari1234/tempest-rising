export class FloatersManager {
  constructor() {
    this.floaters = [];
  }

  add(text, x, y, color = '#ffffff') {
    this.floaters.push({
      text,
      x,
      y,
      color,
      alpha: 1.0,
      vy: -30,
      lifetime: 1.0
    });
  }

  render(ctx, dt, context) {
    if (this.floaters.length === 0) return;

    ctx.save();
    if (context && context.camera) {
      context.camera.apply(ctx);
    }

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';

    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.y += f.vy * dt;
      f.lifetime -= dt;
      f.alpha = Math.max(0, f.lifetime);

      ctx.globalAlpha = f.alpha;
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);

      if (f.lifetime <= 0) {
        this.floaters.splice(i, 1);
      }
    }

    ctx.restore();
  }
}
