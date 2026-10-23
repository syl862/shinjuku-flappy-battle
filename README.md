# Shinjuku Showdown: Flappy Battle

Playable native HTML/CSS/JavaScript Canvas game based on confirmed Proposal v0.3. No accounts, API keys, packages, or build step. Final character sprites remain unfinished: combat uses explicitly labeled original development drawings. Approved Gojo 09 / Yuji 12 portraits are used for selection, skill cut-ins, and results. Slides and formal reflection are separate future deliverables.

## Run on Windows

Extract the ZIP. With Python 3 installed, double-click `start-game.cmd`, then open **http://127.0.0.1:8011/**. Keep the server window open. If Python is available as `py` instead, open a terminal in this folder and run:

```powershell
py -m http.server 8011 --bind 127.0.0.1
```

If the address is already serving this project, use that server. If another application occupies 8011, choose 8012 in the command and URL. Use HTTP. Entry point is `index.html`; serving over HTTP is recommended over double-clicking it. No internet is required after extraction.

## Play

- Choose Gojo or Yuji, Practice or Challenge, then Start Battle. Both characters are available immediately and fixed for that round.
- Space or tap/click the canvas to rise. Automatic normal attacks hit Sukuna. Ceiling contact clamps position without damage. Ground contact bounces upward and attempts one hit; the usual shield/protection rules apply.
- J or the J button: Gojo's 苍 / Blue clears nearby forward ordinary attacks; Yuji's 解 / Dismantle deals 36 damage and clears alternating forward ordinary attacks. Cooldown 8 seconds.
- K or the K button: 100 energy required. Gojo's 虚式·茈 / Hollow Purple deals 140 damage and clears ordinary slash walls intersecting its beam. Yuji's 领域展开 / Domain Expansion deals 115 damage, changes the scene, and reduces boss attack-timer advancement to 35% for 5 seconds. Domains remain dangerous and cannot be erased by clearing abilities.
- Gojo's Infinity blocks one hit, recharging over 12 active seconds. Yuji earns one non-stacking Black Flash charge from a genuine near miss, tripling the next normal hit. Actual collisions, including shield contacts, cannot earn this reward.
- Three HP; 0.5-second protection after a hit or shield block. Slash walls have outlined safe gaps. Phase-two domains show a warning then become active for 1.1 seconds; move into the cyan lane.
- At half HP, attacks clear and combat timers freeze for a 2.2-second transformation. Sukuna keeps remaining HP, gains four arms, attacks faster, and adds domain zones. Lethal damage wins directly.
- Zero player HP loses; zero boss HP wins. Retry and Character Select unlock after 2 seconds. Retry creates fresh combat state. Closing/reloading a running round abandons it without a completed record. Hidden tabs pause combat and music.
- Music starts after Start Battle, loops, and has an independent toggle and slider. Defeat uses 25% of the selected volume; Retry restores the selected level. If browser playback is blocked, toggle music after interacting with the page.

## Rules and tuning

`engine.js` centralizes balance in `CONFIG`. Boss HP 1000; normal damage 6 every 0.9 active seconds; normal hits grant 3 energy; clean slash dodges grant 7. Starting energy 20, maximum 100. Skill damage does not generate energy. Blue's forward range is x=120–470 with gap-center distance below 240; its swirling effect is a game abstraction. Purple clears a whole ordinary wall object if its beam intersects that wall; it does not clear a domain. Yuji's rushing images do not move the player's collision position.

Practice: slash speed 175 px/s, gap 235 px, interval 2.6s, domain warning 2.1s and safe lane 240 px. Challenge: 235 px/s, gap 180 px, interval 2.1s, warning 1.6s, lane 190 px. Phase two multiplies slash intervals by 0.76. New slash centers shift by at most 125 px; domain centers are within 80 px of the current player position, clamped to the field. These adaptations keep warning-time travel practical, but simultaneous hazards still require human playtesting.

Score = actual boss damage + 20 × clean dodges + 35 × near misses + 100 × remaining HP + 1000 for victory, rounded to an integer. Active time excludes transformation, hidden-tab pause and end screens. Latest five completed rounds are stored newest first under `shinjuku-flappy-battle-v03-history`; separate mode best scores use the `-best` suffix. Old classroom Flappy Bird keys are untouched. Recap describes actual counters and hit sources, using fixed rules rather than AI inference.

The 60–90-second round length is a target, not a verified human result. Deterministic pilot results are in `evidence/balance-simulation.jsonl` and documented in TEST_RESULTS.md. Skilled Yuji rounds can be shorter; early losses are possible.

## Evidence and tests

`node tests/engine.test.cjs` runs the mechanics suite, if Node.js is installed. `node tests/balance.cjs` runs an automated pilot. Neither is required to play. Browser automation used Edge and inspected actual media-element playback, loop wrap, controls, layout, and controlled combat states. Evidence/screenshots are genuine browser captures; filenames identify simulated states. No full human playthrough is claimed.

For isolated testing use **http://127.0.0.1:8011/?test=1**. It visibly labels the session and uses separate history and mode-best keys. Do not present these synthetic results as player performance. Normal opening never loads test records.

Manual acceptance: play each character in both modes; use J and K, reach half HP and the domain phase, lose once and retry, win, refresh history, and listen for audio/volume changes. Assess readability, simultaneous hazard reachability, character balance and subjective 60–90-second pacing.

See STATE.md for resumable status, TEST_RESULTS.md for measured checks, DEV_LOG.md for genuine fixes and user decisions, and ASSET_SOURCES.md for asset provenance. Character identities/technique names are canon-inspired; cooldowns, shield recharge, near-miss Black Flash, flying punches, domain safety gaps, transformation timing, scoring and independent victory routes are invented game rules.
