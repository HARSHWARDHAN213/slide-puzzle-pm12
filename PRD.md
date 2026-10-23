# Product Requirements Document (PRD)

## Feature Title: Pause and Resume Game for 15-Slide Puzzle

---

### 1. Problem Statement
In the current slide puzzle game, once a player starts sliding tiles, the elapsed timer runs without pause until the puzzle is solved or reset. Players often experience real-world interruptions (such as incoming calls, messages, or stepping away) or simply need to temporarily rest. Without a Pause/Resume mechanism, the timer keeps ticking, which inflates their recorded completion time, ruins score accuracy, and induces unnecessary frustration. Furthermore, players cannot inspect or freeze the board state without risking inadvertent clicks or keypresses.

---

### 2. Goals & Success Metrics
#### Goals:
1. Provide an intuitive, one-click mechanism to pause active gameplay.
2. Freeze the game timer immediately upon pausing and maintain the exact elapsed time with zero drift.
3. Unconditionally block all puzzle tile interactions (mouse clicks, touch taps, and directional keyboard keys) while paused.
4. Display a clean, non-intrusive yet distinct paused overlay indicating the game is frozen and offering a prominent "Resume Game" action.
5. Provide a seamless resume mechanism that restores full interactivity and continues the timer from the exact second it was paused.
6. Support both desktop and mobile layouts with responsive sizing and touch-friendly targets.
7. Maintain 100% backward compatibility with existing features (Shuffle, Reset, Timer, Moves, Win State).

#### Non-Goals:
- Storing paused game state across browser tab closures or reloads (persistent localStorage is out of scope for this milestone).
- Introducing an online leaderboard or multi-player pause synchronization.
- Changing puzzle mechanics, tile count, or core solving rules.

---

### 3. User Requirements
- **As a casual player**, I want to pause my puzzle game when interrupted so that my elapsed time and concentration are not penalized.
- **As a speedrunner**, I want the timer to freeze immediately and resume accurately so that my time reflects only active solving time.
- **As a mobile/touch user**, I want large, accessible tap targets for Pause and Resume so that I can operate them effortlessly with one hand.
- **As a keyboard user**, I want standard keyboard controls (e.g., `Escape` or `P` key) to toggle pause and resume quickly.

---

### 4. Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| **FR-1** | **Pause Control** | A dedicated "Pause" button must be visible in the controls toolbar whenever a game is in progress. |
| **FR-2** | **Timer Freeze** | When paused, the timer interval must be cleared immediately. The displayed time must remain static. |
| **FR-3** | **Input Blocking** | When paused, all tile click events, touch events, and keyboard movements (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `W`, `A`, `S`, `D`) must be completely ignored. |
| **FR-4** | **Paused State Indicator & Overlay** | A visual overlay must appear over the puzzle board displaying "Game Paused" along with a prominent "Resume" button and a summary of current progress (Moves & Time). |
| **FR-5** | **Resume Control** | Clicking the "Resume" button (or the toolbar toggle button, or pressing `Escape`/`P`) must dismiss the paused overlay and resume gameplay. |
| **FR-6** | **State Preservation** | The exact tile positions, move counter, and elapsed seconds must remain identical between pause and resume. |
| **FR-7** | **Dynamic Button Labeling** | The toolbar button toggles between "Pause" (when active) and "Resume" (when paused). It is disabled if the game has not started or is already won. |
| **FR-8** | **Keyboard Shortcut** | Pressing the `Escape` key or `p`/`P` toggles between Paused and Playing states when a game is in progress. |

---

### 5. UI/UX Behavior & Wireframe Design

#### A. Controls Toolbar:
- Added a `Pause` / `Resume` button adjacent to `New Game` and `Reset`:
  - `[ New Game ]  [ Pause ]  [ Reset ]`
- Button state transitions:
  - **Before game starts (initial/reset)**: `Pause` button disabled or idle (cannot pause an unstarted game).
  - **Playing**: Button displays `Pause` (with pause icon / styling).
  - **Paused**: Button displays `Resume` (with play/resume icon / styling).
  - **Won**: `Pause` button disabled.

#### B. Paused Overlay:
- Centered over `.board-container` with semi-transparent frosted backdrop (`rgba(15, 23, 42, 0.85)`).
- Content:
  - Title: `⏸️ Game Paused`
  - Subtitle: `Your puzzle state and timer are safely on hold.`
  - Stats chip: `Moves: X · Time: MM:SS`
  - Primary CTA: `Resume Game` button (accent blue, prominent, minimum 48px touch height).
- Accessibility: Has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="pauseHeading"`.

---

### 6. Edge Cases & Handling

1. **Rapid Double Clicks on Pause/Resume**:
   - The state toggle must be idempotent. Triggering pause while already paused is a no-op; triggering resume while already resumed is a no-op.
2. **Keyboard presses while Paused**:
   - Directional keys must be blocked. The `Escape` key or `P` key will cleanly unpause.
3. **Pausing before any move is made**:
   - The Pause button is disabled until the player begins the game (makes first move or starts timer), preventing meaningless 0-second paused states.
4. **Pausing after game is won**:
   - When the victory overlay is active, Pause is disabled.
5. **Clicking Shuffle or Reset while Paused**:
   - Clicking `New Game` or `Reset` cleanly resets the pause state, dismisses the paused overlay, and initializes a fresh board.
6. **Window Blur / Tab Switch (Enhancement)**:
   - When the player switches tabs, the game can gracefully remain paused or allow the player to resume without desync.

---

### 7. Accessibility (a11y)
- Buttons have clear text and accessible names (`aria-label="Pause game"`, `aria-label="Resume game"`).
- Paused overlay traps focus or provides prominent focusable Resume button.
- Color contrast meets WCAG 2.1 AA standards (high-contrast text against dark backgrounds).
- Screen readers receive appropriate announcements via ARIA live regions and dialog roles.

---

### 8. Acceptance Criteria (Given-When-Then)

- **AC-1 (Pause from Playing)**:
  - **Given** an active game with 12 moves and 00:24 elapsed,
  - **When** the user clicks "Pause" or presses `Escape`,
  - **Then** the timer stops at 00:24, the paused overlay appears, and the button changes to "Resume".

- **AC-2 (Block Moves while Paused)**:
  - **Given** the game is paused,
  - **When** the user clicks on any tile or presses arrow keys / WASD,
  - **Then** zero tiles move, move count remains unchanged, and board layout is intact.

- **AC-3 (Resume Gameplay)**:
  - **Given** the game is paused at 00:24 with 12 moves,
  - **When** the user clicks "Resume Game",
  - **Then** the overlay closes, the toolbar button returns to "Pause", tiles become clickable again, and the timer resumes ticking from 00:25 after 1 second.

- **AC-4 (Reset / New Game from Paused State)**:
  - **Given** the game is paused,
  - **When** the user clicks "New Game",
  - **Then** the pause overlay disappears, moves reset to 0, timer resets to 00:00, and a new solvable board is rendered.

---

### 9. Testing Plan
1. **Unit / Logic Checks**: Verify state variables (`isPaused`, `isGameActive`, `isWon`) and transition functions (`pauseGame()`, `resumeGame()`, `togglePause()`).
2. **DOM / UI Checks**: Verify button visibility, overlay display, text changes, and focus states.
3. **Interaction Tests**: Click adjacent tiles while paused; trigger keyboard arrow keys; verify move count and board array are unchanged.
4. **Timing Accuracy**: Assert that elapsed seconds remain constant during pause and resume smoothly.
5. **Responsive & Mobile Viewport**: Verify controls and overlay on viewport widths from 320px to 1280px.
