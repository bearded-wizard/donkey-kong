/**
 * MobileControls.js
 *
 * Manages mobile touch UI rendering and event handling for Barrel Blaster.
 * Provides virtual D-pad and jump button for mobile gameplay.
 *
 * Features:
 * - Touch event handling for mobile devices
 * - Virtual D-pad (left, right, up, down)
 * - Jump button
 * - Visual feedback for button presses
 * - Integration with InputHandler for unified input
 * - Automatic show/hide based on device detection
 */

class MobileControls {
    /**
     * Create a new MobileControls instance
     * @param {HTMLCanvasElement} canvas - The game canvas for touch events
     * @param {InputHandler} inputHandler - Input handler to update button states
     * @param {Object} constants - Constants object (typically Constants.js)
     * @param {SettingsManager} settingsManager - Settings manager for button customization (optional)
     */
    constructor(canvas, inputHandler, constants, settingsManager = null) {
        // Store references
        this.canvas = canvas;
        this.inputHandler = inputHandler;
        this.constants = constants;
        this.settingsManager = settingsManager;

        // Tutorial overlay (issue #155)
        this.tutorialOverlay = null;

        // Track active touches by touch ID
        this.activeTouches = new Map();

        // Current settings (size multiplier, opacity)
        this.sizeMultiplier = 1.0;
        this.opacity = 0.6;

        // Load settings from SettingsManager if available (issue #151)
        if (this.settingsManager) {
            this.loadSettings();
        }

        // Button definitions array (positions, sizes, types)
        this.buttons = this.initializeButtonDefinitions();

        // Track button animation state for smooth transitions
        // Maps button type to animation state object
        this.buttonStates = new Map();
        this.initializeButtonStates();

        // Bind event handlers to maintain 'this' context
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchCancel = this.handleTouchCancel.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Setup touch event listeners on canvas
        this.setupTouchListeners();

        // Setup resize listener for responsive scaling (issue #156)
        this.setupResizeListener();

        // Track small screen state for resize detection (issue #156)
        this._wasSmallScreen = this.isSmallScreen();

        // Initialize tutorial overlay for first-time mobile users (issue #155)
        this.initializeTutorial();

        // Performance optimization state (issue #157)
        this.lastTouchMoveTime = 0;
        this.touchMoveThrottleDelay = this.constants.MOBILE_TOUCHMOVE_THROTTLE_MS;
        this.performanceLogging = this.constants.MOBILE_PERFORMANCE_LOGGING;
        this.dirtyFlagEnabled = this.constants.MOBILE_DIRTY_FLAG_OPTIMIZATION;
        this.anyButtonNeedsRedraw = false;

        // Virtual joystick state (issue #158)
        this.joystickState = {
            active: false,
            touchId: null,
            centerX: 0,
            centerY: 0,
            thumbX: 0,
            thumbY: 0,
            currentDirection: null, // Current 8-way direction
            opacity: this.constants.JOYSTICK_OPACITY,
            glowBlur: this.constants.JOYSTICK_GLOW_BLUR,
            needsRedraw: false
        };

        // Initialize joystick position
        this.initializeJoystickPosition();
    }

    /**
     * Initialize tutorial overlay for first-time mobile users (issue #155)
     */
    initializeTutorial() {
        // Only show tutorial on mobile devices
        if (InputHandler.isMobileDevice()) {
            this.tutorialOverlay = new MobileTutorialOverlay(this.constants, this);
        }
    }

    /**
     * Initialize joystick position (issue #158)
     * Places joystick in bottom-left corner, matching D-pad position
     */
    initializeJoystickPosition() {
        const responsiveScale = this.getResponsiveScaleFactor();
        const responsiveMarginScale = this.getResponsiveMarginScale();
        const baseRadius = this.constants.JOYSTICK_BASE_RADIUS * this.sizeMultiplier * responsiveScale;
        const margin = this.constants.MOBILE_DPAD_MARGIN * responsiveMarginScale;

        // Center joystick in same area as D-pad
        this.joystickState.centerX = margin + baseRadius;
        this.joystickState.centerY = this.constants.CANVAS_HEIGHT - margin - baseRadius;

        // Initialize thumb at center
        this.joystickState.thumbX = this.joystickState.centerX;
        this.joystickState.thumbY = this.joystickState.centerY;
    }

    /**
     * Detect if screen width is below small screen threshold (issue #156)
     * Checks actual viewport width, not canvas resolution
     * @returns {boolean} True if screen width < MOBILE_SMALL_SCREEN_WIDTH
     */
    isSmallScreen() {
        // Use window.innerWidth to check actual device/viewport width
        return window.innerWidth < this.constants.MOBILE_SMALL_SCREEN_WIDTH;
    }

    /**
     * Calculate responsive scale factor based on screen width (issue #156)
     * Applies additional scaling for very small screens (< 400px)
     * This is multiplicative with user's size preference
     * @returns {number} Scale factor (0.8 for small screens, 1.0 otherwise)
     */
    getResponsiveScaleFactor() {
        return this.isSmallScreen() ? this.constants.MOBILE_SMALL_SCREEN_SCALE : 1.0;
    }

