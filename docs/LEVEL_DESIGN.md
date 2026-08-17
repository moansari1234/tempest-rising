# 🗺️ Level Design & Procedural Generation System

## 1. Overview
*Tensei Slime: Tempest Rising* features a hybrid procedural and crafted level generation architecture designed to provide structured pacing, reliable platform reachability, and exciting subterranean exploration.

---

## 2. Cavern Metrics & Platform Spacing

All levels are built on a modular grid of $32\times32\text{px}$ tiles.

| Metric | Measurement (Pixels) | Measurement (Tiles) |
| :--- | :---: | :---: |
| **Tile Dimensions** | $32\times32\text{ px}$ | $1\times1\text{ Tile}$ |
| **Player Bounding Box** | $24\times20\text{ px}$ | $\approx 0.75\times0.6\text{ Tiles}$ |
| **Max Single Jump Height** | $112\text{ px}$ | $3.5\text{ Tiles}$ |
| **Max Double Jump Height** | $192\text{ px}$ | $6.0\text{ Tiles}$ |
| **Max Horizontal Jump Reach** | $224\text{ px}$ | $7.0\text{ Tiles}$ |
| **Max Dash Distance** | $160\text{ px}$ | $5.0\text{ Tiles}$ |
| **Floor Level** | $y = 15\times32 = 480\text{ px}$ | Row 15 |
| **Bedrock Depth** | Rows 16 & 17 | Rows 16–17 |

---

## 3. Procedural Level Generation Pipeline

```
1. Grid Initialization   ──> Create 38x18 grid filled with air '.' and solid bounds '#'
2. Platform Network      ──> Generate floating ledges with max 3-tile vertical gap
3. Prop Distribution     ──> Place Campfires, Monoliths, Chests, Urns, and Ores
4. Hazard Placement      ──> Embed Spikes, Stalactites, Spore Shrooms, and Vents
5. Enemy Spawn Zoning    ──> Assign Scouts, Archers, and Serpents with minimum spacing
6. Warp Gate Placement   ──> Position Dimensional Exit Portal on the far right ledge
7. 16-Bit Autotiling     ──> Map bitmask rules to ground, ledge, wall, and rock textures
```

---

## 4. Intelligent 16-Bit Autotiling Matrix

The renderer reads the 4-cardinal neighbors ($U, D, L, R$) of each solid `#` tile:

| Tile Type | Neighbor Condition | Texture Key | Visual Appearance |
| :--- | :--- | :--- | :--- |
| **Ground Mid** | $U=0, D=1, L=1, R=1$ | `tiles_ground_mid_0` | Top surface slate with lush emerald green moss carpet |
| **Ground Left** | $U=0, D=1, L=0$ | `tiles_ground_left_0` | Left cliff edge with curved moss corner & vine |
| **Ground Right** | $U=0, D=1, R=0$ | `tiles_ground_right_0` | Right cliff edge with curved moss corner & vine |
| **Platform Mid** | $U=0, D=0, L=1, R=1$ | `tiles_plat_mid_0` | Floating 1-tile ledge with hanging roots below |
| **Platform Left**| $U=0, D=0, L=0$ | `tiles_plat_left_0` | Floating ledge left rounded bracket end |
| **Platform Right**| $U=0, D=0, R=0$ | `tiles_plat_right_0` | Floating ledge right rounded bracket end |
| **Ceiling** | $U=1, D=0$ or $r=0$ | `tiles_ceiling_0` | Rocky cavern ceiling with hanging stalactites |
| **Wall Left** | $c=0$ or $L=0, U=1, D=1$| `tiles_wall_left_0` | Solid vertical left boundary wall with brick shadow |
| **Wall Right** | $c=\text{max}$ or $R=0$ | `tiles_wall_right_0` | Solid vertical right boundary wall with brick shadow |
| **Rock Core** | $U=1, D=1, L=1, R=1$ | `tiles_rock_core_0` | Deep underground solid bedrock with magicule ore flecks |

---

## 5. Chapter Progression Architecture
* **Floor 1-1: Whispering Caverns:** Tutorial zone introducing Goblin Scouts, Magisteel mining, and Hipokute gathering.
* **Floor 1-2: Emerald Depths:** Traversal challenge with toxic spore mushrooms, ceiling stalactites, and Goblin Sharpshooters.
* **Floor 1-3: Ancient Runic Sanctum:** High-density hazard floor with floor spikes and hidden treasure chests.
* **Floor 1-4: The Leviathan's Lair:** Boss arena hosting the Tempest Serpent with multi-tier platforms and dynamic hazard geysers.
