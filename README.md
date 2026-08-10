# Tensei Slime: Tempest Rising

An action-packed 2D platformer game built from scratch using a custom Entity-Component-System (ECS) architecture in pure JavaScript, powered by Vite. Experience smooth platforming, combat mechanics (including hitstops, parries, and dashes), and epic boss fights (like the Tempest Serpent!).

---

## 🎮 Game Controls

| Action | Controls |
| :--- | :--- |
| **Move Left** | `A` or `←` (Arrow Left) |
| **Move Right** | `D` or `→` (Arrow Right) |
| **Move Up / Climb** | `W` or `↑` (Arrow Up) |
| **Move Down** | `S` or `↓` (Arrow Down) |
| **Jump** | `Spacebar` |
| **Dash** | `Shift` |
| **Light Attack** | `Z` |
| **Heavy Attack** | `X` |
| **Parry** | `C` |
| **Absorb / Predator / Interact** | `E` or `Enter` |
| **Skills (1 - 4)** | `1`, `2`, `3`, `4` |
| **Pause** | `Escape` or `P` |

---

## 🚀 Getting Started

Follow these steps to run the game locally:

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 2. Run the Development Server
Launch the Vite development server locally:
```bash
npm run dev
```
Open the URL shown in your terminal (usually `http://localhost:5173`) in your web browser.

### 3. Build for Production
To bundle and optimize the project for production deployment:
```bash
npm run build
```

### 4. Preview the Production Build
Test the compiled production bundle locally before deploying:
```bash
npm run preview
```

---

## 🛠️ Architecture & Features

This project utilizes a customized **ECS (Entity-Component-System)** architecture designed specifically for performant 2D game loops.

- **Entity-Component-System (ECS)**:
  - **`World.js`**: Manages all entities, component registries, and registers game systems.
  - **`Components.js`**: Lightweight, decoupled data containers (e.g., `Transform`, `Physics`, `Combat`, `Input`, `Render`).
  - **`Systems`**: Modular logic controllers that update entities containing matching components:
    - `PhysicsSystem.js`: Handles gravity, velocity, acceleration, and tile collisions.
    - `AISystem.js`: Governs enemy behaviors and pathfinding.
    - `CombatSystem.js`: Detects hitboxes, manages HP, triggers parries, and handles state changes.
    - `RenderSystem.js`: Renders sprites, animations, and levels onto the Canvas.

- **Key Game Mechanics**:
  - **Fixed Timestep Loop**: Implements accumulator-based fixed timestep updates to ensure physics run identically across all hardware frame rates.
  - **Combat Hitstop**: Temporarily freezes the game logic upon impact to deliver a satisfying, weightier sensation to attacks.
  - **Level & Camera Managers**: Smoothly locks and scrolls the camera boundaries tracking the active entity (player) inside chapter maps.
  - **Sprite Parser**: Custom JSON-driven sprite animator map parsing animation loops dynamically.
