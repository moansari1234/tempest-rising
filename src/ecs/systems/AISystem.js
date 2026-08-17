import { Transform, Velocity, AI, Collider, Hitbox, PlayerInput, Health, Sprite } from '../Components.js';
import { CONSTANTS } from '../../data/constants.js';

export class AISystem {
  update(world, dt, context) {
    const enemies = world.queryEntities([Transform, Velocity, AI, Collider, Health]);
    const players = world.queryEntities([Transform, PlayerInput, Health]);
    
    // For simplicity, grab the first player as the target
    let playerTransform = null;
    let playerId = null;
    let playerHealth = null;
    if (players.length > 0) {
      playerId = players[0];
      playerTransform = world.getComponent(playerId, Transform);
      playerHealth = world.getComponent(playerId, Health);
    }

    for (const id of enemies) {
      const transform = world.getComponent(id, Transform);
      const velocity = world.getComponent(id, Velocity);
      const ai = world.getComponent(id, AI);
      const collider = world.getComponent(id, Collider);
      const health = world.getComponent(id, Health);

      if (!health.alive) continue;

      // Handle hit stun (if we took damage and got i-frames, interrupt attack)
      if (health.iFrameTimer > 0 && ai.state === 'attack') {
          ai.state = 'hurt';
          ai.stateTimer = 0.5; // Stun duration
      }

      if (ai.state === 'hurt') {
          ai.stateTimer -= dt;
          if (ai.stateTimer <= 0) {
              ai.state = 'idle';
          }
          continue; // Cannot act while hurt
      }

      // Basic Goblin AI Logic
      if (ai.type === 'goblin') {
        const GOBLIN_SPEED = 60;
        const CHASE_SPEED = 100;
        const AGGRO_RANGE = 200;
        const ATTACK_RANGE = 40;

        let distToPlayer = Infinity;
        if (playerTransform && playerHealth.alive) {
          distToPlayer = Math.abs(transform.x - playerTransform.x);
        }

        // State Transitions
        if (ai.state === 'idle') {
            ai.stateTimer -= dt;
            velocity.vx = 0;
            if (ai.stateTimer <= 0) {
                ai.state = 'patrol';
                ai.stateTimer = 2.0 + Math.random() * 2; // patrol for 2-4 seconds
                transform.facing = Math.random() > 0.5 ? 'right' : 'left';
            }
            if (distToPlayer < AGGRO_RANGE) ai.state = 'chase';

        } else if (ai.state === 'patrol') {
            ai.stateTimer -= dt;
            velocity.vx = transform.facing === 'right' ? GOBLIN_SPEED : -GOBLIN_SPEED;
            
            // Ledge detection (simple implementation: if we hit a wall, turn around)
            if (velocity.vx === 0 && !collider.wasOnGround) {
                // We're stuck against a wall, turn around
                transform.facing = transform.facing === 'right' ? 'left' : 'right';
            }

            if (ai.stateTimer <= 0) {
                ai.state = 'idle';
                ai.stateTimer = 1.0 + Math.random(); // rest
            }
            if (distToPlayer < AGGRO_RANGE) ai.state = 'chase';

        } else if (ai.state === 'chase') {
            if (!playerTransform || !playerHealth.alive || distToPlayer > AGGRO_RANGE * 1.5) {
                ai.state = 'idle';
                ai.stateTimer = 1.0;
            } else if (distToPlayer < ATTACK_RANGE) {
                ai.state = 'attack';
                ai.stateTimer = 0.6; // Windup
                velocity.vx = 0;
            } else {
                // Move towards player
                if (playerTransform.x > transform.x) {
                    velocity.vx = CHASE_SPEED;
                    transform.facing = 'right';
                } else {
                    velocity.vx = -CHASE_SPEED;
                    transform.facing = 'left';
                }
            }

        } else if (ai.state === 'attack') {
            ai.stateTimer -= dt;
            velocity.vx = 0; // Rooted during attack
            
            // Attack strikes at exactly 0 (or close to it)
            if (ai.stateTimer <= 0 && ai.stateTimer > -1) {
                // Spawn hitbox
                const hitboxId = world.createEntity();
                const hbX = transform.facing === 'right' ? transform.x + transform.width : transform.x - 32;
                world.addComponent(hitboxId, new Transform(hbX, transform.y, 32, transform.height));
                world.addComponent(hitboxId, new Hitbox(
                    id, // owner
                    5, // damage
                    150, // knockback
                    0.1, // lifetime
                    CONSTANTS.HITSTOP_LIGHT, // hitstopMs
                    'neutral'
                ));
                
                // End attack state by setting timer to -1 to prevent re-striking, transition to idle
                ai.stateTimer = -2; 
                ai.state = 'idle';
                // Wait for a bit before doing anything else
                ai.stateTimer = 1.0; 
            }
        }
      }

      // Goblin Archer / Sharpshooter AI
      if (ai.type === 'goblin_archer') {
          const RETREAT_SPEED = 100;
          const MAX_RANGE = 520;
          const MIN_RANGE = 100;

          let distToPlayer = Infinity;
          if (playerTransform && playerHealth.alive) {
              distToPlayer = Math.abs(transform.x - playerTransform.x);
          }

          if (ai.state === 'idle') {
              ai.stateTimer -= dt;
              velocity.vx = 0;
              if (distToPlayer < MAX_RANGE) {
                  ai.state = 'aim';
                  ai.stateTimer = 0.35;
                  if (playerTransform) transform.facing = playerTransform.x > transform.x ? 'right' : 'left';
              }
          } else if (ai.state === 'retreat') {
              ai.stateTimer -= dt;
              if (playerTransform) {
                  velocity.vx = playerTransform.x > transform.x ? -RETREAT_SPEED : RETREAT_SPEED;
                  transform.facing = playerTransform.x > transform.x ? 'right' : 'left';
              }
              if (ai.stateTimer <= 0 || distToPlayer > MIN_RANGE + 50) {
                  ai.state = 'aim';
                  ai.stateTimer = 0.4;
                  velocity.vx = 0;
              }
          } else if (ai.state === 'aim') {
              ai.stateTimer -= dt;
              velocity.vx = 0;
              if (playerTransform) transform.facing = playerTransform.x > transform.x ? 'right' : 'left';
              
              // If player rushed in too close, retreat
              if (distToPlayer < MIN_RANGE) {
                  ai.state = 'retreat';
                  ai.stateTimer = 0.7;
              } else if (ai.stateTimer <= 0) {
                  ai.state = 'attack';
                  ai.stateTimer = 0.6; // Draw bow and loose poison arrow
                  ai.hasFired = false;
              }
          } else if (ai.state === 'attack') {
              ai.stateTimer -= dt;
              velocity.vx = 0;

              // Fire arrow at 0.3s of 0.6s animation (draw -> release)
              if (ai.stateTimer <= 0.3 && !ai.hasFired) {
                  ai.hasFired = true;
                  const arrowId = world.createEntity();
                  const dir = transform.facing === 'right' ? 1 : -1;
                  const arrX = dir === 1 ? transform.x + transform.width : transform.x - 28;
                  world.addComponent(arrowId, new Transform(arrX, transform.y + 16, 28, 8));
                  world.addComponent(arrowId, new Velocity(dir * 380, 0));
                  world.addComponent(arrowId, new Hitbox(id, 12, 140, 2.5, CONSTANTS.HITSTOP_LIGHT, 'poison'));
                  
                  if (context.audio) context.audio.play('attack_light');
              }
              if (ai.stateTimer <= 0) {
                  ai.hasFired = false;
                  ai.state = 'idle';
                  ai.stateTimer = 1.0; // Cool-off between shots
              }
          }
      }

      // Boss: Tempest Serpent AI Logic
      if (ai.type === 'boss_serpent') {
          const BOSS_SPEED = 80;
          const AGGRO_RANGE = 400; // Sees the player from far
          const LUNGE_RANGE = 100;
          const SPIT_RANGE = 250;

          let distToPlayer = Infinity;
          if (playerTransform && playerHealth.alive) {
            distToPlayer = Math.abs(transform.x - playerTransform.x);
          }

          // State Transitions
          if (ai.state === 'idle') {
              ai.stateTimer -= dt;
              velocity.vx = 0;
              if (ai.stateTimer <= 0) {
                  ai.state = 'chase';
              }
          } else if (ai.state === 'chase') {
              if (!playerTransform || !playerHealth.alive) {
                  ai.state = 'idle';
                  ai.stateTimer = 1.0;
              } else {
                  // Move towards player
                  if (playerTransform.x > transform.x) {
                      velocity.vx = BOSS_SPEED;
                      transform.facing = 'right';
                  } else {
                      velocity.vx = -BOSS_SPEED;
                      transform.facing = 'left';
                  }

                  // Pick attack based on distance
                  if (distToPlayer < LUNGE_RANGE) {
                      ai.state = 'attack_lunge'; // Custom attack state name
                      ai.stateTimer = 1.0; // Long windup for lunge
                      velocity.vx = 0;
                  } else if (distToPlayer < SPIT_RANGE && Math.random() < 0.01) { // 1% chance per frame while in range
                      ai.state = 'attack_spit';
                      ai.stateTimer = 0.5;
                      velocity.vx = 0;
                  }
              }
          } else if (ai.state === 'attack_lunge') {
              ai.stateTimer -= dt;
              velocity.vx = 0;
              
              if (ai.stateTimer <= 0 && ai.stateTimer > -1) {
                  // Lunge strike! (huge damage, huge hitbox)
                  const hitboxId = world.createEntity();
                  const hbX = transform.facing === 'right' ? transform.x + transform.width : transform.x - 64;
                  world.addComponent(hitboxId, new Transform(hbX, transform.y + 32, 64, 64)); // Big hitbox
                  world.addComponent(hitboxId, new Hitbox(
                      id, // owner
                      25, // damage
                      400, // knockback
                      0.2, // lifetime
                      CONSTANTS.HITSTOP_HEAVY, // hitstopMs
                      'neutral'
                  ));
                  
                  ai.stateTimer = -2; 
                  ai.state = 'idle';
                  ai.stateTimer = 1.5; // Long recovery
              }
          } else if (ai.state === 'attack_spit') {
              ai.stateTimer -= dt;
              velocity.vx = 0;
              
              if (ai.stateTimer <= 0 && ai.stateTimer > -1) {
                  // Spit poison! (creates a persistent lingering hitbox or a moving projectile)
                  // For simplicity, we'll create a projectile Entity
                  const projId = world.createEntity();
                  const pX = transform.facing === 'right' ? transform.x + transform.width : transform.x - 32;
                  world.addComponent(projId, new Transform(pX, transform.y + 48, 32, 32));
                  world.addComponent(projId, new Hitbox(
                      id,
                      15,
                      100,
                      2.0, // Lives for 2 seconds
                      CONSTANTS.HITSTOP_LIGHT,
                      'poison',
                      { parryable: true }
                  ));
                  world.addComponent(projId, new Velocity((transform.facing === 'right' ? 250 : -250), -150));
                  
                  // Need to make it draw as something (maybe a small green square or a sprite)
                  world.addComponent(projId, new Sprite('goblin')); // reuse goblin sprite as generic blob for now!
                  
                  ai.stateTimer = -2; 
                  ai.state = 'idle';
                  ai.stateTimer = 2.0; // recovery
              }
          }
      }
    }
  }
}
