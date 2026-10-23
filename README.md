# Shinjuku Showdown: Flappy Battle

Play: **https://syl862.github.io/shinjuku-flappy-battle/**

Static HTML/CSS/JavaScript Canvas game. Choose Gojo or Yuji, Practice or Challenge. No account, backend or build step. GitHub Pages serves main from the repository root.

## Controls and tactics

Space / click / tap the battlefield to rise. J uses the active skill; K uses 100 energy for the ultimate. Music and SFX have independent mute and volume controls. Music starts after Start Battle, loops, and lowers to 25% during defeat.

Fly through either cyan opening in damaged pillars. Solid amber pillar shadows protect your entire core circle from Cover Slash. Stay covered through the wave, then move into an opening before the pillar arrives. Skills can destroy cover. Domain attacks require their own cyan safe lane. Automatic shots pass through pillars. The white core circle defines collision; illustrated limbs are decorative.

## Upgrade

Real dual-opening pillars, moving cover and escape planning, structural skill clearing, cover-defense recaps, colored layered scenery, flap feedback, supplied Purple/Black Flash illustrations, phase transformation and character-specific manga result sequences. Responsive controls support desktop and mobile browsers.

The existing browser storage namespace is unchanged, preserving valid previous records and per-mode bests at this same address. Only the latest five completed rounds are retained. Abandoned rounds do not count. Add ?test=1 to isolate synthetic test records.

## Assets

See ASSET_MANIFEST.json for exact runtime files, source references, adaptation labels and hashes. The user-supplied MP3 remains assets/audio/rain-love.mp3 and loads relatively; no MGG files are used.

Four transparent combat sprites remain explicitly labeled provisional AI reconstructions because selected A1/B4/C1/D1 originals were inaccessible. Selected Gojo defeat F1 remains a visible fallback. Yuji victory G2 is an AI-assisted flat reconstruction retaining defeated Sukuna and Yuji, not an unchanged original manga scan. Combat rules and results are game adaptations.

## Verification

The release source passed 16 regression and 19 upgrade logic checks plus syntax checks on all four JavaScript files. Sampled route replay and automated pilots are diagnostic, not human scores or proof of universal fairness. Local Edge checks covered inputs, image/music loading, looping, independent audio controls and controlled result sequences. Human pacing, physical touch feel and native hidden-tab pause/resume still need manual playtesting.

For local use, serve this directory with any static HTTP server. Node.js is not required to play. Future updates pushed to main rebuild this same sharing URL.
