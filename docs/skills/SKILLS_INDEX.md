# 📚 Game Development Skills Reference Library

This directory contains the **69 Game Development Skills** covering core mechanics, genre systems, multi-engine workflows, art direction, and publishing pipelines.

---

## 🧭 Master Category Index

### 🕹️ 1. Core Mechanics & Game Feel (Directly Applied to Tempest Rising)
* [**`game-feel`**](./game-feel/SKILL.md) — Screen shake, hit-stop, squash & stretch, impact frames, juicy audio-visual feedback.
* [**`platformer`**](./platformer/SKILL.md) — 2D platforming, coyote time, jump buffering, variable jump height.
* [**`physics-tuning`**](./physics-tuning/SKILL.md) — Fixed vs variable timestep, render interpolation, CCD, tunneling prevention.
* [**`input-systems`**](./input-systems/SKILL.md) — Action mapping, rebinding, multi-device support, input buffering.
* [**`camera-systems`**](./camera-systems/SKILL.md) — 2D/3D follow, look-ahead, deadzones, level bounds clamping, orbit cameras.
* [**`game-ui-ux`**](./game-ui-ux/SKILL.md) — HUDs, health bars, menus, anchors, safe areas, gamepad focus navigation.
* [**`game-ai`**](./game-ai/SKILL.md) — Finite State Machines, Behavior Trees, steering behaviors, A* pathfinding.
* [**`level-design`**](./level-design/SKILL.md) — Whiteboxing, metrics, pacing/tension curves, critical path gating.
* [**`procedural-gen`**](./procedural-gen/SKILL.md) — Perlin/Simplex noise, dungeon BSP algorithms, deterministic RNG, loot tables.
* [**`dialogue-systems`**](./dialogue-systems/SKILL.md) — Branching node graphs, Ink / Yarn Spinner runners, localization hooks.
* [**`save-systems`**](./save-systems/SKILL.md) — Game state serialization, save slots, atomic crash-safe writes, migrations.
* [**`audio-design`**](./audio-design/SKILL.md) — Mixer bus architecture, sidechain ducking, adaptive music layers, beat sync.
* [**`performance-optimization`**](./performance-optimization/SKILL.md) — Profiling, draw-call batching, object pooling, GC spike prevention.
* [**`prototype-fast`**](./prototype-fast/SKILL.md) — Rapid 1-hour gameplay slicing and MVP mechanics validation.

---

### ⚔️ 2. Genre Frameworks
* [**`rpg`**](./rpg/SKILL.md) — Leveling, stats, inventories, equipment, quests, combat formulas.
* [**`roguelike`**](./roguelike/SKILL.md) — Turn-based grid movement, procedural floors, permadeath, FOV.
* [**`card-game`**](./card-game/SKILL.md) — Decks, hands, discard zones, turn structure, card effect resolution.
* [**`tower-defense`**](./tower-defense/SKILL.md) — Pathing lanes, wave spawning, auto-targeting towers, economy.
* [**`fps-shooter`**](./fps-shooter/SKILL.md) — First-person controller, hitscan/projectile ballistic shooting, weapon recoil.
* [**`survival-crafting`**](./survival-crafting/SKILL.md) — Resource gathering, recipes, tech trees, hunger/thirst, base building.
* [**`visual-novel`**](./visual-novel/SKILL.md) — Branching narrative runner, character portraits, choice boxes, backlog/skip.
* [**`puzzle`**](./puzzle/SKILL.md) — Grid/board state, Match-3 cascade logic, Sokoban block pushes, undo stacks.
* [**`game-jam`**](./game-jam/SKILL.md) — 48-hour scope planning, timeboxing, cutting non-essentials to ship on time.

---

### 🎨 3. Art, Sprites & Shaders
* [**`pixel-art-sprites`**](./pixel-art-sprites/SKILL.md) — Character sprites, sprite sheets, limited palettes, frame-by-frame animation.
* [**`create-game-assets`**](./create-game-assets/SKILL.md) — Cohesive style bibles, tilesets, props, UI iconography, asset briefs.
* [**`shader-programming`**](./shader-programming/SKILL.md) — Vertex/fragment pipelines, UV math, dissolve, outline, rim lighting, GLSL/HLSL.

---

### 🌐 4. Web & Multi-Engine Frameworks
* [**`pixijs-rendering`**](./pixijs-rendering/SKILL.md) — PixiJS v8 async Application, textures, containers, ticker loop.
* [**`phaser-core`**](./phaser-core/SKILL.md) — Phaser 4 scenes, loaders, cameras, game configuration.
* [**`phaser-arcade-physics`**](./phaser-arcade-physics/SKILL.md) — Phaser Arcade physics bodies, velocities, colliders, overlaps.
* [**`threejs-scene-setup`**](./threejs-scene-setup/SKILL.md) — Three.js scenes, perspective cameras, WebGL renderer loop, OrbitControls.
* [**`threejs-materials-lighting`**](./threejs-materials-lighting/SKILL.md) — PBR Standard materials, directional/point lights, shadow maps, envMaps.
* [**`threejs-gltf-loading`**](./threejs-gltf-loading/SKILL.md) — glTF/GLB models, DRACO compression, AnimationMixer animations.
* [**`pygame-core`**](./pygame-core/SKILL.md) — Python Pygame-ce game loop, surfaces, blitting, sprite groups, collision.
* [**`love2d-core`**](./love2d-core/SKILL.md) — LÖVE 11.x Lua game loop, delta-time physics, input, canvas drawing.
* [**`bevy-ecs`**](./bevy-ecs/SKILL.md) — Rust Bevy Entity Component System, queries, commands, resources, plugins.

---

