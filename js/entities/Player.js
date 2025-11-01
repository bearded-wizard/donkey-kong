/**
 * Player.js
 *
 * Player entity with movement, jumping, and ladder climbing capabilities.
 * Handles player input, physics, and collision detection with platforms and ladders.
 */

class Player {
    /**
     * Create a new player
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {InputHandler} inputHandler - Input handler instance
     */
    constructor(x, y, inputHandler) {
        // Position
        this.x = x;
        this.y = y;
        this.width = Constants.PLAYER_WIDTH;
        this.height = Constants.PLAYER_HEIGHT;

        // Velocity
        this.velocityX = 0;
        this.velocityY = 0;

        // Input handler reference
        this.inputHandler = inputHandler;

        // State flags
        this.isOnGround = false;
        this.isClimbing = false;
        this.isOnLadder = false; // True when player is aligned with and on a ladder

        // Facing direction: 1 = right, -1 = left
        this.facingDirection = 1;

        // Current ladder reference (null when not climbing)
        this.currentLadder = null;

        // Color
        this.color = Constants.COLOR_PLAYER;

        // Physics object for compatibility with Physics class
        this.position = { x: this.x, y: this.y };
        this.velocity = { x: this.velocityX, y: this.velocityY };
    }

    /**
     * Update player state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     * @param {Array<Platform>} platforms - Array of platform objects
     * @param {Array<Ladder>} ladders - Array of ladder objects
     */
    update(deltaTime, platforms, ladders) {
        // Handle ladder detection and climbing
        this.handleLadderInteraction(ladders, deltaTime);

        // Handle horizontal movement
        this.handleMovement(deltaTime);

        // Handle jumping (only when not climbing and on ground)
        if (this.inputHandler.isJumpPressed() && this.isOnGround && !this.isClimbing) {
            this.jump();
        }

        // Apply physics (gravity disabled when climbing)
        const applyGravity = !this.isClimbing;
        if (applyGravity) {
            Physics.applyGravity(this, deltaTime);
            Physics.clampVelocity(this);
        }

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update actual position from physics position
        this.x = this.position.x;
        this.y = this.position.y;

        // Handle platform collisions
        this.handlePlatformCollisions(platforms);

        // Keep velocity in sync
        this.velocityX = this.velocity.x;
        this.velocityY = this.velocity.y;

        // Clear pressed keys for next frame
        if (this.inputHandler) {
            this.inputHandler.clearPressed();
        }
    }

    /**
     * Handle ladder interaction and climbing logic
     * Implements acceptance criteria:
     * - Player can detect when near ladder
     * - Player can enter ladder from top or bottom
     * - Player exits ladder at top/bottom
     * - Player cannot move left/right while on ladder
     * @param {Array<Ladder>} ladders - Array of ladder objects
     * @param {number} deltaTime - Time elapsed since last frame
     */
    handleLadderInteraction(ladders, deltaTime) {
        if (!ladders || ladders.length === 0) {
            this.isOnLadder = false;
            this.currentLadder = null;
            return;
        }

        // Find nearby ladder
        let nearestLadder = null;
        let minDistance = Infinity;

        for (const ladder of ladders) {
            if (ladder.canClimb(this)) {
                const ladderCenterX = ladder.getCenterX();
                const playerCenterX = this.x + this.width / 2;
                const distance = Math.abs(ladderCenterX - playerCenterX);

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestLadder = ladder;
                }
            }
        }

        // Update ladder detection state
        this.isOnLadder = nearestLadder !== null;

