# `ui.js` — UI & Rendering

## Responsibility

`ui.js` is the entire presentation layer. It owns the DOM — building screens, wiring event listeners, and keeping the visual output in sync with state. It never contains game rules; it only reads state and calls into `game.js` to effect changes.

---

## Exports

| Function | Signature | Description |
|---|---|---|
| `initUI` | `(state) → void` | Mounts the app shell into `#app` and renders the initial screen. |

---

## Screen Architecture

The app has three screens, each rendered by a dedicated function. Navigation is managed by writing to `state.screen` and calling `render()`.

```
state.screen
    │
    ├── "menu"      → renderMenu(state, root)
    ├── "settings"  → renderSettings(state, root)
    └── "game"      → renderGame(state, root)
```

### `render(state, root)`

The central dispatcher. Clears the root element and delegates to the correct screen renderer based on `state.screen`.

```js
function render(state, root) {
  root.innerHTML = "";
  if (state.screen === "menu")     renderMenu(state, root);
  if (state.screen === "settings") renderSettings(state, root);
  if (state.screen === "game")     renderGame(state, root);
}
```

---

## Menu Screen — `renderMenu`

Renders a title and two navigation buttons: **Play** and **Settings**.

**Play** calls `startGameSession(state)` to initialise a fresh board, sets `state.screen = "game"`, and calls `render()`.

**Settings** simply sets `state.screen = "settings"` and calls `render()`.

---

## Settings Screen — `renderSettings`

Renders two toggle rows: **Mode** and **Difficulty**.

### The Toggle Component — `makeToggle`

```js
function makeToggle(options, current, onChange) { ... }
```

A reusable inline component. Produces a `◄ VALUE ►` control where clicking the arrows cycles through a provided `options` array. On each change, the `onChange` callback is invoked with the new value.

| Argument | Type | Description |
|---|---|---|
| `options` | `string[]` | The ordered list of values to cycle through. |
| `current` | `string` | The currently selected value (must be in `options`). |
| `onChange` | `(value: string) → void` | Called with the new value when the user navigates. |

### Difficulty Mapping

Display labels and internal state keys are kept separate via lookup tables:

```js
const DIFF_OPTIONS = ["Random", "Easy", "Normal", "Hard"];
const DIFF_TO_KEY  = { Random: "random", Easy: "easy", Normal: "normal", Hard: "hard" };
const KEY_TO_DIFF  = { random: "Random", easy: "Easy", normal: "Normal", hard: "Hard" };
```

This means the UI can show `"Hard"` while `state.difficulty` holds `"hard"` — the two representations never bleed into each other.

---

## Game Screen — `renderGame`

The most complex renderer. Handles both initial construction and incremental updates.

### Partial Update Strategy

```js
function renderGame(state, root) {
  const existing = root.querySelector(".game");
  if (existing) {
    // Game shell already exists — only update cells and status
    const cells = Array.from(existing.querySelectorAll(".cell"));
    const status = existing.querySelector(".status");
    update(state, cells, status);
    return;
  }
  // First render — build the full DOM structure
  ...
}
```

On the **first call**, the full game DOM (board, status, buttons) is built and event listeners are attached. On **subsequent calls** (after each move), the existing shell is detected and only cell classes and the status text are updated. This avoids re-creating the board on every move, which would disrupt the pop-in animation.

### Board Construction

Nine `<button class="cell">` elements are created programmatically. Each one calls `makeMove(state, i)` on click, then calls `renderGame(state, root)` to update the view.

### Space-to-Retry

A `keydown` listener is attached to `window` when the game screen is first rendered:

```js
function onSpace(e) {
  if (e.code !== "Space" || !state.gameOver) return;
  e.preventDefault();
  retry();
}

window.addEventListener("keydown", onSpace);
```

The listener is **guarded** — it only acts when `state.gameOver` is `true`, so it is harmless during play. It is **removed** (`window.removeEventListener`) in two places:

1. When the user clicks **Menu** — before navigating away.
2. When `retry()` is called — before re-rendering, so a fresh listener is attached for the new game.

This prevents listener accumulation across multiple games.

### `retry()`

```js
function retry() {
  window.removeEventListener("keydown", onSpace);
  startGameSession(state);
  root.innerHTML = "";
  renderGame(state, root);
}
```

Removes the old listener, resets the board via `startGameSession` (preserving `mode` and `difficulty`), then performs a full re-render of the game screen so a new listener is attached for the fresh game.

---

## Update Function — `update(state, cells, status)`

Synchronises the DOM to the current state after every move. Called both during initial render and after the partial-update path.

```js
function update(state, cells, status) {
  for (let i = 0; i < 9; i++) {
    const v = state.board[i];
    const c = cells[i];
    c.dataset.symbol = v || "";          // drives ::after { content } animation
    c.classList.remove("cell--x", "cell--o");
    if (v === "X") c.classList.add("cell--x");
    if (v === "O") c.classList.add("cell--o");
    c.disabled = !!v || state.gameOver;  // prevent interaction on filled/finished cells
  }

  if (state.gameOver) {
    const result = state.winner === "draw" ? "Draw!" : `${state.winner} wins!`;
    status.textContent = `${result}  ·  [space] to retry`;
  } else {
    status.textContent = `${state.currentPlayer}'s turn`;
  }
}
```

**Symbol rendering via CSS:** cell symbols are not rendered as child text nodes. Instead, `data-symbol` is set on the button and CSS uses `content: attr(data-symbol)` in the `::after` pseudo-element. This means the pop-in animation (`@keyframes popIn`) triggers on the pseudo-element without any risk of the border layout being disrupted by DOM changes.

---

## Event Listener Lifecycle

| Listener | Attached | Removed |
|---|---|---|
| Cell `onclick` | Once, during game DOM construction | Never (removed with the DOM when screen changes) |
| `#menu` button `onclick` | Once, during game DOM construction | Never (removed with the DOM) |
| `window keydown` (Space) | Once, during game DOM construction | On Menu click or on retry |

---

## Dependencies

| Import | From |
|---|---|
| `makeMove` | `./game.js` |
| `startGameSession` | `./game.js` |

---

## Related

- [Entrypoint](./main.md) — calls `initUI`
- [Game Logic](./game.md) — `makeMove` and `startGameSession` called here
- [State](./state.md) — all fields consumed and some written here
