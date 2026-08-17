import { Transform, Health, CombatData, PlayerInput } from '../../ecs/Components.js';
import { GameState } from '../../core/GameStateManager.js';
import { wrapText } from '../components/UIUtils.js';

export class StatusView {
    constructor() {
        // Serene, static presentation matching reference artwork
    }

    render(ctx, canvas, world, playerHealth, context, dt) {
        const { inputManager, gameStateManager, spriteParser, xpSystem } = context;

        // Dark dimming backdrop
        ctx.fillStyle = 'rgba(2, 4, 8, 0.88)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- 1. OUTER ORNATE GOLD & OBSIDIAN FRAME (w: 860, h: 492, x: 50, y: 24) ---
        const winX = 50;
        const winY = 24;
        const winW = 860;
        const winH = 492;

        // Dark midnight slate background
        ctx.fillStyle = '#060B14';
        ctx.fillRect(winX, winY, winW, winH);

        // Gold Beveled Border
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.strokeRect(winX, winY, winW, winH);

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.strokeRect(winX + 4, winY + 4, winW - 8, winH - 8);

        // Sapphire Gemstones in 4 Corners
        const drawGemCorner = (gx, gy) => {
            ctx.fillStyle = '#1e3a8a';
            ctx.beginPath();
            ctx.arc(gx, gy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(gx - 8, gy - 8, 16, 16);
        };
        drawGemCorner(winX + 4, winY + 4);
        drawGemCorner(winX + winW - 4, winY + 4);
        drawGemCorner(winX + 4, winY + winH - 4);
        drawGemCorner(winX + winW - 4, winY + winH - 4);

        // Top Centered "STATUS" Header Ribbon
        const headW = 160;
        const headH = 26;
        const headX = winX + (winW - headW) / 2;
        const headY = winY - 12;

        ctx.fillStyle = '#0a1020';
        ctx.fillRect(headX, headY, headW, headH);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.strokeRect(headX, headY, headW, headH);

        // Header Gemstones
        drawGemCorner(headX + 4, headY + headH / 2);
        drawGemCorner(headX + headW - 4, headY + headH / 2);

        ctx.font = 'bold 15px "Cinzel", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('STATUS', headX + headW / 2, headY + 18);

        // Dynamic player stats lookup
        const pLevel = (xpSystem && xpSystem.level) ? xpSystem.level : 1;
        const currXP = (xpSystem && xpSystem.currentXP) ? xpSystem.currentXP : 0;
        const maxXP = (xpSystem && xpSystem.getXPThreshold) ? xpSystem.getXPThreshold(pLevel) : 50;

        let playerHp = 250, playerMaxHp = 250, playerMp = 120, playerMaxMp = 120;
        if (playerHealth) {
            playerHp = Math.round(playerHealth.hp);
            playerMaxHp = playerHealth.maxHp;
            playerMp = playerHealth.mp !== undefined ? Math.round(playerHealth.mp) : 120;
            playerMaxMp = playerHealth.maxMp || 120;
        }

        // --- 2. LEFT COLUMN: CHARACTER ID & ATTRIBUTES (w: 248, x: 66) ---
        const col1X = winX + 16;
        const col1W = 248;

        // Box A: Identity Header Card
        const idCardY = winY + 22;
        const idCardH = 100;
        this.drawCardFrame(ctx, col1X, idCardY, col1W, idCardH);

        // Dynamic title lookup
        const activeTitle = (context.titleSystem && context.titleSystem.getActiveTitle) ? 
            context.titleSystem.getActiveTitle() : 
            { name: 'Nameless Slime', desc: 'A newly reincarnated, unidentified monster.', bonus: 'None' };

        // Header ribbon: Active Title
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(col1X + 8, idCardY + 6, col1W - 16, 18);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(col1X + 8, idCardY + 6, col1W - 16, 18);

        ctx.font = 'bold 10px "Cinzel", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(activeTitle.name.toUpperCase(), col1X + col1W / 2, idCardY + 19);

        // Name: RIMURU
        ctx.font = '900 24px "Cinzel Decorative", "Cinzel", serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('RIMURU', col1X + 14, idCardY + 54);

        // Japanese: リムル＝テンペスト
        ctx.font = '12px "Marcellus", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('リムル＝テンペスト', col1X + 14, idCardY + 74);

        // Level: Lv. 100
        ctx.font = 'bold 16px "Cinzel", monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'right';
        ctx.fillText(`Lv. ${pLevel}`, col1X + col1W - 14, idCardY + 64);

        // Box B: Vitals & Combat Attributes Card
        const statCardY = idCardY + idCardH + 10;
        const statCardH = 208;
        this.drawCardFrame(ctx, col1X, statCardY, col1W, statCardH);

        // HP Gauge Bar
        const barX = col1X + 64;
        const barW = col1W - 80;
        const hpY = statCardY + 18;
        
        ctx.font = 'bold 12px "Cinzel", monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'left';
        ctx.fillText('💖 HP', col1X + 14, hpY + 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${playerHp} / ${playerMaxHp}`, col1X + col1W - 14, hpY + 12);

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(barX, hpY + 18, barW, 8);
        const hpRatio = Math.min(1, Math.max(0, playerHp / playerMaxHp));
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(barX, hpY + 18, barW * hpRatio, 8);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, hpY + 18, barW, 8);

        // MP Gauge Bar
        const mpY = hpY + 36;
        ctx.font = 'bold 12px "Cinzel", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('💧 MP', col1X + 14, mpY + 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${playerMp} / ${playerMaxMp}`, col1X + col1W - 14, mpY + 12);

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(barX, mpY + 18, barW, 8);
        const mpRatio = Math.min(1, Math.max(0, playerMp / playerMaxMp));
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(barX, mpY + 18, barW * mpRatio, 8);
        ctx.strokeStyle = '#eab308';
        ctx.strokeRect(barX, mpY + 18, barW, 8);

        // Divider
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(col1X + 14, mpY + 36);
        ctx.lineTo(col1X + col1W - 14, mpY + 36);
        ctx.stroke();

        // Combat Stats (ATK, DEF, SPEED)
        const statItems = [
            { icon: '⚔️', label: 'ATK', val: '45', color: '#facc15' },
            { icon: '🛡️', label: 'DEF', val: '28', color: '#94a3b8' },
            { icon: '👢', label: 'SPEED', val: '200', color: '#e2e8f0' }
        ];

        for (let s = 0; s < statItems.length; s++) {
            const rowY = mpY + 54 + s * 28;
            ctx.font = 'bold 13px "Cinzel", monospace';
            ctx.fillStyle = statItems[s].color;
            ctx.textAlign = 'left';
            ctx.fillText(`${statItems[s].icon} ${statItems[s].label}`, col1X + 16, rowY);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(statItems[s].val, col1X + col1W - 18, rowY);
        }

        // Box C: Experience Card
        const expCardY = statCardY + statCardH + 10;
        const expCardH = 74;
        this.drawCardFrame(ctx, col1X, expCardY, col1W, expCardH);

        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('EXP', col1X + 14, expCardY + 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${currXP} / ${maxXP}`, col1X + col1W - 14, expCardY + 22);

        // Green XP Progress Bar
        const xpRatio = Math.min(1, Math.max(0, currXP / maxXP));
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(col1X + 14, expCardY + 36, col1W - 28, 10);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(col1X + 14, expCardY + 36, (col1W - 28) * xpRatio, 10);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.strokeRect(col1X + 14, expCardY + 36, col1W - 28, 10);

        // --- 3. CENTER COLUMN: SANCTUM SHOWCASE (w: 296, x: 326) ---
        const col2X = col1X + col1W + 12;
        const col2W = 296;

        // Header: SPECIES Slime
        const specY = winY + 22;
        const specH = 42;
        this.drawCardFrame(ctx, col2X, specY, col2W, specH);
        ctx.font = 'bold 10px "Cinzel", monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText('SPECIES', col2X + col2W / 2, specY + 16);
        ctx.font = 'bold 14px "Cinzel", serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Slime', col2X + col2W / 2, specY + 33);

        // Center Stage: Stone Sanctum with Torches & Summoning Circle
        const stageY = specY + specH + 8;
        const stageH = 266;
        this.drawCardFrame(ctx, col2X, stageY, col2W, stageH);

        // Sanctum Arched Stone Background
        ctx.save();
        ctx.fillStyle = '#040812';
        ctx.fillRect(col2X + 4, stageY + 4, col2W - 8, stageH - 8);

        // Arched Stone Pillars
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(col2X + col2W / 2, stageY + 90, 75, Math.PI, 0);
        ctx.stroke();

        // Blue Wall Torches with Ambient Flames
        const drawTorch = (tx, ty) => {
            ctx.fillStyle = '#334155';
            ctx.fillRect(tx - 3, ty, 6, 20);
            ctx.fillStyle = '#b45309';
            ctx.fillRect(tx - 5, ty - 4, 10, 6);
            
            // Blue Magic Flame
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(tx, ty - 10, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#bae6fd';
            ctx.beginPath();
            ctx.arc(tx, ty - 12, 3.5, 0, Math.PI * 2);
            ctx.fill();
        };
        drawTorch(col2X + 36, stageY + 90);
        drawTorch(col2X + col2W - 36, stageY + 90);

        // Glowing Blue Summoning Circle on the floor
        const circleCenterX = col2X + col2W / 2;
        const circleCenterY = stageY + 195;
        
        ctx.save();
        ctx.translate(circleCenterX, circleCenterY);
        ctx.scale(1.0, 0.35); // Elliptical floor projection
        
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 72, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(0, 0, 58, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Runic Star inside circle
        ctx.strokeStyle = '#60a5fa';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const ang = (i * Math.PI) / 3;
            const x1 = Math.cos(ang) * 58;
            const y1 = Math.sin(ang) * 58;
            const x2 = Math.cos(ang + (Math.PI * 2) / 3) * 58;
            const y2 = Math.sin(ang + (Math.PI * 2) / 3) * 58;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
        ctx.restore();

        // Render Static, Serene, Perfectly Sized Rimuru Slime Portrait on Stage
        const slimeBmp = spriteParser.getBitmap('rimuru', 'idle', 0);
        if (slimeBmp) {
            ctx.imageSmoothingEnabled = false;
            // Strict bounding box: max 140px width, max 95px height
            const maxW = 140;
            const maxH = 95;
            const scale = Math.min(maxW / slimeBmp.width, maxH / slimeBmp.height);
            const sW = slimeBmp.width * scale;
            const sH = slimeBmp.height * scale;
            const slimeDrawX = circleCenterX - sW / 2;
            const slimeDrawY = circleCenterY - sH + 6;
            ctx.drawImage(slimeBmp, slimeDrawX, slimeDrawY, sW, sH);
        }
        ctx.restore();

        // Title Header Card below stage
        const titleCardY = stageY + stageH + 8;
        const titleCardH = 40;
        this.drawCardFrame(ctx, col2X, titleCardY, col2W, titleCardH);
        ctx.font = 'bold 9px "Cinzel", monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText('TITLE', col2X + col2W / 2, titleCardY + 14);
        ctx.font = 'bold 13px "Cinzel", serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(activeTitle.name, col2X + col2W / 2, titleCardY + 30);

        // Lore Description Box
        const loreY = titleCardY + titleCardH + 8;
        const loreH = 50;
        this.drawCardFrame(ctx, col2X, loreY, col2W, loreH);

        // Miniature Slime Face Icon
        const avX = col2X + 16;
        const avY = loreY + 14;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(avX + 10, avY + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillText('◕‿◕', avX + 10, avY + 14);

        ctx.font = '9px "Marcellus", monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';
        wrapText(ctx, activeTitle.desc, col2X + 42, loreY + 16, col2W - 50, 12);

        // --- 4. RIGHT COLUMN: ACQUIRED ABILITIES & RESISTANCES (w: 254, x: 638) ---
        const col3X = col2X + col2W + 12;
        const col3W = 254;

        // Section Header: ACQUIRED ABILITIES
        const abilHeadY = winY + 22;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(col3X, abilHeadY, col3W, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(col3X, abilHeadY, col3W, 20);
        ctx.font = 'bold 10px "Cinzel", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('ACQUIRED ABILITIES', col3X + col3W / 2, abilHeadY + 14);

        const abilities = [
            { name: 'PREDATOR DEVOUR', desc: 'Devours the target and absorbs their abilities.', iconColor: '#38bdf8', iconChar: '🦷' },
            { name: 'WATER SLASHES', desc: 'Slices enemies with high-speed water blades.', iconColor: '#0ea5e9', iconChar: '🌊' },
            { name: 'GLUTTONY BARRIER', desc: 'A defensive barrier that absorbs attacks.', iconColor: '#a855f7', iconChar: '🛡️' },
            { name: 'MIMIC', desc: 'Mimics the appearance and voice of others.', iconColor: '#22c55e', iconChar: '✨' },
            { name: 'DEVOUR HARVEST', desc: 'Increases magicules and skills when devouring.', iconColor: '#f59e0b', iconChar: '⏳' }
        ];

        let abY = abilHeadY + 26;
        for (const ab of abilities) {
            const boxH = 40;
            this.drawAbilityCard(ctx, col3X, abY, col3W, boxH, ab.name, ab.desc, ab.iconColor, ab.iconChar);
            abY += boxH + 6;
        }

        // Section Header: RESISTANCES
        const resHeadY = abY + 4;
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(col3X, resHeadY, col3W, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(col3X, resHeadY, col3W, 20);
        ctx.font = 'bold 10px "Cinzel", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('RESISTANCES', col3X + col3W / 2, resHeadY + 14);

        const resistances = [
            { name: 'POISON IMMUNITY', desc: 'Immune to Poison.', iconColor: '#a855f7', iconChar: '☠️' },
            { name: 'HEAT RESISTANCE', desc: 'Reduces damage from fire.', iconColor: '#ef4444', iconChar: '🔥' },
            { name: 'PHYSICAL RESISTANCE', desc: 'Reduces physical damage.', iconColor: '#38bdf8', iconChar: '🛡️' }
        ];

        let resY = resHeadY + 26;
        for (const res of resistances) {
            const boxH = 34;
            this.drawAbilityCard(ctx, col3X, resY, col3W, boxH, res.name, res.desc, res.iconColor, res.iconChar);
            resY += boxH + 5;
        }

        // --- 5. FOOTER NAVIGATION (PAGE 1 / 1 & BACK) ---
        const footY = winY + winH - 24;
        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText('◀ L      PAGE 1 / 1      R ▶', winX + winW / 2, footY + 14);

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'right';
        ctx.fillText('Ⓑ BACK [TAB / ESC]', winX + winW - 24, footY + 14);

        // Handle Close Trigger
        if (inputManager.isActionJustPressed('pause') || inputManager.isActionJustPressed('toggleStatus')) {
            gameStateManager.setState(GameState.PLAYING);
            inputManager.consumeAction('pause');
            inputManager.consumeAction('toggleStatus');
        }
    }

    drawCardFrame(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(8, 14, 26, 0.92)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    }

    drawAbilityCard(ctx, x, y, w, h, name, desc, iconColor, iconChar) {
        ctx.fillStyle = 'rgba(10, 16, 30, 0.9)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // Left Icon Box
        const iconSize = h - 8;
        const iconX = x + 4;
        const iconY = y + 4;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(iconX, iconY, iconSize, iconSize);
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(iconX, iconY, iconSize, iconSize);

        ctx.font = '14px monospace';
        ctx.fillStyle = iconColor;
        ctx.textAlign = 'center';
        ctx.fillText(iconChar, iconX + iconSize / 2, iconY + iconSize / 2 + 5);

        // Name & Description
        ctx.font = 'bold 10px "Cinzel", monospace';
        ctx.fillStyle = iconColor;
        ctx.textAlign = 'left';
        ctx.fillText(name, iconX + iconSize + 8, y + 14);

        ctx.font = '8px "Marcellus", monospace';
        ctx.fillStyle = '#cbd5e1';
        wrapText(ctx, desc, iconX + iconSize + 8, y + 26, w - iconSize - 16, 10);
    }
}
