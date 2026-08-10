import { Transform, Sprite, Velocity, Hurtbox, Hitbox, AI, PlayerInput, Health } from '../Components.js';
import { CONSTANTS } from '../../data/constants.js';
import { AnimationData } from '../../sprites/AnimationData.js';

export class RenderSystem {
  update(world, dt, context) {
    const { ctx, camera, canvas, spriteParser } = context;

    // Clear screen
    ctx.fillStyle = '#050A10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state for camera transform
    ctx.save();
    
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
      const input = world.getComponent(id, PlayerInput); // Need to check if player
      
      // Basic animation state machine
      if (ai) {
          // If it's an AI, map its state to animation
          if (ai.state === 'patrol' || ai.state === 'chase') {
              sprite.currentAnimation = 'run';
          } else if (ai.state === 'attack' || ai.state === 'hurt') {
              sprite.currentAnimation = AnimationData[sprite.spriteKey][ai.state] ? ai.state : 'idle';
          } else {
              sprite.currentAnimation = 'idle';
          }
      } else if (velocity) {
          // Player fallback based on velocity
          if (Math.abs(velocity.vx) > 10) {
              sprite.currentAnimation = 'run';
          } else {
              sprite.currentAnimation = 'idle';
          }
      }

      // Vacuum VFX
      if (input && input.state === 'predator') {
          ctx.save();
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'; // Blue lines
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          const centerX = transform.x + transform.width / 2;
          const centerY = transform.y + transform.height / 2;
          
          // Draw a bunch of converging lines for a quick vacuum effect
          for (let i = 0; i < 8; i++) {
              const angle = (Math.PI * 2 / 8) * i + (performance.now() / 200);
              const distOut = 150 - ((performance.now() / 5) % 150); // move inward
              const distIn = Math.max(0, distOut - 20);
              
              ctx.moveTo(centerX + Math.cos(angle) * distOut, centerY + Math.sin(angle) * distOut);
              ctx.lineTo(centerX + Math.cos(angle) * distIn, centerY + Math.sin(angle) * distIn);
          }
          ctx.stroke();
          ctx.restore();
      }

      // Update animation timer
      let animData = AnimationData[sprite.spriteKey][sprite.currentAnimation];
      if (!animData) {
          console.warn(`Missing animation data for ${sprite.spriteKey} -> ${sprite.currentAnimation}`);
          sprite.currentAnimation = 'idle';
          animData = AnimationData[sprite.spriteKey]['idle'];
      }
      
      if (animData) {
          sprite.frameTimer += dt;
          if (sprite.frameTimer >= animData.frameTime) {
              sprite.frameTimer = 0;
              sprite.frameIndex++;
              if (sprite.frameIndex >= animData.frames) {
                  if (animData.loop) {
                      sprite.frameIndex = 0;
                  } else {
                      sprite.frameIndex = animData.frames - 1; // stick to last frame
                  }
              }
          }
      }

      // Fetch bitmap
      const bitmap = spriteParser.getBitmap(sprite.spriteKey, sprite.currentAnimation, sprite.frameIndex);

      if (bitmap) {
          ctx.save();
          // The bitmap is 16x16, we draw it at transform width/height (32x32)
          
          if (transform.facing === 'left') {
              ctx.translate(transform.x + transform.width, transform.y);
              ctx.scale(-1, 1);
              ctx.drawImage(bitmap, 0, 0, transform.width, transform.height);
          } else {
              ctx.drawImage(bitmap, transform.x, transform.y, transform.width, transform.height);
          }
          ctx.restore();
      }
    }

    // DEBUG: Draw Hurtboxes
    const hurtboxes = world.queryEntities([Transform, Hurtbox]);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    for (const id of hurtboxes) {
        const transform = world.getComponent(id, Transform);
        const hurtbox = world.getComponent(id, Hurtbox);
        ctx.fillRect(transform.x + hurtbox.offsetX, transform.y + hurtbox.offsetY, hurtbox.width, hurtbox.height);
    }

