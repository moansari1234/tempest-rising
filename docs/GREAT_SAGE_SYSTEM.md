# 🧠 Voice of the World / Great Sage System Specification

## 1. System Philosophy & Anime Lore
In *That Time I Got Reincarnated as a Slime*, the **Voice of the World (世界の声)** and **Great Sage (大賢者 - Dai Kenja)** are celestial consciousnesses that announce universal phenomena, level progressions, and skill syntheses directly to Rimuru.

In *Tempest Rising*, the Great Sage system serves as both a high-immersion narrative element and an elegant, non-intrusive player feedback HUD.

---

## 2. Notification Pipeline & Architecture

```
Event Trigger (LevelUp / Devour / Boss / Warp)
                      │
                      ▼
     GreatSageSystem.notify(title, message, duration)
                      │
                      ▼
             FIFO Message Queue
                      │
                      ▼
       Typewriter Character Reveal Engine
                      │
                      ▼
    Top-Right Ethereal Anime Notification Card
```

---

## 3. Visual Layout & Positioning

To ensure **100% unobstructed gameplay**, the Great Sage popup is anchored to the top-right screen space directly beneath the stage progress badge:

```
┌─────────────────────────────────────────────────────────────┐
│ [RIMURU HUD]                            [STAGE BADGE]       │
│                                       ┌───────────────────┐ │
│                                       │ ❖ VOICE OF WORLD  │ │
│                                       │ Notice: Acquired  │ │
│                                       │ Skill: ShadowStep │ │
│                                       └───────────────────┘ │
│                                                             │
│                      [ACTIVE COMBAT AREA]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Specifications
* **Dimensions:** Width $460\text{px}$, Height $62\text{px}$, Position: Top-Right ($x = \text{Width} - 480, y = 50$).
* **Backdrop:** Deep Obsidian & Celestial Black (`rgba(6, 11, 20, 0.95)`).
* **Border:** Golden Ethereal Glow with breathing sine alpha oscillation (`rgba(245, 158, 11, pulse)`).
* **Corner Accents:** 4 anime L-bracket brackets in solid amber (`#f59e0b`).
* **Title:** Bold Golden Monospace (`#facc15`).
* **Energy Divider:** 1px Cyan Magicule Pulse Line (`rgba(56, 189, 248, pulse)`).
* **Typewriter Font:** High-legibility celestial text (`#e0f2fe`) revealing at $35\text{ms/char}$.

---

## 4. Trigger Catalog

| Trigger Event | Title | Example Message |
| :--- | :--- | :--- |
| **Level Progression** | `[ ❖ VOICE OF THE WORLD ❖ ]` | `Report: Individual 'Rimuru Tempest' has reached Level 3. Base Magicules and physical attributes have increased.` |
| **Predator Devour** | `[ ❖ GREAT SAGE: ANALYSIS ❖ ]` | `Notice: Target successfully analyzed and devoured. Acquired Extra Skill: 'Poison Needle'.` |
| **Floor Arrival** | `[ ❖ GREAT SAGE: ENVIRONMENT ❖ ]` | `Report: Arrived at Floor 1-2: Emerald Depths. Atmospheric magicule density is rising.` |
| **Monolith Resonance**| `[ ❖ GREAT SAGE: SYNTHESIS ❖ ]` | `Notice: Ancient Runic resonance detected. Temporary ATK buff +3 applied.` |
| **Boss Defeat** | `[ ❖ VOICE OF THE WORLD ❖ ]` | `Confirmed: Area Boss 'Tempest Serpent' eliminated. Special intrinsic evolution unlocked.` |
