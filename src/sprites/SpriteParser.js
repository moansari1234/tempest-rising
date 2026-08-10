import { Palette, SpriteMaps } from './SpriteMaps.js';
import { AnimationData } from './AnimationData.js';

const RimuruSheetConfig = {
  url: '/rimuru.png',
  rows: 10,
  animations: {
    idle: { row: 0, frames: 7 },
    walk: { row: 1, frames: 7 },
    run: { row: 2, frames: 6 },
    jump: { row: 3, frames: 6 },
    attack_light: { row: 4, frames: 6 },
    predator: { row: 5, frames: 6 },
    hurt: { row: 6, frames: 6 },
    death: { row: 7, frames: 6 },
    victory: { row: 8, frames: 6 },
    special: { row: 9, frames: 6 }
  }
};

export class SpriteParser {
  constructor() {
    this.cache = new Map(); // "entityId_animationName_frameIndex" -> ImageBitmap
  }

  async init() {
    // 1. Try to load Rimuru's external PNG sprite sheet
    let rimuruLoaded = false;
    try {
      const rimuruImage = await this.loadImage(RimuruSheetConfig.url);
      await this.sliceSpriteSheet('rimuru', rimuruImage, RimuruSheetConfig);
      rimuruLoaded = true;
      console.log('[SpriteParser] Loaded external Rimuru sprite sheet');
    } catch (err) {
      console.warn('[SpriteParser] Could not load /rimuru.png. Falling back to pixel map.', err);
      // Override AnimationData.rimuru to match the fallback definition in SpriteMaps
      AnimationData.rimuru = {
        idle: { frameTime: 0.5, frames: 2, loop: true },
        run: { frameTime: 0.1, frames: 1, loop: true }
      };
    }

    // 2. Parse all defined SpriteMaps into ImageBitmaps (skipping rimuru if loaded from PNG)
    for (const [entityKey, animations] of Object.entries(SpriteMaps)) {
      if (entityKey === 'rimuru' && rimuruLoaded) continue;
      for (const [animKey, frames] of Object.entries(animations)) {
        for (let i = 0; i < frames.length; i++) {
          const bitmap = await this.parseFrame(frames[i]);
          this.cache.set(`${entityKey}_${animKey}_${i}`, bitmap);
        }
      }
    }
    console.log('[SpriteParser] Loaded', this.cache.size, 'total sprites');
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  async sliceSpriteSheet(entityKey, img, config) {
    const rows = config.rows;
    const cellHeight = img.height / rows;
    
    // Assume square cells
    const cellWidth = cellHeight;
    const cols = Math.floor(img.width / cellWidth);
    
    for (const [animKey, animInfo] of Object.entries(config.animations)) {
      const row = animInfo.row;
      const numFrames = Math.min(animInfo.frames, cols);
      
      for (let i = 0; i < numFrames; i++) {
        // Create offscreen canvas for this frame
        const canvas = document.createElement('canvas');
        canvas.width = cellWidth;
        canvas.height = cellHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw the slice from the sprite sheet
        ctx.drawImage(
          img,
          i * cellWidth, row * cellHeight, cellWidth, cellHeight, // src
          0, 0, cellWidth, cellHeight // dest
        );
        
        // Convert to ImageBitmap and cache
        const bitmap = await createImageBitmap(canvas);
        this.cache.set(`${entityKey}_${animKey}_${i}`, bitmap);
      }
    }
  }

  getBitmap(entityKey, animKey, frameIndex) {
    return this.cache.get(`${entityKey}_${animKey}_${frameIndex}`);
  }

  async parseFrame(frameArray) {
    const height = frameArray.length;
    const width = frameArray[0].length;
    
    // We create an offscreen canvas to draw the pixels
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Draw each pixel
    for (let y = 0; y < height; y++) {
      const row = frameArray[y];
      for (let x = 0; x < width; x++) {
        const colorCode = row[x];
        const hexColor = Palette[colorCode];
        
        if (hexColor !== 'transparent') {
          ctx.fillStyle = hexColor;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    
    // Create an ImageBitmap from the canvas (fast for rendering)
    return await createImageBitmap(canvas);
  }
}
