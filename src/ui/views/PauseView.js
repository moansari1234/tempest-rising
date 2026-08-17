export class PauseView {
    render(ctx, canvas, context) {
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
}
