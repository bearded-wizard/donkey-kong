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
}
