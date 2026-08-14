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
import { UISystem } from './ui/UISystem.js';
import { XPSystem } from './core/XPSystem.js';
import { AudioManager } from './core/AudioManager.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    
    // Setup canvas native resolution
    this.canvas.width = CONSTANTS.NATIVE_WIDTH;
    this.canvas.height = CONSTANTS.NATIVE_HEIGHT;

    // Initialize core managers
    this.gameStateManager = new GameStateManager();
    this.audio = new AudioManager();
    this.xpSystem = new XPSystem();
    this.inputManager = new InputManager();
    this.camera = new Camera(CONSTANTS.NATIVE_WIDTH, CONSTANTS.NATIVE_HEIGHT);
    
    this.levelManager = new LevelManager();
    this.levelManager.loadLevel('chapter1_intro');
    
    this.camera.setLevelBounds(this.levelManager.width * this.levelManager.tileSize, this.levelManager.height * this.levelManager.tileSize);

    this.spriteParser = new SpriteParser();

    // Initialize ECS World
    this.world = new World();
    
    // Register Systems
    this.world.registerSystem(new PhysicsSystem());
    this.world.registerSystem(new AISystem());
    this.world.registerSystem(new CombatSystem());
    this.world.registerSystem(new RenderSystem());
    this.world.registerSystem(new UISystem());

    // Setup Game Context to pass to systems
    this.context = {
      canvas: this.canvas,
      ctx: this.ctx,
      inputManager: this.inputManager,
      camera: this.camera,
      gameStateManager: this.gameStateManager,
      spriteParser: this.spriteParser,
      levelManager: this.levelManager,
      audio: this.audio,
      xpSystem: this.xpSystem,
      floaterQueue: [],
      world: this.world,
      hitstopTimer: 0 // Global Hitstop
    };

    // Timing
    this.lastTime = 0;
    this.accumulator = 0;
    this.timeStep = 1 / 60; // Fixed 60 fps
    
    this.init();
  }

  async init() {
    await this.audio.init();
    await this.start();
    
    this.gameStateManager.setState(GameState.MENU);

    // Start loop
    requestAnimationFrame((t) => this.loop(t));
  }

  async start() {
    // Pre-parse sprites before starting loop
    await this.spriteParser.init();

    // Create Player using Prefab
    const playerId = createPlayer(this.world, 80, 420);

    // Create a Goblin for chapter1_intro
    const { createGoblin } = await import('./prefabs/GoblinPrefab.js');
    createGoblin(this.world, 450, 420);
    createGoblin(this.world, 750, 420);

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

    // Pass real frame time for animation updates in RenderSystem
    this.context._frameDt = frameTime;

    // Render happens every animation frame
    this.render();
    
    // Input update happens at the end of the actual frame
    this.inputManager.update();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const state = this.gameStateManager.getState();
    
    if (this.inputManager.isActionJustPressed('pause')) {
        if (state === GameState.PLAYING) {
            this.gameStateManager.setState(GameState.PAUSED);
        } else if (state === GameState.PAUSED) {
            this.gameStateManager.setState(GameState.PLAYING);
        }
        this.inputManager.consumeAction('pause');
    }
    
    if (state === GameState.PAUSED && this.inputManager.isActionJustPressed('quit')) {
        this.gameStateManager.setState(GameState.MENU);
        this.inputManager.consumeAction('quit');
    }

    if (state === GameState.PLAYING) {
        if (this.context.hitstopTimer > 0) {
            this.context.hitstopTimer -= dt;
            return; 
        }
        this.world.updateLogic(dt, this.context);
    }
  }

  render() {
      this.world.render(this.context);
  }
}


// Start game
window.onload = () => {
  new Game();
};
