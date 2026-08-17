# 🎨 Art Direction, Animation & Visual Assets

## 1. Visual Aesthetics & Philosophy
* **Art Style:** 16-Bit Neo-Retro Pixel Art with modern dynamic lighting, smooth particle effects, and screen-space anime HUD overlays.
* **Inspiration:** *TenSura: Slime Isekai Memories*, *Dead Cells*, *Castlevania: Symphony of the Night*.
* **Color Palette:**
  * **Rimuru Cyan / Magicules:** `#38bdf8`, `#06b6d4`, `#e0f2fe`
  * **Ancient Cavern Slate:** `#0f172a`, `#1e293b`, `#334155`
  * **Lush Subterranean Moss:** `#14532d`, `#16a34a`, `#22c55e`, `#86efac`
  * **Voice of the World Gold:** `#d97706`, `#f59e0b`, `#facc15`
  * **Toxic Venom / Spores:** `#84cc16`, `#a3e635`, `#4d7c0f`

---

## 2. Character Sprite Atlases & Skin System

### 2.1 Skin Swapping Pipeline
The engine includes dual skin sets toggled seamlessly in real-time:
* **Skin 1 (Classic 16-Bit):** Hand-crafted retro anime pixel sprites.
* **Skin 2 (High-Definition Demon Lord):** High-resolution hand-drawn animated sprites with extended particle frames.

### 2.2 Animation State Matrices
| Entity | Animations | Frame Count | Loop | Frame Duration |
| :--- | :--- | :---: | :---: | :---: |
| **Rimuru** | `idle`, `walk`, `run`, `jump`, `attack_light`, `attack_heavy`, `predator`, `hurt`, `death`, `victory`, `special` | 4 frames each | Per Action | $0.07\text{s} - 0.18\text{s}$ |
| **Goblin Scout** | `idle`, `run`, `attack`, `hurt`, `death` | 4 frames each | Per Action | $0.12\text{s} - 0.25\text{s}$ |
| **Goblin Archer** | `idle`, `run`, `attack`, `hurt`, `death` | 4 frames each | Per Action | $0.12\text{s} - 0.22\text{s}$ |
| **Tempest Serpent** | `idle`, `run`, `attack`, `hurt`, `death` | 4 frames each | Per Action | $0.14\text{s} - 0.22\text{s}$ |

---

## 3. 3-Layer Parallax Background System

The cavern renders 3 independent parallax depth planes:

```
[Layer 1: Deep Cavern Mist]      ── Scroll Factor: 0.10x  (Slowest / Infinite Depth)
[Layer 2: Stalactites & Ruins]   ── Scroll Factor: 0.35x  (Midground Atmosphere)
[Layer 3: Fore-Vines & Pillars]  ── Scroll Factor: 0.70x  (Near Depth)
[Layer 4: Active Stage Tilemap]  ── Scroll Factor: 1.00x  (Camera Tracking)
```

---

## 4. Visual Effects (VFX)

1. **Predator Hydro-Vortex:**
   * Concentric swirling cyan suction rings with contracting radial vectors.
   * Dynamic spiral particle trails drawn directly to the canvas context.
2. **Hit Impact Sparks:**
   * Ethereal water slashes and golden parry deflection bursts.
3. **Floating Damage & XP Text:**
   * Alpha-fading floating typography with upward ease-out velocity and color-coded damage types (Emerald = Player Heal, Red = Enemy Damage, Gold = XP).
