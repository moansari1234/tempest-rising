import { Palette, SpriteMaps } from './SpriteMaps.js';
import { AnimationData } from './AnimationData.js';

export class SpriteParser {
  constructor() {
    this.cache = new Map(); // "entityId_animationName_frameIndex" -> ImageBitmap
    this.activePack = parseInt(localStorage.getItem('tempest_asset_pack') || '1', 10);
  }

  setAssetPack(packNum) {
    this.activePack = packNum === 2 ? 2 : 1;
    localStorage.setItem('tempest_asset_pack', this.activePack.toString());
    console.log(`[SpriteParser] Active Asset Pack switched to: ${this.activePack} (${this.activePack === 1 ? 'Classic 1' : 'Arcade HD 2'})`);
  }

  toggleAssetPack() {
    this.setAssetPack(this.activePack === 1 ? 2 : 1);
    return this.activePack;
  }

  async init() {
    // 1. Parse procedural SpriteMaps (Pack 1 - Classic)
    for (const [entityKey, animations] of Object.entries(SpriteMaps)) {
      for (const [animKey, frames] of Object.entries(animations)) {
        for (let i = 0; i < frames.length; i++) {
          const bitmap = await this.parseFrame(frames[i]);
          this.cache.set(`${entityKey}_${animKey}_${i}`, bitmap);
        }
      }
    }

    // 2. Load PNG sprites for Boss & Goblins
    const pngEntities = {
      serpent: { idle: 4, run: 4, attack: 4, hurt: 2, death: 4 },
      goblin: { idle: 4, run: 4, attack: 3, hurt: 2, death: 4 },
      goblin_archer: { idle: 4, run: 4, attack: 4, hurt: 2, death: 4 }
    };

    for (const [entityKey, anims] of Object.entries(pngEntities)) {
      for (const [animKey, frameCount] of Object.entries(anims)) {
        for (let i = 0; i < frameCount; i++) {
          const pngPath = `/public/sprites/${entityKey}/${animKey}_${i}.png`;
          try {
            const img = new Image();
            img.src = pngPath;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            if (img.complete && img.naturalWidth > 0) {
              const bitmap = await createImageBitmap(img);
              this.cache.set(`${entityKey}_${animKey}_${i}`, bitmap);
            }
          } catch (e) {}
        }
      }
    }

    // 3. Load Rimuru Pack 2 (Arcade HD)
    const rimuruV2Anims = {
      idle: 4,
      run: 4,
      jump: 4,
      attack_light: 4,
      attack_heavy: 4,
      predator: 4,
      special: 2,
      hurt: 2,
      death: 4,
      victory: 4
    };

    for (const [animKey, frameCount] of Object.entries(rimuruV2Anims)) {
      for (let i = 0; i < frameCount; i++) {
        const pngPath = `/public/sprites/rimuru_v2/${animKey}_${i}.png`;
        try {
          const img = new Image();
          img.src = pngPath;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          if (img.complete && img.naturalWidth > 0) {
            const bitmap = await createImageBitmap(img);
            this.cache.set(`rimuru_v2_${animKey}_${i}`, bitmap);
          }
        } catch (e) {}
      }
    }

    console.log('[SpriteParser] Loaded', this.cache.size, 'total pixel art sprites (Pack 1 & Pack 2 ready)');
  }

  getBitmap(entityKey, animKey, frameIndex, forcePack = null) {
    const pack = forcePack !== null ? forcePack : this.activePack;
    
    // Check if Pack 2 requested and available for rimuru
    if (pack === 2 && entityKey === 'rimuru') {
      const v2Key = `rimuru_v2_${animKey}_${frameIndex}`;
      if (this.cache.has(v2Key)) {
        return this.cache.get(v2Key);
      }
    }

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
