// Data-only classes for ECS

export class Transform {
  constructor(x = 0, y = 0, width = 32, height = 32, facing = 'right') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.facing = facing;
  }
}

export class Velocity {
  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }
}

export class Sprite {
  constructor(spriteKey = 'rimuru') {
    this.spriteKey = spriteKey;
    this.currentAnimation = 'idle';
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.flipX = false;
  }
}

export class Collider {
  constructor(type = 'aabb', solid = true, offsetX = 0, offsetY = 0, width = 32, height = 32) {
    this.type = type;
    this.solid = solid;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.width = width;
    this.height = height;
    
    // State flags for physics system
    this.onGround = false;
    this.wasOnGround = false;
    this.isTouchingWall = false;
  }
}

export class Health {
  constructor(hp = 100, maxHp = 100, mp = 50, maxMp = 50) {
    this.hp = hp;
    this.maxHp = maxHp;
    this.mp = mp;
    this.maxMp = maxMp;
    this.iFrameTimer = 0;
    this.alive = true;
  }
}

export class PlayerInput {
  constructor() {
    this.isPlayer = true;
    this.state = 'idle'; // idle, run, jump, fall, dash, attack_light, attack_heavy, parry
    this.stateTimer = 0;
    
    // Jump capabilities
    this.canDoubleJump = true;
    this.coyoteTimer = 0;

    // Dash capabilities
    this.dashCooldown = 0;
    
    // Combat state
    this.comboHit = 0;
    this.chargeLevel = 0;
    
    // Hitstop
    this.hitstopTimer = 0; // global hitstop applies to everything, but we can store it on World context instead. Let's keep it here if we want player-specific hitstop, but typically hitstop freezes the whole world.
  }
}

export class CombatData {
  constructor(atk = 10, def = 8, contactDamage = 0, absorbable = false, xpValue = 0) {
    this.atk = atk;
    this.def = def;
    this.contactDamage = contactDamage;
    this.absorbable = absorbable;
    this.xpValue = xpValue;
    
    // Knockback resistance
    this.mass = 1.0; 
  }
}

export class Hitbox {
  constructor(ownerId, damage, knockback, lifetime, hitstopMs, element = 'neutral', properties = {}) {
    this.ownerId = ownerId;
    this.damage = damage;
    this.knockback = knockback;
    this.lifetime = lifetime;
    this.hitstopMs = hitstopMs;
    this.element = element;
    this.properties = properties; // e.g. { launcher: true, parryable: true }
    this.hasHit = new Set(); // store entity IDs we've already hit
  }
}

export class Hurtbox {
  constructor(offsetX = 0, offsetY = 0, width = 32, height = 32) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.width = width;
    this.height = height;
  }
}

export class AI {
  constructor(type = 'goblin') {
    this.type = type;
    this.state = 'idle'; // idle, patrol, chase, attack, hurt
    this.stateTimer = 0;
    this.targetId = null;
    this.patrolOrigin = 0;
    this.patrolRange = 100;
  }
}

export class InteractiveProp {
  constructor(type = 'chest', prompt = '[E] INTERACT', range = 48, xpValue = 30, hpValue = 0) {
    this.type = type; // 'magisteel', 'hipokute', 'chest', 'urn', 'monolith', 'torch', 'campfire', 'portal'
    this.prompt = prompt;
    this.range = range;
    this.xpValue = xpValue;
    this.hpValue = hpValue;
    this.used = false;
    this.state = 'idle'; // idle, open, break, bloom, activate, burn
    this.animTimer = 0;
  }
}

export class Hazard {
  constructor(type = 'spikes', damage = 15, triggerRange = 40) {
    this.type = type; // 'spikes', 'stalactite', 'spore_shroom', 'acid_vent'
    this.damage = damage;
    this.triggerRange = triggerRange;
    this.triggered = false;
    this.timer = 0;
    this.cooldown = 0;
  }
}

