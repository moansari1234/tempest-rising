export class GameOverView {
    render(ctx, canvas) {
        // Dark Abyssal Backdrop with Crimson Vignette
        const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, 520);
        grad.addColorStop(0, 'rgba(40, 10, 15, 0.92)');
        grad.addColorStop(0.7, 'rgba(15, 5, 8, 0.96)');
        grad.addColorStop(1, 'rgba(4, 2, 4, 0.99)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Modal Frame
        ctx.fillStyle = 'rgba(10, 5, 8, 0.88)';
        ctx.fillRect(cx - 240, cy - 130, 480, 260);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 240, cy - 130, 480, 260);

        // Voice of the World Notice
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('« ❖ MAJOR NOTICE: VOICE OF THE WORLD ❖ »', cx, cy - 85);

        // Header Title
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 32px "Cinzel", serif, monospace';
        ctx.fillText('BODY DISSOLVED', cx, cy - 40);

        // Great Sage Report
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText('« REPORT: GREAT SAGE — Core soul preserved in subspace. »', cx, cy - 5);
        ctx.fillText('« Magical restructuring sequence prepared. Ready to reconstitute form. »', cx, cy + 15);

        // Action Buttons
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(cx - 180, cy + 45, 360, 32);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 180, cy + 45, 360, 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('▶ PRESS [R / ENTER / SPACE] TO REVIVE', cx, cy + 66);

        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText('[ESC / Q] Return to Main Menu', cx, cy + 105);
    }
}
