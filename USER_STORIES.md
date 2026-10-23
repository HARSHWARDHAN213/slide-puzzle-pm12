# User Stories: Pause & Resume Feature (INVEST Compliant)

This document specifies the user stories and detailed acceptance criteria for the Pause & Resume capability in the 15-Slide Puzzle Game.

All stories adhere strictly to the **INVEST** principles:
- **I**ndependent: Can be implemented and verified without cyclical dependencies.
- **N**egotiable: Clear requirements with flexible technical execution.
- **V**aluable: Direct quality-of-life value delivered to players.
- **E**stimable: Clear scope with precise acceptance criteria.
- **S**mall: Broken down into focused functional units.
- **T**estable: Every condition is verifiable through automated and manual test scenarios.

---

## Story 1: Pausing an Active Game
**User Story**:
> As a player,
> I want to pause the game at any moment during play,
> So that I can handle interruptions without having my elapsed time or puzzle state ruined.

### Acceptance Criteria:
- **AC 1.1**: Given a game is actively in progress (timer running, move count > 0), when the player clicks the "Pause" button, then the game enters the paused state, the timer stops incrementing immediately, and the button label changes to "Resume".
- **AC 1.2**: Given an active game, when the player presses the `Escape` key or `P` key on the keyboard, then the game enters the paused state identically to clicking the Pause button.
- **AC 1.3**: Given a game has not yet started (0 moves made, timer at 00:00), then the Pause button is visually and functionally disabled with `disabled` attribute and appropriate ARIA attributes.

---

## Story 2: Displaying Paused State Overlay
**User Story**:
> As a player,
> I want to see a clear visual overlay when the game is paused,
> So that I know with certainty that my timer is stopped and my puzzle is safely on hold.

### Acceptance Criteria:
- **AC 2.1**: Given the game transitions to the paused state, when the overlay renders, then it displays the title "⏸️ Game Paused", the current move count, the frozen elapsed time, and an obvious "Resume Game" button.
- **AC 2.2**: Given the paused overlay is visible, when viewing the screen, then the overlay covers the puzzle board and clearly signals inactivity.
- **AC 2.3**: Given screen readers or keyboard navigation are active, when the overlay appears, then it has `role="dialog"`, `aria-modal="true"`, and the "Resume Game" button receives immediate focus.

---

## Story 3: Preventing Puzzle Moves While Paused
**User Story**:
> As a player,
> I want puzzle tile clicks, taps, and keyboard movements to be completely blocked while paused,
> So that accidental touches or keypresses do not alter my board configuration or increment my move count.

### Acceptance Criteria:
- **AC 3.1**: Given the game is paused, when the player clicks or taps on any tile adjacent to the empty slot, then no tile slides, the empty slot position remains unchanged, and the move counter does not increment.
- **AC 3.2**: Given the game is paused, when the player presses directional keyboard controls (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `W`, `A`, `S`, `D`), then default scrolling is prevented and no tiles are moved.
- **AC 3.3**: Given the game is paused, when the player clicks on empty spaces or non-adjacent tiles, then no action occurs.

---

## Story 4: Resuming Normal Gameplay
**User Story**:
> As a player,
> I want to resume gameplay easily from the paused state,
> So that I can continue solving my puzzle from the exact point where I left off.

### Acceptance Criteria:
- **AC 4.1**: Given the game is paused, when the player clicks the "Resume Game" button on the overlay, then the overlay disappears, the toolbar button switches to "Pause", tiles become interactive again, and the timer resumes ticking.
- **AC 4.2**: Given the game is paused, when the player clicks the "Resume" button in the control toolbar, then gameplay resumes identically.
- **AC 4.3**: Given the game is paused, when the player presses `Escape` or `P`, then gameplay resumes seamlessly.
- **AC 4.4**: Given the game is resumed, when the player makes their next legal move, then the move counter increments by exactly 1 from its pre-pause value.

---

## Story 5: Preserving Puzzle State
**User Story**:
> As a player,
> I want the board configuration, move count, and elapsed time to be strictly preserved during pause,
> So that pausing never disadvantages me or alters my puzzle progress.

### Acceptance Criteria:
- **AC 5.1**: Given a board configuration `[t0, t1, ..., t15]`, move count `M`, and elapsed seconds `S`, when the game is paused for 30 seconds and then resumed, then the board configuration is still strictly `[t0, t1, ..., t15]`, move count is `M`, and elapsed seconds restarts from `S`.
- **AC 5.2**: Given any number of repeated pause/resume cycles, then no tile drift, missing tiles, duplicate numbers, or timer leaps occur.

---

## Story 6: Handling Edge Cases & Repeated Interactions
**User Story**:
> As a player,
> I want the game to handle rapid or unexpected actions gracefully,
> So that the game never freezes, glitches, or enters an inconsistent state.

### Acceptance Criteria:
- **AC 6.1**: Given an active game, when the player rapidly double-clicks or spam-clicks the Pause/Resume button, then the game cleanly settles in the expected state without duplicate timer intervals or memory leaks.
- **AC 6.2**: Given the game is paused, when the player clicks "New Game" or "Reset", then the paused state is cleanly cleared, the overlay is dismissed, and a fresh game board is loaded.
- **AC 6.3**: Given a player solves the puzzle and the win dialog appears, then the Pause button is disabled, preventing pausing after victory.

---

## Story 7: Responsive Mobile Usability
**User Story**:
> As a mobile phone or tablet player,
> I want the pause controls and overlay to fit comfortably on small touch screens,
> So that I can pause and resume smoothly without zooming or misclicking.

### Acceptance Criteria:
- **AC 7.1**: Given a mobile viewport width between 320px and 768px, when viewing the game, then the Pause/Resume buttons and Paused overlay fit within the viewport without horizontal overflow.
- **AC 7.2**: Given a touch device, when tapping the Pause or Resume buttons, then touch targets have a minimum touch area of 44x44px.
