export class SettingsView {
    constructor() {}

    render(ctx, canvas, context) {
        const { inputManager, gameStateManager, settingsManager, audioManager } = context;

        // Dark dimming backdrop
        ctx.fillStyle = 'rgba(2, 4, 8, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ornate Modal Frame (w: 640, h: 440)
        const modalW = 640;
        const modalH = 440;
        const modalX = (canvas.width - modalW) / 2;
        const modalY = (canvas.height - modalH) / 2;

        ctx.fillStyle = '#060B14';
        ctx.fillRect(modalX, modalY, modalW, modalH);

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(modalX, modalY, modalW, modalH);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8);

        // Header Ribbon
        ctx.fillStyle = '#0a1020';
        ctx.fillRect(modalX + modalW / 2 - 120, modalY - 14, 240, 28);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(modalX + modalW / 2 - 120, modalY - 14, 240, 28);

        ctx.font = 'bold 13px "Cinzel", serif';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText('⚙️  GAMEPLAY SETTINGS', modalX + modalW / 2, modalY + 5);

        // Section 1: Audio Volume
        const sec1Y = modalY + 35;
        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('🔊 AUDIO & ACOUSTICS', modalX + 30, sec1Y);

        const drawVolumeRow = (label, val, y, onDec, onInc) => {
            ctx.font = '10px "Marcellus", monospace';
            ctx.fillStyle = '#cbd5e1';
            ctx.textAlign = 'left';
            ctx.fillText(label, modalX + 40, y + 14);

            // Progress Bar
            const barX = modalX + 180;
            const barW = 200;
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(barX, y + 4, barW, 12);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(barX, y + 4, barW * val, 12);
            ctx.strokeStyle = '#64748b';
            ctx.strokeRect(barX, y + 4, barW, 12);

            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(val * 100)}%`, barX + barW / 2, y + 14);

            // Minus Button
            const btnMinus = inputManager.isClickInRect(barX - 30, y + 2, 22, 16);
            if (btnMinus) onDec();
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(barX - 30, y + 2, 22, 16);
            ctx.strokeStyle = '#94a3b8';
            ctx.strokeRect(barX - 30, y + 2, 22, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('-', barX - 19, y + 14);

            // Plus Button
            const btnPlus = inputManager.isClickInRect(barX + barW + 8, y + 2, 22, 16);
            if (btnPlus) onInc();
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(barX + barW + 8, y + 2, 22, 16);
            ctx.strokeStyle = '#94a3b8';
            ctx.strokeRect(barX + barW + 8, y + 2, 22, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('+', barX + barW + 19, y + 14);
        };

        if (settingsManager) {
            drawVolumeRow('Master Volume', settingsManager.masterVolume, sec1Y + 16, 
                () => { settingsManager.masterVolume = Math.max(0, settingsManager.masterVolume - 0.1); settingsManager.save(); },
                () => { settingsManager.masterVolume = Math.min(1, settingsManager.masterVolume + 0.1); settingsManager.save(); }
            );

            drawVolumeRow('BGM Music', settingsManager.bgmVolume, sec1Y + 40,
                () => { settingsManager.bgmVolume = Math.max(0, settingsManager.bgmVolume - 0.1); settingsManager.save(); },
                () => { settingsManager.bgmVolume = Math.min(1, settingsManager.bgmVolume + 0.1); settingsManager.save(); }
            );

            drawVolumeRow('Combat SFX', settingsManager.sfxVolume, sec1Y + 64,
                () => { settingsManager.sfxVolume = Math.max(0, settingsManager.sfxVolume - 0.1); settingsManager.save(); },
                () => { settingsManager.sfxVolume = Math.min(1, settingsManager.sfxVolume + 0.1); settingsManager.save(); }
            );
        }

        // Section 2: Visual & Feel Toggles
        const sec2Y = sec1Y + 104;
        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('✨ COMBAT JUICE & VISUALS', modalX + 30, sec2Y);

        const drawToggle = (label, active, x, y, onToggle) => {
            const isClick = inputManager.isClickInRect(x, y, 140, 24);
            if (isClick) onToggle();

            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(x, y, 140, 24);
            ctx.strokeStyle = active ? '#22c55e' : '#64748b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, 140, 24);

            ctx.font = 'bold 9px "Cinzel", monospace';
            ctx.fillStyle = active ? '#4ade80' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText(`${label}: ${active ? 'ON' : 'OFF'}`, x + 70, y + 16);
        };

        if (settingsManager) {
            drawToggle('SCREEN SHAKE', settingsManager.screenShake, modalX + 40, sec2Y + 16, () => {
                settingsManager.screenShake = !settingsManager.screenShake;
                settingsManager.save();
            });
            drawToggle('DAMAGE FLOATERS', settingsManager.damageFloaters, modalX + 200, sec2Y + 16, () => {
                settingsManager.damageFloaters = !settingsManager.damageFloaters;
                settingsManager.save();
            });
            drawToggle('HITSTOP IMPACT', settingsManager.hitstop, modalX + 360, sec2Y + 16, () => {
                settingsManager.hitstop = !settingsManager.hitstop;
                settingsManager.save();
            });
        }

        // Section 3: Controls Cheatsheet
        const sec3Y = sec2Y + 60;
        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('🎮 KEYBOARD & COMBAT CONTROLS', modalX + 30, sec3Y);

        const controls = [
            { k: '[A / D] / [← / →]', d: 'Move Horizontal' },
            { k: '[SPACE]', d: 'Jump / Double Jump' },
            { k: '[SHIFT]', d: 'Sonic Dash' },
            { k: '[Z]', d: 'Light Attack (Water Blade)' },
            { k: '[X]', d: 'Heavy Strike (Gluttony)' },
            { k: '[C]', d: 'Absolute Parry Counter' },
            { k: '[E]', d: 'Predator Devour' },
            { k: '[TAB / I]', d: 'Slime Status Screen' }
        ];

        let cX = modalX + 40;
        let cY = sec3Y + 18;
        for (let i = 0; i < controls.length; i++) {
            const ctrl = controls[i];
            const posX = i < 4 ? modalX + 40 : modalX + 320;
            const posY = sec3Y + 18 + (i % 4) * 20;

            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#facc15';
            ctx.textAlign = 'left';
            ctx.fillText(ctrl.k, posX, posY + 12);

            ctx.font = '10px "Marcellus", monospace';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(`—  ${ctrl.d}`, posX + 130, posY + 12);
        }

        // Footer: Back Button
        const footY = modalY + modalH - 36;
        const btnBackHover = inputManager.isClickInRect(modalX + modalW / 2 - 80, footY, 160, 24);
        if (btnBackHover || inputManager.isActionJustPressed('pause') || inputManager.isActionJustPressed('quit') || inputManager.keys['b'] || inputManager.keys['B']) {
            gameStateManager.setState(gameStateManager.previousState || 1); // Return
            inputManager.consumeAction('pause');
            inputManager.consumeAction('quit');
        }

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(modalX + modalW / 2 - 80, footY, 160, 24);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.strokeRect(modalX + modalW / 2 - 80, footY, 160, 24);

        ctx.font = 'bold 11px "Cinzel", monospace';
        ctx.fillStyle = '#fde047';
        ctx.textAlign = 'center';
        ctx.fillText('Ⓑ RETURN [ESC / B]', modalX + modalW / 2, footY + 16);
    }
}
