/**
 * Renderer.js
 *
 * Canvas rendering wrapper that provides drawing utilities
 * and supports camera offset for future scrolling features.
 */

class Renderer {
    /**
     * Initialize the Renderer with a canvas element
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Renderer requires a valid canvas element');
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Could not get 2D context from canvas');
        }

        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Camera offset for future scrolling support
        this.cameraX = 0;
        this.cameraY = 0;

        // Alpha/opacity support
        this.globalAlpha = 1.0;
    }

    /**
     * Clear the entire canvas with a color
     * @param {string} color - Fill color (default: background color from Constants)
     */
    clear(color = Constants.COLOR_BACKGROUND) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw a filled rectangle
     * @param {number} x - X coordinate (world space)
     * @param {number} y - Y coordinate (world space)
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} color - Fill color
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;

        // Apply camera offset
        const screenX = x - this.cameraX;
        const screenY = y - this.cameraY;

        this.ctx.fillRect(screenX, screenY, width, height);
    }

    /**
     * Draw a stroked rectangle (outline only)
     * @param {number} x - X coordinate (world space)
     * @param {number} y - Y coordinate (world space)
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} color - Stroke color
     * @param {number} lineWidth - Line width (default: 1)
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;

        // Apply camera offset
        const screenX = x - this.cameraX;
        const screenY = y - this.cameraY;

        this.ctx.strokeRect(screenX, screenY, width, height);
    }

    /**
     * Draw an image
     * @param {HTMLImageElement} image - The image to draw
     * @param {number} x - X coordinate (world space)
     * @param {number} y - Y coordinate (world space)
     * @param {number} width - Draw width (optional, uses image width if not provided)
     * @param {number} height - Draw height (optional, uses image height if not provided)
     */
    drawImage(image, x, y, width = null, height = null) {
        if (!image) {
            console.warn('Renderer.drawImage: Invalid image provided');
            return;
        }

        // Apply camera offset
        const screenX = x - this.cameraX;
        const screenY = y - this.cameraY;

        // Save current alpha
        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = this.globalAlpha;

        if (width !== null && height !== null) {
            this.ctx.drawImage(image, screenX, screenY, width, height);
        } else {
            this.ctx.drawImage(image, screenX, screenY);
        }

        // Restore alpha
        this.ctx.globalAlpha = previousAlpha;
    }

    /**
     * Draw a portion of an image (sprite sheet support)
     * @param {HTMLImageElement} image - The image to draw from
     * @param {number} sx - Source X coordinate
     * @param {number} sy - Source Y coordinate
     * @param {number} sWidth - Source width
     * @param {number} sHeight - Source height
     * @param {number} dx - Destination X coordinate (world space)
     * @param {number} dy - Destination Y coordinate (world space)
     * @param {number} dWidth - Destination width
     * @param {number} dHeight - Destination height
     */
    drawImagePortion(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        if (!image) {
            console.warn('Renderer.drawImagePortion: Invalid image provided');
            return;
        }

        // Apply camera offset to destination
        const screenX = dx - this.cameraX;
        const screenY = dy - this.cameraY;

        // Save current alpha
        const previousAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = this.globalAlpha;

        this.ctx.drawImage(image, sx, sy, sWidth, sHeight, screenX, screenY, dWidth, dHeight);

        // Restore alpha
        this.ctx.globalAlpha = previousAlpha;
    }

    /**
     * Draw text
     * @param {string} text - The text to draw
     * @param {number} x - X coordinate (world space)
     * @param {number} y - Y coordinate (world space)
     * @param {string} color - Text color
     * @param {string} font - Font string (e.g., '16px monospace')
     * @param {string} align - Text alignment ('left', 'center', 'right')
     */
    drawText(text, x, y, color, font = '16px monospace', align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;

        // Apply camera offset
        const screenX = x - this.cameraX;
        const screenY = y - this.cameraY;

        this.ctx.fillText(text, screenX, screenY);
    }

    /**
     * Set camera position for scrolling
     * @param {number} x - Camera X offset
     * @param {number} y - Camera Y offset
     */
    setCameraOffset(x, y) {
        this.cameraX = x;
        this.cameraY = y;
    }

    /**
     * Get current camera offset
     * @returns {{x: number, y: number}} Camera offset
     */
    getCameraOffset() {
        return {
            x: this.cameraX,
            y: this.cameraY
        };
    }

    /**
     * Reset camera to origin
     */
    resetCamera() {
        this.cameraX = 0;
        this.cameraY = 0;
    }

    /**
     * Set global alpha for transparency
     * @param {number} alpha - Alpha value (0.0 to 1.0)
     */
    setAlpha(alpha) {
        this.globalAlpha = Math.max(0, Math.min(1, alpha));
    }

    /**
     * Get current alpha value
     * @returns {number} Current alpha value
     */
    getAlpha() {
        return this.globalAlpha;
    }

    /**
     * Reset alpha to fully opaque
     */
    resetAlpha() {
        this.globalAlpha = 1.0;
    }

    /**
     * Save the current canvas state
     */
    save() {
        this.ctx.save();
    }

    /**
     * Restore the previous canvas state
     */
    restore() {
        this.ctx.restore();
    }

    /**
     * Get the underlying canvas context (for advanced operations)
     * @returns {CanvasRenderingContext2D} The canvas context
     */
    getContext() {
        return this.ctx;
    }
}
