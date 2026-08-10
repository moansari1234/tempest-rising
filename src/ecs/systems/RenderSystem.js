import { Transform, Sprite, Velocity, Hurtbox, Hitbox, AI, PlayerInput, Health } from '../Components.js';
import { CONSTANTS } from '../../data/constants.js';
import { AnimationData } from '../../sprites/AnimationData.js';

export class RenderSystem {
  constructor() {
    this.animAccumulator = 0;
  }

  update(world, dt, context) {
    const { ctx, camera, canvas, spriteParser } = context;

    // Use real frame time for animations (dt from World.render is 0)
    const animDt = context._frameDt || (1/60);

    // Clear screen
    ctx.fillStyle = '#050A10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state for camera transform
    ctx.save();
    
    // Determine Boss Zoom
    let bossAlive = false;
    const allAIs = world.queryEntities([AI, Health]);
    for (const id of allAIs) {
        const ai = world.getComponent(id, AI);
        const health = world.getComponent(id, Health);
        if (ai.type === 'boss_serpent' && health.alive) {
            bossAlive = true;
            break;
        }
    }
    if (camera.setZoom) {
        camera.setZoom(bossAlive ? CONSTANTS.CAMERA_BOSS_ZOOM : 1.0);
    }

    // Apply camera
    camera.apply(ctx);

    // Draw Tilemap
    if (context.levelManager) {
        context.levelManager.render(ctx, camera, spriteParser);
    }

    // Get all renderable entities
    const renderables = world.queryEntities([Transform, Sprite]);

    for (const id of renderables) {
      const transform = world.getComponent(id, Transform);
      const sprite = world.getComponent(id, Sprite);
      const velocity = world.getComponent(id, Velocity);
      
      const ai = world.getComponent(id, AI);
      const input = world.getComponent(id, PlayerInput);
      const health = world.getComponent(id, Health);

      // Determine target animation state
      let targetAnim = 'idle';
      if (health && !health.alive) {
          targetAnim = 'death';
      } else if (ai) {
          if (ai.state === 'patrol' || ai.state === 'chase') {
              targetAnim = 'run';
          } else if (ai.state === 'attack' || ai.state === 'attack_lunge' || ai.state === 'attack_spit') {
              targetAnim = AnimationData[sprite.spriteKey] && AnimationData[sprite.spriteKey]['attack'] ? 'attack' : 'idle';
          } else if (ai.state === 'hurt') {
              targetAnim = AnimationData[sprite.spriteKey] && AnimationData[sprite.spriteKey]['hurt'] ? 'hurt' : 'idle';
          } else {
              targetAnim = 'idle';
          }
      } else if (input) {
          const state = input.state;
          if (state === 'attack_light') {
              targetAnim = 'attack_light';
          } else if (state === 'attack_heavy') {
              targetAnim = 'attack_light'; // Use attack_light visual for heavy charge
          } else if (state === 'attack_recovery') {
              targetAnim = 'attack_light'; // Show last attack frame during recovery
          } else if (state === 'predator') {
              targetAnim = 'predator';
          } else if (state === 'hurt') {
              targetAnim = 'hurt';
          } else if (state === 'jump' || state === 'fall') {
              targetAnim = 'jump';
          } else if (state === 'dash') {
              targetAnim = 'run';
          } else if (state === 'parry') {
              targetAnim = 'special';
          } else if (velocity && Math.abs(velocity.vx) > 10) {
              targetAnim = 'run';
          } else {
              targetAnim = 'idle';
          }
      } else if (velocity) {
          if (Math.abs(velocity.vx) > 10) {
              targetAnim = 'run';
          } else {
              targetAnim = 'idle';
          }
      }

      // Validate that animData exists for this key, fallback to idle
      const entityAnims = AnimationData[sprite.spriteKey];
      if (!entityAnims || !entityAnims[targetAnim]) {
          targetAnim = 'idle';
      }

      // Reset animation frame if the animation state changes
      if (sprite.currentAnimation !== targetAnim) {
          sprite.currentAnimation = targetAnim;
          sprite.frameIndex = 0;
          sprite.frameTimer = 0;
      }

      // Vacuum VFX
      if (input && input.state === 'predator') {
          ctx.save();
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          const centerX = transform.x + transform.width / 2;
          const centerY = transform.y + transform.height / 2;
          
          for (let i = 0; i < 8; i++) {
              const angle = (Math.PI * 2 / 8) * i + (performance.now() / 200);
              const distOut = 150 - ((performance.now() / 5) % 150);
              const distIn = Math.max(0, distOut - 20);
              
              ctx.moveTo(centerX + Math.cos(angle) * distOut, centerY + Math.sin(angle) * distOut);
              ctx.lineTo(centerX + Math.cos(angle) * distIn, centerY + Math.sin(angle) * distIn);
          }
          ctx.stroke();
          ctx.restore();
      }

      // Update animation timer using real frame delta
      let animData = AnimationData[sprite.spriteKey] ? AnimationData[sprite.spriteKey][sprite.currentAnimation] : null;
      if (!animData) {
          sprite.currentAnimation = 'idle';
          animData = AnimationData[sprite.spriteKey] ? AnimationData[sprite.spriteKey]['idle'] : null;
      }
      
      if (animData) {
          sprite.frameTimer += animDt;
          if (sprite.frameTimer >= animData.frameTime) {
              sprite.frameTimer = 0;
              sprite.frameIndex++;
              if (sprite.frameIndex >= animData.frames) {
                  if (animData.loop) {
                      sprite.frameIndex = 0;
                  } else {
                      sprite.frameIndex = animData.frames - 1;
                  }
              }
          }
      }

      // Fetch bitmap
      const bitmap = spriteParser.getBitmap(sprite.spriteKey, sprite.currentAnimation, sprite.frameIndex);

      if (bitmap) {
          ctx.save();
          
          // I-frame flash effect
          if (health && health.iFrameTimer > 0) {
              ctx.globalAlpha = Math.sin(performance.now() / 30) > 0 ? 1.0 : 0.3;
          }
          
          // Draw at sprite's natural size, centered on the entity's position.
          // For the 128x128 sheet frames, use a display scale.
          // For the 16x16 pixel-art sprites, use 2x scale.
          const isLargeSprite = bitmap.width >= 64; // sheet frames are 128px
          const displayW = isLargeSprite ? bitmap.width * 0.5 : bitmap.width * 2;
          const displayH = isLargeSprite ? bitmap.height * 0.5 : bitmap.height * 2;
          
          // Center horizontally on the entity, bottom-align vertically
          const drawX = transform.x + transform.width / 2 - displayW / 2;
          const drawY = transform.y + transform.height - displayH;
          
          if (transform.facing === 'left') {
              ctx.translate(drawX + displayW, drawY);
              ctx.scale(-1, 1);
              ctx.drawImage(bitmap, 0, 0, displayW, displayH);
          } else {
              ctx.drawImage(bitmap, drawX, drawY, displayW, displayH);
          }
          
          if (sprite.color) {
              ctx.globalCompositeOperation = 'source-atop';
              ctx.globalAlpha = 0.4;
              ctx.fillStyle = sprite.color;
              if (transform.facing === 'left') {
                  ctx.fillRect(0, 0, displayW, displayH);
              } else {
                  ctx.fillRect(drawX, drawY, displayW, displayH);
              }
              ctx.globalCompositeOperation = 'source-over';
              ctx.globalAlpha = 1;
          }

          ctx.restore();
      } else {
          // Fallback: draw a colored rectangle at transform size
          ctx.save();
          if (health && health.iFrameTimer > 0) {
              ctx.globalAlpha = Math.sin(performance.now() / 30) > 0 ? 1.0 : 0.3;
          }
          ctx.fillStyle = sprite.color || (input ? '#3B82F6' : ai ? '#22C55E' : '#888888');
          ctx.fillRect(transform.x, transform.y, transform.width, transform.height);
          ctx.restore();
      }
    }

    // UI: Draw Enemy HP Bars and Devour Indicators (In Camera Space)
    const enemyEntities = world.queryEntities([Transform, Health, AI]);
    for (const id of enemyEntities) {
        const transform = world.getComponent(id, Transform);
        const health = world.getComponent(id, Health);
        
        if (!health.alive && health.hp === 0) {
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('[E] DEVOUR', transform.x + transform.width / 2, transform.y - 10);
            ctx.textAlign = 'left';
            continue;
        }

        if (health.hp < health.maxHp) {
            const barWidth = 32;
            const barHeight = 4;
            const barX = transform.x + (transform.width / 2) - (barWidth / 2);
            const barY = transform.y - 10;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
            
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(barX, barY, barWidth * (health.hp / health.maxHp), barHeight);

            if (health.hp < health.maxHp * 0.5) {
                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('[E]', transform.x + transform.width / 2, transform.y - 15);
                ctx.textAlign = 'left';
            }
        }
    }

    ctx.restore(); // Restore to Screen Space
    // All further UI is handled by UISystem
  }
}
