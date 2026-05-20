import { checkWinner } from "./game.js";

/* =========================
   ENTRY POINT
========================= */

export function getAIMove(board, difficulty, ai, human) {
  const available = getAvailableMoves(board);

  if (difficulty === "random") {
    return randomMove(available);
  }

  if (difficulty === "easy") {
    return easyMove(board, human, available);
  }

  if (difficulty === "normal") {
    return normalMove(board, ai, human, available);
  }

  // "hard" — minimax
  return minimaxRoot(board, ai, human);
}

/* =========================
   RANDOM — pure random
========================= */

function randomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

/* =========================
   EASY — block only, never tries to win
========================= */

function easyMove(board, human, moves) {
  for (let m of moves) {
    board[m] = human;
    if (checkWinner(board, human)) {
      board[m] = null;
      return m;
    }
    board[m] = null;
  }

  return randomMove(moves);
}

/* =========================
   NORMAL — win first, then block
========================= */

function normalMove(board, ai, human, moves) {
  // 1. Take winning move
  for (let m of moves) {
    board[m] = ai;
    if (checkWinner(board, ai)) {
      board[m] = null;
      return m;
    }
    board[m] = null;
  }

  // 2. Block opponent
  for (let m of moves) {
    board[m] = human;
    if (checkWinner(board, human)) {
      board[m] = null;
      return m;
    }
    board[m] = null;
  }

  return randomMove(moves);
}

/* =========================
   HARD — minimax (unbeatable)
========================= */

function minimaxRoot(board, ai, human) {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;

    board[i] = ai;
    const score = minimax(board, 0, false, ai, human);
    board[i] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}

function minimax(board, depth, isMax, ai, human) {
  if (checkWinner(board, ai)) return 10 - depth;
  if (checkWinner(board, human)) return depth - 10;
  if (board.every(c => c)) return 0;

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

/* =========================
   HELPERS
========================= */

function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) moves.push(i);
  }
  return moves;
}
