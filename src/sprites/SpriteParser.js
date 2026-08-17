import { Palette, SpriteMaps } from './SpriteMaps.js';
import { AnimationData } from './AnimationData.js';

export class SpriteParser {
  constructor() {
    this.cache = new Map(); // "entityId_animationName_frameIndex" -> ImageBitmap
  }

  getSkin(entityKey) {
    const saved = localStorage.getItem(`tempest_skin_${entityKey}`);
    return saved ? parseInt(saved, 10) : 1;
  }

  setSkin(entityKey, skinIndex) {
    const index = skinIndex === 2 ? 2 : 1;
    localStorage.setItem(`tempest_skin_${entityKey}`, index.toString());
    console.log(`[SpriteParser] Equipped Skin ${index} for entity: ${entityKey}`);
    return index;
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

    // 2. Load PNG sprites for Boss & Goblins (Pack 1)
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

    // 3. Load Pack 2 Remastered Variants
    const v2Packs = {
      rimuru_v2: {
        idle: 4, run: 4, jump: 4, attack_light: 4, attack_heavy: 4,
        predator: 4, special: 2, hurt: 2, death: 4, victory: 4
      },
      goblin_archer_v2: {
        idle: 4, run: 4, attack: 4, hurt: 2, death: 4
      },
      goblin_v2: {
        idle: 4, run: 4, attack: 4, hurt: 2, death: 4
      },
      serpent_v2: {
        idle: 4, run: 4, attack: 4, hurt: 2, death: 4
      }
    };

    for (const [packFolder, anims] of Object.entries(v2Packs)) {
      for (const [animKey, frameCount] of Object.entries(anims)) {
        for (let i = 0; i < frameCount; i++) {
          const pngPath = `/public/sprites/${packFolder}/${animKey}_${i}.png`;
          try {
            const img = new Image();
            img.src = pngPath;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            if (img.complete && img.naturalWidth > 0) {
              const bitmap = await createImageBitmap(img);
              this.cache.set(`${packFolder}_${animKey}_${i}`, bitmap);
            }
          } catch (e) {}
        }
      }
    // 4. Load Environment Modular Tiles
    const tileNames = [
      'ground_left', 'ground_mid', 'ground_right', 'rock_core',
      'plat_left', 'plat_mid', 'plat_right', 'bridge',
      'wall_left', 'wall_right', 'ceiling', 'underhang',
      'slope_up', 'slope_down', 'pillar_top', 'pillar_base'
    ];

    for (const tName of tileNames) {
      const pngPath = `/public/sprites/tiles/${tName}.png`;
      try {
        const img = new Image();
        img.src = pngPath;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        if (img.complete && img.naturalWidth > 0) {
          const bitmap = await createImageBitmap(img);
          this.cache.set(`tiles_${tName}_0`, bitmap);
        }
      } catch (e) {}
    }

    // 5. Load Environment Interactive Props
    const propAnims = {
      magisteel: { idle: 4, break: 4 },
      hipokute: { bloom: 4 },
      monolith: { activate: 4 }
    };

    for (const [propKey, anims] of Object.entries(propAnims)) {
      for (const [animKey, frameCount] of Object.entries(anims)) {
        for (let i = 0; i < frameCount; i++) {
          const pngPath = `/public/sprites/props/${propKey}_${animKey}_${i}.png`;
          try {
            const img = new Image();
            img.src = pngPath;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            if (img.complete && img.naturalWidth > 0) {
              const bitmap = await createImageBitmap(img);
              this.cache.set(`${propKey}_${animKey}_${i}`, bitmap);
            }
          } catch (e) {}
        }
      }
    }

    console.log('[SpriteParser] Loaded', this.cache.size, 'total pixel art sprites (Characters & Environment)');
  }

  getBitmap(entityKey, animKey, frameIndex, forceSkin = null) {
    const skin = forceSkin !== null ? forceSkin : this.getSkin(entityKey);
    
    // Check if Skin 2 requested and available
    if (skin === 2) {
      if (entityKey === 'rimuru') {
        const v2Key = `rimuru_v2_${animKey}_${frameIndex}`;
        if (this.cache.has(v2Key)) return this.cache.get(v2Key);
      } else if (entityKey === 'goblin_archer') {
        const v2Key = `goblin_archer_v2_${animKey}_${frameIndex}`;
        if (this.cache.has(v2Key)) return this.cache.get(v2Key);
      } else if (entityKey === 'goblin') {
        const v2Key = `goblin_v2_${animKey}_${frameIndex}`;
        if (this.cache.has(v2Key)) return this.cache.get(v2Key);
      } else if (entityKey === 'serpent' || entityKey === 'boss_serpent') {
        const v2Key = `serpent_v2_${animKey}_${frameIndex}`;
        if (this.cache.has(v2Key)) return this.cache.get(v2Key);
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
