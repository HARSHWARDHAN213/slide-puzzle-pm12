# Implementation Plan: Pause and Resume Game Feature

## 1. Overview
This implementation plan outlines the exact changes required in the existing repository to introduce the Pause and Resume feature cleanly, reliably, and without regressions.

---

## 2. Files Requiring Changes
1. **`slide-puzzle.html`**:
   - Primary single-file application containing the HTML structure, CSS rules, and JavaScript state logic.
2. **`puzzle-game-repo/slide-puzzle.html`**:
   - Mirrored repository copy kept in sync.
3. **`src/App.tsx`**:
   - The React live development interface hosted on port 3000 to allow live testing, visual validation, automated test running, and previewing the puzzle game.

---

## 3. Existing Functions and Event Handlers Involved in `slide-puzzle.html`

| Existing Function / Handler | Role in Existing Code | Required Modifications |
|---|---|---|
| `let isGameActive = false` | Tracks whether the timer has started | Retain; add `let isPaused = false`. |
| `startTimer()` | Starts interval timer ticking every 1000ms | Ensure timer can resume smoothly without double-ticking. |
| `stopTimer()` | Clears interval timer | Used when pausing, winning, or resetting. |
| `resetTimer()` | Clears interval and resets seconds to 0 | Must not reset seconds during pause; only on new game / reset. |
| `handleTileClick(index)` | Handles user clicking a tile | Guard with `if (isPaused || isWon) return;`. |
| `handleKeyDown(e)` | Handles arrow keys and WASD moves | Guard with `if (isPaused || isWon) return;` for moves; add toggle logic for `Escape` and `P`. |
| `executeMove(from, to)` | Swaps tiles, increments move count, checks win | Ensure it cannot be triggered directly while paused. |
| `shuffleBoard()` | Shuffles board, resets stats and timer | Ensure `isPaused` is reset to `false` and pause overlay is removed. |
| `resetToSolved()` | Resets board to solved state | Ensure `isPaused` is reset to `false`, pause button disabled until first move. |
| `checkWinCondition()` | Detects victory state | Disable pause button upon win so victory cannot be paused. |

---

## 4. Pause-State Management Architecture

```text
               [Initial / Solved State]
               (isGameActive=false, isPaused=false, PauseBtn disabled)
                         │
                         │ First move or start
                         ▼
               [Playing State] ◄────────────────┐
               (isGameActive=true,              │
                isPaused=false,                 │
                Timer running,                  │ Resume action
                PauseBtn="Pause")               │ (Btn / Overlay / Esc / P)
                         │                      │
            Pause action │                      │
       (Btn / Esc / P)   ▼                      │
               [Paused State] ──────────────────┘
               (isGameActive=true,
                isPaused=true,
                Timer frozen,
                Tiles blocked,
                PauseOverlay visible,
                PauseBtn="Resume")
```

### State Variables:
- `let isPaused = false;`: Boolean flag representing whether gameplay is paused.
- `let isGameActive = false;`: Existing flag indicating an active round.
- `let isWon = false;`: Existing flag indicating victory.

### New Core Functions to Add:
1. `pauseGame()`:
   - Sets `isPaused = true`.
   - Calls `stopTimer()`.
   - Updates `btnPause` UI (text: "Resume", class active, icon/label).
   - Updates pause overlay stats: `pauseStats.textContent = ...`.
   - Activates `#pauseOverlay` with CSS class `active`.
   - Focuses the "Resume" button on the overlay for immediate keyboard accessibility.
2. `resumeGame()`:
   - Sets `isPaused = false`.
   - Hides `#pauseOverlay`.
   - Updates `btnPause` UI (text: "Pause").
   - Restarts timer via `startTimer()`.
3. `togglePause()`:
   - If not active or if won, return early.
   - If `isPaused`, call `resumeGame()`. Otherwise, call `pauseGame()`.
4. `updatePauseButtonState()`:
   - Disables Pause button if `!isGameActive || isWon`. Enables when `isGameActive && !isWon`.

---

## 5. UI and Accessibility Changes
1. **Control Toolbar**:
   - Add `<button id="btnPause" class="btn" type="button" disabled aria-label="Pause game">⏸ Pause</button>` between "New Game" and "Reset".
