# 📜 Game Design Document: Tensei Slime - Tempest Rising

## 1. Executive Summary
* **Title:** *Tensei Slime: Tempest Rising*
* **Genre:** 2D Action-Platformer / Action RPG
* **Platform:** Web / HTML5 Canvas (Desktop & Mobile Friendly)
* **Inspiration:** *That Time I Got Reincarnated as a Slime* (TenSura), *Hollow Knight*, *Dead Cells*, *Megaman X*
* **Core Fantasy:** Reincarnate as Rimuru Tempest, start as a simple blue slime, absorb monsters, mine ores, synthesize skills via the Voice of the World, and conquer the Jura Tempest labyrinth floors.

---

## 2. Core Gameplay Loop

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   EXPLORATION   │ ────> │ FAST-PACED COMBAT│ ────> │ DEVOUR & EVOLVE │
│ Caverns & Props │       │  Combos & Parry │       │   Gain Skills   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         ▲                                                   │
         │                                                   ▼
┌─────────────────┐                                 ┌─────────────────┐
│   WARP PORTAL   │ <────────────────────────────── │   LEVEL UP &    │
│  Next Deep Floor│                                 │   GREAT SAGE    │
└─────────────────┘                                 └─────────────────┘
```

1. **Traverse & Explore:** Traverse modular caverns with double jumps, wall slides, and dashes while mining Magisteel veins and collecting Hipokute herbs.
2. **Engage in Combat:** Fight Goblin Scouts, Sharpshooters, and Cave Serpents using light/heavy slashes, timed parries, and evasive dashes.
3. **Predator & Devour:** Channel Rimuru's signature Unique Skill `[Predator]` (`[E]`) to absorb weakened enemies, learning new attacks and harvesting raw magicules.
4. **Voice of the World (Great Sage):** Trigger anime system popups that announce level-ups, skill acquisitions, and floor arrivals.
5. **Dimensional Warp:** Defeat floor encounters and reach the Dragon Warp Gate to venture deeper into the labyrinth.

---

## 3. Player Character: Rimuru Tempest

### 3.1 Base Attributes & Scaling
* **Base HP:** $100$ ($+15$ per Level)
* **Base Magicules (MP):** $50$ ($+10$ per Level)
* **Base Attack:** $12$ ($+3$ per Level)
* **Base Defense:** $5$ ($+2$ per Level)
* **Movement Speed:** $220\text{ px/s}$ (Sprint: $280\text{ px/s}$)
* **Jump Velocity:** $-480\text{ px/s}$ with Coyote Time ($80\text{ms}$) and Jump Buffering ($100\text{ms}$)

### 3.2 Action Kit
| Action | Keybind | Properties |
| :--- | :---: | :--- |
| **Light Slash** | `[Z]` | 3-hit rapid water blade combo ($12 \rightarrow 14 \rightarrow 18$ dmg). Can be chained into heavy finisher. |
| **Heavy Cleave** | `[X]` | High-impact energy slash ($28$ dmg) that breaks enemy guards and inflicts hitstop. |
| **Parry / Counter** | `[C]` | $160\text{ms}$ parry window. Perfectly reflects projectiles and staggers melee attackers for $1.2\text{s}$. |
| **Predator (Devour)** | `[E]` | Creates a hydro-suction vortex. Absorbs enemies under $35\%$ HP, granting massive XP and skills. |
| **Quick Dash** | `[Shift]` | $200\text{ms}$ invulnerability dash passing through enemies and traps. |
| **Interact / Mine** | `[E]` | Interacts with Campfires, Shrines, Chests, Urns, and Ore veins. |

---

## 4. Enemies & Boss Roster

### 4.1 Regular Enemies
1. **Goblin Scout (`goblin`):**
   * *HP:* $45$ | *ATK:* $10$
   * *Behavior:* Patrols platforms, leaps toward player within $180\text{px}$, slashes with dagger.
   * *Devour Reward:* $+35\text{ XP}$, *Skill: Shadow Step*.
2. **Goblin Sharpshooter (`goblin_archer`):**
   * *HP:* $35$ | *ATK:* $12$
   * *Behavior:* Maintains $280\text{px}$ distance, charges and fires toxic poison arrows.
   * *Devour Reward:* $+45\text{ XP}$, *Skill: Poison Needle*.
3. **Cave Serpent (`serpent`):**
   * *HP:* $65$ | *ATK:* $16$
   * *Behavior:* Slithers along ground, lunges with noxious bite, high resistance.
   * *Devour Reward:* $+60\text{ XP}$, *Skill: Toxic Mist / Scale Armor*.

### 4.2 Floor Bosses
* **Tempest Serpent Leviathan (`boss_serpent`):**
  * *HP:* $450$ | *ATK:* $24$
  * *Phase 1:* Sweeping tail strikes, venom spit bursts, and platform charges.
  * *Phase 2 (Under 50% HP):* Enrages, summons acidic geysers, shoots multi-directional venom barrages.
  * *Boss Absorption:* Grants $+300\text{ XP}$, *Intrinsic Skill: Dragon Scales & Water Blade Evolution*.

---

## 5. Environment & Interactive Props
* **Magisteel Ore:** Mineable with `[E]` or weapon strikes. Grants $+40\text{ XP}$ and magicule metal reserves.
* **Hipokute Lotus:** Harvestable flower. Instantly heals $+35\text{ HP}$ and $+25\text{ XP}$.
* **Treasure Chest:** Yields $+100\text{ XP}$ and $+50\text{ HP}$.
* **Clay Urn:** Breakable container yielding $+15\text{ XP}$ and $+10\text{ HP}$.
* **Dragon Wall Torch:** Casts flickering atmospheric warm light.
* **Bonfire Rest Site:** Fully restores Rimuru's HP and MP.
* **Ancient Runic Monolith:** Communes to grant temporary $+3\text{ ATK}$ and Great Sage lore.
* **Subterranean Traps:** Floor Spikes (15 dmg), Falling Stalactites (25 dmg), Toxic Spore Mushrooms (12 dmg), and Acid Vents (18 dmg).

---

## 6. Voice of the World (Great Sage System)
* Ethereal anime system notifications delivered via a top-right notification banner.
* Typewriter progression, golden celestial crest `[ ❖ ]`, and resonant audio cues.
* Announces major milestones:
  * *Report: Individual 'Rimuru Tempest' has reached Level X.*
  * *Notice: Target successfully analyzed and devoured. Acquired Skill: [...]*
  * *Report: Arrived at Floor X: Whispering Caverns.*
