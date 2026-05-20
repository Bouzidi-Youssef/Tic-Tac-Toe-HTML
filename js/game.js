import { getAIMove } from "./ai.js";

/* =========================
   GAME SESSION INIT
========================= */

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

/* =========================
   MOVE SYSTEM
========================= */

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

  // AI TURN TRIGGER
  if (
    state.session?.mode === "ai" &&
    state.currentPlayer === "O" &&
    !state.gameOver
  ) {
    runAITurn(state);
  }

  return true;
}

/* =========================
   AI TURN HANDLER
========================= */

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

/* =========================
   WIN CHECK
========================= */

export function checkWinner(board, player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  return winPatterns.some(p =>
    p.every(i => board[i] === player)
  );
}
