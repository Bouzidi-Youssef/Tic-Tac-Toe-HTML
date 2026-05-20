# `game.js` — Game Logic

## Responsibility

`game.js` is the core rules engine. It owns everything that happens after a player (human or AI) decides on a move: placing symbols, detecting wins and draws, switching turns, and delegating to the AI when needed.

---

## Exports

| Function | Signature | Description |
|---|---|---|
| `startGameSession` | `(state) → void` | Resets the board and locks in the current settings for a new game. |
| `makeMove` | `(state, index) → boolean` | Attempts to place the current player's symbol at `index`. Returns `true` on success. |
| `checkWinner` | `(board, player) → boolean` | Returns `true` if `player` has a winning line on `board`. |

---

## `startGameSession(state)`

Called by `ui.js` whenever the player starts a new game (from the menu or via the Space retry shortcut).

```js
export function startGameSession(state) {
  state.board = Array(9).fill(null);
  state.currentPlayer = "X";
  state.gameOver = false;
  state.winner = null;

  state.session = {
    mode: state.mode,
    difficulty: state.difficulty
  };
}
```

**What it does:**

- Clears the board back to 9 `null` values.
- Resets turn and game-over flags.
- Takes a **snapshot** of `state.mode` and `state.difficulty` into `state.session`.

**Why snapshot into `session`?**

Settings (`mode`, `difficulty`) can be changed by the user at any time via the Settings screen. Storing a copy in `session` at game-start means an in-progress game is unaffected if the user navigates to settings and changes the difficulty mid-match.

---

## `makeMove(state, index)`

The single entry point for all move placement — both human clicks and AI turns flow through here.

```js
export function makeMove(state, index) {
  if (state.board[index] || state.gameOver) return false;

  state.board[index] = state.currentPlayer;

  if (checkWinner(state.board, state.currentPlayer)) {
    state.gameOver = true;
    state.winner = state.currentPlayer;
    return true;
  }

  if (state.board.every(c => c !== null)) {
    state.gameOver = true;
    state.winner = "draw";
    return true;
  }

  state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";

  if (
    state.session?.mode === "ai" &&
    state.currentPlayer === "O" &&
    !state.gameOver
  ) {
    runAITurn(state);
  }

  return true;
}
```

**Step-by-step flow:**

```
makeMove(state, index)
│
├─ Guard: cell already filled or game over? → return false
│
├─ Place current player's symbol at index
│
├─ Check win → if yes: set gameOver + winner, return true
│
├─ Check draw (board full) → if yes: set gameOver + "draw", return true
│
├─ Switch currentPlayer (X ↔ O)
│
└─ If mode is "ai" and it's now O's turn → runAITurn(state)
```

**Return value:** `true` means the move was accepted and state has been updated. `false` means the move was rejected (cell taken or game already over) — `ui.js` uses this to skip re-rendering.

---

## `runAITurn(state)` *(internal)*

Handles the AI's response move immediately after the human plays. This is synchronous — there is no delay or animation wait between the human move and the AI move at the state level (visual timing is handled by the browser's natural repaint cycle).

```js
function runAITurn(state) {
  const move = getAIMove(state.board, state.session.difficulty, "O", "X");

  if (move == null) return;

  state.board[move] = "O";

  if (checkWinner(state.board, "O")) {
    state.gameOver = true;
    state.winner = "O";
    return;
  }

  if (state.board.every(c => c !== null)) {
    state.gameOver = true;
    state.winner = "draw";
    return;
  }

  state.currentPlayer = "X";
}
```

**Note:** The AI always plays as `"O"`, the human always plays as `"X"`. This is a fixed convention — there is no side-selection feature.

---

## `checkWinner(board, player)`

A pure function — given a board and a player symbol, returns whether that player has completed any winning line.

```js
export function checkWinner(board, player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],  // rows
    [0,3,6],[1,4,7],[2,5,8],  // columns
    [0,4,8],[2,4,6]           // diagonals
  ];

  return winPatterns.some(p =>
    p.every(i => board[i] === player)
  );
}
```

All 8 possible winning lines are encoded as index triples. The function checks whether every cell in any triple belongs to `player`.

This function is also imported by `ai.js` for use in the minimax algorithm.

---

## Win Patterns Reference

```
Rows          Columns       Diagonals
─────────     ─────────     ─────────
0  1  2       0  ·  ·       0  ·  ·
·  ·  ·       3  ·  ·       ·  4  ·
·  ·  ·       6  ·  ·       ·  ·  8

·  ·  ·       ·  1  ·       ·  ·  2
3  4  5       ·  4  ·       ·  4  ·
·  ·  ·       ·  7  ·       6  ·  ·

·  ·  ·       ·  ·  2
·  ·  ·       ·  ·  5
6  7  8       ·  ·  8
```

---

## Dependencies

| Import | From |
|---|---|
| `getAIMove` | `./ai.js` |

---

## Related

- [State](./state.md) — the object mutated here
- [AI Engine](./ai.md) — consulted by `runAITurn`
- [UI & Rendering](./ui.md) — calls `makeMove` and `startGameSession`
