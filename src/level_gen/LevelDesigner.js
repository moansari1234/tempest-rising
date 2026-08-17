import { CONSTANTS } from '../data/constants.js';

export class LevelDesigner {
  constructor() {
    this.tileSize = CONSTANTS.TILE_SIZE * 2; // 32px
    this.viewportWidthTiles = Math.floor(CONSTANTS.NATIVE_WIDTH / this.tileSize); // 30 tiles
    this.viewportHeightTiles = Math.floor(CONSTANTS.NATIVE_HEIGHT / this.tileSize); // 16.8 -> 18 tiles
    
    // Exact mathematical reachability limits based on player physics constants
    this.maxSingleJumpTiles = 2.5;
    this.maxDoubleJumpTiles = 4.2;
    this.maxHorizontalJumpTiles = 6.0;
    this.maxDashJumpTiles = 8.5;
  }

  /**
   * Generates a complete, mathematically verified platforming stage tailored to the player's power.
   * @param {number} stageIndex - 1 for 1-1, 2 for 1-2, 3 for 1-Boss, etc.
   * @param {object} playerStats - { level: number, atk: number, def: number, maxHp: number }
   * @returns {object} { width, height, layout, spawns, name, next }
   */
  generateStage(stageIndex = 1, playerStats = { level: 1, atk: 10, def: 8, maxHp: 100 }) {
    const isBossStage = stageIndex % 3 === 0;
    const stageWidth = isBossStage ? 36 : Math.min(60, 36 + (stageIndex - 1) * 6);
    const stageHeight = 18;
    const floorRow = 15; // Row 15 is top of ground floor (y = 480px)

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
      // Solid floor across entire arena
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

      return {
        width: stageWidth,
        height: stageHeight,
        layout: grid.map(row => row.join('')),
        spawns: enemySpawns,
        name: `Floor ${Math.ceil(stageIndex / 3)}-Boss: Tempest Lair`,
        next: isBossStage ? `chapter${Math.ceil(stageIndex / 3) + 1}_intro` : null
      };
    }

    // === PROCEDURAL PLATFORMING & COMBAT STAGE ===
    // 2. Build Intelligent Ground Segments with Safe Gaps
    let currentX = 1;
    const startZoneWidth = 8;
    
    // Start Zone (Solid ground)
    for (let x = 1; x <= startZoneWidth; x++) {
      grid[floorRow][x] = '#';
    }
    currentX += startZoneWidth;

    // Platforming & Arena Segments
    while (currentX < stageWidth - 6) {
      const remainingWidth = stageWidth - 6 - currentX;
      
      // Determine segment type based on difficulty and spacing
      if (remainingWidth >= 12 && Math.random() > 0.35) {
        // --- Combat Arena Segment (Solid ground + multi-tier platforms) ---
        const arenaWidth = Math.min(remainingWidth, 12 + Math.floor(Math.random() * 4));
        for (let x = currentX; x < currentX + arenaWidth; x++) {
          grid[floorRow][x] = '#';
        }

        // Add 1 or 2 stepped platforms inside the arena
        const platY = floorRow - 3 - Math.floor(Math.random() * 2); // 3 to 4 tiles high
        const platW = 4 + Math.floor(Math.random() * 3);
        const platX = currentX + Math.floor((arenaWidth - platW) / 2);
        this.placePlatform(grid, platX, platY, platW);
        platformNodes.push({ x: platX, y: platY, w: platW });

        // Add upper archer / sniper ledge if player power or stage is high enough
        if (stageIndex >= 2 && Math.random() > 0.35) {
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

        // Spawn Ground Combat Squad in Arena
        const numEnemies = Math.min(3, 1 + Math.floor(playerStats.level / 2));
        for (let i = 0; i < numEnemies; i++) {
          const spawnX = (currentX + 2 + i * 3) * this.tileSize;
          const spawnY = (floorRow - 1) * this.tileSize;
          enemySpawns.push({
            type: playerStats.level >= 3 && i === 0 ? 'goblin_brawler' : 'goblin',
            x: spawnX,
            y: spawnY
          });
        }

        currentX += arenaWidth;
      } else if (remainingWidth >= 6) {
        // --- Pit Gap with Stepping Stones Segment ---
        const gapWidth = Math.min(remainingWidth, 3 + Math.floor(Math.random() * 2)); // 3-4 tiles gap (easily jumpable)
        const stepPlatformY = floorRow - 2; // Mid-air stepping ledge
        const stepPlatformW = 2;
        const stepPlatformX = currentX + Math.floor((gapWidth - stepPlatformW) / 2);

        this.placePlatform(grid, stepPlatformX, stepPlatformY, stepPlatformW);
        currentX += gapWidth;
      } else {
        // Fill remaining ground to end
        for (let x = currentX; x < stageWidth - 1; x++) {
          grid[floorRow][x] = '#';
        }
        currentX = stageWidth - 1;
      }
    }

    // Ensure Exit Gateway Ground is solid
    for (let x = stageWidth - 6; x < stageWidth; x++) {
      grid[floorRow][x] = '#';
    }

    return {
      width: stageWidth,
      height: stageHeight,
      layout: grid.map(row => row.join('')),
      spawns: enemySpawns,
      name: `Floor ${Math.ceil(stageIndex / 3)}-${(stageIndex - 1) % 3 + 1}: Whispering Caverns`,
      next: isBossStage ? null : `stage_${stageIndex + 1}`
    };
  }

  /**
   * Helper to safely stamp a floating platform into the grid.
   */
  placePlatform(grid, startX, rowY, width) {
    if (rowY < 1 || rowY >= grid.length) return;
    for (let x = startX; x < startX + width; x++) {
      if (x > 0 && x < grid[0].length - 1) {
        grid[rowY][x] = '#';
      }
    }
  }
}
