# `utils.js` — Utilities

## Responsibility

`utils.js` is a collection of **pure, stateless board utility functions**. Every function here takes a board (and optionally a player symbol) as arguments and returns a value — none of them read from or write to the application state object. They have no side effects and no dependencies on any other module.

---

## Exports

| Function | Signature | Returns |
|---|---|---|
| `checkWinner` | `(board) → string \| null` | The winning player's symbol, or `null` if no winner yet. |
| `isDraw` | `(board) → boolean` | `true` if the board is full and has no winner. |
| `getAvailableMoves` | `(board) → number[]` | Array of indices for all empty cells. |
| `cloneBoard` | `(board) → Array` | A shallow copy of the board array. |

---

## Source

```js
export function checkWinner(board) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6],
  ];

  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

export function isDraw(board) {
  return board.every(cell => cell !== null) && !checkWinner(board);
}

export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

export function cloneBoard(board) {
  return board.slice();
}
```

---

## Function Reference

### `checkWinner(board)`

Scans all 8 winning lines and returns the symbol (`"X"` or `"O"`) of the player who completed one, or `null` if no line is complete.

```js
const board = ["X","X","X", null,null,null, null,null,null];
checkWinner(board); // → "X"
```

**Note on the two `checkWinner` functions**

`utils.js` and `game.js` both export a function named `checkWinner`, but with different signatures:

| Module | Signature | Returns |
|---|---|---|
| `utils.js` | `checkWinner(board)` | `"X"` \| `"O"` \| `null` |
| `game.js` | `checkWinner(board, player)` | `boolean` |

`game.js`'s version is the one used at runtime by the move system and by `ai.js`. `utils.js`'s version returns the winner's symbol directly, making it more convenient for any feature that needs to display or compare the winner without already knowing which player to check.

---

### `isDraw(board)`

Returns `true` only when every cell is filled **and** there is no winner. Both conditions must hold — a full board with a winner is not a draw.

```js
const full = ["X","O","X", "O","X","O", "O","X","O"];
isDraw(full); // → true (no winner, board full)
```

---

### `getAvailableMoves(board)`

Returns the list of cell indices that are still `null`. Used by the AI to enumerate candidate moves.

```js
const board = ["X", null, "O", null, "X", null, null, null, "O"];
getAvailableMoves(board); // → [1, 3, 5, 6, 7]
```

---

### `cloneBoard(board)`

Returns a shallow copy of the board array via `Array.prototype.slice`. Since the board only contains primitives (`null`, `"X"`, `"O"`), a shallow copy is a complete copy.

```js
const copy = cloneBoard(board);
copy[0] = "X"; // original board is unaffected
```

This is useful when an algorithm needs to simulate moves without mutating the real board. The minimax implementation in `ai.js` currently mutates and restores in place (avoiding allocation overhead), but `cloneBoard` is available for any future approach that prefers immutable simulation.

---

## Design Notes

These utilities are intentionally decoupled from the state object. Keeping them as pure functions makes them:

- **Testable in isolation** — pass in any array, inspect the output.
- **Reusable** — usable by both the game engine and the AI without either knowing about the other.
- **Predictable** — the same input always produces the same output.

---

## Related

- [Game Logic](./game.md) — uses its own `checkWinner(board, player)` variant
- [AI Engine](./ai.md) — uses `getAvailableMoves` internally
