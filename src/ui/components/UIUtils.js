export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

export function formatClipName(clipKey) {
    const map = {
        idle: 'IDLE STANCE',
        walk: 'PATROL WALK',
        run: 'SPRINT / RUN',
        jump: 'AERIAL JUMP',
        attack: 'MELEE ATTACK',
        attack_light: 'LIGHT ATK (WATER CUTTER)',
        attack_heavy: 'HEAVY ATK (HAMMER)',
        special: 'GLUTTONY BARRIER',
        predator: 'PREDATOR DEVOUR',
        hurt: 'HURT / FLINCH',
        death: 'DEFEAT DISSOLUTION',
        victory: 'VICTORY CELEBRATION',
        ground: 'GROUND ARCHITECTURE'
    };
    return map[clipKey] || clipKey.toUpperCase();
}
