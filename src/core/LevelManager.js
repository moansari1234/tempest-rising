import { CONSTANTS } from '../data/constants.js';
import { Levels } from '../data/levels.js';
import { LevelDesigner } from '../level_gen/LevelDesigner.js';
import { createGoblin, createGoblinBrawler, createGoblinArcher } from '../prefabs/GoblinPrefab.js';
import {
  createMagisteelOre,
  createHipokuteHerb,
  createTreasureChest,
  createClayUrn,
  createDragonTorch,
  createCampfire,
  createRunicMonolith,
  createFloorSpikes,
  createCeilingStalactite,
  createSporeShroom,
  createAcidVent
} from '../prefabs/PropPrefab.js';

export class LevelManager {
  constructor() {
    this.currentLevelKey = null;
    this.currentLevelData = null;
    this.currentLevel = null;
    this.width = 0;
    this.height = 0;
    this.tileSize = CONSTANTS.TILE_SIZE * 2; // 32px
    this.currentStageIndex = 1;
    this.stageName = 'Floor 1-1: Whispering Caverns';
    this.designer = new LevelDesigner();
  }

  loadLevel(levelKey, playerStats = { level: 1, atk: 10, def: 8, maxHp: 100 }) {
    let levelData = null;

    if (Levels[levelKey]) {
      levelData = Levels[levelKey];
    } else {
      const match = levelKey.match(/stage_(\d+)/);
      if (match) {
        this.currentStageIndex = parseInt(match[1], 10);
      }
      levelData = this.designer.generateStage(this.currentStageIndex, playerStats);
    }

    this.currentLevelKey = levelKey;
    this.currentLevelData = levelData;
    this.currentLevel = levelData.layout;
    this.width = levelData.width;
    this.height = levelData.height;
    this.stageName = levelData.name || `Floor 1-${this.currentStageIndex}`;

    console.log(`[LevelManager] Loaded level: ${this.stageName} (${this.width}x${this.height})`);
    return levelData;
  }

  spawnLevelEntities(world) {
    if (!this.currentLevelData || !this.currentLevelData.spawns) return;

    for (const spawn of this.currentLevelData.spawns) {
      if (spawn.type === 'goblin') {
        createGoblin(world, spawn.x, spawn.y);
      } else if (spawn.type === 'goblin_archer') {
        createGoblinArcher(world, spawn.x, spawn.y);
      } else if (spawn.type === 'boss_serpent') {
        import('../prefabs/BossPrefab.js').then(module => {
          module.createTempestSerpent(world, spawn.x, spawn.y);
        }).catch(() => {});
      } else if (spawn.type === 'magisteel') {
        createMagisteelOre(world, spawn.x, spawn.y);
      } else if (spawn.type === 'hipokute') {
        createHipokuteHerb(world, spawn.x, spawn.y);
      } else if (spawn.type === 'chest') {
        createTreasureChest(world, spawn.x, spawn.y);
      } else if (spawn.type === 'urn') {
        createClayUrn(world, spawn.x, spawn.y);
      } else if (spawn.type === 'torch') {
        createDragonTorch(world, spawn.x, spawn.y);
      } else if (spawn.type === 'campfire') {
        createCampfire(world, spawn.x, spawn.y);
      } else if (spawn.type === 'monolith') {
        createRunicMonolith(world, spawn.x, spawn.y);
      } else if (spawn.type === 'spikes') {
        createFloorSpikes(world, spawn.x, spawn.y);
      } else if (spawn.type === 'stalactite') {
        createCeilingStalactite(world, spawn.x, spawn.y);
      } else if (spawn.type === 'spore_shroom') {
        createSporeShroom(world, spawn.x, spawn.y);
      } else if (spawn.type === 'acid_vent') {
        createAcidVent(world, spawn.x, spawn.y);
      }
    }
  }

  getTileAtPixel(x, y) {
    if (!this.currentLevel) return null;
    
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return '#'; // Treat out of bounds as solid wall
    }

