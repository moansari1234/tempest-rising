import { Transform, Velocity, PlayerInput, Health, CombatData, Sprite, InteractiveProp, Hazard } from '../Components.js';

export class EnvironmentSystem {
  update(world, dt, context) {
    const { inputManager, audio, sage, xpSystem } = context;

    const players = world.queryEntities([Transform, PlayerInput, Health]);
    if (players.length === 0) return;

    const pId = players[0];
    const pTransform = world.getComponent(pId, Transform);
    const pHealth = world.getComponent(pId, Health);
    const pInput = world.getComponent(pId, PlayerInput);
    const pVelocity = world.getComponent(pId, Velocity);
    const pCombat = world.getComponent(pId, CombatData);

    const isInteractJustPressed = inputManager.isActionJustPressed('absorb') || inputManager.isActionJustPressed('attackLight');

    // --- 1. Interactive Props Update ---
    const props = world.queryEntities([Transform, InteractiveProp, Sprite]);
    for (const id of props) {
      const transform = world.getComponent(id, Transform);
      const prop = world.getComponent(id, InteractiveProp);
      const sprite = world.getComponent(id, Sprite);

      // Looping ambient animations for torches and campfires
      if (prop.type === 'torch' || prop.type === 'campfire') {
        sprite.currentAnimation = 'burn';
        continue;
      }

      if (prop.used) {
        if (prop.type === 'chest') sprite.currentAnimation = 'open';
        if (prop.type === 'magisteel') sprite.currentAnimation = 'break';
        if (prop.type === 'urn') sprite.currentAnimation = 'break';
        if (prop.type === 'monolith') sprite.currentAnimation = 'activate';
        continue;
      }

      // Check player proximity
      const dist = Math.hypot(
        (pTransform.x + pTransform.width / 2) - (transform.x + transform.width / 2),
        (pTransform.y + pTransform.height / 2) - (transform.y + transform.height / 2)
      );

      if (dist <= prop.range) {
        // Show in-world prompt flag on prop
        prop.inRange = true;

        if (isInteractJustPressed) {
          prop.used = true;
          if (audio) audio.play('absorb');

          // Action based on prop type
          if (prop.type === 'chest') {
            sprite.currentAnimation = 'open';
            if (xpSystem) xpSystem.awardXP(prop.xpValue, 1.0, context);
            if (pHealth) {
              pHealth.hp = Math.min(pHealth.maxHp, pHealth.hp + prop.hpValue);
            }
            if (sage) {
              sage.notify(
                '« ❖ TREASURE DISCOVERY ❖ »',
                '«Report: Opened Ancient Gilded Chest. Acquired 100 XP, 50 HP and Ancient Silver Relic!»',
                { type: 'skill_acquired', duration: 4.5, sound: 'level_up' }
              );
            }
          } else if (prop.type === 'hipokute') {
            sprite.currentAnimation = 'bloom';
            if (pHealth) {
              pHealth.hp = Math.min(pHealth.maxHp, pHealth.hp + prop.hpValue);
            }
            if (xpSystem) xpSystem.awardXP(prop.xpValue, 1.0, context);
            if (sage) {
              sage.notify(
                '« REPORT: GREAT SAGE »',
                `«Harvested [Hipokute Lotus]. Restored ${prop.hpValue} HP and synthesized High-Potion.»`,
                { type: 'devour', duration: 3.5, sound: 'absorb' }
              );
            }
            setTimeout(() => world.removeEntity(id), 1200);
          } else if (prop.type === 'magisteel') {
            sprite.currentAnimation = 'break';
            if (xpSystem) xpSystem.awardXP(prop.xpValue, 1.0, context);
            if (sage) {
              sage.notify(
                '« REPORT: GREAT SAGE »',
                '«Mined [Pure Magisteel Vein]. Absorbed high-density magical ore into Stomach storage.»',
                { type: 'info', duration: 3.5, sound: 'hit' }
              );
            }
          } else if (prop.type === 'urn') {
            sprite.currentAnimation = 'break';
            if (xpSystem) xpSystem.awardXP(prop.xpValue, 1.0, context);
            if (audio) audio.play('hit');
            setTimeout(() => world.removeEntity(id), 1000);
          } else if (prop.type === 'campfire') {
            if (pHealth) {
              pHealth.hp = pHealth.maxHp;
              pHealth.mp = pHealth.maxMp;
            }
            if (sage) {
              sage.notify(
                '« ❖ SANCTUARY RESTORED ❖ »',
                '«Notice: Rested at Adventurer Campfire. HP and Magicules completely restored!»',
                { type: 'info', duration: 4.0, sound: 'level_up' }
              );
            }
          } else if (prop.type === 'monolith') {
            sprite.currentAnimation = 'activate';
            if (pCombat) pCombat.atk += 3;
            if (sage) {
              sage.notify(
                '« ❖ MONOLITH BLESSING ❖ »',
                '«Report: Communed with Ancient Cavern Monolith. Attack Power temporarily boosted (+3 ATK)!»',
                { type: 'skill_acquired', duration: 5.0, sound: 'level_up' }
              );
            }
          }
        }
      } else {
        prop.inRange = false;
      }
    }

    // --- 2. Subterranean Hazards Update ---
    const hazards = world.queryEntities([Transform, Hazard, Sprite]);
    for (const id of hazards) {
      const transform = world.getComponent(id, Transform);
      const hazard = world.getComponent(id, Hazard);
      const sprite = world.getComponent(id, Sprite);

      if (hazard.cooldown > 0) hazard.cooldown -= dt;

      const pCenterX = pTransform.x + pTransform.width / 2;
      const pCenterY = pTransform.y + pTransform.height / 2;
      const hCenterX = transform.x + transform.width / 2;
      const hCenterY = transform.y + transform.height / 2;

      // Floor Spikes
      if (hazard.type === 'spikes') {
        const isOver = Math.abs(pCenterX - hCenterX) < 22 && Math.abs(pCenterY - hCenterY) < 20;
        if (isOver && hazard.cooldown <= 0 && pHealth.alive && pHealth.iFrameTimer <= 0) {
          hazard.cooldown = 1.0;
          sprite.currentAnimation = 'trigger';
          sprite.frameIndex = 0;
          pHealth.hp = Math.max(0, pHealth.hp - hazard.damage);
          pHealth.iFrameTimer = 0.6;
          if (pVelocity) {
            pVelocity.vy = -220; // Pop player upwards
          }
          if (audio) audio.play('player_hurt');
          if (context.floaterQueue) {
            context.floaterQueue.push({
              x: pCenterX,
              y: pCenterY - 10,
              text: `-${hazard.damage} SPIKES`,
              color: '#ef4444',
              lifetime: 1.0,
              maxLifetime: 1.0
            });
          }
        }
      }

      // Ceiling Stalactite
      if (hazard.type === 'stalactite') {
        const isUnderneath = Math.abs(pCenterX - hCenterX) < 32 && pTransform.y > transform.y && (pTransform.y - transform.y) < 240;
        if (isUnderneath && !hazard.triggered) {
          hazard.triggered = true;
          hazard.timer = 0.3; // 300ms shake warning
        }

        if (hazard.triggered) {
          if (hazard.timer > 0) {
            hazard.timer -= dt;
            transform.x = hCenterX - 16 + (Math.random() - 0.5) * 4; // Shake
          } else {
            // Drop down rapidly
            transform.y += 320 * dt;
            sprite.currentAnimation = 'drop';

            // Check hit with player
            if (Math.abs(pCenterX - hCenterX) < 20 && Math.abs(pCenterY - (transform.y + 16)) < 20 && pHealth.alive && pHealth.iFrameTimer <= 0) {
              pHealth.hp = Math.max(0, pHealth.hp - hazard.damage);
              pHealth.iFrameTimer = 0.6;
              if (audio) audio.play('player_hurt');
              world.removeEntity(id);
              if (context.floaterQueue) {
                context.floaterQueue.push({
                  x: pCenterX,
                  y: pCenterY - 10,
                  text: `-${hazard.damage} STALACTITE`,
                  color: '#ef4444',
                  lifetime: 1.0,
                  maxLifetime: 1.0
                });
              }
            } else if (context.levelManager && context.levelManager.isSolid(hCenterX, transform.y + 32)) {
              // Shattered on ground
              if (audio) audio.play('hit');
              world.removeEntity(id);
            }
          }
        }
      }

      // Toxic Spore Mushroom & Acid Vent
      if (hazard.type === 'spore_shroom' || hazard.type === 'acid_vent') {
        const dist = Math.hypot(pCenterX - hCenterX, pCenterY - hCenterY);
        if (dist < hazard.triggerRange) {
          sprite.currentAnimation = 'trigger';
          if (hazard.cooldown <= 0 && pHealth.alive && pHealth.iFrameTimer <= 0) {
            hazard.cooldown = 1.2;
            pHealth.hp = Math.max(0, pHealth.hp - hazard.damage);
            pHealth.iFrameTimer = 0.5;
            if (audio) audio.play('player_hurt');
            if (context.floaterQueue) {
              context.floaterQueue.push({
                x: pCenterX,
                y: pCenterY - 10,
                text: `-${hazard.damage} POISON`,
                color: '#22c55e',
                lifetime: 1.0,
                maxLifetime: 1.0
              });
            }
          }
        }
      }
    }
  }
}
