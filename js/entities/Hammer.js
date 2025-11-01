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
        // Sprites: Platformer Art Deluxe by Kenney (www.kenney.nl)
        // License: CC0 (Public Domain) - See assets/sprites/LICENSE-kenney-deluxe.txt
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

        // Sprite dimensions (star.png is 70x70 pixels)
        this.spriteWidth = 70;
        this.spriteHeight = 70;
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
            // Fallback: star shape
            renderer.save();
            ctx.translate(this.x + this.width / 2, renderY + this.height / 2);

            // Draw star
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * this.width / 2;
                const y = Math.sin(angle) * this.height / 2;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();

            renderer.restore();
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
