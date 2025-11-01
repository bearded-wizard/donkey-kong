/**
 * Physics.js
 *
 * Physics system for handling gravity and velocity calculations.
 * Uses Euler integration for simple, predictable physics simulation.
 */

class Physics {
    /**
     * Applies gravity to an object's velocity.
     *
     * @param {Object} entity - The entity to apply gravity to
     * @param {Object} entity.velocity - Velocity object with x and y properties
     * @param {number} entity.velocity.y - Vertical velocity (pixels/second)
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     */
    static applyGravity(entity, deltaTime) {
        if (!entity || !entity.velocity) {
            console.warn('Physics.applyGravity: Invalid entity or missing velocity');
            return;
        }

        // Apply gravity using Euler integration: v = v + a * dt
        entity.velocity.y += Constants.GRAVITY * deltaTime;
    }

    /**
     * Updates an object's position based on its velocity.
     * Uses Euler integration: position += velocity * deltaTime
     *
     * @param {Object} entity - The entity to update
     * @param {Object} entity.position - Position object with x and y properties
     * @param {Object} entity.velocity - Velocity object with x and y properties
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     */
    static updateVelocity(entity, deltaTime) {
        if (!entity || !entity.position || !entity.velocity) {
            console.warn('Physics.updateVelocity: Invalid entity or missing position/velocity');
            return;
        }

        // Update position using Euler integration: p = p + v * dt
        entity.position.x += entity.velocity.x * deltaTime;
        entity.position.y += entity.velocity.y * deltaTime;
    }

    /**
     * Clamps an object's velocity to prevent exceeding terminal velocity.
     *
     * @param {Object} entity - The entity whose velocity to clamp
     * @param {Object} entity.velocity - Velocity object with x and y properties
     * @param {number} entity.velocity.y - Vertical velocity (pixels/second)
     */
    static clampVelocity(entity) {
        if (!entity || !entity.velocity) {
            console.warn('Physics.clampVelocity: Invalid entity or missing velocity');
            return;
        }

        // Clamp downward velocity (positive y) to maximum fall speed
        if (entity.velocity.y > Constants.MAX_FALL_SPEED) {
            entity.velocity.y = Constants.MAX_FALL_SPEED;
        }

        // Clamp upward velocity (negative y) to negative maximum fall speed
        // This prevents entities from shooting upward too fast
        if (entity.velocity.y < -Constants.MAX_FALL_SPEED) {
            entity.velocity.y = -Constants.MAX_FALL_SPEED;
        }
    }

    /**
     * Complete physics update cycle for an entity.
     * Applies gravity, clamps velocity, and updates position.
     *
     * @param {Object} entity - The entity to update
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     * @param {boolean} applyGravityFlag - Whether to apply gravity (default: true)
     */
    static update(entity, deltaTime, applyGravityFlag = true) {
        if (!entity) {
            console.warn('Physics.update: Invalid entity');
            return;
        }

        // Apply gravity if enabled
        if (applyGravityFlag) {
            this.applyGravity(entity, deltaTime);
        }

        // Clamp velocity to terminal velocity
        this.clampVelocity(entity);

        // Update position based on velocity
        this.updateVelocity(entity, deltaTime);
    }

    /**
     * Checks for collision between two Axis-Aligned Bounding Boxes (AABBs).
     * Uses rectangle intersection to detect overlap and calculates penetration depth.
     *
     * @param {Object} rect1 - First rectangle
     * @param {number} rect1.x - X position of top-left corner
     * @param {number} rect1.y - Y position of top-left corner
     * @param {number} rect1.width - Width of rectangle
     * @param {number} rect1.height - Height of rectangle
     * @param {Object} rect2 - Second rectangle
     * @param {number} rect2.x - X position of top-left corner
     * @param {number} rect2.y - Y position of top-left corner
     * @param {number} rect2.width - Width of rectangle
     * @param {number} rect2.height - Height of rectangle
     * @returns {Object|null} Collision result object with penetration data, or null if no collision
     * @returns {boolean} return.colliding - Whether rectangles are colliding
     * @returns {number} return.penetrationX - Penetration depth on X axis (signed)
     * @returns {number} return.penetrationY - Penetration depth on Y axis (signed)
     * @returns {number} return.penetrationDepth - Minimum penetration depth (absolute)
     * @returns {string} return.axis - Primary collision axis ('x' or 'y')
     */
    static checkAABB(rect1, rect2) {
        // Validate input
        if (!rect1 || !rect2) {
            console.warn('Physics.checkAABB: Invalid rectangle parameters');
            return null;
        }

        // Handle edge case: zero or negative dimensions (no collision possible)
        if (rect1.width <= 0 || rect1.height <= 0 || rect2.width <= 0 || rect2.height <= 0) {
            return {
                colliding: false,
                penetrationX: 0,
                penetrationY: 0,
                penetrationDepth: 0,
                axis: null
            };
        }

        // Calculate the distance between centers
        const centerX1 = rect1.x + rect1.width / 2;
        const centerY1 = rect1.y + rect1.height / 2;
        const centerX2 = rect2.x + rect2.width / 2;
        const centerY2 = rect2.y + rect2.height / 2;

        const distanceX = centerX2 - centerX1;
        const distanceY = centerY2 - centerY1;

        // Calculate the minimum distance for separation (sum of half-widths/heights)
        const minDistanceX = (rect1.width + rect2.width) / 2;
        const minDistanceY = (rect1.height + rect2.height) / 2;

        // Early exit: Check if rectangles are separated on either axis
        if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY) {
            return {
                colliding: false,
                penetrationX: 0,
                penetrationY: 0,
                penetrationDepth: 0,
                axis: null
            };
        }

        // Calculate penetration depths (how much they overlap)
        const penetrationX = minDistanceX - Math.abs(distanceX);
        const penetrationY = minDistanceY - Math.abs(distanceY);

        // Determine primary collision axis (axis with smallest penetration)
        const axis = penetrationX < penetrationY ? 'x' : 'y';
        const penetrationDepth = Math.min(penetrationX, penetrationY);

        // Return collision data with signed penetration (preserves direction)
        return {
            colliding: true,
            penetrationX: penetrationX * Math.sign(distanceX),
            penetrationY: penetrationY * Math.sign(distanceY),
            penetrationDepth: penetrationDepth,
            axis: axis
        };
    }
}