    // DEBUG: Draw Hitboxes
    const hitboxes = world.queryEntities([Transform, Hitbox]);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    for (const id of hitboxes) {
        const transform = world.getComponent(id, Transform);
        ctx.fillRect(transform.x, transform.y, transform.width, transform.height);
    }

    // UI: Draw Enemy HP Bars and Devour Indicators (In Camera Space)
    const enemyEntities = world.queryEntities([Transform, Health, AI]);
    for (const id of enemyEntities) {
        const transform = world.getComponent(id, Transform);
        const health = world.getComponent(id, Health);
        
        if (!health.alive && health.hp === 0) {
            // Draw DEVOUR indicator if dead
            ctx.fillStyle = '#facc15'; // yellow-400
            ctx.font = 'bold 12px monospace';
            ctx.fillText('[E] DEVOUR', transform.x - 10, transform.y - 10);
            continue;
        }

        // Only draw HP bar if missing health
        if (health.hp < health.maxHp) {
            const barWidth = 32;
            const barHeight = 4;
            const barX = transform.x + (transform.width / 2) - (barWidth / 2);
            const barY = transform.y - 10;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
            
            ctx.fillStyle = '#ef4444'; // red-500
            ctx.fillRect(barX, barY, barWidth * (health.hp / health.maxHp), barHeight);

            // Draw DEVOUR indicator if < 50%
            if (health.hp < health.maxHp * 0.5) {
                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 10px monospace';
                ctx.fillText('[E]', transform.x + 10, transform.y - 15);
            }
        }
    }

    ctx.restore(); // Restore to Screen Space

    // UI: Draw Player HUD (Screen Space)
    const players = world.queryEntities([Transform, Health, PlayerInput]);
    if (players.length > 0) {
        const playerHealth = world.getComponent(players[0], Health);
        
        // HP Bar Background
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fillRect(20, 20, 200, 20);
        
        // HP Bar Fill
        ctx.fillStyle = '#22c55e'; // green-500
        ctx.fillRect(20, 20, 200 * (playerHealth.hp / playerHealth.maxHp), 20);
        
        // HP Bar Border
        ctx.strokeStyle = '#f8fafc'; // slate-50
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 200, 20);

        // HP Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`HP: ${Math.floor(playerHealth.hp)}/${playerHealth.maxHp}`, 30, 35);
    }

    // UI: Draw Boss HP Bar (Screen Space, Top Center)
    const bosses = world.queryEntities([Transform, Health, AI]);
    for (const id of bosses) {
        const ai = world.getComponent(id, AI);
        if (ai.type === 'boss_serpent') {
            const bossHealth = world.getComponent(id, Health);
            
            // Only draw if alive or recently dead (hp > 0 or for a short time after)
            if (bossHealth.hp > 0 || !bossHealth.alive) {
                const barWidth = 400;
                const barHeight = 24;
                const barX = (canvas.width / 2) - (barWidth / 2);
                const barY = 40;
                
                // Background
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                
                // Fill (Purple/Red for boss)
                ctx.fillStyle = '#9333ea'; // purple-600
                ctx.fillRect(barX, barY, barWidth * (bossHealth.hp / bossHealth.maxHp), barHeight);
                
                // Border
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 3;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
                
                // Boss Name
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('TEMPEST SERPENT', canvas.width / 2, barY - 10);
                
                // Reset text align for other UI
                ctx.textAlign = 'left';
            }
        }
    }

    // GAME OVER Screen
    if (players.length > 0) {
        const playerHealth = world.getComponent(players[0], Health);
        if (playerHealth && !playerHealth.alive) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 48px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px monospace';
            ctx.fillText('Refresh the page to try again.', canvas.width / 2, canvas.height / 2 + 40);
            
            ctx.textAlign = 'left';
        }
    }

    // VICTORY Screen
    try {
        if (localStorage.getItem('tempest_save_boss_defeated') === 'true') {
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 48px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('VICTORY!', canvas.width / 2, 120);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px monospace';
            ctx.fillText('You have devoured the Tempest Serpent!', canvas.width / 2, 160);
            
            ctx.textAlign = 'left';
        }
    } catch(e) {}
  }
}
