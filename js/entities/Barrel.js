/**
 * Barrel.js
 *
 * Barrel obstacle entity that rolls down platforms.
 * Barrels are spawned periodically and roll down platforms as hazards for the player.
 */

class Barrel {
    /**
     * Create a new barrel
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     */
    constructor(x, y) {
        // Position
        this.x = x;
        this.y = y;
        this.width = Constants.BARREL_WIDTH;
        this.height = Constants.BARREL_HEIGHT;

        // Velocity
        this.velocityX = Constants.BARREL_ROLL_SPEED;
        this.velocityY = 0;

        // State
        this.isRolling = true;
        this.direction = 1; // 1 = right, -1 = left
        this.isAlive = true;
        this.isOnLadder = false; // Issue #24: Barrel ladder detection
        this.currentLadder = null; // Track which ladder barrel is on

        // Physics object for compatibility with Physics class
        this.position = { x: this.x, y: this.y };
        this.velocity = { x: this.velocityX, y: this.velocityY };

        // Animation for rolling effect (frame-based)
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 12; // FPS for barrel rolling animation

        // Color fallback
        this.color = Constants.COLOR_BARREL;

        // Sprite loading
        // Custom barrel rolling sprite sheet (8 frames)
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/sprites/barrel.png';
        this.spriteSheetLoaded = false;
        this.spriteSheet.onload = () => {
            this.spriteSheetLoaded = true;
        };
        this.spriteSheet.onerror = () => {
            console.warn('Failed to load barrel sprite, using fallback rendering');
            this.spriteSheetLoaded = false;
        };

        // Sprite dimensions (8 frames at 64x64 pixels each = 512x64 sprite sheet)
        this.spriteWidth = 64;
        this.spriteHeight = 64;
        this.spriteFrames = 8; // Total frames in sprite sheet
    }

    /**
     * Update barrel state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     * @param {Array<Platform>} platforms - Array of platform objects
     * @param {Array<Ladder>} ladders - Array of ladder objects (issue #24)
     */
    update(deltaTime, platforms, ladders = []) {
        if (!this.isAlive) return;

        // Handle ladder collisions (issue #24)
        if (ladders && ladders.length > 0) {
            this.handleLadderCollisions(ladders);
        }

        // Apply gravity when not on platform and not on ladder
        if (!this.isOnLadder) {
            Physics.applyGravity(this, deltaTime);
        }

        // Update animation frame based on movement
        if (this.isRolling || this.isOnLadder) {
            this.animationTimer += deltaTime;
            const frameDuration = 1.0 / this.animationSpeed;

            if (this.animationTimer >= frameDuration) {
                this.animationFrame = (this.animationFrame + 1) % this.spriteFrames;
                this.animationTimer -= frameDuration;
            }
        }

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        this.x = this.position.x;
        this.y = this.position.y;

        // Handle platform collisions (not when falling on ladder)
        if (!this.isOnLadder) {
            this.handlePlatformCollisions(platforms);
        }

        // Remove if off-screen
        if (this.x < -this.width || this.x > Constants.CANVAS_WIDTH + this.width ||
            this.y > Constants.CANVAS_HEIGHT + this.height) {
            this.isAlive = false;
        }

        // Sync velocity
        this.velocityX = this.velocity.x;
        this.velocityY = this.velocity.y;
    }

    /**
     * Handle collisions with platforms
     * @param {Array<Platform>} platforms - Array of platform objects
     */
    handlePlatformCollisions(platforms) {
        if (!platforms || platforms.length === 0) return;

        let onPlatform = false;

        for (const platform of platforms) {
            const collision = Physics.checkPlatformCollision(this, platform);

            if (collision.colliding) {
                // Snap to platform top
                this.y = collision.snapY;
                this.position.y = this.y;

                // Stop downward velocity
                this.velocity.y = 0;

                onPlatform = true;

                // Roll on platform
                this.isRolling = true;

                // Random chance to fall off platform edges
                const platformLeft = platform.x;
                const platformRight = platform.x + platform.width;
                const barrelCenter = this.x + this.width / 2;

                // Check if near platform edge
                if (barrelCenter <= platformLeft + 10 || barrelCenter >= platformRight - 10) {
                    // Small chance to fall off edge
                    if (Math.random() < 0.1) {
                        this.isRolling = false;
                    }
                }

                break;
            }
        }

        // Continue rolling if on platform
        if (onPlatform && this.isRolling) {
            this.velocity.x = Constants.BARREL_ROLL_SPEED * this.direction;
        }
    }

