import { GameState } from '../../core/GameStateManager.js';

export class MainMenuView {
    constructor() {
        this.titleBgImg = new Image();
        this.titleBgImg.src = '/public/sprites/backgrounds/title_bg.jpg';
        this.selectedIdx = 0;
        
        // Ambient subtle magicule motes
        this.particles = [];
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * 960,
                y: Math.random() * 540,
                size: Math.random() * 2 + 0.8,
                speedY: -(Math.random() * 12 + 6),
                alpha: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? '#38bdf8' : '#818cf8'
            });
        }
    }

    render(ctx, canvas, context) {
        const { inputManager, gameStateManager, audio } = context;
        const now = Date.now() / 1000;

        // --- 1. CLEAN CINEMATIC BACKGROUND ---
        if (this.titleBgImg && this.titleBgImg.complete && this.titleBgImg.naturalWidth > 0) {
            ctx.drawImage(this.titleBgImg, 0, 0, canvas.width, canvas.height);
            
            // Rich dark gradient overlay for high contrast and readability
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(4, 7, 14, 0.45)');
            grad.addColorStop(0.5, 'rgba(4, 7, 14, 0.60)');
            grad.addColorStop(1, 'rgba(4, 7, 14, 0.92)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#050a12';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // --- 2. AMBIENT PARTICLES ---
        ctx.save();
        for (const p of this.particles) {
            p.y += p.speedY * 0.016;
            if (p.y < -10) {
                p.y = canvas.height + 10;
                p.x = Math.random() * canvas.width;
            }
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // --- 3. CINEMATIC TITLE LOGO ---
        const cx = canvas.width / 2;
        const titleY = 110;

        ctx.save();
        // Subtle anime badge header
        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('THAT TIME I GOT REINCARNATED AS A SLIME', cx, titleY - 34);

        // Main Title
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        ctx.shadowBlur = 16;
        ctx.fillText('TENSEI SLIME', cx, titleY);

        // Subtitle
        ctx.shadowBlur = 0;
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('— TEMPEST RISING —', cx, titleY + 28);
        ctx.restore();

        // --- 4. SLEEK HORIZONTAL MENU SELECTOR ---
        const isContinueUnlocked = localStorage.getItem('tempest_save_boss_defeated') === 'true';

        const menuItems = [
            {
                id: 'start',
                title: 'START GAME',
                desc: 'Enter Whispering Caverns',
                key: 'Z',
                enabled: true
            },
            {
                id: 'assets',
                title: 'ASSET STUDIO & SKINS',
                desc: 'Inspect models, tune speeds & offsets',
                key: 'V',
                enabled: true
            },
            {
                id: 'continue',
                title: 'CONTINUE CAMPAIGN',
                desc: isContinueUnlocked ? 'Resume saved progress' : 'Defeat Chapter Boss to Unlock',
                key: 'C',
                enabled: isContinueUnlocked
            }
        ];

        // Keyboard navigation (W/S or Up/Down)
        if (inputManager.isActionJustPressed('jump')) {
            this.selectedIdx = (this.selectedIdx - 1 + menuItems.length) % menuItems.length;
        } else if (inputManager.isActionJustPressed('crouch')) {
            this.selectedIdx = (this.selectedIdx + 1) % menuItems.length;
        }

        const startY = 220;
        const rowH = 48;
        const menuW = 460;
        const menuX = (canvas.width - menuW) / 2;

        for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            const itemY = startY + i * (rowH + 12);
            const isHover = inputManager.isHoverInRect(menuX, itemY, menuW, rowH);
            const isSelected = i === this.selectedIdx || isHover;

            if (isHover) this.selectedIdx = i;

            // Handle Click
            if (inputManager.isClickInRect(menuX, itemY, menuW, rowH) && item.enabled) {
                if (item.id === 'start' || item.id === 'continue') {
                    gameStateManager.setState(GameState.PLAYING);
                    if (audio) audio.playBGM();
                } else if (item.id === 'assets') {
                    gameStateManager.setState(GameState.ASSETS);
                }
            }

            ctx.save();
            if (isSelected && item.enabled) {
                // Subtle horizontal glow beam
                const grad = ctx.createLinearGradient(menuX, 0, menuX + menuW, 0);
                grad.addColorStop(0, 'rgba(56, 189, 248, 0.0)');
                grad.addColorStop(0.2, 'rgba(56, 189, 248, 0.14)');
                grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.14)');
                grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
                ctx.fillStyle = grad;
                ctx.fillRect(menuX, itemY, menuW, rowH);

                // Thin accent line below active item
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(menuX + 40, itemY + rowH - 1);
                ctx.lineTo(menuX + menuW - 40, itemY + rowH - 1);
                ctx.stroke();

                // Active cursor arrow
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('▶', menuX + 24, itemY + 28);
            }

            // Key badge
            ctx.fillStyle = item.enabled ? (isSelected ? '#38bdf8' : '#64748b') : '#334155';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`[${item.key}]`, menuX + 38, itemY + 24);

            // Item Title
            ctx.fillStyle = item.enabled ? (isSelected ? '#ffffff' : '#cbd5e1') : '#475569';
            ctx.font = isSelected ? 'bold 14px monospace' : '14px monospace';
            ctx.fillText(item.title, menuX + 76, itemY + 24);

            // Item Description
            ctx.fillStyle = item.enabled ? (isSelected ? '#94a3b8' : '#64748b') : '#334155';
            ctx.font = '10px monospace';
            ctx.fillText(item.desc, menuX + 76, itemY + 40);

            ctx.restore();
        }

        // --- 5. CLEAN BOTTOM CONTROLS FOOTER ---
        ctx.save();
        ctx.font = '10px monospace';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('WASD / Arrows to Navigate  •  Press [Z] or Enter to Select  •  Press [V] for Asset Studio', canvas.width / 2, canvas.height - 24);
        ctx.restore();

        // --- 6. GLOBAL KEYBOARD SHORTCUTS ---
        if (inputManager.isActionJustPressed('attackLight')) {
            const current = menuItems[this.selectedIdx];
            if (current && current.enabled) {
                if (current.id === 'start' || current.id === 'continue') {
                    gameStateManager.setState(GameState.PLAYING);
                    if (audio) audio.playBGM();
                } else if (current.id === 'assets') {
                    gameStateManager.setState(GameState.ASSETS);
                }
            }
        } else if (inputManager.isActionJustPressed('viewAssets')) {
            gameStateManager.setState(GameState.ASSETS);
        } else if (inputManager.isActionJustPressed('parry') && isContinueUnlocked) {
            gameStateManager.setState(GameState.PLAYING);
            if (audio) audio.playBGM();
        }
    }
}
