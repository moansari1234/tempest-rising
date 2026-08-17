import { GameState } from '../../core/GameStateManager.js';

export class MainMenuView {
    constructor() {
        this.titleBgImg = new Image();
        this.titleBgImg.src = '/public/sprites/backgrounds/title_bg.jpg';
        
        // Floating Magicule Motes for Title Screen Atmosphere
        this.particles = [];
        for (let i = 0; i < 28; i++) {
            this.particles.push({
                x: Math.random() * 960,
                y: Math.random() * 540,
                size: Math.random() * 2.5 + 1,
                speedY: -(Math.random() * 15 + 10),
                speedX: (Math.random() - 0.5) * 8,
                alpha: Math.random() * 0.7 + 0.3,
                color: Math.random() > 0.4 ? '#38bdf8' : '#a855f7'
            });
        }
    }

    render(ctx, canvas, context) {
        const { inputManager, gameStateManager, audio } = context;
        const now = Date.now() / 1000;

        // --- 1. TITLE BACKGROUND ARTWORK ---
        if (this.titleBgImg && this.titleBgImg.complete && this.titleBgImg.naturalWidth > 0) {
            ctx.drawImage(this.titleBgImg, 0, 0, canvas.width, canvas.height);
            
            // Atmospheric Vignette & Deep Blue Gradient
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(5, 10, 20, 0.45)');
            grad.addColorStop(0.4, 'rgba(5, 10, 20, 0.25)');
            grad.addColorStop(0.8, 'rgba(5, 10, 20, 0.75)');
            grad.addColorStop(1, 'rgba(3, 7, 18, 0.95)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // --- 2. DRIFTING MAGICULE PARTICLES ---
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
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // --- 3. GAME TITLE LOGO & TYPOGRAPHY ---
        const titleCenterX = canvas.width / 2;
        const titleCenterY = canvas.height * 0.26;

        ctx.save();
        // Japanese Lore Subheading
        ctx.font = 'bold 11px "Rajdhani", "Orbitron", monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '4px';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 6;
        ctx.fillText('« 転生したらスライムだった件 • THAT TIME I GOT REINCARNATED AS A SLIME »', titleCenterX, titleCenterY - 44);

        // Main Title Header: TENSEI SLIME
        ctx.font = '900 44px "Cinzel Decorative", "Orbitron", serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 24;
        ctx.fillText('TENSEI SLIME', titleCenterX, titleCenterY);

        // Secondary Title Header: TEMPEST RISING
        const pulseGlow = Math.sin(now * 4) * 6 + 18;
        ctx.font = '900 28px "Orbitron", "Rajdhani", sans-serif';
        const titleGrad = ctx.createLinearGradient(titleCenterX - 200, 0, titleCenterX + 200, 0);
        titleGrad.addColorStop(0, '#38bdf8');
        titleGrad.addColorStop(0.5, '#e0f2fe');
        titleGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = titleGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = pulseGlow;
        ctx.fillText('⚡ TEMPEST RISING ⚡', titleCenterX, titleCenterY + 34);

        // Ornamental Decorative Divider
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('◆ ────────── ❖ GREAT SAGE ENGINE v2.5 ❖ ────────── ◆', titleCenterX, titleCenterY + 54);
        ctx.restore();

        // --- 4. INTERACTIVE GAME BUTTONS ---
        const btnW = 320;
        const btnH = 44;
        const btnStartX = (canvas.width - btnW) / 2;
        const firstBtnY = canvas.height * 0.49;
        const btnSpacing = 54;

        const isContinueUnlocked = localStorage.getItem('tempest_save_boss_defeated') === 'true';

        const buttons = [
            {
                id: 'start',
                label: 'START GAME',
                sub: 'Embark into Whispering Caverns',
                key: 'Z',
                color: '#38bdf8',
                hoverColor: '#7dd3fc',
                enabled: true
            },
            {
                id: 'assets',
                label: 'ASSET GALLERY & SKINS',
                sub: 'Inspect Models & Align Offsets',
                key: 'V',
                color: '#a855f7',
                hoverColor: '#c084fc',
                enabled: true
            },
            {
                id: 'continue',
                label: 'CONTINUE CAMPAIGN',
                sub: isContinueUnlocked ? 'Resume Saved Expedition' : 'Beat Boss to Unlock Checkpoint',
                key: 'C',
                color: isContinueUnlocked ? '#22c55e' : '#475569',
                hoverColor: isContinueUnlocked ? '#4ade80' : '#475569',
                enabled: isContinueUnlocked
            }
        ];

        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            const btnY = firstBtnY + i * btnSpacing;
            const isHover = inputManager.isHoverInRect(btnStartX, btnY, btnW, btnH);
            const isClick = inputManager.isClickInRect(btnStartX, btnY, btnW, btnH);

            // Handle Click
            if (isClick && btn.enabled) {
                if (btn.id === 'start' || btn.id === 'continue') {
                    gameStateManager.setState(GameState.PLAYING);
                    if (audio) audio.playBGM();
                } else if (btn.id === 'assets') {
                    gameStateManager.setState(GameState.ASSETS);
                }
            }

            ctx.save();
            // Button Glass Background
            const bgGrad = ctx.createLinearGradient(btnStartX, btnY, btnStartX + btnW, btnY + btnH);
            if (btn.enabled) {
                if (isHover) {
                    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
                    bgGrad.addColorStop(1, 'rgba(30, 58, 138, 0.6)');
                } else {
                    bgGrad.addColorStop(0, 'rgba(10, 15, 26, 0.88)');
                    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.88)');
                }
            } else {
                bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.5)');
                bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.5)');
            }
            ctx.fillStyle = bgGrad;
            ctx.fillRect(btnStartX, btnY, btnW, btnH);

