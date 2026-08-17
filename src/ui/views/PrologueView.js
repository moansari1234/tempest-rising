export class PrologueView {
    constructor() {
        this.elapsed = 0;
        this.stepDuration = 5.0; // 5 seconds per phrase
        this.totalSteps = 3;

        this.phrases = [
            {
                tag: 'PROLOGUE',
                lines: [
                    'Tokyo, Japan... A fateful encounter on the evening street.',
                    'A flash of cold steel. A dying breath.',
                    'Consciousness slowly slips away into silence...'
                ]
            },
            {
                tag: '« VOICE OF THE WORLD »',
                lines: [
                    '« Notice: Reincarnation parameters established. »',
                    '« Thermal Fluctuation Resistance... Acquired. »',
                    '« Physical Attack Resistance & Bloodless Body... Acquired. »',
                    '« Unique Skill: Predator (捕食者)... Acquired. »',
                    '« Unique Skill: Great Sage (大賢者)... Acquired. »'
                ],
                isVoiceOfWorld: true
            },
            {
                tag: 'REBIRTH',
                lines: [
                    'Consciousness awakens in the subterranean deep.',
                    'No eyes to see. No ears to hear. Pure magicules in the dark.',
                    'The journey of Rimuru Tempest begins now.'
                ]
            }
        ];
    }

    reset() {
        this.elapsed = 0;
    }

    render(ctx, canvas, context, dt) {
        const frameDt = dt || 0.016;
        this.elapsed += frameDt;

        const currentStep = Math.floor(this.elapsed / this.stepDuration);
        
        // If finished, transition to gameplay
        if (currentStep >= this.totalSteps) {
            this.finish(context);
            return;
        }

        // Check skip input
        if (context.inputManager && (
            context.inputManager.isActionJustPressed('jump') ||
            context.inputManager.isActionJustPressed('attackLight') ||
            context.inputManager.isActionJustPressed('interact') ||
            context.inputManager.keys['Space'] ||
            context.inputManager.keys['Enter']
        )) {
            this.finish(context);
            return;
        }

        // Background: Deep cosmic obsidian black
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate fade opacity for the current step
        const stepTime = this.elapsed % this.stepDuration;
        let alpha = 1.0;
        if (stepTime < 1.0) {
            alpha = stepTime / 1.0; // Fade in
        } else if (stepTime > this.stepDuration - 1.0) {
            alpha = (this.stepDuration - stepTime) / 1.0; // Fade out
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        const phrase = this.phrases[currentStep];
        const centerY = canvas.height / 2;

        // Tag Header
        if (phrase.isVoiceOfWorld) {
            ctx.font = 'bold 16px "Cinzel Decorative", "Cinzel", serif';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.fillText(phrase.tag, canvas.width / 2, centerY - 80);

            // Glowing line
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 120, centerY - 68);
            ctx.lineTo(canvas.width / 2 + 120, centerY - 68);
            ctx.stroke();
        } else {
            ctx.font = 'bold 14px "Cinzel", serif';
            ctx.fillStyle = '#eab308';
            ctx.textAlign = 'center';
            ctx.fillText(`—  ${phrase.tag}  —`, canvas.width / 2, centerY - 70);
        }

        // Story Lines
        const startY = centerY - 25;
        const lineSpacing = phrase.isVoiceOfWorld ? 26 : 30;

        for (let i = 0; i < phrase.lines.length; i++) {
            if (phrase.isVoiceOfWorld) {
                ctx.font = 'italic 14px "Marcellus", monospace';
                ctx.fillStyle = '#bae6fd';
            } else {
                ctx.font = '16px "Marcellus", serif';
                ctx.fillStyle = '#f8fafc';
            }
            ctx.textAlign = 'center';
            ctx.fillText(phrase.lines[i], canvas.width / 2, startY + i * lineSpacing);
        }

        ctx.restore();

        // Footer: Skip prompt
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.font = '11px "Cinzel", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[SPACE / ENTER] TO SKIP PROLOGUE', canvas.width / 2, canvas.height - 35);
    }

    finish(context) {
        if (context.levelManager) {
            context.levelManager.loadLevel('chapter1');
        }
        if (context.gameStateManager) {
            context.gameStateManager.setState(2); // GameState.PLAYING
        }
    }
}