    /**
     * Calculate responsive margin scale factor (issue #156)
     * Scales margins proportionally with button size on small screens
     * @returns {number} Margin scale factor (0.8 for small screens, 1.0 otherwise)
     */
    getResponsiveMarginScale() {
        return this.isSmallScreen() ? this.constants.MOBILE_SMALL_SCREEN_MARGIN_SCALE : 1.0;
    }

    /**
     * Initialize button definitions with positions, sizes, and types
     * Creates D-pad buttons (left, right, up, down) and jump button
     * @returns {Array} Array of button definition objects
     */
    initializeButtonDefinitions() {
        // Apply size multiplier from settings (issue #151)
        // Then apply responsive scaling for small screens (issue #156)
        const responsiveScale = this.getResponsiveScaleFactor();
        const responsiveMarginScale = this.getResponsiveMarginScale();

        const buttonSize = this.constants.MOBILE_BUTTON_SIZE * this.sizeMultiplier * responsiveScale;
        const jumpButtonSize = this.constants.MOBILE_JUMP_BUTTON_SIZE * this.sizeMultiplier * responsiveScale;
        const dpadMargin = this.constants.MOBILE_DPAD_MARGIN * responsiveMarginScale;
        const jumpMargin = this.constants.MOBILE_JUMP_MARGIN * responsiveMarginScale;

        // Calculate button positions
        // D-pad positioned in bottom-left corner
        const dpadCenterX = dpadMargin + buttonSize;
        const dpadCenterY = this.constants.CANVAS_HEIGHT - dpadMargin - buttonSize;

        // Jump button positioned in bottom-right corner (larger than D-pad)
        const jumpX = this.constants.CANVAS_WIDTH - jumpMargin - jumpButtonSize;
        const jumpY = this.constants.CANVAS_HEIGHT - jumpMargin - jumpButtonSize;

        return [
            // D-pad buttons
            {
                type: 'left',
                x: dpadCenterX - buttonSize,
                y: dpadCenterY,
                width: buttonSize,
                height: buttonSize,
                bgColor: this.constants.MOBILE_COLOR_DPAD_BG,
                borderColor: this.constants.MOBILE_COLOR_DPAD_BORDER,
                label: '\u25C0' // Left arrow ◀
            },
            {
                type: 'right',
                x: dpadCenterX + buttonSize,
                y: dpadCenterY,
                width: buttonSize,
                height: buttonSize,
                bgColor: this.constants.MOBILE_COLOR_DPAD_BG,
                borderColor: this.constants.MOBILE_COLOR_DPAD_BORDER,
                label: '\u25B6' // Right arrow ▶
            },
            {
                type: 'up',
                x: dpadCenterX,
                y: dpadCenterY - buttonSize,
                width: buttonSize,
                height: buttonSize,
                bgColor: this.constants.MOBILE_COLOR_DPAD_BG,
                borderColor: this.constants.MOBILE_COLOR_DPAD_BORDER,
                label: '\u25B2' // Up arrow ▲
            },
            {
                type: 'down',
                x: dpadCenterX,
                y: dpadCenterY + buttonSize,
                width: buttonSize,
                height: buttonSize,
                bgColor: this.constants.MOBILE_COLOR_DPAD_BG,
                borderColor: this.constants.MOBILE_COLOR_DPAD_BORDER,
                label: '\u25BC' // Down arrow ▼
            },
            // Jump button (larger for better thumb accessibility)
            {
                type: 'jump',
                x: jumpX,
                y: jumpY,
                width: jumpButtonSize,
                height: jumpButtonSize,
                bgColor: this.constants.MOBILE_COLOR_JUMP_BG,
                borderColor: this.constants.MOBILE_COLOR_JUMP_BORDER,
                label: 'JUMP'
            }
        ];
    }

    /**
     * Initialize button animation states
     * Creates state tracking objects for smooth transitions
     */
    initializeButtonStates() {
        for (const button of this.buttons) {
            this.buttonStates.set(button.type, {
                isPressed: false,
                currentScale: this.constants.MOBILE_BUTTON_SCALE_NORMAL,
                currentOpacity: this.constants.MOBILE_BUTTON_OPACITY,
                currentGlowBlur: this.constants.MOBILE_GLOW_BLUR,
                transitionProgress: 0, // 0 = normal, 1 = fully pressed
                lastPressTime: 0,
                needsRedraw: true // Flag to optimize rendering
            });
        }
    }

