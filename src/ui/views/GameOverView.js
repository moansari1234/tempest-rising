export class GameOverView {
    render(ctx, canvas) {
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
}
