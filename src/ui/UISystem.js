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
        this.assetZoom = 1; // Strict 1x default zoom
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
                id: 'goblin_pack1',
                spriteKey: 'goblin',
                name: 'Goblin Scout (Pack 1)',
                category: 'Melee Grunt',
                title: 'Forest Dagger Marauder (Classic)',
                lore: 'Classic quick-footed forest goblins equipped with steel daggers. Patrols caverns in packs and lunges with rapid slashes.',
                hp: '30',
                atk: '8',
                def: '2',
                speed: '120 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                forcePack: 1,
                tint: null
            },
            {
                id: 'goblin_pack2',
                spriteKey: 'goblin',
                name: 'Goblin Scout (Pack 2)',
                category: 'Melee Grunt',
                title: 'Overhauled Dagger Assassin (New)',
                lore: 'Remastered goblin marauder on a strict 16:9 grid with exaggerated 4-frame run cycle, high leaping plunge attack, and locked anatomy scale.',
                hp: '30',
                atk: '8',
                def: '2',
                speed: '120 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                forcePack: 2,
                tint: null
            },
            {
                id: 'serpent_pack1',
                spriteKey: 'serpent',
                name: 'Tempest Serpent (Pack 1)',
                category: 'Mythic Boss',
                title: 'Ancient Leviathan Dragon (Classic)',
                lore: 'Colossal serpentine dragon ruler of the Whispering Caverns. Commands crackling electric thunderhorns, crushing jaws, and lethal venom torrents.',
                hp: '300',
                atk: '25',
                def: '20',
                speed: '80 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                forcePack: 1,
                tint: null
            },
            {
                id: 'serpent_pack2',
                spriteKey: 'serpent',
                name: 'Tempest Serpent (Pack 2)',
                category: 'Mythic Boss',
                title: 'Thunder Leviathan Dragon (New)',
                lore: 'Remastered high-resolution dragon leviathan with locked anatomy scale, charged electric thunderhorn pulses, ground slither, and explosive lightning craters.',
                hp: '300',
                atk: '25',
                def: '20',
                speed: '80 px/s',
                animations: ['idle', 'run', 'attack', 'hurt', 'death'],
                forcePack: 2,
                tint: null
            },
            {
                id: 'tiles_moss',
                spriteKey: 'tiles',
                name: 'Ancient Cavern Tileset',
                category: 'Environment Tiles',
                title: 'Modular Moss-Stone & Scaffolding',
                lore: 'Modular 16-bit ancient masonry overgrown with lush emerald moss, floating wood-and-moss ledges, subterranean rope bridges, vertical crags, and ionic pillars.',
                hp: 'Solid',
                atk: 'N/A',
                def: 'Infinite',
                speed: 'Static',
                animations: ['ground_mid', 'ground_left', 'ground_right', 'plat_mid', 'plat_left', 'plat_right', 'bridge', 'wall_left', 'wall_right', 'ceiling', 'underhang', 'slope_up', 'slope_down', 'pillar_top', 'pillar_base'],
                forcePack: null,
                tint: null
            },
            {
                id: 'magisteel_ore',
                spriteKey: 'magisteel',
                name: 'Magisteel Ore Deposit',
                category: 'Breakable Mineral',
                title: 'Luminescent Mana Crystal Vein',
                lore: 'High-purity magical ore cluster charged with raw magicules. Pulses with radiant cyan energy and shatters into sparkling mineral shards when harvested.',
                hp: '15 (Breakable)',
                atk: '0',
                def: '5',
                speed: 'Static',
                animations: ['idle', 'break'],
                forcePack: null,
                tint: null
            },
            {
                id: 'hipokute_herb',
                spriteKey: 'hipokute',
                name: 'Hipokute Healing Lotus',
                category: 'Magical Flora',
                title: 'Subterranean Herb of Restoration',
                lore: 'A rare subterranean flora blooming with vibrant violet petals and restorative healing motes. Used by Rimuru to brew high-potency recovery potions.',
                hp: 'Flora',
                atk: 'Heal +50 HP',
                def: '0',
                speed: 'Sway',
                animations: ['bloom'],
                forcePack: null,
                tint: null
            },
            {
                id: 'runic_monolith',
                spriteKey: 'monolith',
                name: 'Ancient Runic Monolith',
                category: 'Runic Relic',
                title: 'Sanctuary Gate Pillar',
                lore: 'A carved stone obelisk engraved with ancient dwarven/dragon runes. Ignites with celestial light and a levitating runic halo to reveal hidden chambers.',
                hp: 'Indestructible',
                atk: 'Mana Surge',
                def: 'Infinite',
                speed: 'Static',
                animations: ['activate'],
                forcePack: null,
                tint: null
            },
            {
                id: 'warp_portal',
                spriteKey: 'portal',
                name: 'Dimensional Warp Portal',
                category: 'Gateway Arch',
                title: 'Dragon Arch Spatial Vortex',
                lore: 'Ancient dragon-crested stone gateway housing a rotating cosmic blue-violet singularity that warps players across cavern floors and boss arenas.',
                hp: 'Spatial Rift',
                atk: 'Warp Entry',
                def: 'Infinite',
                speed: 'Continuous Vortex',
                animations: ['idle', 'activate'],
                forcePack: null,
                tint: null
            },
            {
                id: 'treasure_chest',
                spriteKey: 'chest',
                name: 'Gilded Treasure Chest',
                category: 'Interactive Loot',
                title: 'Ancient Dwarven Relic Cache',
                lore: 'Ironwood chest bound with forged gold filigree and sapphire rune lock. Opens to bestow gold bullion, rare gems, and restorative elixir potions.',
                hp: 'Interact [E]',
                atk: 'Loot Drop',
                def: 'Rune Locked',
                speed: 'Static',
                animations: ['open'],
                forcePack: null,
                tint: null
            },
            {
                id: 'clay_urn',
                spriteKey: 'urn',
                name: 'Ancient Clay Urn',
                category: 'Destructible Prop',
                title: 'Sealed Potion Vessel',
                lore: 'Terracotta jar sealed with enchanted red wax. Shatters into ceramic shards on impact, dropping silver coins and health orbs.',
                hp: '1 Hit',
                atk: '0',
                def: '0',
                speed: 'Static',
                animations: ['break'],
                forcePack: null,
                tint: null
            },
            {
                id: 'dragon_torch',
                spriteKey: 'torch',
                name: 'Dragon Wall Torch',
                category: 'Atmosphere Lighting',
                title: 'Carved Sconce Flame',
                lore: 'Wall-mounted iron dragon sconce burning with everlasting magical flame, casting dancing orange light and embers across damp dungeon stones.',
                hp: 'Fixture',
                atk: 'Illumination',
                def: 'Infinite',
                speed: 'Flame Dance',
                animations: ['burn'],
                forcePack: null,
                tint: null
            },
            {
                id: 'rest_campfire',
                spriteKey: 'campfire',
                name: 'Adventurer Campfire',
                category: 'Sanctuary Rest',
                title: 'Hearthfire Sanctuary Site',
                lore: 'A crackling stone-ringed hearth that restores stamina, clears poison status ailments, and saves cavern checkpoint progression.',
                hp: 'Checkpoint',
                atk: 'Regeneration',
                def: 'Infinite',
                speed: 'Flame Flickering',
                animations: ['burn'],
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

        const currentEntity = this.entitiesList[this.assetEntityIdx];
        const animList = currentEntity.animations;
        if (this.assetAnimIdx >= animList.length) {
            this.assetAnimIdx = 0;
        }

        // --- 1. KEYBOARD & MOUSE INPUT PROCESSING ---
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
                this.triggerEquipNotification(context, `✨ EQUIPPED: ${currentEntity.name}`);
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
        ctx.fillStyle = '#060B12';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Title Bar
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🏛 ASSET LIBRARY & SKIN DRESSING ROOM', 20, 28);

        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText('PREVIEW, INSPECT & EQUIP SKINS', 420, 28);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('[ESC / V] Exit Gallery', canvas.width - 20, 28);

        // --- 3. LEFT COLUMN: CHARACTER & SKIN ROSTER (x: 18, w: 230, h: 450) ---
        const sidebarX = 18;
        const sidebarY = 42;
        const sidebarW = 230;
        const sidebarH = 450;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(sidebarX, sidebarY, sidebarW, sidebarH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sidebarX, sidebarY, sidebarW, sidebarH);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CHARACTER / SKIN ROSTER', sidebarX + 12, sidebarY + 18);

        if (this.sidebarScrollOffset === undefined) this.sidebarScrollOffset = 0;
        const maxVisibleCards = 9;
        const cardH = 42;
        const cardSpacing = 46;

        // Auto-scroll to keep selected item in view
        if (this.assetEntityIdx < this.sidebarScrollOffset) {
            this.sidebarScrollOffset = this.assetEntityIdx;
        } else if (this.assetEntityIdx >= this.sidebarScrollOffset + maxVisibleCards) {
            this.sidebarScrollOffset = this.assetEntityIdx - maxVisibleCards + 1;
        }
        this.sidebarScrollOffset = Math.max(0, Math.min(this.sidebarScrollOffset, this.entitiesList.length - maxVisibleCards));

        const startIdx = this.sidebarScrollOffset;
        const endIdx = Math.min(this.entitiesList.length, startIdx + maxVisibleCards);

        for (let i = startIdx; i < endIdx; i++) {
            const ent = this.entitiesList[i];
            const displayRow = i - startIdx;
            const cardY = sidebarY + 28 + displayRow * cardSpacing;
            const isSelected = i === this.assetEntityIdx;
            const activeSkin = spriteParser.getSkin(ent.spriteKey);
            const isEquipped = ent.forcePack !== null && ent.forcePack === activeSkin;

            // Mouse click support
            if (inputManager.isClickInRect(sidebarX + 6, cardY, sidebarW - 18, cardH)) {
                this.assetEntityIdx = i;
                this.assetAnimIdx = 0;
                this.assetFrameIdx = 0;
            }

            if (isSelected) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
                ctx.fillRect(sidebarX + 6, cardY, sidebarW - 18, cardH);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(sidebarX + 6, cardY, sidebarW - 18, cardH);

                // Left highlight bar
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(sidebarX + 6, cardY, 3, cardH);
            } else if (inputManager.isHoverInRect(sidebarX + 6, cardY, sidebarW - 18, cardH)) {
                ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
                ctx.fillRect(sidebarX + 6, cardY, sidebarW - 18, cardH);
            }

            ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
            ctx.font = isSelected ? 'bold 10px monospace' : '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(ent.name, sidebarX + 16, cardY + 18);

            ctx.fillStyle = '#64748b';
            ctx.font = '8px monospace';
            ctx.fillText(ent.category, sidebarX + 16, cardY + 34);

            // Active Equipped Tag
            if (isEquipped) {
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('✔ ACTIVE', sidebarX + sidebarW - 22, cardY + 20);
            }
        }

        // Scrollbar Track & Thumb
        if (this.entitiesList.length > maxVisibleCards) {
            const scrollTrackX = sidebarX + sidebarW - 8;
            const scrollTrackY = sidebarY + 28;
            const scrollTrackH = sidebarH - 36;
            
            ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
            ctx.fillRect(scrollTrackX, scrollTrackY, 4, scrollTrackH);

            const scrollRatio = maxVisibleCards / this.entitiesList.length;
            const thumbH = Math.max(20, scrollTrackH * scrollRatio);
            const maxScroll = this.entitiesList.length - maxVisibleCards;
            const thumbY = scrollTrackY + (this.sidebarScrollOffset / maxScroll) * (scrollTrackH - thumbH);

            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(scrollTrackX, thumbY, 4, thumbH);
        }

        // --- 4. CENTER COLUMN: PREVIEW STAGE & ALL ANIMATION CLIPS (x: 258, w: 440, h: 450) ---
        const studioX = 258;
        const studioY = 42;
        const studioW = 440;
        const studioH = 260;

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
        const groundLineY = studioY + studioH - 35;
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(studioX + 15, groundLineY);
        ctx.lineTo(studioX + studioW - 15, groundLineY);
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

        // Studio Playback State Badge (Top-Left)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + 10, studioY + 10, 95, 20);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + 10, studioY + 10, 95, 20);
        ctx.fillStyle = this.assetIsPaused ? '#f59e0b' : '#10b981';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.assetIsPaused ? '⏸ PAUSED (SPACE)' : '▶ PLAYING (SPACE)', studioX + 57, studioY + 23);

        // Zoom Badge (Top-Right)
        if (inputManager.isClickInRect(studioX + studioW - 80, studioY + 10, 70, 20)) {
            this.assetZoom = this.assetZoom >= 4 ? 1 : this.assetZoom + 1;
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + studioW - 80, studioY + 10, 70, 20);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + studioW - 80, studioY + 10, 70, 20);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`ZOOM: ${this.assetZoom}x (Z)`, studioX + studioW - 45, studioY + 23);

        // Frame Ticker Scrubber Bar (Top-Center)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`[◀ J]  Frame ${this.assetFrameIdx + 1} / ${totalFrames}  [K ▶]`, studioX + studioW / 2, studioY + 23);

        // --- BOTTOM OF CENTER COLUMN: ALL ANIMATION CLIPS MATRIX (y: 310, w: 440, h: 182) ---
        const matrixY = 310;
        const matrixH = 182;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(studioX, matrixY, studioW, matrixH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(studioX, matrixY, studioW, matrixH);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`ALL ANIMATION CLIPS (${animList.length} TOTAL - PRESS W / S OR CLICK)`, studioX + 12, matrixY + 18);

        // Render 2-Column Grid for ALL Animation Clips (Never Truncates!)
        const clipCols = 2;
        const btnW = (studioW - 30) / clipCols;
        const btnH = 22;

        for (let k = 0; k < animList.length; k++) {
            const clip = animList[k];
            const col = k % clipCols;
            const row = Math.floor(k / clipCols);
            const bX = studioX + 12 + col * (btnW + 6);
            const bY = matrixY + 26 + row * (btnH + 4);
            const isCSelected = k === this.assetAnimIdx;

            // Mouse click to select animation
            if (inputManager.isClickInRect(bX, bY, btnW, btnH)) {
                this.assetAnimIdx = k;
                this.assetFrameIdx = 0;
                this.assetFrameTimer = 0;
            }

            if (isCSelected) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
                ctx.fillRect(bX, bY, btnW, btnH);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(bX, bY, btnW, btnH);
            } else if (inputManager.isHoverInRect(bX, bY, btnW, btnH)) {
                ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
                ctx.fillRect(bX, bY, btnW, btnH);
                ctx.strokeStyle = '#475569';
                ctx.strokeRect(bX, bY, btnW, btnH);
            } else {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
                ctx.fillRect(bX, bY, btnW, btnH);
                ctx.strokeStyle = '#334155';
                ctx.strokeRect(bX, bY, btnW, btnH);
            }

            // Get frame count for badge
            const aData = AnimationData[currentEntity.spriteKey] ? AnimationData[currentEntity.spriteKey][clip] : null;
            const fCount = aData ? aData.frames : 1;

            ctx.fillStyle = isCSelected ? '#38bdf8' : '#e2e8f0';
            ctx.font = isCSelected ? 'bold 10px monospace' : '10px monospace';
            ctx.textAlign = 'left';
            
            // Format clip label nicely
            const niceName = this.formatClipName(clip);
            ctx.fillText(`${isCSelected ? '▶ ' : '  '}${niceName}`, bX + 6, bY + 15);

            // Frame count tag
            ctx.fillStyle = isCSelected ? '#0284c7' : '#64748b';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${fCount}f`, bX + btnW - 6, bY + 15);
        }

        // --- 5. RIGHT COLUMN: TECHNICAL DOSSIER & EQUIP BUTTON (x: 708, w: 234, h: 450) ---
        const rightX = 708;
        const rightY = 42;
        const rightW = 234;
        const rightH = 450;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(rightX, rightY, rightW, rightH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rightX, rightY, rightW, rightH);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(currentEntity.name, rightX + 12, rightY + 22);

        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(currentEntity.title, rightX + 12, rightY + 38);

        // Big Prominent Equip Action Button (y: rightY + 46)
        const equipBoxY = rightY + 46;
        const activeSkin = spriteParser.getSkin(currentEntity.spriteKey);
        const isCurrentlyEquipped = currentEntity.forcePack !== null && currentEntity.forcePack === activeSkin;

        if (currentEntity.forcePack !== null) {
            // Click to equip
            if (inputManager.isClickInRect(rightX + 10, equipBoxY, rightW - 20, 36)) {
                spriteParser.setSkin(currentEntity.spriteKey, currentEntity.forcePack);
                this.triggerEquipNotification(context, `✨ EQUIPPED: ${currentEntity.name}`);
            }

            if (isCurrentlyEquipped) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
                ctx.fillRect(rightX + 10, equipBoxY, rightW - 20, 36);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rightX + 10, equipBoxY, rightW - 20, 36);

                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('✔ ACTIVE IN GAME', rightX + rightW / 2, equipBoxY + 22);
            } else {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
                ctx.fillRect(rightX + 10, equipBoxY, rightW - 20, 36);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rightX + 10, equipBoxY, rightW - 20, 36);

                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('⚡ EQUIP SKIN (ENTER)', rightX + rightW / 2, equipBoxY + 22);
            }
        }

        // Lore Description Box
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        this.wrapText(ctx, currentEntity.lore, rightX + 12, rightY + 98, rightW - 24, 14);

        // Combat Attributes Section (y: rightY + 180)
        const statsBoxY = rightY + 175;
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('COMBAT ATTRIBUTES', rightX + 12, statsBoxY);

        const stats = [
            { label: 'HEALTH POOL', val: currentEntity.hp, color: '#22c55e' },
            { label: 'ATTACK POWER', val: currentEntity.atk, color: '#ef4444' },
            { label: 'DEFENSE RATING', val: currentEntity.def, color: '#3b82f6' },
            { label: 'MOVEMENT SPEED', val: currentEntity.speed, color: '#f59e0b' }
        ];

        for (let s = 0; s < stats.length; s++) {
            const sY = statsBoxY + 16 + s * 20;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText(stats[s].label, rightX + 12, sY);

            ctx.fillStyle = stats[s].color;
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(stats[s].val, rightX + rightW - 12, sY);
            ctx.textAlign = 'left';
        }

        // Technical Asset Specifications (y: rightY + 280)
        const techBoxY = rightY + 275;
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('SPRITE HARDWARE SPECS', rightX + 12, techBoxY);

        const specs = [
            { label: 'ACTIVE CLIP', val: currentAnimKey.toUpperCase() },
            { label: 'FRAME SIZE', val: bitmap ? `${bitmap.width}x${bitmap.height} px` : 'N/A' },
            { label: 'TOTAL FRAMES', val: `${totalFrames} frames` },
            { label: 'FRAME INTERVAL', val: `${Math.round((entityAnimData ? entityAnimData.frameTime : 0.15) * 1000)} ms` }
        ];

        for (let t = 0; t < specs.length; t++) {
            const tY = techBoxY + 16 + t * 20;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText(specs[t].label, rightX + 12, tY);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(specs[t].val, rightX + rightW - 12, tY);
            ctx.textAlign = 'left';
        }

        // --- 6. FOOTER CONTROLS CHEATSHEET (y: 502, h: 32) ---
        const footerY = 502;
        ctx.fillStyle = '#080e1a';
        ctx.fillRect(0, footerY, canvas.width, 38);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(0, footerY, canvas.width, 38);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CONTROLS: [A/D] Select Asset • [W/S] Select Animation • [ENTER] Equip Skin • [SPACE] Pause • [Z] Zoom • [C] Flip • [J/K] Step Frame • [ESC/V] Exit', canvas.width / 2, footerY + 22);
    }

    formatClipName(clipKey) {
        const map = {
            idle: 'IDLE',
            walk: 'WALK',
            run: 'RUN / BOUNCE',
            jump: 'JUMP',
            attack_light: 'LIGHT ATK (WATER CUTTER)',
            attack_heavy: 'HEAVY ATK (HAMMER)',
            special: 'GLUTTONY BARRIER',
            predator: 'PREDATOR DEVOUR',
            hurt: 'HURT / FLINCH',
            death: 'DEFEAT DISSOLUTION',
            victory: 'VICTORY CELEBRATION',
            ground: 'GROUND ARCHITECTURE'
        };
        return map[clipKey] || clipKey.toUpperCase();
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
