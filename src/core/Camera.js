import { CONSTANTS } from '../data/constants.js';

export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    
    // Bounds of the level
    this.bounds = { x: 0, y: 0, width: viewportWidth, height: viewportHeight };
    
    // Tracking target
    this.target = null;
    
    // Studio-grade Trauma-based Screen Shake
    this.trauma = 0.0;
    this.shakeDecay = 1.6;
    this.maxShakeOffset = 14;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this._shakeTime = 0;
    
    // Zoom state (for bosses)
    this.zoom = 1.0;
    this.targetZoom = 1.0;
  }

  setLevelBounds(width, height) {
    this.bounds.width = width;
    this.bounds.height = height;
  }

  setTarget(entity) {
    this.target = entity;
  }

  shake(amplitude, durationMs) {
    // Add trauma proportional to amplitude (0.0 to 1.0)
    const addAmount = Math.min(1.0, (amplitude / 12) + (durationMs / 600));
    this.trauma = Math.min(1.0, this.trauma + addAmount);
  }

  setZoom(targetZoom) {
    this.targetZoom = targetZoom;
  }

  update(dt) {
    if (this.target) {
      const targetCenterX = this.target.x + (this.target.width || 32) / 2;
      const targetCenterY = this.target.y + (this.target.height || 32) / 2;

      // Calculate target position with horizontal lead and framing
      let targetX = targetCenterX - (this.viewportWidth / 2) / this.zoom;
      let targetY = targetCenterY - (this.viewportHeight / 2) / this.zoom;

      // Apply look-ahead lead in facing direction
      if (this.target.facing === 'right') {
        targetX += CONSTANTS.CAMERA_LEAD;
      } else if (this.target.facing === 'left') {
        targetX -= CONSTANTS.CAMERA_LEAD;
      }

      // Smooth Lerp follow
      const lerpFactor = CONSTANTS.CAMERA_LERP || 0.1;
      this.x += (targetX - this.x) * lerpFactor;
      this.y += (targetY - this.y) * lerpFactor;
    }

    // Clamp to level bounds
    const maxCameraX = Math.max(0, this.bounds.width - this.viewportWidth / this.zoom);
    const maxCameraY = Math.max(0, this.bounds.height - this.viewportHeight / this.zoom);
    this.x = Math.max(0, Math.min(this.x, maxCameraX));
    this.y = Math.max(0, Math.min(this.y, maxCameraY));

    // Handle smooth quadratic trauma shake
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.shakeDecay * dt);
      const shakePower = this.trauma * this.trauma; // Quadratic response
      this._shakeTime += dt * 32.0;

      this.shakeOffsetX = this.maxShakeOffset * shakePower * Math.sin(this._shakeTime * 1.7);
      this.shakeOffsetY = this.maxShakeOffset * 0.7 * shakePower * Math.sin(this._shakeTime * 2.3);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
    
    // Handle dynamic zoom lerp
    this.zoom += (this.targetZoom - this.zoom) * 0.05;
  }

  // Get the transform matrix to apply before drawing
  apply(ctx) {
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x - this.shakeOffsetX, -this.y - this.shakeOffsetY);
  }
}
