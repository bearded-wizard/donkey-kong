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

    /**
     * Detect if the current device is a mobile or touch-enabled device
     *
     * Uses multiple detection methods for reliable mobile/tablet detection:
     * 1. Touch support: Checks for 'ontouchstart' in window
     * 2. Touch points: Checks navigator.maxTouchPoints > 0
     * 3. Screen width: Checks if width <= MOBILE_BREAKPOINT (768px)
     *
     * Returns true if ANY of these conditions are met, ensuring:
     * - Mobile phones are detected (touch + narrow screen)
     * - Tablets are detected (touch + wide screen)
     * - Desktop touch screens are detected (touch on wide screen)
     * - Desktops without touch return false (no touch + wide screen)
     *
     * @returns {boolean} True if device should display mobile controls
     *
     * @example
     * // Check before rendering touch controls
     * if (InputHandler.isMobileDevice()) {
     *     renderTouchControls();
     * }
     */
    static isMobileDevice() {
        // Check for touch event support
        const hasTouchSupport = 'ontouchstart' in window;

        // Check for touch points (more reliable on modern devices)
        const hasTouchPoints = navigator.maxTouchPoints > 0;

        // Check screen width against mobile breakpoint
        const isNarrowScreen = window.matchMedia(`(max-width: ${Constants.MOBILE_BREAKPOINT}px)`).matches;

        // Return true if ANY mobile indicator is present
        return hasTouchSupport || hasTouchPoints || isNarrowScreen;
    }
}
