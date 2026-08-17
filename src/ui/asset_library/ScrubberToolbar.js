export class ScrubberToolbar {
    render(ctx, state, currentEntity, currentAnimKey, totalFrames, context) {
        const { inputManager, spriteParser } = context;
        const studioX = 258;
        const studioY = 42;
        const studioW = 440;

        // 1. Play/Pause Button
        if (inputManager.isClickInRect(studioX + 8, studioY + 8, 62, 22)) {
            state.assetIsPaused = !state.assetIsPaused;
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + 8, studioY + 8, 62, 22);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + 8, studioY + 8, 62, 22);
        ctx.fillStyle = state.assetIsPaused ? '#f59e0b' : '#10b981';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(state.assetIsPaused ? '⏸ PAUSE' : '▶ PLAY', studioX + 39, studioY + 22);

        // 2. Playback Speed Button [⏱️ 1.00x] (Click to Set Custom Speed / Cycle)
        const activeClipSpeed = spriteParser.getClipSpeed(currentEntity.spriteKey, currentAnimKey);
        if (inputManager.isClickInRect(studioX + 74, studioY + 8, 54, 22)) {
            try {
                const val = prompt(`Enter Speed Multiplier for [${currentAnimKey.toUpperCase()}]\n(0.01 to 5.00, e.g. 0.35, 0.48, 0.70, 1.00):`, activeClipSpeed.toFixed(2));
                if (val !== null) {
                    const parsed = parseFloat(val);
                    if (!isNaN(parsed) && parsed > 0.005 && parsed <= 5.0) {
                        const newSpeed = Math.round(parsed * 100) / 100;
                        spriteParser.setClipSpeed(currentEntity.spriteKey, currentAnimKey, newSpeed);
                        state.toastMsg = `⏱️ [${currentAnimKey.toUpperCase()}] Speed: ${newSpeed.toFixed(2)}x (Saved)`;
                        state.toastTimer = 2.0;
                    }
                }
            } catch(e) {
                const speeds = [0.25, 0.35, 0.50, 0.75, 1.00, 1.25, 1.50];
                const curIdx = speeds.indexOf(activeClipSpeed);
                const nextIdx = (curIdx + 1) % speeds.length;
                const newSpeed = speeds[nextIdx >= 0 ? nextIdx : 4];
                spriteParser.setClipSpeed(currentEntity.spriteKey, currentAnimKey, newSpeed);
                state.toastMsg = `⏱️ [${currentAnimKey.toUpperCase()}] Speed: ${newSpeed.toFixed(2)}x (Saved)`;
                state.toastTimer = 2.0;
            }
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + 74, studioY + 8, 54, 22);
        ctx.strokeStyle = activeClipSpeed !== 1.0 ? '#facc15' : '#475569';
        ctx.strokeRect(studioX + 74, studioY + 8, 54, 22);
        ctx.fillStyle = activeClipSpeed !== 1.0 ? '#fde047' : '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`⏱️ ${activeClipSpeed.toFixed(2)}x`, studioX + 101, studioY + 22);

        // 3. Zoom Button (Top-Right)
        if (inputManager.isClickInRect(studioX + studioW - 56, studioY + 8, 48, 22)) {
            state.assetZoom = state.assetZoom >= 4 ? 1 : state.assetZoom + 1;
        }
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(studioX + studioW - 56, studioY + 8, 48, 22);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(studioX + studioW - 56, studioY + 8, 48, 22);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`🔍 ${state.assetZoom}x`, studioX + studioW - 32, studioY + 22);

        // --- INTERACTIVE FRAME STRIP SCRUBBER (Center) ---
        const scrubberStartX = studioX + 132;
        const scrubberW = studioW - 192;
        const scrubberY = studioY + 8;
        const scrubberH = 22;

        // Step Back Button [◀]
        if (inputManager.isClickInRect(scrubberStartX, scrubberY, 18, scrubberH)) {
            state.assetIsPaused = true;
            state.assetFrameIdx = (state.assetFrameIdx - 1 + totalFrames) % totalFrames;
        }
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(scrubberStartX, scrubberY, 18, scrubberH);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(scrubberStartX, scrubberY, 18, scrubberH);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('◀', scrubberStartX + 9, scrubberY + 14);

        // Step Forward Button [▶]
        const nextBtnX = scrubberStartX + scrubberW - 18;
        if (inputManager.isClickInRect(nextBtnX, scrubberY, 18, scrubberH)) {
            state.assetIsPaused = true;
            state.assetFrameIdx = (state.assetFrameIdx + 1) % totalFrames;
        }
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(nextBtnX, scrubberY, 18, scrubberH);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(nextBtnX, scrubberY, 18, scrubberH);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('▶', nextBtnX + 9, scrubberY + 14);

        // Individual Clickable Frame Pills with Lock & Override Badges
        const pillsAreaX = scrubberStartX + 22;
        const pillsAreaW = scrubberW - 44;
        const pillW = Math.min(32, Math.max(18, Math.floor((pillsAreaW - (totalFrames - 1) * 2) / totalFrames)));
        const totalPillsWidth = totalFrames * pillW + (totalFrames - 1) * 2;
        const pillsStartX = pillsAreaX + (pillsAreaW - totalPillsWidth) / 2;

        for (let f = 0; f < totalFrames; f++) {
            const pX = pillsStartX + f * (pillW + 2);
            const isFActive = f === state.assetFrameIdx;
            const isFLocked = spriteParser.isFrameLocked(currentEntity.spriteKey, currentAnimKey, f);
            const hasCustom = spriteParser.hasCustomFrameOffset(currentEntity.spriteKey, currentAnimKey, f);

            if (inputManager.isClickInRect(pX, scrubberY, pillW, scrubberH)) {
                state.assetFrameIdx = f;
                state.assetIsPaused = true;
            }

            let pillLabel = `F${f}`;
            if (isFLocked) pillLabel = `🔒${f}`;
            else if (hasCustom) pillLabel = `✏️${f}`;

            if (isFActive) {
                ctx.fillStyle = isFLocked ? '#22c55e' : '#38bdf8';
                ctx.fillRect(pX, scrubberY, pillW, scrubberH);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(pX, scrubberY, pillW, scrubberH);
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 8px monospace';
                ctx.fillText(pillLabel, pX + pillW / 2, scrubberY + 14);
            } else {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
                ctx.fillRect(pX, scrubberY, pillW, scrubberH);
                ctx.strokeStyle = isFLocked ? 'rgba(34, 197, 94, 0.5)' : (hasCustom ? 'rgba(234, 179, 8, 0.5)' : '#334155');
                ctx.lineWidth = isFLocked || hasCustom ? 1.5 : 1;
                ctx.strokeRect(pX, scrubberY, pillW, scrubberH);
                ctx.fillStyle = isFLocked ? '#4ade80' : (hasCustom ? '#facc15' : '#94a3b8');
                ctx.font = '8px monospace';
                ctx.fillText(pillLabel, pX + pillW / 2, scrubberY + 14);
            }
        }
    }
}
