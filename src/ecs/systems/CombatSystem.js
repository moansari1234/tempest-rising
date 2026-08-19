import { Transform, Hitbox, Hurtbox, Health, CombatData, Velocity, PlayerInput, AI } from '../Components.js';
import { CONSTANTS } from '../../data/constants.js';

export class CombatSystem {
  update(world, dt, context) {
    // 1. Process Hitboxes vs Hurtboxes
    const hitboxes = world.queryEntities([Transform, Hitbox]);
    const hurtboxes = world.queryEntities([Transform, Hurtbox, Health, CombatData]);

    for (const hId of hitboxes) {
      const hbTransform = world.getComponent(hId, Transform);
      const hitbox = world.getComponent(hId, Hitbox);

      // Decrement lifetime
      hitbox.lifetime -= dt;
      if (hitbox.lifetime <= 0) {
        world.removeEntity(hId);
        continue;
      }

      for (const tId of hurtboxes) {
        // Don't hit self or already hit targets
        if (tId === hitbox.ownerId || hitbox.hasHit.has(tId)) continue;

        const targetTransform = world.getComponent(tId, Transform);
        const targetHurtbox = world.getComponent(tId, Hurtbox);
        const targetHealth = world.getComponent(tId, Health);
        
        // Skip if dead or in I-frames
        if (!targetHealth.alive || targetHealth.iFrameTimer > 0) continue;

        // AABB Collision
        const hbRect = {
          x: hbTransform.x,
          y: hbTransform.y,
          w: hbTransform.width,
          h: hbTransform.height
        };
        const hurtRect = {
          x: targetTransform.x + targetHurtbox.offsetX,
          y: targetTransform.y + targetHurtbox.offsetY,
          w: targetHurtbox.width,
          h: targetHurtbox.height
        };

        if (this.checkCollision(hbRect, hurtRect)) {
          // HIT!
          hitbox.hasHit.add(tId);
          this.applyHit(world, hitbox, tId, context);
        }
      }
    }

    // 2. Decrement I-frames for all Health components
    const healthEntities = world.queryEntities([Health]);
    for (const id of healthEntities) {
      const health = world.getComponent(id, Health);
      if (health.iFrameTimer > 0) {
        health.iFrameTimer -= dt;
      }
    }
    // 3. Process Contact Damage (AABB overlap between Hurtboxes and enemies with contact damage)
    const players = world.queryEntities([Transform, Hurtbox, PlayerInput, Health]);
    const enemiesWithContact = world.queryEntities([Transform, Hurtbox, CombatData, Health]);
    
    for (const pId of players) {
      const pTransform = world.getComponent(pId, Transform);
      const pHurtbox = world.getComponent(pId, Hurtbox);
      const pHealth = world.getComponent(pId, Health);
      const pVelocity = world.getComponent(pId, Velocity);
      const pInput = world.getComponent(pId, PlayerInput);
      
      if (!pHealth.alive || pHealth.iFrameTimer > 0 || (pInput && pInput.state === 'dash')) continue;

      for (const eId of enemiesWithContact) {
        if (pId === eId) continue;
        const eHealth = world.getComponent(eId, Health);
        if (eHealth && !eHealth.alive) continue;

        const eCombatData = world.getComponent(eId, CombatData);
        if (!eCombatData || eCombatData.contactDamage <= 0) continue;

        const eTransform = world.getComponent(eId, Transform);
        const eHurtbox = world.getComponent(eId, Hurtbox);

        const rectP = { x: pTransform.x + pHurtbox.offsetX, y: pTransform.y + pHurtbox.offsetY, w: pHurtbox.width, h: pHurtbox.height };
        const rectE = { x: eTransform.x + eHurtbox.offsetX, y: eTransform.y + eHurtbox.offsetY, w: eHurtbox.width, h: eHurtbox.height };

        if (this.checkCollision(rectP, rectE)) {
          // Player takes contact damage
          let dmg = eCombatData.contactDamage;
          pHealth.hp -= dmg;
          if (pHealth.hp <= 0) pHealth.hp = 0;
          pHealth.iFrameTimer = CONSTANTS.HIT_I_FRAMES;

          // Knockback player
          if (pVelocity) {
            const dir = (eTransform.x > pTransform.x) ? -1 : 1;
            pVelocity.vx = dir * 200;
            pVelocity.vy = -150;
          }

          if (pInput && pInput.state.startsWith('attack')) {
            pInput.state = 'idle';
            pInput.stateTimer = 0;
          }
          break; // Only take contact damage from one enemy per frame
        }
      }
    }

    // 4. Predator Skill Logic
    const enemies = world.queryEntities([Transform, Velocity, CombatData, Health]);
    for (const pId of players) {
      const pInput = world.getComponent(pId, PlayerInput);
      const pTransform = world.getComponent(pId, Transform);
      const pHealth = world.getComponent(pId, Health);
      
      if (pInput && pInput.state === 'predator' && pHealth.alive) {
          const VACUUM_RADIUS = 150;
          const ABSORB_RADIUS = 40;
          const PULL_FORCE = 300;

          const pCenter = pTransform.x + pTransform.width / 2;

          for (const eId of enemies) {
              const eHealth = world.getComponent(eId, Health);
              const eCombat = world.getComponent(eId, CombatData);
              const eTransform = world.getComponent(eId, Transform);
              const eVelocity = world.getComponent(eId, Velocity);

              // Can absorb if it's explicitly absorbable OR if it's dead
              if (eHealth.devoured || (!eCombat.absorbable && eHealth.alive)) continue;

              const eCenter = eTransform.x + eTransform.width / 2;
              const dist = Math.abs(pCenter - eCenter);
              const dy = Math.abs(pTransform.y - eTransform.y);

              // Must be somewhat on the same vertical level and within radius
              if (dist < VACUUM_RADIUS && dy < 64) {
                  // Pull enemy
                  const dir = (pCenter > eCenter) ? 1 : -1;
                  eVelocity.vx = dir * PULL_FORCE;
                  
                  // Absorb if close enough and low HP (or dead)
                  if (dist < ABSORB_RADIUS && (eHealth.hp < eHealth.maxHp * 0.5 || !eHealth.alive)) {
                      eHealth.devoured = true;
                      console.log('PREDATOR ABSORB!');
                      world.removeEntity(eId); // Completely remove from world
                      
                      if (context.audio) context.audio.play('absorb');
                      if (context.floaterQueue) {
                          context.floaterQueue.push({ x: eCenter, y: eTransform.y, text: 'DEVOURED!', color: '#00FFFF', lifetime: 1.2, maxLifetime: 1.2 });
                      }
                      
                      if (eCombat && context.xpSystem) context.xpSystem.awardXP(eCombat.xpValue, 1.5, context);
                      
                      // Great Sage Analysis Notification
                      const eAI = world.getComponent(eId, AI);
                      if (context.sage) {
                          if (eAI && eAI.type === 'boss_serpent') {
                              context.sage.notify(
                                  '« ❖ MAJOR NOTICE: VOICE OF THE WORLD ❖ »',
                                  '«Analysis of Mythic Boss [Tempest Serpent] complete. Acquired Extra Skill [Thunder Dragon Discharge] & [Electric Breath]!»',
                                  { type: 'skill_acquired', duration: 6.0, sound: 'boss_roar' }
                              );
                          } else {
                              const foeName = eAI && eAI.type === 'goblin_archer' ? 'Goblin Sharpshooter' : 'Goblin Scout';
                              context.sage.notify(
                                  '« REPORT: GREAT SAGE »',
                                  `«Analysis of [${foeName}] complete. Absorbed magicules, biological data & restored 20 HP.»`,
                                  { type: 'devour', duration: 3.5, sound: 'absorb' }
                              );
                          }
                      }
                      
                      // Check if it's the boss
                      if (eAI && eAI.type === 'boss_serpent') {
                          if (context.xpSystem) context.xpSystem.awardBossBonus();
                          // Increase max HP and Save
                          pHealth.maxHp += 50;
                          pHealth.hp = pHealth.maxHp;
                          try {
                              localStorage.setItem('tempest_save_boss_defeated', 'true');
                              localStorage.setItem('tempest_save_max_hp', pHealth.maxHp.toString());
                          } catch(e) {}
                      } else {
                          // Heal player normally
                          pHealth.hp += 20;
                          if (pHealth.hp > pHealth.maxHp) pHealth.hp = pHealth.maxHp;
                      }
                      
                      // Huge hitstop and screen shake for impact
                      if (context.hitstopTimer < 0.2) context.hitstopTimer = 0.2;
                      context.camera.shake(CONSTANTS.SCREEN_SHAKE_HEAVY.amp, CONSTANTS.SCREEN_SHAKE_HEAVY.duration * 1000);
                  }
              }
          }
      }
    }

    // 5. Dead Entity Corpse Decay & Cleanup
    for (const eId of enemies) {
      const eHealth = world.getComponent(eId, Health);
      if (eHealth && !eHealth.alive) {
        if (eHealth.decayTimer === undefined) {
          eHealth.decayTimer = 8.0; // 8.0 seconds to devour before dissolving into magicules
        }
        eHealth.decayTimer -= dt;
        if (eHealth.decayTimer <= 0) {
          world.removeEntity(eId);
        }
      }
    }
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  applyHit(world, hitbox, targetId, context) {
    const { camera } = context;
    const health = world.getComponent(targetId, Health);
    const combatData = world.getComponent(targetId, CombatData);
    const targetTransform = world.getComponent(targetId, Transform);
    const targetVelocity = world.getComponent(targetId, Velocity);
    const targetInput = world.getComponent(targetId, PlayerInput);

    // Calculate Damage
    let damage = hitbox.damage - (combatData ? combatData.def : 0);
    if (damage < 1) damage = 1;

    // Check for Parry (if target is player and in parry state)
    if (targetInput && targetInput.state === 'parry') {
        // Successful Parry!
        // Negate damage and knockback, spawn a counter-hitbox, huge hitstop
        targetInput.state = 'idle'; // Reset state
        targetInput.stateTimer = 0;
        
        console.log('PARRY SUCCESS!');
        if (context.audio) context.audio.play('parry');
        if (context.floaterQueue) {
            context.floaterQueue.push({
                x: targetTransform.x + targetTransform.width / 2,
                y: targetTransform.y,
                text: 'PARRY!',
                color: '#FFD700',
                lifetime: 1.0, maxLifetime: 1.0
            });
        }

        // Huge hitstop
        if (context.hitstopTimer < 0.3) {
            context.hitstopTimer = 0.3; // 300ms freeze
        }
        camera.shake(CONSTANTS.SCREEN_SHAKE_BOSS.amp, CONSTANTS.SCREEN_SHAKE_BOSS.duration * 1000);

        // Counter Hitbox
        const counterId = world.createEntity();
        world.addComponent(counterId, new Transform(targetTransform.x - 32, targetTransform.y - 32, 96, 96)); // Large AoE
        world.addComponent(counterId, new Hitbox(
            targetId,
            hitbox.damage * CONSTANTS.PARRY_COUNTER_MULT,
            400,
            0.1,
            CONSTANTS.HITSTOP_CRITICAL,
            'neutral',
            { unparryable: true }
        ));

        // Grant I-frames for successful parry
        health.iFrameTimer = 0.5;
        return; // Don't apply damage to target
    }

    // Apply Damage
    health.hp -= damage;
    
    if (context.audio) context.audio.play(targetInput ? 'player_hurt' : 'hit');
    if (context.floaterQueue) {
        context.floaterQueue.push({
            x: targetTransform.x + targetTransform.width / 2,
            y: targetTransform.y,
            text: `-${Math.floor(damage)}`,
            color: targetInput ? '#FF4444' : '#FFFFFF',
            lifetime: 1.0, maxLifetime: 1.0
        });
    }

    if (health.hp <= 0) {
      health.hp = 0;
      health.alive = false;
      if (targetVelocity) targetVelocity.vx = 0; // Prevent sliding endlessly when dead
      
      // XP & Title Award
      if (!targetInput && combatData && context.xpSystem) {
          const comboStage = hitbox.properties ? hitbox.properties.comboStage : 1;
          const comboMult = CONSTANTS.COMBO_XP_MULTS ? CONSTANTS.COMBO_XP_MULTS[comboStage] || 1.0 : 1.0;
          context.xpSystem.awardXP(combatData.xpValue, comboMult, context);

          if (combatData.xpValue >= 200 && context.titleSystem) {
              context.titleSystem.unlockTitle('subterranean_predator', context);
          }
      }
    }

    // Give I-frames
    health.iFrameTimer = CONSTANTS.HIT_I_FRAMES;

    // Knockback
    if (targetVelocity) {
      const ownerTransform = world.getComponent(hitbox.ownerId, Transform);
      const dir = (ownerTransform && ownerTransform.x > targetTransform.x) ? -1 : 1;
      
      const mass = combatData ? combatData.mass : 1.0;
      targetVelocity.vx = (dir * hitbox.knockback) / mass;
      
      if (hitbox.properties && hitbox.properties.launcher === 'up') {
          targetVelocity.vy = -250 / mass;
      } else if (hitbox.properties && hitbox.properties.launcher === 'heavy') {
          targetVelocity.vy = -400 / mass;
      } else {
          targetVelocity.vy = -150 / mass; 
      }
    }

    // Cancel attack state if hit (Player)
    if (targetInput && targetInput.state.startsWith('attack')) {
        targetInput.state = 'idle';
        targetInput.stateTimer = 0;
    }

    const settings = context.settingsManager || { screenShake: true, hitstop: true };

    // Global Hitstop Trigger
    if (settings.hitstop && context.hitstopTimer < hitbox.hitstopMs / 1000) {
        context.hitstopTimer = hitbox.hitstopMs / 1000;
    }

    // Screen Shake based on hitstop duration
    if (settings.screenShake && camera) {
        if (hitbox.hitstopMs >= CONSTANTS.HITSTOP_CRITICAL) {
            camera.shake(CONSTANTS.SCREEN_SHAKE_HEAVY.amp, CONSTANTS.SCREEN_SHAKE_HEAVY.duration * 1000);
        } else {
            camera.shake(CONSTANTS.SCREEN_SHAKE_LIGHT.amp, CONSTANTS.SCREEN_SHAKE_LIGHT.duration * 1000);
        }
    }
  }
}
