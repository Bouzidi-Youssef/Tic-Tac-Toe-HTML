export function createInitialState() {
  return {
    board: Array(9).fill(null),
    currentPlayer: "X",
    gameOver: false,
    winner: null,

    mode: "ai",            // "pvp" | "ai"
    difficulty: "easy",     // "random" | "easy" | "normal" | "hard"

    screen: "menu",

    session: null
  };
}
