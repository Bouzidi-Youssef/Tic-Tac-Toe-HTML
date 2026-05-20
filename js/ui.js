import { makeMove, startGameSession } from "./game.js";

export function initUI(state) {
  const app = document.querySelector("#app");
  app.innerHTML = `<div class="app"></div>`;
  render(state, app.querySelector(".app"));
}

function render(state, root) {
  root.innerHTML = "";
  if (state.screen === "menu")     renderMenu(state, root);
  if (state.screen === "settings") renderSettings(state, root);
  if (state.screen === "game")     renderGame(state, root);
}

/* =========================
   MENU
========================= */
function renderMenu(state, root) {
  root.innerHTML = `
    <div class="menu">
      <h1>Tic Tac Toe</h1>
      <button class="menu-btn" id="play">Play</button>
      <button class="menu-btn" id="settings">Settings</button>
    </div>
  `;
  root.querySelector("#play").onclick = () => {
    startGameSession(state);
    state.screen = "game";
    render(state, root);
  };
  root.querySelector("#settings").onclick = () => {
    state.screen = "settings";
    render(state, root);
  };
}

/* =========================
   SETTINGS
========================= */
function makeToggle(options, current, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "toggle";

  const prev = document.createElement("button");
  prev.className = "toggle-arrow";
  prev.textContent = "◄";

  const val = document.createElement("span");
  val.className = "toggle-value";
  val.textContent = current;

  const next = document.createElement("button");
  next.className = "toggle-arrow";
  next.textContent = "►";

  let idx = options.indexOf(current);

  prev.onclick = () => {
    idx = (idx - 1 + options.length) % options.length;
    val.textContent = options[idx];
    onChange(options[idx]);
  };
  next.onclick = () => {
    idx = (idx + 1) % options.length;
    val.textContent = options[idx];
    onChange(options[idx]);
  };

  wrap.appendChild(prev);
  wrap.appendChild(val);
  wrap.appendChild(next);
  return wrap;
}

// Map internal difficulty keys to display labels and back
const DIFF_OPTIONS = ["Random", "Easy", "Normal", "Hard"];
const DIFF_TO_KEY  = { Random: "random", Easy: "easy", Normal: "normal", Hard: "hard" };
const KEY_TO_DIFF  = { random: "Random", easy: "Easy", normal: "Normal", hard: "Hard" };

function renderSettings(state, root) {
  const settings = document.createElement("div");
  settings.className = "settings";

  const title = document.createElement("h2");
  title.textContent = "Settings";
  settings.appendChild(title);

  const rows = document.createElement("div");
  rows.className = "settings-rows";

  // Mode row
  const modeRow = document.createElement("div");
  modeRow.className = "settings-row";
  const modeLabel = document.createElement("span");
  modeLabel.className = "settings-label";
  modeLabel.textContent = "Mode";
  const modeToggle = makeToggle(
    ["PvP", "AI"],
    state.mode === "pvp" ? "PvP" : "AI",
    v => { state.mode = v === "PvP" ? "pvp" : "ai"; }
  );
  modeRow.appendChild(modeLabel);
  modeRow.appendChild(modeToggle);
  rows.appendChild(modeRow);

  // Difficulty row
  const diffRow = document.createElement("div");
  diffRow.className = "settings-row";
  const diffLabel = document.createElement("span");
  diffLabel.className = "settings-label";
  diffLabel.textContent = "Difficulty";
  const diffCurrent = KEY_TO_DIFF[state.difficulty] ?? "Easy";
  const diffToggle = makeToggle(
    DIFF_OPTIONS,
    diffCurrent,
    v => { state.difficulty = DIFF_TO_KEY[v]; }
  );
  diffRow.appendChild(diffLabel);
  diffRow.appendChild(diffToggle);
  rows.appendChild(diffRow);

  settings.appendChild(rows);

  const back = document.createElement("button");
  back.className = "back-btn";
  back.textContent = "Back";
  back.onclick = () => {
    state.screen = "menu";
    render(state, root);
  };
  settings.appendChild(back);

  root.appendChild(settings);
}

/* =========================
   GAME
========================= */
function renderGame(state, root) {
  const existing = root.querySelector(".game");
  if (existing) {
    const cells = Array.from(existing.querySelectorAll(".cell"));
    const status = existing.querySelector(".status");
    update(state, cells, status);
    return;
  }

  root.innerHTML = `
    <div class="game">
      <h1>Tic Tac Toe</h1>
      <div class="status"></div>
      <div class="board"></div>
      <button id="menu">Menu</button>
    </div>
  `;

  const board  = root.querySelector(".board");
  const status = root.querySelector(".status");
  const cells  = [];

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.onclick = () => {
      const ok = makeMove(state, i);
      if (!ok) return;
      renderGame(state, root);
    };
    board.appendChild(cell);
    cells.push(cell);
  }

  // Space-to-retry listener — cleaned up when leaving the game screen
  function onSpace(e) {
    if (e.code !== "Space" || !state.gameOver) return;
    e.preventDefault();
    retry();
  }

  function retry() {
    window.removeEventListener("keydown", onSpace);
    startGameSession(state);
    // Full re-render so a fresh listener is attached
    root.innerHTML = "";
    renderGame(state, root);
  }

  window.addEventListener("keydown", onSpace);

  root.querySelector("#menu").onclick = () => {
    window.removeEventListener("keydown", onSpace);
    state.screen = "menu";
    render(state, root);
  };

  update(state, cells, status);
}

function update(state, cells, status) {
  for (let i = 0; i < 9; i++) {
    const v = state.board[i];
    const c = cells[i];
    c.dataset.symbol = v || "";
    c.classList.remove("cell--x", "cell--o");
    if (v === "X") c.classList.add("cell--x");
    if (v === "O") c.classList.add("cell--o");
    c.disabled = !!v || state.gameOver;
  }
  if (state.gameOver) {
    const result = state.winner === "draw" ? "Draw!" : `${state.winner} wins!`;
    status.textContent = `${result}  ·  [space] to retry`;
  } else {
    status.textContent = `${state.currentPlayer}'s turn`;
  }
}
