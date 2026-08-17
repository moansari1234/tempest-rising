# 🏛️ Technical Architecture Specification

*Tensei Slime: Tempest Rising* is engineered using a custom, high-performance **Entity-Component-System (ECS)** written in modern ES6 JavaScript running on the HTML5 2D Canvas API.

---

## 1. Engine Core & Game Loop

```
               ┌─────────────────────────────────┐
               │    requestAnimationFrame Loop   │
               └────────────────┬────────────────┘
                                │
                  Delta-Time (dt) & Accumulator
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     Fixed Logic Updates       │               │      Variable Render Loop     │
│   (Physics, AI, Combat, Env)  │               │     (RenderSystem, UISystem)  │
└───────────────────────────────┘               └───────────────────────────────┘
```

### 1.1 Fixed Timestep Execution
* The main engine uses a fixed timestep accumulator ($\Delta t = 1/60\text{s} \approx 16.67\text{ms}$) to ensure deterministic physics, predictable collision detection, and frame-rate-independent game mechanics.
* Rendering occurs at the monitor's native refresh rate with smooth linear interpolation.

---

## 2. ECS Structure

### 2.1 World Manager (`src/ecs/World.js`)
* **Entity IDs:** Sequential integer identifiers (`0, 1, 2, ...`).
* **Component Store:** Sparse Maps indexed by Component constructor for cache-friendly $O(1)$ lookups.
* **Archetype Querying:** Fast entity filtering (`world.queryEntities([Transform, Velocity, Collider])`).

### 2.2 Core Components (`src/ecs/Components.js`)
| Component | Fields | Purpose |
| :--- | :--- | :--- |
| `Transform` | `x, y, width, height, facing` | In-world 2D position, bounding box, and direction. |
| `Velocity` | `vx, vy, maxVx, maxVy` | Linear velocity vectors in pixels/sec. |
| `Collider` | `width, height, offsetX, offsetY, onGround` | Physical terrain collision box and ground state. |
| `Sprite` | `spriteKey, currentAnimation, frameIndex, frameTimer` | Rendering key, active animation clip, and timers. |
| `PlayerInput` | `state, comboHit, dashCooldown, coyoteTimer, jumpBuffer` | Input buffering, state machine, and action locks. |
| `Health` | `hp, maxHp, alive, iFrameTimer, decayTimer` | Entity hit points, invulnerability frames, and death. |
| `CombatData` | `attackPower, defense, staggerTimer, isParrying` | Combat stats and status flags. |
| `Hurtbox` | `offsetX, offsetY, width, height` | Vulnerable hit detection area. |
| `Hitbox` | `offsetX, offsetY, width, height, damage, active` | Active offensive attack strike area. |
| `AI` | `state, patrolDirection, aggroRange, attackCooldown` | NPC state machine timers and target tracking. |
| `InteractiveProp` | `propType, promptText, interactionRadius, xpYield` | Proximity interaction triggers and rewards. |
| `Hazard` | `hazardType, damage, triggerRadius, state` | Subterranean traps and environmental hazards. |

---

## 3. Systems Pipeline

The ECS runs systems in strict deterministic order:

```
1. InputManager       (Polls keyboard/gamepad and sets PlayerInput component)
2. AISystem           (Evaluates NPC FSMs, aggro ranges, and triggers attacks/projectiles)
3. PhysicsSystem      (Integrates velocity, applies gravity, resolves tile collisions)
4. CombatSystem       (Evaluates Hitbox vs Hurtbox overlaps, parries, predator devour)
5. EnvironmentSystem  (Handles [E] prop prompts, healing, mining, and hazard triggers)
6. Camera             (Smoothly tracks active player position with deadzone clamping)
7. RenderSystem       (Draws parallax backgrounds, 16-bit autotiled caverns, and sprites)
8. UISystem           (Draws top-left RPG HUD, boss bars, Great Sage popups, and floaters)
```

---

## 4. Subsystem Breakdown

### 4.1 Sprite Parser & Caching Pipeline (`src/sprites/SpriteParser.js`)
* Dynamically parses PNG sprite sheets and character frames.
* Caches processed `ImageBitmap` instances into GPU memory for zero-allocation blitting.
* Supports **Skin Swapping** (`Skin 1: Classic Anime Slime`, `Skin 2: High-Def Demon Lord Slime`).
* Features a built-in **16-bit procedural modular tile generator** producing crisp $32\times32\text{px}$ slate and moss tiles with zero visual gaps.

### 4.2 Great Sage Queue Manager (`src/core/GreatSageSystem.js`)
* Decoupled asynchronous notification queue.
* Manages typewriter character reveal ($35\text{ms/char}$), auto-dismiss timers, and chime sound effects.

### 4.3 Level Designer & Autotiler (`src/level_gen/LevelDesigner.js` & `src/core/LevelManager.js`)
* Generates cavern platform networks with guaranteed jump reachability.
* Distributes enemies, interactive props, hazards, and warp gates.
* Applies 4-directional 16-bit autotiling (`ground_mid`, `ground_left`, `ground_right`, `plat_mid`, `wall_left`, `wall_right`, `ceiling`, `rock_core`).
