# How to Add Sounds to Tempest Rising

## Quick Start
1. Place your .mp3, .ogg, or .wav file into this `/public/audio/` folder.
2. Open `src/core/AudioManager.js`.
3. In the `soundFiles` object inside `init()`, add a new entry:
   ```js
   your_key: '/audio/your_file.mp3',
   ```
4. Now call it anywhere in the game with:
   ```js
   context.audio.play('your_key');
   ```

## Example — Adding a Slam Sound for Heavy Attack

1. Rename your file to `attack_heavy.mp3` (or anything you like).
2. Drop it in `public/audio/attack_heavy.mp3`.
3. In `AudioManager.js`, it's already in the list — just replace the file!

## File Format Tips
- **Format**: MP3 is most compatible. OGG also works.
- **Length**: Keep SFX under 1–2 seconds. Longer files are fine for BGM.
- **Volume**: Aim for -12 to -6 dBFS peak to avoid clipping when multiple sounds play.
- **Loops**: For background music, just set `this.bgm.loop = true` (already done for bgm_chapter1).

## Sound Keys Reference

| Key | When It Plays | File |
|---|---|---|
| `jump` | Player jumps | jump.mp3 |
| `dash` | Player dashes | dash.mp3 |
| `attack_light` | Light attack swing | attack_light.mp3 |
| `attack_heavy` | Heavy attack fires | attack_heavy.mp3 |
| `parry` | Parry triggered | parry.mp3 |
| `hit` | Enemy takes damage | hit.mp3 |
| `player_hurt` | Player takes damage | player_hurt.mp3 |
| `absorb` | Predator absorbs enemy | absorb.mp3 |
| `level_up` | Player levels up | level_up.mp3 |
| `boss_roar` | Boss intro plays | boss_roar.mp3 |
| `victory` | Boss defeated | victory.mp3 |
| `bgm_chapter1` | Chapter 1 background music (loops) | bgm_chapter1.mp3 |
