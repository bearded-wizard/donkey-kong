/**
 * MobileTutorialOverlay.js
 *
 * First-time mobile user onboarding experience for Barrel Blaster.
 * Displays interactive tutorial overlay highlighting mobile controls.
 *
 * Features:
 * - Detects first-time mobile users via localStorage
 * - Semi-transparent overlay with pulsing control highlights
 * - Brief text instructions for each control area
 * - "Got it!" dismiss button
 * - Persistent localStorage flag to prevent re-showing
 * - Optional "Show Tutorial Again" from settings
 * - Retro arcade aesthetic matching game theme
 */

class MobileTutorialOverlay {
    /**
     * Create a new MobileTutorialOverlay instance
     * @param {Object} constants - Constants object (typically Constants.js)
     * @param {MobileControls} mobileControls - Mobile controls instance for button positions
     */
    constructor(constants, mobileControls) {
        this.constants = constants;
        this.mobileControls = mobileControls;

        // Tutorial state
        this.isVisible = false;
        this.isFirstVisit = false;

        // Animation state for pulsing highlights
        this.pulseTimer = 0;

        // Dismiss button state
        this.dismissButton = null;
        this.isButtonPressed = false;
        this.activeTouchId = null;

        // Check if this is first-time mobile user
        this.checkFirstVisit();
    }

    /**
     * Check if this is the user's first visit on mobile
     * Reads localStorage flag to determine if tutorial should show
     */
    checkFirstVisit() {
        try {
            const tutorialShown = localStorage.getItem(this.constants.TUTORIAL_STORAGE_KEY);
            this.isFirstVisit = !tutorialShown;

            // If first visit, show tutorial automatically
            if (this.isFirstVisit && InputHandler.isMobileDevice()) {
                this.show();
            }
        } catch (error) {
            console.warn('localStorage not available for tutorial tracking:', error);
            // Default to not showing tutorial if localStorage fails
            this.isFirstVisit = false;
        }
    }

    /**
     * Show the tutorial overlay
     * Can be called manually from settings to re-trigger tutorial
     */
    show() {
        this.isVisible = true;
        this.pulseTimer = 0;
        this.initializeDismissButton();
    }

    /**
     * Hide the tutorial overlay
     */
    hide() {
        this.isVisible = false;
        this.activeTouchId = null;
        this.isButtonPressed = false;
    }

    /**
     * Dismiss the tutorial and mark as shown in localStorage
     * Called when user taps the dismiss button
     */
    dismiss() {
        this.hide();

        // Mark tutorial as shown in localStorage
        try {
            localStorage.setItem(this.constants.TUTORIAL_STORAGE_KEY, 'true');
        } catch (error) {
            console.warn('Failed to save tutorial state to localStorage:', error);
        }
    }

    /**
     * Reset tutorial state (for "Show Tutorial Again" in settings)
     * Clears localStorage flag and shows tutorial
     */
    reset() {
        try {
            localStorage.removeItem(this.constants.TUTORIAL_STORAGE_KEY);
            this.isFirstVisit = true;
            this.show();
        } catch (error) {
            console.warn('Failed to reset tutorial state:', error);
        }
    }

    /**
     * Initialize dismiss button bounds
     * Centers button at bottom of screen
     */
    initializeDismissButton() {
        const buttonWidth = this.constants.TUTORIAL_BUTTON_WIDTH;
        const buttonHeight = this.constants.TUTORIAL_BUTTON_HEIGHT;
        const x = (this.constants.CANVAS_WIDTH - buttonWidth) / 2;
        const y = this.constants.CANVAS_HEIGHT - buttonHeight - 40;

        this.dismissButton = {
            x: x,
            y: y,
            width: buttonWidth,
            height: buttonHeight
        };
    }

    /**
     * Check if touch coordinates hit the dismiss button
     * @param {number} x - Canvas X coordinate
     * @param {number} y - Canvas Y coordinate
     * @returns {boolean} True if touch is within button bounds
     */
    isTouchOnButton(x, y) {
        if (!this.dismissButton) return false;

        return (
            x >= this.dismissButton.x &&
            x <= this.dismissButton.x + this.dismissButton.width &&
            y >= this.dismissButton.y &&
            y <= this.dismissButton.y + this.dismissButton.height
        );
    }

    /**
     * Handle touch start event for dismiss button
     * @param {TouchEvent} event - The touch event
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    handleTouchStart(event, canvas) {
        if (!this.isVisible) return;

        event.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const scaleX = this.constants.CANVAS_WIDTH / rect.width;
        const scaleY = this.constants.CANVAS_HEIGHT / rect.height;

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const canvasX = (touch.clientX - rect.left) * scaleX;
            const canvasY = (touch.clientY - rect.top) * scaleY;

            if (this.isTouchOnButton(canvasX, canvasY)) {
                this.isButtonPressed = true;
                this.activeTouchId = touch.identifier;
                break;
            }
        }
    }

    /**
     * Handle touch end event for dismiss button
     * @param {TouchEvent} event - The touch event
     */
    handleTouchEnd(event) {
        if (!this.isVisible) return;

        event.preventDefault();

        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];

