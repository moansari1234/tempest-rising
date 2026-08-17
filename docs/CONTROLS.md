# 🎮 Player Controls & Mechanics Guide

## 1. Input Bindings

### Keyboard Controls
| Action | Primary Key | Secondary Key | Description |
| :--- | :---: | :---: | :--- |
| **Move Left** | `[A]` | `[←]` | Runs left across platforms |
| **Move Right** | `[D]` | `[→]` | Runs right across platforms |
| **Look Up** | `[W]` | `[↑]` | Adjusts camera view upward |
| **Crouch / Drop** | `[S]` | `[↓]` | Crouches; press with Jump to drop through one-way ledges |
| **Jump** | `[Space]` | — | Jump with variable height; double jump available in air |
| **Quick Dash** | `[Shift]` | — | Swift invulnerable dash in facing direction ($200\text{ms}$) |
| **Light Attack** | `[Z]` | `[J]` | 3-hit rapid water slash combo |
| **Heavy Attack** | `[X]` | `[K]` | High-impact energy slash (breaks enemy guard) |
| **Parry / Deflect** | `[C]` | `[L]` | Reflects poison arrows & staggers melee attackers |
| **Predator / Interact** | `[E]` | `[Enter]` | Devours weakened monsters & interacts with props |
| **Asset Library** | `[V]` | — | Inspects all character & environmental sprites |
| **Pause Game** | `[Escape]` | `[P]` | Opens pause menu |

---

## 2. Advanced Movement Tech

### 2.1 Coyote Time ($80\text{ms}$)
* If you run off the edge of a platform, you still have an $80\text{ms}$ grace period to trigger a ground jump without burning your double jump.

### 2.2 Jump Buffering ($100\text{ms}$)
* Pressing `[Space]` up to $100\text{ms}$ before landing will automatically execute the jump the exact frame your collider contacts the ground.

### 2.3 Dash-Cancel & Evasion
* Light attacks can be cancelled immediately into `[Shift]` Dash to reposition behind an attacking enemy or escape poison traps.

---

## 3. Combat Combos & Synergy

```
[Z] Light 1 ──> [Z] Light 2 ──> [Z] Light 3 (Quick 3-Hit Water Blade)
      │               │
      └──> [X] Heavy ─┴──> [E] Predator (Devour Weakened Target)
```

1. **Light-to-Heavy Finisher (`[Z] -> [Z] -> [X]`):**
   * Delivers two swift slashes followed by a ground-slam cleave that knocks small goblins into the air.
2. **Parry Counter (`[C] -> [X]`):**
   * Time `[C]` right before a Goblin's dagger or an Archer's arrow lands. The parry inflicts a $1.2\text{s}$ stagger, granting guaranteed critical damage on your follow-up heavy attack.
3. **Predator Devour Execution (`Enemy HP < 35% -> [E]`):**
   * Pulls the enemy into Rimuru's vortex, instantly defeating them, granting $+200\%$ bonus XP, and restoring HP/MP.
