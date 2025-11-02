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

        // Animation state machine (issue #29)
        this.animationState = 'idle'; // Current animation state: 'idle' or 'throw'
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationFPS = Constants.DK_ANIMATION_FPS; // Use constant from Constants.js

        // Barrel throwing
        this.throwTimer = 0;
        this.throwDelay = this.getRandomThrowDelay(); // Random delay between throws
        this.throwAnimationDuration = 0.5; // Duration of throw animation in seconds (issue #29)

        // Color fallback
        this.color = '#8B4513'; // Brown color

        // Sprite loading (Simplified Platformer Pack)
        // Sprites: Simplified Platformer Pack by Kenney (www.kenney.nl)
        // License: CC0 (Public Domain) - See assets/sprites/LICENSE-kenney.txt
        this.sprites = {
            happy: new Image(),
            walk: new Image(),
            throw: new Image()
        };
        this.sprites.happy.src = 'assets/sprites/antagonist-happy.png';
        this.sprites.walk.src = 'assets/sprites/antagonist-walk.png';
        this.sprites.throw.src = 'assets/sprites/antagonist-throw.png';

        // Track loading state for each sprite
        this.spritesLoaded = {
            happy: false,
            walk: false,
            throw: false
        };
        this.sprites.happy.onload = () => {
            this.spritesLoaded.happy = true;
        };
        this.sprites.walk.onload = () => {
            this.spritesLoaded.walk = true;
        };
        this.sprites.throw.onload = () => {
            this.spritesLoaded.throw = true;
        };

        // Error handling for sprite loading
        this.sprites.happy.onerror = () => {
            console.warn('Failed to load antagonist happy sprite, using fallback rendering');
            this.spritesLoaded.happy = false;
        };
        this.sprites.walk.onerror = () => {
            console.warn('Failed to load antagonist walk sprite, using fallback rendering');
            this.spritesLoaded.walk = false;
        };
        this.sprites.throw.onerror = () => {
            console.warn('Failed to load antagonist throw sprite, using fallback rendering');
            this.spritesLoaded.throw = false;
        };

        // Sprite configuration (Simplified Pack - 96x96 pixels)
        this.spriteWidth = 96;
        this.spriteHeight = 96;

        // Antagonist animation configuration using individual sprites
        this.spriteConfig = {
            idle: [
                { sprite: 'happy' },  // Menacing stance with personality
                { sprite: 'walk' }    // Subtle movement for living idle
            ],
            throw: [
                { sprite: 'throw' },  // Dynamic throwing action
                { sprite: 'happy' }   // Return to menacing stance
            ]
        };
    }

    /**
     * Update DonkeyKong state
     * Issue #29: Enhanced animation state machine
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     * @returns {boolean} True if should spawn a new barrel
     */
    update(deltaTime) {
        // Update animation frame timer
        this.animationTimer += deltaTime;
        const frameDuration = 1.0 / this.animationFPS;

        if (this.animationTimer >= frameDuration) {
            this.animationFrame++;
            this.animationTimer -= frameDuration;
        }

        // Update throw timer
        this.throwTimer += deltaTime;

        let shouldSpawnBarrel = false;

        // Animation state machine (issue #29)
        switch (this.animationState) {
            case 'idle':
                // Check if it's time to throw a barrel
                if (this.throwTimer >= this.throwDelay) {
                    // Transition to throw state
                    this.animationState = 'throw';
                    this.animationFrame = 0; // Reset animation frame for throw
                    this.throwTimer = 0;
                    shouldSpawnBarrel = true; // Spawn barrel when throw animation starts
                }
                break;

            case 'throw':
                // Stay in throw animation for duration
                if (this.throwTimer >= this.throwAnimationDuration) {
                    // Transition back to idle
                    this.animationState = 'idle';
                    this.animationFrame = 0; // Reset animation frame for idle
                    this.throwTimer = 0;
                    this.throwDelay = this.getRandomThrowDelay(); // Get new random delay
                }
                break;
        }

        return shouldSpawnBarrel;
    }

    /**
     * Render DonkeyKong
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        const ctx = renderer.getContext();

        // Choose sprite based on animation state (issue #29)
        const sprites = this.animationState === 'throw' ? this.spriteConfig.throw : this.spriteConfig.idle;
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
                0, 0, this.spriteWidth, this.spriteHeight,  // Source (full 96x96 sprite)
                this.x, this.y, this.width, this.height      // Destination (scaled to 60x60)
            );

            // Restore context state
            ctx.restore();
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
            if (this.animationState === 'throw') {
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

    /**
     * Get random throw delay for barrel spawning
     * @returns {number} Random delay in seconds between min and max
     */
    getRandomThrowDelay() {
        const min = Constants.BARREL_SPAWN_MIN_DELAY;
        const max = Constants.BARREL_SPAWN_MAX_DELAY;
        return min + Math.random() * (max - min);
    }
}
