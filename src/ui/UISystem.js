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
        try {
            const savedSpeed = localStorage.getItem('tempest_asset_anim_speed');
            this.assetAnimSpeed = savedSpeed ? parseFloat(savedSpeed) : 1.0;
        } catch(e) {
            this.assetAnimSpeed = 1.0;
        }
        this.assetFacing = 'right';
        this.titleBgImg = new Image();
        this.titleBgImg.src = '/public/sprites/backgrounds/title_bg.jpg';
        
        // 4 Dynamic Loading Screens with Great Sage Lore
        this.loadingScreens = [
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_1.jpg',
                title: 'THE WHISPERING CAVERNS',
                lore: '« REPORT: GREAT SAGE — Analyzing Subterranean Magicules & Flora... »'
            },
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_2.jpg',
                title: 'THE MAGISTEEL MINING DEPTHS',
                lore: '« REPORT: GREAT SAGE — High concentration of Magisteel Ore detected in lower strata. »'
            },
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_3.jpg',
                title: 'GREAT SAGE: PREDICTION ALGORITHM',
                lore: '« REPORT: GREAT SAGE — Calculating future state probability & magicule synthesis vectors. »'
            },
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_4.jpg',
                title: 'THE TEMPEST SERPENT SANCTUARY',
                lore: '« WARNING: GREAT SAGE — Immense ancient draconic presence detected ahead. Prepare for combat! »'
            }
        ];
        this.loadingScreens.forEach(s => { s.img.src = s.src; });
        this.currentLoadingIdx = 0;
        
        // Alignment Editor State
        this.assetTab = 'editor'; // 'editor' or 'dossier'
        this.editorScope = 'frame'; // 'frame', 'clip', or 'global'
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
            },
            {
                id: 'floor_spikes',
                spriteKey: 'spikes',
                name: 'Razor Floor Spikes',
                category: 'Lethal Trap',
                title: 'Spring-Loaded Impaler Plate',
                lore: 'Concealed stone floor plate loaded with razor-sharp tempered steel spikes that erupt upward when stepped on by intruders.',
                hp: 'Hazard',
                atk: '18 Direct DMG',
                def: 'Trap',
                speed: 'Spring-Loaded',
                animations: ['trigger'],
                forcePack: null,
                tint: null
            },
            {
                id: 'ceiling_stalactite',
                spriteKey: 'stalactite',
                name: 'Ceiling Drop Stalactite',
                category: 'Overhead Hazard',
                title: 'Quake Triggered Drop Spire',
                lore: 'Massive stone stalactite hanging from the cavern ceiling. Trembles upon hearing combat tremors before plunging to shatter on the floor.',
                hp: 'Hazard',
                atk: '25 Heavy Impact',
                def: 'Breakable on Floor',
                speed: 'Terminal Gravity',
                animations: ['drop'],
                forcePack: null,
                tint: null
            },
            {
                id: 'toxic_spore_shroom',
                spriteKey: 'spore_shroom',
                name: 'Toxic Spore Mushroom',
                category: 'Bio Hazard',
                title: 'Poison Spore Geyser',
                lore: 'Bulbous mutant toadstool that inflates and detonates with a concentrated green poison gas geyser containing lingering skull toxins.',
                hp: 'Hazard',
                atk: 'Poison Status DOT',
                def: 'Elastic Cap',
                speed: 'Eruptive',
                animations: ['spore'],
                forcePack: null,
                tint: null
            },
            {
                id: 'acid_swamp_vent',
                spriteKey: 'acid_vent',
                name: 'Acid Bubble Vent',
                category: 'Corrosive Hazard',
                title: 'Cavern Swamp Fissure',
                lore: 'Subterranean green acid pool with expanding sulfurous bubbles that burst into caustic spray, melting armor and slowing mobility.',
                hp: 'Hazard',
                atk: 'Acid Burn + Slow',
                def: 'Liquid Pool',
                speed: 'Bubbling',
                animations: ['bubble'],
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
        if (this.titleBgImg && this.titleBgImg.complete && this.titleBgImg.naturalWidth > 0) {
            ctx.drawImage(this.titleBgImg, 0, 0, canvas.width, canvas.height);
            // Atmospheric dark gradient backdrop
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(5, 10, 16, 0.5)');
            grad.addColorStop(0.5, 'rgba(5, 10, 16, 0.4)');
            grad.addColorStop(1, 'rgba(5, 10, 16, 0.85)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#050A10';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
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
        const hudY = 16;
        const hudW = 280;
        const hudH = 76;
        
        // --- 1. PLAYER STATUS PANEL ---
        ctx.fillStyle = 'rgba(10, 15, 26, 0.92)';
        ctx.fillRect(hudX, hudY, hudW, hudH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hudX, hudY, hudW, hudH);

        // Avatar Frame (Slime Icon)
        const avSize = 44;
        const avX = hudX + 8;
        const avY = hudY + 8;
        ctx.fillStyle = '#06111f';
        ctx.fillRect(avX, avY, avSize, avSize);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(avX, avY, avSize, avSize);

        // Draw Slime Head
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(avX + avSize / 2, avY + avSize / 2 + 3, 14, 0, Math.PI * 2);
        ctx.fill();
        // Slime Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(avX + 16, avY + 20, 3, 7);
        ctx.fillRect(avX + 25, avY + 20, 3, 7);

        // Level Badge below Avatar
        const pLevel = (context.xpSystem && context.xpSystem.level) ? context.xpSystem.level : 1;
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv. ${pLevel}`, avX + avSize / 2, avY + avSize + 16);

        // Player Name & Title
        const barX = avX + avSize + 10;
        const barW = hudW - avSize - 26;
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Rimuru Tempest', barX, hudY + 16);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('Demon Lord Slime', hudX + hudW - 8, hudY + 16);

        if (playerHealth) {
            const currentHp = Math.max(0, playerHealth.hp || 0);
            const maxHp = playerHealth.maxHp || 100;
            const hpRatio = Math.min(1, Math.max(0, currentHp / maxHp));
            
            if (this.ghostHp > currentHp) {
                this.ghostHp = Math.max(currentHp, this.ghostHp - 0.5);
            } else {
                this.ghostHp = currentHp;
            }
            const ghostRatio = Math.min(1, Math.max(0, this.ghostHp / maxHp));

            // HP Bar (Green / Red Ghost Trail)
            const hpY = hudY + 22;
            const bH = 10;
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(barX, hpY, barW, bH);
            
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(barX, hpY, barW * ghostRatio, bH);

            ctx.fillStyle = '#22c55e';
            ctx.fillRect(barX, hpY, barW * hpRatio, bH);

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, hpY, barW, bH);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`HP ${Math.round(currentHp)}/${maxHp}`, barX + 4, hpY + 8);

            // MP / Magicule Bar (Cyan)
            const mpY = hpY + bH + 3;
            const currentMp = playerHealth.mp !== undefined ? playerHealth.mp : 50;
            const maxMp = playerHealth.maxMp || 50;
            const mpRatio = Math.min(1, Math.max(0, currentMp / maxMp));
            
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(barX, mpY, barW, 8);
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(barX, mpY, barW * mpRatio, 8);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(barX, mpY, barW, 8);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px monospace';
            ctx.fillText(`MP ${Math.round(currentMp)}/${maxMp}`, barX + 4, mpY + 6);

            // XP Progression Bar (Gold)
            const xpY = mpY + 11;
            const currXP = (context.xpSystem && context.xpSystem.currentXP) ? context.xpSystem.currentXP : 0;
            const maxXP = (context.xpSystem && context.xpSystem.getXPThreshold) ? context.xpSystem.getXPThreshold(pLevel) : 50;
            const xpRatio = Math.min(1, Math.max(0, currXP / maxXP));

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(barX, xpY, barW, 6);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(barX, xpY, barW * xpRatio, 6);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(barX, xpY, barW, 6);

            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 7px monospace';
            ctx.fillText(`XP ${currXP}/${maxXP}`, barX + 4, xpY + 5);
        }

        // --- 2. COMBAT SKILL BADGES STRIP ---
        const skillsY = hudY + hudH + 8;
        const skills = [
            { key: 'Z', name: 'ATK', color: '#38bdf8' },
            { key: 'X', name: 'HEAVY', color: '#f59e0b' },
            { key: 'C', name: 'PARRY', color: '#a855f7' },
            { key: 'E', name: 'DEVOUR', color: '#06b6d4' },
            { key: 'SHIFT', name: 'DASH', color: '#10b981' }
        ];

        let sX = hudX;
        for (const s of skills) {
            const pillW = s.key.length > 1 ? 62 : 48;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.fillRect(sX, skillsY, pillW, 18);
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(sX, skillsY, pillW, 18);

            ctx.fillStyle = s.color;
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`[${s.key}] ${s.name}`, sX + pillW / 2, skillsY + 12);
            sX += pillW + 6;
        }

        // --- 3. COMBO STREAK & MULTIPLIER ---
        if (context.comboCount && context.comboCount > 1) {
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`${context.comboCount}x COMBO!`, hudX, skillsY + 38);
        }

        // --- 4. STAGE / FLOOR INDICATOR ---
        if (context.levelManager) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(canvas.width - 240, 16, 220, 26);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(canvas.width - 240, 16, 220, 26);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`🏰 ${context.levelManager.stageName || 'Floor 1-1'}`, canvas.width - 130, 33);
        }

        // --- 5. BOSS HEALTH BAR (IF ACTIVE) ---
        const bossEntities = world.queryEntities([AI, Health, Transform]);
        for (const bossId of bossEntities) {
            const ai = world.getComponent(bossId, AI);
            const bossHp = world.getComponent(bossId, Health);
            if (ai.type === 'boss_serpent' && bossHp.alive) {
                const bBarW = 440;
                const bBarH = 16;
                const bBarX = (canvas.width - bBarW) / 2;
                const bBarY = canvas.height - 42;

                ctx.fillStyle = 'rgba(10, 15, 26, 0.95)';
                ctx.fillRect(bBarX - 8, bBarY - 22, bBarW + 16, bBarH + 30);
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 2;
                ctx.strokeRect(bBarX - 8, bBarY - 22, bBarW + 16, bBarH + 30);

                ctx.fillStyle = '#c084fc';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('🐉 TEMPEST SERPENT (LEVIATHAN)', bBarX, bBarY - 6);

                const bRatio = Math.max(0, bossHp.hp / bossHp.maxHp);
                ctx.fillStyle = '#450a0a';
                ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(bBarX, bBarY, bBarW * bRatio, bBarH);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(bossHp.hp)} / ${bossHp.maxHp}`, bBarX + bBarW / 2, bBarY + 12);
            }
        }

        // --- 6. VOICE OF THE WORLD / GREAT SAGE ANIME SYSTEM NOTIFICATION POPUP ---
        this.renderGreatSage(ctx, canvas, context);
    }

    renderGreatSage(ctx, canvas, context) {
        if (!context.sage || !context.sage.current) return;

        const current = context.sage.current;
        const msg = current.message.slice(0, context.sage.typewriterIndex || 0);
        const pulse = Math.sin(performance.now() / 200) * 0.2 + 0.8;

        // Position at top center/right to completely avoid blocking gameplay
        const popW = Math.min(460, canvas.width - 320);
        const popH = 62;
        const popX = canvas.width - popW - 20;
        const popY = 50; // Directly below stage indicator, leaving bottom 90% of screen 100% free

        ctx.save();
        // Dark Obsidian & Celestial Backdrop
        ctx.fillStyle = 'rgba(6, 11, 20, 0.95)';
        ctx.fillRect(popX, popY, popW, popH);

        // Golden Ethereal Glow Border
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulse})`;
        ctx.lineWidth = 1.6;
        ctx.strokeRect(popX, popY, popW, popH);

        // Anime Corner Accents
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(popX - 1, popY - 1, 6, 2);
        ctx.fillRect(popX - 1, popY - 1, 2, 6);
        ctx.fillRect(popX + popW - 5, popY - 1, 6, 2);
        ctx.fillRect(popX + popW - 1, popY - 1, 2, 6);

        // Header Title
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(current.title, popX + 12, popY + 16);

        // Horizontal Pulse Line
        ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(popX + 12, popY + 22);
        ctx.lineTo(popX + popW - 12, popY + 22);
        ctx.stroke();

        // Message Body (Typewritten)
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        this.wrapText(ctx, msg, popX + 12, popY + 36, popW - 24, 14);

        ctx.restore();
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
        const screen = this.loadingScreens ? this.loadingScreens[this.currentLoadingIdx % this.loadingScreens.length] : null;
        if (screen && screen.img && screen.img.complete && screen.img.naturalWidth > 0) {
            ctx.drawImage(screen.img, 0, 0, canvas.width, canvas.height);
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(5, 10, 16, 0.35)');
            grad.addColorStop(1, 'rgba(5, 10, 16, 0.85)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'rgba(5, 10, 16, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(screen ? screen.title : 'ENTERING THE CAVERNS', canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(screen ? screen.lore : '« REPORT: GREAT SAGE — Analyzing Subterranean Magicules... »', canvas.width / 2, canvas.height / 2 + 20);

        // Progress bar simulation
        const pBarW = 340;
        const pBarH = 6;
        const pBarX = (canvas.width - pBarW) / 2;
        const pBarY = canvas.height / 2 + 45;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(pBarX, pBarY, pBarW, pBarH);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(pBarX, pBarY, pBarW, pBarH);

        const pulseW = ((Date.now() / 8) % (pBarW - 4));
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(pBarX + 2, pBarY + 2, pulseW, pBarH - 4);
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

        // Animation Time Progression (Scaled by assetAnimSpeed)
        const frameDt = dt || 0.016;
        if (!this.assetIsPaused && entityAnimData) {
            this.assetFrameTimer += frameDt * (this.assetAnimSpeed || 1.0);
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

        // Active Offset Lookup (Frame-Level, Clip-Level, or Global-Level Scope)
        const isCurrentFrameLocked = spriteParser.isFrameLocked(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx);
        const activeOffset = spriteParser.getOffset(
            currentEntity.spriteKey,
            this.editorScope !== 'global' ? currentAnimKey : null,
            this.editorScope === 'frame' ? this.assetFrameIdx : null
        );
        let curOffX = activeOffset.offsetX || 0;
        let curOffY = activeOffset.offsetY || 0;
        let curScale = activeOffset.scale !== undefined ? activeOffset.scale : 1.0;

        // Keyboard Arrow Keys & Hotkey Nudging for Fast In-App Editing
        const isShiftHeld = inputManager.keys['Shift'];
        const step = isShiftHeld ? 5 : 1;

        if (inputManager.keys['ArrowLeft'] && !inputManager.previousKeys['ArrowLeft']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, false);
            this.assetIsPaused = true;
            curOffX -= step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
        }
        if (inputManager.keys['ArrowRight'] && !inputManager.previousKeys['ArrowRight']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, false);
            this.assetIsPaused = true;
            curOffX += step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
        }
        if (inputManager.keys['ArrowUp'] && !inputManager.previousKeys['ArrowUp']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, false);
            this.assetIsPaused = true;
            curOffY -= step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
        }
        if (inputManager.keys['ArrowDown'] && !inputManager.previousKeys['ArrowDown']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, false);
            this.assetIsPaused = true;
            curOffY += step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
        }
        if ((inputManager.keys['t'] || inputManager.keys['T']) && (!inputManager.previousKeys['t'] && !inputManager.previousKeys['T'])) {
            const speeds = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];
            const curIdx = speeds.indexOf(this.assetAnimSpeed);
            const nextIdx = (curIdx + 1) % speeds.length;
            this.assetAnimSpeed = speeds[nextIdx >= 0 ? nextIdx : 3];
            try { localStorage.setItem('tempest_asset_anim_speed', this.assetAnimSpeed.toString()); } catch(e) {}
            this.toastMsg = `⏱️ Animation Speed: ${this.assetAnimSpeed}x (Saved)`;
            this.toastTimer = 2.0;
        }

        // Viewport Dragging to Reposition Sprite (Fluid 1:1 Absolute Mouse Tracking)
        if (inputManager.mouseClicked) {
            if (!this.isDraggingSprite) {
                if (inputManager.isHoverInRect(studioX, studioY, studioW, studioH)) {
                    if (isCurrentFrameLocked) {
                        this.toastMsg = `🔒 Frame #${this.assetFrameIdx} is LOCKED! Click [🔓 UNLOCK] on right to edit.`;
                        this.toastTimer = 2.0;
                    } else {
                        this.assetIsPaused = true; // Auto-pause so other frames never shift!
                        this.isDraggingSprite = true;
                        this.dragStartX = inputManager.mouseX;
                        this.dragStartY = inputManager.mouseY;
                        this.dragInitialOffX = curOffX;
                        this.dragInitialOffY = curOffY;
                    }
                }
            } else if (!isCurrentFrameLocked) {
                this.assetIsPaused = true;
                const totalDeltaX = (inputManager.mouseX - this.dragStartX) / (this.assetZoom || 1);
                const totalDeltaY = (inputManager.mouseY - this.dragStartY) / (this.assetZoom || 1);
                curOffX = Math.round(this.dragInitialOffX + totalDeltaX);
                curOffY = Math.round(this.dragInitialOffY + totalDeltaY);
                spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
            }
        } else {
            this.isDraggingSprite = false;
        }

        // Canvas Cursor Styling
        if (canvas) {
            if (this.isDraggingSprite) {
                canvas.style.cursor = 'grabbing';
            } else if (inputManager.isHoverInRect(studioX, studioY, studioW, studioH)) {
                canvas.style.cursor = isCurrentFrameLocked ? 'not-allowed' : 'grab';
            } else {
                canvas.style.cursor = 'default';
            }
        }

        // Center Origin Crosshair & Ground Line Reference
        const groundLineY = studioY + studioH - 35;
        const centerX = studioX + studioW / 2;

        if (this.showGroundLine) {
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(studioX + 10, groundLineY);
            ctx.lineTo(studioX + studioW - 10, groundLineY);
            ctx.stroke();

            // Ground Marker Tag
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('GROUND BASE [Y=0]', studioX + studioW - 14, groundLineY - 4);
        }

        if (this.showCrosshair) {
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(centerX, studioY + 32);
            ctx.lineTo(centerX, studioY + studioH - 10);
            ctx.stroke();
            ctx.setLineDash([]);

            // Center Tag (Drawn near ground so it never collides with frame scrubber pills)
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ORIGIN [X=0]', centerX, groundLineY - 12);
        }

        // In-World Tile Reference Box (32x32)
        if (this.showTileBox) {
            const tileBoxSize = 32 * this.assetZoom * 2;
            const tileBoxX = centerX - tileBoxSize / 2;
            const tileBoxY = groundLineY - tileBoxSize;

            ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
            ctx.fillRect(tileBoxX, tileBoxY, tileBoxSize, tileBoxSize);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(tileBoxX, tileBoxY, tileBoxSize, tileBoxSize);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('32x32 TILE BOUNDS', tileBoxX + 4, tileBoxY + 12);
        }

        // Render Centered Active Sprite with Live Offsets
        const bitmap = spriteParser.getBitmap(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, currentEntity.forcePack || null);
        if (bitmap) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;

            let baseScale = this.assetZoom * curScale;
            if (bitmap.width >= 100) {
                baseScale = 0.5 * this.assetZoom * curScale;
            } else if (bitmap.width <= 32) {
                baseScale = 2.0 * this.assetZoom * curScale;
            } else {
                baseScale = 1.0 * this.assetZoom * curScale;
            }

            const dispW = bitmap.width * baseScale;
            const dispH = bitmap.height * baseScale;

            const drawX = centerX - dispW / 2 + curOffX * this.assetZoom;
            const drawY = groundLineY - dispH + curOffY * this.assetZoom;

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

            // Bounding Box Wireframe
            ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : (this.isDraggingSprite ? '#f59e0b' : 'rgba(168, 85, 247, 0.6)');
            ctx.lineWidth = isCurrentFrameLocked ? 1.5 : 1;
            ctx.setLineDash(isCurrentFrameLocked ? [] : [2, 2]);
            ctx.strokeRect(drawX, drawY, dispW, dispH);
            ctx.setLineDash([]);

            // Pivot Center Crosshair on Sprite
            const pivotX = drawX + dispW / 2;
            const pivotY = drawY + dispH / 2;
            ctx.strokeStyle = '#ec4899';
            ctx.beginPath();
            ctx.moveTo(pivotX - 5, pivotY);
            ctx.lineTo(pivotX + 5, pivotY);
            ctx.moveTo(pivotX, pivotY - 5);
            ctx.lineTo(pivotX, pivotY + 5);
            ctx.stroke();

            ctx.restore();
        }

        // Live Coordinate Readout Badge (Bottom Center of Stage)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(studioX + 10, groundLineY + 6, studioW - 20, 22);
        ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : '#334155';
        ctx.strokeRect(studioX + 10, groundLineY + 6, studioW - 20, 22);

        ctx.fillStyle = isCurrentFrameLocked ? '#4ade80' : '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        const offXSign = curOffX >= 0 ? '+' : '';
        const offYSign = curOffY >= 0 ? '+' : '';
        const scopeLabel = this.editorScope === 'frame' ? `FRAME #${this.assetFrameIdx}` : (this.editorScope === 'clip' ? `CLIP (${currentAnimKey.toUpperCase()})` : 'GLOBAL');
        const lockTag = isCurrentFrameLocked ? '🔒 [LOCKED & SAVED]' : '✏️ [UNLOCKED]';
        ctx.fillText(`${lockTag} SCOPE: [${scopeLabel}] | X: ${offXSign}${Math.round(curOffX)}px, Y: ${offYSign}${Math.round(curOffY)}px | SCALE: ${curScale.toFixed(2)}x`, studioX + studioW / 2, groundLineY + 20);

        // --- TOP PLAYBACK & TOOLBAR STRIP ---
        // 1. Play/Pause Button
        if (inputManager.isClickInRect(studioX + 8, studioY + 8, 62, 22)) {
            this.assetIsPaused = !this.assetIsPaused;
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + 8, studioY + 8, 62, 22);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + 8, studioY + 8, 62, 22);
        ctx.fillStyle = this.assetIsPaused ? '#f59e0b' : '#10b981';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.assetIsPaused ? '⏸ PAUSE' : '▶ PLAY', studioX + 39, studioY + 22);

        // 2. Playback Speed Button [⏱️ 1.0x] (Click to Cycle 0.25x -> 0.5x -> 0.75x -> 1.0x -> 1.5x -> 2.0x)
        if (inputManager.isClickInRect(studioX + 74, studioY + 8, 54, 22)) {
            const speeds = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];
            const curIdx = speeds.indexOf(this.assetAnimSpeed);
            const nextIdx = (curIdx + 1) % speeds.length;
            this.assetAnimSpeed = speeds[nextIdx >= 0 ? nextIdx : 3];
            try { localStorage.setItem('tempest_asset_anim_speed', this.assetAnimSpeed.toString()); } catch(e) {}
            this.toastMsg = `⏱️ Animation Speed: ${this.assetAnimSpeed}x (Saved)`;
            this.toastTimer = 2.0;
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + 74, studioY + 8, 54, 22);
        ctx.strokeStyle = this.assetAnimSpeed !== 1.0 ? '#a855f7' : '#475569';
        ctx.strokeRect(studioX + 74, studioY + 8, 54, 22);
        ctx.fillStyle = this.assetAnimSpeed !== 1.0 ? '#c084fc' : '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`⏱️ ${this.assetAnimSpeed}x`, studioX + 101, studioY + 22);

        // 3. Zoom Button (Top-Right)
        if (inputManager.isClickInRect(studioX + studioW - 56, studioY + 8, 48, 22)) {
            this.assetZoom = this.assetZoom >= 4 ? 1 : this.assetZoom + 1;
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + studioW - 56, studioY + 8, 48, 22);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + studioW - 56, studioY + 8, 48, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`🔍 ${this.assetZoom}x`, studioX + studioW - 32, studioY + 22);

        // --- INTERACTIVE FRAME STRIP SCRUBBER (Center) ---
        const scrubberStartX = studioX + 132;
        const scrubberW = studioW - 192;
        const scrubberY = studioY + 8;
        const scrubberH = 22;

        // Step Back Button [◀]
        if (inputManager.isClickInRect(scrubberStartX, scrubberY, 18, scrubberH)) {
            this.assetIsPaused = true;
            this.assetFrameIdx = (this.assetFrameIdx - 1 + totalFrames) % totalFrames;
        }
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(scrubberStartX, scrubberY, 18, scrubberH);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(scrubberStartX, scrubberY, 18, scrubberH);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('◀', scrubberStartX + 9, scrubberY + 14);

        // Step Forward Button [▶]
        const nextBtnX = scrubberStartX + scrubberW - 18;
        if (inputManager.isClickInRect(nextBtnX, scrubberY, 18, scrubberH)) {
            this.assetIsPaused = true;
            this.assetFrameIdx = (this.assetFrameIdx + 1) % totalFrames;
        }
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(nextBtnX, scrubberY, 18, scrubberH);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(nextBtnX, scrubberY, 18, scrubberH);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('▶', nextBtnX + 9, scrubberY + 14);

        // Individual Clickable Frame Pills with Lock & Override Badges
        const pillsAreaX = scrubberStartX + 22;
        const pillsAreaW = scrubberW - 44;
        const pillW = Math.min(32, Math.max(18, Math.floor((pillsAreaW - (totalFrames - 1) * 2) / totalFrames)));
        const totalPillsWidth = totalFrames * pillW + (totalFrames - 1) * 2;
        const pillsStartX = pillsAreaX + (pillsAreaW - totalPillsWidth) / 2;

        for (let f = 0; f < totalFrames; f++) {
            const pX = pillsStartX + f * (pillW + 2);
            const isFActive = f === this.assetFrameIdx;
            const isFLocked = spriteParser.isFrameLocked(currentEntity.spriteKey, currentAnimKey, f);
            const hasCustom = spriteParser.hasCustomFrameOffset(currentEntity.spriteKey, currentAnimKey, f);

            if (inputManager.isClickInRect(pX, scrubberY, pillW, scrubberH)) {
                this.assetFrameIdx = f;
                this.assetIsPaused = true;
            }

            let pillLabel = `F${f}`;
            if (isFLocked) pillLabel = `🔒${f}`;
            else if (hasCustom) pillLabel = `✏️${f}`;

            if (isFActive) {
                ctx.fillStyle = isFLocked ? '#22c55e' : '#38bdf8';
                ctx.fillRect(pX, scrubberY, pillW, scrubberH);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(pX, scrubberY, pillW, scrubberH);
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 8px monospace';
                ctx.fillText(pillLabel, pX + pillW / 2, scrubberY + 14);
            } else {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
                ctx.fillRect(pX, scrubberY, pillW, scrubberH);
                ctx.strokeStyle = isFLocked ? 'rgba(34, 197, 94, 0.5)' : (hasCustom ? 'rgba(234, 179, 8, 0.5)' : '#334155');
                ctx.lineWidth = isFLocked || hasCustom ? 1.5 : 1;
                ctx.strokeRect(pX, scrubberY, pillW, scrubberH);
                ctx.fillStyle = isFLocked ? '#4ade80' : (hasCustom ? '#facc15' : '#94a3b8');
                ctx.font = '8px monospace';
                ctx.fillText(pillLabel, pX + pillW / 2, scrubberY + 14);
            }
        }

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
        ctx.fillText(`ALL ANIMATION CLIPS (${animList.length} TOTAL - CLICK OR W/S)`, studioX + 12, matrixY + 18);

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

            const aData = AnimationData[currentEntity.spriteKey] ? AnimationData[currentEntity.spriteKey][clip] : null;
            const fCount = aData ? aData.frames : 1;

            ctx.fillStyle = isCSelected ? '#38bdf8' : '#e2e8f0';
            ctx.font = isCSelected ? 'bold 10px monospace' : '10px monospace';
            ctx.textAlign = 'left';
            const niceName = this.formatClipName(clip);
            ctx.fillText(`${isCSelected ? '▶ ' : '  '}${niceName}`, bX + 6, bY + 15);

            ctx.fillStyle = isCSelected ? '#0284c7' : '#64748b';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${fCount}f`, bX + btnW - 6, bY + 15);
        }

        // --- 5. RIGHT COLUMN: SPRITE ALIGNMENT & PIVOT EDITOR (x: 708, w: 234, h: 450) ---
        const rightX = 708;
        const rightY = 42;
        const rightW = 234;
        const rightH = 450;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(rightX, rightY, rightW, rightH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rightX, rightY, rightW, rightH);

        // Dual Tabs: [ 🛠️ ALIGNMENT EDITOR ] vs [ 📊 DOSSIER & STATS ]
        const tab1W = 114;
        const tab2W = 104;
        const tabH = 26;

        if (inputManager.isClickInRect(rightX + 6, rightY + 6, tab1W, tabH)) {
            this.assetTab = 'editor';
        }
        if (inputManager.isClickInRect(rightX + 6 + tab1W + 4, rightY + 6, tab2W, tabH)) {
            this.assetTab = 'dossier';
        }

        // Tab 1 Button
        ctx.fillStyle = this.assetTab === 'editor' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(rightX + 6, rightY + 6, tab1W, tabH);
        ctx.strokeStyle = this.assetTab === 'editor' ? '#38bdf8' : '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(rightX + 6, rightY + 6, tab1W, tabH);
        ctx.fillStyle = this.assetTab === 'editor' ? '#38bdf8' : '#94a3b8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🛠️ ALIGNMENT', rightX + 6 + tab1W / 2, rightY + 17);

        // Tab 2 Button
        ctx.fillStyle = this.assetTab === 'dossier' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(rightX + 6 + tab1W + 4, rightY + 6, tab2W, tabH);
        ctx.strokeStyle = this.assetTab === 'dossier' ? '#a855f7' : '#334155';
        ctx.strokeRect(rightX + 6 + tab1W + 4, rightY + 6, tab2W, tabH);
        ctx.fillStyle = this.assetTab === 'dossier' ? '#a855f7' : '#94a3b8';
        ctx.fillText('📊 STATS', rightX + 6 + tab1W + 4 + tab2W / 2, rightY + 17);

        if (this.assetTab === 'editor') {
            // === ALIGNMENT EDITOR PANEL (FRAME-LEVEL CONTROL & LOCK/SAVE) ===
            let ctrlY = rightY + 34;

            // --- 3-WAY SCOPE SELECTOR ---
            const scopeBtnW = (rightW - 24) / 3;
            const scopeBtnH = 20;

            if (inputManager.isClickInRect(rightX + 10, ctrlY, scopeBtnW, scopeBtnH)) {
                this.editorScope = 'frame';
            }
            if (inputManager.isClickInRect(rightX + 10 + scopeBtnW + 2, ctrlY, scopeBtnW, scopeBtnH)) {
                this.editorScope = 'clip';
            }
            if (inputManager.isClickInRect(rightX + 10 + (scopeBtnW + 2) * 2, ctrlY, scopeBtnW, scopeBtnH)) {
                this.editorScope = 'global';
            }

            const drawScopePill = (x, y, w, h, label, active) => {
                ctx.fillStyle = active ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.7)';
                ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = active ? '#38bdf8' : '#334155';
                ctx.lineWidth = active ? 1.5 : 1;
                ctx.strokeRect(x, y, w, h);
                ctx.fillStyle = active ? '#38bdf8' : '#94a3b8';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(label, x + w / 2, y + 13);
            };

            drawScopePill(rightX + 10, ctrlY, scopeBtnW, scopeBtnH, `🎯 FRAME ${this.assetFrameIdx}`, this.editorScope === 'frame');
            drawScopePill(rightX + 10 + scopeBtnW + 2, ctrlY, scopeBtnW, scopeBtnH, '🎬 CLIP', this.editorScope === 'clip');
            drawScopePill(rightX + 10 + (scopeBtnW + 2) * 2, ctrlY, scopeBtnW, scopeBtnH, '🌐 GLOBAL', this.editorScope === 'global');

            ctrlY += 24;

            // --- PROMINENT LOCK / UNLOCK & SAVE POSITION PANEL ---
            const lockBoxH = 24;
            if (inputManager.isClickInRect(rightX + 10, ctrlY, rightW - 20, lockBoxH)) {
                const newLock = spriteParser.toggleFrameLock(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx);
                if (newLock) {
                    spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
                    this.toastMsg = `🔒 Frame #${this.assetFrameIdx} Position Locked & Saved!`;
                } else {
                    this.toastMsg = `🔓 Frame #${this.assetFrameIdx} Unlocked for editing`;
                }
                this.toastTimer = 2.5;
            }

            if (isCurrentFrameLocked) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
                ctx.fillRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
                ctx.fillStyle = '#4ade80';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`🔒 FRAME #${this.assetFrameIdx} LOCKED (CLICK TO UNLOCK)`, rightX + rightW / 2, ctrlY + 16);
            } else {
                ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
                ctx.fillRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
                ctx.fillStyle = '#fde047';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`💾 SAVE & LOCK FRAME #${this.assetFrameIdx}`, rightX + rightW / 2, ctrlY + 16);
            }

            ctrlY += 28;

            // --- 1. OFFSET X CONTROLS ---
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('OFFSET X (HORIZONTAL PIVOT)', rightX + 10, ctrlY);
            ctrlY += 6;

            const btnBW = 34;
            const btnBH = 20;
            const rowX = rightX + 10;

            const handleNudge = (deltaX, deltaY, deltaScale) => {
                if (isCurrentFrameLocked) {
                    this.toastMsg = `🔒 Frame #${this.assetFrameIdx} is LOCKED! Click [🔓 UNLOCK] above to adjust.`;
                    this.toastTimer = 2.0;
                    return;
                }
                this.assetIsPaused = true;
                if (deltaX) curOffX += deltaX;
                if (deltaY) curOffY += deltaY;
                if (deltaScale) curScale = Math.max(0.2, Math.min(3.0, curScale + deltaScale));
                spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
            };

            // Buttons: [-5] [-1] [Value] [+1] [+5]
            if (inputManager.isClickInRect(rowX, ctrlY, btnBW, btnBH)) handleNudge(-5, 0, 0);
            if (inputManager.isClickInRect(rowX + 38, ctrlY, btnBW, btnBH)) handleNudge(-1, 0, 0);
            if (inputManager.isClickInRect(rowX + 142, ctrlY, btnBW, btnBH)) handleNudge(1, 0, 0);
            if (inputManager.isClickInRect(rowX + 180, ctrlY, btnBW, btnBH)) handleNudge(5, 0, 0);

            const drawNudgeBtn = (bx, by, bw, bh, text, active) => {
                ctx.fillStyle = isCurrentFrameLocked ? 'rgba(30, 41, 59, 0.4)' : (active ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.8)');
                ctx.fillRect(bx, by, bw, bh);
                ctx.strokeStyle = isCurrentFrameLocked ? '#334155' : '#475569';
                ctx.strokeRect(bx, by, bw, bh);
                ctx.fillStyle = isCurrentFrameLocked ? '#64748b' : '#e2e8f0';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(text, bx + bw / 2, by + 14);
            };

            drawNudgeBtn(rowX, ctrlY, btnBW, btnBH, '-5');
            drawNudgeBtn(rowX + 38, ctrlY, btnBW, btnBH, '-1');

            // Center Value Display
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(rowX + 76, ctrlY, 62, btnBH);
            ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : '#38bdf8';
            ctx.strokeRect(rowX + 76, ctrlY, 62, btnBH);
            ctx.fillStyle = isCurrentFrameLocked ? '#4ade80' : '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${offXSign}${Math.round(curOffX)}px`, rowX + 107, ctrlY + 14);

            drawNudgeBtn(rowX + 142, ctrlY, btnBW, btnBH, '+1');
            drawNudgeBtn(rowX + 180, ctrlY, btnBW, btnBH, '+5');

            ctrlY += 25;

            // --- 2. OFFSET Y CONTROLS ---
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('OFFSET Y (VERTICAL PIVOT)', rightX + 10, ctrlY);
            ctrlY += 6;

            if (inputManager.isClickInRect(rowX, ctrlY, btnBW, btnBH)) handleNudge(0, -5, 0);
            if (inputManager.isClickInRect(rowX + 38, ctrlY, btnBW, btnBH)) handleNudge(0, -1, 0);
            if (inputManager.isClickInRect(rowX + 142, ctrlY, btnBW, btnBH)) handleNudge(0, 1, 0);
            if (inputManager.isClickInRect(rowX + 180, ctrlY, btnBW, btnBH)) handleNudge(0, 5, 0);

            drawNudgeBtn(rowX, ctrlY, btnBW, btnBH, '-5');
            drawNudgeBtn(rowX + 38, ctrlY, btnBW, btnBH, '-1');

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(rowX + 76, ctrlY, 62, btnBH);
            ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : '#38bdf8';
            ctx.strokeRect(rowX + 76, ctrlY, 62, btnBH);
            ctx.fillStyle = isCurrentFrameLocked ? '#4ade80' : '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${offYSign}${Math.round(curOffY)}px`, rowX + 107, ctrlY + 14);

            drawNudgeBtn(rowX + 142, ctrlY, btnBW, btnBH, '+1');
            drawNudgeBtn(rowX + 180, ctrlY, btnBW, btnBH, '+5');

            ctrlY += 25;

            // --- 3. SCALE CONTROLS ---
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('SPRITE SCALE RATIO', rightX + 10, ctrlY);
            ctrlY += 6;

            if (inputManager.isClickInRect(rowX, ctrlY, 56, btnBH)) handleNudge(0, 0, -0.1);
            if (inputManager.isClickInRect(rowX + 158, ctrlY, 56, btnBH)) handleNudge(0, 0, 0.1);

            drawNudgeBtn(rowX, ctrlY, 56, btnBH, '-0.1x');

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(rowX + 62, ctrlY, 90, btnBH);
            ctx.strokeStyle = '#a855f7';
            ctx.strokeRect(rowX + 62, ctrlY, 90, btnBH);
            ctx.fillStyle = '#a855f7';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${curScale.toFixed(2)}x`, rowX + 107, ctrlY + 14);

            drawNudgeBtn(rowX + 158, ctrlY, 56, btnBH, '+0.1x');

            ctrlY += 25;

            // --- 4. COPY FRAME OFFSET TO ALL FRAMES ---
            const copyBtnH = 20;
            if (inputManager.isClickInRect(rightX + 10, ctrlY, rightW - 20, copyBtnH)) {
                spriteParser.copyFrameToAll(currentEntity.spriteKey, currentAnimKey, totalFrames, this.assetFrameIdx);
                this.toastMsg = `📋 Copied Frame ${this.assetFrameIdx} offset to all ${totalFrames} frames!`;
                this.toastTimer = 2.5;
            }
            ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
            ctx.fillRect(rightX + 10, ctrlY, rightW - 20, copyBtnH);
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 1;
            ctx.strokeRect(rightX + 10, ctrlY, rightW - 20, copyBtnH);
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`📋 COPY F${this.assetFrameIdx} OFFSET TO ALL FRAMES`, rightX + rightW / 2, ctrlY + 14);

            ctrlY += 24;

            // --- 5. PRESET ACTIONS ---
            const actW = (rightW - 26) / 2;
            const actH = 20;

            if (inputManager.isClickInRect(rightX + 10, ctrlY, actW, actH)) {
                if (!isCurrentFrameLocked) {
                    this.assetIsPaused = true;
                    curOffX = 0;
                    spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
                    this.toastMsg = '🎯 Centered X Pivot (0px)';
                    this.toastTimer = 2.0;
                } else {
                    this.toastMsg = `🔒 Frame #${this.assetFrameIdx} is locked! Unlock to center.`;
                    this.toastTimer = 2.0;
                }
            }
            if (inputManager.isClickInRect(rightX + 10 + actW + 6, ctrlY, actW, actH)) {
                if (!isCurrentFrameLocked) {
                    this.assetIsPaused = true;
                    curOffY = 0;
                    spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, curOffX, curOffY, curScale, this.editorScope);
                    this.toastMsg = '⚓ Grounded Y to Floor';
                    this.toastTimer = 2.0;
                } else {
                    this.toastMsg = `🔒 Frame #${this.assetFrameIdx} is locked! Unlock to ground.`;
                    this.toastTimer = 2.0;
                }
            }

            drawNudgeBtn(rightX + 10, ctrlY, actW, actH, '🎯 Center X');
            drawNudgeBtn(rightX + 10 + actW + 6, ctrlY, actW, actH, '⚓ Ground Y');

            ctrlY += 24;

            if (inputManager.isClickInRect(rightX + 10, ctrlY, rightW - 20, actH)) {
                spriteParser.resetOffset(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, this.editorScope);
                spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, this.assetFrameIdx, false);
                this.toastMsg = `↺ Reset ${this.editorScope.toUpperCase()} Offsets & Unlocked`;
                this.toastTimer = 2.0;
            }
            drawNudgeBtn(rightX + 10, ctrlY, rightW - 20, actH, `↺ Reset (${this.editorScope.toUpperCase()}) & Unlock`);

            ctrlY += 24;

            // --- 6. OVERLAY TOGGLES ---
            if (inputManager.isClickInRect(rightX + 10, ctrlY, actW, actH)) {
                this.showTileBox = !this.showTileBox;
            }
            if (inputManager.isClickInRect(rightX + 10 + actW + 6, ctrlY, actW, actH)) {
                this.showCrosshair = !this.showCrosshair;
            }

            drawNudgeBtn(rightX + 10, ctrlY, actW, actH, this.showTileBox ? '🟩 Tile Box: ON' : '⬛ Tile Box: OFF');
            drawNudgeBtn(rightX + 10 + actW + 6, ctrlY, actW, actH, this.showCrosshair ? '🟨 Center: ON' : '⬛ Center: OFF');

            ctrlY += 24;

            // --- 7. EXPORT / COPY JSON & DOWNLOAD FILE BUTTONS ---
            const expBtnW = (rightW - 26) / 2;
            const expBtnH = 24;

            // Button 1: Copy to Clipboard
            if (inputManager.isClickInRect(rightX + 10, ctrlY, expBtnW, expBtnH)) {
                try {
                    const jsonStr = JSON.stringify(spriteParser.offsets, null, 2);
                    navigator.clipboard.writeText(jsonStr);
                    this.toastMsg = '📋 All Offsets Copied to Clipboard!';
                    this.toastTimer = 3.0;
                } catch(e) {
                    this.toastMsg = '💾 Offsets Saved in LocalStorage!';
                    this.toastTimer = 3.0;
                }
            }

            // Button 2: Download .json File
            if (inputManager.isClickInRect(rightX + 10 + expBtnW + 6, ctrlY, expBtnW, expBtnH)) {
                try {
                    const jsonStr = JSON.stringify(spriteParser.offsets, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'tempest_sprite_offsets.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    this.toastMsg = '💾 Downloaded tempest_sprite_offsets.json!';
                    this.toastTimer = 3.0;
                } catch(e) {}
            }

            ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
            ctx.fillRect(rightX + 10, ctrlY, expBtnW, expBtnH);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1;
            ctx.strokeRect(rightX + 10, ctrlY, expBtnW, expBtnH);
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('📋 COPY JSON', rightX + 10 + expBtnW / 2, ctrlY + 16);

            ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
            ctx.fillRect(rightX + 10 + expBtnW + 6, ctrlY, expBtnW, expBtnH);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.strokeRect(rightX + 10 + expBtnW + 6, ctrlY, expBtnW, expBtnH);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('💾 SAVE FILE', rightX + 10 + expBtnW + 6 + expBtnW / 2, ctrlY + 16);

        } else {
            // === STATS & DOSSIER PANEL ===
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(currentEntity.name, rightX + 12, rightY + 48);

            ctx.fillStyle = '#a855f7';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(currentEntity.title, rightX + 12, rightY + 64);

            // Equip Action Button
            const equipBoxY = rightY + 72;
            const activeSkin = spriteParser.getSkin(currentEntity.spriteKey);
            const isCurrentlyEquipped = currentEntity.forcePack !== null && currentEntity.forcePack === activeSkin;

            if (currentEntity.forcePack !== null) {
                if (inputManager.isClickInRect(rightX + 10, equipBoxY, rightW - 20, 32)) {
                    spriteParser.setSkin(currentEntity.spriteKey, currentEntity.forcePack);
                    this.triggerEquipNotification(context, `✨ EQUIPPED: ${currentEntity.name}`);
                }

                if (isCurrentlyEquipped) {
                    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
                    ctx.fillRect(rightX + 10, equipBoxY, rightW - 20, 32);
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(rightX + 10, equipBoxY, rightW - 20, 32);
                    ctx.fillStyle = '#22c55e';
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('✔ ACTIVE IN GAME', rightX + rightW / 2, equipBoxY + 20);
                } else {
                    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
                    ctx.fillRect(rightX + 10, equipBoxY, rightW - 20, 32);
                    ctx.strokeStyle = '#38bdf8';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(rightX + 10, equipBoxY, rightW - 20, 32);
                    ctx.fillStyle = '#38bdf8';
                    ctx.font = 'bold 10px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚡ EQUIP SKIN (ENTER)', rightX + rightW / 2, equipBoxY + 20);
                }
            }

            // Lore Description Box
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '9px monospace';
            ctx.textAlign = 'left';
            this.wrapText(ctx, currentEntity.lore, rightX + 12, rightY + 118, rightW - 24, 14);

            // Combat Attributes Section
            const statsBoxY = rightY + 200;
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

            // Technical Hardware Specs
            const techBoxY = rightY + 305;
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
        }

        // --- 6. TOAST NOTIFICATION BADGE ---
        if (this.toastTimer > 0) {
            this.toastTimer -= frameDt;
            const toastW = 300;
            const toastH = 28;
            const toastX = (canvas.width - toastW) / 2;
            const toastY = 48;

            ctx.save();
            ctx.fillStyle = 'rgba(6, 11, 20, 0.95)';
            ctx.fillRect(toastX, toastY, toastW, toastH);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(toastX, toastY, toastW, toastH);

            ctx.fillStyle = '#86efac';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.toastMsg, toastX + toastW / 2, toastY + 18);
            ctx.restore();
        }

        // --- 7. FOOTER CONTROLS CHEATSHEET (y: 502, h: 32) ---
        const footerY = 502;
        ctx.fillStyle = '#080e1a';
        ctx.fillRect(0, footerY, canvas.width, 38);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(0, footerY, canvas.width, 38);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALIGNMENT EDITOR: [Drag Preview Stage] Move Sprite • [Buttons] Fine-Tune X / Y / Scale • [A/D] Select Entity • [W/S] Select Clip • [ESC/V] Exit', canvas.width / 2, footerY + 22);
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
