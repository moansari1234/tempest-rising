import { CONSTANTS } from '../data/constants.js';

export class LevelDesigner {
  constructor() {
    this.tileSize = CONSTANTS.TILE_SIZE * 2; // 32px
    this.viewportWidthTiles = Math.floor(CONSTANTS.NATIVE_WIDTH / this.tileSize); // 30 tiles
    this.viewportHeightTiles = Math.floor(CONSTANTS.NATIVE_HEIGHT / this.tileSize); // 18 tiles
  }

  generateStage(stageIndex = 1, playerStats = { level: 1, atk: 10, def: 8, maxHp: 100 }) {
    const isBossStage = stageIndex % 3 === 0;
    const stageWidth = isBossStage ? 36 : Math.min(60, 36 + (stageIndex - 1) * 6);
    const stageHeight = 18;
    const floorRow = 15;

    // Initialize blank grid filled with sky '.' and border walls '#'
    const grid = Array.from({ length: stageHeight }, () => Array(stageWidth).fill('.'));

    // 1. Build Perimeter Ceiling & Bedrock Floor
    for (let x = 0; x < stageWidth; x++) {
      grid[0][x] = '#';
      grid[floorRow + 1][x] = '#';
      grid[floorRow + 2][x] = '#';
    }

    // Border Left Wall
    for (let y = 0; y < stageHeight; y++) {
      grid[y][0] = '#';
    }

    // Border Right Wall (with exit portal on rows 14-15)
    for (let y = 0; y < stageHeight; y++) {
      if (y === floorRow || y === floorRow - 1) {
        grid[y][stageWidth - 1] = isBossStage ? '#' : '>';
      } else {
        grid[y][stageWidth - 1] = '#';
      }
    }

    const enemySpawns = [];
    const platformNodes = [];

    if (isBossStage) {
      // === BOSS GLADIATORIAL ARENA ===
      for (let x = 1; x < stageWidth - 1; x++) {
        grid[floorRow][x] = '#';
      }

      // Left combat vantage ledge
      this.placePlatform(grid, 4, 10, 6);
      // Right combat vantage ledge
      this.placePlatform(grid, stageWidth - 10, 10, 6);
      // Upper central high dodge ledge
      this.placePlatform(grid, Math.floor(stageWidth / 2) - 4, 7, 8);

      // Boss Spawn
      enemySpawns.push({
        type: 'boss_serpent',
        x: (stageWidth - 10) * this.tileSize,
        y: (floorRow - 3) * this.tileSize
      });

      const spawns = [
        ...enemySpawns,
        { type: 'monolith', x: 2 * this.tileSize, y: (floorRow - 1) * this.tileSize },
        { type: 'torch', x: 6 * this.tileSize, y: 6 * this.tileSize },
        { type: 'torch', x: (stageWidth - 7) * this.tileSize, y: 6 * this.tileSize },
        { type: 'campfire', x: 3 * this.tileSize, y: (floorRow - 1) * this.tileSize },
        { type: 'chest', x: Math.floor(stageWidth / 2) * this.tileSize, y: 6 * this.tileSize }
      ];

      return {
        width: stageWidth,
        height: stageHeight,
        layout: grid.map(row => row.join('')),
        spawns: spawns,
        name: `Floor ${Math.ceil(stageIndex / 3)}-Boss: Tempest Lair`,
        next: isBossStage ? `chapter${Math.ceil(stageIndex / 3) + 1}_intro` : null
      };
    }

    // === PROCEDURAL PLATFORMING & COMBAT STAGE ===
    let currentX = 1;
    const startZoneWidth = 8;
    
    // Start Zone
    for (let x = 1; x <= startZoneWidth; x++) {
      grid[floorRow][x] = '#';
    }
    currentX += startZoneWidth;

    while (currentX < stageWidth - 6) {
      const remainingWidth = stageWidth - 6 - currentX;
      
      if (remainingWidth >= 12 && Math.random() > 0.3) {
        // Combat Arena Segment
        const arenaWidth = Math.min(remainingWidth, 12 + Math.floor(Math.random() * 4));
        for (let x = currentX; x < currentX + arenaWidth; x++) {
          grid[floorRow][x] = '#';
        }

        const platY = floorRow - 3 - Math.floor(Math.random() * 2);
        const platW = 4 + Math.floor(Math.random() * 3);
        const platX = currentX + Math.floor((arenaWidth - platW) / 2);
        this.placePlatform(grid, platX, platY, platW);
        platformNodes.push({ x: platX, y: platY, w: platW });

        // Add upper archer ledge
        if (stageIndex >= 1) {
          const highY = platY - 3;
          if (highY > 3) {
            this.placePlatform(grid, platX + 1, highY, 3);
            enemySpawns.push({
              type: 'goblin_archer',
              x: (platX + 2) * this.tileSize,
              y: (highY - 1) * this.tileSize
            });
          }
        }

        // Spawn Melee Goblins
        const numEnemies = Math.min(3, 1 + Math.floor(playerStats.level / 2));
        for (let i = 0; i < numEnemies; i++) {
          const spawnX = (currentX + 2 + i * 3) * this.tileSize;
          const spawnY = (floorRow - 1) * this.tileSize;
          enemySpawns.push({
            type: 'goblin',
            x: spawnX,
            y: spawnY
          });
        }

        currentX += arenaWidth;
      } else if (remainingWidth >= 6) {
        // Pit Gap with Stepping Stones
        const gapWidth = Math.min(remainingWidth, 3 + Math.floor(Math.random() * 2));
        const stepPlatformY = floorRow - 2;
        const stepPlatformW = 2;
        const stepPlatformX = currentX + Math.floor((gapWidth - stepPlatformW) / 2);

        this.placePlatform(grid, stepPlatformX, stepPlatformY, stepPlatformW);
        currentX += gapWidth;
      } else {
        for (let x = currentX; x < stageWidth - 1; x++) {
          grid[floorRow][x] = '#';
        }
        currentX = stageWidth - 1;
      }
    }

    // Solid Exit ground
    for (let x = stageWidth - 6; x < stageWidth; x++) {
      grid[floorRow][x] = '#';
    }

    // --- Collect All Spawns (Enemies + Props + Hazards) ---
    const spawns = [...enemySpawns];

    // Start Campfire & Monolith Shrine
    spawns.push({ type: 'campfire', x: 2.5 * this.tileSize, y: (floorRow - 1) * this.tileSize });
    spawns.push({ type: 'monolith', x: 6 * this.tileSize, y: (floorRow - 1) * this.tileSize });

    // Torches along ceiling/walls
    for (let tx = 8; tx < stageWidth - 6; tx += 9) {
      spawns.push({ type: 'torch', x: tx * this.tileSize, y: 5 * this.tileSize });
    }

    // Magisteel Ore Veins
    spawns.push({ type: 'magisteel', x: 8 * this.tileSize, y: (floorRow - 1) * this.tileSize });
    spawns.push({ type: 'magisteel', x: Math.floor(stageWidth * 0.55) * this.tileSize, y: (floorRow - 1) * this.tileSize });

    // Hipokute Lotus Flowers
    spawns.push({ type: 'hipokute', x: 10 * this.tileSize, y: (floorRow - 1) * this.tileSize });
    spawns.push({ type: 'hipokute', x: Math.floor(stageWidth * 0.75) * this.tileSize, y: (floorRow - 1) * this.tileSize });

    // Clay Urns
    spawns.push({ type: 'urn', x: 14 * this.tileSize, y: (floorRow - 1) * this.tileSize });
    spawns.push({ type: 'urn', x: (stageWidth - 8) * this.tileSize, y: (floorRow - 1) * this.tileSize });

    // Gilded Treasure Chest
    if (platformNodes.length > 0) {
      const topPlat = platformNodes[0];
      spawns.push({ type: 'chest', x: (topPlat.x + 1) * this.tileSize, y: (topPlat.y - 1) * this.tileSize });
      if (platformNodes.length > 1) {
        const p2 = platformNodes[1];
        spawns.push({ type: 'hipokute', x: (p2.x + 1) * this.tileSize, y: (p2.y - 1) * this.tileSize });
        spawns.push({ type: 'magisteel', x: (p2.x + p2.w - 1) * this.tileSize, y: (p2.y - 1) * this.tileSize });
      }
    } else {
      spawns.push({ type: 'chest', x: Math.floor(stageWidth * 0.6) * this.tileSize, y: (floorRow - 1) * this.tileSize });
    }

    // Subterranean Traps & Hazards
    spawns.push({ type: 'spikes', x: 18 * this.tileSize, y: (floorRow - 1) * this.tileSize });
    spawns.push({ type: 'spikes', x: Math.floor(stageWidth * 0.65) * this.tileSize, y: (floorRow - 1) * this.tileSize });

    spawns.push({ type: 'stalactite', x: 15 * this.tileSize, y: 1 * this.tileSize });
    spawns.push({ type: 'stalactite', x: Math.floor(stageWidth * 0.5) * this.tileSize, y: 1 * this.tileSize });
    spawns.push({ type: 'stalactite', x: Math.floor(stageWidth * 0.8) * this.tileSize, y: 1 * this.tileSize });

    spawns.push({ type: 'spore_shroom', x: 22 * this.tileSize, y: (floorRow - 1) * this.tileSize });
    spawns.push({ type: 'acid_vent', x: Math.floor(stageWidth * 0.45) * this.tileSize, y: (floorRow - 1) * this.tileSize });

    return {
      width: stageWidth,
      height: stageHeight,
      layout: grid.map(row => row.join('')),
      spawns: spawns,
      name: `Floor ${Math.ceil(stageIndex / 3)}-${(stageIndex - 1) % 3 + 1}: Whispering Caverns`,
      next: isBossStage ? null : `stage_${stageIndex + 1}`
    };
  }

  placePlatform(grid, startX, rowY, width) {
    if (rowY < 1 || rowY >= grid.length) return;
    for (let x = startX; x < startX + width; x++) {
      if (x > 0 && x < grid[0].length - 1) {
        grid[rowY][x] = '#';
      }
    }
  }
}
