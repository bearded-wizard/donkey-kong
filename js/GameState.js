/**
 * GameState.js
 *
 * Manages the game state, entities, and game loop logic.
 * Coordinates updates and rendering for all game objects.
 *
 * Implements issue #32: Level loading system
 * - Loads levels by number using Level.loadLevel()
 * - Player spawns at level-specific start position
 * - Level transitions support (loadLevel method)
 * - Extensible for multiple levels
 */

class GameState {
    /**
     * Create a new game state
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {Renderer} renderer - The renderer instance
     * @param {number} levelNumber - The level number to load (default: 1)
     */
    constructor(canvas, renderer, levelNumber = 1) {
        this.canvas = canvas;
        this.renderer = renderer;

        // Game state
        this.currentState = Constants.STATE_PLAYING;

        // Initialize input handler
        this.inputHandler = new InputHandler();

        // Current level number
        this.currentLevelNumber = levelNumber;

        // Initialize level using Level.loadLevel() factory method (issue #32)
        this.level = Level.loadLevel(this.currentLevelNumber);

        // Get player start position from level (issue #32)
        const playerStart = this.level.getPlayerStartPosition();

        // Initialize player at level start position (issue #32)
        this.player = new Player(
            playerStart.x,
            playerStart.y,
            this.inputHandler
        );

        // Initialize DonkeyKong entity (issue #28)
        this.donkeyKong = new DonkeyKong(Constants.DK_X, Constants.DK_Y);

        // Initialize Princess entity (issue #28)
        const princessPos = this.level.getPrincessPosition();
        this.princess = new Princess(princessPos.x, princessPos.y);

        // Initialize barrels array (issue #28)
        this.barrels = [];

        // Score and lives (placeholders)
        this.score = 0;
        this.lives = Constants.PLAYER_STARTING_LIVES;
    }

    /**
     * Load a level by number (issue #32)
     * Allows transitioning between different levels
     * @param {number} levelNumber - The level number to load
     */
    loadLevel(levelNumber) {
        // Store the new level number
        this.currentLevelNumber = levelNumber;

        // Load the new level using Level.loadLevel() factory method
        this.level = Level.loadLevel(levelNumber);

        // Get player start position from level
        const playerStart = this.level.getPlayerStartPosition();

        // Reset player to level start position
        this.player.reset(playerStart.x, playerStart.y);

        // Reset DonkeyKong entity (issue #28)
        this.donkeyKong = new DonkeyKong(Constants.DK_X, Constants.DK_Y);

        // Reset Princess entity (issue #28)
        const princessPos = this.level.getPrincessPosition();
        this.princess = new Princess(princessPos.x, princessPos.y);

        // Clear barrels array (issue #28)
        this.barrels = [];

        // Reset game state
        this.currentState = Constants.STATE_PLAYING;
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        if (this.currentState !== Constants.STATE_PLAYING) {
            return;
        }

        // Update player
        this.player.update(
            deltaTime,
            this.level.getPlatforms(),
            this.level.getLadders()
        );

        // Update DonkeyKong and handle barrel spawning (issue #28)
        const shouldSpawnBarrel = this.donkeyKong.update(deltaTime);
        if (shouldSpawnBarrel && this.barrels.length < Constants.MAX_BARRELS) {
            this.spawnBarrel();
        }

        // Update Princess (issue #28)
        this.princess.update(deltaTime);

        // Update all barrels (issue #28)
        for (const barrel of this.barrels) {
            barrel.update(deltaTime, this.level.getPlatforms());
        }

        // Remove dead barrels (issue #28)
        this.barrels = this.barrels.filter(barrel => barrel.isActive());

        // Check player-barrel collisions (issue #25)
        this.checkPlayerBarrelCollisions();

        // Check win condition (issue #34)
        this.checkWinCondition();

        // Keep player within bounds
        this.constrainPlayerToBounds();
    }

    /**
     * Keep player within canvas bounds
     */
    constrainPlayerToBounds() {
        // Left boundary
        if (this.player.x < 0) {
            this.player.x = 0;
            this.player.position.x = 0;
            this.player.velocity.x = 0;
        }

        // Right boundary
        if (this.player.x + this.player.width > Constants.CANVAS_WIDTH) {
            this.player.x = Constants.CANVAS_WIDTH - this.player.width;
            this.player.position.x = this.player.x;
            this.player.velocity.x = 0;
        }

        // Bottom boundary (game over if player falls off)
        if (this.player.y > Constants.CANVAS_HEIGHT) {
            this.player.reset();
        }
    }

    /**
     * Render game graphics
     * @param {Renderer} renderer - The renderer instance
     */
    render(renderer) {
        // Draw background
        renderer.clear(Constants.COLOR_BACKGROUND);

        // Render level (platforms and ladders)
        this.level.render(renderer);

        // Render DonkeyKong (issue #28)
        this.donkeyKong.render(renderer);

        // Render Princess (issue #28)
        this.princess.render(renderer);

        // Render barrels (issue #28)
        for (const barrel of this.barrels) {
            barrel.render(renderer);
        }

        // Render player
        this.player.render(renderer);

        // Render UI
        this.renderUI(renderer);
    }

