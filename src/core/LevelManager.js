import { CONSTANTS } from '../data/constants.js';

export class LevelManager {
  constructor() {
    this.currentLevel = null;
    this.width = 0;
    this.height = 0;
    this.tileSize = CONSTANTS.TILE_SIZE * 2; // e.g. 16 * 2 = 32px scaled visually
  }

  loadLevel(levelData) {
    this.currentLevel = levelData.layout;
    this.width = levelData.width;
    this.height = levelData.height;
    console.log(`[LevelManager] Loaded level: ${this.width}x${this.height}`);
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

  // AABB vs Tilemap collision
  checkCollision(rect) {
    // Check the 4 corners of the rect
    // + a few points along the edges to prevent tunneling if rect > tileSize
    const points = [
      { x: rect.x, y: rect.y }, // Top-Left
      { x: rect.x + rect.w - 1, y: rect.y }, // Top-Right
      { x: rect.x, y: rect.y + rect.h - 1 }, // Bottom-Left
      { x: rect.x + rect.w - 1, y: rect.y + rect.h - 1 }, // Bottom-Right
      // Center points along edges for safety (since sprite is 32 and tile is 32, just corners might suffice, but middle helps)
      { x: rect.x + rect.w / 2, y: rect.y }, // Top-Center
      { x: rect.x + rect.w / 2, y: rect.y + rect.h - 1 }, // Bottom-Center
      { x: rect.x, y: rect.y + rect.h / 2 }, // Left-Center
      { x: rect.x + rect.w - 1, y: rect.y + rect.h / 2 } // Right-Center
    ];

    for (let p of points) {
      if (this.isSolid(p.x, p.y)) {
        return true; // Collision detected
      }
    }
    return false;
  }

  render(ctx, camera, spriteParser) {
    if (!this.currentLevel) return;

    const tileBitmap = spriteParser.getBitmap('tiles', 'ground', 0);
    if (!tileBitmap) return;

    // Viewport culling bounds
    const startCol = Math.floor(camera.x / this.tileSize);
    const endCol = startCol + Math.floor(camera.viewportWidth / camera.zoom / this.tileSize) + 1;
    const startRow = Math.floor(camera.y / this.tileSize);
    const endRow = startRow + Math.floor(camera.viewportHeight / camera.zoom / this.tileSize) + 1;

    for (let r = Math.max(0, startRow); r <= Math.min(this.height - 1, endRow); r++) {
      for (let c = Math.max(0, startCol); c <= Math.min(this.width - 1, endCol); c++) {
        const tile = this.currentLevel[r][c];
        if (tile === '#') {
          ctx.drawImage(
            tileBitmap, 
            c * this.tileSize, 
            r * this.tileSize, 
            this.tileSize, 
            this.tileSize
          );
        }
      }
    }
  }
}