    /**
     * Handle collisions with ladders (issue #24)
     * Barrels can randomly fall down ladders
     * @param {Array<Ladder>} ladders - Array of ladder objects
     */
    handleLadderCollisions(ladders) {
        if (!ladders || ladders.length === 0) return;

        const barrelCenterX = this.x + this.width / 2;
        const barrelBottom = this.y + this.height;

        // If already on ladder, check if we've reached the bottom
        if (this.isOnLadder && this.currentLadder) {
            const ladderBottom = this.currentLadder.y + this.currentLadder.height;

            // Check if barrel has reached bottom of ladder
            if (barrelBottom >= ladderBottom) {
                // Exit ladder state and resume rolling
                this.isOnLadder = false;
                this.currentLadder = null;
                this.velocity.x = Constants.BARREL_ROLL_SPEED * this.direction;
                this.velocity.y = 0;
                this.isRolling = true;
            } else {
                // Continue falling on ladder
                this.velocity.x = 0;
                this.velocity.y = Constants.BARREL_FALL_SPEED;
            }
            return;
        }

        // Check if barrel is rolling and overlapping with any ladder
        if (!this.isRolling || this.isOnLadder) return;

        for (const ladder of ladders) {
            const ladderCenterX = ladder.x + ladder.width / 2;
            const horizontalDistance = Math.abs(barrelCenterX - ladderCenterX);

            // Check if barrel center is within ladder bounds horizontally
            if (horizontalDistance < ladder.width / 2) {
                // Check if barrel is at or near the top of the ladder
                const ladderTop = ladder.y;
                const atLadderTop = barrelBottom >= ladderTop - 5 && barrelBottom <= ladderTop + 20;

                if (atLadderTop) {
                    // Random chance to fall down ladder (issue #24)
                    if (Math.random() < Constants.BARREL_LADDER_FALL_CHANCE) {
                        // Start falling on ladder
                        this.isOnLadder = true;
                        this.currentLadder = ladder;
                        this.velocity.x = 0;
                        this.velocity.y = Constants.BARREL_FALL_SPEED;
                        this.isRolling = false;
                    }
                    break; // Only check one ladder at a time
                }
            }
        }
    }

    /**
     * Render the barrel
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        if (!this.isAlive) return;

        const ctx = renderer.getContext();

        if (this.spriteSheetLoaded) {
            // Calculate source position based on current animation frame
            const srcX = this.animationFrame * this.spriteWidth;
            const srcY = 0;

            // Draw the current frame from the sprite sheet
            ctx.drawImage(
                this.spriteSheet,
                srcX, srcY, this.spriteWidth, this.spriteHeight,  // Source (frame from sprite sheet)
                this.x, this.y, this.width, this.height            // Destination
            );
        } else {
            // Fallback: circular barrel
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add bands for barrel appearance
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height / 3);
            ctx.lineTo(this.x + this.width, this.y + this.height / 3);
            ctx.moveTo(this.x, this.y + this.height * 2 / 3);
            ctx.lineTo(this.x + this.width, this.y + this.height * 2 / 3);
            ctx.stroke();
        }
    }

    /**
     * Get the collision bounds of the barrel
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
     * Destroy the barrel (when smashed by hammer)
     */
    destroy() {
        this.isAlive = false;
    }

    /**
     * Check if barrel is still active
     * @returns {boolean} True if barrel is alive
     */
    isActive() {
        return this.isAlive;
    }
}
