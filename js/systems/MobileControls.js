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
     */
    constructor(canvas, inputHandler, constants) {
        // Store references
        this.canvas = canvas;
        this.inputHandler = inputHandler;
        this.constants = constants;

        // Track active touches by touch ID
        this.activeTouches = new Map();

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

        // Setup touch event listeners on canvas
        this.setupTouchListeners();
    }

    /**
     * Initialize button definitions with positions, sizes, and types
     * Creates D-pad buttons (left, right, up, down) and jump button
     * @returns {Array} Array of button definition objects
     */
    initializeButtonDefinitions() {
        const buttonSize = this.constants.MOBILE_BUTTON_SIZE;
        const jumpButtonSize = this.constants.MOBILE_JUMP_BUTTON_SIZE;
        const dpadMargin = this.constants.MOBILE_DPAD_MARGIN;
        const jumpMargin = this.constants.MOBILE_JUMP_MARGIN;

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
     * Setup touch event listeners on canvas
     */
    setupTouchListeners() {
        // Prevent default touch behaviors that interfere with game
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
    }

    /**
     * Handle touch start event
     * @param {TouchEvent} event - The touch event
     */
    handleTouchStart(event) {
        event.preventDefault();

        // Get canvas bounds for coordinate conversion
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.constants.CANVAS_WIDTH / rect.width;
        const scaleY = this.constants.CANVAS_HEIGHT / rect.height;

        // Process each new touch
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];

            // Convert screen coordinates to canvas coordinates
            const canvasX = (touch.clientX - rect.left) * scaleX;
            const canvasY = (touch.clientY - rect.top) * scaleY;

            // Check which button was touched
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
                }

                // Update input handler
                this.inputHandler.setTouchButton(button.type, true);

                // Trigger haptic feedback if enabled
                this.triggerHaptic();
            }
        }
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} event - The touch event
     */
    handleTouchMove(event) {
        event.preventDefault();

        // Get canvas bounds for coordinate conversion
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.constants.CANVAS_WIDTH / rect.width;
        const scaleY = this.constants.CANVAS_HEIGHT / rect.height;

        // Process each moved touch
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];

            // Convert screen coordinates to canvas coordinates
            const canvasX = (touch.clientX - rect.left) * scaleX;
            const canvasY = (touch.clientY - rect.top) * scaleY;

            // Get the button currently associated with this touch
            const currentButton = this.activeTouches.get(touch.identifier);

            // Check which button is now under the touch
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
                    }
                }
            }
        }
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} event - The touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();

        // Process each ended touch
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const button = this.activeTouches.get(touch.identifier);

            if (button) {
                // Release button in input handler
                this.inputHandler.setTouchButton(button, false);

                // Update button state
                const state = this.buttonStates.get(button);
                if (state) {
                    state.isPressed = false;
                    state.needsRedraw = true;
                }

                // Remove from active touches
                this.activeTouches.delete(touch.identifier);
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
     * Get button at canvas coordinates
     * @param {number} x - Canvas X coordinate
     * @param {number} y - Canvas Y coordinate
     * @returns {Object|null} Button object or null if no button at coordinates
     */
    getTouchedButton(x, y) {
        for (const button of this.buttons) {
            if (x >= button.x &&
                x <= button.x + button.width &&
                y >= button.y &&
                y <= button.y + button.height) {
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
     * Update method (lifecycle)
     * Handles smooth transitions for button animations
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
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

            // Check if values changed (optimization: only redraw if necessary)
            const hasChanged =
                Math.abs(prevScale - state.currentScale) > 0.001 ||
                Math.abs(prevOpacity - state.currentOpacity) > 0.001 ||
                Math.abs(prevGlowBlur - state.currentGlowBlur) > 0.1;

            if (hasChanged) {
                state.needsRedraw = true;
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
     * Render mobile control buttons (lifecycle)
     * Only renders if device is detected as mobile
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Only render on mobile devices
        if (!InputHandler.isMobileDevice()) {
            return;
        }

        // Render each button with retro pixel-art styling
        for (const button of this.buttons) {
            this.renderButton(ctx, button);
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
     * Clean up event listeners and resources
     */
    destroy() {
        // Remove touch event listeners
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);

        // Clear active touches
        this.activeTouches.clear();

        // Release all buttons in input handler
        for (const button of this.buttons) {
            this.inputHandler.setTouchButton(button.type, false);
        }
    }
}