### 🤖 5. Godot Engine 4.7
* [**`godot-gdscript`**](./godot-gdscript/SKILL.md) — Idiomatic GDScript static typing, `@export`, `@onready`, signals, `await`.
* [**`godot-nodes-scenes`**](./godot-nodes-scenes/SKILL.md) — Scene tree hierarchy, instantiating `PackedScene`, autoload singletons.
* [**`godot-2d-movement`**](./godot-2d-movement/SKILL.md) — `CharacterBody2D`, `move_and_slide()`, slope handling, 8-directional control.
* [**`godot-3d-essentials`**](./godot-3d-essentials/SKILL.md) — `Node3D`, `Camera3D`, environment lighting, `GridMap` 3D tile level layouts.
* [**`godot-physics`**](./godot-physics/SKILL.md) — 2D/3D physics bodies, collision layers/masks, raycasts, area triggers.
* [**`godot-animation`**](./godot-animation/SKILL.md) — `AnimationPlayer`, `AnimationTree` blend spaces, state machines, code `Tween`s.
* [**`godot-tilemap`**](./godot-tilemap/SKILL.md) — `TileMapLayer`, `TileSet`, terrain auto-tiling, cell modification from script.
* [**`godot-ui-control`**](./godot-ui-control/SKILL.md) — `Control` nodes, anchors, `Container` layouts, custom `Theme` styling.
* [**`godot-audio`**](./godot-audio/SKILL.md) — `AudioStreamPlayer2D/3D`, `AudioServer` mixer buses, volume curves, beat sync.
* [**`godot-resources`**](./godot-resources/SKILL.md) — Custom `Resource` data modeling, `.tres` saving/loading, async resource loading.
* [**`godot-signals-groups`**](./godot-signals-groups/SKILL.md) — Custom signals, Callables, node groups, `call_group` broadcasts.
* [**`godot-shaders`**](./godot-shaders/SKILL.md) — Canvas item and spatial `.gdshader` files, screen reading, uniforms.
* [**`godot-multiplayer`**](./godot-multiplayer/SKILL.md) — ENet high-level networking, `@rpc`, multiplayer authority, state synchronizers.
* [**`godot-csharp`**](./godot-csharp/SKILL.md) — C#/.NET in Godot, PascalCase lifecycle, `[Signal]` delegates, interop.
* [**`godot-export`**](./godot-export/SKILL.md) — Export templates, web/mobile presets, headless CI build automation.

---

### 🎯 6. Unity 6.3 LTS
* [**`unity-csharp-scripting`**](./unity-csharp-scripting/SKILL.md) — `MonoBehaviour` lifecycle, component access, coroutines, serialized fields.
* [**`unity-animation`**](./unity-animation/SKILL.md) — Animator Controllers, blend trees, Mecanim state transitions, humanoid IK.
* [**`unity-physics`**](./unity-physics/SKILL.md) — 3D `Rigidbody` forces, colliders, triggers, layer matrices, raycasting.
* [**`unity-input-system`**](./unity-input-system/SKILL.md) — New Input System actions, mapping contexts, `PlayerInput` callbacks.
* [**`unity-navmesh`**](./unity-navmesh/SKILL.md) — AI navigation baking (`NavMeshSurface`), `NavMeshAgent` path movement.
* [**`unity-tilemap-2d`**](./unity-tilemap-2d/SKILL.md) — 2D Grid & Tilemap, Tile Palette, Rule Tiles, tile colliders.
* [**`unity-scriptableobjects`**](./unity-scriptableobjects/SKILL.md) — Data assets, event channels, runtime registries, manager decoupling.
* [**`unity-build-pipeline`**](./unity-build-pipeline/SKILL.md) — BuildPlayer scripting, IL2CPP vs Mono, code stripping, CI builds.

---

### 🔥 7. Unreal Engine 5
* [**`unreal-cpp-gameplay`**](./unreal-cpp-gameplay/SKILL.md) — UE5 C++, `UCLASS`/`UPROPERTY`/`UFUNCTION` reflection, `AActor`/`ACharacter`.
* [**`unreal-blueprints`**](./unreal-blueprints/SKILL.md) — Event Graph scripting, Blueprint Interfaces, Event Dispatchers, casts.
* [**`unreal-enhanced-input`**](./unreal-enhanced-input/SKILL.md) — Input Actions (`IA_`), Input Mapping Contexts (`IMC_`), triggers/modifiers.
* [**`unreal-behavior-trees`**](./unreal-behavior-trees/SKILL.md) — Behavior Trees (`BT_`), Blackboards (`BB_`), custom Tasks, Decorators, Services.
* [**`unreal-niagara`**](./unreal-niagara/SKILL.md) — Particle systems, emitters, spawn/update stages, User Parameter driving.
* [**`unreal-packaging`**](./unreal-packaging/SKILL.md) — Shipping package creation, content cooking, `RunUAT BuildCookRun` CI.

---

### 🧱 8. Roblox (Luau)
* [**`roblox-luau`**](./roblox-luau/SKILL.md) — Server Scripts vs Client LocalScripts, RemoteEvents, server authority.
* [**`roblox-datastores`**](./roblox-datastores/SKILL.md) — `DataStoreService`, `GetAsync`/`SetAsync`, `BindToClose`, leaderboards.

---

### 🚢 9. Publishing & Router
* [**`steam-publish`**](./steam-publish/SKILL.md) — Steamworks depots, SteamPipe `steamcmd` uploads, release builds.
* [**`itch-publish`**](./itch-publish/SKILL.md) — itch.io butler CLI (`butler push`), channel versioning, release deploys.
* [**`router`**](./router/SKILL.md) — Auto-detector routing any gamedev task to the exact specialized skill.
