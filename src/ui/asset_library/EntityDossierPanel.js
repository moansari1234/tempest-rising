import { wrapText } from '../components/UIUtils.js';

export class EntityDossierPanel {
    render(ctx, state, currentEntity, currentAnimKey, totalFrames, entityAnimData, bitmap, context) {
        const { inputManager, spriteParser } = context;
        const rightX = 708;
        const rightY = 42;
        const rightW = 234;

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
                if (context.floaterQueue) {
                    context.floaterQueue.push({
                        text: `✨ EQUIPPED: ${currentEntity.name}`,
                        x: 480,
                        y: 120,
                        color: '#22c55e',
                        lifetime: 2.0,
                        maxLifetime: 2.0
                    });
                }
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
        wrapText(ctx, currentEntity.lore, rightX + 12, rightY + 118, rightW - 24, 14);

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
}
