import { AnimationData } from '../../sprites/AnimationData.js';
import { formatClipName } from '../components/UIUtils.js';

export class StudioViewport {
    render(ctx, canvas, state, currentEntity, currentAnimKey, animList, totalFrames, context) {
        const { inputManager, spriteParser } = context;
        const studioX = 258;
        const studioY = 42;
        const studioW = 440;
        const studioH = 260;

        ctx.fillStyle = '#080e1a';
        ctx.fillRect(studioX, studioY, studioW, studioH);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(studioX, studioY, studioW, studioH);

        // Transparent Checkerboard Backdrop
        const cbSize = 16;
        for (let cy = studioY + 2; cy < studioY + studioH - 2; cy += cbSize) {
            for (let cx = studioX + 2; cx < studioX + studioW - 2; cx += cbSize) {
                if ((Math.floor(cx / cbSize) + Math.floor(cy / cbSize)) % 2 === 0) {
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(cx, cy, cbSize, cbSize);
                }
            }
        }

        // Active Offset Lookup
        const isCurrentFrameLocked = spriteParser.isFrameLocked(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx);
        const activeOffset = spriteParser.getOffset(
            currentEntity.spriteKey,
            state.editorScope !== 'global' ? currentAnimKey : null,
            state.editorScope === 'frame' ? state.assetFrameIdx : null
        );
        let curOffX = activeOffset.offsetX || 0;
        let curOffY = activeOffset.offsetY || 0;
        let curScale = activeOffset.scale !== undefined ? activeOffset.scale : 1.0;

        // Keyboard Arrow Keys & Hotkey Nudging for Fast In-App Editing
        const isShiftHeld = inputManager.keys['Shift'];
        const step = isShiftHeld ? 5 : 1;

        if (inputManager.keys['ArrowLeft'] && !inputManager.previousKeys['ArrowLeft']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, false);
            state.assetIsPaused = true;
            curOffX -= step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
        }
        if (inputManager.keys['ArrowRight'] && !inputManager.previousKeys['ArrowRight']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, false);
            state.assetIsPaused = true;
            curOffX += step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
        }
        if (inputManager.keys['ArrowUp'] && !inputManager.previousKeys['ArrowUp']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, false);
            state.assetIsPaused = true;
            curOffY -= step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
        }
        if (inputManager.keys['ArrowDown'] && !inputManager.previousKeys['ArrowDown']) {
            if (isCurrentFrameLocked) spriteParser.setFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, false);
            state.assetIsPaused = true;
            curOffY += step;
            spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
        }

        // Viewport Dragging to Reposition Sprite (Fluid 1:1 Absolute Mouse Tracking)
        if (inputManager.mouseClicked) {
            if (!state.isDraggingSprite) {
                if (inputManager.isHoverInRect(studioX, studioY, studioW, studioH)) {
                    if (isCurrentFrameLocked) {
                        state.toastMsg = `🔒 Frame #${state.assetFrameIdx} is LOCKED! Click [🔓 UNLOCK] on right to edit.`;
                        state.toastTimer = 2.0;
                    } else {
                        state.assetIsPaused = true; // Auto-pause so other frames never shift!
                        state.isDraggingSprite = true;
                        state.dragStartX = inputManager.mouseX;
                        state.dragStartY = inputManager.mouseY;
                        state.dragInitialOffX = curOffX;
                        state.dragInitialOffY = curOffY;
                    }
                }
            } else if (!isCurrentFrameLocked) {
                state.assetIsPaused = true;
                const totalDeltaX = (inputManager.mouseX - state.dragStartX) / (state.assetZoom || 1);
                const totalDeltaY = (inputManager.mouseY - state.dragStartY) / (state.assetZoom || 1);
                curOffX = Math.round(state.dragInitialOffX + totalDeltaX);
                curOffY = Math.round(state.dragInitialOffY + totalDeltaY);
                spriteParser.setOffset(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, curOffX, curOffY, curScale, state.editorScope);
            }
        } else {
            state.isDraggingSprite = false;
        }

        // Canvas Cursor Styling
        if (canvas) {
            if (state.isDraggingSprite) {
                canvas.style.cursor = 'grabbing';
            } else if (inputManager.isHoverInRect(studioX, studioY, studioW, studioH)) {
                canvas.style.cursor = isCurrentFrameLocked ? 'not-allowed' : 'grab';
            } else {
                canvas.style.cursor = 'default';
            }
        }

        // Center Origin Crosshair & Ground Line Reference
        const groundLineY = studioY + studioH - 35;
        const centerX = studioX + studioW / 2;

        if (state.showGroundLine) {
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(studioX + 10, groundLineY);
            ctx.lineTo(studioX + studioW - 10, groundLineY);
            ctx.stroke();

            // Ground Marker Tag
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('GROUND BASE [Y=0]', studioX + studioW - 14, groundLineY - 4);
        }

        if (state.showCrosshair) {
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(centerX, studioY + 32);
            ctx.lineTo(centerX, studioY + studioH - 10);
            ctx.stroke();
            ctx.setLineDash([]);

            // Center Tag (Drawn near ground so it never collides with frame scrubber pills)
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ORIGIN [X=0]', centerX, groundLineY - 12);
        }

        // In-World Tile Reference Box (32x32)
        if (state.showTileBox) {
            const tileBoxSize = 32 * state.assetZoom * 2;
            const tileBoxX = centerX - tileBoxSize / 2;
            const tileBoxY = groundLineY - tileBoxSize;

            ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
            ctx.fillRect(tileBoxX, tileBoxY, tileBoxSize, tileBoxSize);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(tileBoxX, tileBoxY, tileBoxSize, tileBoxSize);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('32x32 TILE BOUNDS', tileBoxX + 4, tileBoxY + 12);
        }

        // Render Centered Active Sprite with Live Offsets
        const bitmap = spriteParser.getBitmap(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, currentEntity.forcePack || null);
        if (bitmap) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;

            let baseScale = state.assetZoom * curScale;
            if (bitmap.width >= 100) {
                baseScale = 0.5 * state.assetZoom * curScale;
            } else if (bitmap.width <= 32) {
                baseScale = 2.0 * state.assetZoom * curScale;
            } else {
                baseScale = 1.0 * state.assetZoom * curScale;
            }

            const dispW = bitmap.width * baseScale;
            const dispH = bitmap.height * baseScale;

            const drawX = centerX - dispW / 2 + curOffX * state.assetZoom;
            const drawY = groundLineY - dispH + curOffY * state.assetZoom;

            if (state.assetFacing === 'left') {
                ctx.translate(drawX + dispW, drawY);
                ctx.scale(-1, 1);
                ctx.drawImage(bitmap, 0, 0, dispW, dispH);
            } else {
                ctx.drawImage(bitmap, drawX, drawY, dispW, dispH);
            }

            if (currentEntity.tint) {
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = currentEntity.tint;
                if (state.assetFacing === 'left') {
                    ctx.fillRect(0, 0, dispW, dispH);
                } else {
                    ctx.fillRect(drawX, drawY, dispW, dispH);
                }
            }

            // Bounding Box Wireframe
            ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : (state.isDraggingSprite ? '#f59e0b' : 'rgba(168, 85, 247, 0.6)');
            ctx.lineWidth = isCurrentFrameLocked ? 1.5 : 1;
            ctx.setLineDash(isCurrentFrameLocked ? [] : [2, 2]);
            ctx.strokeRect(drawX, drawY, dispW, dispH);
            ctx.setLineDash([]);

            // Pivot Center Crosshair on Sprite
            const pivotX = drawX + dispW / 2;
            const pivotY = drawY + dispH / 2;
            ctx.strokeStyle = '#ec4899';
            ctx.beginPath();
            ctx.moveTo(pivotX - 5, pivotY);
            ctx.lineTo(pivotX + 5, pivotY);
            ctx.moveTo(pivotX, pivotY - 5);
            ctx.lineTo(pivotX, pivotY + 5);
            ctx.stroke();

            ctx.restore();
        }

        // Live Coordinate Readout Badge (Bottom Center of Stage)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(studioX + 10, groundLineY + 6, studioW - 20, 22);
        ctx.strokeStyle = isCurrentFrameLocked ? '#22c55e' : '#334155';
        ctx.strokeRect(studioX + 10, groundLineY + 6, studioW - 20, 22);

        ctx.fillStyle = isCurrentFrameLocked ? '#4ade80' : '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        const offXSign = curOffX >= 0 ? '+' : '';
        const offYSign = curOffY >= 0 ? '+' : '';
        const scopeLabel = state.editorScope === 'frame' ? `FRAME #${state.assetFrameIdx}` : (state.editorScope === 'clip' ? `CLIP (${currentAnimKey.toUpperCase()})` : 'GLOBAL');
        const lockTag = isCurrentFrameLocked ? '🔒 [LOCKED & SAVED]' : '✏️ [UNLOCKED]';
        ctx.fillText(`${lockTag} SCOPE: [${scopeLabel}] | X: ${offXSign}${Math.round(curOffX)}px, Y: ${offYSign}${Math.round(curOffY)}px | SCALE: ${curScale.toFixed(2)}x`, studioX + studioW / 2, groundLineY + 20);

        // --- BOTTOM OF CENTER COLUMN: ALL ANIMATION CLIPS MATRIX (y: 310, w: 440, h: 182) ---
        const matrixY = 310;
        const matrixH = 182;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(studioX, matrixY, studioW, matrixH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(studioX, matrixY, studioW, matrixH);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`ALL ANIMATION CLIPS (${animList.length} TOTAL - CLICK OR W/S)`, studioX + 12, matrixY + 18);

        const clipCols = 2;
        const btnW = (studioW - 30) / clipCols;
        const btnH = 22;

        for (let k = 0; k < animList.length; k++) {
            const clip = animList[k];
            const col = k % clipCols;
            const row = Math.floor(k / clipCols);
            const bX = studioX + 12 + col * (btnW + 6);
            const bY = matrixY + 26 + row * (btnH + 4);
            const isCSelected = k === state.assetAnimIdx;

            if (inputManager.isClickInRect(bX, bY, btnW, btnH)) {
                state.assetAnimIdx = k;
                state.assetFrameIdx = 0;
                state.assetFrameTimer = 0;
            }

            if (isCSelected) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
                ctx.fillRect(bX, bY, btnW, btnH);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(bX, bY, btnW, btnH);
            } else if (inputManager.isHoverInRect(bX, bY, btnW, btnH)) {
                ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
                ctx.fillRect(bX, bY, btnW, btnH);
                ctx.strokeStyle = '#475569';
                ctx.strokeRect(bX, bY, btnW, btnH);
            } else {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
                ctx.fillRect(bX, bY, btnW, btnH);
                ctx.strokeStyle = '#334155';
                ctx.strokeRect(bX, bY, btnW, btnH);
            }

            const aData = AnimationData[currentEntity.spriteKey] ? AnimationData[currentEntity.spriteKey][clip] : null;
            const fCount = aData ? aData.frames : 1;

            ctx.fillStyle = isCSelected ? '#38bdf8' : '#e2e8f0';
            ctx.font = isCSelected ? 'bold 10px monospace' : '10px monospace';
            ctx.textAlign = 'left';
            const niceName = formatClipName(clip);
            ctx.fillText(`${isCSelected ? '▶ ' : '  '}${niceName}`, bX + 6, bY + 15);

            ctx.fillStyle = isCSelected ? '#0284c7' : '#64748b';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${fCount}f`, bX + btnW - 6, bY + 15);
        }
    }
}
