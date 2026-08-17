import { CONSTANTS } from '../data/constants.js';
import { Levels } from '../data/levels.js';
import { LevelDesigner } from '../level_gen/LevelDesigner.js';
import { createGoblin, createGoblinBrawler } from '../prefabs/GoblinPrefab.js';

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

    if (typeof levelKey === 'string' && levelKey.startsWith('stage_')) {
      const idx = parseInt(levelKey.replace('stage_', ''), 10) || 1;
      this.currentStageIndex = idx;
      levelData = this.designer.generateStage(idx, playerStats);
    } else if (Levels[levelKey]) {
      levelData = Levels[levelKey];
    } else {
      // Default to procedural level generation
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
      } else if (spawn.type === 'goblin_brawler') {
        createGoblinBrawler(world, spawn.x, spawn.y);
      } else if (spawn.type === 'boss_serpent') {
        import('../prefabs/BossPrefab.js').then(module => {
          module.createTempestSerpent(world, spawn.x, spawn.y);
        }).catch(() => {});
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

    const tileBitmap = spriteParser.getBitmap('tiles', 'ground', 0);
    if (!tileBitmap) return;

    // Viewport culling bounds
    const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endCol = Math.min(this.width - 1, startCol + Math.floor(camera.viewportWidth / (camera.zoom || 1.0) / this.tileSize) + 2);
    const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endRow = Math.min(this.height - 1, startRow + Math.floor(camera.viewportHeight / (camera.zoom || 1.0) / this.tileSize) + 2);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tile = this.currentLevel[r][c];
        if (tile === '#') {
          ctx.drawImage(
            tileBitmap,
            c * this.tileSize,
            r * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        } else if (tile === '>' || tile === '<') {
          // Render glowing portal exit gateway
          ctx.save();
          const now = performance.now();
          const pulse = Math.sin(now / 150) * 0.3 + 0.7;
          
          ctx.fillStyle = `rgba(56, 189, 248, ${0.35 * pulse})`;
          ctx.fillRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
          
          ctx.strokeStyle = `rgba(165, 243, 252, ${pulse})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);

          // Swirling portal center icon
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(
            c * this.tileSize + this.tileSize / 2, 
            r * this.tileSize + this.tileSize / 2, 
            4 + Math.sin(now / 100) * 2, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }
}