    /**
     * Render UI elements (score, lives, etc.)
     * @param {Renderer} renderer - The renderer instance
     */
    renderUI(renderer) {
        // Score
        renderer.drawText(
            `SCORE: ${this.score}`,
            20,
            30,
            Constants.COLOR_TEXT,
            '20px monospace',
            'left'
        );

        // Lives
        renderer.drawText(
            `LIVES: ${this.lives}`,
            Constants.CANVAS_WIDTH - 20,
            30,
            Constants.COLOR_TEXT,
            '20px monospace',
            'right'
        );

        // Debug info (climbing state)
        if (this.player.isClimbing) {
            renderer.drawText(
                'CLIMBING',
                Constants.CANVAS_WIDTH / 2,
                30,
                Constants.COLOR_LADDER,
                '20px monospace',
                'center'
            );
        }

        // Level complete message (issue #34)
        if (this.currentState === Constants.STATE_LEVEL_COMPLETE) {
            renderer.drawText(
                'LEVEL COMPLETE!',
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2 - 40,
                Constants.COLOR_UI_YELLOW,
                '48px monospace',
                'center'
            );
            renderer.drawText(
                'Press SPACE to continue',
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2 + 20,
                Constants.COLOR_TEXT,
                '24px monospace',
                'center'
            );
        }

        // Game over message
        if (this.currentState === Constants.STATE_GAME_OVER) {
            renderer.drawText(
                'GAME OVER',
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2 - 40,
                Constants.COLOR_UI_RED,
                '48px monospace',
                'center'
            );
            renderer.drawText(
                'Press SPACE to restart',
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2 + 20,
                Constants.COLOR_TEXT,
                '24px monospace',
                'center'
            );
        }
    }

    /**
     * Change game state
     * @param {string} newState - The new game state
     */
    setState(newState) {
        this.currentState = newState;
    }

    /**
     * Reset game to initial state
     * Reloads current level and resets player position (issue #32)
     */
    reset() {
        this.score = 0;
        this.lives = Constants.PLAYER_STARTING_LIVES;

        // Get player start position from current level
        const playerStart = this.level.getPlayerStartPosition();
        this.player.reset(playerStart.x, playerStart.y);

        // Reset DonkeyKong entity (issue #28)
        this.donkeyKong = new DonkeyKong(Constants.DK_X, Constants.DK_Y);

        // Reset Princess entity (issue #28)
        const princessPos = this.level.getPrincessPosition();
        this.princess = new Princess(princessPos.x, princessPos.y);

        // Clear barrels array (issue #28)
        this.barrels = [];

        this.currentState = Constants.STATE_PLAYING;
    }

    /**
     * Spawn a new barrel from DonkeyKong (issue #28)
     */
    spawnBarrel() {
        const spawnPos = this.donkeyKong.getBarrelSpawnPosition();
        const barrel = new Barrel(spawnPos.x, spawnPos.y);
        this.barrels.push(barrel);
    }

    /**
     * Check collision between player and barrels (issue #25)
     * Handles player death, life loss, and game over
     */
    checkPlayerBarrelCollisions() {
        const playerBounds = this.player.getBounds();

        for (const barrel of this.barrels) {
            if (!barrel.isActive()) continue;

            const barrelBounds = barrel.getBounds();

            // AABB collision detection
            const colliding = (
                playerBounds.x < barrelBounds.x + barrelBounds.width &&
                playerBounds.x + playerBounds.width > barrelBounds.x &&
                playerBounds.y < barrelBounds.y + barrelBounds.height &&
                playerBounds.y + playerBounds.height > barrelBounds.y
            );

            if (colliding) {
                // Try to damage player (returns false if invincible)
                const damageTaken = this.player.takeDamage();

                if (damageTaken) {
                    // Player took damage
                    this.lives--;

                    if (this.lives <= 0) {
                        // Game over
                        this.currentState = Constants.STATE_GAME_OVER;
                    } else {
                        // Respawn player
                        const playerStart = this.level.getPlayerStartPosition();
                        this.player.reset(playerStart.x, playerStart.y);
                    }
                }

                // Only check one barrel collision per frame
                break;
            }
        }
    }

    /**
     * Check win condition - player reaching princess (issue #34)
     */
    checkWinCondition() {
        if (this.currentState !== Constants.STATE_PLAYING) {
            return;
        }

        // Check collision with princess
        const playerBounds = this.player.getBounds();
        const princessBounds = this.princess.getBounds();

        const colliding = (
            playerBounds.x < princessBounds.x + princessBounds.width &&
            playerBounds.x + playerBounds.width > princessBounds.x &&
            playerBounds.y < princessBounds.y + princessBounds.height &&
            playerBounds.y + playerBounds.height > princessBounds.y
        );

        if (colliding) {
            // Award completion points
            this.score += Constants.POINTS_REACH_PRINCESS;

            // TODO: Calculate and award time bonus (future enhancement)
            // const timeBonus = (Constants.LEVEL_TIME_LIMIT - this.elapsedTime) * Constants.POINTS_TIME_BONUS;
            // this.score += timeBonus;

            // Transition to level complete state
            this.currentState = Constants.STATE_LEVEL_COMPLETE;
        }
    }
}
