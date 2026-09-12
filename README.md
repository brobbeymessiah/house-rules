# House Rules

A browser-based, deliberately unfair game of tic-tac-toe.

Open `index.html` in a browser to play. No installation or build step is required.

## Files

- `index.html`: page structure, game controls, and incident report.
- `styles.css`: layout, colors, animations, and responsive styles.
- `engine.js`: winning-line detection and house turn planning, independent of the DOM.
- `game.js`: game state, rendering, turn playback, scoring, and event handlers.

Load `engine.js` before `game.js`; it exposes the `HouseRules` API used by the interface.
The engine also supports CommonJS through `module.exports`.

## Quick checks

```sh
node --check engine.js
node --check game.js
```
