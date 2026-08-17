export class EntitiesSidebar {
    render(ctx, state, context) {
        const { inputManager, spriteParser } = context;
        const sidebarX = 18;
        const sidebarY = 42;
        const sidebarW = 230;
        const sidebarH = 450;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(sidebarX, sidebarY, sidebarW, sidebarH);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sidebarX, sidebarY, sidebarW, sidebarH);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CHARACTER / SKIN ROSTER', sidebarX + 12, sidebarY + 18);

        if (state.sidebarScrollOffset === undefined) state.sidebarScrollOffset = 0;
        const maxVisibleCards = 9;
        const cardH = 42;
        const cardSpacing = 46;

        // Auto-scroll to keep selected item in view
        if (state.assetEntityIdx < state.sidebarScrollOffset) {
            state.sidebarScrollOffset = state.assetEntityIdx;
        } else if (state.assetEntityIdx >= state.sidebarScrollOffset + maxVisibleCards) {
            state.sidebarScrollOffset = state.assetEntityIdx - maxVisibleCards + 1;
        }
        state.sidebarScrollOffset = Math.max(0, Math.min(state.sidebarScrollOffset, state.entitiesList.length - maxVisibleCards));

        const startIdx = state.sidebarScrollOffset;
        const endIdx = Math.min(state.entitiesList.length, startIdx + maxVisibleCards);

        for (let i = startIdx; i < endIdx; i++) {
            const ent = state.entitiesList[i];
            const displayRow = i - startIdx;
            const cardY = sidebarY + 28 + displayRow * cardSpacing;
            const isSelected = i === state.assetEntityIdx;
            const activeSkin = spriteParser.getSkin(ent.spriteKey);
            const isEquipped = ent.forcePack !== null && ent.forcePack === activeSkin;

            // Mouse click support
            if (inputManager.isClickInRect(sidebarX + 6, cardY, sidebarW - 18, cardH)) {
                state.assetEntityIdx = i;
                state.assetAnimIdx = 0;
                state.assetFrameIdx = 0;
            }

            if (isSelected) {
                ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
                ctx.fillRect(sidebarX + 6, cardY, sidebarW - 18, cardH);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(sidebarX + 6, cardY, sidebarW - 18, cardH);

                // Left highlight bar
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(sidebarX + 6, cardY, 3, cardH);
            } else if (inputManager.isHoverInRect(sidebarX + 6, cardY, sidebarW - 18, cardH)) {
                ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
                ctx.fillRect(sidebarX + 6, cardY, sidebarW - 18, cardH);
            }

            ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
            ctx.font = isSelected ? 'bold 10px monospace' : '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(ent.name, sidebarX + 16, cardY + 18);

            ctx.fillStyle = '#64748b';
            ctx.font = '8px monospace';
            ctx.fillText(ent.category, sidebarX + 16, cardY + 34);

            // Active Equipped Tag
            if (isEquipped) {
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('✔ ACTIVE', sidebarX + sidebarW - 22, cardY + 20);
            }
        }

        // Scrollbar Track & Thumb
        if (state.entitiesList.length > maxVisibleCards) {
            const scrollTrackX = sidebarX + sidebarW - 8;
            const scrollTrackY = sidebarY + 28;
            const scrollTrackH = sidebarH - 36;
            
            ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
            ctx.fillRect(scrollTrackX, scrollTrackY, 4, scrollTrackH);

            const scrollRatio = maxVisibleCards / state.entitiesList.length;
            const thumbH = Math.max(20, scrollTrackH * scrollRatio);
            const maxScroll = state.entitiesList.length - maxVisibleCards;
            const thumbY = scrollTrackY + (state.sidebarScrollOffset / maxScroll) * (scrollTrackH - thumbH);

            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(scrollTrackX, thumbY, 4, thumbH);
        }
    }
}
