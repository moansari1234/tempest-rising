export class AlignmentEditorPanel {
    render(ctx, state, currentEntity, currentAnimKey, totalFrames, context) {
        const { inputManager, spriteParser } = context;
        const rightX = 708;
        const rightY = 42;
        const rightW = 234;

        let ctrlY = rightY + 34;

        // --- 3-WAY SCOPE SELECTOR ---
        const scopeBtnW = (rightW - 24) / 3;
        const scopeBtnH = 20;

        if (inputManager.isClickInRect(rightX + 10, ctrlY, scopeBtnW, scopeBtnH)) {
            state.editorScope = 'frame';
        }
        if (inputManager.isClickInRect(rightX + 10 + scopeBtnW + 2, ctrlY, scopeBtnW, scopeBtnH)) {
            state.editorScope = 'clip';
        }
        if (inputManager.isClickInRect(rightX + 10 + (scopeBtnW + 2) * 2, ctrlY, scopeBtnW, scopeBtnH)) {
            state.editorScope = 'global';
        }

        const drawScopePill = (x, y, w, h, label, active) => {
            ctx.fillStyle = active ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.7)';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = active ? '#38bdf8' : '#334155';
            ctx.lineWidth = active ? 1.5 : 1;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = active ? '#38bdf8' : '#94a3b8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + w / 2, y + 13);
        };

        drawScopePill(rightX + 10, ctrlY, scopeBtnW, scopeBtnH, `🎯 FRAME ${state.assetFrameIdx}`, state.editorScope === 'frame');
        drawScopePill(rightX + 10 + scopeBtnW + 2, ctrlY, scopeBtnW, scopeBtnH, '🎬 CLIP', state.editorScope === 'clip');
        drawScopePill(rightX + 10 + (scopeBtnW + 2) * 2, ctrlY, scopeBtnW, scopeBtnH, '🌐 GLOBAL', state.editorScope === 'global');

        ctrlY += 24;

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

        // --- PROMINENT LOCK / UNLOCK & SAVE POSITION PANEL ---
        const lockBoxH = 22;
        if (inputManager.isClickInRect(rightX + 10, ctrlY, rightW - 20, lockBoxH)) {
            const newLock = spriteParser.toggleFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx);
            if (newLock) {
                spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
                state.toastMsg = `🔒 Frame #${state.assetFrameIdx} Position Locked & Saved!`;
            } else {
                state.toastMsg = `🔓 Frame #${state.assetFrameIdx} Unlocked for editing`;
            }
            state.toastTimer = 2.5;
        }

        if (isCurrentFrameLocked) {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
            ctx.fillRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`🔒 FRAME #${state.assetFrameIdx} LOCKED (CLICK TO UNLOCK)`, rightX + rightW / 2, ctrlY + 15);
        } else {
            ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
            ctx.fillRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(rightX + 10, ctrlY, rightW - 20, lockBoxH);
            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`💾 SAVE & LOCK FRAME #${state.assetFrameIdx}`, rightX + rightW / 2, ctrlY + 15);
        }

        ctrlY += 26;

        const btnBW = 34;
        const btnBH = 19;
        const rowX = rightX + 10;

        const handleNudge = (deltaX, deltaY, deltaScale) => {
            if (isCurrentFrameLocked) {
                state.toastMsg = `🔒 Frame #${state.assetFrameIdx} is LOCKED! Click [🔓 UNLOCK] above to adjust.`;
                state.toastTimer = 2.0;
                return;
            }
            state.assetIsPaused = true;
            if (deltaX) curOffX += deltaX;
            if (deltaY) curOffY += deltaY;
            if (deltaScale) curScale = Math.max(0.2, Math.min(3.0, curScale + deltaScale));
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
        };

        const drawNudgeBtn = (bx, by, bw, bh, text, active) => {
            ctx.fillStyle = isCurrentFrameLocked ? 'rgba(30, 41, 59, 0.4)' : (active ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.8)');
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = isCurrentFrameLocked ? '#334155' : (active ? '#38bdf8' : '#475569');
            ctx.strokeRect(bx, by, bw, bh);
            ctx.fillStyle = isCurrentFrameLocked ? '#64748b' : (active ? '#38bdf8' : '#e2e8f0');
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(text, bx + bw / 2, by + 13);
        };

        // --- 1. OFFSET X CONTROLS ---
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('OFFSET X (HORIZONTAL PIVOT)', rightX + 10, ctrlY);
        ctrlY += 5;

        if (inputManager.isClickInRect(rowX, ctrlY, btnBW, btnBH)) handleNudge(-5, 0, 0);
        if (inputManager.isClickInRect(rowX + 38, ctrlY, btnBW, btnBH)) handleNudge(-1, 0, 0);
        if (inputManager.isClickInRect(rowX + 142, ctrlY, btnBW, btnBH)) handleNudge(1, 0, 0);
        if (inputManager.isClickInRect(rowX + 180, ctrlY, btnBW, btnBH)) handleNudge(5, 0, 0);

        drawNudgeBtn(rowX, ctrlY, btnBW, btnBH, '-5');
        drawNudgeBtn(rowX + 38, ctrlY, btnBW, btnBH, '-1');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rowX + 76, ctrlY, 62, btnBH);
        ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : '#38bdf8';
        ctx.strokeRect(rowX + 76, ctrlY, 62, btnBH);
        ctx.fillStyle = isCurrentFrameLocked ? '#4ade80' : '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${offXSign}${Math.round(curOffX)}px`, rowX + 107, ctrlY + 13);

        drawNudgeBtn(rowX + 142, ctrlY, btnBW, btnBH, '+1');
        drawNudgeBtn(rowX + 180, ctrlY, btnBW, btnBH, '+5');

        ctrlY += 23;

        // --- 2. OFFSET Y CONTROLS ---
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('OFFSET Y (VERTICAL PIVOT)', rightX + 10, ctrlY);
        ctrlY += 5;

        if (inputManager.isClickInRect(rowX, ctrlY, btnBW, btnBH)) handleNudge(0, -5, 0);
        if (inputManager.isClickInRect(rowX + 38, ctrlY, btnBW, btnBH)) handleNudge(0, -1, 0);
        if (inputManager.isClickInRect(rowX + 142, ctrlY, btnBW, btnBH)) handleNudge(0, 1, 0);
        if (inputManager.isClickInRect(rowX + 180, ctrlY, btnBW, btnBH)) handleNudge(0, 5, 0);

        drawNudgeBtn(rowX, ctrlY, btnBW, btnBH, '-5');
        drawNudgeBtn(rowX + 38, ctrlY, btnBW, btnBH, '-1');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rowX + 76, ctrlY, 62, btnBH);
        ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : '#38bdf8';
        ctx.strokeRect(rowX + 76, ctrlY, 62, btnBH);
        ctx.fillStyle = isCurrentFrameLocked ? '#4ade80' : '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${offYSign}${Math.round(curOffY)}px`, rowX + 107, ctrlY + 13);

        drawNudgeBtn(rowX + 142, ctrlY, btnBW, btnBH, '+1');
        drawNudgeBtn(rowX + 180, ctrlY, btnBW, btnBH, '+5');

        ctrlY += 23;

        // --- 3. SCALE CONTROLS ---
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SPRITE SCALE RATIO', rightX + 10, ctrlY);
        ctrlY += 5;

        if (inputManager.isClickInRect(rowX, ctrlY, 56, btnBH)) handleNudge(0, 0, -0.1);
        if (inputManager.isClickInRect(rowX + 158, ctrlY, 56, btnBH)) handleNudge(0, 0, 0.1);

        drawNudgeBtn(rowX, ctrlY, 56, btnBH, '-0.1x');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rowX + 62, ctrlY, 90, btnBH);
        ctx.strokeStyle = '#a855f7';
        ctx.strokeRect(rowX + 62, ctrlY, 90, btnBH);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${curScale.toFixed(2)}x`, rowX + 107, ctrlY + 13);

        drawNudgeBtn(rowX + 158, ctrlY, 56, btnBH, '+0.1x');

        ctrlY += 23;

        // --- 4. CLIP PLAYBACK SPEED CONTROLS (0.00 LEVEL PRECISION & TEXT INPUT) ---
        const curClipSpeed = spriteParser.getClipSpeed(currentEntity.spriteKey, currentAnimKey);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`CLIP SPEED: [${currentAnimKey.toUpperCase()}] (0.00 PRECISION)`, rightX + 10, ctrlY);
        ctrlY += 5;

        const handleSpeedChange = (delta, direct) => {
            let s = direct !== undefined ? direct : Math.max(0.01, Math.min(5.0, curClipSpeed + delta));
            s = Math.round(s * 100) / 100;
            spriteParser.setClipSpeed(currentEntity.spriteKey, currentAnimKey, s);
            state.toastMsg = `⏱️ [${currentAnimKey.toUpperCase()}] Speed: ${s.toFixed(2)}x (Saved)`;
            state.toastTimer = 2.0;
        };

        // Row 1: Fine Precision Nudges [-0.05] [-0.01] [ 0.00x (CLICK TO TYPE) ] [+0.01] [+0.05]
        const spBW = 36;
        const spCenterW = 62;
        if (inputManager.isClickInRect(rowX, ctrlY, spBW, btnBH)) handleSpeedChange(-0.05);
        if (inputManager.isClickInRect(rowX + 39, ctrlY, spBW, btnBH)) handleSpeedChange(-0.01);
        
        // Center speed box -> Interactive prompt / direct text entry!
        if (inputManager.isClickInRect(rowX + 78, ctrlY, spCenterW, btnBH)) {
            try {
                const val = prompt(`Enter Speed Multiplier for [${currentAnimKey.toUpperCase()}]\n(0.01 to 5.00, e.g. 0.35, 0.45, 0.70, 1.00):`, curClipSpeed.toFixed(2));
                if (val !== null) {
                    const parsed = parseFloat(val);
                    if (!isNaN(parsed) && parsed > 0.005 && parsed <= 5.0) {
                        handleSpeedChange(0, Math.round(parsed * 100) / 100);
                    }
                }
            } catch(e) {}
        }

        if (inputManager.isClickInRect(rowX + 143, ctrlY, spBW, btnBH)) handleSpeedChange(0.01);
        if (inputManager.isClickInRect(rowX + 182, ctrlY, spBW, btnBH)) handleSpeedChange(0.05);

        drawNudgeBtn(rowX, ctrlY, spBW, btnBH, '-.05');
        drawNudgeBtn(rowX + 39, ctrlY, spBW, btnBH, '-.01');

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(rowX + 78, ctrlY, spCenterW, btnBH);
        ctx.strokeStyle = '#facc15';
        ctx.strokeRect(rowX + 78, ctrlY, spCenterW, btnBH);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`⏱️${curClipSpeed.toFixed(2)}x ✎`, rowX + 78 + spCenterW / 2, ctrlY + 13);

        drawNudgeBtn(rowX + 143, ctrlY, spBW, btnBH, '+.01');
        drawNudgeBtn(rowX + 182, ctrlY, spBW, btnBH, '+.05');

        ctrlY += 21;

        // Row 2: Fast Presets [0.25x] [0.35x] [0.50x] [0.75x] [1.00x]
        const pBW = 38;
        const pSpacing = 4;
        const presets = [0.25, 0.35, 0.50, 0.75, 1.00];
        for (let p = 0; p < presets.length; p++) {
            const pX = rowX + p * (pBW + pSpacing);
            const val = presets[p];
            const isMatch = Math.abs(curClipSpeed - val) < 0.009;
            if (inputManager.isClickInRect(pX, ctrlY, pBW, 17)) {
                handleSpeedChange(0, val);
            }
            drawNudgeBtn(pX, ctrlY, pBW, 17, `${val.toFixed(2)}x`, isMatch);
        }

        ctrlY += 21;

        // --- 5. COPY FRAME OFFSET TO ALL FRAMES ---
        const copyBtnH = 19;
        if (inputManager.isClickInRect(rightX + 10, ctrlY, rightW - 20, copyBtnH)) {
            spriteParser.copyFrameToAll(currentEntity.spriteKey, currentAnimKey, totalFrames, state.assetFrameIdx);
            state.toastMsg = `📋 Copied Frame ${state.assetFrameIdx} offset to all ${totalFrames} frames!`;
            state.toastTimer = 2.5;
        }
        ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
        ctx.fillRect(rightX + 10, ctrlY, rightW - 20, copyBtnH);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.strokeRect(rightX + 10, ctrlY, rightW - 20, copyBtnH);
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`📋 COPY F${state.assetFrameIdx} OFFSET TO ALL FRAMES`, rightX + rightW / 2, ctrlY + 13);

        ctrlY += 22;

        // --- 6. PRESET ACTIONS ---
        const actW = (rightW - 26) / 2;
        const actH = 19;

        if (inputManager.isClickInRect(rightX + 10, ctrlY, actW, actH)) {
            if (!isCurrentFrameLocked) {
                state.assetIsPaused = true;
                curOffX = 0;
                spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
                state.toastMsg = '🎯 Centered X Pivot (0px)';
                state.toastTimer = 2.0;
            } else {
                state.toastMsg = `🔒 Frame #${state.assetFrameIdx} is locked! Unlock to center.`;
                state.toastTimer = 2.0;
            }
        }
        if (inputManager.isClickInRect(rightX + 10 + actW + 6, ctrlY, actW, actH)) {
            if (!isCurrentFrameLocked) {
                state.assetIsPaused = true;
                curOffY = 0;
                spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
                state.toastMsg = '⚓ Grounded Y to Floor';
                state.toastTimer = 2.0;
            } else {
                state.toastMsg = `🔒 Frame #${state.assetFrameIdx} is locked! Unlock to ground.`;
                state.toastTimer = 2.0;
            }
        }

        drawNudgeBtn(rightX + 10, ctrlY, actW, actH, '🎯 Center X');
        drawNudgeBtn(rightX + 10 + actW + 6, ctrlY, actW, actH, '⚓ Ground Y');

        ctrlY += 22;

        if (inputManager.isClickInRect(rightX + 10, ctrlY, rightW - 20, actH)) {
            spriteParser.resetOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, state.editorScope);
            spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, false);
            state.toastMsg = `↺ Reset ${state.editorScope.toUpperCase()} Offsets & Unlocked`;
            state.toastTimer = 2.0;
        }
        drawNudgeBtn(rightX + 10, ctrlY, rightW - 20, actH, `↺ Reset (${state.editorScope.toUpperCase()}) & Unlock`);

        ctrlY += 22;

        // --- 7. OVERLAY TOGGLES ---
        if (inputManager.isClickInRect(rightX + 10, ctrlY, actW, actH)) {
            state.showTileBox = !state.showTileBox;
        }
        if (inputManager.isClickInRect(rightX + 10 + actW + 6, ctrlY, actW, actH)) {
            state.showCrosshair = !state.showCrosshair;
        }

        drawNudgeBtn(rightX + 10, ctrlY, actW, actH, state.showTileBox ? '🟩 Tile Box: ON' : '⬛ Tile Box: OFF');
        drawNudgeBtn(rightX + 10 + actW + 6, ctrlY, actW, actH, state.showCrosshair ? '🟨 Center: ON' : '⬛ Center: OFF');

        ctrlY += 22;

        // --- 8. EXPORT / COPY JSON & DOWNLOAD FILE BUTTONS ---
        const expBtnW = (rightW - 26) / 2;
        const expBtnH = 22;

        // Button 1: Copy to Clipboard
        if (inputManager.isClickInRect(rightX + 10, ctrlY, expBtnW, expBtnH)) {
            try {
                const exportData = {
                    offsets: spriteParser.offsets,
                    clipSpeeds: spriteParser.clipSpeeds
                };
                const jsonStr = JSON.stringify(exportData, null, 2);
                navigator.clipboard.writeText(jsonStr);
                state.toastMsg = '📋 All Offsets & Speeds Copied!';
                state.toastTimer = 3.0;
            } catch(e) {
                state.toastMsg = '💾 Saved in LocalStorage!';
                state.toastTimer = 3.0;
            }
        }

        // Button 2: Download .json File
        if (inputManager.isClickInRect(rightX + 10 + expBtnW + 6, ctrlY, expBtnW, expBtnH)) {
            try {
                const exportData = {
                    offsets: spriteParser.offsets,
                    clipSpeeds: spriteParser.clipSpeeds
                };
                const jsonStr = JSON.stringify(exportData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tempest_sprite_offsets.json';
                a.click();
                URL.revokeObjectURL(url);
                state.toastMsg = '💾 Downloaded tempest_sprite_offsets.json!';
                state.toastTimer = 3.0;
            } catch(e) {}
        }

        ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
        ctx.fillRect(rightX + 10, ctrlY, expBtnW, expBtnH);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.strokeRect(rightX + 10, ctrlY, expBtnW, expBtnH);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📋 COPY JSON', rightX + 10 + expBtnW / 2, ctrlY + 15);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fillRect(rightX + 10 + expBtnW + 6, ctrlY, expBtnW, expBtnH);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(rightX + 10 + expBtnW + 6, ctrlY, expBtnW, expBtnH);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💾 SAVE FILE', rightX + 10 + expBtnW + 6 + expBtnW / 2, ctrlY + 15);
    }
}