        // Handle entering/exiting climbing state
        if (this.isClimbing) {
            // Currently climbing
            this.handleClimbing(nearestLadder, deltaTime);
        } else {
            // Not climbing - check if player wants to start climbing
            if (this.isOnLadder && nearestLadder) {
                const wantsToClimbUp = this.inputHandler.isUpDown();
                const wantsToClimbDown = this.inputHandler.isDownDown();

                if (wantsToClimbUp || wantsToClimbDown) {
                    // Enter climbing mode
                    this.enterClimbing(nearestLadder);
                }
            }
        }
    }

    /**
     * Enter climbing mode
     * @param {Ladder} ladder - The ladder to climb
     */
    enterClimbing(ladder) {
        this.isClimbing = true;
        this.currentLadder = ladder;

        // Snap player to center of ladder for smooth climbing
        const ladderCenterX = ladder.getCenterX();
        this.x = ladderCenterX - this.width / 2;
        this.position.x = this.x;

        // Stop horizontal and vertical velocity
        this.velocity.x = 0;
        this.velocity.y = 0;

        // Player is no longer on ground when climbing
        this.isOnGround = false;
    }

    /**
     * Handle climbing state
     * @param {Ladder} nearestLadder - Currently detected ladder (may be null)
     * @param {number} deltaTime - Time elapsed since last frame
     */
    handleClimbing(nearestLadder, deltaTime) {
        if (!this.currentLadder) {
            // Lost ladder reference - exit climbing
            this.exitClimbing();
            return;
        }

        // Check if player wants to exit climbing
        const wantsToMoveLeft = this.inputHandler.isLeftDown();
        const wantsToMoveRight = this.inputHandler.isRightDown();

        if (wantsToMoveLeft || wantsToMoveRight) {
            // Player wants to move horizontally - exit climbing
            this.exitClimbing();
            return;
        }

        // Handle vertical climbing movement
        const wantsToClimbUp = this.inputHandler.isUpDown();
        const wantsToClimbDown = this.inputHandler.isDownDown();

        if (wantsToClimbUp) {
            this.velocity.y = -Constants.PLAYER_CLIMB_SPEED;
        } else if (wantsToClimbDown) {
            this.velocity.y = Constants.PLAYER_CLIMB_SPEED;
        } else {
            // No input - stop climbing movement
            this.velocity.y = 0;
        }

        // Check if player has reached top or bottom of ladder
        const playerTop = this.y;
        const playerBottom = this.y + this.height;
        const ladderTop = this.currentLadder.y;
        const ladderBottom = this.currentLadder.y + this.currentLadder.height;

        // Exit at top of ladder (player completely above ladder)
        if (playerBottom <= ladderTop + Constants.COLLISION_TOLERANCE && wantsToClimbUp) {
            this.exitClimbing();
            this.isOnGround = true; // Assume there's a platform at ladder top
            this.y = ladderTop - this.height; // Snap to platform
            this.position.y = this.y;
            return;
        }

        // Exit at bottom of ladder (player at or below ladder bottom)
        if (playerBottom >= ladderBottom - Constants.COLLISION_TOLERANCE && wantsToClimbDown) {
            this.exitClimbing();
            return;
        }

        // Still on ladder - check if ladder is still nearby
        if (!nearestLadder || nearestLadder !== this.currentLadder) {
            // Moved away from ladder
            this.exitClimbing();
        }
    }

    /**
     * Exit climbing mode
     */
    exitClimbing() {
        this.isClimbing = false;
        this.currentLadder = null;
        // Velocity will be reset by movement/gravity on next update
    }

    /**
     * Handle horizontal movement
     * Player cannot move left/right while climbing (acceptance criterion)
     * @param {number} deltaTime - Time elapsed since last frame
     */
    handleMovement(deltaTime) {
        // No horizontal movement while climbing
        if (this.isClimbing) {
            this.velocity.x = 0;
            return;
        }

        const isLeft = this.inputHandler.isLeftDown();
        const isRight = this.inputHandler.isRightDown();

        if (isLeft && !isRight) {
            this.velocity.x = -Constants.PLAYER_WALK_SPEED;
            this.facingDirection = -1; // Facing left
        } else if (isRight && !isLeft) {
            this.velocity.x = Constants.PLAYER_WALK_SPEED;
            this.facingDirection = 1; // Facing right
        } else {
            // Apply friction when no input
            if (this.isOnGround) {
                this.velocity.x *= Constants.GROUND_FRICTION;
                // Stop completely if moving very slowly
                if (Math.abs(this.velocity.x) < 1) {
                    this.velocity.x = 0;
                }
            } else {
                // Less friction in air
                this.velocity.x *= Constants.AIR_RESISTANCE;
            }
        }
    }

    /**
     * Make the player jump
     */
    jump() {
        this.velocity.y = Constants.JUMP_VELOCITY;
        this.isOnGround = false;
    }

    /**
     * Handle collisions with platforms
     * @param {Array<Platform>} platforms - Array of platform objects
     */
    handlePlatformCollisions(platforms) {
        if (!platforms || platforms.length === 0) {
            this.isOnGround = false;
            return;
        }

        // Assume not on ground until collision detected
        let wasOnGround = this.isOnGround;
        this.isOnGround = false;

        for (const platform of platforms) {
            const collision = Physics.checkPlatformCollision(this, platform);

            if (collision.colliding) {
                // Snap to platform top
                this.y = collision.snapY;
                this.position.y = this.y;

                // Stop downward velocity
                this.velocity.y = 0;

                // Mark as on ground
                this.isOnGround = true;

                // Exit climbing when landing on platform
                if (this.isClimbing) {
                    this.exitClimbing();
                }

                break; // Only handle one platform collision per frame
            }
        }
    }

    /**
     * Render the player
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        // Draw player as a simple rectangle
        renderer.drawRect(this.x, this.y, this.width, this.height, this.color);

        // Debug: Draw a small indicator when climbing
        if (this.isClimbing) {
            renderer.drawRect(
                this.x + this.width / 2 - 3,
                this.y - 10,
                6,
                6,
                Constants.COLOR_LADDER
            );
        }
    }

    /**
     * Get the collision bounds of the player
     * @returns {{x: number, y: number, width: number, height: number}} Bounding box
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Reset player to starting position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    reset(x = Constants.PLAYER_START_X, y = Constants.PLAYER_START_Y) {
        this.x = x;
        this.y = y;
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        this.isClimbing = false;
        this.isOnLadder = false;
        this.currentLadder = null;
        this.facingDirection = 1;
    }
}
