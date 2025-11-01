/**
 * InputHandler.js
 *
 * Manages keyboard input for the Donkey Kong game.
 * Tracks key states and provides methods to query current input state.
 */

class InputHandler {
    constructor() {
        // Track currently pressed keys
        this.keys = {};

        // Track keys that were just pressed this frame
        this.keysPressed = {};

        // Valid game keys that should have preventDefault called
        this.gameKeys = [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            ' ', // Spacebar
            'Space'
        ];

        // Bind event handlers to maintain 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

        // Register event listeners
        this.registerListeners();
    }

    /**
     * Register keyboard and window event listeners
     */
    registerListeners() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleBlur);
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event) {
        const key = event.key;

        // Prevent default behavior for game keys to avoid scrolling
        if (this.gameKeys.includes(key)) {
            event.preventDefault();
        }

        // Track key press (for one-time actions like starting a jump)
        if (!this.keys[key]) {
            this.keysPressed[key] = true;
        }

        // Track key hold state
        this.keys[key] = true;
    }

    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event) {
        const key = event.key;

        // Clear key states
        this.keys[key] = false;
        this.keysPressed[key] = false;
    }

    /**
     * Handle window blur event - clear all input states
     */
    handleBlur() {
        this.keys = {};
        this.keysPressed = {};
    }

    /**
     * Check if a key is currently held down
     * @param {string} key - The key to check (e.g., 'ArrowLeft', ' ')
     * @returns {boolean} True if the key is currently down
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }

    /**
     * Check if a key was just pressed this frame
     * Useful for one-time actions like jumping
     * @param {string} key - The key to check
     * @returns {boolean} True if the key was just pressed
     */
    isKeyPressed(key) {
        return this.keysPressed[key] === true;
    }

    /**
     * Clear the "just pressed" state for all keys
     * Should be called at the end of each frame
     */
    clearPressed() {
        this.keysPressed = {};
    }

    /**
     * Check if left arrow key is down
     * @returns {boolean}
     */
    isLeftDown() {
        return this.isKeyDown('ArrowLeft');
    }

    /**
     * Check if right arrow key is down
     * @returns {boolean}
     */
    isRightDown() {
        return this.isKeyDown('ArrowRight');
    }

    /**
     * Check if up arrow key is down
     * @returns {boolean}
     */
    isUpDown() {
        return this.isKeyDown('ArrowUp');
    }

    /**
     * Check if down arrow key is down
     * @returns {boolean}
     */
    isDownDown() {
        return this.isKeyDown('ArrowDown');
    }

    /**
     * Check if spacebar was just pressed
     * @returns {boolean}
     */
    isJumpPressed() {
        return this.isKeyPressed(' ') || this.isKeyPressed('Space');
    }

    /**
     * Clean up event listeners when destroying the handler
     */
    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('blur', this.handleBlur);
    }
}
