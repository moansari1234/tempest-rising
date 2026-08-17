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

    // Ensure pixelated crisp rendering
    ctx.imageSmoothingEnabled = false;

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
          } else if (state === 'attack_heavy' || state === 'attack_heavy_strike') {
              targetAnim = 'attack_heavy';
          } else if (state === 'attack_recovery') {
              targetAnim = 'attack_light';
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
          } else if (state === 'walk') {
              targetAnim = 'walk';
          } else if (state === 'run') {
              targetAnim = 'run';
          } else if (velocity && Math.abs(velocity.vx) > 100) {
              targetAnim = 'run';
          } else if (velocity && Math.abs(velocity.vx) > 5) {
              targetAnim = 'walk';
          } else {
              targetAnim = 'idle';
          }
      } else if (velocity) {
          if (Math.abs(velocity.vx) > 100) {
              targetAnim = 'run';
          } else if (Math.abs(velocity.vx) > 5) {
              targetAnim = 'walk';
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

      // Devour Vacuum VFX
      if (input && input.state === 'predator') {
          ctx.save();
          const centerX = transform.x + transform.width / 2;
          const centerY = transform.y + transform.height / 2;
          const now = performance.now();
          
          // Concentric swirling suction vortex rings
          for (let ring = 0; ring < 3; ring++) {
              const radius = 25 + ring * 35 - ((now / 10) % 35);
              if (radius > 10) {
                  ctx.strokeStyle = ring === 0 ? 'rgba(165, 243, 252, 0.7)' : 'rgba(56, 189, 248, 0.4)';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                  ctx.stroke();
              }
          }
          
          // Inward swirling hydro spirals
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
              const baseAngle = (Math.PI * 2 / 6) * i + (now / 180);
              for (let step = 0; step < 12; step++) {
                  const dist = 140 - step * 10 - ((now / 4) % 10);
                  if (dist > 5) {
                      const angle = baseAngle + step * 0.25;
                      const px = centerX + Math.cos(angle) * dist;
                      const py = centerY + Math.sin(angle) * (dist * 0.6); // slight vertical perspective
                      if (step === 0) ctx.moveTo(px, py);
                      else ctx.lineTo(px, py);
                  }
              }
          }
          ctx.stroke();
          
          // Glowing core pulse
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.beginPath();
          ctx.arc(centerX, centerY, 16 + Math.sin(now / 100) * 4, 0, Math.PI * 2);
          ctx.fill();
          
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

          // Corpse dissolving fade out
          if (health && !health.alive && health.decayTimer !== undefined && health.decayTimer < 1.0) {
              ctx.globalAlpha *= Math.max(0, health.decayTimer);
          }
          
          // Calculate integer-scaled display dimensions
          let displayW, displayH;
          if (sprite.spriteKey === 'serpent' || sprite.spriteKey === 'boss_serpent') {
              if (bitmap.width >= 100) {
                  displayW = bitmap.width * 0.6;
                  displayH = bitmap.height * 0.6;
              } else {
                  displayW = bitmap.width * 3;
                  displayH = bitmap.height * 3;
              }
          } else if (bitmap.width >= 64) {
              displayW = bitmap.width * 0.5; // High-res sheet fallback
              displayH = bitmap.height * 0.5;
          } else {
              displayW = bitmap.width * 2; // 2x scale for pixel art
              displayH = bitmap.height * 2;
          }
          
          let drawX = transform.x + transform.width / 2 - displayW / 2;
          const drawY = transform.y + transform.height - displayH;
          
          if (sprite.spriteKey === 'rimuru' && bitmap.width > 16) {
              // Wide attack slash sprite: anchor slime body at transform.x
              drawX = transform.x;
              if (transform.facing === 'left') {
                  ctx.translate(transform.x + transform.width, drawY);
                  ctx.scale(-1, 1);
                  ctx.drawImage(bitmap, 0, 0, displayW, displayH);
              } else {
                  ctx.drawImage(bitmap, drawX, drawY, displayW, displayH);
              }
          } else {
              // Standard centered sprite
              if (transform.facing === 'left') {
                  ctx.translate(drawX + displayW, drawY);
                  ctx.scale(-1, 1);
                  ctx.drawImage(bitmap, 0, 0, displayW, displayH);
              } else {
                  ctx.drawImage(bitmap, drawX, drawY, displayW, displayH);
              }
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

    // UI: Draw Enemy HP Bars and Proximity-Based Devour Badges
    const players = world.queryEntities([Transform, PlayerInput, Health]);
    const playerTransform = players.length > 0 ? world.getComponent(players[0], Transform) : null;
    const playerHealth = players.length > 0 ? world.getComponent(players[0], Health) : null;

    const enemyEntities = world.queryEntities([Transform, Health, AI]);
    for (const id of enemyEntities) {
        const transform = world.getComponent(id, Transform);
        const health = world.getComponent(id, Health);
        
        // Check proximity to player
        const isNearPlayer = playerTransform && playerHealth && playerHealth.alive && 
            Math.abs(playerTransform.x - transform.x) < 140 && Math.abs(playerTransform.y - transform.y) < 80;

        if (!health.alive && health.hp === 0) {
            // Only show [E] DEVOUR when player is nearby
            if (isNearPlayer) {
                const pulse = Math.sin(performance.now() / 150) * 0.3 + 0.7;
                const badgeX = transform.x + transform.width / 2;
                const badgeY = transform.y - 14;
                
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(badgeX - 36, badgeY - 11, 72, 16);
                ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(badgeX - 36, badgeY - 11, 72, 16);
                
                ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('[E] DEVOUR', badgeX, badgeY + 1);
                ctx.restore();
            }
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

            if (health.hp < health.maxHp * 0.5 && isNearPlayer) {
                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('[E]', transform.x + transform.width / 2, transform.y - 15);
            }
        }
    }

    ctx.restore(); // Restore to Screen Space
    // All further UI is handled by UISystem
  }
}
