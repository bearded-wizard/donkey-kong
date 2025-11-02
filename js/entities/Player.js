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
     * @param {AudioManager} audioManager - Audio manager instance (optional)
     */
    constructor(x, y, inputHandler, audioManager = null) {
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

        // Audio manager reference (issue #41)
        this.audioManager = audioManager;

        // State flags
        this.isOnGround = false;
        this.isClimbing = false;
        this.isOnLadder = false; // True when player is aligned with and on a ladder
        this.isJumping = false; // True when player is in the upward phase of a jump

        // Facing direction: 1 = right, -1 = left
        this.facingDirection = 1;

        // Invincibility (issue #25)
        this.isInvincible = false;
        this.invincibilityTimer = 0;

        // Hammer power-up (issue #36)
        this.hasHammer = false;
        this.hammerTimer = 0;

        // Current ladder reference (null when not climbing)
        this.currentLadder = null;

        // Color
        this.color = Constants.COLOR_PLAYER;

        // Animation state (issue #19)
        this.animationState = Constants.PLAYER_ANIM_STATE_IDLE;
        this.animationFrame = 0;
        this.animationTimer = 0;

        // Physics object for compatibility with Physics class
        this.position = { x: this.x, y: this.y };
        this.velocity = { x: this.velocityX, y: this.velocityY };

        // Sprite sheet loading
        // Sprites: New Platformer Pack by Kenney (www.kenney.nl)
        // License: CC0 (Public Domain) - See assets/sprites/LICENSE-kenney.txt
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/sprites/player-new-platformer.png';
        this.spriteSheetLoaded = false;
        this.spriteSheet.onload = () => {
            this.spriteSheetLoaded = true;
            console.log('Player sprite sheet loaded successfully (Kenney New Platformer Pack)');
        };
        this.spriteSheet.onerror = () => {
            console.warn('Failed to load player sprite sheet, using fallback rendering');
            this.spriteSheetLoaded = false;
        };

        // Sprite configuration
        // Kenney New Platformer Pack: 128x128 pixels per sprite
        // Sprite sheet: 1024x1024 with multiple character variants
        this.spriteWidth = 128;
        this.spriteHeight = 128;
        this.spriteSpacing = 0;   // No margin in New Platformer Pack

        // Sprite positions from XML metadata (absolute pixel coordinates)
        // Using character_beige variant from New Platformer Pack
        // Coordinates from spritesheet-characters-default.xml
        this.spriteConfig = {
            // Idle animation (1 frame)
            idle: [{ x: 512, y: 896 }],  // character_beige_idle

            // Walk animation (2 frames alternating)
            walk: [
                { x: 512, y: 640 },  // character_beige_walk_a
                { x: 512, y: 512 },  // character_beige_walk_b
                { x: 512, y: 640 },  // character_beige_walk_a (repeat)
                { x: 512, y: 896 }   // character_beige_idle (pause in cycle)
            ],

            // Jump animation (1 frame)
            jump: [{ x: 512, y: 768 }],  // character_beige_jump

            // Climb animation (2 frames)
            climb: [
                { x: 256, y: 768 },  // character_beige_climb_a
                { x: 640, y: 384 }   // character_beige_climb_b
            ]
        };
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

        // Handle variable jump height (issue #16)
        // If player releases spacebar during upward movement, cut the jump short
        if (this.isJumping && this.velocity.y < 0) {
            // Check if spacebar is not being held (not pressed and not down)
            const isSpaceDown = this.inputHandler.isKeyDown(' ') || this.inputHandler.isKeyDown('Space');
            if (!isSpaceDown) {
                // Cut the jump short for variable jump height
                this.velocity.y *= Constants.JUMP_CUT_MULTIPLIER;
                this.isJumping = false;
            }
        }

        // Reset jumping flag when falling
        if (this.velocity.y >= 0) {
            this.isJumping = false;
        }

        // Apply physics (gravity disabled when climbing - issue #17)
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

        // Clamp to screen bounds (issue #15)
        this.clampToScreenBounds();

        // Handle platform collisions (issue #18)
        this.handlePlatformCollisions(platforms);

        // Keep velocity in sync
        this.velocityX = this.velocity.x;
        this.velocityY = this.velocity.y;

        // Update animation state (issue #19)
        this.updateAnimationState(deltaTime);

        // Update invincibility timer (issue #25)
        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                this.invincibilityTimer = 0;
            }
        }

        // Update hammer timer (issue #36)
        if (this.hasHammer) {
            this.hammerTimer -= deltaTime;
            if (this.hammerTimer <= 0) {
                this.hasHammer = false;
                this.hammerTimer = 0;
            }
        }

        // Clear pressed keys for next frame
        if (this.inputHandler) {
            this.inputHandler.clearPressed();
        }
    }

    /**
     * Handle ladder interaction and climbing logic
     * Implements issue #17 acceptance criteria:
     * - Player can climb up on up arrow
     * - Player can climb down on down arrow
     * - Disable gravity while climbing
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
     * Handle horizontal movement with smooth acceleration/deceleration
     * Player cannot move left/right while climbing (issue #17 acceptance criterion)
     * Implements issue #15: smooth acceleration, max speed limit, facing direction
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
            // Accelerate left
            this.velocity.x -= Constants.PLAYER_ACCELERATION * deltaTime;

            // Clamp to max speed
            if (this.velocity.x < -Constants.PLAYER_WALK_SPEED) {
                this.velocity.x = -Constants.PLAYER_WALK_SPEED;
            }

            this.facingDirection = -1; // Facing left
        } else if (isRight && !isLeft) {
            // Accelerate right
            this.velocity.x += Constants.PLAYER_ACCELERATION * deltaTime;

            // Clamp to max speed
            if (this.velocity.x > Constants.PLAYER_WALK_SPEED) {
                this.velocity.x = Constants.PLAYER_WALK_SPEED;
            }

            this.facingDirection = 1; // Facing right
        } else {
            // Decelerate when no input
            if (this.velocity.x > 0) {
                // Moving right, decelerate
                this.velocity.x -= Constants.PLAYER_DECELERATION * deltaTime;
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;
                }
            } else if (this.velocity.x < 0) {
                // Moving left, decelerate
                this.velocity.x += Constants.PLAYER_DECELERATION * deltaTime;
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;
                }
            }
        }
    }

    /**
     * Update animation state based on player movement
     * Implements issue #19: player animation state machine
     * - Idle state when stationary
     * - Walk state when moving horizontally
     * - Jump state when airborne
     * - Climb state when on ladder
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    updateAnimationState(deltaTime) {
        // Store previous state for transition detection
        const previousState = this.animationState;

        // Determine new animation state based on movement
        if (this.isClimbing) {
            // Climb state has priority when on ladder
            this.animationState = Constants.PLAYER_ANIM_STATE_CLIMB;
        } else if (!this.isOnGround) {
            // Jump state when airborne
            this.animationState = Constants.PLAYER_ANIM_STATE_JUMP;
        } else if (Math.abs(this.velocity.x) > 1) {
            // Walk state when moving horizontally
            this.animationState = Constants.PLAYER_ANIM_STATE_WALK;
        } else {
            // Idle state when stationary on ground
            this.animationState = Constants.PLAYER_ANIM_STATE_IDLE;
        }

        // Reset animation frame on state transition (smooth transitions)
        if (this.animationState !== previousState) {
            this.animationFrame = 0;
            this.animationTimer = 0;
        }

        // Update animation frame counter
        this.animationTimer += deltaTime;
        const frameDuration = 1.0 / Constants.PLAYER_ANIMATION_FPS;

        if (this.animationTimer >= frameDuration) {
            this.animationFrame++;
            this.animationTimer -= frameDuration;
        }
    }

    /**
     * Clamp player position to screen bounds
     * Prevents player from moving off-screen (issue #15)
     */
    clampToScreenBounds() {
        // Clamp X position
        if (this.x < 0) {
            this.x = 0;
            this.position.x = 0;
            this.velocity.x = 0;
        } else if (this.x + this.width > Constants.CANVAS_WIDTH) {
            this.x = Constants.CANVAS_WIDTH - this.width;
            this.position.x = this.x;
            this.velocity.x = 0;
        }

        // Clamp Y position (mainly for falling off bottom)
        if (this.y > Constants.CANVAS_HEIGHT) {
            this.y = Constants.CANVAS_HEIGHT - this.height;
            this.position.y = this.y;
            this.velocity.y = 0;
        }
    }

    /**
     * Make the player jump
     * Implements issue #16: jump mechanic with variable height
     */
    jump() {
        this.velocity.y = Constants.JUMP_VELOCITY;
        this.isOnGround = false;
        this.isJumping = true;

        // Play jump sound (issue #41)
        if (this.audioManager) {
            this.audioManager.playSound('jump');
        }
    }

    /**
     * Handle collisions with platforms
     * Implements issue #18 acceptance criteria:
     * - Player stands on platforms
     * - Player doesn't fall through platforms
     * - Platform snap alignment
     * - Set grounded flag when on platform
     * - Handle falling off platforms
     * @param {Array<Platform>} platforms - Array of platform objects
     */
    handlePlatformCollisions(platforms) {
        if (!platforms || platforms.length === 0) {
            this.isOnGround = false;
            return;
        }

        // Assume not on ground until collision detected (handles falling off platforms)
        let wasOnGround = this.isOnGround;
        this.isOnGround = false;

        for (const platform of platforms) {
            const collision = Physics.checkPlatformCollision(this, platform);

            if (collision.colliding) {
                // Snap to platform top (platform snap alignment)
                this.y = collision.snapY;
                this.position.y = this.y;

                // Stop downward velocity (doesn't fall through platforms)
                this.velocity.y = 0;

                // Mark as on ground (set grounded flag)
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
     * Render the player with visual animation (issue #20)
     * Uses sprite sheet if loaded, otherwise falls back to procedural rendering
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        // Save canvas state for transformations
        renderer.save();

        // Get canvas context for advanced operations
        const ctx = renderer.getContext();

        // Apply invincibility flashing effect (issue #25)
        if (this.isInvincible) {
            // Flash at 8 Hz (8 times per second)
            const flashFrequency = 8;
            const visible = Math.floor(this.invincibilityTimer * flashFrequency) % 2 === 0;
            if (!visible) {
                // Skip rendering this frame for flashing effect
                renderer.restore();
                return;
            }
        }

        // Apply horizontal flip based on facing direction
        if (this.facingDirection === -1) {
            // Flip horizontally for left-facing
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, -this.y);
        }

        // Use sprite rendering if sprite sheet is loaded
        if (this.spriteSheetLoaded) {
            this.renderSprite(renderer, ctx);
        } else {
            // Fallback to procedural rendering based on animation state
            switch (this.animationState) {
                case Constants.PLAYER_ANIM_STATE_IDLE:
                    this.renderIdle(renderer);
                    break;
                case Constants.PLAYER_ANIM_STATE_WALK:
                    this.renderWalk(renderer);
                    break;
                case Constants.PLAYER_ANIM_STATE_JUMP:
                    this.renderJump(renderer);
                    break;
                case Constants.PLAYER_ANIM_STATE_CLIMB:
                    this.renderClimb(renderer);
                    break;
                default:
                    // Fallback to simple rectangle
                    renderer.drawRect(this.x, this.y, this.width, this.height, this.color);
                    break;
            }
        }

        // Restore canvas state
        renderer.restore();

        // Draw hammer indicator (issue #36)
        if (this.hasHammer) {
            const hammerX = this.x + this.width + 5;
            const hammerY = this.y - 10;
            const hammerSize = 16;

            ctx.save();
            ctx.fillStyle = '#FFD700'; // Gold color
            ctx.strokeStyle = '#8B4513'; // Brown
            ctx.lineWidth = 2;

            // Draw simple hammer shape
            // Handle
            ctx.fillRect(hammerX + hammerSize / 4, hammerY + hammerSize / 4,
                         hammerSize / 8, hammerSize * 0.75);
            // Head
            ctx.fillRect(hammerX, hammerY,
                         hammerSize * 0.6, hammerSize / 2);
            ctx.strokeRect(hammerX, hammerY,
                           hammerSize * 0.6, hammerSize / 2);

            ctx.restore();
        }
    }

    /**
     * Render sprite from sprite sheet
     * @param {Renderer} renderer - The game renderer
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderSprite(renderer, ctx) {
        // Determine which sprite config to use based on animation state
        let spriteArray;
        switch (this.animationState) {
            case Constants.PLAYER_ANIM_STATE_IDLE:
                spriteArray = this.spriteConfig.idle;
                break;
            case Constants.PLAYER_ANIM_STATE_WALK:
                spriteArray = this.spriteConfig.walk;
                break;
            case Constants.PLAYER_ANIM_STATE_JUMP:
                spriteArray = this.spriteConfig.jump;
                break;
            case Constants.PLAYER_ANIM_STATE_CLIMB:
                spriteArray = this.spriteConfig.climb;
                break;
            default:
                spriteArray = this.spriteConfig.idle;
                break;
        }

        // Get current sprite frame
        const frameIndex = this.animationFrame % spriteArray.length;
        const sprite = spriteArray[frameIndex];

        // Calculate source position in sprite sheet
        // New Platformer Pack uses absolute pixel coordinates from XML
        const srcX = sprite.x;
        const srcY = sprite.y;

        // Draw sprite scaled to player size
        ctx.drawImage(
            this.spriteSheet,
            srcX, srcY, this.spriteWidth, this.spriteHeight,  // Source: 128x128 pixels
            this.x, this.y, this.width, this.height           // Destination: scaled to player size (32x48)
        );
    }

    /**
     * Render idle state (issue #20)
     * Standing still pose
     * @param {Renderer} renderer - The game renderer
     */
    renderIdle(renderer) {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // Body (main rectangle)
        renderer.drawRect(x + w * 0.25, y + h * 0.3, w * 0.5, h * 0.5, this.color);

        // Head
        renderer.drawRect(x + w * 0.3, y + h * 0.1, w * 0.4, h * 0.25, this.color);

        // Legs
        renderer.drawRect(x + w * 0.3, y + h * 0.8, w * 0.15, h * 0.2, this.color);
        renderer.drawRect(x + w * 0.55, y + h * 0.8, w * 0.15, h * 0.2, this.color);

        // Eyes (facing direction indicator)
        const eyeColor = '#FFFFFF';
        renderer.drawRect(x + w * 0.55, y + h * 0.15, w * 0.1, h * 0.08, eyeColor);
    }

    /**
     * Render walk animation (issue #20)
     * Animated walking cycle with leg movement
     * @param {Renderer} renderer - The game renderer
     */
    renderWalk(renderer) {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // Determine walk frame (4 frames for smooth walk cycle)
        const walkFrame = this.animationFrame % 4;

        // Body (bobs slightly while walking)
        const bodyBob = (walkFrame === 1 || walkFrame === 3) ? -1 : 0;
        renderer.drawRect(x + w * 0.25, y + h * 0.3 + bodyBob, w * 0.5, h * 0.5, this.color);

        // Head (bobs with body)
        renderer.drawRect(x + w * 0.3, y + h * 0.1 + bodyBob, w * 0.4, h * 0.25, this.color);

        // Legs (animated walk cycle)
        let leftLegY, rightLegY, leftLegH, rightLegH;
        switch (walkFrame) {
            case 0: // Left leg forward, right leg back
                leftLegY = y + h * 0.75;
                leftLegH = h * 0.25;
                rightLegY = y + h * 0.8;
                rightLegH = h * 0.2;
                break;
            case 1: // Both legs center
                leftLegY = y + h * 0.8;
                leftLegH = h * 0.2;
                rightLegY = y + h * 0.8;
                rightLegH = h * 0.2;
                break;
            case 2: // Right leg forward, left leg back
                leftLegY = y + h * 0.8;
                leftLegH = h * 0.2;
                rightLegY = y + h * 0.75;
                rightLegH = h * 0.25;
                break;
            case 3: // Both legs center
                leftLegY = y + h * 0.8;
                leftLegH = h * 0.2;
                rightLegY = y + h * 0.8;
                rightLegH = h * 0.2;
                break;
        }
        renderer.drawRect(x + w * 0.3, leftLegY, w * 0.15, leftLegH, this.color);
        renderer.drawRect(x + w * 0.55, rightLegY, w * 0.15, rightLegH, this.color);

        // Eyes
        const eyeColor = '#FFFFFF';
        renderer.drawRect(x + w * 0.55, y + h * 0.15 + bodyBob, w * 0.1, h * 0.08, eyeColor);
    }

    /**
     * Render jump animation (issue #20)
     * Mid-air pose with legs tucked
     * @param {Renderer} renderer - The game renderer
     */
    renderJump(renderer) {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // Body
        renderer.drawRect(x + w * 0.25, y + h * 0.3, w * 0.5, h * 0.5, this.color);

        // Head
        renderer.drawRect(x + w * 0.3, y + h * 0.1, w * 0.4, h * 0.25, this.color);

        // Legs (tucked for jumping)
        renderer.drawRect(x + w * 0.3, y + h * 0.75, w * 0.4, h * 0.15, this.color);

        // Eyes
        const eyeColor = '#FFFFFF';
        renderer.drawRect(x + w * 0.55, y + h * 0.15, w * 0.1, h * 0.08, eyeColor);
    }

    /**
     * Render climb animation (issue #20)
     * Climbing pose with alternating arm positions
     * @param {Renderer} renderer - The game renderer
     */
    renderClimb(renderer) {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // Determine climb frame (2 frames for arm alternation)
        const climbFrame = this.animationFrame % 2;

        // Body (centered on ladder)
        renderer.drawRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.5, this.color);

        // Head
        renderer.drawRect(x + w * 0.3, y + h * 0.1, w * 0.4, h * 0.25, this.color);

        // Arms (alternating high/low for climbing motion)
        if (climbFrame === 0) {
            // Left arm high, right arm low
            renderer.drawRect(x + w * 0.15, y + h * 0.35, w * 0.15, h * 0.1, this.color);
            renderer.drawRect(x + w * 0.7, y + h * 0.5, w * 0.15, h * 0.1, this.color);
        } else {
            // Right arm high, left arm low
            renderer.drawRect(x + w * 0.15, y + h * 0.5, w * 0.15, h * 0.1, this.color);
            renderer.drawRect(x + w * 0.7, y + h * 0.35, w * 0.15, h * 0.1, this.color);
        }

        // Legs (on ladder)
        renderer.drawRect(x + w * 0.3, y + h * 0.8, w * 0.15, h * 0.2, this.color);
        renderer.drawRect(x + w * 0.55, y + h * 0.8, w * 0.15, h * 0.2, this.color);

        // Eyes (front facing when climbing)
        const eyeColor = '#FFFFFF';
        renderer.drawRect(x + w * 0.4, y + h * 0.15, w * 0.08, h * 0.08, eyeColor);
        renderer.drawRect(x + w * 0.52, y + h * 0.15, w * 0.08, h * 0.08, eyeColor);
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
     * Handle damage from barrel collision (issue #25)
     * @returns {boolean} True if player took damage (not invincible)
     */
    takeDamage() {
        if (this.isInvincible) {
            return false; // Player is invincible, no damage taken
        }

        // Grant invincibility period
        this.isInvincible = true;
        this.invincibilityTimer = Constants.INVINCIBILITY_DURATION;

        return true; // Damage taken
    }

    /**
     * Pick up hammer power-up (issue #36)
     */
    pickupHammer() {
        this.hasHammer = true;
        this.hammerTimer = Constants.HAMMER_DURATION;
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
        this.isJumping = false;
        this.currentLadder = null;
        this.facingDirection = 1;
        this.animationState = Constants.PLAYER_ANIM_STATE_IDLE;
        this.animationFrame = 0;
        this.animationTimer = 0;
        // Reset invincibility (issue #25)
        this.isInvincible = true; // Grant invincibility on respawn
        this.invincibilityTimer = Constants.INVINCIBILITY_DURATION;
        // Reset hammer (issue #36)
        this.hasHammer = false;
        this.hammerTimer = 0;
    }
}
