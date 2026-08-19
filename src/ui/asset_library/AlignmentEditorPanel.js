export class AlignmentEditorPanel {
    render(ctx, state, currentEntity, currentAnimKey, totalFrames, context) {
        const { inputManager, spriteParser } = context;
        const rightX = 708;
        const rightY = 42;
        const rightW = 234;

        // --- 1. CLEAN TOP TABS: [ ALIGN ] [ SPEED ] [ STATS ] ---
        const tabW = (rightW - 20) / 3;
        const tabH = 24;
        const tabY = rightY + 6;

        if (inputManager.isClickInRect(rightX + 6, tabY, tabW, tabH)) state.assetTab = 'editor';
        if (inputManager.isClickInRect(rightX + 6 + tabW + 4, tabY, tabW, tabH)) state.assetTab = 'speed';
        if (inputManager.isClickInRect(rightX + 6 + (tabW + 4) * 2, tabY, tabW, tabH)) state.assetTab = 'stats';

        const drawTab = (x, y, w, h, label, active) => {
            ctx.fillStyle = active ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = active ? '#38bdf8' : '#334155';
            ctx.lineWidth = active ? 1.5 : 1;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = active ? '#fde047' : '#94a3b8';
            ctx.font = 'bold 9px "Cinzel", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + w / 2, y + 16);
        };

        drawTab(rightX + 6, tabY, tabW, tabH, '📐 ALIGN', state.assetTab === 'editor' || !state.assetTab);
        drawTab(rightX + 6 + tabW + 4, tabY, tabW, tabH, '⏱️ SPEED', state.assetTab === 'speed');
        drawTab(rightX + 6 + (tabW + 4) * 2, tabY, tabW, tabH, '📊 STATS', state.assetTab === 'stats');

        let ctrlY = tabY + tabH + 12;
        const rowX = rightX + 8;
        const rowW = rightW - 16;

        // Current active offset data
        const isCurrentFrameLocked = spriteParser.isFrameLocked(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx);
        const activeOffset = spriteParser.getOffset(
            currentEntity.spriteKey,
            state.editorScope !== 'global' ? currentAnimKey : null,
            state.editorScope === 'frame' ? state.assetFrameIdx : null
        );
        let curOffX = activeOffset.offsetX || 0;
        let curOffY = activeOffset.offsetY || 0;
        let curScale = activeOffset.scale !== undefined ? activeOffset.scale : 1.0;
        const offXSign = curOffX >= 0 ? '+' : '';
        const offYSign = curOffY >= 0 ? '+' : '';

        const drawBtn = (bx, by, bw, bh, text, active, color = '#38bdf8') => {
            ctx.fillStyle = active ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.85)';
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = active ? color : '#475569';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, bw, bh);
            ctx.fillStyle = active ? color : '#e2e8f0';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(text, bx + bw / 2, by + bh / 2 + 4);
        };

        // ==========================================
        // TAB 1: 📐 ALIGNMENT & PIVOT EDITOR
        // ==========================================
        if (state.assetTab === 'editor' || !state.assetTab) {
            // Scope Selector: Frame / Clip / Global
            const scW = (rowW - 6) / 3;
            const scH = 20;
            if (inputManager.isClickInRect(rowX, ctrlY, scW, scH)) state.editorScope = 'frame';
            if (inputManager.isClickInRect(rowX + scW + 3, ctrlY, scW, scH)) state.editorScope = 'clip';
            if (inputManager.isClickInRect(rowX + (scW + 3) * 2, ctrlY, scW, scH)) state.editorScope = 'global';

            drawBtn(rowX, ctrlY, scW, scH, `F#${state.assetFrameIdx}`, state.editorScope === 'frame');
            drawBtn(rowX + scW + 3, ctrlY, scW, scH, 'CLIP', state.editorScope === 'clip');
            drawBtn(rowX + (scW + 3) * 2, ctrlY, scW, scH, 'GLOBAL', state.editorScope === 'global');
            ctrlY += 26;

            // Lock / Save Frame Banner
            const lockH = 24;
            if (inputManager.isClickInRect(rowX, ctrlY, rowW, lockH)) {
                const newLock = spriteParser.toggleFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx);
                if (newLock) {
                    spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
                    state.toastMsg = `🔒 Frame #${state.assetFrameIdx} Position Saved & Locked!`;
                } else {
                    state.toastMsg = `🔓 Frame #${state.assetFrameIdx} Unlocked for editing`;
                }
                state.toastTimer = 2.0;
            }

            if (isCurrentFrameLocked) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
                ctx.fillRect(rowX, ctrlY, rowW, lockH);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rowX, ctrlY, rowW, lockH);
                ctx.fillStyle = '#4ade80';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`🔒 FRAME #${state.assetFrameIdx} LOCKED (CLICK)`, rowX + rowW / 2, ctrlY + 16);
            } else {
                ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
                ctx.fillRect(rowX, ctrlY, rowW, lockH);
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rowX, ctrlY, rowW, lockH);
                ctx.fillStyle = '#fde047';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`💾 SAVE & LOCK FRAME #${state.assetFrameIdx}`, rowX + rowW / 2, ctrlY + 16);
            }
            ctrlY += 30;

            const handleNudge = (deltaX, deltaY, deltaScale) => {
                if (isCurrentFrameLocked) {
                    state.toastMsg = `🔒 Frame #${state.assetFrameIdx} is locked! Unlock above first.`;
                    state.toastTimer = 2.0;
                    return;
                }
                state.assetIsPaused = true;
                if (deltaX) curOffX += deltaX;
                if (deltaY) curOffY += deltaY;
                if (deltaScale) curScale = Math.max(0.2, Math.min(3.0, curScale + deltaScale));
                spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
            };

            // Offset X Row
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('HORIZONTAL OFFSET (X)', rowX, ctrlY + 4);
            ctrlY += 10;

            const nBW = 34;
            const nBH = 20;
            if (inputManager.isClickInRect(rowX, ctrlY, nBW, nBH)) handleNudge(-5, 0, 0);
            if (inputManager.isClickInRect(rowX + 38, ctrlY, nBW, nBH)) handleNudge(-1, 0, 0);
            if (inputManager.isClickInRect(rowX + 142, ctrlY, nBW, nBH)) handleNudge(1, 0, 0);
            if (inputManager.isClickInRect(rowX + 180, ctrlY, nBW, nBH)) handleNudge(5, 0, 0);

            drawBtn(rowX, ctrlY, nBW, nBH, '-5');
            drawBtn(rowX + 38, ctrlY, nBW, nBH, '-1');

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(rowX + 76, ctrlY, 62, nBH);
            ctx.strokeStyle = '#38bdf8';
            ctx.strokeRect(rowX + 76, ctrlY, 62, nBH);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${offXSign}${Math.round(curOffX)}px`, rowX + 107, ctrlY + 14);

            drawBtn(rowX + 142, ctrlY, nBW, nBH, '+1');
            drawBtn(rowX + 180, ctrlY, nBW, nBH, '+5');
            ctrlY += 26;

            // Offset Y Row
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('VERTICAL PIVOT (Y)', rowX, ctrlY + 4);
            ctrlY += 10;

            if (inputManager.isClickInRect(rowX, ctrlY, nBW, nBH)) handleNudge(0, -5, 0);
            if (inputManager.isClickInRect(rowX + 38, ctrlY, nBW, nBH)) handleNudge(0, -1, 0);
            if (inputManager.isClickInRect(rowX + 142, ctrlY, nBW, nBH)) handleNudge(0, 1, 0);
            if (inputManager.isClickInRect(rowX + 180, ctrlY, nBW, nBH)) handleNudge(0, 5, 0);

            drawBtn(rowX, ctrlY, nBW, nBH, '-5');
            drawBtn(rowX + 38, ctrlY, nBW, nBH, '-1');

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(rowX + 76, ctrlY, 62, nBH);
            ctx.strokeStyle = '#38bdf8';
            ctx.strokeRect(rowX + 76, ctrlY, 62, nBH);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${offYSign}${Math.round(curOffY)}px`, rowX + 107, ctrlY + 14);

            drawBtn(rowX + 142, ctrlY, nBW, nBH, '+1');
            drawBtn(rowX + 180, ctrlY, nBW, nBH, '+5');
            ctrlY += 26;

            // Scale Row
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('SPRITE SCALE RATIO', rowX, ctrlY + 4);
            ctrlY += 10;

            if (inputManager.isClickInRect(rowX, ctrlY, 56, nBH)) handleNudge(0, 0, -0.1);
            if (inputManager.isClickInRect(rowX + 158, ctrlY, 56, nBH)) handleNudge(0, 0, 0.1);

            drawBtn(rowX, ctrlY, 56, nBH, '-0.1x');

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(rowX + 62, ctrlY, 90, nBH);
            ctx.strokeStyle = '#a855f7';
            ctx.strokeRect(rowX + 62, ctrlY, 90, nBH);
            ctx.fillStyle = '#c084fc';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${curScale.toFixed(2)}x`, rowX + 107, ctrlY + 14);

            drawBtn(rowX + 158, ctrlY, 56, nBH, '+0.1x');
            ctrlY += 28;

            // Quick Actions (Center X / Ground Y / Reset)
            const aW = (rowW - 4) / 2;
            if (inputManager.isClickInRect(rowX, ctrlY, aW, 22)) {
                if (!isCurrentFrameLocked) {
                    curOffX = 0;
                    spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
                    state.toastMsg = '🎯 Centered X Pivot (0px)';
                    state.toastTimer = 2.0;
                }
            }
            if (inputManager.isClickInRect(rowX + aW + 4, ctrlY, aW, 22)) {
                if (!isCurrentFrameLocked) {
                    curOffY = 0;
                    spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
                    state.toastMsg = '⚓ Grounded Y to Floor';
                    state.toastTimer = 2.0;
                }
            }
            drawBtn(rowX, ctrlY, aW, 22, '🎯 Center X');
            drawBtn(rowX + aW + 4, ctrlY, aW, 22, '⚓ Ground Y');
            ctrlY += 26;

            // Copy Frame to All Frames
            if (inputManager.isClickInRect(rowX, ctrlY, rowW, 22)) {
                spriteParser.copyFrameToAll(currentEntity.spriteKey, currentAnimKey, totalFrames, state.assetFrameIdx);
                state.toastMsg = `📋 Copied F${state.assetFrameIdx} to all frames!`;
                state.toastTimer = 2.0;
            }
            drawBtn(rowX, ctrlY, rowW, 22, `📋 COPY F#${state.assetFrameIdx} TO ALL FRAMES`, false, '#facc15');
            ctrlY += 26;

            // Export Actions (Copy JSON / Save File)
            if (inputManager.isClickInRect(rowX, ctrlY, aW, 22)) {
                try {
                    const exportData = { offsets: spriteParser.offsets, clipSpeeds: spriteParser.clipSpeeds };
                    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
                    state.toastMsg = '📋 Offsets Copied to Clipboard!';
                    state.toastTimer = 2.5;
                } catch(e) {}
            }
            if (inputManager.isClickInRect(rowX + aW + 4, ctrlY, aW, 22)) {
                try {
                    const exportData = { offsets: spriteParser.offsets, clipSpeeds: spriteParser.clipSpeeds };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'tempest_sprite_offsets.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    state.toastMsg = '💾 Downloaded tempest_sprite_offsets.json';
                    state.toastTimer = 2.5;
                } catch(e) {}
            }
            drawBtn(rowX, ctrlY, aW, 22, '📋 COPY JSON', false, '#22c55e');
            drawBtn(rowX + aW + 4, ctrlY, aW, 22, '💾 SAVE FILE', false, '#38bdf8');
        }

        // ==========================================
        // TAB 2: ⏱️ CLIP SPEED & TIMING EDITOR
        // ==========================================
        else if (state.assetTab === 'speed') {
            const curClipSpeed = spriteParser.getClipSpeed(currentEntity.spriteKey, currentAnimKey);

            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 10px "Cinzel", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`CLIP: [${currentAnimKey.toUpperCase()}]`, rowX + rowW / 2, ctrlY + 8);
            ctrlY += 18;

            const handleSpeedChange = (delta, direct) => {
                let s = direct !== undefined ? direct : Math.max(0.01, Math.min(5.0, curClipSpeed + delta));
                s = Math.round(s * 100) / 100;
                spriteParser.setClipSpeed(currentEntity.spriteKey, currentAnimKey, s);
                state.toastMsg = `⏱️ [${currentAnimKey.toUpperCase()}] Speed: ${s.toFixed(2)}x`;
                state.toastTimer = 2.0;
            };

            // Precision Stepper Row [-0.05] [-0.01] [ ⏱️ 0.50x ✎ ] [+0.01] [+0.05]
            const spBW = 34;
            const spCenterW = 66;

            if (inputManager.isClickInRect(rowX, ctrlY, spBW, 24)) handleSpeedChange(-0.05);
            if (inputManager.isClickInRect(rowX + 38, ctrlY, spBW, 24)) handleSpeedChange(-0.01);
            if (inputManager.isClickInRect(rowX + 76, ctrlY, spCenterW, 24)) {
                try {
                    const val = prompt(`Enter Speed Multiplier for [${currentAnimKey.toUpperCase()}]\n(0.01 to 5.00, e.g. 0.35, 0.48, 0.70, 1.00):`, curClipSpeed.toFixed(2));
                    if (val !== null) {
                        const parsed = parseFloat(val);
                        if (!isNaN(parsed) && parsed > 0.005 && parsed <= 5.0) {
                            handleSpeedChange(0, Math.round(parsed * 100) / 100);
                        }
                    }
                } catch(e) {}
            }
            if (inputManager.isClickInRect(rowX + 146, ctrlY, spBW, 24)) handleSpeedChange(0.01);
            if (inputManager.isClickInRect(rowX + 184, ctrlY, spBW, 24)) handleSpeedChange(0.05);

            drawBtn(rowX, ctrlY, spBW, 24, '-.05');
            drawBtn(rowX + 38, ctrlY, spBW, 24, '-.01');

            ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
            ctx.fillRect(rowX + 76, ctrlY, spCenterW, 24);
            ctx.strokeStyle = '#facc15';
            ctx.strokeRect(rowX + 76, ctrlY, spCenterW, 24);
            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`⏱️${curClipSpeed.toFixed(2)}x ✎`, rowX + 76 + spCenterW / 2, ctrlY + 16);

            drawBtn(rowX + 146, ctrlY, spBW, 24, '+.01');
            drawBtn(rowX + 184, ctrlY, spBW, 24, '+.05');
            ctrlY += 34;

            // Speed Presets
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('SPEED PRESETS', rowX, ctrlY + 4);
            ctrlY += 10;

            const pBW = 39;
            const presets = [0.25, 0.35, 0.50, 0.75, 1.00];
            for (let p = 0; p < presets.length; p++) {
                const pX = rowX + p * (pBW + 5);
                const val = presets[p];
                const isMatch = Math.abs(curClipSpeed - val) < 0.009;
                if (inputManager.isClickInRect(pX, ctrlY, pBW, 22)) {
                    handleSpeedChange(0, val);
                }
                drawBtn(pX, ctrlY, pBW, 22, `${val.toFixed(2)}x`, isMatch, '#facc15');
            }
            ctrlY += 34;

            // Frame Duration readout
            const animObj = (currentEntity && currentEntity.animations) ? currentAnimKey : 'idle';
            ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            ctx.fillRect(rowX, ctrlY, rowW, 60);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(rowX, ctrlY, rowW, 60);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`ANIMATION INFO: ${totalFrames} FRAMES`, rowX + rowW / 2, ctrlY + 18);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '8px monospace';
            ctx.fillText(`Multiplier: ${curClipSpeed.toFixed(2)}x speed`, rowX + rowW / 2, ctrlY + 34);
            ctx.fillText(`Calculated Duration: ${(0.2 / curClipSpeed).toFixed(2)}s/frame`, rowX + rowW / 2, ctrlY + 48);
        }

        // ==========================================
        // TAB 3: 📊 ENTITY DOSSIER
        // ==========================================
        else if (state.assetTab === 'stats') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(rowX, ctrlY, rowW, 260);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(rowX, ctrlY, rowW, 260);

            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 11px "Cinzel", serif';
            ctx.textAlign = 'center';
            ctx.fillText(currentEntity.name, rowX + rowW / 2, ctrlY + 22);

            ctx.fillStyle = '#38bdf8';
            ctx.font = '9px monospace';
            ctx.fillText(currentEntity.category, rowX + rowW / 2, ctrlY + 38);

            const stats = [
                { k: 'HP', v: currentEntity.hp || '100' },
                { k: 'ATK', v: currentEntity.atk || '10' },
                { k: 'DEF', v: currentEntity.def || '8' },
                { k: 'SPEED', v: currentEntity.speed || '200 px/s' }
            ];

            let sY = ctrlY + 58;
            for (const s of stats) {
                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(s.k, rowX + 14, sY);

                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'right';
                ctx.fillText(s.v, rowX + rowW - 14, sY);
                sY += 18;
            }

            // Equip Button
            if (inputManager.isClickInRect(rowX + 10, sY + 20, rowW - 20, 26)) {
                if (currentEntity.forcePack !== null) {
                    spriteParser.setSkin(currentEntity.spriteKey, currentEntity.forcePack);
                    state.toastMsg = `✨ Equipped Skin: ${currentEntity.name}!`;
                    state.toastTimer = 2.5;
                }
            }
            drawBtn(rowX + 10, sY + 20, rowW - 20, 26, `✨ EQUIP ${currentEntity.name}`, false, '#22c55e');
        }
    }
}
