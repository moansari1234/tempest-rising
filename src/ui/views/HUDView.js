import { AI, Health, Transform, PlayerInput } from '../../ecs/Components.js';

export class HUDView {
    constructor() {
        this.ghostHp = 100;
    }

    render(ctx, canvas, world, playerHealth, context) {
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
        const activeTitle = (context.titleSystem && context.titleSystem.getActiveTitle) ? 
            context.titleSystem.getActiveTitle() : 
            { name: 'Nameless Slime' };
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Rimuru Tempest', barX, hudY + 16);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px "Cinzel", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(activeTitle.name, hudX + hudW - 8, hudY + 16);

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
            { key: 'SHIFT', name: 'DASH', color: '#10b981' },
            { key: 'TAB', name: 'STATUS', color: '#facc15' }
        ];

        let sX = hudX;
        for (const s of skills) {
            const pillW = s.key.length > 3 ? 72 : (s.key.length > 1 ? 58 : 48);
            if (s.key === 'TAB' && context.inputManager && context.inputManager.isClickInRect(sX, skillsY, pillW, 18)) {
                context.gameStateManager.setState(9); // GameState.STATUS
            }
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

        // --- 5. BOSS HEALTH BAR (TOP CENTER - ACTIVE ON ENGAGEMENT) ---
        const playerEntities = world.queryEntities([Transform, PlayerInput]);
        let playerX = 0, playerY = 0;
        if (playerEntities.length > 0) {
            const pTransform = world.getComponent(playerEntities[0], Transform);
            playerX = pTransform.x;
            playerY = pTransform.y;
        }

        const bossEntities = world.queryEntities([AI, Health, Transform]);
        for (const bossId of bossEntities) {
            const ai = world.getComponent(bossId, AI);
            const bossHp = world.getComponent(bossId, Health);
            const bTransform = world.getComponent(bossId, Transform);

            if (ai.type === 'boss_serpent' && bossHp.alive) {
                const distToPlayer = Math.hypot(bTransform.x - playerX, bTransform.y - playerY);
                const isEngaged = distToPlayer < 650 || ai.state === 'chase' || ai.state === 'attack' || bossHp.hp < bossHp.maxHp;

                if (isEngaged) {
                    const bBarW = 460;
                    const bBarH = 14;
                    const bBarX = (canvas.width - bBarW) / 2;
                    const bBarY = 24;

                    // Luxury Boss Frame Backdrop
                    const bgGrad = ctx.createLinearGradient(bBarX, bBarY - 18, bBarX, bBarY + bBarH + 6);
                    bgGrad.addColorStop(0, 'rgba(15, 10, 28, 0.96)');
                    bgGrad.addColorStop(1, 'rgba(5, 5, 12, 0.94)');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(bBarX - 10, bBarY - 18, bBarW + 20, bBarH + 26);
                    ctx.strokeStyle = '#c084fc';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(bBarX - 10, bBarY - 18, bBarW + 20, bBarH + 26);

                    // Boss Name & Title Header
                    ctx.fillStyle = '#fde047';
                    ctx.font = 'bold 10px "Cinzel", serif, monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText('⚜️ GIANT TEMPEST SERPENT — APEX PREDATOR (黒蛇)', bBarX, bBarY - 5);

                    ctx.fillStyle = '#c084fc';
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'right';
                    ctx.fillText('THREAT: A-RANK CALAMITY', bBarX + bBarW, bBarY - 5);

                    // Health Bar Fill
                    const bRatio = Math.max(0, bossHp.hp / bossHp.maxHp);
                    ctx.fillStyle = '#3b0764';
                    ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
                    
                    const hpGrad = ctx.createLinearGradient(bBarX, bBarY, bBarX + bBarW, bBarY);
                    hpGrad.addColorStop(0, '#dc2626');
                    hpGrad.addColorStop(0.5, '#ef4444');
                    hpGrad.addColorStop(1, '#f97316');
                    ctx.fillStyle = hpGrad;
                    ctx.fillRect(bBarX, bBarY, bBarW * bRatio, bBarH);

                    // Border
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(bBarX, bBarY, bBarW, bBarH);

                    // HP Number Text
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${Math.round(bossHp.hp)} / ${bossHp.maxHp}`, bBarX + bBarW / 2, bBarY + 11);
                }
            }
        }
    }
}
