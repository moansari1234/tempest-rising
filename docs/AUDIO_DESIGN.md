# 🎵 Audio Design & Sound Architecture

## 1. Overview & Soundscape Philosophy
*Tensei Slime: Tempest Rising* employs an adaptive audio management engine designed to deliver impactful combat hits, atmospheric subterranean ambient loops, and the iconic resonant chime of the Voice of the World.

---

## 2. Audio Bus & Mixer Architecture

```
                       ┌─────────────────────────┐
                       │      Master Output      │
                       │     (Volume: 0.70)      │
                       └────────────┬────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
      ┌─────────────────┐                       ┌─────────────────┐
      │     SFX Bus     │                       │     BGM Bus     │
      │  (Volume: 0.80) │                       │  (Volume: 0.40) │
      └────────┬────────┘                       └────────┬────────┘
               │                                         │
 ┌─────────────┼─────────────┐                           │
 ▼             ▼             ▼                           ▼
Attack / Hits  Parry Chime   Voice of World      Dynamic Cavern BGM
```

---

## 3. Sound Effects Pool (`src/core/AudioManager.js`)

To ensure zero latency and prevent browser audio thread blocking, all sound effects are preloaded into object pools ($N=4$ instances each):

| Sound Key | File Path | Trigger Event | Properties |
| :--- | :--- | :--- | :--- |
| `jump` | `/public/audio/jump.mp3` | Player Ground/Air Jump | Light whoosh |
| `dash` | `/public/audio/dash.mp3` | Quick Dash execution | High-speed air displacement |
| `attack_light` | `/public/audio/attack_light.mp3` | Light Slash `[Z]` | Water blade cutting sound |
| `attack_heavy` | `/public/audio/attack_heavy.mp3` | Heavy Cleave `[X]` | Heavy kinetic slime impact |
| `parry` | `/public/audio/parry.mp3` | Successful Parry `[C]` | Resonant high-pitch metallic deflect |
| `hit` | `/public/audio/hit.mp3` | Enemy taking damage | Sharp cutting impact |
| `player_hurt` | `/public/audio/player_hurt.mp3` | Rimuru receiving damage | Slime deformation thud |
| `absorb` | `/public/audio/absorb.mp3` | Predator Devour `[E]` | Deep hydro-vortex suction sound |
| `level_up` | `/public/audio/level_up.mp3` | Level Up Trigger | Golden ascending chime |
| `boss_roar` | `/public/audio/boss_roar.mp3` | Serpent Boss Roar | Low-frequency cavern tremor |
| `victory` | `/public/audio/victory.mp3` | Boss Cleared / Gate | Fanfare melody |

---

## 4. Web Audio Synthesizer Fallback
* In environments where external MP3 assets are unavailable or blocked by CORS/network policies, the `AudioManager` handles playback failures silently without throwing runtime exceptions, with a lightweight procedural Web Audio API oscillator synthesizing basic combat impact tones.
