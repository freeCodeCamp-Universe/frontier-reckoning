# Frontier Reckoning audio

The game currently uses original procedural Web Audio compositions from
`src/game/systems/audioSystem.ts`. There are no bundled copyrighted music or sound
effect files, which keeps the production payload small.

To replace the generated audio later, add final assets in this folder and set the
matching `src` fields in `generatedAudioAssets`:

- `main-menu.ogg`
- `trail-ambience.ogg`
- `camp-ambience.ogg`
- `town-ambience.ogg`
- `storm-ambience.ogg`
- `river-ambience.ogg`
- `button-click.ogg`
- `event-alert.ogg`
- `hunting-shot.ogg`
- `hunting-hit.ogg`
- `victory.ogg`
- `game-over.ogg`

Keep replacements short, loop-clean where needed, and normalized quietly enough that
the existing music and SFX volume settings remain comfortable.
