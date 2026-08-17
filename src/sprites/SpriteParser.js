import { Palette, SpriteMaps } from './SpriteMaps.js';
import { AnimationData } from './AnimationData.js';

export class SpriteParser {
  constructor() {
    this.cache = new Map(); // "entityId_animationName_frameIndex" -> ImageBitmap
    this.offsets = this.loadOffsets();
    this.locks = this.loadLocks();
    this.clipSpeeds = this.loadClipSpeeds();
  }

  loadClipSpeeds() {
    try {
      const saved = localStorage.getItem('tempest_clip_speeds');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }

  saveClipSpeeds() {
    try {
      localStorage.setItem('tempest_clip_speeds', JSON.stringify(this.clipSpeeds));
    } catch (e) {}
  }

  getClipSpeed(entityKey, animKey) {
    if (!animKey) return 1.0;
    const key = `${entityKey}_${animKey}`;
    return this.clipSpeeds[key] !== undefined ? this.clipSpeeds[key] : 1.0;
  }

  setClipSpeed(entityKey, animKey, speed) {
    if (!animKey) return;
    const key = `${entityKey}_${animKey}`;
    const rounded = Math.round(speed * 100) / 100;
    if (rounded === 1.0) {
      delete this.clipSpeeds[key];
    } else {
      this.clipSpeeds[key] = rounded;
    }
    this.saveClipSpeeds();
    return rounded;
  }

  resetClipSpeed(entityKey, animKey) {
    if (!animKey) return;
    delete this.clipSpeeds[`${entityKey}_${animKey}`];
    this.saveClipSpeeds();
  }

  loadLocks() {
    const defaultLocks = {
      goblin_archer_idle_f0: true,
      goblin_archer_idle_f1: true,
      goblin_archer_idle_f2: true,
      goblin_archer_idle_f3: true
    };
    try {
      const saved = localStorage.getItem('tempest_sprite_locks');
      if (saved) return { ...defaultLocks, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultLocks;
  }

  saveLocks() {
    try {
      localStorage.setItem('tempest_sprite_locks', JSON.stringify(this.locks));
    } catch (e) {}
  }

  isFrameLocked(entityKey, animKey, frameIndex) {
    const key = `${entityKey}_${animKey}_f${frameIndex}`;
    return !!this.locks[key];
  }

  toggleFrameLock(entityKey, animKey, frameIndex) {
    const key = `${entityKey}_${animKey}_f${frameIndex}`;
    this.locks[key] = !this.locks[key];
    this.saveLocks();
    return this.locks[key];
  }

  setFrameLock(entityKey, animKey, frameIndex, locked = true) {
    const key = `${entityKey}_${animKey}_f${frameIndex}`;
    if (locked) this.locks[key] = true;
    else delete this.locks[key];
    this.saveLocks();
  }

  lockAllFrames(entityKey, animKey, totalFrames, locked = true) {
    for (let f = 0; f < totalFrames; f++) {
      const key = `${entityKey}_${animKey}_f${f}`;
      if (locked) this.locks[key] = true;
      else delete this.locks[key];
    }
    this.saveLocks();
  }

  hasCustomFrameOffset(entityKey, animKey, frameIndex) {
    const key = `${entityKey}_${animKey}_f${frameIndex}`;
    return !!this.offsets[key];
  }

  loadOffsets() {
    const defaults = {
      rimuru: { offsetX: 0, offsetY: 0, scale: 1.0 },
      goblin: { offsetX: 0, offsetY: 0, scale: 1.0 },
      goblin_archer: { offsetX: 0, offsetY: 0, scale: 1.0 },
      // Calibrated Frame-Level Offsets for Goblin Sharpshooter (Pack 1)
      goblin_archer_idle_f0: { offsetX: -2, offsetY: 0, scale: 1.0 },
      goblin_archer_idle_f1: { offsetX: 16, offsetY: 0, scale: 1.0 },
      goblin_archer_idle_f2: { offsetX: 23, offsetY: 0, scale: 1.0 },
      goblin_archer_idle_f3: { offsetX: 27, offsetY: 0, scale: 1.0 },
      serpent: { offsetX: 0, offsetY: 0, scale: 1.0 },
      magisteel: { offsetX: 0, offsetY: 0, scale: 1.0 },
      hipokute: { offsetX: 0, offsetY: 0, scale: 1.0 },
      monolith: { offsetX: 0, offsetY: 0, scale: 1.0 },
      portal: { offsetX: 0, offsetY: 0, scale: 1.0 },
      chest: { offsetX: 0, offsetY: 0, scale: 1.0 },
      urn: { offsetX: 0, offsetY: 0, scale: 1.0 },
      torch: { offsetX: 0, offsetY: 0, scale: 1.0 },
      campfire: { offsetX: 0, offsetY: 0, scale: 1.0 },
      spikes: { offsetX: 0, offsetY: 0, scale: 1.0 },
      stalactite: { offsetX: 0, offsetY: 0, scale: 1.0 },
      spore_shroom: { offsetX: 0, offsetY: 0, scale: 1.0 },
      acid_vent: { offsetX: 0, offsetY: 0, scale: 1.0 }
    };
    try {
      const saved = localStorage.getItem('tempest_sprite_offsets');
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return defaults;
  }

  saveOffsets() {
    try {
      localStorage.setItem('tempest_sprite_offsets', JSON.stringify(this.offsets));
    } catch (e) {}
  }

  getOffset(entityKey, animKey = null, frameIndex = null) {
    if (animKey !== null && frameIndex !== null && frameIndex !== undefined) {
      const frameKey = `${entityKey}_${animKey}_f${frameIndex}`;
      if (this.offsets[frameKey]) return this.offsets[frameKey];
    }
    if (animKey !== null && this.offsets[`${entityKey}_${animKey}`]) {
      return this.offsets[`${entityKey}_${animKey}`];
    }
    if (this.offsets[entityKey]) {
      return this.offsets[entityKey];
    }
    return { offsetX: 0, offsetY: 0, scale: 1.0 };
  }

  setOffset(entityKey, animKey, frameIndex, offsetX, offsetY, scale = 1.0, scope = 'frame') {
    let key = entityKey;
    if (scope === 'frame' && animKey && frameIndex !== null && frameIndex !== undefined) {
      key = `${entityKey}_${animKey}_f${frameIndex}`;
    } else if (scope === 'clip' && animKey) {
      key = `${entityKey}_${animKey}`;
    }
    this.offsets[key] = {
      offsetX: Math.round(offsetX),
      offsetY: Math.round(offsetY),
      scale: parseFloat(scale.toFixed(2))
    };
    this.saveOffsets();
  }

  copyFrameToAll(entityKey, animKey, totalFrames, sourceFrameIdx) {
    const src = this.getOffset(entityKey, animKey, sourceFrameIdx);
    for (let f = 0; f < totalFrames; f++) {
      this.offsets[`${entityKey}_${animKey}_f${f}`] = { ...src };
    }
    this.saveOffsets();
  }

  resetOffset(entityKey, animKey = null, frameIndex = null, scope = 'frame') {
    let key = entityKey;
    if (scope === 'frame' && animKey && frameIndex !== null && frameIndex !== undefined) {
      key = `${entityKey}_${animKey}_f${frameIndex}`;
      delete this.offsets[key];
    } else if (scope === 'clip' && animKey) {
      key = `${entityKey}_${animKey}`;
      delete this.offsets[key];
      // Also delete frame overrides for this clip
      for (const k of Object.keys(this.offsets)) {
        if (k.startsWith(`${entityKey}_${animKey}_f`)) delete this.offsets[k];
      }
    } else {
      this.offsets[entityKey] = { offsetX: 0, offsetY: 0, scale: 1.0 };
      // Delete all clip and frame overrides
      for (const k of Object.keys(this.offsets)) {
        if (k.startsWith(`${entityKey}_`)) delete this.offsets[k];
      }
    }
    this.saveOffsets();
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
    }

    // 4. Load Environment Modular Tiles (Procedural Pixel-Perfect 32x32 Tiles)
    await this.generateModularTileBitmaps();

    // 5. Load Environment Interactive Props
    const propAnims = {
      magisteel: { idle: 4, break: 4 },
      hipokute: { bloom: 4 },
      monolith: { activate: 4 },
      chest: { open: 4 },
      urn: { break: 4 },
      torch: { burn: 4 },
      campfire: { burn: 4 }
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

    // 6. Load Dimensional Warp Gate Portal
    const portalAnims = {
      idle: 4,
      activate: 4
    };
    for (const [animKey, frameCount] of Object.entries(portalAnims)) {
      for (let i = 0; i < frameCount; i++) {
        const pngPath = `/public/sprites/portal/${animKey}_${i}.png`;
        try {
          const img = new Image();
          img.src = pngPath;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          if (img.complete && img.naturalWidth > 0) {
            const bitmap = await createImageBitmap(img);
            this.cache.set(`portal_${animKey}_${i}`, bitmap);
          }
        } catch (e) {}
      }
    }

    // 7. Load Environment Hazards & Traps
    const hazardAnims = {
      spikes: { trigger: 4 },
      stalactite: { drop: 4 },
      spore_shroom: { spore: 4 },
      acid_vent: { bubble: 4 }
    };
    for (const [hazKey, anims] of Object.entries(hazardAnims)) {
      for (const [animKey, frameCount] of Object.entries(anims)) {
        for (let i = 0; i < frameCount; i++) {
          const prefix = hazKey === 'spikes' ? 'spikes_trigger' : hazKey === 'stalactite' ? 'stalactite_drop' : hazKey === 'spore_shroom' ? 'spore_shroom' : 'acid_vent';
          const pngPath = `/public/sprites/hazards/${prefix}_${i}.png`;
          try {
            const img = new Image();
            img.src = pngPath;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
            if (img.complete && img.naturalWidth > 0) {
              const bitmap = await createImageBitmap(img);
              this.cache.set(`${hazKey}_${animKey}_${i}`, bitmap);
            }
          } catch (e) {}
        }
      }
    }

    // 8. Load Multi-Layer Parallax Backgrounds
    const bgLayers = ['bg_cavern_far', 'bg_cavern_mid', 'bg_cavern_near'];
    for (const bgName of bgLayers) {
      const pngPath = `/public/sprites/backgrounds/${bgName}.png`;
      try {
        const img = new Image();
        img.src = pngPath;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        if (img.complete && img.naturalWidth > 0) {
          const bitmap = await createImageBitmap(img);
          this.cache.set(`background_${bgName}`, bitmap);
        }
      } catch (e) {}
    }

    console.log('[SpriteParser] Loaded', this.cache.size, 'total pixel art sprites (Characters, Environment & Backgrounds)');
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

    const directKey = `${entityKey}_${animKey}_${frameIndex}`;
    if (this.cache.has(directKey)) return this.cache.get(directKey);

    // Fallback aliases for props/hazards
    if (entityKey === 'hipokute') {
      return this.cache.get(`hipokute_bloom_${frameIndex % 4}`) || this.cache.get('hipokute_bloom_0');
    }
    if (entityKey === 'monolith') {
      return this.cache.get(`monolith_activate_${frameIndex % 4}`) || this.cache.get('monolith_activate_0');
    }
    if (entityKey === 'chest') {
      return this.cache.get(`chest_open_${frameIndex % 4}`) || this.cache.get('chest_open_0');
    }
    if (entityKey === 'urn') {
      return this.cache.get(`urn_break_${frameIndex % 4}`) || this.cache.get('urn_break_0');
    }
    if (entityKey === 'torch') {
      return this.cache.get(`torch_burn_${frameIndex % 4}`) || this.cache.get('torch_burn_0');
    }
    if (entityKey === 'campfire') {
      return this.cache.get(`campfire_burn_${frameIndex % 4}`) || this.cache.get('campfire_burn_0');
    }
    if (entityKey === 'spikes') {
      return this.cache.get(`spikes_trigger_${frameIndex % 4}`) || this.cache.get('spikes_trigger_0');
    }
    if (entityKey === 'stalactite') {
      return this.cache.get(`stalactite_drop_${frameIndex % 4}`) || this.cache.get('stalactite_drop_0');
    }
    if (entityKey === 'spore_shroom') {
      return this.cache.get(`spore_shroom_spore_${frameIndex % 4}`) || this.cache.get('spore_shroom_spore_0');
    }
    if (entityKey === 'acid_vent') {
      return this.cache.get(`acid_vent_bubble_${frameIndex % 4}`) || this.cache.get('acid_vent_bubble_0');
    }
    if (entityKey === 'portal') {
      return this.cache.get(`portal_idle_${frameIndex % 4}`) || this.cache.get('portal_idle_0');
    }

    // Default frame 0 fallback
    return this.cache.get(`${entityKey}_${animKey}_0`) || this.cache.get(`${entityKey}_idle_0`);
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

  async generateModularTileBitmaps() {
    const size = 32;

    const makeCanvas = (drawFn) => {
      const cvs = document.createElement('canvas');
      cvs.width = size;
      cvs.height = size;
      const ctx = cvs.getContext('2d');
      drawFn(ctx, size);
      return createImageBitmap(cvs);
    };

    // Helper stone brick backdrop
    const drawStoneBase = (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, size, size);

      // Stone brick lines
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 16, size, 2);
      ctx.fillRect(16, 0, 2, 16);
      ctx.fillRect(8, 18, 2, 14);

      // Highlight bevels
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, size, 1);
      ctx.fillRect(0, 17, size, 1);

      // Dark shadow mortar
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 15, size, 1);
      ctx.fillRect(0, 31, size, 1);
    };

    // 1. Ground Mid (Top surface moss + stone base)
    this.cache.set('tiles_ground_mid_0', await makeCanvas((ctx) => {
      drawStoneBase(ctx);
      // Lush green moss carpet
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, size, 7);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, 0, size, 5);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 0, size, 3);
      ctx.fillStyle = '#86efac';
      for (let x = 1; x < size; x += 3) ctx.fillRect(x, 0, 1, 2);
      // Hanging moss teeth
      ctx.fillStyle = '#15803d';
      ctx.fillRect(4, 7, 3, 3);
      ctx.fillRect(14, 7, 2, 4);
      ctx.fillRect(24, 7, 3, 3);
    }));

    // 2. Ground Left (Cliff edge left + moss corner)
    this.cache.set('tiles_ground_left_0', await makeCanvas((ctx) => {
      drawStoneBase(ctx);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, 0, size, 5);
      ctx.fillRect(0, 0, 5, 14); // Curve down left edge
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(1, 0, size - 1, 3);
      ctx.fillRect(0, 1, 3, 12);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(0, 0, 3, 3);
      // Hanging vine
      ctx.fillStyle = '#15803d';
      ctx.fillRect(1, 14, 2, 6);
      ctx.fillRect(2, 20, 2, 4);
    }));

    // 3. Ground Right (Cliff edge right + moss corner)
    this.cache.set('tiles_ground_right_0', await makeCanvas((ctx) => {
      drawStoneBase(ctx);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, 0, size, 5);
      ctx.fillRect(size - 5, 0, 5, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 0, size - 1, 3);
      ctx.fillRect(size - 3, 1, 3, 12);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(size - 3, 0, 3, 3);
      // Hanging vine
      ctx.fillStyle = '#15803d';
      ctx.fillRect(size - 3, 14, 2, 6);
      ctx.fillRect(size - 4, 20, 2, 4);
    }));

    // 4. Platform Mid (Floating moss ledge)
    this.cache.set('tiles_plat_mid_0', await makeCanvas((ctx) => {
      // Stone bridge slab
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, size, 14);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 12, size, 3);
      // Moss top
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, size, 5);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 0, size, 3);
      ctx.fillStyle = '#86efac';
      for (let x = 2; x < size; x += 4) ctx.fillRect(x, 0, 1, 2);
      // Hanging roots
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, 14, 2, 6);
      ctx.fillRect(20, 14, 2, 8);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(12, 14, 2, 5);
    }));

    // 5. Platform Left (Floating ledge left rounded bracket)
    this.cache.set('tiles_plat_left_0', await makeCanvas((ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, 0, size - 2, 14);
      ctx.fillRect(0, 2, 2, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, 12, size - 2, 3);
      // Moss cap
      ctx.fillStyle = '#15803d';
      ctx.fillRect(2, 0, size - 2, 5);
      ctx.fillRect(0, 1, 3, 4);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(1, 0, size - 1, 3);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(1, 0, 2, 2);
      // Supporting corner bracket
      ctx.fillStyle = '#334155';
      ctx.fillRect(2, 14, 4, 4);
      ctx.fillRect(6, 14, 2, 2);
    }));

    // 6. Platform Right (Floating ledge right rounded bracket)
    this.cache.set('tiles_plat_right_0', await makeCanvas((ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, size - 2, 14);
      ctx.fillRect(size - 2, 2, 2, 10);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 12, size - 2, 3);
      // Moss cap
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, size - 2, 5);
      ctx.fillRect(size - 3, 1, 3, 4);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 0, size - 1, 3);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(size - 3, 0, 2, 2);
      // Supporting corner bracket
      ctx.fillStyle = '#334155';
      ctx.fillRect(size - 6, 14, 4, 4);
      ctx.fillRect(size - 8, 14, 2, 2);
    }));

    // 7. Rock Core (Deep underground solid stone with magicule mineral flecks)
    this.cache.set('tiles_rock_core_0', await makeCanvas((ctx) => {
      drawStoneBase(ctx);
      // Glowing blue magicule specks
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(6, 6, 2, 2);
      ctx.fillRect(22, 22, 2, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(7, 7, 1, 1);
      ctx.fillRect(23, 23, 1, 1);
    }));

    // 8. Wall Left (Vertical left cavern border)
    this.cache.set('tiles_wall_left_0', await makeCanvas((ctx) => {
      drawStoneBase(ctx);
      // Right edge vertical shadow
      ctx.fillStyle = '#020617';
      ctx.fillRect(size - 2, 0, 2, size);
      // Moss patches on face
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(size - 5, 8, 3, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(size - 4, 10, 2, 6);
    }));

    // 9. Wall Right (Vertical right cavern border)
    this.cache.set('tiles_wall_right_0', await makeCanvas((ctx) => {
      drawStoneBase(ctx);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 2, size);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(2, 8, 3, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(2, 10, 2, 6);
    }));

    // 10. Ceiling (Hanging cavern stalactites and roots)
    this.cache.set('tiles_ceiling_0', await makeCanvas((ctx) => {
      drawStoneBase(ctx);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 26, size, 6);
      // Hanging rock stalactite spikes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(4, 26);
      ctx.lineTo(8, 32);
      ctx.lineTo(12, 26);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(18, 26);
      ctx.lineTo(24, 32);
      ctx.lineTo(30, 26);
      ctx.fill();
      // Hanging green moss/roots
      ctx.fillStyle = '#15803d';
      ctx.fillRect(13, 26, 2, 5);
      ctx.fillRect(16, 26, 1, 4);
    }));
  }
}
