export const AnimationData = {
  rimuru: {
    idle: { frameTime: 1.20, frames: 4, loop: true }, // Ultra-smooth tranquil gelatinous breathing cycle (4.8s)
    walk: { frameTime: 0.14, frames: 4, loop: true },
    run: { frameTime: 0.09, frames: 4, loop: true },
    jump: { frameTime: 0.12, frames: 4, loop: false },
    attack_light: { frameTime: 0.07, frames: 4, loop: false },
    attack_heavy: { frameTime: 0.09, frames: 4, loop: false },
    predator: { frameTime: 0.10, frames: 4, loop: true },
    hurt: { frameTime: 0.12, frames: 2, loop: false },
    death: { frameTime: 0.16, frames: 4, loop: false },
    victory: { frameTime: 0.14, frames: 4, loop: true },
    special: { frameTime: 0.15, frames: 2, loop: true },
    water_blade: { frameTime: 0.08, frames: 4, loop: false },
    barrier: { frameTime: 0.12, frames: 4, loop: true },
    black_flame: { frameTime: 0.10, frames: 4, loop: false },
    megiddo: { frameTime: 0.12, frames: 4, loop: false }
  },
  water_blade_proj: {
    idle: { frameTime: 0.06, frames: 4, loop: true }
  },
  black_flame_vfx: {
    idle: { frameTime: 0.08, frames: 4, loop: false }
  },
  barrier_vfx: {
    idle: { frameTime: 0.10, frames: 4, loop: true }
  },
  megiddo_beam_vfx: {
    idle: { frameTime: 0.10, frames: 4, loop: false }
  },
  goblin: {
    idle: { frameTime: 0.50, frames: 4, loop: true },
    run: { frameTime: 0.12, frames: 4, loop: true },
    attack: { frameTime: 0.14, frames: 4, loop: false },
    hurt: { frameTime: 0.12, frames: 2, loop: false },
    death: { frameTime: 0.28, frames: 4, loop: false }
  },
  serpent: {
    idle: { frameTime: 0.60, frames: 4, loop: true },
    run: { frameTime: 0.14, frames: 4, loop: true },
    attack: { frameTime: 0.16, frames: 4, loop: false },
    hurt: { frameTime: 0.15, frames: 2, loop: false },
    death: { frameTime: 0.35, frames: 4, loop: false }
  },
  goblin_archer: {
    idle: { frameTime: 0.50, frames: 4, loop: true },
    run: { frameTime: 0.12, frames: 4, loop: true },
    attack: { frameTime: 0.15, frames: 4, loop: false },
    hurt: { frameTime: 0.12, frames: 2, loop: false },
    death: { frameTime: 0.28, frames: 4, loop: false }
  },
  magisteel: {
    idle: { frameTime: 0.22, frames: 4, loop: true },
    break: { frameTime: 0.14, frames: 4, loop: false }
  },
  hipokute: {
    idle: { frameTime: 0.22, frames: 4, loop: true },
    bloom: { frameTime: 0.22, frames: 4, loop: true }
  },
  monolith: {
    idle: { frameTime: 0.22, frames: 4, loop: true },
    activate: { frameTime: 0.22, frames: 4, loop: true }
  },
  portal: {
    idle: { frameTime: 0.14, frames: 4, loop: true },
    activate: { frameTime: 0.18, frames: 4, loop: false }
  },
  chest: {
    idle: { frameTime: 0.20, frames: 1, loop: true },
    open: { frameTime: 0.18, frames: 4, loop: false }
  },
  urn: {
    idle: { frameTime: 0.20, frames: 1, loop: true },
    break: { frameTime: 0.12, frames: 4, loop: false }
  },
  torch: {
    idle: { frameTime: 0.15, frames: 4, loop: true },
    burn: { frameTime: 0.15, frames: 4, loop: true }
  },
  campfire: {
    idle: { frameTime: 0.16, frames: 4, loop: true },
    burn: { frameTime: 0.16, frames: 4, loop: true }
  },
  spikes: {
    idle: { frameTime: 0.20, frames: 1, loop: true },
    trigger: { frameTime: 0.16, frames: 4, loop: true }
  },
  stalactite: {
    idle: { frameTime: 0.20, frames: 1, loop: true },
    drop: { frameTime: 0.18, frames: 4, loop: false }
  },
  spore_shroom: {
    idle: { frameTime: 0.20, frames: 1, loop: true },
    spore: { frameTime: 0.16, frames: 4, loop: true },
    trigger: { frameTime: 0.16, frames: 4, loop: true }
  },
  acid_vent: {
    idle: { frameTime: 0.16, frames: 4, loop: true },
    bubble: { frameTime: 0.16, frames: 4, loop: true },
    trigger: { frameTime: 0.16, frames: 4, loop: true }
  },
  tiles: {
    ground_mid: { frameTime: 1.0, frames: 1, loop: true },
    ground_left: { frameTime: 1.0, frames: 1, loop: true },
    ground_right: { frameTime: 1.0, frames: 1, loop: true },
    plat_mid: { frameTime: 1.0, frames: 1, loop: true },
    plat_left: { frameTime: 1.0, frames: 1, loop: true },
    plat_right: { frameTime: 1.0, frames: 1, loop: true },
    bridge: { frameTime: 1.0, frames: 1, loop: true },
    wall_left: { frameTime: 1.0, frames: 1, loop: true },
    wall_right: { frameTime: 1.0, frames: 1, loop: true },
    ceiling: { frameTime: 1.0, frames: 1, loop: true },
    underhang: { frameTime: 1.0, frames: 1, loop: true },
    slope_up: { frameTime: 1.0, frames: 1, loop: true },
    slope_down: { frameTime: 1.0, frames: 1, loop: true },
    pillar_top: { frameTime: 1.0, frames: 1, loop: true },
    pillar_base: { frameTime: 1.0, frames: 1, loop: true }
  }
};