            if (touch.identifier === this.activeTouchId && this.isButtonPressed) {
                this.dismiss();
                this.activeTouchId = null;
                this.isButtonPressed = false;
                break;
            }
        }
    }

    /**
     * Update tutorial animation state
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    update(deltaTime) {
        if (!this.isVisible) return;

        // Update pulse animation timer
        this.pulseTimer += deltaTime * 1000; // Convert to milliseconds
        if (this.pulseTimer >= this.constants.TUTORIAL_PULSE_DURATION) {
            this.pulseTimer = 0;
        }
    }

    /**
     * Calculate pulse opacity for highlight animation
     * @returns {number} Opacity value between 0.3 and 1.0
     */
    getPulseOpacity() {
        const progress = this.pulseTimer / this.constants.TUTORIAL_PULSE_DURATION;
        // Sine wave for smooth pulsing: 0.3 to 1.0
        return 0.65 + 0.35 * Math.sin(progress * Math.PI * 2);
    }

    /**
     * Render tutorial overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (!this.isVisible) return;

        ctx.save();

        // Draw semi-transparent overlay background
        ctx.fillStyle = this.constants.TUTORIAL_OVERLAY_BG;
        ctx.fillRect(0, 0, this.constants.CANVAS_WIDTH, this.constants.CANVAS_HEIGHT);

        // Get pulse opacity for animated highlights
        const pulseOpacity = this.getPulseOpacity();

        // Highlight D-pad area
        this.renderHighlight(ctx, this.getDpadHighlightBounds(), pulseOpacity, 'Tap here to move');

        // Highlight jump button area
        this.renderHighlight(ctx, this.getJumpHighlightBounds(), pulseOpacity, 'Tap to jump');

        // Render dismiss button
        this.renderDismissButton(ctx);

        ctx.restore();
    }

    /**
     * Get bounding box for D-pad highlight
     * @returns {Object} Bounds object {x, y, width, height}
     */
    getDpadHighlightBounds() {
        const buttons = this.mobileControls.buttons;
        const dpadButtons = buttons.filter(b => ['left', 'right', 'up', 'down'].includes(b.type));

        // Calculate bounding box of all D-pad buttons
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const button of dpadButtons) {
            minX = Math.min(minX, button.x);
            minY = Math.min(minY, button.y);
            maxX = Math.max(maxX, button.x + button.width);
            maxY = Math.max(maxY, button.y + button.height);
        }

        const padding = 20;
        return {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2
        };
    }

    /**
     * Get bounding box for jump button highlight
     * @returns {Object} Bounds object {x, y, width, height}
     */
    getJumpHighlightBounds() {
        const jumpButton = this.mobileControls.buttons.find(b => b.type === 'jump');
        const padding = 20;

        return {
            x: jumpButton.x - padding,
            y: jumpButton.y - padding,
            width: jumpButton.width + padding * 2,
            height: jumpButton.height + padding * 2
        };
    }

    /**
     * Render a pulsing highlight around control area
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} bounds - Highlight bounds {x, y, width, height}
     * @param {number} opacity - Pulse opacity (0.0 to 1.0)
     * @param {string} text - Instruction text to display
     */
    renderHighlight(ctx, bounds, opacity, text) {
        ctx.save();

        // Draw pulsing glow outline
        ctx.strokeStyle = this.constants.TUTORIAL_HIGHLIGHT_COLOR;
        ctx.lineWidth = 4;
        ctx.globalAlpha = opacity;
        ctx.shadowColor = this.constants.TUTORIAL_HIGHLIGHT_COLOR;
        ctx.shadowBlur = 20;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        // Reset shadow for text
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        // Draw instruction text above highlight
        ctx.fillStyle = this.constants.TUTORIAL_TEXT_COLOR;
        ctx.font = `bold ${this.constants.TUTORIAL_TEXT_SIZE}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const textX = bounds.x + bounds.width / 2;
        const textY = bounds.y - 10;

        // Text shadow for readability
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(text, textX, textY);

        ctx.restore();
    }

    /**
     * Render dismiss button
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderDismissButton(ctx) {
        if (!this.dismissButton) return;

        ctx.save();

        const button = this.dismissButton;
        const isPressed = this.isButtonPressed;

        // Button background
        ctx.fillStyle = this.constants.TUTORIAL_BUTTON_BG;
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // Button border
        ctx.strokeStyle = this.constants.TUTORIAL_BUTTON_TEXT;
        ctx.lineWidth = this.constants.TUTORIAL_BUTTON_BORDER;
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        // Button glow when pressed
        if (isPressed) {
            ctx.shadowColor = this.constants.TUTORIAL_BUTTON_BG;
            ctx.shadowBlur = 20;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            ctx.shadowBlur = 0;
        }

        // Button text
        ctx.fillStyle = this.constants.TUTORIAL_BUTTON_TEXT;
        ctx.font = `bold 24px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = button.x + button.width / 2;
        const textY = button.y + button.height / 2;

        // Slight offset when pressed for button press effect
        const offset = isPressed ? 2 : 0;
        ctx.fillText('Got it!', textX, textY + offset);

        ctx.restore();
    }

    /**
     * Check if tutorial is currently visible
     * @returns {boolean} True if tutorial is visible
     */
    isShowing() {
        return this.isVisible;
    }
}
