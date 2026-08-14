import { Palette, SpriteMaps } from './SpriteMaps.js';
import { AnimationData } from './AnimationData.js';

export class SpriteParser {
  constructor() {
    this.cache = new Map(); // "entityId_animationName_frameIndex" -> ImageBitmap
  }

  async init() {
    // Parse all defined SpriteMaps into crisp ImageBitmaps
    for (const [entityKey, animations] of Object.entries(SpriteMaps)) {
      for (const [animKey, frames] of Object.entries(animations)) {
        for (let i = 0; i < frames.length; i++) {
          const bitmap = await this.parseFrame(frames[i]);
          this.cache.set(`${entityKey}_${animKey}_${i}`, bitmap);
        }
      }
    }
    console.log('[SpriteParser] Loaded', this.cache.size, 'total pixel art sprites');
  }

  getBitmap(entityKey, animKey, frameIndex) {
    return this.cache.get(`${entityKey}_${animKey}_${frameIndex}`);
  }

  async parseFrame(frameArray) {
    const height = frameArray.length;
    const width = frameArray[0].length;
    
    // Create an offscreen canvas to draw the pixels
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Draw each pixel with crisp integer coordinates
    for (let y = 0; y < height; y++) {
      const row = frameArray[y];
      for (let x = 0; x < width; x++) {
        const colorCode = row[x];
        const hexColor = Palette[colorCode];
        
        if (hexColor && hexColor !== 'transparent') {
          ctx.fillStyle = hexColor;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    
    // Create an ImageBitmap from the canvas (fast, hardware-accelerated for rendering)
    return await createImageBitmap(canvas);
  }
}