    /**
     * Setup touch event listeners on canvas (issue #157: optimized)
     * Uses non-passive listeners to allow preventDefault() for game controls
     * Note: passive: true would improve scroll performance but prevent default behavior
     */
    setupTouchListeners() {
        // Non-passive listeners required to prevent default touch behaviors
        // that would interfere with game (like scrolling/zooming)
        // Performance impact is minimal as we optimize event handlers instead
        const passive = this.constants.MOBILE_PASSIVE_LISTENERS;

        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive });
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel, { passive });
    }

    /**
     * Setup resize listener for responsive button scaling (issue #156)
     * Detects window resize and device orientation changes
     */
    setupResizeListener() {
        // Listen for window resize events (includes orientation change)
        window.addEventListener('resize', this.handleResize);
    }

    /**
     * Handle window resize event (issue #156)
     * (issue #158: rebuild joystick position on resize)
     * Rebuilds button definitions if screen size crosses the small screen threshold
     */
    handleResize() {
        // Only rebuild buttons on mobile devices
        if (!InputHandler.isMobileDevice()) {
            return;
        }

        // Store previous small screen state
        const wasSmallScreen = this._wasSmallScreen !== undefined ? this._wasSmallScreen : this.isSmallScreen();
        const isSmallScreen = this.isSmallScreen();

        // Only rebuild if we crossed the threshold
        if (wasSmallScreen !== isSmallScreen) {
            this._wasSmallScreen = isSmallScreen;

            // Rebuild button definitions with new scaling
            this.buttons = this.initializeButtonDefinitions();

            // Reinitialize button states
            this.initializeButtonStates();

            // Rebuild joystick position with new scaling (issue #158)
            this.initializeJoystickPosition();
        }
    }

    /**
     * Handle touch start event (issue #157: optimized with performance logging)
     * (issue #158: added joystick support)
     * @param {TouchEvent} event - The touch event
     */
    handleTouchStart(event) {
        const startTime = this.performanceLogging ? performance.now() : 0;

        event.preventDefault();

        // If tutorial is showing, delegate touch to tutorial (issue #155)
        if (this.tutorialOverlay && this.tutorialOverlay.isShowing()) {
            this.tutorialOverlay.handleTouchStart(event, this.canvas);
            return;
        }

        // Cache canvas bounds calculation (optimization: avoid repeated getBoundingClientRect)
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.constants.CANVAS_WIDTH / rect.width;
        const scaleY = this.constants.CANVAS_HEIGHT / rect.height;

        // Process each new touch
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];

            // Convert screen coordinates to canvas coordinates
            const canvasX = (touch.clientX - rect.left) * scaleX;
            const canvasY = (touch.clientY - rect.top) * scaleY;

            // Check for joystick mode (issue #158)
            if (this.isJoystickMode()) {
                // Check if touch is in joystick area
                if (this.isTouchInJoystickArea(canvasX, canvasY)) {
                    this.joystickState.active = true;
                    this.joystickState.touchId = touch.identifier;
                    this.updateJoystickThumb(canvasX, canvasY);
                    this.triggerHaptic();
                    continue; // Skip button processing
                }
            }

            // D-pad/button mode or jump button (always available)
            const button = this.getTouchedButton(canvasX, canvasY);

            if (button) {
                // Store active touch
                this.activeTouches.set(touch.identifier, button.type);

                // Update button state for animation
                const state = this.buttonStates.get(button.type);
                if (state && !state.isPressed) {
                    state.isPressed = true;
                    state.lastPressTime = Date.now();
                    state.needsRedraw = true;
                    this.anyButtonNeedsRedraw = true;
                }

                // Update input handler
                this.inputHandler.setTouchButton(button.type, true);

                // Trigger haptic feedback if enabled
                this.triggerHaptic();
            }
        }

        // Performance logging (issue #157)
        if (this.performanceLogging) {
            const duration = performance.now() - startTime;
            if (duration > this.constants.MOBILE_MAX_EVENT_TIME_MS) {
                console.warn(`[MobileControls] touchstart took ${duration.toFixed(2)}ms (target: <${this.constants.MOBILE_MAX_EVENT_TIME_MS}ms)`);
            }
        }
    }

    /**
     * Handle touch move event (issue #157: optimized with throttling)
     * (issue #158: added joystick support)
     * Throttles high-frequency touch updates to 60 FPS (16ms intervals)
     * @param {TouchEvent} event - The touch event
     */
    handleTouchMove(event) {
        const startTime = this.performanceLogging ? performance.now() : 0;

        event.preventDefault();

        // Throttle touchmove to 60 FPS (16ms) to prevent excessive processing (issue #157)
        const now = performance.now();
        if (now - this.lastTouchMoveTime < this.touchMoveThrottleDelay) {
            return; // Skip this event, too soon since last one
        }
        this.lastTouchMoveTime = now;

        // Cache canvas bounds calculation (optimization: single call per event)
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.constants.CANVAS_WIDTH / rect.width;
        const scaleY = this.constants.CANVAS_HEIGHT / rect.height;

        // Process each moved touch
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];

            // Convert screen coordinates to canvas coordinates
            const canvasX = (touch.clientX - rect.left) * scaleX;
            const canvasY = (touch.clientY - rect.top) * scaleY;

            // Check if this is the joystick touch (issue #158)
            if (this.isJoystickMode() &&
                this.joystickState.active &&
                touch.identifier === this.joystickState.touchId) {
                this.updateJoystickThumb(canvasX, canvasY);
                continue; // Skip button processing
            }

            // Get the button currently associated with this touch
            const currentButton = this.activeTouches.get(touch.identifier);

            // Check which button is now under the touch (optimized hit detection)
            const newButton = this.getTouchedButton(canvasX, canvasY);

            // If touch moved off button or to different button
            if (!newButton || (newButton && newButton.type !== currentButton)) {
                // Release the previous button
                if (currentButton) {
                    this.inputHandler.setTouchButton(currentButton, false);
                    this.activeTouches.delete(touch.identifier);

                    // Update button state
                    const oldState = this.buttonStates.get(currentButton);
                    if (oldState) {
                        oldState.isPressed = false;
                        oldState.needsRedraw = true;
                        this.anyButtonNeedsRedraw = true;
                    }
                }

                // Press the new button
                if (newButton) {
                    this.activeTouches.set(touch.identifier, newButton.type);
                    this.inputHandler.setTouchButton(newButton.type, true);

                    // Update button state
                    const newState = this.buttonStates.get(newButton.type);
                    if (newState) {
                        newState.isPressed = true;
                        newState.lastPressTime = Date.now();
                        newState.needsRedraw = true;
                        this.anyButtonNeedsRedraw = true;
                    }
                }
            }
        }

        // Performance logging (issue #157)
        if (this.performanceLogging) {
            const duration = performance.now() - startTime;
            if (duration > this.constants.MOBILE_MAX_EVENT_TIME_MS) {
                console.warn(`[MobileControls] touchmove took ${duration.toFixed(2)}ms (target: <${this.constants.MOBILE_MAX_EVENT_TIME_MS}ms)`);
            }
        }
    }

    /**
     * Handle touch end event (issue #157: optimized with performance logging)
     * (issue #158: added joystick support)
     * @param {TouchEvent} event - The touch event
     */
    handleTouchEnd(event) {
        const startTime = this.performanceLogging ? performance.now() : 0;

        event.preventDefault();

        // If tutorial is showing, delegate touch to tutorial (issue #155)
        if (this.tutorialOverlay && this.tutorialOverlay.isShowing()) {
            this.tutorialOverlay.handleTouchEnd(event);
            return;
        }

        // Process each ended touch
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];

            // Check if this is the joystick touch (issue #158)
            if (this.isJoystickMode() &&
                this.joystickState.active &&
                touch.identifier === this.joystickState.touchId) {
                this.resetJoystick();
                continue; // Skip button processing
            }

            const button = this.activeTouches.get(touch.identifier);

            if (button) {
                // Release button in input handler
                this.inputHandler.setTouchButton(button, false);

                // Update button state
                const state = this.buttonStates.get(button);
                if (state) {
                    state.isPressed = false;
                    state.needsRedraw = true;
                    this.anyButtonNeedsRedraw = true;
                }

                // Remove from active touches
                this.activeTouches.delete(touch.identifier);
            }
        }

        // Performance logging (issue #157)
        if (this.performanceLogging) {
            const duration = performance.now() - startTime;
            if (duration > this.constants.MOBILE_MAX_EVENT_TIME_MS) {
                console.warn(`[MobileControls] touchend took ${duration.toFixed(2)}ms (target: <${this.constants.MOBILE_MAX_EVENT_TIME_MS}ms)`);
            }
        }
    }

    /**
     * Handle touch cancel event
     * @param {TouchEvent} event - The touch event
     */
    handleTouchCancel(event) {
        // Treat cancel same as end
        this.handleTouchEnd(event);
    }

    /**
     * Check if control scheme is set to joystick (issue #158)
     * @returns {boolean} True if joystick control scheme is active
     */
    isJoystickMode() {
        if (!this.settingsManager) return false;
        return this.settingsManager.get('controlScheme') === 'joystick';
    }

    /**
     * Check if touch is within joystick base area (issue #158)
     * @param {number} x - Canvas X coordinate
     * @param {number} y - Canvas Y coordinate
     * @returns {boolean} True if touch is within joystick area
     */
    isTouchInJoystickArea(x, y) {
        const responsiveScale = this.getResponsiveScaleFactor();
        const baseRadius = this.constants.JOYSTICK_BASE_RADIUS * this.sizeMultiplier * responsiveScale;

        const dx = x - this.joystickState.centerX;
        const dy = y - this.joystickState.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= baseRadius;
    }

    /**
     * Calculate 8-directional input from joystick position (issue #158)
     * Converts analog thumb position to digital 8-way directional input
     * @param {number} dx - Delta X from center
     * @param {number} dy - Delta Y from center
     * @returns {Object|null} Direction object with up/down/left/right booleans, or null if in dead zone
     */
    calculateJoystickDirection(dx, dy) {
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check dead zone
        if (distance < this.constants.JOYSTICK_DEAD_ZONE) {
            return null; // No input in dead zone
        }

        // Calculate angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Normalize to 0-360
        if (angle < 0) angle += 360;

        // 8-directional zones (45 degrees each)
        // Right: 337.5-22.5 (0°)
        // Down-Right: 22.5-67.5 (45°)
        // Down: 67.5-112.5 (90°)
        // Down-Left: 112.5-157.5 (135°)
        // Left: 157.5-202.5 (180°)
        // Up-Left: 202.5-247.5 (225°)
        // Up: 247.5-292.5 (270°)
        // Up-Right: 292.5-337.5 (315°)

        const direction = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        // Right (337.5-22.5)
        if (angle >= 337.5 || angle < 22.5) {
            direction.right = true;
        }
        // Down-Right (22.5-67.5)
        else if (angle >= 22.5 && angle < 67.5) {
            direction.right = true;
            direction.down = true;
        }
        // Down (67.5-112.5)
        else if (angle >= 67.5 && angle < 112.5) {
            direction.down = true;
        }
        // Down-Left (112.5-157.5)
        else if (angle >= 112.5 && angle < 157.5) {
            direction.down = true;
            direction.left = true;
        }
        // Left (157.5-202.5)
        else if (angle >= 157.5 && angle < 202.5) {
            direction.left = true;
        }
        // Up-Left (202.5-247.5)
        else if (angle >= 202.5 && angle < 247.5) {
            direction.left = true;
            direction.up = true;
        }
        // Up (247.5-292.5)
        else if (angle >= 247.5 && angle < 292.5) {
            direction.up = true;
        }
        // Up-Right (292.5-337.5)
        else if (angle >= 292.5 && angle < 337.5) {
            direction.up = true;
            direction.right = true;
        }

        return direction;
    }

    /**
     * Update joystick thumb position and apply inputs (issue #158)
     * @param {number} canvasX - Canvas X coordinate of touch
     * @param {number} canvasY - Canvas Y coordinate of touch
     */
    updateJoystickThumb(canvasX, canvasY) {
        // Calculate delta from center
        let dx = canvasX - this.joystickState.centerX;
        let dy = canvasY - this.joystickState.centerY;

        // Limit thumb to maximum distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        const responsiveScale = this.getResponsiveScaleFactor();
        const maxDistance = this.constants.JOYSTICK_MAX_DISTANCE * this.sizeMultiplier * responsiveScale;

        if (distance > maxDistance) {
            const ratio = maxDistance / distance;
            dx *= ratio;
            dy *= ratio;
        }

        // Update thumb position
        this.joystickState.thumbX = this.joystickState.centerX + dx;
        this.joystickState.thumbY = this.joystickState.centerY + dy;

        // Calculate and apply direction
        const direction = this.calculateJoystickDirection(dx, dy);

        // Release all directional inputs first
        this.inputHandler.setTouchButton('left', false);
        this.inputHandler.setTouchButton('right', false);
        this.inputHandler.setTouchButton('up', false);
        this.inputHandler.setTouchButton('down', false);

        // Apply new direction if outside dead zone
        if (direction) {
            if (direction.left) this.inputHandler.setTouchButton('left', true);
            if (direction.right) this.inputHandler.setTouchButton('right', true);
            if (direction.up) this.inputHandler.setTouchButton('up', true);
            if (direction.down) this.inputHandler.setTouchButton('down', true);
        }

        this.joystickState.currentDirection = direction;
        this.joystickState.needsRedraw = true;
    }

    /**
     * Reset joystick to center position (issue #158)
     */
    resetJoystick() {
        this.joystickState.active = false;
        this.joystickState.touchId = null;
        this.joystickState.thumbX = this.joystickState.centerX;
        this.joystickState.thumbY = this.joystickState.centerY;
        this.joystickState.currentDirection = null;
        this.joystickState.needsRedraw = true;

        // Release all directional inputs
        this.inputHandler.setTouchButton('left', false);
        this.inputHandler.setTouchButton('right', false);
        this.inputHandler.setTouchButton('up', false);
        this.inputHandler.setTouchButton('down', false);
    }

    /**
     * Get button at canvas coordinates (issue #157: optimized hit detection)
     * Uses early exit optimizations for better performance
     * @param {number} x - Canvas X coordinate
     * @param {number} y - Canvas Y coordinate
     * @returns {Object|null} Button object or null if no button at coordinates
     */
    getTouchedButton(x, y) {
        // Optimization: Check buttons in reverse order (jump button likely hit most often)
        // This assumes jump button is last in array (which it is in initializeButtonDefinitions)
        for (let i = this.buttons.length - 1; i >= 0; i--) {
            const button = this.buttons[i];

            // Early exit optimization: check X first (fails faster for most touches)
            if (x < button.x || x > button.x + button.width) {
                continue;
            }

            // Only check Y if X is in range
            if (y >= button.y && y <= button.y + button.height) {
                return button;
            }
        }
        return null;
    }

    /**
     * Trigger haptic feedback if supported
     */
    triggerHaptic() {
        if (this.constants.MOBILE_HAPTIC_ENABLED &&
            navigator.vibrate &&
            typeof navigator.vibrate === 'function') {
            navigator.vibrate(this.constants.MOBILE_HAPTIC_DURATION);
        }
    }

    /**
     * Update method (lifecycle) (issue #157: optimized with dirty flag tracking)
     * (issue #158: added joystick animation support)
     * Handles smooth transitions for button animations
     * Uses dirty flag optimization to minimize rendering overhead
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        // Update tutorial overlay animation (issue #155)
        if (this.tutorialOverlay) {
            this.tutorialOverlay.update(deltaTime);
        }

        // Reset global dirty flag (will be set if any button needs redraw)
        this.anyButtonNeedsRedraw = false;

        // Update joystick animation state (issue #158)
        if (this.isJoystickMode()) {
            const targetOpacity = this.joystickState.active ?
                this.constants.JOYSTICK_OPACITY_ACTIVE :
                this.constants.JOYSTICK_OPACITY;

            const targetGlowBlur = this.joystickState.active ?
                this.constants.JOYSTICK_GLOW_BLUR_ACTIVE :
                this.constants.JOYSTICK_GLOW_BLUR;

            const transitionSpeed = deltaTime / (this.constants.MOBILE_TRANSITION_DURATION / 1000);
            const easedProgress = this.easeOut(Math.min(transitionSpeed, 1));

            const prevOpacity = this.joystickState.opacity;
            const prevGlowBlur = this.joystickState.glowBlur;

            this.joystickState.opacity = this.lerp(this.joystickState.opacity, targetOpacity, easedProgress);
            this.joystickState.glowBlur = this.lerp(this.joystickState.glowBlur, targetGlowBlur, easedProgress);

            const hasChanged =
                Math.abs(prevOpacity - this.joystickState.opacity) > 0.001 ||
                Math.abs(prevGlowBlur - this.joystickState.glowBlur) > 0.1;

            if (hasChanged) {
                this.joystickState.needsRedraw = true;
            } else {
                if (Math.abs(this.joystickState.opacity - targetOpacity) < 0.001) {
                    this.joystickState.opacity = targetOpacity;
                }
                if (Math.abs(this.joystickState.glowBlur - targetGlowBlur) < 0.1) {
                    this.joystickState.glowBlur = targetGlowBlur;
                }
            }
        }

        // Update animation states for all buttons
        for (const button of this.buttons) {
            const state = this.buttonStates.get(button.type);
            if (!state) continue;

            // Calculate target values based on press state
            const targetScale = state.isPressed ?
                this.constants.MOBILE_BUTTON_SCALE_PRESSED :
                this.constants.MOBILE_BUTTON_SCALE_NORMAL;

            const targetOpacity = state.isPressed ?
                this.constants.MOBILE_BUTTON_OPACITY_PRESSED :
                this.constants.MOBILE_BUTTON_OPACITY;

            const targetGlowBlur = state.isPressed ?
                this.constants.MOBILE_GLOW_BLUR_PRESSED :
                this.constants.MOBILE_GLOW_BLUR;

            // Calculate transition progress (0 to 1)
            const transitionSpeed = deltaTime / (this.constants.MOBILE_TRANSITION_DURATION / 1000);
            const easedProgress = this.easeOut(Math.min(transitionSpeed, 1));

            // Smoothly interpolate current values toward targets
            const prevScale = state.currentScale;
            const prevOpacity = state.currentOpacity;
            const prevGlowBlur = state.currentGlowBlur;

            state.currentScale = this.lerp(state.currentScale, targetScale, easedProgress);
            state.currentOpacity = this.lerp(state.currentOpacity, targetOpacity, easedProgress);
            state.currentGlowBlur = this.lerp(state.currentGlowBlur, targetGlowBlur, easedProgress);

            // Check if values changed (optimization: only redraw if necessary) (issue #157)
            const hasChanged =
                Math.abs(prevScale - state.currentScale) > 0.001 ||
                Math.abs(prevOpacity - state.currentOpacity) > 0.001 ||
                Math.abs(prevGlowBlur - state.currentGlowBlur) > 0.1;

            if (hasChanged) {
                state.needsRedraw = true;
                this.anyButtonNeedsRedraw = true;
            } else {
                // Snap to target when very close (prevent endless tiny updates)
                if (Math.abs(state.currentScale - targetScale) < 0.001) {
                    state.currentScale = targetScale;
                }
                if (Math.abs(state.currentOpacity - targetOpacity) < 0.001) {
                    state.currentOpacity = targetOpacity;
                }
                if (Math.abs(state.currentGlowBlur - targetGlowBlur) < 0.1) {
                    state.currentGlowBlur = targetGlowBlur;
                }
                // Clear needsRedraw flag when animation complete
                state.needsRedraw = false;
            }
        }
    }

    /**
     * Linear interpolation helper
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Progress (0 to 1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Ease-out easing function (fast start, slow end)
     * @param {number} t - Progress (0 to 1)
     * @returns {number} Eased value (0 to 1)
     */
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Render mobile control buttons (lifecycle) (issue #157: optimized with dirty flag)
     * (issue #158: added joystick rendering support)
     * Only renders buttons that have changed state (dirty flag optimization)
     * This significantly reduces canvas operations during steady state
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Only render on mobile devices
        if (!InputHandler.isMobileDevice()) {
            return;
        }

        // Check if joystick mode is active (issue #158)
        if (this.isJoystickMode()) {
            // Render joystick instead of D-pad
            this.renderJoystick(ctx);

            // Still render jump button
            const jumpButton = this.buttons.find(b => b.type === 'jump');
            if (jumpButton) {
                const state = this.buttonStates.get('jump');
                if (!this.dirtyFlagEnabled || (state && state.needsRedraw)) {
                    this.renderButton(ctx, jumpButton);
                }
            }
        } else {
            // Dirty flag optimization: only render if any button needs redraw (issue #157)
            // Note: For initial implementation, always render to ensure tutorial overlay works
            // In production, consider separating tutorial rendering from button rendering
            if (this.dirtyFlagEnabled && !this.anyButtonNeedsRedraw) {
                // Still need to render tutorial overlay even if buttons unchanged
                if (this.tutorialOverlay) {
                    this.tutorialOverlay.render(ctx);
                }
                return;
            }

            // Render each button with retro pixel-art styling
            for (const button of this.buttons) {
                const state = this.buttonStates.get(button.type);
                // Only render if button needs redraw (per-button dirty flag)
                if (!this.dirtyFlagEnabled || (state && state.needsRedraw)) {
                    this.renderButton(ctx, button);
                }
            }
        }

        // Render tutorial overlay on top if showing (issue #155)
        if (this.tutorialOverlay) {
            this.tutorialOverlay.render(ctx);
        }
    }

    /**
     * Show tutorial overlay again (for "Show Tutorial Again" in settings) (issue #155)
     */
    showTutorialAgain() {
        if (this.tutorialOverlay) {
            this.tutorialOverlay.reset();
        }
    }

    /**
     * Render a single button with retro styling
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} button - Button definition object
     */
    renderButton(ctx, button) {
        // Get button animation state
        const state = this.buttonStates.get(button.type);
        if (!state) return;

        // Reset redraw flag (always render, but flag tracks if update needed)
        state.needsRedraw = false;

        // Check if button is currently pressed
        const isPressed = state.isPressed;

        // Use animated values from state
        const opacity = state.currentOpacity;
        const scale = state.currentScale;
        const glowBlur = state.currentGlowBlur;

        // Save context state
        ctx.save();

        // Apply scale transformation (centered on button)
        const centerX = button.x + button.width / 2;
        const centerY = button.y + button.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);

        // Set opacity
        ctx.globalAlpha = opacity;

        // Draw glow effect if enabled
        if (this.constants.MOBILE_GLOW_ENABLED) {
            this.renderGlowEffect(ctx, button, glowBlur);
        }

        // Draw button background with color shift for pressed state
        const bgColor = isPressed ?
            (button.type === 'jump' ?
                this.constants.MOBILE_COLOR_JUMP_BG_PRESSED :
                this.constants.MOBILE_COLOR_DPAD_BG_PRESSED) :
            button.bgColor;
        ctx.fillStyle = bgColor;
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // Draw button border (bright red/yellow)
        ctx.strokeStyle = button.borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        // Draw inner border for depth effect
        ctx.strokeStyle = button.borderColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = opacity * 0.5;
        ctx.strokeRect(
            button.x + 4,
            button.y + 4,
            button.width - 8,
            button.height - 8
        );

        // Reset alpha for label
        ctx.globalAlpha = opacity;

        // Draw button label (arrow symbols or text)
        // Scale font size based on button size for consistency
        const fontSize = button.type === 'jump' ? 28 : 36;
        ctx.fillStyle = this.constants.MOBILE_COLOR_TEXT;
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            button.label,
            button.x + button.width / 2,
            button.y + button.height / 2
        );

        // Draw scanline overlay if enabled
        if (this.constants.MOBILE_SCANLINE_ENABLED) {
            this.renderScanlines(ctx, button);
        }

        // Restore context state
        ctx.restore();
    }

    /**
     * Render glow effect around button
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} button - Button definition object
     * @param {number} glowBlur - Animated glow blur radius
     */
    renderGlowEffect(ctx, button, glowBlur) {
        // Create glow effect using shadowBlur (animated)
        ctx.shadowColor = button.borderColor;
        ctx.shadowBlur = glowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw a rectangle to trigger the glow
        ctx.fillStyle = button.borderColor;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // Reset shadow for subsequent drawing
        ctx.shadowBlur = 0;

        // Get state for opacity
        const state = this.buttonStates.get(button.type);
        ctx.globalAlpha = state ? state.currentOpacity : this.constants.MOBILE_BUTTON_OPACITY;
    }

    /**
     * Render scanline overlay on button
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} button - Button definition object
     */
    renderScanlines(ctx, button) {
        const spacing = this.constants.MOBILE_SCANLINE_SPACING;
        const opacity = this.constants.MOBILE_SCANLINE_OPACITY;

        ctx.globalAlpha = opacity;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // Draw horizontal scanlines
        for (let y = button.y; y < button.y + button.height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(button.x, y);
            ctx.lineTo(button.x + button.width, y);
            ctx.stroke();
        }
    }

    /**
     * Check if a button is currently pressed
     * @param {string} buttonType - Button type ('left', 'right', 'up', 'down', 'jump')
     * @returns {boolean} True if button is pressed
     */
    isButtonPressed(buttonType) {
        for (const [touchId, type] of this.activeTouches) {
            if (type === buttonType) {
                return true;
            }
        }
        return false;
    }

    /**
     * Render virtual joystick (issue #158)
     * Draws circular base and draggable thumb with retro styling
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderJoystick(ctx) {
        const responsiveScale = this.getResponsiveScaleFactor();
        const baseRadius = this.constants.JOYSTICK_BASE_RADIUS * this.sizeMultiplier * responsiveScale;
        const thumbRadius = this.constants.JOYSTICK_THUMB_RADIUS * this.sizeMultiplier * responsiveScale;
        const opacity = this.joystickState.opacity;
        const glowBlur = this.joystickState.glowBlur;

        ctx.save();
        ctx.globalAlpha = opacity;

        // Draw glow effect if enabled
        if (this.constants.JOYSTICK_GLOW_ENABLED) {
            ctx.shadowColor = this.constants.JOYSTICK_COLOR_BASE_BORDER;
            ctx.shadowBlur = glowBlur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // Draw base circle
        ctx.beginPath();
        ctx.arc(
            this.joystickState.centerX,
            this.joystickState.centerY,
            baseRadius,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.constants.JOYSTICK_COLOR_BASE;
        ctx.fill();

        // Reset shadow for subsequent drawing
        ctx.shadowBlur = 0;

        // Draw base border
        ctx.strokeStyle = this.constants.JOYSTICK_COLOR_BASE_BORDER;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw inner border for depth effect
        ctx.beginPath();
        ctx.arc(
            this.joystickState.centerX,
            this.joystickState.centerY,
            baseRadius - 4,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = this.constants.JOYSTICK_COLOR_BASE_BORDER;
        ctx.lineWidth = 1;
        ctx.globalAlpha = opacity * 0.5;
        ctx.stroke();

        // Reset alpha for thumb
        ctx.globalAlpha = opacity;

        // Draw thumb circle
        ctx.beginPath();
        ctx.arc(
            this.joystickState.thumbX,
            this.joystickState.thumbY,
            thumbRadius,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.constants.JOYSTICK_COLOR_THUMB;
        ctx.fill();

        // Draw thumb border (color changes based on active state)
        const thumbBorderColor = this.joystickState.currentDirection ?
            this.constants.JOYSTICK_COLOR_THUMB_BORDER :
            this.constants.JOYSTICK_COLOR_THUMB_BORDER_INACTIVE;
        ctx.strokeStyle = thumbBorderColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw inner thumb border
        ctx.beginPath();
        ctx.arc(
            this.joystickState.thumbX,
            this.joystickState.thumbY,
            thumbRadius - 4,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = thumbBorderColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = opacity * 0.5;
        ctx.stroke();

        // Draw dead zone indicator (subtle circle at center)
        ctx.globalAlpha = opacity * 0.3;
        ctx.beginPath();
        ctx.arc(
            this.joystickState.centerX,
            this.joystickState.centerY,
            this.constants.JOYSTICK_DEAD_ZONE,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw scanlines if enabled
        if (this.constants.MOBILE_SCANLINE_ENABLED) {
            this.renderJoystickScanlines(ctx, baseRadius);
        }

        ctx.restore();

        // Clear needsRedraw flag
        this.joystickState.needsRedraw = false;
    }

    /**
     * Render scanline overlay on joystick (issue #158)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} baseRadius - Radius of joystick base
     */
    renderJoystickScanlines(ctx, baseRadius) {
        const spacing = this.constants.MOBILE_SCANLINE_SPACING;
        const opacity = this.constants.MOBILE_SCANLINE_OPACITY;

        ctx.globalAlpha = opacity;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        const centerX = this.joystickState.centerX;
        const centerY = this.joystickState.centerY;

        // Draw horizontal scanlines within circular bounds
        for (let y = centerY - baseRadius; y < centerY + baseRadius; y += spacing) {
            // Calculate line width based on circle equation
            const dy = y - centerY;
            const dx = Math.sqrt(baseRadius * baseRadius - dy * dy);

            if (!isNaN(dx)) {
                ctx.beginPath();
                ctx.moveTo(centerX - dx, y);
                ctx.lineTo(centerX + dx, y);
                ctx.stroke();
            }
        }
    }

    /**
     * Load settings from SettingsManager (issue #151)
     * Updates size multiplier and opacity from current settings
     */
    loadSettings() {
        if (!this.settingsManager) return;

        // Get size multiplier from buttonSize setting
        this.sizeMultiplier = this.settingsManager.getButtonSizeMultiplier();

        // Get opacity setting
        this.opacity = this.settingsManager.get('buttonOpacity');
    }

    /**
     * Apply settings and rebuild buttons (issue #151)
     * (issue #158: rebuild joystick position when settings change)
     * Called when settings change in the settings panel for real-time preview
     */
    applySettings() {
        // Load current settings
        this.loadSettings();

        // Rebuild button definitions with new size multiplier
        this.buttons = this.initializeButtonDefinitions();

        // Reinitialize button states with new buttons
        this.initializeButtonStates();

        // Apply new opacity to all button states
        for (const [type, state] of this.buttonStates) {
            state.targetOpacity = this.opacity;
            state.currentOpacity = this.opacity;
        }

        // Rebuild joystick position with new size multiplier (issue #158)
        this.initializeJoystickPosition();
    }

    /**
     * Clean up event listeners and resources
     */
    destroy() {
        // Remove touch event listeners
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);

        // Remove resize listener (issue #156)
        window.removeEventListener('resize', this.handleResize);

        // Clear active touches
        this.activeTouches.clear();

        // Release all buttons in input handler
        for (const button of this.buttons) {
            this.inputHandler.setTouchButton(button.type, false);
        }
    }
}
