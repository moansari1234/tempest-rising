import { wrapText } from './UIUtils.js';

export class GreatSageToast {
    render(ctx, canvas, context) {
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
        wrapText(ctx, msg, popX + 12, popY + 36, popW - 24, 14);

        ctx.restore();
    }
}
