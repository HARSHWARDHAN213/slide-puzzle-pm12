/**
 * Automated Test Suite for 15-Slide Puzzle Game
 * Tests slide-puzzle.html logic and DOM interactions using Node.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting 15-Slide Puzzle Automated Test Suite...\n');

// Read slide-puzzle.html
const htmlPath = path.resolve(__dirname, '../slide-puzzle.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Simple DOM Mock Environment
class ClassListMock {
  constructor() {
    this.classes = new Set();
  }
  add(cls) { this.classes.add(cls); }
  remove(cls) { this.classes.delete(cls); }
  contains(cls) { return this.classes.has(cls); }
}

class ElementMock {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.textContent = '';
    this.classList = new ClassListMock();
    this.style = {};
    this.attributes = {};
    this.disabled = false;
    this.children = [];
    this.eventListeners = {};
  }

  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  appendChild(child) { this.children.push(child); }
  removeChild(child) { this.children = this.children.filter(c => c !== child); }
  set innerHTML(val) {
    this.children = [];
    if (val === '') return;
  }
  get innerHTML() { return ''; }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(handler);
  }

  dispatchEvent(event, payload = {}) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(fn => fn(payload));
    }
  }

  click() {
    if (!this.disabled) {
      this.dispatchEvent('click', {});
    }
  }

  focus() {}
}

const elements = {};
function getElement(id, tag = 'div') {
  if (!elements[id]) {
    elements[id] = new ElementMock(id, tag);
  }
  return elements[id];
}

// Setup simulated window and document
const windowMock = {
  eventListeners: {},
  addEventListener(event, handler) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(handler);
  },
  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  },
  dispatchEvent(event, payload) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(fn => fn(payload));
    }
  }
};

const documentMock = {
  getElementById(id) {
    return getElement(id);
  },
  createElement(tag) {
    return new ElementMock('', tag);
  }
};

// Extract JS from slide-puzzle.html
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('❌ Failed to extract <script> from slide-puzzle.html');
  process.exit(1);
}

const scriptCode = scriptMatch[1];

// Execute script in mock sandbox
const vm = require('vm');
const sandbox = {
  window: windowMock,
  document: documentMock,
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (id) => clearInterval(id),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  console: console,
  Math: Math
};

vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

const game = sandbox.window.__puzzleGame;

if (!game) {
  console.error('❌ Game API __puzzleGame not found on window');
  process.exit(1);
}

// TEST CASES
const results = [];

function runTest(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ❌ FAIL: ${name}\n     ${err.message}`);
  }
}

// Test 1: Verify Initial Board Structure
runTest('Initial board has 16 cells and 1 empty slot', () => {
  const state = game.getState();
  assert.strictEqual(state.board.length, 16, 'Board should have exactly 16 cells');
  assert.strictEqual(state.board.filter(x => x === 0).length, 1, 'Board should have exactly 1 empty slot (0)');
  assert.strictEqual(state.moveCount, 0, 'Move count should initially be 0');
  assert.strictEqual(state.isPaused, false, 'Game should not start paused');
});

// Test 2: Pause Button is Disabled Before Game Starts
runTest('Pause button is disabled initially before any moves', () => {
  const btnPause = getElement('btnPause');
  assert.strictEqual(btnPause.disabled, true, 'Pause button must be disabled when game has not started');
});

// Test 3: Making a legal move starts game and enables Pause button
runTest('First legal move starts game and enables Pause button', () => {
  const state = game.getState();
  const emptyIdx = state.board.indexOf(0);
  const r = Math.floor(emptyIdx / 4);
  const c = emptyIdx % 4;

  let neighbor = -1;
  if (r > 0) neighbor = emptyIdx - 4;
  else if (r < 3) neighbor = emptyIdx + 4;
  else if (c > 0) neighbor = emptyIdx - 1;
  else neighbor = emptyIdx + 1;

  game.executeMove(neighbor, emptyIdx);

  const updatedState = game.getState();
  assert.strictEqual(updatedState.moveCount, 1, 'Move count should be 1');
  assert.strictEqual(updatedState.isGameActive, true, 'Game should now be active');

  const btnPause = getElement('btnPause');
  assert.strictEqual(btnPause.disabled, false, 'Pause button should be enabled after first move');
});

// Test 4: Pausing the Game Freezes State and Updates UI
runTest('Pausing game sets isPaused=true and shows pause overlay', () => {
  game.pauseGame();
  const state = game.getState();
  assert.strictEqual(state.isPaused, true, 'isPaused must be true');

  const pauseOverlay = getElement('pauseOverlay');
  assert.strictEqual(pauseOverlay.classList.contains('active'), true, 'pauseOverlay must have active class');

  const btnPauseLabel = getElement('btnPauseLabel');
  assert.strictEqual(btnPauseLabel.textContent, 'Resume', 'Button label should switch to Resume');
});

// Test 5: Moves are Blocked While Paused
runTest('Tile moves are strictly blocked while paused', () => {
  const stateBefore = game.getState();
  const emptyIdx = stateBefore.board.indexOf(0);
  const r = Math.floor(emptyIdx / 4);
  const neighbor = r > 0 ? emptyIdx - 4 : emptyIdx + 4;

  // Attempt move
  game.executeMove(neighbor, emptyIdx);

  const stateAfter = game.getState();
  assert.strictEqual(stateAfter.moveCount, stateBefore.moveCount, 'Move count should NOT increase while paused');
  assert.deepStrictEqual(stateAfter.board, stateBefore.board, 'Board configuration must remain identical');
});

// Test 6: Keyboard Moves are Blocked While Paused
runTest('Keyboard directional controls are blocked while paused', () => {
  const stateBefore = game.getState();

  // Dispatch arrow keydown
  windowMock.dispatchEvent('keydown', { key: 'ArrowUp', preventDefault: () => {} });
  windowMock.dispatchEvent('keydown', { key: 'w', preventDefault: () => {} });

  const stateAfter = game.getState();
  assert.strictEqual(stateAfter.moveCount, stateBefore.moveCount, 'Moves should remain unchanged on arrow keydown');
});

// Test 7: Resuming the Game Restores Interactivity
runTest('Resuming game restores interactivity and dismisses overlay', () => {
  game.resumeGame();
  const state = game.getState();
  assert.strictEqual(state.isPaused, false, 'isPaused must be false after resume');

  const pauseOverlay = getElement('pauseOverlay');
  assert.strictEqual(pauseOverlay.classList.contains('active'), false, 'pauseOverlay must NOT have active class');

  const btnPauseLabel = getElement('btnPauseLabel');
  assert.strictEqual(btnPauseLabel.textContent, 'Pause', 'Button label should return to Pause');
});

// Test 8: Keyboard Shortcut Toggle (Escape and P)
runTest('Escape and P keys toggle pause and resume safely', () => {
  let state = game.getState();
  assert.strictEqual(state.isPaused, false);

  // Press Escape -> Pauses
  windowMock.dispatchEvent('keydown', { key: 'Escape', preventDefault: () => {} });
  state = game.getState();
  assert.strictEqual(state.isPaused, true, 'Escape must pause active game');

  // Press P -> Resumes
  windowMock.dispatchEvent('keydown', { key: 'p', preventDefault: () => {} });
  state = game.getState();
  assert.strictEqual(state.isPaused, false, 'P must resume paused game');
});

// Test 9: Rapid Toggle and Idempotency
runTest('Rapid pause/resume calls do not corrupt state', () => {
  game.pauseGame();
  game.pauseGame(); // Duplicate call
  assert.strictEqual(game.getState().isPaused, true);

  game.resumeGame();
  game.resumeGame(); // Duplicate call
  assert.strictEqual(game.getState().isPaused, false);
});

// Test 10: Reset / Shuffle Clears Paused State Cleanly
runTest('Reset to solved clears pause state cleanly', () => {
  game.pauseGame();
  assert.strictEqual(game.getState().isPaused, true);

  game.resetToSolved();
  const state = game.getState();
  assert.strictEqual(state.isPaused, false, 'Pause state must be false after reset');
  assert.strictEqual(state.moveCount, 0, 'Moves must reset to 0');
  assert.strictEqual(state.isGameActive, false, 'Game should not be active');

  const pauseOverlay = getElement('pauseOverlay');
  assert.strictEqual(pauseOverlay.classList.contains('active'), false, 'Overlay must be inactive');
});

// Summary
console.log('\n📊 Test Execution Summary:');
const passedCount = results.filter(r => r.passed).length;
console.log(`Total Tests: ${results.length} | Passed: ${passedCount} | Failed: ${results.length - passedCount}`);

if (passedCount === results.length) {
  console.log('🎉 All automated tests passed successfully!\n');
  process.exit(0);
} else {
  console.error('❌ Some tests failed.');
  process.exit(1);
}
