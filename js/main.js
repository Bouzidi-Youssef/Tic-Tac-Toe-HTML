import { createInitialState } from "./state.js";
import { initUI } from "./ui.js";

const state = createInitialState();
initUI(state);
