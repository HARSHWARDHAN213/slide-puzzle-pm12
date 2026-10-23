# 15-Slide Puzzle Game with Pause & Resume

A responsive, lightweight sliding tile puzzle game built with pure vanilla HTML5, CSS3, and modern JavaScript, featuring full Pause/Resume state management, accessibility compliance, and automated QA verification.

![Game Status](https://img.shields.io/badge/status-active-brightgreen)
![Tests](https://img.shields.io/badge/tests-10%20passed-success)
![Vanilla JS](https://img.shields.io/badge/dependencies-zero-blue)

---

## 🎮 Game Overview

The 15-Slide Puzzle is arranged in a 4x4 grid of numbered square tiles from 1 to 15, with one empty space. The goal is to unscramble the tiles and order them sequentially from 1 to 15 (left to right, top to bottom), leaving the empty slot at the bottom-right corner.

### Key Features

1. **Interactive 4x4 Grid**: 15 sliding numbered tiles and 1 blank slot.
2. **Multiple Input Methods**:
   - **Click & Tap**: Tap any tile adjacent to the blank space to slide it over.
   - **Keyboard Navigation**: Use **Arrow Keys** (`↑`, `↓`, `←`, `→`) or **WASD** to slide tiles into the empty space.
3. **✨ NEW: Pause & Resume Feature**:
   - **One-Click Pause**: Dedicated "Pause" button in the toolbar freezes gameplay instantly.
   - **Keyboard Toggle**: Press <kbd>Escape</kbd> or <kbd>P</kbd> to toggle between paused and playing states.
   - **Strict Input Lock**: Tile clicks and keyboard navigation are completely blocked while paused.
   - **Timer Freeze with Zero Drift**: Stopwatch interval stops immediately; resumed time starts exactly from the frozen second.
   - **Visual Paused Overlay**: Frosted-glass backdrop displaying current moves, elapsed time, and a prominent "Resume Game" button.
   - **State Preservation**: Board configuration, move count, and elapsed time remain 100% intact.
4. **Move Counter**: Real-time tracking of total moves made.
5. **Digital Stopwatch**: Precise MM:SS format tracking elapsed solving time.
6. **100% Guaranteed Solvability**: Shuffled using random valid moves from the solved state (never produces mathematically unsolvable parity configurations).
7. **Victory Modal**: Congratulatory dialog with final score summary and instant "Play Again" button.
8. **Responsive & Mobile Friendly**: Scales seamlessly from 320px mobile screens to desktop monitors.

---

## 🚀 How to Run Locally

Because the core game is built with pure web standards, no compilation or bundler is required:

### Option 1: Direct File Opening
Simply double-click `slide-puzzle.html` or open it with your web browser:
```bash
# macOS
open slide-puzzle.html

# Linux
xdg-open slide-puzzle.html

# Windows
start slide-puzzle.html
```

### Option 2: Local HTTP Server (Recommended)
```bash
# Using Python 3
python3 -m http.server 8000

# or using Node npx
npx serve .
```
Navigate to `http://localhost:8000/slide-puzzle.html` in your browser.

---

## 🧪 How to Test the Feature

### Automated Test Suite (Node.js)
The repository includes an automated test suite verifying all 10 acceptance criteria:
```bash
node tests/test-puzzle.cjs
```
**Test coverage includes**:
- Board initialization and default empty slot.
- Pause button disabled before first move.
- Automatic timer and pause activation on first move.
- Pause overlay presentation and timer freeze.
- Interaction blocking (click and keyboard) while paused.
- Restoration of interactivity upon resume.
- Keyboard shortcuts (<kbd>Esc</kbd> / <kbd>P</kbd>).
- Idempotency during rapid click bursts.
- Clean reset from paused state.
- Victory state locking.

### In-Browser Interactive QA Runner
When running the development server (port 3000), click the **QA Tests** tab in the top navigation bar to execute the full suite directly inside the browser with live visual pass indicators!

---

## 📁 Repository Structure

```text
/
├── slide-puzzle.html          # Main standalone puzzle game (HTML, CSS, JS)
├── README.md                  # Project overview, instructions, and test guide
├── context.md                 # Technical context, verified facts, and architecture
├── PRD.md                     # Product Requirements Document for Pause/Resume
├── USER_STORIES.md            # INVEST-compliant user stories and acceptance criteria
├── IMPLEMENTATION_PLAN.md     # Engineering plan and regression mitigations
├── TEST_REPORT.md             # Detailed QA execution results (10/10 Passed)
├── tests/
│   └── test-puzzle.cjs        # Automated test suite
└── puzzle-game-repo/          # Mirror folder containing standalone assets
```

---

## 📋 Requirements & Limitations

- **Browser Compatibility**: Requires modern browser supporting ES6+, CSS Grid, and Flexbox (Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+).
- **Zero Runtime Dependencies**: No npm packages, frameworks, or external CDNs needed for `slide-puzzle.html`.
- **Session Lifespan**: Game state is stored in memory during active session; reloading the browser page starts a fresh shuffled puzzle.
