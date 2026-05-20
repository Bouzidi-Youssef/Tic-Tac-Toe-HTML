# `main.js` — Entrypoint

## Responsibility

`main.js` is the single bootstrap file for the application. It has exactly one job: wire the two top-level concerns together — the **state** and the **UI** — then hand control over to the rendering layer.

---

## Source

```js
import { createInitialState } from "./state.js";
import { initUI } from "./ui.js";

const state = createInitialState();
initUI(state);
```

---

## What Happens at Startup

1. `createInitialState()` is called, returning a fresh plain-object state tree.
2. The state object is passed to `initUI()`, which mounts the app into `#app` and renders the menu screen.
3. From this point on, `main.js` is done. All subsequent logic is driven by user interaction inside `ui.js`.

---

## Design Notes

**Why is this file so small?**

Intentionally. `main.js` is a composition root — its only job is to create the two things that need to exist at startup and connect them. Keeping it thin means:

- The startup sequence is obvious at a glance.
- Neither `state.js` nor `ui.js` needs to know about each other.
- Testing either module in isolation requires no knowledge of this file.

**State is passed by reference**

`state` is a plain object. JavaScript passes objects by reference, so every module that receives `state` is reading and writing the same object in memory. There is no copy, no clone, no pub/sub system — mutations made inside `game.js` are immediately visible to `ui.js` on the next render call.

---

## Dependencies

| Import | From |
|---|---|
| `createInitialState` | `./state.js` |
| `initUI` | `./ui.js` |

---

## Related

- [State](./state.md) — the object created here
- [UI & Rendering](./ui.md) — the layer initialised here