    return this.currentLevel[tileY][tileX];
  }

  isSolid(x, y) {
    const tile = this.getTileAtPixel(x, y);
    return tile === '#';
  }

  checkCollision(rect) {
    const points = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.w - 1, y: rect.y },
      { x: rect.x, y: rect.y + rect.h - 1 },
      { x: rect.x + rect.w - 1, y: rect.y + rect.h - 1 },
      { x: rect.x + rect.w / 2, y: rect.y },
      { x: rect.x + rect.w / 2, y: rect.y + rect.h - 1 },
      { x: rect.x, y: rect.y + rect.h / 2 },
      { x: rect.x + rect.w - 1, y: rect.y + rect.h / 2 }
    ];

    for (const p of points) {
      if (this.isSolid(p.x, p.y)) {
        return true;
      }
    }
    return false;
  }

  checkTransition(rect) {
    if (!this.currentLevelData || !this.currentLevelData.next) return null;
    
    // Check multiple points across the player's bounding box
    const testPoints = [
      { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 },
      { x: rect.x + rect.w, y: rect.y + rect.h / 2 },
      { x: rect.x + rect.w, y: rect.y + rect.h - 4 },
      { x: rect.x + rect.w - 2, y: rect.y + 4 },
      { x: rect.x, y: rect.y + rect.h / 2 }
    ];

    for (const p of testPoints) {
      const tile = this.getTileAtPixel(p.x, p.y);
      if (tile === '>' || tile === '<') {
        return this.currentLevelData.next;
      }
    }

    // Also trigger if touching right portal boundary
    if (rect.x + rect.w >= (this.width - 1.2) * this.tileSize) {
      return this.currentLevelData.next;
    }

    return null;
  }

  render(ctx, camera, spriteParser) {
    if (!this.currentLevel) return;

    // Viewport culling bounds
    const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endCol = Math.min(this.width - 1, startCol + Math.floor(camera.viewportWidth / (camera.zoom || 1.0) / this.tileSize) + 2);
    const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endRow = Math.min(this.height - 1, startRow + Math.floor(camera.viewportHeight / (camera.zoom || 1.0) / this.tileSize) + 2);

    const now = performance.now();
    const portalFrame = Math.floor(now / 150) % 4;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.currentLevel[r][c];
        if (tile === '#') {
          // --- Intelligent 16-Bit Autotiling ---
          let tileKey = 'tiles_ground_mid_0';

          if (r === 0) {
            tileKey = 'tiles_ceiling_0';
          } else if (r >= 16) {
            tileKey = 'tiles_rock_core_0';
          } else if (c === 0) {
            tileKey = 'tiles_wall_left_0';
          } else if (c === this.width - 1) {
            tileKey = 'tiles_wall_right_0';
          } else {
            const up = r > 0 ? this.currentLevel[r - 1][c] === '#' : false;
            const down = r < this.height - 1 ? this.currentLevel[r + 1][c] === '#' : false;
            const left = c > 0 ? this.currentLevel[r][c - 1] === '#' : false;
            const right = c < this.width - 1 ? this.currentLevel[r][c + 1] === '#' : false;

            if (!up && !down) {
              // Floating 1-tile ledge
              if (!left) tileKey = 'tiles_plat_left_0';
              else if (!right) tileKey = 'tiles_plat_right_0';
              else tileKey = 'tiles_plat_mid_0';
            } else if (!up && down) {
              // Top ground surface with lush moss
              if (!left) tileKey = 'tiles_ground_left_0';
              else if (!right) tileKey = 'tiles_ground_right_0';
              else tileKey = 'tiles_ground_mid_0';
            } else if (up && !down) {
              // Hanging cavern ceiling
              tileKey = 'tiles_ceiling_0';
            } else if (up && down) {
              // Deep core or vertical wall
              if (!left) tileKey = 'tiles_wall_left_0';
              else if (!right) tileKey = 'tiles_wall_right_0';
              else tileKey = 'tiles_rock_core_0';
            }
          }

          const bmp = spriteParser.cache.get(tileKey) || spriteParser.getBitmap('tiles', 'ground', 0);
          if (bmp) {
            ctx.drawImage(bmp, c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
          }
        } else if (tile === '>' || tile === '<') {
          // --- Render Dimensional Dragon Warp Gate ---
          const portalBmp = spriteParser.cache.get(`portal_idle_${portalFrame}`) || spriteParser.cache.get(`portal_activate_${portalFrame}`);
          if (portalBmp) {
            ctx.save();
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12;
            ctx.drawImage(
              portalBmp,
              c * this.tileSize - 8,
              (r - 1) * this.tileSize,
              this.tileSize + 16,
              this.tileSize * 2
            );
            ctx.restore();
          } else {
            // Fallback glowing gateway
            ctx.save();
            const pulse = Math.sin(now / 150) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * pulse})`;
            ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
            ctx.strokeStyle = `rgba(165, 243, 252, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
            ctx.restore();
          }
        }
      }
    }
  }
}
