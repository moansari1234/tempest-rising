import { GameState } from '../../core/GameStateManager.js';
import { AnimationData } from '../../sprites/AnimationData.js';
import { EntitiesSidebar } from './EntitiesSidebar.js';
import { StudioViewport } from './StudioViewport.js';
import { ScrubberToolbar } from './ScrubberToolbar.js';
import { AlignmentEditorPanel } from './AlignmentEditorPanel.js';
import { EntityDossierPanel } from './EntityDossierPanel.js';

export class AssetLibraryView {
    constructor() {
        this.sidebar = new EntitiesSidebar();
        this.viewport = new StudioViewport();
        this.scrubber = new ScrubberToolbar();
        this.editorPanel = new AlignmentEditorPanel();
        this.dossierPanel = new EntityDossierPanel();
    }

    render(ctx, canvas, state, context, dt) {
        const { inputManager, spriteParser } = context;
        if (!inputManager || !spriteParser) return;

        const currentEntity = state.entitiesList[state.assetEntityIdx];
        const animList = currentEntity.animations;
        if (state.assetAnimIdx >= animList.length) {
            state.assetAnimIdx = 0;
        }

        // --- 1. KEYBOARD & MOUSE INPUT PROCESSING ---
        // Cycle Selected Entity (A / D or Left / Right)
        if (inputManager.isActionJustPressed('moveRight')) {
            state.assetEntityIdx = (state.assetEntityIdx + 1) % state.entitiesList.length;
            state.assetAnimIdx = 0;
            state.assetFrameIdx = 0;
            state.assetFrameTimer = 0;
        } else if (inputManager.isActionJustPressed('moveLeft')) {
            state.assetEntityIdx = (state.assetEntityIdx - 1 + state.entitiesList.length) % state.entitiesList.length;
            state.assetAnimIdx = 0;
            state.assetFrameIdx = 0;
            state.assetFrameTimer = 0;
        }

        // Cycle Selected Animation Clip (W / S or Up / Down)
        if (inputManager.isActionJustPressed('jump')) {
            state.assetAnimIdx = (state.assetAnimIdx - 1 + animList.length) % animList.length;
            state.assetFrameIdx = 0;
            state.assetFrameTimer = 0;
        } else if (inputManager.isActionJustPressed('crouch')) {
            state.assetAnimIdx = (state.assetAnimIdx + 1) % animList.length;
            state.assetFrameIdx = 0;
            state.assetFrameTimer = 0;
        }

        // Spacebar Play / Pause Toggle
        if (inputManager.isActionJustPressed('attackHeavy')) {
            state.assetIsPaused = !state.assetIsPaused;
        }

        // Equip Active Skin into Gameplay (Enter / E)
        if (inputManager.isActionJustPressed('interact')) {
            if (currentEntity.forcePack !== null) {
                spriteParser.setSkin(currentEntity.spriteKey, currentEntity.forcePack);
                if (context.floaterQueue) {
                    context.floaterQueue.push({
                        text: `✨ EQUIPPED: ${currentEntity.name}`,
                        x: 480,
                        y: 120,
                        color: '#22c55e',
                        lifetime: 2.0,
                        maxLifetime: 2.0
                    });
                }
            }
        }

        // Frame Stepping (J / K or [ / ])
        const currentAnimKey = animList[state.assetAnimIdx] || 'idle';
        const entityAnimData = AnimationData[currentEntity.spriteKey] ? AnimationData[currentEntity.spriteKey][currentAnimKey] : { frames: 1, frameTime: 0.2 };
        const totalFrames = entityAnimData ? entityAnimData.frames : 1;

        if (inputManager.isActionJustPressed('stepForward')) {
            state.assetIsPaused = true;
            state.assetFrameIdx = (state.assetFrameIdx + 1) % totalFrames;
        } else if (inputManager.isActionJustPressed('stepBack')) {
            state.assetIsPaused = true;
            state.assetFrameIdx = (state.assetFrameIdx - 1 + totalFrames) % totalFrames;
        }

        // Zoom Cycle: 1x -> 2x -> 3x -> 4x -> 1x (Attack Light / Z)
        if (inputManager.isActionJustPressed('attackLight')) {
            state.assetZoom = state.assetZoom >= 4 ? 1 : state.assetZoom + 1;
        }

        // Flip Facing (Parry / C)
        if (inputManager.isActionJustPressed('parry')) {
            state.assetFacing = state.assetFacing === 'right' ? 'left' : 'right';
        }

        // Exit Asset Gallery (ESC or V)
        if (inputManager.isActionJustPressed('pause') || inputManager.isActionJustPressed('viewAssets')) {
            context.gameStateManager.setState(context.gameStateManager.previousState === GameState.ASSETS ? GameState.PLAYING : (context.gameStateManager.previousState || GameState.MENU));
            return;
        }

        // Hotkey [T] to cycle active clip speed
        if ((inputManager.keys['t'] || inputManager.keys['T']) && (!inputManager.previousKeys['t'] && !inputManager.previousKeys['T'])) {
            const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
            const curSpeed = spriteParser.getClipSpeed(currentEntity.spriteKey, currentAnimKey);
            const curIdx = speeds.indexOf(curSpeed);
            const nextIdx = (curIdx + 1) % speeds.length;
            const newSpeed = speeds[nextIdx >= 0 ? nextIdx : 3];
            spriteParser.setClipSpeed(currentEntity.spriteKey, currentAnimKey, newSpeed);
            state.toastMsg = `⏱️ [${currentAnimKey.toUpperCase()}] Speed: ${newSpeed.toFixed(2)}x (Saved)`;
            state.toastTimer = 2.0;
        }

        // Hotkey [L] to toggle lock
        if ((inputManager.keys['l'] || inputManager.keys['L']) && (!inputManager.previousKeys['l'] && !inputManager.previousKeys['L'])) {
            const newLock = spriteParser.toggleFrameLock(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx);
            state.toastMsg = newLock ? `🔒 Frame #${state.assetFrameIdx} Locked` : `🔓 Frame #${state.assetFrameIdx} Unlocked`;
            state.toastTimer = 2.0;
        }

        // Animation Time Progression (Scaled by Clip Speed Multiplier)
        const frameDt = dt || 0.016;
        const currentClipSpeed = spriteParser.getClipSpeed(currentEntity.spriteKey, currentAnimKey);
        if (!state.assetIsPaused && entityAnimData) {
            state.assetFrameTimer += frameDt * currentClipSpeed;
            if (state.assetFrameTimer >= (entityAnimData.frameTime || 0.15)) {
                state.assetFrameTimer = 0;
                state.assetFrameIdx = (state.assetFrameIdx + 1) % totalFrames;
            }
        }

        // --- 2. RENDER ASSET LIBRARY UI ---
        ctx.fillStyle = '#060B12';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Title Bar
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🏛 ASSET LIBRARY & SKIN DRESSING ROOM', 20, 28);

        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText('PREVIEW, INSPECT & EQUIP SKINS', 420, 28);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('[ESC / V] Exit Gallery', canvas.width - 20, 28);

        // Render Sub-components
        this.sidebar.render(ctx, state, context);
        this.viewport.render(ctx, canvas, state, currentEntity, currentAnimKey, animList, totalFrames, context);
        this.scrubber.render(ctx, state, currentEntity, currentAnimKey, totalFrames, context);

        // Right Column Tabs
        const rightX = 708;
        const rightY = 42;
        const rightW = 234;
        const rightH = 450;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(rightX, rightY, rightW, rightH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rightX, rightY, rightW, rightH);

        const tab1W = 114;
        const tab2W = 104;
        const tabH = 26;

        if (inputManager.isClickInRect(rightX + 6, rightY + 6, tab1W, tabH)) {
            state.assetTab = 'editor';
        }
        if (inputManager.isClickInRect(rightX + 6 + tab1W + 4, rightY + 6, tab2W, tabH)) {
            state.assetTab = 'dossier';
        }

        // Tab 1 Button
        ctx.fillStyle = state.assetTab === 'editor' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(rightX + 6, rightY + 6, tab1W, tabH);
        ctx.strokeStyle = state.assetTab === 'editor' ? '#38bdf8' : '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(rightX + 6, rightY + 6, tab1W, tabH);
        ctx.fillStyle = state.assetTab === 'editor' ? '#38bdf8' : '#94a3b8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🛠️ ALIGNMENT', rightX + 6 + tab1W / 2, rightY + 17);