            // Border & Glow
            ctx.strokeStyle = isHover && btn.enabled ? btn.hoverColor : (btn.enabled ? btn.color : '#334155');
            ctx.lineWidth = isHover && btn.enabled ? 2 : 1.2;
            if (isHover && btn.enabled) {
                ctx.shadowColor = btn.color;
                ctx.shadowBlur = 12;
            }
            ctx.strokeRect(btnStartX, btnY, btnW, btnH);

            // Decorative Corner Bracket Accents
            const bracketSize = 6;
            ctx.fillStyle = btn.enabled ? btn.color : '#475569';
            // Top-Left
            ctx.fillRect(btnStartX, btnY, bracketSize, 2);
            ctx.fillRect(btnStartX, btnY, 2, bracketSize);
            // Top-Right
            ctx.fillRect(btnStartX + btnW - bracketSize, btnY, bracketSize, 2);
            ctx.fillRect(btnStartX + btnW - 2, btnY, 2, bracketSize);
            // Bottom-Left
            ctx.fillRect(btnStartX, btnY + btnH - 2, bracketSize, 2);
            ctx.fillRect(btnStartX, btnY + btnH - bracketSize, 2, bracketSize);
            // Bottom-Right
            ctx.fillRect(btnStartX + btnW - bracketSize, btnY + btnH - 2, bracketSize, 2);
            ctx.fillRect(btnStartX + btnW - 2, btnY + btnH - bracketSize, 2, bracketSize);

            // Left Key Badge Pill
            const pillW = 34;
            const pillH = 22;
            const pillX = btnStartX + 12;
            const pillY = btnY + (btnH - pillH) / 2;
            ctx.fillStyle = btn.enabled ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.4)';
            ctx.fillRect(pillX, pillY, pillW, pillH);
            ctx.strokeStyle = btn.enabled ? btn.color : '#475569';
            ctx.lineWidth = 1;
            ctx.strokeRect(pillX, pillY, pillW, pillH);

            ctx.font = 'bold 11px "Orbitron", monospace';
            ctx.fillStyle = btn.enabled ? '#ffffff' : '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText(btn.key, pillX + pillW / 2, pillY + 15);

            // Button Main Label
            ctx.font = 'bold 13px "Orbitron", "Rajdhani", sans-serif';
            ctx.fillStyle = btn.enabled ? (isHover ? '#ffffff' : btn.color) : '#64748b';
            ctx.textAlign = 'left';
            ctx.fillText(btn.label, pillX + pillW + 14, btnY + 20);

            // Button Subtitle Description
            ctx.font = '9px "Rajdhani", monospace';
            ctx.fillStyle = btn.enabled ? '#94a3b8' : '#475569';
            ctx.fillText(btn.sub, pillX + pillW + 14, btnY + 34);

            // Right Arrow Prompt
            if (btn.enabled) {
                const bounceX = isHover ? Math.sin(now * 10) * 3 : 0;
                ctx.fillStyle = btn.color;
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('▶', btnStartX + btnW - 14 + bounceX, btnY + 27);
            }

            ctx.restore();
        }

        // --- 5. BOTTOM CONTROLS CHEATSHEET STRIP ---
        const footerH = 34;
        const footerY = canvas.height - footerH;

        ctx.fillStyle = 'rgba(6, 11, 20, 0.94)';
        ctx.fillRect(0, footerY, canvas.width, footerH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, footerY, canvas.width, footerH);

        ctx.font = 'bold 10px "Rajdhani", "Orbitron", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 CONTROLS: [WASD / ARROWS] Move  •  [SPACE] Jump  •  [Z / X] Light / Heavy Attack  •  [C] Parry  •  [E] Devour  •  [SHIFT] Dash', canvas.width / 2, footerY + 21);

        // --- 6. KEYBOARD SHORTCUTS HANDLER ---
        if (inputManager.isActionJustPressed('attackLight')) {
            gameStateManager.setState(GameState.PLAYING);
            if (audio) audio.playBGM();
        } else if (inputManager.isActionJustPressed('viewAssets')) {
            gameStateManager.setState(GameState.ASSETS);
        } else if (inputManager.isActionJustPressed('parry') && isContinueUnlocked) {
            gameStateManager.setState(GameState.PLAYING);
            if (audio) audio.playBGM();
        }
    }
}
