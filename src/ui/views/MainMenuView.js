import { GameState } from '../../core/GameStateManager.js';

export class MainMenuView {
    constructor() {
        this.selectedIdx = 0;
        this.sparkles = [];
        for (let i = 0; i < 30; i++) {
            this.sparkles.push({
                x: Math.random() * 960,
                y: Math.random() * 540,
                size: Math.random() * 2 + 1,
                speedY: Math.random() * 0.4 + 0.1,
                alpha: Math.random() * 0.8 + 0.2,
                decay: Math.random() * 0.01 + 0.005
            });
        }
    }

    render(ctx, canvas, context) {
        const { inputManager, gameStateManager, audioManager, titleBgImage, levelManager } = context;
        const cx = canvas.width / 2;

        // --- 1. LUXURY HIGH-FANTASY BACKGROUND ---
        if (titleBgImage && titleBgImage.complete && titleBgImage.naturalWidth > 0) {
            ctx.drawImage(titleBgImage, 0, 0, canvas.width, canvas.height);
            // Vignette & Obsidian Dimming Overlay
            const vigGrad = ctx.createRadialGradient(cx, canvas.height / 2, 100, cx, canvas.height / 2, 540);
            vigGrad.addColorStop(0, 'rgba(4, 8, 16, 0.45)');
            vigGrad.addColorStop(0.7, 'rgba(2, 4, 8, 0.78)');
            vigGrad.addColorStop(1, 'rgba(1, 2, 4, 0.95)');
            ctx.fillStyle = vigGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            // High-Fantasy Midnight Gradient
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#040914');
            grad.addColorStop(0.5, '#0b1329');
            grad.addColorStop(1, '#02050c');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // --- 2. FLOATING MAGICULE SPARKS ---
        ctx.save();
        for (const s of this.sparkles) {
            s.y -= s.speedY;
            s.alpha -= s.decay;
            if (s.y < 0 || s.alpha <= 0) {
                s.y = canvas.height + 10;
                s.x = Math.random() * canvas.width;
                s.alpha = Math.random() * 0.8 + 0.2;
            }
            ctx.fillStyle = `rgba(56, 189, 248, ${s.alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // --- 3. MAJESTIC HIGH-FANTASY LOGO & TITLE ---
        ctx.save();
        const titleY = 100;
        ctx.textAlign = 'center';

        // Japanese Kanji Crest Subtitle
        ctx.font = '600 13px "Cinzel", "Marcellus", serif';
        ctx.fillStyle = '#fde047';
        ctx.letterSpacing = '6px';
        ctx.shadowColor = 'rgba(250, 204, 21, 0.7)';
        ctx.shadowBlur = 10;
        ctx.fillText('転生したらスライムだった件', cx, titleY - 32);

        // Main Title: TENSEI SLIME
        ctx.font = '900 40px "Cinzel Decorative", "Cinzel", serif';
        const titleGrad = ctx.createLinearGradient(cx - 200, 0, cx + 200, 0);
        titleGrad.addColorStop(0, '#fef08a');
        titleGrad.addColorStop(0.5, '#ffffff');
        titleGrad.addColorStop(1, '#93c5fd');
        ctx.fillStyle = titleGrad;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 22;
        ctx.fillText('TENSEI SLIME', cx, titleY);

        // Subtitle: TEMPEST RISING
        ctx.font = '700 18px "Cinzel", "Marcellus", serif';
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        ctx.shadowBlur = 12;
        ctx.fillText('✧  TEMPEST RISING  ✧', cx, titleY + 28);

        // Fantasy Flourish Divider
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#eab308';
        ctx.font = '11px serif';
        ctx.fillText('⚜  ────────────  ✦  ────────────  ⚜', cx, titleY + 48);
        ctx.restore();

        // --- 4. FANTASY RPG MENU OPTIONS ---
        const isContinueUnlocked = localStorage.getItem('tempest_save_boss_defeated') === 'true';

        const menuItems = [
            {
                id: 'expedition',
                title: 'EXPEDITION (ARC 1: THE SEALED CAVE)',
                desc: 'Prologue & Whispering Caverns Sub-Chapters (1-1 to 1-4)',
                key: 'Z',
                icon: '⚔',
                enabled: true
            },
            {
                id: 'zen',
                title: 'ZEN TRAINING DOJO (SANDBOX)',
                desc: 'Free Exploration, Enemy Spawner & God Mode Testing',
                key: 'X',
                icon: '🧘',
                enabled: true
            },
            {
                id: 'assets',
                title: 'SANCTUARY & SKINS',
                desc: 'Sprite Archives, Alignment & Custom Speeds',
                key: 'V',
                icon: '🏛',
                enabled: true
            },
            {
                id: 'settings',
                title: 'GAMEPLAY SETTINGS',
                desc: 'Audio Volume, Screen Shake, Floaters & Controls',
                key: 'S',
                icon: '⚙️',
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
        if (inputManager.isActionJustPressed('jump') || inputManager.keys['ArrowUp'] || inputManager.keys['w'] || inputManager.keys['W']) {
            this.selectedIdx = (this.selectedIdx - 1 + menuItems.length) % menuItems.length;
            inputManager.keys['ArrowUp'] = false;
            inputManager.keys['w'] = false;
            inputManager.keys['W'] = false;
        } else if (inputManager.isActionJustPressed('crouch') || inputManager.keys['ArrowDown'] || inputManager.keys['s'] || inputManager.keys['S']) {
            if (!inputManager.keys['s'] && !inputManager.keys['S']) {
                this.selectedIdx = (this.selectedIdx + 1) % menuItems.length;
            }
            inputManager.keys['ArrowDown'] = false;
        }

        const startY = 194;
        const rowH = 46;
        const menuW = 540;
        const menuX = (canvas.width - menuW) / 2;

        for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            const itemY = startY + i * (rowH + 8);
            const isHover = inputManager.isHoverInRect(menuX, itemY, menuW, rowH);
            const isSelected = i === this.selectedIdx || isHover;

            if (isHover) this.selectedIdx = i;

            // Handle Click
            if (inputManager.isClickInRect(menuX, itemY, menuW, rowH) && item.enabled) {
                this.triggerMenuAction(item.id, context);
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
                ctx.font = '13px serif';
                ctx.textAlign = 'right';
                ctx.fillText('✦', menuX + 22, itemY + 26);
            }

            // Fantasy Key Indicator (e.g. [ Z ])
            ctx.fillStyle = item.enabled ? (isSelected ? '#facc15' : '#94a3b8') : '#475569';
            ctx.font = '600 11px "Cinzel", serif';
            ctx.textAlign = 'left';
            ctx.fillText(`[ ${item.key} ]`, menuX + 34, itemY + 22);

            // Item Icon & Main Title
            ctx.font = isSelected && item.enabled ? '700 13px "Cinzel", serif' : '600 13px "Cinzel", serif';
            ctx.fillStyle = item.enabled ? (isSelected ? '#ffffff' : '#e2e8f0') : '#475569';
            if (isSelected && item.enabled) {
                ctx.shadowColor = 'rgba(254, 240, 138, 0.6)';
                ctx.shadowBlur = 10;
            }
            ctx.fillText(`${item.icon}  ${item.title}`, menuX + 74, itemY + 22);

            // Subtitle Description
            ctx.shadowBlur = 0;
            ctx.font = '10px "Marcellus", serif';
            ctx.fillStyle = item.enabled ? (isSelected ? '#fef08a' : '#64748b') : '#334155';
            ctx.fillText(item.desc, menuX + 96, itemY + 38);

            ctx.restore();
        }

        // --- 5. HIGH-FANTASY FOOTER BAR ---
        ctx.save();
        ctx.font = '10px "Marcellus", "Cinzel", serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('✧  [W/S/ARROWS] Navigate  •  [ENTER / CLICK] Select  •  [Z] Expedition  •  [X] Zen  •  [S] Settings  ✧', canvas.width / 2, canvas.height - 20);
        ctx.restore();

        // --- 6. KEYBOARD SHORTCUTS ---
        if (inputManager.keys['z'] || inputManager.keys['Z'] || inputManager.isActionJustPressed('attackLight')) {
            this.triggerMenuAction('expedition', context);
            inputManager.keys['z'] = false;
            inputManager.keys['Z'] = false;
        } else if (inputManager.keys['x'] || inputManager.keys['X'] || inputManager.isActionJustPressed('attackHeavy')) {
            this.triggerMenuAction('zen', context);
            inputManager.keys['x'] = false;
            inputManager.keys['X'] = false;
        } else if (inputManager.isActionJustPressed('viewAssets') || inputManager.keys['v'] || inputManager.keys['V']) {
            this.triggerMenuAction('assets', context);
            inputManager.keys['v'] = false;
            inputManager.keys['V'] = false;
        } else if (inputManager.keys['s'] || inputManager.keys['S']) {
            this.triggerMenuAction('settings', context);
            inputManager.keys['s'] = false;
            inputManager.keys['S'] = false;
        } else if (inputManager.isActionJustPressed('parry') || inputManager.keys['c'] || inputManager.keys['C']) {
            if (isContinueUnlocked) this.triggerMenuAction('continue', context);
        }
    }

    triggerMenuAction(actionId, context) {
        const { gameStateManager, audioManager, levelManager } = context;

        if (actionId === 'expedition') {
            gameStateManager.setState(GameState.PROLOGUE); // Play backstory prologue first!
        } else if (actionId === 'zen') {
            if (levelManager) levelManager.loadLevel('zen');
            gameStateManager.setState(GameState.ZEN);
            if (audioManager) audioManager.playBGM();
        } else if (actionId === 'assets') {
            gameStateManager.setState(GameState.ASSETS);
        } else if (actionId === 'settings') {
            gameStateManager.setState(GameState.SETTINGS);
        } else if (actionId === 'continue') {
            if (levelManager) levelManager.loadLevel('chapter1');
            gameStateManager.setState(GameState.PLAYING);
            if (audioManager) audioManager.playBGM();
        }
    }
}