        // Tab 2 Button
        ctx.fillStyle = state.assetTab === 'dossier' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(30, 41, 59, 0.6)';
        ctx.fillRect(rightX + 6 + tab1W + 4, rightY + 6, tab2W, tabH);
        ctx.strokeStyle = state.assetTab === 'dossier' ? '#a855f7' : '#334155';
        ctx.strokeRect(rightX + 6 + tab1W + 4, rightY + 6, tab2W, tabH);
        ctx.fillStyle = state.assetTab === 'dossier' ? '#a855f7' : '#94a3b8';
        ctx.fillText('📊 STATS', rightX + 6 + tab1W + 4 + tab2W / 2, rightY + 17);

        if (state.assetTab === 'editor') {
            this.editorPanel.render(ctx, state, currentEntity, currentAnimKey, totalFrames, context);
        } else {
            const bitmap = spriteParser.getBitmap(currentEntity.spriteKey, currentAnimKey, state.assetFrameIdx, currentEntity.forcePack || null);
            this.dossierPanel.render(ctx, state, currentEntity, currentAnimKey, totalFrames, entityAnimData, bitmap, context);
        }

        // Toast notification
        if (state.toastTimer > 0) {
            state.toastTimer -= frameDt;
            const toastW = 300;
            const toastH = 28;
            const toastX = (canvas.width - toastW) / 2;
            const toastY = 48;

            ctx.save();
            ctx.fillStyle = 'rgba(6, 11, 20, 0.95)';
            ctx.fillRect(toastX, toastY, toastW, toastH);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(toastX, toastY, toastW, toastH);

            ctx.fillStyle = '#86efac';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(state.toastMsg, toastX + toastW / 2, toastY + 18);
            ctx.restore();
        }

        // Footer Cheatsheet
        const footerY = 502;
        ctx.fillStyle = '#080e1a';
        ctx.fillRect(0, footerY, canvas.width, 38);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(0, footerY, canvas.width, 38);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ALIGNMENT EDITOR: [Drag Preview Stage] Move Sprite • [Buttons] Fine-Tune X / Y / Scale • [A/D] Select Entity • [W/S] Select Clip • [ESC/V] Exit', canvas.width / 2, footerY + 22);
    }
}
