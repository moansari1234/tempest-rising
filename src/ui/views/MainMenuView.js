import { GameState } from '../../core/GameStateManager.js';

export class MainMenuView {
    constructor() {
        this.titleBgImg = new Image();
        this.titleBgImg.src = '/public/sprites/backgrounds/title_bg.jpg';
        this.selectedIdx = 0;
        
        // Ambient golden/mana embers drifting upwards
        this.particles = [];
        for (let i = 0; i < 24; i++) {
            this.particles.push({
                x: Math.random() * 960,
                y: Math.random() * 540,
                size: Math.random() * 2.2 + 0.8,
                speedY: -(Math.random() * 14 + 8),
                speedX: (Math.random() - 0.5) * 6,
                alpha: Math.random() * 0.6 + 0.2,
                color: Math.random() > 0.4 ? '#facc15' : '#38bdf8'
            });
        }
    }

    render(ctx, canvas, context) {
        const { inputManager, gameStateManager, audio } = context;
        const now = Date.now() / 1000;

        // --- 1. MYTHIC CAVERN BACKDROP ---
        if (this.titleBgImg && this.titleBgImg.complete && this.titleBgImg.naturalWidth > 0) {
            ctx.drawImage(this.titleBgImg, 0, 0, canvas.width, canvas.height);
            
            // Rich antique vignette & deep obsidian gradient
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(6, 9, 16, 0.45)');
            grad.addColorStop(0.5, 'rgba(6, 9, 16, 0.60)');
            grad.addColorStop(1, 'rgba(4, 6, 12, 0.94)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#060910';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // --- 2. DRIFTING MAGICULE & GOLD EMBERS ---
        ctx.save();
        for (const p of this.particles) {
            p.y += p.speedY * 0.016;
            p.x += p.speedX * 0.016;
            if (p.y < -10) {
                p.y = canvas.height + 10;
                p.x = Math.random() * canvas.width;
            }
            const pulse = Math.sin(now * 3 + p.x) * 0.2 + 0.8;
            ctx.globalAlpha = p.alpha * pulse;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // --- 3. HIGH-FANTASY TITLE CREST ---
        const cx = canvas.width / 2;
        const titleY = 112;

        ctx.save();
        // Anime Lore Subtitle
        ctx.font = '600 11px "Marcellus", "Cinzel", serif';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fillText('« 転生したらスライムだった件 • THAT TIME I GOT REINCARNATED AS A SLIME »', cx, titleY - 38);

        // Main Title Header: TENSEI SLIME
        ctx.font = '900 46px "Cinzel Decorative", "Cinzel", serif';
        const titleGrad = ctx.createLinearGradient(cx - 180, 0, cx + 180, 0);
        titleGrad.addColorStop(0, '#fef08a');
        titleGrad.addColorStop(0.5, '#ffffff');
        titleGrad.addColorStop(1, '#93c5fd');
        ctx.fillStyle = titleGrad;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 22;
        ctx.fillText('TENSEI SLIME', cx, titleY);

        // Subtitle: TEMPEST RISING
        ctx.font = '700 20px "Cinzel", "Marcellus", serif';
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        ctx.shadowBlur = 12;
        ctx.fillText('✧  TEMPEST RISING  ✧', cx, titleY + 30);

        // Fantasy Flourish Divider
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#eab308';
        ctx.font = '11px serif';
        ctx.fillText('⚜  ────────────  ✦  ────────────  ⚜', cx, titleY + 52);
        ctx.restore();

        // --- 4. FANTASY RPG MENU OPTIONS ---
        const isContinueUnlocked = localStorage.getItem('tempest_save_boss_defeated') === 'true';

        const menuItems = [
            {
                id: 'start',
                title: 'START EXPEDITION',
                desc: 'Enter the Whispering Caverns',
                key: 'Z',
                icon: '⚔',
                enabled: true
            },
            {
                id: 'assets',
                title: 'SANCTUARY & SKINS',
                desc: 'Sprite Archives, Alignment & Speeds',
                key: 'V',
                icon: '🏛',
                enabled: true
            },
            {
                id: 'continue',
                title: 'CONTINUE TALE',
                desc: isContinueUnlocked ? 'Resume Saved Cavern Exploration' : 'Defeat Chapter Boss to Unlock',
                key: 'C',
                icon: '📜',
                enabled: isContinueUnlocked
            }
        ];

        // Keyboard Navigation (W/S or Up/Down)
        if (inputManager.isActionJustPressed('jump')) {
            this.selectedIdx = (this.selectedIdx - 1 + menuItems.length) % menuItems.length;
        } else if (inputManager.isActionJustPressed('crouch')) {
            this.selectedIdx = (this.selectedIdx + 1) % menuItems.length;
        }

        const startY = 224;
        const rowH = 50;
        const menuW = 480;
        const menuX = (canvas.width - menuW) / 2;

        for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            const itemY = startY + i * (rowH + 10);
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
                // Golden Warm Aura Ribbon
                const auraGrad = ctx.createLinearGradient(menuX, 0, menuX + menuW, 0);
                auraGrad.addColorStop(0, 'rgba(234, 179, 8, 0.0)');
                auraGrad.addColorStop(0.2, 'rgba(234, 179, 8, 0.16)');
                auraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.18)');
                auraGrad.addColorStop(0.8, 'rgba(234, 179, 8, 0.16)');
                auraGrad.addColorStop(1, 'rgba(234, 179, 8, 0.0)');
                ctx.fillStyle = auraGrad;
                ctx.fillRect(menuX, itemY, menuW, rowH);

                // Elegant Gold Filament Underline with diamond endcaps
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(menuX + 30, itemY + rowH - 2);
                ctx.lineTo(menuX + menuW - 30, itemY + rowH - 2);
                ctx.stroke();

                // Active Fantasy Diamond Marker
                ctx.fillStyle = '#fde047';
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 8;
                ctx.font = '14px serif';
                ctx.textAlign = 'right';
                ctx.fillText('✦', menuX + 22, itemY + 28);
            }

            // Fantasy Key Indicator (e.g. [ Z ])
            ctx.fillStyle = item.enabled ? (isSelected ? '#facc15' : '#94a3b8') : '#475569';
            ctx.font = '600 12px "Cinzel", serif';
            ctx.textAlign = 'left';
            ctx.fillText(`[ ${item.key} ]`, menuX + 34, itemY + 24);

            // Item Icon & Main Title
            ctx.font = isSelected && item.enabled ? '700 15px "Cinzel", serif' : '600 15px "Cinzel", serif';
            ctx.fillStyle = item.enabled ? (isSelected ? '#ffffff' : '#e2e8f0') : '#475569';
            if (isSelected && item.enabled) {
                ctx.shadowColor = 'rgba(254, 240, 138, 0.6)';
                ctx.shadowBlur = 10;
            }
            ctx.fillText(`${item.icon}  ${item.title}`, menuX + 78, itemY + 24);

            // Subtitle Description
            ctx.shadowBlur = 0;
            ctx.font = '11px "Marcellus", serif';
            ctx.fillStyle = item.enabled ? (isSelected ? '#fef08a' : '#64748b') : '#334155';
            ctx.fillText(item.desc, menuX + 104, itemY + 41);

            ctx.restore();
        }

        // --- 5. HIGH-FANTASY FOOTER BAR ---
        ctx.save();
        ctx.font = '11px "Marcellus", "Cinzel", serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('✧  [WASD / ARROWS] Navigate   •   [Z / ENTER] Select   •   [V] Sanctuary Archives  ✧', canvas.width / 2, canvas.height - 24);
        ctx.restore();

        // --- 6. KEYBOARD SHORTCUTS ---
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
