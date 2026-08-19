import { createGoblin, createGoblinArcher } from '../../prefabs/GoblinPrefab.js';
import { createTempestSerpent } from '../../prefabs/BossPrefab.js';
import { Transform, Health, PlayerInput, AI } from '../../ecs/Components.js';
import { GameState } from '../../core/GameStateManager.js';

export class ZenSandboxHUD {
    constructor() {
        this.godMode = true;
    }

    render(ctx, canvas, world, playerHealth, context) {
        const { inputManager, gameStateManager } = context;

        // Top Banner
        ctx.fillStyle = 'rgba(8, 14, 26, 0.88)';
        ctx.fillRect(canvas.width / 2 - 190, 10, 380, 28);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(canvas.width / 2 - 190, 10, 380, 28);

        ctx.font = 'bold 12px "Cinzel", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('🧘 ZEN TRAINING DOJO  •  COMBAT SANDBOX', canvas.width / 2, 28);

        // Quick Spawner Toolstrip
        const toolbarW = 680;
        const toolbarH = 34;
        const toolbarX = (canvas.width - toolbarW) / 2;
        const toolbarY = canvas.height - 46;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(toolbarX, toolbarY, toolbarW, toolbarH);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(toolbarX, toolbarY, toolbarW, toolbarH);

        const buttons = [
            { key: '7', label: 'GOBLIN', color: '#4ade80', action: () => this.spawnEnemy(world, 'goblin') },
            { key: '8', label: 'ARCHER', color: '#38bdf8', action: () => this.spawnEnemy(world, 'archer') },
            { key: '9', label: 'BOSS SERPENT', color: '#f87171', action: () => this.spawnEnemy(world, 'boss') },
            { key: 'G', label: `GOD MODE: ${this.godMode ? 'ON' : 'OFF'}`, color: this.godMode ? '#facc15' : '#94a3b8', action: () => { this.godMode = !this.godMode; } },
            { key: 'C', label: 'CLEAR', color: '#f43f5e', action: () => this.clearEnemies(world) },
            { key: 'M', label: 'MENU', color: '#cbd5e1', action: () => gameStateManager.setState(GameState.MENU) }
        ];

        let bX = toolbarX + 10;
        for (const b of buttons) {
            const btnW = b.label.length > 8 ? 130 : 88;
            const isHover = inputManager.isClickInRect(bX, toolbarY + 4, btnW, 26);
            if (isHover) {
                b.action();
            }

            // Keyboard shortcuts (7, 8, 9, G, C, M)
            if (inputManager.isActionJustPressed(b.key) || (inputManager.keys[b.key] && !inputManager.previousKeys[b.key])) {
                b.action();
            }

            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
            ctx.fillRect(bX, toolbarY + 4, btnW, 26);
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(bX, toolbarY + 4, btnW, 26);

            ctx.fillStyle = b.color;
            ctx.font = 'bold 9px "Cinzel", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`[${b.key}] ${b.label}`, bX + btnW / 2, toolbarY + 20);

            bX += btnW + 8;
        }

        // Apply God Mode effect if active
        if (this.godMode && playerHealth) {
            playerHealth.hp = playerHealth.maxHp;
            if (playerHealth.mp !== undefined) playerHealth.mp = playerHealth.maxMp || 120;
        }
    }

    spawnEnemy(world, type) {
        // Spawn near center of arena
        const spawnX = 22 * 32;
        const spawnY = 11 * 32;

        if (type === 'goblin') {
            createGoblin(world, spawnX, spawnY);
        } else if (type === 'archer') {
            createGoblinArcher(world, spawnX, spawnY);
        } else if (type === 'boss') {
            createTempestSerpent(world, spawnX, spawnY - 64);
        }
    }

    clearEnemies(world) {
        const enemies = world.queryEntities([AI, Health]);
        for (const eid of enemies) {
            world.destroyEntity(eid);
        }
    }
}
