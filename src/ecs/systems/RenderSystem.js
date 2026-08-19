import { Transform, Sprite, Velocity, Hurtbox, Hitbox, AI, PlayerInput, Health, InteractiveProp, Hazard } from '../Components.js';
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

    // Render Multi-Layer Parallax Backgrounds
    const bgFar = spriteParser.cache.get('background_bg_cavern_far');
    const bgMid = spriteParser.cache.get('background_bg_cavern_mid');
    const bgNear = spriteParser.cache.get('background_bg_cavern_near');

    const viewX = camera.x;
    const viewY = camera.y;
    const viewW = camera.viewportWidth || CONSTANTS.NATIVE_WIDTH || 960;
    const viewH = camera.viewportHeight || CONSTANTS.NATIVE_HEIGHT || 540;

    // Layer 1: Far Abyss & Cavern Bridges (0.15x parallax)
    if (bgFar) {
      const pFarX = viewX * 0.15;
      const bgW = (bgFar.width || bgFar.naturalWidth || 960) * 1.5;
      const bgH = Math.max(viewH, (bgFar.height || bgFar.naturalHeight || 540));
      const startX = Math.floor((viewX - pFarX) / bgW) * bgW + pFarX;
      for (let bx = startX - bgW; bx < viewX + viewW + bgW; bx += bgW) {
        ctx.drawImage(bgFar, bx, viewY, bgW, bgH);
      }
    }

    // Layer 2: Bioluminescent Mushroom Forest & Waterfalls (0.35x parallax)
    if (bgMid) {
      const pMidX = viewX * 0.35;
      const bgW = (bgMid.width || bgMid.naturalWidth || 960) * 1.5;
      const bgH = Math.max(viewH, (bgMid.height || bgMid.naturalHeight || 540));
      const startX = Math.floor((viewX - pMidX) / bgW) * bgW + pMidX;
      for (let bx = startX - bgW; bx < viewX + viewW + bgW; bx += bgW) {
        ctx.drawImage(bgMid, bx, viewY, bgW, bgH);
      }
    }

    // Layer 3: Foreground Pillars & Hanging Vines (0.65x parallax)
    if (bgNear) {
      const pNearX = viewX * 0.65;
      const bgW = (bgNear.width || bgNear.naturalWidth || 960) * 1.5;
      const bgH = Math.max(viewH, (bgNear.height || bgNear.naturalHeight || 540));
      const startX = Math.floor((viewX - pNearX) / bgW) * bgW + pNearX;
      for (let bx = startX - bgW; bx < viewX + viewW + bgW; bx += bgW) {
        ctx.drawImage(bgNear, bx, viewY, bgW, bgH);
      }
    }

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
          const clipSpeed = spriteParser ? spriteParser.getClipSpeed(sprite.spriteKey, sprite.currentAnimation) : 1.0;
          sprite.frameTimer += animDt * clipSpeed;
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

          // Corpse dissolving fade out over 2.5s with rising magicule particles
          if (health && !health.alive && health.decayTimer !== undefined) {
              if (health.decayTimer < 2.5) {
                  ctx.globalAlpha *= Math.max(0, health.decayTimer / 2.5);
              }
              // Shimmering Magicule Rising Particles
              const now = performance.now();
              const cX = transform.x + transform.width / 2;
              const cY = transform.y + transform.height / 2;
              for (let m = 0; m < 3; m++) {
                  const mOffset = ((now / 15 + m * 40) % 60);
                  const mX = cX + Math.sin((now / 120) + m) * 16;
                  const mY = cY - mOffset;
                  const mAlpha = Math.max(0, 1 - (mOffset / 60));
                  ctx.fillStyle = m % 2 === 0 ? `rgba(56, 189, 248, ${mAlpha * 0.8})` : `rgba(250, 204, 21, ${mAlpha * 0.8})`;
                  ctx.beginPath();
                  ctx.arc(mX, mY, 1.5, 0, Math.PI * 2);
                  ctx.fill();
              }
          }
          
          // Calculate integer-scaled display dimensions
          let displayW, displayH;
          const isPropOrHazard = [
            'magisteel', 'hipokute', 'monolith', 'portal', 'chest', 'urn', 
            'torch', 'campfire', 'spikes', 'stalactite', 'spore_shroom', 'acid_vent'
          ].includes(sprite.spriteKey);

          if (isPropOrHazard) {
            displayW = transform.width;
            displayH = transform.height;
          } else if (sprite.spriteKey === 'serpent' || sprite.spriteKey === 'boss_serpent') {
              if (bitmap.width >= 100) {
                  displayW = bitmap.width * 0.6;
                  displayH = bitmap.height * 0.6;
              } else {
                  displayW = bitmap.width * 3;
                  displayH = bitmap.height * 3;
              }
          } else if (sprite.spriteKey === 'goblin' || sprite.spriteKey === 'goblin_archer') {
              if (bitmap.width >= 50) {
                  displayW = bitmap.width * 0.42;
                  displayH = bitmap.height * 0.42;
              } else {
                  displayW = bitmap.width * 2;
                  displayH = bitmap.height * 2;
              }
          } else if (sprite.spriteKey === 'rimuru' && bitmap.width >= 50) {
              displayW = bitmap.width * 0.38;
              displayH = bitmap.height * 0.38;
          } else if (bitmap.width >= 64) {
              displayW = bitmap.width * 0.5; // High-res sheet fallback
              displayH = bitmap.height * 0.5;
          } else {
              displayW = bitmap.width * 2; // 2x scale for pixel art
              displayH = bitmap.height * 2;
          }
          
          const offset = spriteParser.getOffset(sprite.spriteKey, sprite.currentAnimation, sprite.frameIndex);
          if (offset.scale && offset.scale !== 1.0) {
              displayW *= offset.scale;
              displayH *= offset.scale;
          }
          
          let drawX = isPropOrHazard ? transform.x : (transform.x + transform.width / 2 - displayW / 2);
          let drawY = isPropOrHazard ? transform.y : (transform.y + transform.height - displayH);
          drawX += (offset.offsetX || 0);
          drawY += (offset.offsetY || 0);
          
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
              if (transform.facing === 'left' && !isPropOrHazard) {
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

    // --- Render Active Projectiles (Poison Arrows) ---
    const projectiles = world.queryEntities([Transform, Hitbox, Velocity]);
    for (const pId of projectiles) {
      const pTrans = world.getComponent(pId, Transform);
      const pVel = world.getComponent(pId, Velocity);
      const pHit = world.getComponent(pId, Hitbox);
      if (pHit && pHit.element === 'poison') {
        ctx.save();
        const dir = pVel.vx >= 0 ? 1 : -1;
        // Arrow shaft
        ctx.fillStyle = '#15803d';
        ctx.fillRect(pTrans.x, pTrans.y + 2, pTrans.width, 3);

        // Glowing arrow head
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const headX = dir === 1 ? pTrans.x + pTrans.width : pTrans.x;
        ctx.moveTo(headX, pTrans.y);
        ctx.lineTo(headX + dir * 8, pTrans.y + 3);
        ctx.lineTo(headX, pTrans.y + 6);
        ctx.closePath();
        ctx.fill();

        // Toxic green particle trail
        ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
        ctx.fillRect(headX - dir * 22, pTrans.y + 1, 16, 5);
        ctx.restore();
      }
    }

    // Render In-World Health Bars and [E] Devour Prompts
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
                ctx.fillStyle = 'rgba(10, 15, 26, 0.92)';
                ctx.fillRect(badgeX - 48, badgeY - 12, 96, 18);
                ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(badgeX - 48, badgeY - 12, 96, 18);
                
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('« [E] PREDATOR »', badgeX, badgeY + 1);
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

    // Render In-World Prompts for Interactive Props (Chests, Herbs, Ore, Monoliths, Campfires)
    const props = world.queryEntities([Transform, InteractiveProp]);
    for (const pId of props) {
      const prop = world.getComponent(pId, InteractiveProp);
      const trans = world.getComponent(pId, Transform);
      if (prop.inRange && !prop.used && prop.prompt) {
        const pulse = Math.sin(performance.now() / 160) * 0.25 + 0.75;
        const badgeX = trans.x + trans.width / 2;
        const badgeY = trans.y - 14;
        const textWidth = prop.prompt.length * 7 + 16;
        
        ctx.save();
        ctx.fillStyle = 'rgba(10, 15, 26, 0.9)';
        ctx.fillRect(badgeX - textWidth / 2, badgeY - 11, textWidth, 16);
        ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(badgeX - textWidth / 2, badgeY - 11, textWidth, 16);
        
        ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(prop.prompt, badgeX, badgeY + 1);
        ctx.restore();
      }
    }

    ctx.restore(); // Restore to Screen Space
    // All further UI is handled by UISystem
  }
}
