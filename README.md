# 🌊 Tensei Slime: Tempest Rising

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework: Pure JS / ECS](https://img.shields.io/badge/Framework-Pure%20JS%20%2F%20ECS-emerald.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Rendering: HTML5 Canvas](https://img.shields.io/badge/Rendering-HTML5%20Canvas-cyan.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

An action-packed 2D Action-Platformer / Action RPG built from scratch in vanilla JavaScript utilizing a performant **Entity-Component-System (ECS)** architecture, custom 16-bit procedural autotiling, pixel art sprites, and screen-space anime HUD systems inspired by *That Time I Got Reincarnated as a Slime*.

---

## 📖 Complete Documentation Suite

All system specifications and design documents are available in the [`docs/`](./docs) directory:

| Document | Purpose |
| :--- | :--- |
| [**`docs/GDD.md`**](./docs/GDD.md) | **Game Design Document:** Core gameplay loop, characters, enemies, props, and design vision. |
| [**`docs/ARCHITECTURE.md`**](./docs/ARCHITECTURE.md) | **Technical Architecture:** ECS structure, systems pipeline, fixed-timestep loop, and caching. |
| [**`docs/CONTROLS.md`**](./docs/CONTROLS.md) | **Controls & Combos:** Keybindings, coyote time, jump buffering, dash cancels, and combos. |
| [**`docs/COMBAT_AND_SKILLS.md`**](./docs/COMBAT_AND_SKILLS.md) | **Combat & Devour System:** Frame data, damage formulas, Predator absorption, and acquired traits. |
| [**`docs/LEVEL_DESIGN.md`**](./docs/LEVEL_DESIGN.md) | **Level Design & Autotiling:** 16-bit autotiling rules, platform metrics, reachability, and hazards. |
| [**`docs/ART_AND_ANIMATION.md`**](./docs/ART_AND_ANIMATION.md) | **Art & Animation:** Sprite pipeline, 3-layer parallax backgrounds, palettes, and skin swapping. |
| [**`docs/AUDIO_DESIGN.md`**](./docs/AUDIO_DESIGN.md) | **Audio Architecture:** Sound pools, bus mixer, BGM cues, and Great Sage chime SFX. |
| [**`docs/GREAT_SAGE_SYSTEM.md`**](./docs/GREAT_SAGE_SYSTEM.md) | **Voice of the World:** Typewriter notification pipeline, event catalog, and anime styling. |
| [**`docs/ROADMAP.md`**](./docs/ROADMAP.md) | **Roadmap & Milestones:** Phase 1 accomplishments and Phase 2 expansion plans. |
| [**`docs/skills/SKILLS_INDEX.md`**](./docs/skills/SKILLS_INDEX.md) | **GameDev Skills Library:** Complete index of 69 downloaded game development skills. |

---

## 🎮 Quick Controls

| Action | Primary Key | Secondary Key |
| :--- | :---: | :---: |
| **Move Left / Right** | `[A]` / `[D]` | `[←]` / `[→]` |
| **Jump / Double Jump** | `[Space]` | — |
| **Quick Dash** | `[Shift]` | — |
| **Light Slash (3-Hit Combo)** | `[Z]` | `[J]` |
| **Heavy Cleave (Guard Break)**| `[X]` | `[K]` |
| **Parry / Deflect** | `[C]` | `[L]` |
| **Predator (Devour) / Interact** | `[E]` | `[Enter]` |
| **Inspect Asset Library** | `[V]` | — |
| **Pause Game** | `[Escape]` | `[P]` |

---

## 🚀 Getting Started

### 1. Run with Python HTTP Server
```bash
python -m http.server 3000
```
Then open `http://localhost:3000` in your web browser.

### 2. Run with Node.js / Vite
```bash
npm install
npm run dev
```

---

## 🛠️ Engine Tech Highlights
* **Deterministic Fixed Timestep:** $60\text{Hz}$ physics loop guarantees identical gameplay across all displays.
* **16-Bit Procedural Autotiler:** Generates seamless $32\times32\text{px}$ slate and emerald moss tiles with zero visual gaps.
* **Combat Hitstop:** Frame-freezing on heavy attacks and successful parries for satisfying combat weight.
* **Non-Obtrusive Great Sage HUD:** Celestial typewriter notification modal positioned at the top-right screen space.
