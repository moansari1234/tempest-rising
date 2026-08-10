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
    
    // Shake state
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeTimer = 0;
    this.shakeAmplitude = 0;
    
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
    this.shakeAmplitude = amplitude;
    this.shakeTimer = durationMs / 1000.0; // Convert to seconds
  }

  setZoom(targetZoom) {
      this.targetZoom = targetZoom;
  }

  update(dt) {
    if (this.target) {
      // Calculate target position with lead and deadzone
      let targetX = this.target.x - this.viewportWidth / 2 / this.zoom;
      let targetY = this.target.y - this.viewportHeight / 2 / this.zoom;

      // Apply Lead based on facing direction
      if (this.target.facing === 'right') {
          targetX += CONSTANTS.CAMERA_LEAD;
      } else if (this.target.facing === 'left') {
          targetX -= CONSTANTS.CAMERA_LEAD;
      }

      // Smooth follow (Lerp)
      this.x += (targetX - this.x) * CONSTANTS.CAMERA_LERP;
      this.y += (targetY - this.y) * CONSTANTS.CAMERA_LERP;
    }

    // Clamp to bounds
    this.x = Math.max(0, Math.min(this.x, this.bounds.width - this.viewportWidth / this.zoom));
    this.y = Math.max(0, Math.min(this.y, this.bounds.height - this.viewportHeight / this.zoom));

    // Handle screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      // Oscillate between -amplitude and +amplitude
      const decay = Math.max(0, this.shakeTimer);
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeAmplitude * decay;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeAmplitude * decay;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
    
    // Handle Zoom lerp
    this.zoom += (this.targetZoom - this.zoom) * 0.05;
  }

  // Get the transform matrix to apply before drawing
  apply(ctx) {
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x - this.shakeOffsetX, -this.y - this.shakeOffsetY);
  }
}
