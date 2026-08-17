import { Transform, Health, PlayerInput } from '../ecs/Components.js';
import { GameState } from '../core/GameStateManager.js';
import { AssetLibraryEntities } from './asset_library/AssetLibraryState.js';
import { MainMenuView } from './views/MainMenuView.js';
import { HUDView } from './views/HUDView.js';
import { PauseView } from './views/PauseView.js';
import { GameOverView } from './views/GameOverView.js';
import { TransitionView } from './views/TransitionView.js';
import { AssetLibraryView } from './asset_library/AssetLibraryView.js';
import { StatusView } from './views/StatusView.js';
import { PrologueView } from './views/PrologueView.js';
import { ZenSandboxHUD } from './views/ZenSandboxHUD.js';
import { SettingsView } from './views/SettingsView.js';
import { GreatSageToast } from './components/GreatSageToast.js';
import { FloatersManager } from './components/Floaters.js';

export class UISystem {
    constructor() {
        // Sub-view modules
        this.mainMenuView = new MainMenuView();
        this.hudView = new HUDView();
        this.pauseView = new PauseView();
        this.gameOverView = new GameOverView();
        this.transitionView = new TransitionView();
        this.assetLibraryView = new AssetLibraryView();
        this.statusView = new StatusView();
        this.prologueView = new PrologueView();
        this.zenSandboxHUD = new ZenSandboxHUD();
        this.settingsView = new SettingsView();
        this.greatSageToast = new GreatSageToast();
        this.floatersManager = new FloatersManager();

        // Asset Studio State
        this.assetEntityIdx = 0;
        this.assetAnimIdx = 0;
        this.assetFrameIdx = 0;
        this.assetFrameTimer = 0;
        this.assetIsPaused = false;
        this.assetZoom = 1;
        this.assetFacing = 'right';
        this.assetTab = 'editor';
        this.editorScope = 'frame';
        this.showTileBox = true;
        this.showCrosshair = true;
        this.showGroundLine = true;
        this.isDraggingSprite = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragInitialOffX = 0;
        this.dragInitialOffY = 0;
        this.toastMsg = null;
        this.toastTimer = 0;
        this.sidebarScrollOffset = 0;

        // Entity catalog
        this.entitiesList = AssetLibraryEntities;
    }

    update(world, dt, context) {
        const { ctx, canvas, gameStateManager } = context;
        const state = gameStateManager.getState();
        const players = world.queryEntities([Transform, Health, PlayerInput]);
        const playerHealth = players.length > 0 ? world.getComponent(players[0], Health) : null;
        
        ctx.save();
        
        if (state === GameState.MENU) {
            this.mainMenuView.render(ctx, canvas, context);
        } else if (state === GameState.PROLOGUE) {
            this.prologueView.render(ctx, canvas, context, dt);
        } else if (state === GameState.PLAYING) {
            this.hudView.render(ctx, canvas, world, playerHealth, context);
            this.greatSageToast.render(ctx, canvas, context);
        } else if (state === GameState.ZEN) {
            this.hudView.render(ctx, canvas, world, playerHealth, context);
            this.zenSandboxHUD.render(ctx, canvas, world, playerHealth, context);
            this.greatSageToast.render(ctx, canvas, context);
        } else if (state === GameState.PAUSED) {
            this.hudView.render(ctx, canvas, world, playerHealth, context);
            this.pauseView.render(ctx, canvas, context);
        } else if (state === GameState.STATUS) {
            this.hudView.render(ctx, canvas, world, playerHealth, context);
            this.statusView.render(ctx, canvas, world, playerHealth, context, dt);
        } else if (state === GameState.SETTINGS) {
            this.settingsView.render(ctx, canvas, context);
        } else if (state === GameState.GAME_OVER) {
            this.gameOverView.render(ctx, canvas);
        } else if (state === GameState.LEVEL_TRANSITION) {
            this.hudView.render(ctx, canvas, world, playerHealth, context);
            this.transitionView.render(ctx, canvas, context);
        } else if (state === GameState.ASSETS) {
            this.assetLibraryView.render(ctx, canvas, this, context, dt);
        }
        
        this.renderFloaters(ctx, dt, context);
        
        ctx.restore();
    }

    renderFloaters(ctx, dt, context) {
        if (!context.floaterQueue || context.floaterQueue.length === 0) return;
        
        for (let i = context.floaterQueue.length - 1; i >= 0; i--) {
            const floater = context.floaterQueue[i];
            floater.lifetime -= dt;
            floater.y -= 25 * dt; // Float gently upwards
            
            const alpha = Math.max(0, floater.lifetime / (floater.maxLifetime || 1.0));
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = floater.color || '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(floater.text, floater.x, floater.y);
            ctx.restore();

            if (floater.lifetime <= 0) {
                context.floaterQueue.splice(i, 1);
            }
        }
    }
}
