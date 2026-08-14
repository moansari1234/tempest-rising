import { Health, AI, PlayerInput, Transform } from '../ecs/Components.js';
import { GameState } from '../core/GameStateManager.js';

export class UISystem {
    update(world, dt, context) {
        const { ctx, canvas, gameStateManager } = context;
        const state = gameStateManager.getState();
        const players = world.queryEntities([Transform, Health, PlayerInput]);
        const playerHealth = players.length > 0 ? world.getComponent(players[0], Health) : null;
        
        ctx.save();
        
        if (state === GameState.MENU) {
            this.renderMenu(ctx, canvas, context);
        } else if (state === GameState.PLAYING) {
            this.renderHUD(ctx, canvas, world, playerHealth, context);
        } else if (state === GameState.PAUSED) {
            this.renderHUD(ctx, canvas, world, playerHealth, context);
            this.renderPauseMenu(ctx, canvas);
        } else if (state === GameState.GAME_OVER) {
            this.renderGameOver(ctx, canvas);
        } else if (state === GameState.LEVEL_TRANSITION) {
            this.renderLevelTransition(ctx, canvas, context);
        }
        
        this.renderFloaters(ctx, dt, context);
        
        ctx.restore();
    }
    
    renderMenu(ctx, canvas, context) {
        ctx.fillStyle = '#050A10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TENSEI SLIME: TEMPEST RISING', canvas.width / 2, canvas.height / 3);
        
        ctx.font = '16px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('A Slime\'s Journey to Power', canvas.width / 2, canvas.height / 3 + 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px monospace';
        ctx.fillText('[NEW GAME] (Press Z)', canvas.width / 2, canvas.height / 2 + 20);
        
        if (localStorage.getItem('tempest_save_boss_defeated') === 'true') {
            ctx.fillStyle = '#22c55e';
            ctx.fillText('[CONTINUE] (Press C)', canvas.width / 2, canvas.height / 2 + 60);
        } else {
            ctx.fillStyle = '#475569';
            ctx.fillText('[CONTINUE] (Locked)', canvas.width / 2, canvas.height / 2 + 60);
        }
        
        ctx.font = '12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Controls: WASD/Arrows to move • Space to jump • Z/X to attack • C to parry • E to devour', canvas.width / 2, canvas.height - 40);
        
        // Handle input to start game
        if (context.inputManager.isActionJustPressed('attackLight')) {
            localStorage.removeItem('tempest_save_boss_defeated'); // reset for new game if they press new game? Or leave it to main to handle
            context.gameStateManager.setState(GameState.PLAYING);
            if (context.audio) context.audio.playBGM();
        } else if (context.inputManager.isActionJustPressed('parry') && localStorage.getItem('tempest_save_boss_defeated') === 'true') {
            context.gameStateManager.setState(GameState.PLAYING);
            if (context.audio) context.audio.playBGM();
        }
    }
    
    renderHUD(ctx, canvas, world, playerHealth, context) {
        if (!playerHealth) return;
        
        // HP Bar Background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(20, 20, 200, 20);
        
        // HP Bar Fill
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(20, 20, 200 * (playerHealth.hp / playerHealth.maxHp), 20);
        
        // HP Bar Border
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 200, 20);

        // HP Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${Math.floor(playerHealth.hp)}/${playerHealth.maxHp}`, 30, 35);
        
        // XP and Level
        if (context.xpSystem) {
            const xpSys = context.xpSystem;
            ctx.font = '12px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`LVL: ${xpSys.level}   SP: ${xpSys.sp}`, 20, 55);
            
            // XP bar
            const nextXp = xpSys.getXPThreshold(xpSys.level);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(20, 60, 120, 8);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(20, 60, 120 * (xpSys.currentXP / nextXp), 8);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.strokeRect(20, 60, 120, 8);
        }
        
        // Combo HUD
        const players = world.queryEntities([PlayerInput]);
        if (players.length > 0) {
            const input = world.getComponent(players[0], PlayerInput);
            if (input.comboHit > 0) {
                ctx.textAlign = 'center';
                ctx.font = 'bold 24px monospace';
                if (input.comboHit === 1) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('HIT 1!', canvas.width / 2, canvas.height - 40);
                } else if (input.comboHit === 2) {
                    ctx.fillStyle = '#f97316';
                    ctx.font = 'bold 28px monospace';
                    ctx.fillText('HIT 2!', canvas.width / 2, canvas.height - 40);
                } else if (input.comboHit === 3) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 36px monospace';
                    ctx.fillText('FINISHER!', canvas.width / 2, canvas.height - 40);
                }
            }
        }
        
        // Boss HP
        const bosses = world.queryEntities([Transform, Health, AI]);
        for (const id of bosses) {
            const ai = world.getComponent(id, AI);
            if (ai.type === 'boss_serpent') {
                const bossHealth = world.getComponent(id, Health);
                if (bossHealth.hp > 0 || !bossHealth.alive) {
                    const barWidth = 400;
                    const barHeight = 24;
                    const barX = (canvas.width / 2) - (barWidth / 2);
                    const barY = 40;
                    
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(barX, barY, barWidth, barHeight);
                    
                    ctx.fillStyle = '#9333ea';
                    ctx.fillRect(barX, barY, barWidth * (bossHealth.hp / bossHealth.maxHp), barHeight);
                    
                    ctx.strokeStyle = '#f8fafc';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(barX, barY, barWidth, barHeight);
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 16px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('TEMPEST SERPENT', canvas.width / 2, barY - 10);
                }
            }
        }
    }
    
    renderPauseMenu(ctx, canvas) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⏸ PAUSED', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '16px monospace';
        ctx.fillText('[RESUME (P)]   [QUIT TO MENU (Q)]', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    renderGameOver(ctx, canvas) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText('Refresh the page to try again.', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    renderLevelTransition(ctx, canvas, context) {
        if (context.transitionAlpha === undefined) context.transitionAlpha = 0;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${context.transitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    renderFloaters(ctx, dt, context) {
        if (!context.floaterQueue) context.floaterQueue = [];
        const frameDt = context._frameDt || (1 / 60);
        
        ctx.save();
        context.camera.apply(ctx);
        
        for (let i = context.floaterQueue.length - 1; i >= 0; i--) {
            let f = context.floaterQueue[i];
            f.lifetime -= frameDt;
            f.y -= 35 * frameDt;
            ctx.globalAlpha = Math.max(0, Math.min(1, f.lifetime / (f.maxLifetime || 1.0)));
            ctx.font = 'bold 13px monospace';
            ctx.fillStyle = f.color;
            ctx.textAlign = 'center';
            ctx.fillText(f.text, f.x, f.y);
            if (f.lifetime <= 0) {
                context.floaterQueue.splice(i, 1);
            }
        }
        
        ctx.restore();
    }
}
