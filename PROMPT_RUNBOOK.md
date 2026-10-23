Step 1 - Prepare the workspace
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
- Check: snake-game.html appears in Explorer, plays smoothly when opened in the browser, and is pushed to https://github.com/your-username/slide-puzzle-pm.
