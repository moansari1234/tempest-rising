import { CONSTANTS } from './data/constants.js';
import { InputManager } from './core/InputManager.js';
import { Camera } from './core/Camera.js';
import { GameStateManager, GameState } from './core/GameStateManager.js';
import { World } from './ecs/World.js';
import { Transform } from './ecs/Components.js';
import { PhysicsSystem } from './ecs/systems/PhysicsSystem.js';
import { RenderSystem } from './ecs/systems/RenderSystem.js';
import { CombatSystem } from './ecs/systems/CombatSystem.js';
import { AISystem } from './ecs/systems/AISystem.js';
import { SpriteParser } from './sprites/SpriteParser.js';
import { createPlayer } from './prefabs/PlayerPrefab.js';
import { LevelManager } from './core/LevelManager.js';
import { Levels } from './data/levels.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    
    // Setup canvas native resolution
    this.canvas.width = CONSTANTS.NATIVE_WIDTH;
    this.canvas.height = CONSTANTS.NATIVE_HEIGHT;

    // Initialize core managers
    this.gameStateManager = new GameStateManager();
    this.inputManager = new InputManager();
    this.camera = new Camera(CONSTANTS.NATIVE_WIDTH, CONSTANTS.NATIVE_HEIGHT);
    
    this.levelManager = new LevelManager();
    this.levelManager.loadLevel(Levels.chapter1_start);
    
    this.camera.setLevelBounds(this.levelManager.width * this.levelManager.tileSize, this.levelManager.height * this.levelManager.tileSize);

    this.spriteParser = new SpriteParser();

    // Initialize ECS World
    this.world = new World();
    
    // Register Systems
    this.world.registerSystem(new PhysicsSystem());
    this.world.registerSystem(new AISystem());
    this.world.registerSystem(new CombatSystem());
    this.world.registerSystem(new RenderSystem());

    // Setup Game Context to pass to systems
    this.context = {
      canvas: this.canvas,
      ctx: this.ctx,
      inputManager: this.inputManager,
      camera: this.camera,
      gameStateManager: this.gameStateManager,
      spriteParser: this.spriteParser,
      levelManager: this.levelManager,
      hitstopTimer: 0 // Global Hitstop
    };

    // Timing
    this.lastTime = 0;
    this.accumulator = 0;
    this.timeStep = 1 / 60; // Fixed 60 fps
    
    this.init();
  }

  async init() {
    await this.start();
    
    this.gameStateManager.setState(GameState.PLAYING);

    // Start loop
    requestAnimationFrame((t) => this.loop(t));
  }

  async start() {
    // Pre-parse sprites before starting loop
    await this.spriteParser.init();

    // Create Player using Prefab
    const playerId = createPlayer(this.world, 100, 100);

    // Create Tempest Serpent Boss
    const { createTempestSerpent } = await import('./prefabs/BossPrefab.js');
    createTempestSerpent(this.world, 800, 100); // Spawn further right in the arena

    // Tell camera to follow player
    this.camera.setTarget(this.world.getComponent(playerId, Transform));
  }

  loop(currentTime) {
    // Convert to seconds
    const timeInSeconds = currentTime / 1000;
    
    // Calculate delta time, capped to prevent spiral of death on lag
    let frameTime = timeInSeconds - this.lastTime;
    if (frameTime > 0.25) frameTime = 0.25;
    
    this.lastTime = timeInSeconds;
    this.accumulator += frameTime;

    // Fixed timestep update for logic/physics
    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
    }

    // Camera updates after physics but before render to track correctly
    // We pass frameTime for smooth lerping independent of fixed timestep
    this.camera.update(frameTime);

    // Render happens every animation frame
    this.render();
    
    // Input update happens at the end of the actual frame
    this.inputManager.update();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.gameStateManager.getState() === GameState.PLAYING) {
        this.world.update(dt, this.context);
    }
  }

  render() {
      // The RenderSystem is technically called in update, but we can call it explicitly here 
      // or move RenderSystem out of the fixed timestep loop if we want interpolation later.
      // For Phase 1, we just run the render system directly with frameTime 0
      // since our RenderSystem is registered in the World.
      // Wait, currently World.update calls ALL systems. We should probably separate logic and render.
  }
}

// Separate out update and render systems in World for Phase 1 fix:
World.prototype.updateLogic = function(dt, context) {
    for (const system of this.systems) {
        if (system.constructor.name !== 'RenderSystem') {
            system.update(this, dt, context);
        }
    }
    // Cleanup
    if (this.entitiesToDelete.length > 0) {
      for (const id of this.entitiesToDelete) {
        this.entities.delete(id);
      }
      this.entitiesToDelete = [];
    }
};

World.prototype.render = function(context) {
    for (const system of this.systems) {
        if (system.constructor.name === 'RenderSystem') {
            system.update(this, 0, context);
        }
    }
};

// Override Game update and render
Game.prototype.update = function(dt) {
    if (this.gameStateManager.getState() === GameState.PLAYING) {
        if (this.context.hitstopTimer > 0) {
            this.context.hitstopTimer -= dt;
            // Freeze logic! Don't update the world logic if hitstop is active.
            // But we might want particles or UI to still update later.
            // For now, full freeze:
            return; 
        }
        this.world.updateLogic(dt, this.context);
    }
};

Game.prototype.render = function() {
    this.world.render(this.context);
};

// Start game
window.onload = () => {
  new Game();
};
