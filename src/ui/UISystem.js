import { Health, AI, PlayerInput, Transform } from '../ecs/Components.js';
import { GameState } from '../core/GameStateManager.js';
import { AnimationData } from '../sprites/AnimationData.js';
import { SpriteMaps, Palette } from '../sprites/SpriteMaps.js';

export class UISystem {
    constructor() {
        this.ghostHp = 100;
        
        // Asset Library State
        this.assetEntityIdx = 0;
        this.assetAnimIdx = 0;
        this.assetFrameIdx = 0;
        this.assetFrameTimer = 0;
        this.assetIsPaused = false;
        this.assetZoom = 1; // Default zoom is strictly 1x
        this.assetFacing = 'right';

        this.entitiesList = [
            {
                id: 'rimuru_pack1',
                spriteKey: 'rimuru',
                name: 'Rimuru (Pack 1 - Classic)',
                category: 'Player (Default)',
                title: 'Great Demon Lord / Predator Slime',
                lore: 'The original hand-crafted 16x16 / 32x16 pixel art slime with crescent water slashes, hydro hammer, and gluttony parry barrier.',
                hp: '100 - 300',
                atk: '10 - 45',
                def: '8 - 25',
                speed: '200 px/s',
                animations: ['idle', 'walk', 'run', 'jump', 'attack_light', 'attack_heavy', 'special', 'predator', 'hurt', 'death', 'victory'],
                forcePack: 1,
                tint: null
            },
            {
                id: 'rimuru_pack2',
                spriteKey: 'rimuru',
                name: 'Rimuru (Pack 2 - HD Arcade)',
                category: 'Player (Remastered)',
                title: 'High-Res Gelatinous Predator',
                lore: 'Remastered high-resolution arcade pixel art with elastic squash-and-stretch bounce, large crescent scythe slashes, anvil hammer, and vortex vacuum.',
                hp: '100 - 300',
                atk: '10 - 45',
                def: '8 - 25',
                speed: '200 px/s',
                animations: ['idle', 'run', 'jump', 'attack_light', 'attack_heavy', 'special', 'predator', 'hurt', 'death', 'victory'],
                forcePack: 2,
                tint: null
            },
            {
                id: 'goblin_archer_p1',
                spriteKey: 'goblin_archer',
                name: 'Goblin Sharpshooter (Pack 1)',
                category: 'Ranged Enemy',
                title: 'Bone-Bow Poison Sniper (Default)',
                lore: 'Remastered marksman on a strict 16:9 grid with locked anatomical scale, high-tension bow draw, and toxic green arrow streak projectile.',
                hp: '25',
                atk: '10',
                def: '2',
                speed: '110 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                forcePack: 1,
                tint: null
            },
            {
                id: 'goblin_archer_p2',
                spriteKey: 'goblin_archer',
                name: 'Goblin Sharpshooter (Pack 2)',
                category: 'Ranged Enemy',
                title: 'Bone-Bow Marksman (Variant)',
                lore: 'Alternative hooded goblin marksman variant with extended draw animations and green venom aura.',
                hp: '25',
                atk: '10',
                def: '2',
                speed: '110 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                forcePack: 2,
                tint: null
            },
            {
                id: 'goblin',
                spriteKey: 'goblin',
                name: 'Goblin Scout',
                category: 'Melee Grunt',
                title: 'Forest Dagger Assassin',
                lore: 'Quick-footed forest goblins equipped with jagged steel daggers. Patrols caverns in packs and lunges with rapid slashes when alerting.',
                hp: '30',
                atk: '8',
                def: '2',
                speed: '120 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                forcePack: null,
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
                forcePack: null,
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
                forcePack: null,
                tint: null
            },
            {
                id: 'tiles',
                spriteKey: 'tiles',
                name: 'Dungeon Architecture',
                category: 'Environment',
                title: 'Ancient Moss Stone & Portals',
                lore: 'Modular 16x16 moss-crested dungeon masonry with beveled rock edges and illuminated dimensional warp gateways.',
                hp: 'Solid',
                atk: 'N/A',
                def: 'Infinite',
                speed: 'Static',
                animations: ['ground'],
                forcePack: null,
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
        ctx.fillText('[START GAME] (Press Z)', canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('[ASSET LIBRARY & SKINS] (Press V)', canvas.width / 2, canvas.height / 2 + 35);

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

    renderPauseMenu(ctx, canvas, context) {
        ctx.fillStyle = 'rgba(5, 10, 16, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = '16px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Resume (Press P / Esc)', canvas.width / 2, canvas.height / 2 + 5);
        
        ctx.fillStyle = '#22c55e';
        ctx.fillText('Asset Library & Skins (Press V)', canvas.width / 2, canvas.height / 2 + 40);

        ctx.fillStyle = '#ef4444';
        ctx.fillText('Quit to Menu (Press Q)', canvas.width / 2, canvas.height / 2 + 75);
    }

    renderHUD(ctx, canvas, world, playerHealth, context) {
        const hudX = 20;
        const hudY = 20;
        const barWidth = 200;
        const barHeight = 16;
        
        // --- 1. PLAYER HEALTH & GHOST DAMAGE BAR ---
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(hudX - 5, hudY - 5, barWidth + 10, barHeight * 3 + 24);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hudX - 5, hudY - 5, barWidth + 10, barHeight * 3 + 24);

        if (playerHealth) {
            const currentHp = Math.max(0, playerHealth.current);
            const maxHp = playerHealth.max;
            const hpRatio = currentHp / maxHp;
            
            if (this.ghostHp > currentHp) {
                this.ghostHp = Math.max(currentHp, this.ghostHp - 0.5);
            } else {
                this.ghostHp = currentHp;
            }
            const ghostRatio = this.ghostHp / maxHp;

            // Ghost damage trailing bar
            ctx.fillStyle = '#f87171';
            ctx.fillRect(hudX, hudY, barWidth * ghostRatio, barHeight);

            // Active Green HP Bar
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(hudX, hudY, barWidth * hpRatio, barHeight);
            
            // HP Bar Outline
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.strokeRect(hudX, hudY, barWidth, barHeight);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`HP: ${Math.round(currentHp)} / ${maxHp}`, hudX + 5, hudY + 12);
        }

        // --- 2. SKILL COOLDOWNS & MANA / MP BARS ---
        const cdY = hudY + barHeight + 8;
        const cdKeys = ['Z: ATK', 'X: HEAVY', 'C: PARRY', 'E: ABSORB', 'SHIFT: DASH'];
        ctx.font = '9px monospace';
        for (let i = 0; i < cdKeys.length; i++) {
            const pillX = hudX + (i * 42);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.fillRect(pillX, cdY, 38, 14);
            ctx.strokeStyle = '#38bdf8';
            ctx.strokeRect(pillX, cdY, 38, 14);
            
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(cdKeys[i], pillX + 3, cdY + 10);
        }

        // --- 3. COMBO STREAK & MULTIPLIER ---
        if (context.comboCount && context.comboCount > 1) {
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`${context.comboCount}x COMBO!`, hudX, hudY + 65);
        }

        // --- 4. STAGE / FLOOR INDICATOR ---
        if (context.levelManager) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(context.levelManager.stageName || 'Floor 1-1', canvas.width - 25, 35);
        }

        // --- 5. BOSS HEALTH BAR (IF ACTIVE) ---
        const bossEntities = world.queryEntities([AI, Health, Transform]);
        for (const bossId of bossEntities) {
            const ai = world.getComponent(bossId, AI);
            const bossHp = world.getComponent(bossId, Health);
            if (ai.type === 'boss_serpent' && bossHp.alive) {
                const bBarW = 400;
                const bBarH = 14;
                const bBarX = (canvas.width - bBarW) / 2;
                const bBarY = canvas.height - 40;

                ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                ctx.fillRect(bBarX - 5, bBarY - 20, bBarW + 10, bBarH + 26);
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(bBarX - 5, bBarY - 20, bBarW + 10, bBarH + 26);

                ctx.fillStyle = '#a855f7';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('TEMPEST SERPENT (LEVIATHAN)', bBarX, bBarY - 5);

                const bRatio = Math.max(0, bossHp.current / bossHp.max);
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(bBarX, bBarY, bBarW * bRatio, bBarH);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(bossHp.current)} / ${bossHp.max}`, bBarX + bBarW / 2, bBarY + 11);
            }
        }
    }

    renderGameOver(ctx, canvas) {
        ctx.fillStyle = 'rgba(15, 5, 5, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DEFEATED', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText('Press R to Revive at Cavern Entrance', canvas.width / 2, canvas.height / 2 + 25);
    }

    renderLevelTransition(ctx, canvas, context) {
        ctx.fillStyle = 'rgba(5, 10, 16, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WARPING TO NEXT FLOOR...', canvas.width / 2, canvas.height / 2);
    }

    renderAssetViewer(ctx, canvas, context, dt) {
        const { inputManager, spriteParser } = context;
        if (!inputManager || !spriteParser) return;

        // --- 1. KEYBOARD INPUT PROCESSING ---
        // Cycle Selected Entity (A / D or Left / Right)
        if (inputManager.isActionJustPressed('moveRight')) {
            this.assetEntityIdx = (this.assetEntityIdx + 1) % this.entitiesList.length;
            this.assetAnimIdx = 0;
            this.assetFrameIdx = 0;
            this.assetFrameTimer = 0;
        } else if (inputManager.isActionJustPressed('moveLeft')) {
            this.assetEntityIdx = (this.assetEntityIdx - 1 + this.entitiesList.length) % this.entitiesList.length;
            this.assetAnimIdx = 0;
            this.assetFrameIdx = 0;
            this.assetFrameTimer = 0;
        }

        const currentEntity = this.entitiesList[this.assetEntityIdx];
        const animList = currentEntity.animations;

        // Cycle Animation Clip (W / S or Up / Down)
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

        // Equip Current Skin Variant (Enter / E)
        if (inputManager.isActionJustPressed('interact')) {
            if (currentEntity.forcePack !== null) {
                spriteParser.setSkin(currentEntity.spriteKey, currentEntity.forcePack);
                if (context.floaterQueue) {
                    this.triggerEquipNotification(context, `✨ EQUIPPED: ${currentEntity.name}`);
                }
            }
        }

        // Frame Stepping (J / K or [ / ])
        const currentAnimKey = animList[this.assetAnimIdx] || 'idle';
        const entityAnimData = AnimationData[currentEntity.spriteKey] ? AnimationData[currentEntity.spriteKey][currentAnimKey] : { frames: 1, frameTime: 0.2 };
        const totalFrames = entityAnimData ? entityAnimData.frames : 1;

        if (inputManager.isActionJustPressed('stepForward')) {
            this.assetIsPaused = true;
            this.assetFrameIdx = (this.assetFrameIdx + 1) % totalFrames;
        } else if (inputManager.isActionJustPressed('stepBack')) {
            this.assetIsPaused = true;
            this.assetFrameIdx = (this.assetFrameIdx - 1 + totalFrames) % totalFrames;
        }

        // Zoom Cycle: 1x -> 2x -> 3x -> 4x -> 1x (Attack Light / Z)
        if (inputManager.isActionJustPressed('attackLight')) {
            this.assetZoom = this.assetZoom >= 4 ? 1 : this.assetZoom + 1;
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
        const frameDt = dt || 0.016;
        if (!this.assetIsPaused && entityAnimData) {
            this.assetFrameTimer += frameDt;
            if (this.assetFrameTimer >= (entityAnimData.frameTime || 0.15)) {
                this.assetFrameTimer = 0;
                this.assetFrameIdx = (this.assetFrameIdx + 1) % totalFrames;
            }
        }

        // --- 2. RENDER ASSET LIBRARY UI ---
        // Obsidian Matte Background
        ctx.fillStyle = '#050911';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Title Bar
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🏛 ASSET LIBRARY & SKIN DRESSING ROOM', 25, 34);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('[ESC / V] Return to Game', canvas.width - 25, 34);

        // --- 3. LEFT SIDEBAR: ROSTER & SKINS ---
        const sidebarX = 25;
        const sidebarY = 50;
        const sidebarW = 260;
        const sidebarH = canvas.height - 110;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(sidebarX, sidebarY, sidebarW, sidebarH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sidebarX, sidebarY, sidebarW, sidebarH);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CHARACTER & ENEMY ROSTER', sidebarX + 14, sidebarY + 22);

        for (let i = 0; i < this.entitiesList.length; i++) {
            const ent = this.entitiesList[i];
            const itemY = sidebarY + 32 + i * 40;
            const isSelected = i === this.assetEntityIdx;
            const activeSkin = spriteParser.getSkin(ent.spriteKey);
            const isEquipped = ent.forcePack !== null && ent.forcePack === activeSkin;

            if (isSelected) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
                ctx.fillRect(sidebarX + 8, itemY, sidebarW - 16, 34);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(sidebarX + 8, itemY, sidebarW - 16, 34);
            }

            ctx.fillStyle = isSelected ? '#38bdf8' : '#94a3b8';
            ctx.font = isSelected ? 'bold 12px monospace' : '11px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(ent.name, sidebarX + 16, itemY + 16);

            ctx.fillStyle = '#64748b';
            ctx.font = '9px monospace';
            ctx.fillText(ent.category, sidebarX + 16, itemY + 28);

            // Active Equipped Tag
            if (isEquipped) {
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('✔ ACTIVE', sidebarX + sidebarW - 16, itemY + 20);
            }
        }

        // --- 4. CENTER STAGE: PREVIEW STUDIO ---
        const studioX = 300;
        const studioY = 50;
        const studioW = 380;
        const studioH = canvas.height - 110;

        ctx.fillStyle = '#080e1a';
        ctx.fillRect(studioX, studioY, studioW, studioH);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(studioX, studioY, studioW, studioH);

        // Transparent Checkerboard Backdrop
        const cbSize = 16;
        for (let cy = studioY + 2; cy < studioY + studioH - 2; cy += cbSize) {
            for (let cx = studioX + 2; cx < studioX + studioW - 2; cx += cbSize) {
                if ((Math.floor(cx / cbSize) + Math.floor(cy / cbSize)) % 2 === 0) {
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(cx, cy, cbSize, cbSize);
                }
            }
        }

        // Center Origin Crosshair & Ground Line
        const groundLineY = studioY + studioH - 85;
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(studioX + 20, groundLineY);
        ctx.lineTo(studioX + studioW - 20, groundLineY);
        ctx.stroke();

        // Render Centered Active Sprite
        const bitmap = spriteParser.getBitmap(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, currentEntity.forcePack || null);
        if (bitmap) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;

            // Strict 1x base scaling with zoom factor
            let baseScale = this.assetZoom;
            if (bitmap.width >= 100) {
                baseScale = 0.5 * this.assetZoom; // High-res sheet
            } else if (bitmap.width <= 32) {
                baseScale = 2.0 * this.assetZoom; // 16-bit pixel art
            } else {
                baseScale = 1.0 * this.assetZoom;
            }

            const dispW = bitmap.width * baseScale;
            const dispH = bitmap.height * baseScale;

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

        // Studio Playback State Badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + 12, studioY + 12, 105, 22);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + 12, studioY + 12, 105, 22);
        ctx.fillStyle = this.assetIsPaused ? '#f59e0b' : '#10b981';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.assetIsPaused ? '⏸ PAUSED' : '▶ PLAYING', studioX + 64, studioY + 26);

        // Zoom Badge (Shows 1x Default)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + studioW - 88, studioY + 12, 76, 22);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + studioW - 88, studioY + 12, 76, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`ZOOM: ${this.assetZoom}x (Z)`, studioX + studioW - 50, studioY + 26);

        // Frame Ticker Scrubber Bar
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Frame ${this.assetFrameIdx + 1} / ${totalFrames}   [${currentAnimKey.toUpperCase()}]`, studioX + studioW / 2, groundLineY + 25);

        // Animation Clip Pill Bar
        const pillBarY = groundLineY + 42;
        const visibleClips = animList.slice(0, 5);
        for (let k = 0; k < visibleClips.length; k++) {
            const clip = visibleClips[k];
            const isCSelected = k === this.assetAnimIdx;
            const pW = 66;
            const pX = studioX + 16 + k * (pW + 6);
            
            ctx.fillStyle = isCSelected ? '#38bdf8' : 'rgba(30, 41, 59, 0.7)';
            ctx.fillRect(pX, pillBarY, pW, 20);
            ctx.strokeStyle = isCSelected ? '#0284c7' : '#475569';
            ctx.strokeRect(pX, pillBarY, pW, 20);

            ctx.fillStyle = isCSelected ? '#0f172a' : '#cbd5e1';
            ctx.font = isCSelected ? 'bold 9px monospace' : '9px monospace';
            ctx.fillText(clip.toUpperCase(), pX + pW / 2, pillBarY + 13);
        }

        // --- 5. RIGHT SIDEBAR: DOSSIER & EQUIP SELECTION ---
        const rightX = 695;
        const rightY = 50;
        const rightW = canvas.width - rightX - 25;
        const rightH = canvas.height - 110;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(rightX, rightY, rightW, rightH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rightX, rightY, rightW, rightH);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(currentEntity.name, rightX + 15, rightY + 26);

        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(currentEntity.title, rightX + 15, rightY + 44);

        // Equip / Active Status Banner
        const equipBoxY = rightY + 56;
        const activeSkin = spriteParser.getSkin(currentEntity.spriteKey);
        const isCurrentlyEquipped = currentEntity.forcePack !== null && currentEntity.forcePack === activeSkin;

        if (currentEntity.forcePack !== null) {
            if (isCurrentlyEquipped) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.18)';
                ctx.fillRect(rightX + 15, equipBoxY, rightW - 30, 32);
                ctx.strokeStyle = '#22c55e';
                ctx.strokeRect(rightX + 15, equipBoxY, rightW - 30, 32);

                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('✔ CURRENTLY EQUIPPED IN GAME', rightX + rightW / 2, equipBoxY + 20);
            } else {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
                ctx.fillRect(rightX + 15, equipBoxY, rightW - 30, 32);
                ctx.strokeStyle = '#38bdf8';
                ctx.strokeRect(rightX + 15, equipBoxY, rightW - 30, 32);

                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('[PRESS ENTER TO EQUIP SKIN]', rightX + rightW / 2, equipBoxY + 20);
            }
        }

        // Lore Description Box
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        this.wrapText(ctx, currentEntity.lore, rightX + 15, rightY + 106, rightW - 30, 15);

        // Combat Attributes Section
        const statsBoxY = rightY + 185;
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('COMBAT PROFILE', rightX + 15, statsBoxY);

        const stats = [
            { label: 'HEALTH POOL', val: currentEntity.hp, color: '#22c55e' },
            { label: 'ATTACK POWER', val: currentEntity.atk, color: '#ef4444' },
            { label: 'DEFENSE RATING', val: currentEntity.def, color: '#3b82f6' },
            { label: 'MOVEMENT SPEED', val: currentEntity.speed, color: '#f59e0b' },
            { label: 'SPRITE RESOLUTION', val: bitmap ? `${bitmap.width}x${bitmap.height} px` : 'N/A', color: '#38bdf8' }
        ];

        for (let s = 0; s < stats.length; s++) {
            const sY = statsBoxY + 16 + s * 22;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px monospace';
            ctx.fillText(stats[s].label, rightX + 15, sY);

            ctx.fillStyle = stats[s].color;
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(stats[s].val, rightX + rightW - 15, sY);
            ctx.textAlign = 'left';
        }

        // --- 6. FOOTER CONTROLS CHEATSHEET ---
        const footerY = canvas.height - 35;
        ctx.fillStyle = '#0a101d';
        ctx.fillRect(0, footerY - 15, canvas.width, 50);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(0, footerY - 15, canvas.width, 50);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NAVIGATION: [A/D] Select Character  •  [W/S] Animation  •  [ENTER] Equip Skin  •  [SPACE] Pause/Play  •  [Z] Zoom 1x-4x  •  [C] Flip  •  [J/K] Step Frame', canvas.width / 2, footerY + 12);
    }

    triggerEquipNotification(context, text) {
        if (context.floaterQueue) {
            context.floaterQueue.push({
                text: text,
                x: 480,
                y: 120,
                color: '#22c55e',
                lifetime: 2.0,
                maxLifetime: 2.0
            });
        }
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    renderFloaters(ctx, dt, context) {
        if (!context.floaterQueue || context.floaterQueue.length === 0) return;
        
        for (let i = context.floaterQueue.length - 1; i >= 0; i--) {
            const floater = context.floaterQueue[i];
            floater.lifetime -= dt;
            floater.y -= 25 * dt; // Float gently upwards
            
            if (floater.lifetime <= 0) {
                context.floaterQueue.splice(i, 1);
                continue;
            }
            
            const alpha = Math.max(0, floater.lifetime / (floater.maxLifetime || 1.0));
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = floater.color || '#ffffff';
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';

            // Convert world coordinate to screen coordinate if camera is active
            let screenX = floater.x;
            let screenY = floater.y;
            if (context.camera && context.gameStateManager.getState() === GameState.PLAYING) {
                screenX = floater.x - context.camera.x;
                screenY = floater.y - context.camera.y;
            }

            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(floater.text, screenX, screenY);
            ctx.restore();
        }
    }
}
