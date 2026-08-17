import { Health, AI, PlayerInput, Transform } from '../ecs/Components.js';
import { GameState } from '../core/GameStateManager.js';
import { AnimationData } from '../sprites/AnimationData.js';
import { SpriteMaps, Palette } from '../sprites/SpriteMaps.js';

export class UISystem {
    constructor() {
        this.ghostHp = 100;
        
        // Asset Viewer State
        this.assetEntityIdx = 0;
        this.assetAnimIdx = 0;
        this.assetFrameIdx = 0;
        this.assetFrameTimer = 0;
        this.assetIsPaused = false;
        this.assetZoom = 4;
        this.assetFacing = 'right';

        this.entitiesList = [
            {
                id: 'rimuru',
                spriteKey: 'rimuru',
                name: 'Rimuru Tempest',
                category: 'Player / Protagonist',
                title: 'Great Demon Lord / Predator Slime',
                lore: 'A sentient azure slime gifted with Predator and Great Sage abilities. Attacks with high-speed water blade whips and absorbs defeated foes to gain power.',
                hp: '100 - 300',
                atk: '10 - 45',
                def: '8 - 25',
                speed: '200 px/s',
                animations: ['idle', 'walk', 'run', 'jump', 'attack_light', 'attack_heavy', 'special', 'predator', 'hurt', 'death', 'victory'],
                tint: null
            },
            {
                id: 'goblin',
                spriteKey: 'goblin',
                name: 'Goblin Scout',
                category: 'Common Marauder',
                title: 'Forest Dagger Assassin',
                lore: 'Quick-footed forest goblins equipped with jagged steel daggers. Patrols caverns in packs and lunges with rapid slashes when alerting.',
                hp: '30',
                atk: '8',
                def: '2',
                speed: '120 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                tint: null
            },
            {
                id: 'goblin_brawler',
                spriteKey: 'goblin',
                name: 'Goblin Brawler',
                category: 'Elite Marauder',
                title: 'Armored Heavy Brute',
                lore: 'A hulking, battle-hardened goblin encased in reinforced armor. Boasts super-armor poise, heavy knockback resistance, and bone-crushing slams.',
                hp: '75',
                atk: '14',
                def: '6',
                speed: '90 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                tint: 'rgba(239, 68, 68, 0.35)'
            },
            {
                id: 'serpent',
                spriteKey: 'serpent',
                name: 'Tempest Serpent',
                category: 'Mythic Boss',
                title: 'Ancient Leviathan Dragon',
                lore: 'Colossal serpentine dragon ruler of the Whispering Caverns. Commands crackling electric thunderhorns, crushing jaws, and lethal venom torrents.',
                hp: '300',
                atk: '25',
                def: '20',
                speed: '80 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                tint: null
            },
            {
                id: 'tiles',
                spriteKey: 'tiles',
                name: 'Dungeon Architecture',
                category: 'Environment Assets',
                title: 'Ancient Moss Stone & Portals',
                lore: 'Modular 16x16 moss-crested dungeon masonry with beveled rock edges and illuminated dimensional warp gateways.',
                hp: 'Solid',
                atk: 'N/A',
                def: 'Infinite',
                speed: 'Static',
                animations: ['ground'],
                tint: null
            }
        ];
    }

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
            this.renderPauseMenu(ctx, canvas, context);
        } else if (state === GameState.GAME_OVER) {
            this.renderGameOver(ctx, canvas);
        } else if (state === GameState.LEVEL_TRANSITION) {
            this.renderHUD(ctx, canvas, world, playerHealth, context);
            this.renderLevelTransition(ctx, canvas, context);
        } else if (state === GameState.ASSETS) {
            this.renderAssetViewer(ctx, canvas, context, dt);
        }
        
        this.renderFloaters(ctx, dt, context);
        
        ctx.restore();
    }
    
    renderMenu(ctx, canvas, context) {
        ctx.fillStyle = '#050A10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TENSEI SLIME: TEMPEST RISING', canvas.width / 2, canvas.height / 3 - 20);
        
        ctx.font = '18px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('[START GAME] (Press Z)', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('[ASSETS GALLERY] (Press V)', canvas.width / 2, canvas.height / 2 + 40);

        if (localStorage.getItem('tempest_save_boss_defeated') === 'true') {
            ctx.fillStyle = '#22c55e';
            ctx.fillText('[CONTINUE] (Press C)', canvas.width / 2, canvas.height / 2 + 80);
        } else {
            ctx.fillStyle = '#475569';
            ctx.fillText('[CONTINUE] (Locked)', canvas.width / 2, canvas.height / 2 + 80);
        }
        
        ctx.font = '12px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Controls: WASD / Arrows to Move • Space to Jump • Z/X to Attack • C to Parry • E to Devour • Shift to Dash', canvas.width / 2, canvas.height - 35);
        
        // Handle input to start game or open gallery
        if (context.inputManager.isActionJustPressed('attackLight')) {
            context.gameStateManager.setState(GameState.PLAYING);
            if (context.audio) context.audio.playBGM();
        } else if (context.inputManager.isActionJustPressed('viewAssets')) {
            context.gameStateManager.setState(GameState.ASSETS);
        } else if (context.inputManager.isActionJustPressed('parry') && localStorage.getItem('tempest_save_boss_defeated') === 'true') {
            context.gameStateManager.setState(GameState.PLAYING);
            if (context.audio) context.audio.playBGM();
        }
    }
    
    renderHUD(ctx, canvas, world, playerHealth, context) {
        if (!playerHealth) return;
        
        // Smooth Ghost HP trailing bar
        if (this.ghostHp === undefined) this.ghostHp = playerHealth.hp;
        if (this.ghostHp > playerHealth.hp) {
            this.ghostHp -= 0.5;
        } else if (this.ghostHp < playerHealth.hp) {
            this.ghostHp = playerHealth.hp;
        }

        // HP Bar Background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(20, 20, 220, 22);

        // Ghost Damage Bar (Orange trail)
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(20, 20, 220 * (Math.min(playerHealth.maxHp, this.ghostHp) / playerHealth.maxHp), 22);
        
        // HP Bar Fill (Vibrant green/cyan gradient)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(20, 20, 220 * (playerHealth.hp / playerHealth.maxHp), 22);
        
        // HP Bar Border
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 220, 22);

        // HP Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${Math.floor(playerHealth.hp)}/${playerHealth.maxHp}`, 28, 36);
        
        // XP and Level
        if (context.xpSystem) {
            const xpSys = context.xpSystem;
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`LVL: ${xpSys.level}   SP: ${xpSys.sp}`, 20, 56);
            
            // XP bar
            const nextXp = xpSys.getXPThreshold(xpSys.level);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(20, 62, 140, 8);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(20, 62, 140 * Math.min(1.0, (xpSys.currentXP / nextXp)), 8);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.strokeRect(20, 62, 140, 8);
        }

        // Stage & Floor Banner (Top Right)
        if (context.levelManager && context.levelManager.stageName) {
            ctx.save();
            ctx.textAlign = 'right';
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(context.levelManager.stageName, canvas.width - 20, 32);
            ctx.restore();
        }
        
        // Dynamic Combo Streak Indicator
        const players = world.queryEntities([PlayerInput]);
        if (players.length > 0) {
            const input = world.getComponent(players[0], PlayerInput);
            if (input.comboHit > 0) {
                ctx.textAlign = 'center';
                if (input.comboHit === 1) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 22px monospace';
                    ctx.fillText('HIT 1!', canvas.width / 2, canvas.height - 40);
                } else if (input.comboHit === 2) {
                    ctx.fillStyle = '#f97316';
                    ctx.font = 'bold 26px monospace';
                    ctx.fillText('HIT 2!', canvas.width / 2, canvas.height - 40);
                } else if (input.comboHit === 3) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 32px monospace';
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
                    const barHeight = 22;
                    const barX = (canvas.width / 2) - (barWidth / 2);
                    const barY = 40;
                    
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(barX, barY, barWidth, barHeight);
                    
                    ctx.fillStyle = '#9333ea';
                    ctx.fillRect(barX, barY, barWidth * (bossHealth.hp / bossHealth.maxHp), barHeight);
                    
                    ctx.strokeStyle = '#f8fafc';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(barX, barY, barWidth, barHeight);
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 15px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('TEMPEST SERPENT (BOSS)', canvas.width / 2, barY - 8);
                }
            }
        }
    }
    
    renderPauseMenu(ctx, canvas, context) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⏸ PAUSED', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = '16px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('[RESUME (P / ESC)]     [ASSETS GALLERY (V)]     [QUIT TO MENU (Q)]', canvas.width / 2, canvas.height / 2 + 20);

        if (context.inputManager.isActionJustPressed('viewAssets')) {
            context.gameStateManager.setState(GameState.ASSETS);
        }
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
        const pulse = Math.sin(performance.now() / 100) * 0.2 + 0.6;
        ctx.fillStyle = `rgba(5, 10, 16, ${pulse})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WARPING TO NEXT FLOOR...', canvas.width / 2, canvas.height / 2);
    }

    // ==========================================
    // INTERACTIVE ASSET VIEWER & BESTIARY
    // ==========================================
    renderAssetViewer(ctx, canvas, context, dt) {
        const inputManager = context.inputManager;
        const spriteParser = context.spriteParser;
        const totalEntities = this.entitiesList.length;

        // Input Navigation Handling
        if (inputManager.isActionJustPressed('moveRight')) {
            this.assetEntityIdx = (this.assetEntityIdx + 1) % totalEntities;
            this.assetAnimIdx = 0;
            this.assetFrameIdx = 0;
            this.assetFrameTimer = 0;
        } else if (inputManager.isActionJustPressed('moveLeft')) {
            this.assetEntityIdx = (this.assetEntityIdx - 1 + totalEntities) % totalEntities;
            this.assetAnimIdx = 0;
            this.assetFrameIdx = 0;
            this.assetFrameTimer = 0;
        }

        const currentEntity = this.entitiesList[this.assetEntityIdx];
        const animList = currentEntity.animations;

        if (inputManager.isActionJustPressed('moveDown')) {
            this.assetAnimIdx = (this.assetAnimIdx + 1) % animList.length;
            this.assetFrameIdx = 0;
            this.assetFrameTimer = 0;
        } else if (inputManager.isActionJustPressed('moveUp')) {
            this.assetAnimIdx = (this.assetAnimIdx - 1 + animList.length) % animList.length;
            this.assetFrameIdx = 0;
            this.assetFrameTimer = 0;
        }

        // Toggle Play/Pause (Space)
        if (inputManager.isActionJustPressed('jump')) {
            this.assetIsPaused = !this.assetIsPaused;
        }

        // Frame Stepping
        const currentAnimKey = animList[this.assetAnimIdx];
        const entityAnimData = AnimationData[currentEntity.spriteKey] ? AnimationData[currentEntity.spriteKey][currentAnimKey] : { frames: 1, frameTime: 0.2 };
        const totalFrames = entityAnimData ? entityAnimData.frames : 1;

        if (inputManager.isActionJustPressed('stepForward')) {
            this.assetIsPaused = true;
            this.assetFrameIdx = (this.assetFrameIdx + 1) % totalFrames;
        } else if (inputManager.isActionJustPressed('stepBack')) {
            this.assetIsPaused = true;
            this.assetFrameIdx = (this.assetFrameIdx - 1 + totalFrames) % totalFrames;
        }

        // Zoom In / Out
        if (inputManager.isActionJustPressed('attackLight')) {
            this.assetZoom = this.assetZoom >= 8 ? 2 : this.assetZoom + 2;
        }

        // Flip Facing (Parry / C)
        if (inputManager.isActionJustPressed('parry')) {
            this.assetFacing = this.assetFacing === 'right' ? 'left' : 'right';
        }

        // Exit Asset Gallery (ESC or V)
        if (inputManager.isActionJustPressed('pause') || inputManager.isActionJustPressed('viewAssets')) {
            context.gameStateManager.setState(context.gameStateManager.previousState === GameState.ASSETS ? GameState.PLAYING : (context.gameStateManager.previousState || GameState.MENU));
            return;
        }

        // Animation Time Progression
        const frameDt = context._frameDt || 0.016;
        if (!this.assetIsPaused && entityAnimData) {
            this.assetFrameTimer += frameDt;
            if (this.assetFrameTimer >= (entityAnimData.frameTime || 0.15)) {
                this.assetFrameTimer = 0;
                this.assetFrameIdx = (this.assetFrameIdx + 1) % totalFrames;
            }
        }

        // --- DRAW ASSET GALLERY INTERFACE ---
        // 1. Studio Obsidian Background
        ctx.fillStyle = '#060B12';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Title
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🏛 ASSET INSPECTOR & BESTIARY', 25, 38);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('[ESC / V] Exit Gallery', canvas.width - 25, 38);

        // 2. Left Sidebar: Entity Category Navigation
        const sidebarX = 25;
        const sidebarY = 60;
        const sidebarW = 240;
        const sidebarH = canvas.height - 110;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(sidebarX, sidebarY, sidebarW, sidebarH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sidebarX, sidebarY, sidebarW, sidebarH);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('ENTITIES & ASSET SETS', sidebarX + 15, sidebarY + 25);

        for (let i = 0; i < this.entitiesList.length; i++) {
            const ent = this.entitiesList[i];
            const itemY = sidebarY + 42 + i * 44;
            const isSelected = i === this.assetEntityIdx;

            if (isSelected) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
                ctx.fillRect(sidebarX + 8, itemY, sidebarW - 16, 36);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(sidebarX + 8, itemY, sidebarW - 16, 36);
            }

            ctx.fillStyle = isSelected ? '#38bdf8' : '#94a3b8';
            ctx.font = isSelected ? 'bold 13px monospace' : '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(ent.name, sidebarX + 20, itemY + 18);

            ctx.fillStyle = '#64748b';
            ctx.font = '10px monospace';
            ctx.fillText(ent.category, sidebarX + 20, itemY + 30);
        }

        // Animation Selector List on Left Sidebar Bottom
        const animBoxY = sidebarY + 280;
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('ANIMATION CLIPS', sidebarX + 15, animBoxY);

        for (let j = 0; j < Math.min(6, animList.length); j++) {
            const anim = animList[j];
            const aY = animBoxY + 16 + j * 24;
            const isASelected = j === this.assetAnimIdx;

            ctx.fillStyle = isASelected ? '#22c55e' : '#64748b';
            ctx.font = isASelected ? 'bold 12px monospace' : '11px monospace';
            ctx.fillText(`${isASelected ? '▶ ' : '  '}${anim}`, sidebarX + 15, aY + 12);
        }

        // 3. Center Studio: Viewport Showcase & Checkerboard
        const studioX = 280;
        const studioY = 60;
        const studioW = 380;
        const studioH = canvas.height - 110;

        ctx.fillStyle = '#0a101d';
        ctx.fillRect(studioX, studioY, studioW, studioH);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(studioX, studioY, studioW, studioH);

        // Checkerboard Backdrop inside Studio
        const cbSize = 16;
        for (let cy = studioY + 2; cy < studioY + studioH - 2; cy += cbSize) {
            for (let cx = studioX + 2; cx < studioX + studioW - 2; cx += cbSize) {
                if ((Math.floor(cx / cbSize) + Math.floor(cy / cbSize)) % 2 === 0) {
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(cx, cy, cbSize, cbSize);
                }
            }
        }

        // Floor Anchor Guide
        const groundLineY = studioY + studioH - 60;
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(studioX + 20, groundLineY);
        ctx.lineTo(studioX + studioW - 20, groundLineY);
        ctx.stroke();

        // Render Centered Active Sprite
        const bitmap = spriteParser.getBitmap(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx);
        if (bitmap) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;

            const scale = this.assetZoom;
            const dispW = bitmap.width * scale;
            const dispH = bitmap.height * scale;

            const centerX = studioX + studioW / 2;
            const drawX = centerX - dispW / 2;
            const drawY = groundLineY - dispH;

            if (this.assetFacing === 'left') {
                ctx.translate(drawX + dispW, drawY);
                ctx.scale(-1, 1);
                ctx.drawImage(bitmap, 0, 0, dispW, dispH);
            } else {
                ctx.drawImage(bitmap, drawX, drawY, dispW, dispH);
            }

            if (currentEntity.tint) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = currentEntity.tint;
                if (this.assetFacing === 'left') {
                    ctx.fillRect(0, 0, dispW, dispH);
                } else {
                    ctx.fillRect(drawX, drawY, dispW, dispH);
                }
            }

            ctx.restore();
        }

        // Studio Playback Badges & Controls
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + 15, studioY + 15, 110, 24);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + 15, studioY + 15, 110, 24);

        ctx.fillStyle = this.assetIsPaused ? '#f59e0b' : '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.assetIsPaused ? '⏸ PAUSED' : '▶ PLAYING', studioX + 70, studioY + 31);

        // Zoom Badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + studioW - 95, studioY + 15, 80, 24);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + studioW - 95, studioY + 15, 80, 24);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`ZOOM: ${this.assetZoom}x`, studioX + studioW - 55, studioY + 31);

        // Frame Timeline Indicator (e.g. Frame 1 / 4)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Frame ${this.assetFrameIdx + 1} / ${totalFrames}   (${currentAnimKey})`, studioX + studioW / 2, studioY + studioH - 25);

        // 4. Right Sidebar: Entity Technical Dossier & Lore
        const rightX = 675;
        const rightY = 60;
        const rightW = canvas.width - rightX - 25;
        const rightH = canvas.height - 110;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(rightX, rightY, rightW, rightH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rightX, rightY, rightW, rightH);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(currentEntity.name, rightX + 15, rightY + 30);

        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(currentEntity.title, rightX + 15, rightY + 48);

        // Lore Description Box
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px monospace';
        this.wrapText(ctx, currentEntity.lore, rightX + 15, rightY + 75, rightW - 30, 16);

        // Combat Stats Card
        const statsBoxY = rightY + 160;
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('COMBAT PROFILE', rightX + 15, statsBoxY);

        const stats = [
            { label: 'HEALTH POOL', val: currentEntity.hp, color: '#22c55e' },
            { label: 'ATTACK POWER', val: currentEntity.atk, color: '#ef4444' },
            { label: 'DEFENSE RATING', val: currentEntity.def, color: '#3b82f6' },
            { label: 'MOVEMENT SPEED', val: currentEntity.speed, color: '#f59e0b' },
            { label: 'SPRITE RESOLUTION', val: bitmap ? `${bitmap.width}x${bitmap.height} px` : 'N/A', color: '#38bdf8' }
        ];

        for (let s = 0; s < stats.length; s++) {
            const sY = statsBoxY + 20 + s * 24;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px monospace';
            ctx.fillText(stats[s].label, rightX + 15, sY);

            ctx.fillStyle = stats[s].color;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(stats[s].val, rightX + rightW - 15, sY);
            ctx.textAlign = 'left';
        }

        // 5. Bottom Navigation Toolbar
        ctx.fillStyle = '#0b1320';
        ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('◀ [A/D] Entity   ▲ [W/S] Animation   [SPACE] Play/Pause   [J/K] Step Frame   [Z] Zoom   [C] Flip Facing   [ESC] Exit', canvas.width / 2, canvas.height - 13);
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let curY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, curY);
                line = words[n] + ' ';
                curY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, curY);
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
