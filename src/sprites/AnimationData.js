export const AnimationData = {
  rimuru: {
    idle: { frameTime: 0.16, frames: 4, loop: true },
    walk: { frameTime: 0.12, frames: 4, loop: true },
    run: { frameTime: 0.10, frames: 4, loop: true },
    jump: { frameTime: 0.12, frames: 4, loop: false },
    attack_light: { frameTime: 0.08, frames: 4, loop: false },
    predator: { frameTime: 0.1, frames: 4, loop: true },
    hurt: { frameTime: 0.09, frames: 4, loop: false },
    death: { frameTime: 0.15, frames: 4, loop: false },
    victory: { frameTime: 0.12, frames: 4, loop: false },
    special: { frameTime: 0.1, frames: 4, loop: false },
    attack_heavy: { frameTime: 0.08, frames: 4, loop: false }
  },
  goblin: {
    idle: { frameTime: 0.25, frames: 4, loop: true },
    run: { frameTime: 0.12, frames: 4, loop: true },
    attack: { frameTime: 0.14, frames: 3, loop: false },
    hurt: { frameTime: 0.12, frames: 2, loop: false },
    death: { frameTime: 0.18, frames: 4, loop: false }
  },
  serpent: {
    idle: { frameTime: 0.25, frames: 4, loop: true },
    run: { frameTime: 0.14, frames: 4, loop: true },
    attack: { frameTime: 0.22, frames: 3, loop: false },
    hurt: { frameTime: 0.15, frames: 2, loop: false },
    death: { frameTime: 0.20, frames: 4, loop: false }
  }
};
