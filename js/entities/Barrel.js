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

        // Physics object for compatibility with Physics class
        this.position = { x: this.x, y: this.y };
        this.velocity = { x: this.velocityX, y: this.velocityY };

        // Rotation for visual rolling effect
        this.rotation = 0;
        this.rotationSpeed = 5; // radians per second

        // Color fallback
        this.color = Constants.COLOR_BARREL;

        // Sprite loading
        // Sprites: Platformer Art Deluxe by Kenney (www.kenney.nl)
        // License: CC0 (Public Domain) - See assets/sprites/LICENSE-kenney-deluxe.txt
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

        // Sprite dimensions (bomb.png is 70x70 pixels)
        this.spriteWidth = 70;
        this.spriteHeight = 70;
    }

    /**
     * Update barrel state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     * @param {Array<Platform>} platforms - Array of platform objects
     */
    update(deltaTime, platforms) {
        if (!this.isAlive) return;

        // Apply gravity when not on platform
        Physics.applyGravity(this, deltaTime);

        // Update rotation based on horizontal velocity
        this.rotation += (this.velocity.x / 20) * deltaTime;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        this.x = this.position.x;
        this.y = this.position.y;

        // Handle platform collisions
        this.handlePlatformCollisions(platforms);

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
     * Render the barrel
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        if (!this.isAlive) return;

        // Save canvas state for rotation
        renderer.save();

        const ctx = renderer.getContext();

        // Translate to barrel center for rotation
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.width / 2, -this.height / 2);

        if (this.spriteSheetLoaded) {
            // Draw sprite
            ctx.drawImage(
                this.spriteSheet,
                0, 0, this.spriteWidth, this.spriteHeight,  // Source
                0, 0, this.width, this.height                // Destination
            );
        } else {
            // Fallback: circular barrel
            ctx.beginPath();
            ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add bands for barrel appearance
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, this.height / 3);
            ctx.lineTo(this.width, this.height / 3);
            ctx.moveTo(0, this.height * 2 / 3);
            ctx.lineTo(this.width, this.height * 2 / 3);
            ctx.stroke();
        }

        // Restore canvas state
        renderer.restore();
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
