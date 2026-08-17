import { GameState } from '../../core/GameStateManager.js';

export class MainMenuView {
    constructor() {
        this.titleBgImg = new Image();
        this.titleBgImg.src = '/public/sprites/backgrounds/title_bg.jpg';
    }

    render(ctx, canvas, context) {
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
}
