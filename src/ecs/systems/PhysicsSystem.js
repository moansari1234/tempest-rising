import { Transform, Velocity, PlayerInput, Collider, Hitbox, Health, Sprite } from '../Components.js';
import { CONSTANTS } from '../../data/constants.js';
import { GameState } from '../../core/GameStateManager.js';

export class PhysicsSystem {
  update(world, dt, context) {
    const { inputManager } = context;

    const players = world.queryEntities([Transform, Velocity, PlayerInput, Collider]);
    for (const id of players) {
      const transform = world.getComponent(id, Transform);
      const velocity = world.getComponent(id, Velocity);
      const input = world.getComponent(id, PlayerInput);
      const collider = world.getComponent(id, Collider);
      const sprite = world.getComponent(id, Sprite);

      // Timers
      if (input.dashCooldown > 0) input.dashCooldown -= dt;
      if (input.comboResetTimer > 0) {
          input.comboResetTimer -= dt;
          if (input.comboResetTimer <= 0) input.comboHit = 0;
      }
      if (collider.onGround) {
          input.coyoteTimer = CONSTANTS.COYOTE_TIME;
          input.canDoubleJump = true;
      } else {
          input.coyoteTimer -= dt;
      }

      // State Machine Transitions
      if (input.state === 'dash') {
          input.stateTimer -= dt;
          velocity.vy = 0; // suspend gravity
          if (input.stateTimer <= 0) {
              input.state = 'idle';
              velocity.vx = 0;
          }
      } else if (input.state === 'attack_light') {
          input.stateTimer -= dt;
          velocity.vx = 0; // Root motion during attack
          if (input.stateTimer <= 0) {
              if (input.comboHit >= 3) {
                  input.state = 'attack_recovery';
                  input.stateTimer = 0.3; // Finisher recovery
              } else {
                  input.state = 'idle';
              }
          }
      } else if (input.state === 'attack_heavy') {
          input.chargeTimer = (input.chargeTimer || 0) + dt;
          velocity.vx = 0;
          
          if (input.chargeTimer >= 2.0) input.chargeLevel = 2;
          else if (input.chargeTimer >= 1.0) input.chargeLevel = 1;
          else input.chargeLevel = 0;
          
          if (!inputManager.isActionHeld('attackHeavy') || input.chargeTimer > 2.5) {
              const hitboxId = world.createEntity();
              let hbW = 48, hbH = 48, dmgMult = 1.5, kb = 300, hitstop = CONSTANTS.HITSTOP_HEAVY;
              if (input.chargeLevel === 1) { hbW = 64; hbH = 56; dmgMult = 2.5; kb = 500; hitstop = CONSTANTS.HITSTOP_CRITICAL; }
              else if (input.chargeLevel === 2) { hbW = 80; hbH = 64; dmgMult = 4.0; kb = 700; hitstop = CONSTANTS.HITSTOP_CRITICAL; }
              
              const hbX = transform.facing === 'right' ? transform.x + transform.width : transform.x - hbW;
              world.addComponent(hitboxId, new Transform(hbX, transform.y + transform.height - hbH, hbW, hbH));
              world.addComponent(hitboxId, new Hitbox(id, 10 * dmgMult, kb, 0.1, hitstop, 'heavy'));
              
              if (context.audio) context.audio.play('attack_heavy');
              
              input.state = 'attack_heavy_strike';
              input.stateTimer = 0.35;
              input.chargeTimer = 0;
              input.chargeLevel = 0;

              if (sprite) {
                  sprite.currentAnimation = 'attack_heavy';
                  sprite.frameIndex = 2; // Impact slam frame
                  sprite.frameTimer = 0;
              }
          }
      } else if (input.state === 'attack_heavy_strike') {
          input.stateTimer -= dt;
          velocity.vx = 0;
          if (input.stateTimer <= 0) input.state = 'idle';
      } else if (input.state === 'attack_recovery') {
          input.stateTimer -= dt;
          velocity.vx = 0;
          if (input.stateTimer <= 0) input.state = 'idle';
      } else if (input.state === 'parry') {
          input.stateTimer -= dt;
          velocity.vx = 0;
          if (input.stateTimer <= 0) {
              input.state = 'idle';
          }
      } else if (input.state === 'predator') {
          velocity.vx = 0; // Rooted while vacuuming
          if (!inputManager.isActionHeld('skillPredator')) {
              input.state = 'idle';
          }
      } else {
          // Normal movement
          const health = world.getComponent(id, Health);
          if (health && !health.alive) {
              velocity.vx = 0;
          } else {
              let moveDir = 0;
              if (inputManager.isActionHeld('moveLeft')) moveDir -= 1;
              if (inputManager.isActionHeld('moveRight')) moveDir += 1;

              velocity.vx = moveDir * CONSTANTS.PLAYER_SPEED;
              
              if (moveDir < 0) transform.facing = 'left';
              if (moveDir > 0) transform.facing = 'right';

              // Dash
              if (inputManager.isActionJustPressed('dash') && input.dashCooldown <= 0) {
                  input.state = 'dash';
                  input.stateTimer = CONSTANTS.DASH_DURATION;
                  input.dashCooldown = CONSTANTS.DASH_COOLDOWN;
                  velocity.vx = (transform.facing === 'right' ? 1 : -1) * CONSTANTS.DASH_SPEED;
                  inputManager.consumeAction('dash');
                  if (context.audio) context.audio.play('dash');
                  if (sprite) {
                      sprite.currentAnimation = 'run';
                      sprite.frameIndex = 0;
                      sprite.frameTimer = 0;
                  }
              }
              // Parry
              else if (inputManager.isActionJustPressed('parry')) {
                  input.state = 'parry';
                  input.stateTimer = CONSTANTS.PARRY_WINDOW;
                  inputManager.consumeAction('parry');
                  if (context.audio) context.audio.play('parry');
                  if (sprite) {
                      sprite.currentAnimation = 'special';
                      sprite.frameIndex = 0;
                      sprite.frameTimer = 0;
                  }
              }
              // Predator Skill
              else if (inputManager.isActionHeld('skillPredator')) {
                  input.state = 'predator';
                  if (context.audio) context.audio.play('absorb');
              }
              // Attack Light
              else if (inputManager.isActionJustPressed('attackLight')) {
                  const comboWindow = CONSTANTS.LIGHT_COMBO_TIMING ? CONSTANTS.LIGHT_COMBO_TIMING[input.comboHit || 0] : 0.3;
                  input.comboHit = (input.comboHit || 0) + 1;
                  if (input.comboHit > 3) input.comboHit = 1;
                  input.comboResetTimer = comboWindow + 0.5; // Window to hit again
                  
                  input.state = 'attack_light';
                  input.stateTimer = comboWindow + 0.1;
                  inputManager.consumeAction('attackLight');
                  if (context.audio) context.audio.play('attack_light');

                  if (sprite) {
                      sprite.currentAnimation = 'attack_light';
                      sprite.frameIndex = 0;
                      sprite.frameTimer = 0;
                  }

                  let dmgMult = 1.0;
                  let kb = 200;
                  let hbW = 40, hbH = 40;
                  let hitstop = CONSTANTS.HITSTOP_LIGHT;
                  
                  if (input.comboHit === 2) { dmgMult = 1.2; kb = 200; hbH = 48; }
                  if (input.comboHit === 3) { dmgMult = 1.8; kb = 400; hbW = 52; hbH = 52; hitstop = CONSTANTS.HITSTOP_CRITICAL; }

                  // Spawn Hitbox
                  const hitboxId = world.createEntity();
                  const hbX = transform.facing === 'right' ? transform.x + transform.width : transform.x - hbW;
                  world.addComponent(hitboxId, new Transform(hbX, transform.y + transform.height - hbH, hbW, hbH));
                  
                  const hitbox = new Hitbox(id, 10 * dmgMult, kb, 0.1, hitstop, 'light');
                  hitbox.properties = { comboStage: input.comboHit };
                  if (input.comboHit === 2) hitbox.properties.launcher = 'up';
                  if (input.comboHit === 3) hitbox.properties.launcher = 'heavy';
                  world.addComponent(hitboxId, hitbox);
              }
              // Attack Heavy
              else if (inputManager.isActionJustPressed('attackHeavy')) {
                  input.state = 'attack_heavy';
                  input.chargeTimer = 0;
                  input.chargeLevel = 0;
                  inputManager.consumeAction('attackHeavy');
                  if (sprite) {
                      sprite.currentAnimation = 'attack_heavy';
                      sprite.frameIndex = 0;
                      sprite.frameTimer = 0;
                  }
              }
          }

          // Jump
          if (inputManager.isActionJustPressed('jump')) {
              if (input.coyoteTimer > 0) {
                  velocity.vy = CONSTANTS.JUMP_FORCE;
                  input.coyoteTimer = 0;
                  inputManager.consumeAction('jump');
                  if (context.audio) context.audio.play('jump');
                  if (sprite) {
                      sprite.currentAnimation = 'jump';
                      sprite.frameIndex = 0;
                      sprite.frameTimer = 0;
                  }
              } else if (input.canDoubleJump) {
                  velocity.vy = CONSTANTS.DOUBLE_JUMP_FORCE;
                  input.canDoubleJump = false;
                  inputManager.consumeAction('jump');
                  if (context.audio) context.audio.play('jump');
                  if (sprite) {
                      sprite.currentAnimation = 'jump';
                      sprite.frameIndex = 1;
                      sprite.frameTimer = 0;
                  }
              }
          }

          // Update generic movement states
          if (['idle', 'walk', 'run', 'jump', 'fall'].includes(input.state)) {
              if (!collider.onGround) {
                  input.state = velocity.vy < 0 ? 'jump' : 'fall';
              } else if (Math.abs(velocity.vx) > 100) {
                  input.state = 'run';
              } else if (Math.abs(velocity.vx) > 0) {
                  input.state = 'walk';
              } else {
                  input.state = 'idle';
              }
          }
      }
    }

    // Apply Gravity and integrate Velocity to position
    const physicalEntities = world.queryEntities([Transform, Velocity]);
    for (const id of physicalEntities) {
      const transform = world.getComponent(id, Transform);
      const velocity = world.getComponent(id, Velocity);
      const collider = world.getComponent(id, Collider);
      const input = world.getComponent(id, PlayerInput); // Check if player for dash gravity suspension
      
      const levelManager = context.levelManager;

      // Apply gravity
      if (!input || input.state !== 'dash') {
          velocity.vy += CONSTANTS.GRAVITY * dt;
          if (velocity.vy > CONSTANTS.MAX_FALL_SPEED) {
            velocity.vy = CONSTANTS.MAX_FALL_SPEED;
          }
      }

      if (collider) {
          collider.wasOnGround = collider.onGround;
          collider.onGround = false;

          // X Axis Movement & Collision
          transform.x += velocity.vx * dt;
          if (levelManager) {
              const rect = { x: transform.x + collider.offsetX, y: transform.y + collider.offsetY, w: collider.width, h: collider.height };
              
              // Transition Check
              const nextLevel = levelManager.checkTransition(rect);
              if (nextLevel && input && context.gameStateManager.getState() === GameState.PLAYING) {
                  context.gameStateManager.setState(GameState.LEVEL_TRANSITION);
                  if (!context.transitioning) {
                      context.transitioning = true;
                      setTimeout(() => {
                          // Remove all previous enemy entities
                          const oldEnemies = world.queryEntities([Transform, Health, AI]);
                          for (const eId of oldEnemies) {
                              world.removeEntity(eId);
                          }

                          // Query player stats for dynamic scaling
                          const pHealth = world.getComponent(id, Health);
                          const playerStats = {
                              level: context.xpSystem ? context.xpSystem.level : 1,
                              atk: 10 + (context.xpSystem ? (context.xpSystem.level - 1) * 3 : 0),
                              def: 8 + (context.xpSystem ? (context.xpSystem.level - 1) * 2 : 0),
                              maxHp: pHealth ? pHealth.maxHp : 100
                          };

                          levelManager.loadLevel(nextLevel, playerStats);
                          context.camera.setLevelBounds(levelManager.width * levelManager.tileSize, levelManager.height * levelManager.tileSize);
                          levelManager.spawnLevelEntities(world);

                          transform.x = 80;
                          transform.y = 420;
                          velocity.vx = 0;
                          velocity.vy = 0;
                          context.transitioning = false;
                          context.gameStateManager.setState(GameState.PLAYING);
                      }, 500);
                  }
                  continue; // Skip further physics updates for player this frame
              }

              if (levelManager.checkCollision(rect)) {
                  // Resolve X collision
                  if (velocity.vx > 0 || (velocity.vx === 0 && transform.facing === 'right')) {
                      // hit right wall
                      transform.x = Math.floor((transform.x + collider.offsetX + collider.width) / levelManager.tileSize) * levelManager.tileSize - collider.width - collider.offsetX - 0.1;
                  } else {
                      // hit left wall
                      transform.x = Math.floor((transform.x + collider.offsetX) / levelManager.tileSize + 1) * levelManager.tileSize - collider.offsetX + 0.1;
                  }
                  velocity.vx = 0;
              }
          }

          // Y Axis Movement & Collision
          transform.y += velocity.vy * dt;
          if (levelManager) {
              const rect = { x: transform.x + collider.offsetX, y: transform.y + collider.offsetY, w: collider.width, h: collider.height };
              if (levelManager.checkCollision(rect)) {
                  // Resolve Y collision
                  if (velocity.vy > 0) {
                      // hit floor
                      transform.y = Math.floor((transform.y + collider.offsetY + collider.height) / levelManager.tileSize) * levelManager.tileSize - collider.height - collider.offsetY - 0.1;
                      collider.onGround = true;
                  } else if (velocity.vy < 0) {
                      // hit ceiling
                      transform.y = Math.floor((transform.y + collider.offsetY) / levelManager.tileSize + 1) * levelManager.tileSize - collider.offsetY + 0.1;
                  }
                  velocity.vy = 0;
              }
          }
      } else {
          // No collider, just move (ghosts, particles)
          transform.x += velocity.vx * dt;
          transform.y += velocity.vy * dt;
      }
    }
  }
}
