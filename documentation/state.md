# `state.js` — State

## Responsibility

`state.js` defines the shape of the entire application's state and exposes a factory function that produces a clean initial value. Every other module receives this object and reads from or writes to it directly.

---

## Source

```js
export function createInitialState() {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    gameOver: false,
    winner: null,

    mode: "pvp",          // "pvp" | "ai"
    difficulty: "easy",   // "random" | "easy" | "normal" | "hard"

    screen: "menu",

    session: null
  };
}
```

---

## State Shape

### Board

| Field | Type | Description |
|---|---|---|
| `board` | `Array<null \| "X" \| "O">` | 9-element flat array representing the 3×3 grid. `null` means the cell is empty. |
| `currentPlayer` | `"X" \| "O"` | Whose turn it is. Always starts as `"X"`. |
| `gameOver` | `boolean` | `true` once a winner is found or all cells are filled. |
| `winner` | `null \| "X" \| "O" \| "draw"` | Set when the game ends. `"draw"` when the board is full with no winner. |

### Board Cell Index Layout

```
 0 │ 1 │ 2
───┼───┼───
 3 │ 4 │ 5
───┼───┼───
 6 │ 7 │ 8
```

### Settings

| Field | Type | Values | Description |
|---|---|---|---|
| `mode` | `string` | `"pvp"`, `"ai"` | Whether the second player is human or AI. |
| `difficulty` | `string` | `"random"`, `"easy"`, `"normal"`, `"hard"` | AI difficulty. Only relevant when `mode === "ai"`. |

### Navigation

| Field | Type | Values | Description |
|---|---|---|---|
| `screen` | `string` | `"menu"`, `"settings"`, `"game"` | Which screen is currently rendered. |

### Session

| Field | Type | Description |
|---|---|---|
| `session` | `null \| { mode, difficulty }` | Snapshot of the settings active for the current game. Populated by `startGameSession()` in `game.js`. Kept separate so changing settings mid-game doesn't affect an in-progress session. |

---

## Why a Factory Function?

`createInitialState` returns a **new object every time it is called**. This matters for the retry flow: `startGameSession()` in `game.js` resets the board fields in-place on the existing state object rather than replacing it, but if a full reset were ever needed (e.g. navigating back to the menu after changing settings), calling this factory again guarantees a clean slate with no lingering values.

---

## Mutation Policy

State is treated as a **single mutable object** passed by reference. Modules mutate it directly — there is no `setState`, no reducer, no immutability enforcement. The convention is:

- `game.js` owns mutations to `board`, `currentPlayer`, `gameOver`, `winner`, and `session`.
- `ui.js` owns mutations to `screen`, `mode`, and `difficulty` (via settings toggles).
- No module should store a copy of state fields — always read from the object directly so the value is current.

---

## Related

- [Entrypoint](./main.md) — calls `createInitialState`
- [Game Logic](./game.md) — resets board fields via `startGameSession`
- [UI & Rendering](./ui.md) — reads `screen`, `mode`, `difficulty`; writes `screen`
