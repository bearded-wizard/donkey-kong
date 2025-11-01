/**
 * Hammer.js
 *
 * Hammer power-up entity that gives the player temporary invincibility
 * and the ability to destroy barrels.
 */

class Hammer {
    /**
     * Create a new hammer power-up
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(x, y) {
        // Position
        this.x = x;
        this.y = y;
        this.width = Constants.HAMMER_WIDTH;
        this.height = Constants.HAMMER_HEIGHT;

        // State
        this.isCollected = false;
        this.isVisible = true;

        // Animation
        this.bobOffset = 0;
        this.bobSpeed = 2; // oscillation speed

        // Color fallback
        this.color = '#FFD700'; // Gold color

        // Sprite loading
        // Custom hammer sprite (retro arcade style)
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/sprites/hammer.png';
        this.spriteSheetLoaded = false;
        this.spriteSheet.onload = () => {
            this.spriteSheetLoaded = true;
        };
        this.spriteSheet.onerror = () => {
            console.warn('Failed to load hammer sprite, using fallback rendering');
            this.spriteSheetLoaded = false;
        };

        // Sprite dimensions (hammer.png is 64x64 pixels)
        this.spriteWidth = 64;
        this.spriteHeight = 64;
    }

    /**
     * Update hammer power-up
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        if (this.isCollected) return;

        // Bob up and down animation
        this.bobOffset = Math.sin(Date.now() * 0.003 * this.bobSpeed) * 5;
    }

    /**
     * Render the hammer
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        if (this.isCollected || !this.isVisible) return;

        const ctx = renderer.getContext();
        const renderY = this.y + this.bobOffset;

        if (this.spriteSheetLoaded) {
            // Draw sprite (star/power-up)
            ctx.drawImage(
                this.spriteSheet,
                0, 0, this.spriteWidth, this.spriteHeight,  // Source
                this.x, renderY, this.width, this.height    // Destination
            );
        } else {
            // Fallback: simple hammer shape
            const centerX = this.x + this.width / 2;
            const centerY = renderY + this.height / 2;

            // Hammer head
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(
                centerX - this.width * 0.4,
                centerY - this.height * 0.25,
                this.width * 0.5,
                this.height * 0.3
            );

            // Hammer handle
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(
                centerX - this.width * 0.1,
                centerY - this.height * 0.1,
                this.width * 0.2,
                this.height * 0.5
            );

            // Gold outline for power-up glow
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                centerX - this.width * 0.4,
                centerY - this.height * 0.25,
                this.width * 0.5,
                this.height * 0.3
            );
        }
    }

    /**
     * Check collision with player
     * @param {Player} player - The player object
     * @returns {boolean} True if player collected the hammer
     */
    checkCollision(player) {
        if (this.isCollected) return false;

        const playerBounds = player.getBounds();
        const hammerBounds = this.getBounds();

        // Check bounding box collision
        if (playerBounds.x < hammerBounds.x + hammerBounds.width &&
            playerBounds.x + playerBounds.width > hammerBounds.x &&
            playerBounds.y < hammerBounds.y + hammerBounds.height &&
            playerBounds.y + playerBounds.height > hammerBounds.y) {
            this.collect();
            return true;
        }

        return false;
    }

    /**
     * Collect the hammer
     */
    collect() {
        this.isCollected = true;
        this.isVisible = false;
    }

    /**
     * Get the collision bounds of the hammer
     * @returns {{x: number, y: number, width: number, height: number}} Bounding box
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y + this.bobOffset,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Check if hammer has been collected
     * @returns {boolean} True if collected
     */
    isActive() {
        return !this.isCollected;
    }
}