2. **Paused Overlay Dialog**:
   - Add markup inside `.board-container`:
   ```html
   <div id="pauseOverlay" class="pause-overlay" role="dialog" aria-modal="true" aria-labelledby="pauseHeading">
     <div class="pause-badge">⏸ PAUSED</div>
     <h2 id="pauseHeading">Game Paused</h2>
     <p id="pauseStats">Moves: 0 · Time: 00:00</p>
     <button id="btnOverlayResume" class="btn btn-primary" type="button">Resume Game</button>
   </div>
   ```
3. **CSS Styling**:
   - `.pause-overlay`: Absolute positioning over board container with frosted dark backdrop (`backdrop-filter: blur(6px)`), centered flex layout, smooth transition.
   - Distinctive pause badge with soft amber / cyan accent for maximum clarity.
   - Mobile media query ensuring min-height 48px touch targets and full responsiveness down to 320px viewport width.
4. **Keyboard Accessibility**:
   - `Escape` and `P` / `p` key support.
   - Focus management on modal open/close.

---

## 6. Implementation Tasks in Dependency Order

1. **Step 1 (HTML Markup)**:
   - Add the Pause button in the controls section.
   - Add the `#pauseOverlay` dialog structure inside `.board-container`.
2. **Step 2 (CSS Styling)**:
   - Add styling rules for `.pause-overlay`, `.pause-overlay.active`, `.pause-badge`, and `#btnPause:disabled`.
   - Ensure responsive touch constraints and smooth opacity/transform transitions.
3. **Step 3 (JavaScript State & Logic)**:
   - Add `isPaused` state variable.
   - Implement `pauseGame()`, `resumeGame()`, `togglePause()`, and `updatePauseButtonState()`.
   - Update `handleTileClick(index)` and `handleKeyDown(e)` with pause guards.
   - Hook up event listeners: `btnPause.click`, `btnOverlayResume.click`, and `Escape`/`P` in `handleKeyDown`.
   - Update `shuffleBoard()` and `resetToSolved()` to cleanly reset pause states.
   - Update `checkWinCondition()` to disable pause on victory.
4. **Step 4 (React Live Applet Integration)**:
   - Implement the full interactive slide puzzle game in `src/App.tsx` matching `slide-puzzle.html`, with dedicated tabs:
     - 🎮 Live Interactive Puzzle Game
     - 🧪 Automated & Interactive Test Suite
     - 📋 Runbook Documentation (PRD, Stories, Context, Git Guide)
5. **Step 5 (Automated Test Suite Creation)**:
   - Create Node-based Playwright / DOM verification test script to programmatically test `slide-puzzle.html`.
   - Verify every acceptance criterion across all 7 user stories.

---

## 7. Potential Regressions & Mitigation

| Potential Regression | Risk Level | Mitigation Strategy |
|---|---|---|
| Timer ticks faster or duplicates after repeated pause/resume | High | Always check `if (timerInterval) return;` before starting a new interval in `startTimer()`. |
| Elapsed seconds reset or drift | Medium | Keep `timerSeconds` intact; `stopTimer()` only clears the interval; `resetTimer()` is strictly reserved for New Game and Reset. |
| Tile slides while visually obscured by pause overlay | High | Strict early exit `if (isPaused) return;` in both `handleTileClick` and `handleKeyDown`. Additionally, `#pauseOverlay` receives `pointer-events: auto` to block underlying pointer events. |
| Inability to restart after pausing | Low | Ensure `btnShuffle` ("New Game") and `btnReset` explicitly clear `isPaused`, remove `.active` class from the overlay, and reset `btnPause`. |

---

## 8. Required Tests to Perform
- [x] Initial load verification (Pause button disabled, timer 00:00, moves 0).
- [x] Pause activation on click and keydown (`Escape` / `P`).
- [x] Timer freeze verification (verify time does not change while paused).
- [x] Move blocking verification (click adjacent tile, press arrow keys; assert 0 moves).
- [x] Board state preservation (tile positions unchanged).
- [x] Resume verification via both toolbar button and overlay button.
- [x] Post-resume gameplay (move increments by 1, timer continues ticking).
- [x] Repeated rapid pause/resume cycles (no timer duplication or memory leak).
- [x] Reset / Shuffle from paused state (clean reset).
- [x] Win state verification (pause disabled upon win).
