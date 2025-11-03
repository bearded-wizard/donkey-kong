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
     * @param {SettingsManager} settingsManager - Settings manager for mobile controls (optional, issue #151)
     */
    constructor(canvas, renderer, levelNumber = 1, settingsManager = null) {
        this.canvas = canvas;
        this.renderer = renderer;

        // Game state
        this.currentState = Constants.STATE_PLAYING;

        // Initialize input handler
        this.inputHandler = new InputHandler();

        // Initialize mobile controls (issue #145, #151)
        this.mobileControls = new MobileControls(canvas, this.inputHandler, Constants, settingsManager);

        // Initialize audio manager (issues #40, #41)
        this.audioManager = new AudioManager();
        this.initializeAudio();

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
            this.inputHandler,
            this.audioManager
        );

        // Initialize DonkeyKong entity (issue #28)
        this.donkeyKong = new DonkeyKong(Constants.DK_X, Constants.DK_Y);

        // Initialize Princess entity (issue #28)
        const princessPos = this.level.getPrincessPosition();
        this.princess = new Princess(princessPos.x, princessPos.y);

        // Initialize barrels array (issue #28)
        this.barrels = [];

        // Initialize hammers array (issue #36)
        this.hammers = [];
        this.spawnHammers();

        // Score and lives
        this.score = 0;
        this.lives = Constants.PLAYER_STARTING_LIVES;

        // High score (loaded from localStorage)
        this.highScore = this.loadHighScore();

        // Level timer for time bonus (issue #38)
        this.levelTimer = 0;

        // Climbing tracking for scoring (issue #38)
        this.lastClimbingY = null; // Track last Y position while climbing
        this.climbingDistance = 0; // Total distance climbed

        // Death and respawn handling (issue #39)
        this.isRespawning = false;
        this.respawnTimer = 0;
        this.respawnDelay = 1.5; // seconds
    }

    /**
     * Initialize audio system and load all sound effects (issues #40, #41, #42)
     */
    initializeAudio() {
        const sounds = {
            jump: Constants.SOUND_JUMP,
            barrel_roll: Constants.SOUND_BARREL_ROLL,
            death: Constants.SOUND_DEATH,
            hammer_pickup: Constants.SOUND_HAMMER_PICKUP,
            barrel_destroy: Constants.SOUND_BARREL_DESTROY,
            level_complete: Constants.SOUND_LEVEL_COMPLETE
        };

        // Load sound effects
        this.audioManager.loadSounds(sounds)
            .catch(error => {
                console.warn('Some sounds failed to load:', error);
            });

        // Load background music (issue #42)
        this.audioManager.loadSound('background_music', Constants.MUSIC_BACKGROUND, true)
            .then(() => {
                // Start playing background music when loaded
                if (this.currentState === Constants.STATE_PLAYING) {
                    this.audioManager.playSound('background_music', true);
                }
            })
            .catch(error => {
                console.warn('Background music failed to load:', error);
            });
    }

    /**
     * Load high score from localStorage (issue #38)
     * @returns {number} The saved high score, or 0 if none exists
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('barrelBlasterHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (error) {
            console.warn('Failed to load high score from localStorage:', error);
            return 0;
        }
    }

    /**
     * Save high score to localStorage (issue #38)
     */
    saveHighScore() {
        try {
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('barrelBlasterHighScore', this.highScore.toString());
            }
        } catch (error) {
            console.warn('Failed to save high score to localStorage:', error);
        }
    }

    /**
     * Add points to score (issue #38)
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.score += points;
        this.saveHighScore();
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

        // Reset level timer and climbing tracking (issue #38)
        this.levelTimer = 0;
        this.lastClimbingY = null;
        this.climbingDistance = 0;

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
        this.setState(Constants.STATE_PLAYING);
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        if (this.currentState !== Constants.STATE_PLAYING) {
            return;
        }

        // Handle respawn delay (issue #39)
        if (this.isRespawning) {
            this.respawnTimer += deltaTime;

            if (this.respawnTimer >= this.respawnDelay) {
                // Respawn completed
                this.isRespawning = false;
                this.respawnTimer = 0;

                // Respawn player at start position
                const playerStart = this.level.getPlayerStartPosition();
                this.player.reset(playerStart.x, playerStart.y);

                // Clear all barrels for safety (issue #39)
                this.barrels = [];
            } else {
                // During respawn delay, skip game updates
                return;
            }
        }

        // Update level timer (issue #38)
        this.levelTimer += deltaTime;

        // Update mobile controls (issue #145)
        this.mobileControls.update(deltaTime);

        // Update player
        this.player.update(
            deltaTime,
            this.level.getPlatforms(),
            this.level.getLadders()
        );

        // Track climbing distance for scoring (issue #38)
        this.trackClimbingScore();

        // Update DonkeyKong and handle barrel spawning (issue #28)
        const shouldSpawnBarrel = this.donkeyKong.update(deltaTime);
        if (shouldSpawnBarrel && this.barrels.length < Constants.MAX_BARRELS) {
            this.spawnBarrel();
        }

        // Update Princess (issue #28)
        this.princess.update(deltaTime);

        // Update all barrels (issue #28)
        for (const barrel of this.barrels) {
            barrel.update(deltaTime, this.level.getPlatforms(), this.level.getLadders());
        }

        // Remove dead barrels (issue #28)
        this.barrels = this.barrels.filter(barrel => barrel.isActive());

        // Update hammers (issue #36)
        for (const hammer of this.hammers) {
            hammer.update(deltaTime);
        }

        // Check player-hammer collision (issue #36)
        this.checkPlayerHammerCollision();

        // Check player-barrel collisions (issue #25/#36)
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
     * Track climbing distance and award points (issue #38)
     * Awards 10 points per meter climbed upward
     */
    trackClimbingScore() {
        if (this.player.isClimbing) {
            // If this is the first frame of climbing, store starting Y position
            if (this.lastClimbingY === null) {
                this.lastClimbingY = this.player.y;
            } else {
                // Calculate distance climbed (negative = up, positive = down)
                const deltaY = this.lastClimbingY - this.player.y;

                // Only award points for upward movement
                if (deltaY > 0) {
                    this.climbingDistance += deltaY;

                    // Award points for each meter (100 pixels = 1 meter)
                    const metersClimbed = Math.floor(this.climbingDistance / 100);
                    if (metersClimbed > 0) {
                        const pointsToAward = metersClimbed * Constants.POINTS_CLIMBING_PER_METER;
                        this.addScore(pointsToAward);

                        // Reset climbing distance counter (keep remainder)
                        this.climbingDistance = this.climbingDistance % 100;
                    }
                }

                // Update last position
                this.lastClimbingY = this.player.y;
            }
        } else {
            // Reset climbing tracking when not climbing
            this.lastClimbingY = null;
            this.climbingDistance = 0;
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

        // Render hammers (issue #36)
        for (const hammer of this.hammers) {
            hammer.render(renderer);
        }

        // Render player (hide during respawn) (issue #39)
        if (!this.isRespawning) {
            this.player.render(renderer);
        }

        // Render UI
        this.renderUI(renderer);

        // Render mobile controls (issue #145)
        this.mobileControls.render(renderer.ctx);
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

        // High Score (issue #38)
        renderer.drawText(
            `HIGH SCORE: ${this.highScore}`,
            Constants.CANVAS_WIDTH / 2,
            30,
            Constants.COLOR_UI_YELLOW,
            '20px monospace',
            'center'
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

        // Respawn countdown (issue #39)
        if (this.isRespawning) {
            const timeLeft = Math.ceil(this.respawnDelay - this.respawnTimer);
            renderer.drawText(
                `RESPAWNING... ${timeLeft}`,
                Constants.CANVAS_WIDTH / 2,
                Constants.CANVAS_HEIGHT / 2,
                Constants.COLOR_UI_YELLOW,
                '32px monospace',
                'center'
            );
        }

        // Hammer timer (issue #36)
        if (this.player.hasHammer) {
            const timeLeft = Math.ceil(this.player.hammerTimer);
            renderer.drawText(
                `HAMMER: ${timeLeft}s`,
                Constants.CANVAS_WIDTH / 2,
                60,
                Constants.COLOR_UI_YELLOW,
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
     * Change game state (issue #42: handle background music state)
     * @param {string} newState - The new game state
     */
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;

        // Handle background music based on state changes (issue #42)
        if (this.audioManager && this.audioManager.hasSound('background_music')) {
            // Stop music when game ends or level completes
            if (newState === Constants.STATE_GAME_OVER ||
                newState === Constants.STATE_LEVEL_COMPLETE) {
                this.audioManager.stopSound('background_music');
            }
            // Start music when entering playing state from non-playing state
            else if (newState === Constants.STATE_PLAYING &&
                     oldState !== Constants.STATE_PLAYING) {
                this.audioManager.playSound('background_music', true);
            }
        }
    }

    /**
     * Reset game to initial state
     * Reloads current level and resets player position (issue #32)
     */
    reset() {
        this.score = 0;
        this.lives = Constants.PLAYER_STARTING_LIVES;

        // Reset level timer and climbing tracking (issue #38)
        this.levelTimer = 0;
        this.lastClimbingY = null;
        this.climbingDistance = 0;

        // Reset respawn state (issue #39)
        this.isRespawning = false;
        this.respawnTimer = 0;

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

        this.setState(Constants.STATE_PLAYING);
    }

    /**
     * Spawn a new barrel from DonkeyKong (issue #28)
     */
    spawnBarrel() {
        const spawnPos = this.donkeyKong.getBarrelSpawnPosition();
        const barrel = new Barrel(spawnPos.x, spawnPos.y);
        this.barrels.push(barrel);

        // Play barrel roll sound (issue #41)
        if (this.audioManager) {
            this.audioManager.playSound('barrel_roll');
        }
    }

    /**
     * Handle player losing a life (issue #39)
     */
    loseLife() {
        this.lives--;

        // Play death sound (issue #41)
        if (this.audioManager) {
            this.audioManager.playSound('death');
        }

        if (this.lives <= 0) {
            // Game over
            this.setState(Constants.STATE_GAME_OVER);
        } else {
            // Start respawn sequence
            this.isRespawning = true;
            this.respawnTimer = 0;
        }
    }

    /**
     * Check collision between player and barrels (issue #25/#36/#38)
     * Handles player death, life loss, game over, barrel destruction with hammer, and barrel jumping
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

            // Check if player jumped over barrel (issue #38)
            // Player is above barrel, horizontally overlapping, and is jumping/falling
            const jumpedOver = !colliding &&
                              playerBounds.x < barrelBounds.x + barrelBounds.width &&
                              playerBounds.x + playerBounds.width > barrelBounds.x &&
                              playerBounds.y + playerBounds.height < barrelBounds.y &&
                              this.player.velocityY > 0 && // Falling
                              !barrel.jumpedOver; // Haven't awarded points for this barrel yet

            if (jumpedOver) {
                // Award points for jumping over barrel
                this.addScore(Constants.POINTS_BARREL_JUMP);
                barrel.jumpedOver = true; // Mark barrel to prevent multiple awards
            }

            if (colliding) {
                // If player has hammer, destroy barrel (issue #36)
                if (this.player.hasHammer) {
                    barrel.destroy();
                    this.addScore(Constants.POINTS_BARREL_SMASH);

                    // Play barrel destroy sound (issue #41)
                    if (this.audioManager) {
                        this.audioManager.playSound('barrel_destroy');
                    }

                    // Continue checking other barrels
                    continue;
                }

                // Otherwise, try to damage player (issue #25/#39)
                const damageTaken = this.player.takeDamage();

                if (damageTaken) {
                    // Player took damage - lose a life
                    this.loseLife();
                }

                // Only check one barrel collision per frame (when not destroying)
                break;
            }
        }
    }

    /**
     * Check win condition - player reaching princess (issue #34/#38)
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
            // Award completion points (issue #38)
            this.addScore(Constants.POINTS_REACH_PRINCESS);

            // Calculate and award time bonus (issue #38)
            const timeRemaining = Math.max(0, Constants.LEVEL_TIME_LIMIT - this.levelTimer);
            const timeBonus = Math.floor(timeRemaining * Constants.POINTS_TIME_BONUS);
            this.addScore(timeBonus);

            // Play level complete sound (issue #41)
            if (this.audioManager) {
                this.audioManager.playSound('level_complete');
            }

            // Transition to level complete state
            this.setState(Constants.STATE_LEVEL_COMPLETE);
        }
    }

    /**
     * Check player-hammer collision (issue #36)
     */
    checkPlayerHammerCollision() {
        for (const hammer of this.hammers) {
            if (hammer.checkCollision(this.player)) {
                this.player.pickupHammer();

                // Play hammer pickup sound (issue #41)
                if (this.audioManager) {
                    this.audioManager.playSound('hammer_pickup');
                }
            }
        }
    }

    /**
     * Spawn hammer power-ups on platforms (issue #36)
     */
    spawnHammers() {
        // Place one hammer on platform 2 (middle of level)
        this.hammers.push(new Hammer(500, Constants.PLATFORM_2 - 40));
    }
}
