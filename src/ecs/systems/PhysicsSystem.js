import { Transform, Velocity, PlayerInput, Collider, Hitbox, Health } from '../Components.js';
import { CONSTANTS } from '../../data/constants.js';

export class PhysicsSystem {
  update(world, dt, context) {
    const { inputManager } = context;

    const players = world.queryEntities([Transform, Velocity, PlayerInput, Collider]);
    for (const id of players) {
      const transform = world.getComponent(id, Transform);
      const velocity = world.getComponent(id, Velocity);
      const input = world.getComponent(id, PlayerInput);
      const collider = world.getComponent(id, Collider);

      // Timers
      if (input.dashCooldown > 0) input.dashCooldown -= dt;
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
          velocity.vx = 0; // Root motion during attack (can be adjusted)
          if (input.stateTimer <= 0) {
              input.state = 'idle';
          }
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
              // Dead! No inputs allowed
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
              }
              // Parry
              else if (inputManager.isActionJustPressed('parry')) {
                  input.state = 'parry';
                  input.stateTimer = CONSTANTS.PARRY_WINDOW;
                  inputManager.consumeAction('parry');
              }
              // Predator Skill
              else if (inputManager.isActionHeld('skillPredator')) {
                  input.state = 'predator';
              }
              // Attack
              else if (inputManager.isActionJustPressed('attackLight')) {
                  input.state = 'attack_light';
                  input.stateTimer = CONSTANTS.LIGHT_COMBO_TIMING ? CONSTANTS.LIGHT_COMBO_TIMING[0] : 0.3;
                  input.comboHit = 1;
                  inputManager.consumeAction('attackLight');

                  // Spawn Hitbox
                  const hitboxId = world.createEntity();
                  const hbX = transform.facing === 'right' ? transform.x + transform.width : transform.x - 32;
                  world.addComponent(hitboxId, new Transform(hbX, transform.y, 32, transform.height));
                  world.addComponent(hitboxId, new Hitbox(
                      id, // owner
                      10, // damage
                      200, // knockback
                      0.1, // lifetime
                      CONSTANTS.HITSTOP_LIGHT, // hitstopMs
                      'neutral'
                  ));
              }
          }

          // Jump
          if (inputManager.isActionJustPressed('jump')) {
              if (input.coyoteTimer > 0) {
                  velocity.vy = CONSTANTS.JUMP_FORCE;
                  input.coyoteTimer = 0;
                  inputManager.consumeAction('jump');
              } else if (input.canDoubleJump) {
                  velocity.vy = CONSTANTS.DOUBLE_JUMP_FORCE;
                  input.canDoubleJump = false;
                  inputManager.consumeAction('jump');
              }
          }

          // Update generic states only if we are in a normal movement state
          if (['idle', 'run', 'jump', 'fall'].includes(input.state)) {
              if (!collider.onGround) {
                  input.state = velocity.vy < 0 ? 'jump' : 'fall';
              } else if (Math.abs(velocity.vx) > 0) {
                  input.state = 'run';
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
              if (levelManager.checkCollision(rect)) {
                  // Resolve X collision
                  if (velocity.vx > 0) {
                      // hit right wall
                      transform.x = Math.floor((transform.x + collider.offsetX + collider.width) / levelManager.tileSize) * levelManager.tileSize - collider.width - collider.offsetX - 0.1;
                  } else if (velocity.vx < 0) {
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
