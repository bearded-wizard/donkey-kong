/**
 * DonkeyKong.js
 *
 * DonkeyKong antagonist entity that throws barrels.
 * Positioned at the top of the level.
 */

class DonkeyKong {
    /**
     * Create a new DonkeyKong
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(x, y) {
        // Position
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationFPS = 4; // Animation speed

        // Barrel throwing
        this.throwTimer = 0;
        this.throwDelay = 3.0; // Throw barrel every 3 seconds

        // State
        this.isThrowing = false;

        // Color fallback
        this.color = '#8B4513'; // Brown color

        // Sprite loading
        // Sprites: Platformer Characters Pack by Kenney (www.kenney.nl)
        // License: CC0 (Public Domain) - See assets/sprites/LICENSE-kenney.txt
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/sprites/kong.png';
        this.spriteSheetLoaded = false;
        this.spriteSheet.onload = () => {
            this.spriteSheetLoaded = true;
        };
        this.spriteSheet.onerror = () => {
            console.warn('Failed to load kong sprite, using fallback rendering');
            this.spriteSheetLoaded = false;
        };

        // Sprite configuration (same as player - 80x110 pixels, 9 columns)
        this.spriteWidth = 80;
        this.spriteHeight = 110;

        // Kong uses zombie character animations
        this.spriteConfig = {
            idle: [
                { x: 0, y: 0 },  // Standing
                { x: 1, y: 0 }   // Idle animation
            ],
            throw: [
                { x: 2, y: 0 },  // Throwing pose
                { x: 3, y: 0 }   // Follow-through
            ]
        };
    }

    /**
     * Update DonkeyKong state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     * @returns {boolean} True if should spawn a new barrel
     */
    update(deltaTime) {
        // Update animation
        this.animationTimer += deltaTime;
        const frameDuration = 1.0 / this.animationFPS;

        if (this.animationTimer >= frameDuration) {
            this.animationFrame++;
            this.animationTimer -= frameDuration;
        }

        // Update throw timer
        this.throwTimer += deltaTime;

        if (this.throwTimer >= this.throwDelay) {
            this.throwTimer = 0;
            this.isThrowing = true;
            // Return true to signal barrel spawn
            return true;
        }

        // Reset throwing animation after 0.5 seconds
        if (this.isThrowing && this.throwTimer > 0.5) {
            this.isThrowing = false;
        }

        return false;
    }

    /**
     * Render DonkeyKong
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        const ctx = renderer.getContext();

        if (this.spriteSheetLoaded) {
            // Choose sprite based on state
            const sprites = this.isThrowing ? this.spriteConfig.throw : this.spriteConfig.idle;
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
            // Fallback: simple kong representation
            // Body
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x + this.width * 0.2, this.y + this.height * 0.3,
                         this.width * 0.6, this.height * 0.5);

            // Head (larger)
            ctx.fillStyle = '#A0522D'; // Lighter brown
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height * 0.2,
                    this.width * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // Arms
            ctx.fillStyle = this.color;
            if (this.isThrowing) {
                // Throwing pose - one arm up
                ctx.fillRect(this.x + this.width * 0.7, this.y + this.height * 0.2,
                             this.width * 0.15, this.height * 0.3);
            } else {
                // Normal pose
                ctx.fillRect(this.x + this.width * 0.05, this.y + this.height * 0.3,
                             this.width * 0.15, this.height * 0.4);
                ctx.fillRect(this.x + this.width * 0.8, this.y + this.height * 0.3,
                             this.width * 0.15, this.height * 0.4);
            }

            // Eyes
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x + this.width * 0.35, this.y + this.height * 0.15,
                         this.width * 0.1, this.height * 0.08);
            ctx.fillRect(this.x + this.width * 0.55, this.y + this.height * 0.15,
                         this.width * 0.1, this.height * 0.08);
        }
    }

    /**
     * Get barrel spawn position
     * @returns {{x: number, y: number}} Spawn position for barrel
     */
    getBarrelSpawnPosition() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height
        };
    }

    /**
     * Get the collision bounds of kong
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
