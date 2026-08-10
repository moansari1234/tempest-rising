export const CONSTANTS = {
  // === DISPLAY ===
  NATIVE_WIDTH: 960,
  NATIVE_HEIGHT: 540,
  DISPLAY_SCALE: 2,        // Output size is 1920x1080
  TILE_SIZE: 16,

  // === PHYSICS ===
  GRAVITY: 980,             // px/s^2
  MAX_FALL_SPEED: 600,      // px/s
  FRICTION: 0.85,           // ground deceleration

  // === PLAYER MOVEMENT (Tight & Responsive) ===
  PLAYER_SPEED: 200,        // px/s
  JUMP_FORCE: -400,         // px/s
  DOUBLE_JUMP_FORCE: -350,  
  DASH_SPEED: 500,          // px/s
  DASH_DURATION: 0.2,       // seconds
  DASH_COOLDOWN: 0.8,       // seconds
  DASH_I_FRAMES: 0.2,       // seconds
  COYOTE_TIME: 0.1,         // seconds
  INPUT_BUFFER: 0.15,       // seconds

  // === COMBAT ===
  HITSTOP_LIGHT: 30,        // ms
  HITSTOP_HEAVY: 80,        // ms
  HITSTOP_CRITICAL: 120,    // ms
  SCREEN_SHAKE_LIGHT: { amp: 2, duration: 0.1 },
  SCREEN_SHAKE_HEAVY: { amp: 6, duration: 0.2 },
  SCREEN_SHAKE_BOSS: { amp: 12, duration: 0.4 },
  PARRY_WINDOW: 0.2,        // seconds
  PARRY_COUNTER_MULT: 3.0,
  PARRY_FAIL_BLOCK: 0.5,
  CONTACT_DAMAGE_MULT: 0.5,
  CONTACT_KNOCKBACK: 150,   // px/s
  HIT_I_FRAMES: 0.5,        // seconds

  // === COMBOS ===
  LIGHT_COMBO_TIMING: [0.25, 0.25, 0.35],
  HEAVY_CHARGE_TIERS: [0, 1.0, 2.0],
  LIGHT_DAMAGE_MULT: [1.0, 1.0, 1.5],
  HEAVY_DAMAGE_MULT: [2.0, 3.5, 5.0],
  COMBO_XP_WINDOW: 3.0,
  COMBO_XP_MULTS: [1.0, 1.2, 1.5, 2.0],

  // === CAMERA ===
  CAMERA_LEAD: 40,
  CAMERA_DEADZONE_X: 20,
  CAMERA_DEADZONE_Y: 30,
  CAMERA_LERP: 0.08,
  CAMERA_BOSS_ZOOM: 0.85,

  // === PREDATOR (AoE VACUUM) ===
  PREDATOR_RANGE: 120,
  PREDATOR_PULL_SPEED: 300,
  PREDATOR_HOLD_TIME: 0.5,
  ABSORB_WINDOW: 3.0,

  // === PROGRESSION ===
  XP_BASE: 50,
  XP_SCALE: 1.15,
  SP_PER_LEVEL: 2,
  SP_PER_BOSS: 5,
  SP_PER_ABSORB: 1,

  // === PLAYER BASE STATS ===
  BASE_HP: 100,
  BASE_MP: 50,
  BASE_ATK: 10,
  BASE_DEF: 8,
  HP_PER_LEVEL: 15,
  MP_PER_LEVEL: 10,
  ATK_PER_LEVEL: 3,
  DEF_PER_LEVEL: 2
};
