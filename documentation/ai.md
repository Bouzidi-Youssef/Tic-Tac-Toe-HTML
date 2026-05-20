# `ai.js` — AI Engine

## Responsibility

`ai.js` contains the complete AI decision-making system. Given a board state and a difficulty level, it returns the index of the cell the AI should play. It has no side effects — it never modifies the real board permanently — and it exposes a single public function.

---

## Exports

| Function | Signature | Returns |
|---|---|---|
| `getAIMove` | `(board, difficulty, ai, human) → number \| null` | The cell index the AI has chosen to play. |

---

## Difficulty Levels

| Key | Strategy | Can be beaten? |
|---|---|---|
| `"random"` | Picks any empty cell uniformly at random | Yes — trivially |
| `"easy"` | Blocks the player if they are one move from winning; otherwise random | Yes |
| `"normal"` | Takes a winning move if available, then blocks, then random | Yes |
| `"hard"` | Full Minimax — evaluates every possible game tree | No |

---

## Entry Point

```js
export function getAIMove(board, difficulty, ai, human) {
  const available = getAvailableMoves(board);

  if (difficulty === "random") return randomMove(available);
  if (difficulty === "easy")   return easyMove(board, human, available);
  if (difficulty === "normal") return normalMove(board, ai, human, available);

  return minimaxRoot(board, ai, human); // "hard"
}
```

`ai` and `human` are the symbol strings (`"O"` and `"X"` respectively) passed in by `game.js`. The AI engine itself is symbol-agnostic — it works for any pair of symbols.

---

## Strategy Reference

### `"random"` — Pure Random

```js
function randomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}
```

Selects uniformly from all available moves. No board evaluation whatsoever.

---

### `"easy"` — Block Only

```js
function easyMove(board, human, moves) {
  for (let m of moves) {
    board[m] = human;
    if (checkWinner(board, human)) {
      board[m] = null;
      return m;  // block the win
    }
    board[m] = null;
  }
  return randomMove(moves);
}
```

Simulates placing the **human's** symbol in each empty cell. If doing so would give the human a win, that cell is blocked. If no immediate threat exists, it falls back to random.

This AI **never tries to win** — it only defends. A patient player can always steer it toward a loss.

**Simulation pattern:** the function temporarily writes to the board and immediately restores it (`board[m] = null`). This avoids allocating a cloned board on every check, keeping the function allocation-free.

---

### `"normal"` — Win Then Block

```js
function normalMove(board, ai, human, moves) {
  // 1. Take the win if it's there
  for (let m of moves) {
    board[m] = ai;
    if (checkWinner(board, ai)) { board[m] = null; return m; }
    board[m] = null;
  }

  // 2. Block the opponent
  for (let m of moves) {
    board[m] = human;
    if (checkWinner(board, human)) { board[m] = null; return m; }
    board[m] = null;
  }

  // 3. Fallback
  return randomMove(moves);
}
```

Applies two passes of single-move lookahead: take any immediate winning move, then block any immediate winning move for the opponent. Falls back to random if neither applies.

This is a classic greedy heuristic — it never plans more than one move ahead, so it can be outmaneuvered with a fork (two simultaneous threats).

---

### `"hard"` — Minimax

The hard AI uses the **Minimax algorithm**, a recursive game-tree search that assumes both players play optimally. It exhaustively evaluates every possible future game state and chooses the move that leads to the best guaranteed outcome.

#### Entry — `minimaxRoot`

```js
function minimaxRoot(board, ai, human) {
  let bestScore = -Infinity;
  let bestMove  = null;

  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;

    board[i] = ai;
    const score = minimax(board, 0, false, ai, human);
    board[i] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove  = i;
    }
  }

  return bestMove;
}
```

Tries every empty cell as the AI's first move and picks the one with the highest minimax score.

#### Recursive — `minimax`

```js
function minimax(board, depth, isMax, ai, human) {
  if (checkWinner(board, ai))    return 10 - depth;
  if (checkWinner(board, human)) return depth - 10;
  if (board.every(c => c))       return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = ai;
      best = Math.max(best, minimax(board, depth + 1, false, ai, human));
      board[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = human;
      best = Math.min(best, minimax(board, depth + 1, true, ai, human));
      board[i] = null;
    }
    return best;
  }
}
```

#### Scoring

| Terminal state | Score |
|---|---|
| AI wins | `10 - depth` (prefer faster wins) |
| Human wins | `depth - 10` (prefer slower losses) |
| Draw | `0` |

Incorporating `depth` into the score ensures the AI prefers wins that arrive sooner and losses that arrive later, rather than being indifferent between a win now and a win in four moves.

#### Game Tree Visualization

```
AI's turn (maximising)
├── Move 0 → minimax(depth=1, isMax=false)  → score: 0
├── Move 4 → minimax(depth=1, isMax=false)  → score: 10
└── Move 8 → minimax(depth=1, isMax=false)  → score: -8
         ↑
    bestMove = 4 (highest score)
```

#### Performance

Tic Tac Toe has at most 9! = 362,880 leaf nodes. Even without pruning, this is computed in microseconds on modern hardware. Alpha-beta pruning is not implemented but would not meaningfully change the user experience.

---

## Internal Helpers

### `getAvailableMoves(board)`

```js
function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) moves.push(i);
  }
  return moves;
}
```

Returns a list of all empty cell indices. A private duplicate of the one in `utils.js`, kept here to make `ai.js` self-contained and avoid a circular dependency with `utils.js`.

---

## Dependencies

| Import | From |
|---|---|
| `checkWinner` | `./game.js` |

---

## Related

- [Game Logic](./game.md) — calls `getAIMove` from `runAITurn`
- [State](./state.md) — `difficulty` and `session` fields consumed here
- [Utilities](./utils.md) — parallel pure-function utilities
