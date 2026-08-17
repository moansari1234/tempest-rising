export const AnimationData = {
  rimuru: {
    idle: { frameTime: 0.18, frames: 4, loop: true },
    walk: { frameTime: 0.14, frames: 4, loop: true },
    run: { frameTime: 0.09, frames: 4, loop: true },
    jump: { frameTime: 0.12, frames: 4, loop: false },
    attack_light: { frameTime: 0.07, frames: 4, loop: false },
    attack_heavy: { frameTime: 0.09, frames: 4, loop: false },
    predator: { frameTime: 0.10, frames: 4, loop: true },
    hurt: { frameTime: 0.12, frames: 2, loop: false },
    death: { frameTime: 0.16, frames: 4, loop: false },
    victory: { frameTime: 0.14, frames: 4, loop: true },
    special: { frameTime: 0.15, frames: 2, loop: true }
  },
  goblin: {
    idle: { frameTime: 0.25, frames: 4, loop: true },
    run: { frameTime: 0.12, frames: 4, loop: true },
    attack: { frameTime: 0.14, frames: 4, loop: false },
    hurt: { frameTime: 0.12, frames: 2, loop: false },
    death: { frameTime: 0.18, frames: 4, loop: false }
  },
  serpent: {
    idle: { frameTime: 0.22, frames: 4, loop: true },
    run: { frameTime: 0.14, frames: 4, loop: true },
    attack: { frameTime: 0.16, frames: 4, loop: false },
    hurt: { frameTime: 0.15, frames: 2, loop: false },
    death: { frameTime: 0.20, frames: 4, loop: false }
  },
  goblin_archer: {
    idle: { frameTime: 0.22, frames: 4, loop: true },
    run: { frameTime: 0.12, frames: 4, loop: true },
    attack: { frameTime: 0.15, frames: 4, loop: false },
    hurt: { frameTime: 0.12, frames: 2, loop: false },
    death: { frameTime: 0.18, frames: 4, loop: false }
  },
  magisteel: {
    idle: { frameTime: 0.22, frames: 4, loop: true },
    break: { frameTime: 0.14, frames: 4, loop: false }
  },
  hipokute: {
    bloom: { frameTime: 0.22, frames: 4, loop: true }
  },
  monolith: {
    activate: { frameTime: 0.22, frames: 4, loop: true }
  },
  portal: {
    idle: { frameTime: 0.14, frames: 4, loop: true },
    activate: { frameTime: 0.18, frames: 4, loop: false }
  },
  chest: {
    open: { frameTime: 0.18, frames: 4, loop: false }
  },
  urn: {
    break: { frameTime: 0.12, frames: 4, loop: false }
  },
  torch: {
    burn: { frameTime: 0.15, frames: 4, loop: true }
  },
  campfire: {
    burn: { frameTime: 0.16, frames: 4, loop: true }
  },
  spikes: {
    trigger: { frameTime: 0.16, frames: 4, loop: true }
  },
  stalactite: {
    drop: { frameTime: 0.18, frames: 4, loop: false }
  },
  spore_shroom: {
    spore: { frameTime: 0.16, frames: 4, loop: true }
  },
  acid_vent: {
    bubble: { frameTime: 0.16, frames: 4, loop: true }
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
