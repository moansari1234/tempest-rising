export class TransitionView {
    constructor() {
        this.loadingScreens = [
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_1.jpg',
                title: 'THE WHISPERING CAVERNS',
                lore: '« REPORT: GREAT SAGE — Analyzing Subterranean Magicules & Flora... »'
            },
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_2.jpg',
                title: 'THE MAGISTEEL MINING DEPTHS',
                lore: '« REPORT: GREAT SAGE — High concentration of Magisteel Ore detected in lower strata. »'
            },
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_3.jpg',
                title: 'GREAT SAGE: PREDICTION ALGORITHM',
                lore: '« REPORT: GREAT SAGE — Calculating future state probability & magicule synthesis vectors. »'
            },
            {
                img: new Image(),
                src: '/public/sprites/backgrounds/loading_screen_4.jpg',
                title: 'THE TEMPEST SERPENT SANCTUARY',
                lore: '« WARNING: GREAT SAGE — Immense ancient draconic presence detected ahead. Prepare for combat! »'
            }
        ];
        this.loadingScreens.forEach(s => { s.img.src = s.src; });
        this.currentLoadingIdx = 0;
    }

    render(ctx, canvas, context) {
        const screen = this.loadingScreens[this.currentLoadingIdx % this.loadingScreens.length];
        if (screen && screen.img && screen.img.complete && screen.img.naturalWidth > 0) {
            ctx.drawImage(screen.img, 0, 0, canvas.width, canvas.height);
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, 'rgba(5, 10, 16, 0.35)');
            grad.addColorStop(1, 'rgba(5, 10, 16, 0.85)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'rgba(5, 10, 16, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(screen ? screen.title : 'ENTERING THE CAVERNS', canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(screen ? screen.lore : '« REPORT: GREAT SAGE — Analyzing Subterranean Magicules... »', canvas.width / 2, canvas.height / 2 + 20);

        // Progress bar simulation
        const pBarW = 340;
        const pBarH = 6;
        const pBarX = (canvas.width - pBarW) / 2;
        const pBarY = canvas.height / 2 + 45;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(pBarX, pBarY, pBarW, pBarH);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(pBarX, pBarY, pBarW, pBarH);

        const pulseW = ((Date.now() / 8) % (pBarW - 4));
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(pBarX + 2, pBarY + 2, pulseW, pBarH - 4);
    }
}
