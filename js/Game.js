/**
 * Game.js
 *
 * Main Game class with state management for Donkey Kong.
 * Implements issue #37: Game class with state management
 *
 * Features:
 * - Game states: MENU, PLAYING, PAUSED, GAMEOVER
 * - State transition methods (pause, resume, startGame, gameOver)
 * - Update and render based on current state
 * - Initialize and manage all game entities
 * - Menu and game over screen rendering
 */

class Game {
    /**
     * Create a new game instance
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {Renderer} renderer - The renderer instance
     */
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;

        // Current game state (issue #37)
        this.currentState = Constants.STATE_MENU;

        // GameState instance (manages gameplay entities)
        this.gameState = null;

        // Input handler for menu navigation
        this.inputHandler = new InputHandler();

        // High score (placeholder for future implementation)
        this.highScore = 0;
    }

    /**
     * Start a new game (issue #37)
     * Transitions from MENU to PLAYING state
     * @param {number} levelNumber - The level number to start (default: 1)
     */
    startGame(levelNumber = 1) {
        // Initialize GameState with level
        this.gameState = new GameState(this.canvas, this.renderer, levelNumber);

        // Transition to PLAYING state
        this.currentState = Constants.STATE_PLAYING;
    }

    /**
     * Pause the game (issue #37)
     * Transitions from PLAYING to PAUSED state
     */
    pause() {
        if (this.currentState === Constants.STATE_PLAYING) {
            this.currentState = Constants.STATE_PAUSED;
        }
    }

    /**
     * Resume the game (issue #37)
     * Transitions from PAUSED to PLAYING state
     */
    resume() {
        if (this.currentState === Constants.STATE_PAUSED) {
            this.currentState = Constants.STATE_PLAYING;
        }
    }

    /**
     * Toggle pause state (issue #37)
     */
    togglePause() {
        if (this.currentState === Constants.STATE_PLAYING) {
            this.pause();
        } else if (this.currentState === Constants.STATE_PAUSED) {
            this.resume();
        }
    }

    /**
     * Game over (issue #37)
     * Transitions to GAME_OVER state
     */
    gameOver() {
        if (this.currentState === Constants.STATE_PLAYING) {
            // Update high score if current score is higher
            if (this.gameState && this.gameState.score > this.highScore) {
                this.highScore = this.gameState.score;
            }

            this.currentState = Constants.STATE_GAME_OVER;
        }
    }

    /**
     * Return to menu (issue #37)
     * Transitions to MENU state
     */
    returnToMenu() {
        this.currentState = Constants.STATE_MENU;
        this.gameState = null; // Clean up game state
    }

    /**
     * Update game based on current state (issue #37)
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Handle input for state transitions
        this.handleInput();

        // Update based on current state
        switch (this.currentState) {
            case Constants.STATE_MENU:
                // Menu update logic (minimal for now)
                break;

            case Constants.STATE_PLAYING:
                // Update gameplay
                if (this.gameState) {
                    this.gameState.update(deltaTime);

                    // Check for game over condition (no lives left)
                    if (this.gameState.lives <= 0) {
                        this.gameOver();
                    }
                }
                break;

            case Constants.STATE_PAUSED:
                // No updates while paused
                break;

            case Constants.STATE_GAME_OVER:
                // Game over update logic (minimal for now)
                break;

            case Constants.STATE_LEVEL_COMPLETE:
                // Level complete update logic (future implementation)
                break;

            default:
                break;
        }
    }

    /**
     * Handle input for state transitions (issue #37)
     */
    handleInput() {
        // Handle menu input
        if (this.currentState === Constants.STATE_MENU) {
            // Press Space or Enter to start game
            if (this.inputHandler.isKeyPressed(' ') ||
                this.inputHandler.isKeyPressed('Enter')) {
                this.startGame(1);
            }
        }

        // Handle game over input
        if (this.currentState === Constants.STATE_GAME_OVER) {
            // Press Space or Enter to return to menu
            if (this.inputHandler.isKeyPressed(' ') ||
                this.inputHandler.isKeyPressed('Enter')) {
                this.returnToMenu();
            }
        }

        // Handle pause (P key or Escape)
        if (this.inputHandler.isKeyPressed('p') ||
            this.inputHandler.isKeyPressed('P') ||
            this.inputHandler.isKeyPressed('Escape')) {
            this.togglePause();
        }

        // Clear pressed keys for next frame
        this.inputHandler.clearPressed();
    }

    /**
     * Render game based on current state (issue #37)
     * @param {Renderer} renderer - The renderer instance
     */
    render(renderer) {
        // Render based on current state
        switch (this.currentState) {
            case Constants.STATE_MENU:
                this.renderMenu(renderer);
                break;

            case Constants.STATE_PLAYING:
                // Render gameplay
                if (this.gameState) {
                    this.gameState.render(renderer);
                }
                break;

            case Constants.STATE_PAUSED:
                // Render game in background
                if (this.gameState) {
                    this.gameState.render(renderer);
                }
                // Render pause overlay
                this.renderPauseOverlay(renderer);
                break;

            case Constants.STATE_GAME_OVER:
                this.renderGameOver(renderer);
                break;

            case Constants.STATE_LEVEL_COMPLETE:
                // Render level complete screen (future implementation)
                if (this.gameState) {
                    this.gameState.render(renderer);
                }
                this.renderLevelComplete(renderer);
                break;

            default:
                break;
        }
    }

    /**
     * Render menu screen (issue #37)
     * @param {Renderer} renderer - The renderer instance
     */
    renderMenu(renderer) {
        // Clear background
        renderer.clear(Constants.COLOR_BACKGROUND);

        // Title
        renderer.drawText(
            'DONKEY KONG',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 - 100,
            Constants.COLOR_TEXT,
            '48px monospace',
            'center'
        );

        // Instructions
        renderer.drawText(
            'PRESS SPACE TO START',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2,
            Constants.COLOR_TEXT,
            '24px monospace',
            'center'
        );

        // Controls
        renderer.drawText(
            'ARROW KEYS: Move | SPACE: Jump | P: Pause',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 + 60,
            Constants.COLOR_TEXT,
            '16px monospace',
            'center'
        );

        // High score
        if (this.highScore > 0) {
            renderer.drawText(
                `HIGH SCORE: ${this.highScore}`,
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2 + 120,
                Constants.COLOR_BARREL,
                '20px monospace',
                'center'
            );
        }
    }

    /**
     * Render pause overlay (issue #37)
     * @param {Renderer} renderer - The renderer instance
     */
    renderPauseOverlay(renderer) {
        // Semi-transparent overlay
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);

        // Paused text
        renderer.drawText(
            'PAUSED',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 - 40,
            Constants.COLOR_TEXT,
            '48px monospace',
            'center'
        );

        // Instructions
        renderer.drawText(
            'PRESS P TO RESUME',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 + 40,
            Constants.COLOR_TEXT,
            '20px monospace',
            'center'
        );
    }

    /**
     * Render game over screen (issue #37)
     * @param {Renderer} renderer - The renderer instance
     */
    renderGameOver(renderer) {
        // Clear background
        renderer.clear(Constants.COLOR_BACKGROUND);

        // Game Over text
        renderer.drawText(
            'GAME OVER',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 - 80,
            Constants.COLOR_TEXT,
            '48px monospace',
            'center'
        );

        // Final score
        if (this.gameState) {
            renderer.drawText(
                `FINAL SCORE: ${this.gameState.score}`,
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2,
                Constants.COLOR_TEXT,
                '24px monospace',
                'center'
            );
        }

        // High score
        if (this.highScore > 0) {
            renderer.drawText(
                `HIGH SCORE: ${this.highScore}`,
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2 + 60,
                Constants.COLOR_BARREL,
                '20px monospace',
                'center'
            );
        }

        // Instructions
        renderer.drawText(
            'PRESS SPACE TO CONTINUE',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 + 120,
            Constants.COLOR_TEXT,
            '20px monospace',
            'center'
        );
    }

    /**
     * Render level complete screen (issue #37)
     * @param {Renderer} renderer - The renderer instance
     */
    renderLevelComplete(renderer) {
        // Semi-transparent overlay
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);

        // Level Complete text
        renderer.drawText(
            'LEVEL COMPLETE!',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 - 40,
            Constants.COLOR_TEXT,
            '48px monospace',
            'center'
        );

        // Instructions (future: press space to continue to next level)
        renderer.drawText(
            'PRESS SPACE TO CONTINUE',
            Constants.CANVAS_WIDTH / 2,
            Constants.CANVAS_HEIGHT / 2 + 40,
            Constants.COLOR_TEXT,
            '20px monospace',
            'center'
        );
    }

    /**
     * Get current state (issue #37)
     * @returns {string} Current game state
     */
    getState() {
        return this.currentState;
    }

    /**
     * Reset the entire game (issue #37)
     */
    reset() {
        this.currentState = Constants.STATE_MENU;
        this.gameState = null;
    }
}
