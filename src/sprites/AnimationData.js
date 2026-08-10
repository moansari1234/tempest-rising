export const AnimationData = {
  rimuru: {
    idle: { frameTime: 0.15, frames: 6, loop: true },
    walk: { frameTime: 0.12, frames: 6, loop: true },
    run: { frameTime: 0.1, frames: 6, loop: true },
    jump: { frameTime: 0.12, frames: 6, loop: false },
    attack_light: { frameTime: 0.08, frames: 6, loop: false },
    predator: { frameTime: 0.1, frames: 6, loop: true },
    hurt: { frameTime: 0.1, frames: 4, loop: false },
    death: { frameTime: 0.15, frames: 6, loop: false },
    victory: { frameTime: 0.12, frames: 6, loop: false },
    special: { frameTime: 0.1, frames: 8, loop: false }
  },
  goblin: {
    idle: { frameTime: 0.6, frames: 2, loop: true },
    run: { frameTime: 0.15, frames: 1, loop: true },
    attack: { frameTime: 0.2, frames: 1, loop: false },
    hurt: { frameTime: 0.1, frames: 1, loop: false }
  },
  serpent: {
      idle: { frames: 1, frameTime: 1.0, loop: true },
      run: { frames: 1, frameTime: 1.0, loop: true },
      attack: { frames: 1, frameTime: 0.5, loop: false },
      hurt: { frames: 1, frameTime: 0.1, loop: false }
  }
};
