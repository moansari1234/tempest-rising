import { CONSTANTS } from './data/constants.js';
import { InputManager } from './core/InputManager.js';
import { Camera } from './core/Camera.js';
import { GameStateManager, GameState } from './core/GameStateManager.js';
import { World } from './ecs/World.js';
import { Transform } from './ecs/Components.js';
import { PhysicsSystem } from './ecs/systems/PhysicsSystem.js';
import { AISystem } from './ecs/systems/AISystem.js';
import { CombatSystem } from './ecs/systems/CombatSystem.js';
import { EnvironmentSystem } from './ecs/systems/EnvironmentSystem.js';
import { RenderSystem } from './ecs/systems/RenderSystem.js';
import { UISystem } from './ui/UISystem.js';
import { SpriteParser } from './sprites/SpriteParser.js';
import { createPlayer } from './prefabs/PlayerPrefab.js';
import { LevelManager } from './core/LevelManager.js';
import { XPSystem } from './core/XPSystem.js';
import { AudioManager } from './core/AudioManager.js';
import { GreatSageSystem } from './core/GreatSageSystem.js';
import { TitleSystem } from './core/TitleSystem.js';
import { SettingsManager } from './core/SettingsManager.js';

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
    this.titleSystem = new TitleSystem();
    this.settingsManager = new SettingsManager();
    this.inputManager = new InputManager();
    this.greatSage = new GreatSageSystem();
    this.camera = new Camera(CONSTANTS.NATIVE_WIDTH, CONSTANTS.NATIVE_HEIGHT);
    
    this.levelManager = new LevelManager();
    this.levelManager.loadLevel('chapter1');
    
    this.camera.setLevelBounds(this.levelManager.width * this.levelManager.tileSize, this.levelManager.height * this.levelManager.tileSize);

    this.spriteParser = new SpriteParser();

    // Initialize ECS World
    this.world = new World();
    
    // Register Systems
    this.world.registerSystem(new PhysicsSystem());
    this.world.registerSystem(new AISystem());
    this.world.registerSystem(new CombatSystem());
    this.world.registerSystem(new EnvironmentSystem());
    this.world.registerSystem(new RenderSystem());
    this.world.registerSystem(new UISystem());

    this.titleBgImage = new Image();
    this.titleBgImage.src = '/public/sprites/backgrounds/title_bg.jpg';
    this.titleBgImage.onerror = () => {
      this.titleBgImage.src = 'public/sprites/backgrounds/title_bg.jpg';
    };

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
      titleSystem: this.titleSystem,
      settingsManager: this.settingsManager,
      sage: this.greatSage,
      titleBgImage: this.titleBgImage,
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

    // Load Epic Linear Level 1: Whispering Caverns (175 tiles)
    const playerStats = { level: 1, atk: 10, def: 8, maxHp: 100 };
    this.levelManager.loadLevel('chapter1', playerStats);
    this.camera.setLevelBounds(this.levelManager.width * this.levelManager.tileSize, this.levelManager.height * this.levelManager.tileSize);
    this.levelManager.spawnLevelEntities(this.world);

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
    this.context._frameDt = frameTime;

    // Fixed timestep update for logic/physics
    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
      this.inputManager.update();
    }

    // Render whenever animation frame triggers
    this.render();

    // Clear frame inputs (clicks and key states)
    this.inputManager.endFrame();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const state = this.gameStateManager.getState();
    
    // Toggle Asset Gallery (V)
    if (this.inputManager.isActionJustPressed('viewAssets')) {
        if (state === GameState.ASSETS) {
            this.gameStateManager.setState(this.gameStateManager.previousState || GameState.PLAYING);
        } else if (state === GameState.PLAYING || state === GameState.MENU || state === GameState.PAUSED || state === GameState.ZEN) {
            this.gameStateManager.setState(GameState.ASSETS);
        }
        this.inputManager.consumeAction('viewAssets');
    }

    // Toggle Slime Status Window (Tab / I / B)
    if (this.inputManager.isActionJustPressed('toggleStatus')) {
        if (state === GameState.STATUS) {
            this.gameStateManager.setState(this.gameStateManager.previousState || GameState.PLAYING);
        } else if (state === GameState.PLAYING || state === GameState.PAUSED || state === GameState.ZEN) {
            this.gameStateManager.setState(GameState.STATUS);
        }
        this.inputManager.consumeAction('toggleStatus');
    }

    if (this.inputManager.isActionJustPressed('pause')) {
        if (state === GameState.PLAYING || state === GameState.ZEN) {
            this.gameStateManager.setState(GameState.PAUSED);
        } else if (state === GameState.PAUSED || state === GameState.STATUS || state === GameState.SETTINGS) {
            this.gameStateManager.setState(this.gameStateManager.previousState || GameState.PLAYING);
        } else if (state === GameState.ASSETS) {
            this.gameStateManager.setState(this.gameStateManager.previousState || GameState.PLAYING);
        }
        this.inputManager.consumeAction('pause');
    }
    
    if (state === GameState.PAUSED) {
        if (this.inputManager.isActionJustPressed('quit')) {
            this.gameStateManager.setState(GameState.MENU);
            this.inputManager.consumeAction('quit');
        } else if (this.inputManager.keys['s'] || this.inputManager.keys['S']) {
            this.gameStateManager.setState(GameState.SETTINGS);
            this.inputManager.keys['s'] = false;
            this.inputManager.keys['S'] = false;
        }
    }

    if (state === GameState.PLAYING || state === GameState.ZEN) {
        if (this.context.hitstopTimer > 0) {
            this.context.hitstopTimer -= dt;
            return; 
        }
        this.world.updateLogic(dt, this.context);
        this.greatSage.update(dt, this.context);
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
