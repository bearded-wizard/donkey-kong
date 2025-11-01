/**
 * Princess.js
 *
 * Princess character entity that the player must rescue.
 * Positioned at the top of the level as the goal.
 */

class Princess {
    /**
     * Create a new princess
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(x, y) {
        // Position
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 50;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationFPS = 2; // Slow idle animation

        // Color fallback
        this.color = '#FF69B4'; // Pink color

        // Sprite loading
        // Sprites: Platformer Characters Pack by Kenney (www.kenney.nl)
        // License: CC0 (Public Domain) - See assets/sprites/LICENSE-kenney.txt
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/sprites/princess.png';
        this.spriteSheetLoaded = false;
        this.spriteSheet.onload = () => {
            this.spriteSheetLoaded = true;
        };
        this.spriteSheet.onerror = () => {
            console.warn('Failed to load princess sprite, using fallback rendering');
            this.spriteSheetLoaded = false;
        };

        // Sprite configuration (same as player - 80x110 pixels, 9 columns)
        this.spriteWidth = 80;
        this.spriteHeight = 110;

        // Princess uses idle animation from female character
        this.spriteConfig = {
            idle: [
                { x: 0, y: 0 },  // Standing
                { x: 1, y: 0 }   // Slight movement
            ]
        };
    }

    /**
     * Update princess state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Update animation
        this.animationTimer += deltaTime;
        const frameDuration = 1.0 / this.animationFPS;

        if (this.animationTimer >= frameDuration) {
            this.animationFrame++;
            this.animationTimer -= frameDuration;
        }
    }

    /**
     * Render the princess
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        const ctx = renderer.getContext();

        if (this.spriteSheetLoaded) {
            // Get current sprite frame
            const sprites = this.spriteConfig.idle;
            const frameIndex = this.animationFrame % sprites.length;
            const sprite = sprites[frameIndex];

            // Calculate source position
            const srcX = sprite.x * this.spriteWidth;
            const srcY = sprite.y * this.spriteHeight;

            // Draw sprite
            ctx.drawImage(
                this.spriteSheet,
                srcX, srcY, this.spriteWidth, this.spriteHeight,  // Source
                this.x, this.y, this.width, this.height            // Destination
            );
        } else {
            // Fallback: simple princess representation
            // Dress
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.4,
                         this.width * 0.6, this.height * 0.6);

            // Head
            ctx.fillStyle = '#FFDBAC'; // Skin tone
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height * 0.2,
                    this.width * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Crown
            ctx.fillStyle = '#FFD700'; // Gold
            ctx.fillRect(this.x + this.width * 0.3, this.y + this.height * 0.05,
                         this.width * 0.4, this.height * 0.1);
        }
    }

    /**
     * Check collision with player (for level completion)
     * @param {Player} player - The player object
     * @returns {boolean} True if player reached princess
     */
    checkCollision(player) {
        const playerBounds = player.getBounds();
        const princessBounds = this.getBounds();

        return (playerBounds.x < princessBounds.x + princessBounds.width &&
                playerBounds.x + playerBounds.width > princessBounds.x &&
                playerBounds.y < princessBounds.y + princessBounds.height &&
                playerBounds.y + playerBounds.height > princessBounds.y);
    }

    /**
     * Get the collision bounds of the princess
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
}
