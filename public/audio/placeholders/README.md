# Frontier Reckoning placeholder audio

The primary gameplay ambience now lives at `public/audio/nature-ambience.mp3`
and is registered in `src/game/systems/audioSystem.ts`.

The remaining menu music and sound effects use original procedural Web Audio
compositions until final short assets are available. To replace those generated
sounds later, add final assets in this folder and set the matching `src` fields
in `generatedAudioAssets`:

- `main-menu.ogg`
- `button-click.ogg`
- `event-alert.ogg`
- `hunting-shot.ogg`
- `hunting-hit.ogg`
- `victory.ogg`
- `game-over.ogg`

Keep replacements short, loop-clean where needed, and normalized quietly enough that
the existing music and SFX volume settings remain comfortable.
