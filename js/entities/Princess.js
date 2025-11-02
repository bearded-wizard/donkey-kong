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
        // Position - use constants
        this.x = x;
        this.y = y;
        this.width = Constants.PRINCESS_WIDTH;
        this.height = Constants.PRINCESS_HEIGHT;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationFPS = Constants.PRINCESS_ANIMATION_FPS;

        // Color fallback
        this.color = '#FF69B4'; // Pink color

        // Sprite loading (Simplified Platformer Pack)
        // Sprites: Simplified Platformer Pack by Kenney (www.kenney.nl)
        // License: CC0 (Public Domain) - See assets/sprites/LICENSE-kenney.txt
        this.sprites = {
            idle: new Image(),
            front: new Image()
        };
        this.sprites.idle.src = Constants.PRINCESS_SPRITE_IDLE;
        this.sprites.front.src = Constants.PRINCESS_SPRITE_FRONT;

        // Track loading state for each sprite
        this.spritesLoaded = {
            idle: false,
            front: false
        };
        this.sprites.idle.onload = () => {
            this.spritesLoaded.idle = true;
        };
        this.sprites.front.onload = () => {
            this.spritesLoaded.front = true;
        };

        // Error handling for sprite loading
        this.sprites.idle.onerror = () => {
            console.warn('Failed to load princess idle sprite, using fallback rendering');
            this.spritesLoaded.idle = false;
        };
        this.sprites.front.onerror = () => {
            console.warn('Failed to load princess front sprite, using fallback rendering');
            this.spritesLoaded.front = false;
        };

        // Sprite configuration (Simplified Pack - 128x128 pixels)
        this.spriteWidth = 128;
        this.spriteHeight = 128;

        // Princess animation configuration using individual sprites
        this.spriteConfig = {
            idle: [
                { sprite: 'idle' },   // Idle stance
                { sprite: 'front' }   // Alternating with front view
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

        // Get current sprite frame
        const sprites = this.spriteConfig.idle;
        const frameIndex = this.animationFrame % sprites.length;
        const spriteConfig = sprites[frameIndex];
        const spriteName = spriteConfig.sprite;

        // Check if this specific sprite is loaded and ready to draw
        const spriteImage = this.sprites[spriteName];
        const spriteLoaded = this.spritesLoaded[spriteName];
        const imageReady = spriteImage && spriteImage.complete && spriteImage.naturalWidth > 0;

        if (spriteLoaded && imageReady) {
            // Save context state
            ctx.save();

            // Draw full sprite image scaled to display size
            ctx.drawImage(
                spriteImage,
                0, 0, this.spriteWidth, this.spriteHeight,  // Source (full 128x128 sprite)
                this.x, this.y, this.width, this.height      // Destination (scaled to display size)
            );

            // Restore context state
            ctx.restore();
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
