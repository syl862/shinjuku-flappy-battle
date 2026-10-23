# Shinjuku Showdown: Flappy Battle

Play: **https://syl862.github.io/shinjuku-flappy-battle/**

Static HTML/CSS/JavaScript Canvas game, hosted from main / repository root through GitHub Pages. No account, backend, API key or build step is needed to play.

## Controls and rules

Choose Gojo or Yuji and Practice or Challenge. Space / click / tap the battlefield to rise. J uses the active skill; K spends100 energy. Automatic shots pass through obstacles as a game adaptation. Three HP, Infinity, half-second post-hit protection, Sukuna transformation and domain attacks remain.

Ruined architecture has one or two independently randomized openings with variable sizes, heights, widths and spacing. Grounded single-opening groups sometimes use large rocks (approximately25% of eligible ground sections). Dark recessed structural braces are decorative. Muted cyan edges identify passages; solid amber shadows protect the entire player core from Cover Slash. Domains require their own cyan safe lane. Skills can destroy cover.

J holds the character aloft for0.9s; K for1.35s. A fresh Space press or canvas tap immediately exits hovering and jumps. Natural timeout releases at zero vertical speed to fall. Held/repeated keys do not queue actions. Hover protection and slow motion end on exit, while valid post-hit protection remains. Skill attacks continue on their original independent animation/impact timeline. A small hint says Space to resume flight.

Music and SFX have independent volume/mute controls. The user-supplied MP3 loads from assets/audio/rain-love.mp3, loops after Start Battle, ducks to25% volume during defeat and restores on Retry. No MGG files are used.

## Performance update

Route search reuses time-dependent collision geometry and reconstructs one final trace. Ruin and sprite graphics are cached; structural destruction invalidates the corresponding ruin image immediately. HUD text and canvas-layout measurements avoid repeated unnecessary work. Physics, difficulty and route-validation rules remain.

A controlled20-second local Edge comparison reduced frame gaps over50ms from90 to3 and frame-gap p95 from50.1ms to16.8ms. This is diagnostic local evidence, not a guarantee for every device or network; some timing spikes remained. Four runtime JS syntax checks and67 logic checks passed.48 route scenarios matched the original solver exactly, and6400 collision samples matched the original geometry. Native keyboard/mobile-emulated pointer and controlled hover/state checks were performed on the release source. Physical-phone feel, subjective mixing and broad-device performance still need human playtesting.

## Records and art status

The original browser history and per-mode best keys are unchanged at this same sharing address. The latest five completed rounds are retained; abandoned rounds do not count. Add ?test=1 for clearly labeled isolated synthetic test records.

ASSET_MANIFEST.json records source references and adaptation labels. Four transparent combat sprites remain labeled provisional AI reconstructions; selected originals A1/B4/C1/D1 were inaccessible. Selected Gojo defeat F1 remains a visible fallback. Yuji victory G2 is an AI-assisted reconstruction, not an unchanged manga scan. No new image assets were introduced in the performance update.

For local use, serve this folder with any static HTTP server, or use start-game.cmd with Python3. Node.js is unnecessary to play. Future pushes to main update this same URL.
