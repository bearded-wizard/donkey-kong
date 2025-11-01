/**
 * Ladder.js
 *
 * Climbable ladder entity for vertical navigation between platforms.
 * Players can enter from top or bottom and climb up/down.
 */

class Ladder {
    /**
     * Create a new ladder
     * @param {number} x - X coordinate (left edge of ladder)
     * @param {number} y - Y coordinate (top of ladder)
     * @param {number} width - Ladder width in pixels (defaults to Constants.LADDER_WIDTH)
     * @param {number} height - Ladder height in pixels
     */
    constructor(x, y, width = Constants.LADDER_WIDTH, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = Constants.COLOR_LADDER;

        // Entry/exit zones at top and bottom
        // Zone height is slightly larger than a player step to allow easy mounting
        this.entryZoneHeight = Constants.LADDER_RUNG_HEIGHT * 2;

        // Collision zone is slightly wider than visual for easier climbing
        this.collisionPadding = 4; // pixels on each side
    }

    /**
     * Render the ladder to the canvas
     * Draws vertical rails and horizontal rungs
     * @param {Renderer} renderer - The game renderer
     */
    render(renderer) {
        const railWidth = 3;
        const rungWidth = this.width;
        const rungThickness = 2;

        // Draw left rail
        renderer.drawRect(
            this.x + 4,
            this.y,
            railWidth,
            this.height,
            this.color
        );

        // Draw right rail
        renderer.drawRect(
            this.x + this.width - 4 - railWidth,
            this.y,
            railWidth,
            this.height,
            this.color
        );

        // Draw rungs at regular intervals
        const numRungs = Math.floor(this.height / Constants.LADDER_RUNG_HEIGHT);
        for (let i = 0; i <= numRungs; i++) {
            const rungY = this.y + (i * Constants.LADDER_RUNG_HEIGHT);
            if (rungY <= this.y + this.height) {
                renderer.drawRect(
                    this.x,
                    rungY,
                    rungWidth,
                    rungThickness,
                    this.color
                );
            }
        }
    }

    /**
     * Check if an entity can climb this ladder
     * @param {Object} entity - Entity with x, y, width, height properties
     * @returns {boolean} True if entity is positioned to climb
     */
    canClimb(entity) {
        // Entity center should be within horizontal collision zone
        const entityCenterX = entity.x + entity.width / 2;
        const ladderCenterX = this.x + this.width / 2;
        const horizontalDistance = Math.abs(entityCenterX - ladderCenterX);

        // Check if entity is horizontally aligned with ladder
        if (horizontalDistance > Constants.LADDER_SNAP_DISTANCE) {
            return false;
        }

        // Entity should be vertically overlapping with ladder or near entry zones
        const entityBottom = entity.y + entity.height;
        const entityTop = entity.y;
        const ladderTop = this.y;
        const ladderBottom = this.y + this.height;

        // Check if entity overlaps with ladder or is in entry zones
        const inTopEntryZone = entityBottom >= ladderTop - this.entryZoneHeight
                             && entityTop <= ladderTop + this.entryZoneHeight;
        const inBottomEntryZone = entityBottom >= ladderBottom - this.entryZoneHeight
                                && entityTop <= ladderBottom + this.entryZoneHeight;
        const inMainLadder = entityBottom > ladderTop && entityTop < ladderBottom;

        return inTopEntryZone || inBottomEntryZone || inMainLadder;
    }

    /**
     * Get the collision bounds of the ladder
     * Returns bounds slightly wider than visual for easier climbing
     * @returns {{x: number, y: number, width: number, height: number}} Bounding box
     */
    getBounds() {
        return {
            x: this.x - this.collisionPadding,
            y: this.y,
            width: this.width + (this.collisionPadding * 2),
            height: this.height
        };
    }

    /**
     * Get the center X coordinate of the ladder
     * Useful for snapping player to ladder center when climbing
     * @returns {number} Center X coordinate
     */
    getCenterX() {
        return this.x + this.width / 2;
    }

    /**
     * Check if a point is within the top entry zone
     * @param {number} y - Y coordinate to check
     * @returns {boolean} True if in top entry zone
     */
    isInTopEntryZone(y) {
        return y >= this.y - this.entryZoneHeight && y <= this.y + this.entryZoneHeight;
    }

    /**
     * Check if a point is within the bottom entry zone
     * @param {number} y - Y coordinate to check
     * @returns {boolean} True if in bottom entry zone
     */
    isInBottomEntryZone(y) {
        const ladderBottom = this.y + this.height;
        return y >= ladderBottom - this.entryZoneHeight && y <= ladderBottom + this.entryZoneHeight;
    }
}
