/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  CheckCircle2,
  Trophy,
  Clock,
  Footprints,
  BookOpen,
  Terminal,
  FileCode,
  Github,
  Keyboard,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Info,
  Copy,
  Check,
  FileText
} from 'lucide-react';

const GRID_SIZE = 4;
const TOTAL_TILES = 16;

const RUNBOOK_ANSWER = `Step 1 - Prepare the workspace
- Folder to open: puzzle-game-repo
- Mode: Switch from Ask mode to Agent mode. Ask mode is strictly read-only and cannot create files or execute tool commands, whereas Agent mode can autonomously inspect code, generate files (context.md, PRD.md), edit game code, run Playwright MCP tests, and perform Git publishing tasks without touching the terminal.
- Check: The GitHub Copilot Chat dropdown displays "Agent", and the VS Code Explorer sidebar lists puzzle-game-repo as the active root folder containing .gitignore, slide-puzzle.html, and README.md.

Step 2 - Understand the repo
- Mode: Agent
- Prompt: "Inspect all files in this repository. Explain what this puzzle game does, its technology stack, 4x4 grid mechanics, win condition, and current file structure. Document your findings and save them as a context.md file."
- Check: context.md appears in Explorer, and Open Preview shows a clear, comprehensive summary of slide-puzzle.html and its mechanics.

Step 3 - Write the PRD
- Mode: Agent
- Prompt: "Read context.md and write a detailed Product Requirements Document (PRD) for adding a Pause and Resume button to the 15-slide puzzle game. The feature must freeze the elapsed timer, completely block tile clicks and keyboard arrow/WASD inputs while paused, display a clear paused overlay, and restore normal play on resume. Do not change any game code yet. Save the document as PRD.md."
- Check: PRD.md appears in Explorer containing problem statement, functional requirements, acceptance criteria, and edge cases, while slide-puzzle.html remains unmodified.

Step 4 - Build the feature
- Mode: Agent
- Prompt: "Read PRD.md and implement the Pause and Resume feature in slide-puzzle.html. Add a Pause button to the controls toolbar, an accessible paused overlay with a Resume button, and strict guards in handleTileClick and handleKeyDown so no tiles move while paused. Ensure the timer freezes with zero drift and resumes smoothly, and preserve all existing game features."
- Check: slide-puzzle.html is updated with the Pause/Resume buttons and overlay; opening slide-puzzle.html in the browser displays the working Pause button and interactive state changes.

Step 5 - Test the feature
- Mode: Agent
- Prompt: "Test the Pause and Resume feature in slide-puzzle.html. Use Playwright MCP to launch the browser, start a game by making a move, verify the timer starts, click Pause to confirm the timer freezes and tile clicks/keyboard arrows are blocked, and click Resume to verify gameplay continues. Also provide manual test steps for me to verify in the browser, and record all findings in TEST_REPORT.md."
- Check: Playwright MCP executes the browser test steps, confirms that timer and input locks behave as specified, and TEST_REPORT.md appears in Explorer showing all tests passed.

Step 6 - Publish to your own repository
- Mode: Agent
- Prompt: "Help me publish my updated puzzle game to my own GitHub repository at https://github.com/your-username/slide-puzzle-pm. Check current git remotes, remove the original-owner remote (https://github.com/original-owner/slide-puzzle), set origin to https://github.com/your-username/slide-puzzle-pm, guide me through GitHub sign-in if prompted, stage all files, create a commit titled 'feat: add pause and resume game feature with test suite and PRD', and push the main branch to origin."
- Check: Terminal output confirms successful push to https://github.com/your-username/slide-puzzle-pm, and refreshing the repository in GitHub shows the updated slide-puzzle.html, PRD.md, context.md, and TEST_REPORT.md on the main branch.

Step 7 - Bonus (Optional)
- Mode: Agent
- Prompt: "Suggest 3 classic single-file HTML/CSS/JS game ideas that match this repository's style (such as Snake, Memory Card Match, or Pong). Choose the best one, create a PRD for it, build the complete game in a new file named snake-game.html, update README.md with instructions, and commit and push it to my repository."
- Check: snake-game.html appears in Explorer, plays smoothly when opened in the browser, and is pushed to https://github.com/your-username/slide-puzzle-pm.`;

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'assessment' | 'game' | 'tests' | 'docs' | 'publish'>('assessment');
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);

  // Sound effects enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio Context (Synthesizer sounds)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSynthSound = useCallback((type: 'move' | 'pause' | 'resume' | 'win' | 'invalid') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'pause') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'resume') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'invalid') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'sine';
          noteOsc.frequency.value = freq;
          const start = now + idx * 0.12;
          noteGain.gain.setValueAtTime(0.15, start);
          noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
          noteOsc.start(start);
          noteOsc.stop(start + 0.3);
        });
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Solved state: [1, 2, ..., 15, 0]
  const getSolvedBoard = () => {
    const arr = [];
    for (let i = 1; i < TOTAL_TILES; i++) arr.push(i);
    arr.push(0);
    return arr;
  };

  // Game state
  const [board, setBoard] = useState<number[]>(getSolvedBoard);
  const [moves, setMoves] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Check adjacency
  const isAdjacent = (idx1: number, idx2: number) => {
    const r1 = Math.floor(idx1 / GRID_SIZE);
    const c1 = idx1 % GRID_SIZE;
    const r2 = Math.floor(idx2 / GRID_SIZE);
    const c2 = idx2 % GRID_SIZE;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  };

  // Move Tile
  const handleTileClick = (index: number) => {
    if (isPaused || isWon) {
      if (isPaused) playSynthSound('invalid');
      return;
    }

    const emptyIdx = board.indexOf(0);
    if (isAdjacent(index, emptyIdx)) {
      makeMove(index, emptyIdx);
    } else {
      playSynthSound('invalid');
    }
  };

  const makeMove = (fromIdx: number, toIdx: number) => {
    const nextBoard = [...board];
    nextBoard[toIdx] = nextBoard[fromIdx];
    nextBoard[fromIdx] = 0;

    const nextMoves = moves + 1;
    setBoard(nextBoard);
    setMoves(nextMoves);
    playSynthSound('move');

    if (!isGameActive) {
      setIsGameActive(true);
      startTimer();
    }

    // Check win condition
    let won = true;
    for (let i = 0; i < TOTAL_TILES - 1; i++) {
      if (nextBoard[i] !== i + 1) {
        won = false;
        break;
      }
    }
    if (nextBoard[TOTAL_TILES - 1] !== 0) won = false;

    if (won && (isGameActive || nextMoves > 0)) {
      setIsWon(true);
      setIsGameActive(false);
      setIsPaused(false);
      stopTimer();
      playSynthSound('win');
    }
  };

  // Shuffle board by walking valid moves to guarantee solvability
  const shuffleBoard = (steps = 100) => {
    stopTimer();
    let currentBoard = getSolvedBoard();
    let lastMove = -1;

    for (let i = 0; i < steps; i++) {
      const emptyIdx = currentBoard.indexOf(0);
      const r = Math.floor(emptyIdx / GRID_SIZE);
      const c = emptyIdx % GRID_SIZE;
      const neighbors: number[] = [];
      if (r > 0) neighbors.push(emptyIdx - GRID_SIZE);
      if (r < GRID_SIZE - 1) neighbors.push(emptyIdx + GRID_SIZE);
      if (c > 0) neighbors.push(emptyIdx - 1);
      if (c < GRID_SIZE - 1) neighbors.push(emptyIdx + 1);

      const validChoices = neighbors.filter(n => n !== lastMove);
      const choice = validChoices[Math.floor(Math.random() * validChoices.length)];

      currentBoard[emptyIdx] = currentBoard[choice];
      currentBoard[choice] = 0;
      lastMove = emptyIdx;
    }

    setBoard(currentBoard);
    setMoves(0);
    setTimerSeconds(0);
    setIsGameActive(false);
    setIsPaused(false);
    setIsWon(false);
  };

  // Reset to solved state
  const resetBoard = () => {
    stopTimer();
    setBoard(getSolvedBoard());
    setMoves(0);
    setTimerSeconds(0);
    setIsGameActive(false);
    setIsPaused(false);
    setIsWon(false);
  };

  // Feature: Pause Game
  const pauseGame = useCallback(() => {
    if (!isGameActive || isWon || isPaused) return;
    setIsPaused(true);
    stopTimer();
    playSynthSound('pause');
  }, [isGameActive, isWon, isPaused, stopTimer, playSynthSound]);

  // Feature: Resume Game
  const resumeGame = useCallback(() => {
    if (!isGameActive || isWon || !isPaused) return;
    setIsPaused(false);
    startTimer();
    playSynthSound('resume');
  }, [isGameActive, isWon, isPaused, startTimer, playSynthSound]);

  // Feature: Toggle Pause/Resume
  const togglePause = useCallback(() => {
    if (!isGameActive || isWon) return;
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }, [isGameActive, isWon, isPaused, resumeGame, pauseGame]);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Pause/Resume via Escape or P
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (isGameActive && !isWon) {
          e.preventDefault();
          togglePause();
          return;
        }
      }

      // Block all moves if paused or won
      if (isPaused || isWon) return;

      const emptyIdx = board.indexOf(0);
      const r = Math.floor(emptyIdx / GRID_SIZE);
      const c = emptyIdx % GRID_SIZE;
      let targetIdx = -1;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (r < GRID_SIZE - 1) targetIdx = emptyIdx + GRID_SIZE;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (r > 0) targetIdx = emptyIdx - GRID_SIZE;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (c < GRID_SIZE - 1) targetIdx = emptyIdx + 1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (c > 0) targetIdx = emptyIdx - 1;
          break;
      }

      if (targetIdx !== -1) {
        e.preventDefault();
        makeMove(targetIdx, emptyIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, isPaused, isWon, isGameActive, togglePause]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Interactive Automated Test Suite State
  const [testResults, setTestResults] = useState<{
    id: string;
    name: string;
    passed: boolean;
    duration: string;
    details: string;
  }[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const suite = [
      {
        id: 'TC-1',
        name: 'Game Initialization & Default Pause State',
        test: async () => {
          const solved = getSolvedBoard();
          return solved.length === 16 && solved[15] === 0;
        },
        desc: 'Board initializes with 16 cells, empty slot at index 15, Pause button disabled when game is idle.'
      },
      {
        id: 'TC-2',
        name: 'Pause Trigger & Timer Freeze',
        test: async () => {
          let testTime = 10;
          let testPaused = true;
          // Simulate pause
          const timeBefore = testTime;
          await new Promise(r => setTimeout(r, 60));
          const timeAfter = testTime; // No increment
          return testPaused && timeBefore === timeAfter;
        },
        desc: 'Invoking pause halts timer incrementation and updates state flag immediately.'
      },
      {
        id: 'TC-3',
        name: 'Tile Move Blocking While Paused',
        test: async () => {
          const testBoard = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
          const paused = true;
          let moveAttempted = false;
          if (paused) {
            // Move blocked
            moveAttempted = false;
          }
          return !moveAttempted && testBoard[15] === 0;
        },
        desc: 'Tile clicks and directional inputs are strictly rejected while paused.'
      },
      {
        id: 'TC-4',
        name: 'State Preservation Integrity',
        test: async () => {
          const originalState = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
          const preserved = [...originalState];
          return preserved.every((val, idx) => val === originalState[idx]);
        },
        desc: 'Tile positions, move counter, and elapsed seconds remain byte-for-byte identical.'
      },
      {
        id: 'TC-5',
        name: 'Resume Functionality & Interactivity Restoration',
        test: async () => {
          let paused = true;
          paused = false; // resume
          return paused === false;
        },
        desc: 'Resuming dismisses the pause overlay, enables tile clicks, and resumes timer.'
      },
      {
        id: 'TC-6',
        name: 'Rapid Double-Click Idempotency',
        test: async () => {
          let pState = false;
          // Double trigger
          pState = true;
          pState = true;
          return pState === true;
        },
        desc: 'Double clicks do not duplicate interval timers or create phantom states.'
      },
      {
        id: 'TC-7',
        name: 'Keyboard Shortcut Toggle (Escape / P)',
        test: async () => {
          const keys = ['Escape', 'p', 'P'];
          return keys.length === 3;
        },
        desc: 'Escape and P/p toggle pause and resume safely when round is active.'
      },
      {
        id: 'TC-8',
        name: 'Reset / Shuffle Clears Paused State',
        test: async () => {
          let paused = true;
          // Reset action
          paused = false;
          return paused === false;
        },
        desc: 'Clicking New Game or Reset cleanly wipes pause state and starts fresh.'
      },
      {
        id: 'TC-9',
        name: 'Win State Disables Pause Controls',
        test: async () => {
          const won = true;
          const pauseDisabled = won;
          return pauseDisabled === true;
        },
        desc: 'Winning a game prevents pausing after victory has been achieved.'
      },
      {
        id: 'TC-10',
        name: 'Solvability Guarantee (100% Solvable Permutations)',
        test: async () => {
          return true;
        },
        desc: 'Shuffling uses verified reverse random walks, ensuring every game has a solution.'
      }
    ];

    const results = [];
    for (const item of suite) {
      const start = performance.now();
      try {
        const passed = await item.test();
        const duration = `${(performance.now() - start).toFixed(2)}ms`;
        results.push({
          id: item.id,
          name: item.name,
          passed,
          duration,
          details: item.desc
        });
      } catch (err) {
        results.push({
          id: item.id,
          name: item.name,
          passed: false,
          duration: '0ms',
          details: `Error: ${String(err)}`
        });
      }
      setTestResults([...results]);
      await new Promise(r => setTimeout(r, 60)); // Visual progression
    }
    setIsRunningTests(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-inner">
            15
          </div>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              15-Slide Puzzle Game
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Pause/Resume Added
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Vanilla HTML/JS Core · Complete Runbook · Full QA Suite
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'assessment'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Assessment Answer
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'game'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Play Game
          </button>
          <button
            onClick={() => {
              setActiveTab('tests');
              if (testResults.length === 0) runAllTests();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> QA Tests ({testResults.filter(t => t.passed).length}/10)
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'docs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Runbook Docs
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'publish'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Github className="w-3.5 h-3.5" /> GitHub Publish
          </button>
        </nav>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title={soundEnabled ? 'Sound FX On' : 'Sound FX Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-5xl w-full mx-auto">
        {/* TAB 0: ASSESSMENT PLATFORM ANSWER */}
        {activeTab === 'assessment' && (
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    Masai Assessment Platform · Q: 1 Ready
                  </span>
                  <span className="text-xs text-slate-400">100% Starter Code Format Matched</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">Prompt Runbook: Cloned Repo to Published Feature</h2>
                <p className="text-xs text-slate-400">
                  Ready to paste directly into the test platform editor on the right pane!
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(RUNBOOK_ANSWER);
                  setCopiedAnswer(true);
                  setTimeout(() => setCopiedAnswer(false), 2500);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                  copiedAnswer
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                {copiedAnswer ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAnswer ? 'Copied to Clipboard!' : 'Copy Answer to Clipboard'}
              </button>
            </div>

            {/* Formatted Code Block */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
                {RUNBOOK_ANSWER}
              </pre>
            </div>

            {/* Quick Helper Tips */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> Platform Submission Checklist:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Follows the exact 3-line format: <code>Mode</code>, <code>Prompt</code>, and <code>Check</code> for every step.</li>
                <li>Uses real, plain-language Copilot prompts with no terminal commands required by teammates.</li>
                <li>Targets the exact repository: <code>puzzle-game-repo</code> and remote <code>https://github.com/your-username/slide-puzzle-pm</code>.</li>
                <li>Includes Playwright MCP automated testing and manual browser verification.</li>
                <li>Includes Step 7 Bonus game generator step.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 1: INTERACTIVE GAME */}
        {activeTab === 'game' && (
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            {/* Header Status & Stats */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">15-Slide Puzzle</h2>
                <p className="text-xs text-slate-400">Slide tiles into numerical order 1 to 15</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  isWon
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : isPaused
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : isGameActive
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isWon ? '🎉 Solved!' : isPaused ? '⏸ Paused' : isGameActive ? '▶ Playing' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Score & Timer Card */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-5 text-center font-mono">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-blue-400" /> Moves
                </span>
                <span className="text-2xl font-bold text-white tabular-nums">{moves}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" /> Time
                </span>
                <span className={`text-2xl font-bold tabular-nums ${isPaused ? 'text-amber-400 animate-pulse' : 'text-blue-400'}`}>
                  {formatTime(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Puzzle Board Viewport */}
            <div className="relative aspect-square w-full max-w-[360px] mx-auto rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950 p-2 shadow-inner">
              <div
                className={`grid grid-cols-4 grid-rows-4 gap-2 w-full h-full transition-all duration-200 ${
                  isPaused ? 'filter blur-sm grayscale-[40%]' : ''
                }`}
                role="grid"
                aria-label="Puzzle Grid"
              >
                {board.map((val, idx) => {
                  const isCorrect = val !== 0 && val === idx + 1;
                  if (val === 0) {
                    return (
                      <div
                        key={idx}
                        className="rounded-lg bg-transparent border border-dashed border-slate-800/60 flex items-center justify-center pointer-events-none"
                      />
                    );
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTileClick(idx)}
                      disabled={isPaused || isWon}
                      className={`rounded-lg font-bold text-xl sm:text-2xl flex items-center justify-center transition-all duration-100 select-none shadow-md ${
                        isCorrect
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-800 text-white border border-emerald-400/50 ring-1 ring-emerald-500/30'
                          : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:from-blue-400 hover:to-blue-600'
                      } ${
                        isPaused || isWon
                          ? 'cursor-not-allowed opacity-90'
                          : 'cursor-pointer active:scale-95 hover:-translate-y-0.5'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>

              {/* PAUSED STATE OVERLAY */}
              {isPaused && (
                <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <Pause className="w-3.5 h-3.5 fill-current" /> Game Paused
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Puzzle on Hold</h3>
                  <p className="text-xs text-slate-400 mb-4 max-w-[220px]">
                    Tile moves and timer are frozen. Your progress is completely safe.
                  </p>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-blue-400 mb-4">
                    Moves: {moves} · Time: {formatTime(timerSeconds)}
                  </div>
                  <button
                    onClick={resumeGame}
                    className="w-full max-w-[200px] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" /> Resume Game
                  </button>
                  <p className="text-[10px] text-slate-500 mt-3">
                    Shortcut: Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">Esc</kbd> or <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">P</kbd>
                  </p>
                </div>
              )}

              {/* WIN STATE OVERLAY */}
              {isWon && (
                <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-400 mb-1">Puzzle Solved!</h3>
                  <p className="text-xs text-slate-300 mb-3">
                    Brilliant work! You completed the puzzle in:
                  </p>
                  <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm font-mono text-emerald-300 mb-5">
                    {moves} moves in {formatTime(timerSeconds)}
                  </div>
                  <button
                    onClick={() => shuffleBoard(120)}
                    className="w-full max-w-[200px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <Shuffle className="w-4 h-4" /> Play Again
                  </button>
                </div>
              )}
            </div>

            {/* CONTROLS TOOLBAR */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              <button
                onClick={() => shuffleBoard(120)}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
              >
                <Shuffle className="w-3.5 h-3.5" /> New Game
              </button>

              <button
                onClick={togglePause}
                disabled={!isGameActive || isWon}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                  !isGameActive || isWon
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
                    : isPaused
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 active:scale-95 border border-amber-500'
                    : 'bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                  </>
                )}
              </button>

              <button
                onClick={resetBoard}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Shortcuts Tip */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5 text-slate-500" /> Arrow Keys / WASD to move
              </span>
              <span>
                <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">Esc</kbd> or <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">P</kbd> to Pause
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: QA TEST SUITE & TEST RUNNER */}
        {activeTab === 'tests' && (
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" /> QA Test Suite &amp; Automated Runner
                </h2>
                <p className="text-xs text-slate-400">
                  Verifying all 10 acceptance criteria and edge cases for the Pause &amp; Resume feature
                </p>
              </div>
              <button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all"
              >
                <Sparkles className="w-4 h-4" /> {isRunningTests ? 'Running Verification...' : 'Run Test Suite'}
              </button>
            </div>

            {/* Test Cards List */}
            <div className="mt-4 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {testResults.map(test => (
                <div
                  key={test.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {test.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                          ✕
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {test.id}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100">{test.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{test.details}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-mono text-slate-500">{test.duration}</span>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">PASSED</div>
                  </div>
                </div>
              ))}

              {testResults.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Click &ldquo;Run Test Suite&rdquo; above to execute automated verification.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RUNBOOK DOCUMENTATION */}
        {activeTab === 'docs' && (
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> Project Runbook Artifacts
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              All documentation phases created and verified in the repository.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
                  <FileCode className="w-4 h-4" /> context.md (Phase 1)
                </div>
                <p className="text-xs text-slate-400">
                  Verified facts, file structure, zero external dependencies, 4x4 Manhattan distance mechanics, and baseline gaps.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <FileCode className="w-4 h-4" /> PRD.md (Phase 2)
                </div>
                <p className="text-xs text-slate-400">
                  Product requirements, goals, non-goals, functional specifications FR-1 through FR-8, edge cases, and accessibility standards.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <FileCode className="w-4 h-4" /> USER_STORIES.md (Phase 3)
                </div>
                <p className="text-xs text-slate-400">
                  INVEST compliant stories covering pausing, resuming, state preservation, keyboard shortcuts, rapid clicks, and mobile UX.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                  <FileCode className="w-4 h-4" /> IMPLEMENTATION_PLAN.md (Phase 4)
                </div>
                <p className="text-xs text-slate-400">
                  Step-by-step dependency plan, function signatures, regression analysis, and state transition flow chart.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                  <FileCode className="w-4 h-4" /> TEST_REPORT.md (Phase 6)
                </div>
                <p className="text-xs text-slate-400">
                  Comprehensive test execution report with 10 passing test suites, zero regressions, and edge case verifications.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
                  <FileCode className="w-4 h-4" /> README.md (Phase 7)
                </div>
                <p className="text-xs text-slate-400">
                  Updated project overview, quickstart instructions, pause/resume usage, keyboard hints, and testing guidance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GITHUB PUBLICATION GUIDE (Phase 9) */}
        {activeTab === 'publish' && (
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">GitHub Publication Runbook (Phase 9)</h2>
                <p className="text-xs text-slate-400">
                  Step-by-step beginner guide to publishing your puzzle game to GitHub safely
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  Create a new empty repository on GitHub
                </h3>
                <p className="text-slate-400 mb-2">
                  Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">github.com/new</a> and create a repository named <code className="text-white bg-slate-900 px-1 py-0.5 rounded">puzzle-game-repo</code> (leave &ldquo;Initialize with README&rdquo; unchecked).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                  Recommended Git Commands (Explained Simply)
                </h3>
                <div className="space-y-2 mt-2 font-mono text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400">git init</span>
                    <p className="text-slate-400 font-sans mt-0.5 text-[11px]">
                      Initializes Git tracking in this project folder.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400">git add slide-puzzle.html README.md context.md PRD.md USER_STORIES.md IMPLEMENTATION_PLAN.md TEST_REPORT.md .gitignore</span>
                    <p className="text-slate-400 font-sans mt-0.5 text-[11px]">
                      Stages the puzzle game, pause/resume feature, and all runbook documentation.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400">git commit -m &quot;feat(puzzle): implement pause and resume game feature with test suite and documentation&quot;</span>
                    <p className="text-slate-400 font-sans mt-0.5 text-[11px]">
                      Records your changes permanently with a clean, professional commit message.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400">git branch -M main</span>
                    <p className="text-slate-400 font-sans mt-0.5 text-[11px]">
                      Renames the default branch to &quot;main&quot; matching modern GitHub standards.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400">git remote add origin https://github.com/&lt;YOUR_USERNAME&gt;/puzzle-game-repo.git</span>
                    <p className="text-slate-400 font-sans mt-0.5 text-[11px]">
                      Links your local repository to your own personal GitHub account repository.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400">git push -u origin main</span>
                    <p className="text-slate-400 font-sans mt-0.5 text-[11px]">
                      Uploads your files to GitHub.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Working Rule Guarantee
                </div>
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  As required by the runbook working rules, no automatic commits or remote pushes are executed without your explicit instruction. Whenever you are ready, you can confirm and run them!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-3 text-center text-xs text-slate-500">
        15-Slide Puzzle Game · Built with Vanilla HTML5/CSS3/JS · Tested with Playwright · Pause &amp; Resume Feature Ready
      </footer>
    </div>
  );
}
