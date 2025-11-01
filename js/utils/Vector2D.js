/**
 * Vector2D.js
 *
 * 2D vector utility class for position, velocity, and direction calculations.
 * Provides common vector operations for game physics and movement.
 */

class Vector2D {
    /**
     * Creates a new 2D vector
     * @param {number} x - The x component
     * @param {number} y - The y component
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds another vector to this vector
     * @param {Vector2D} vector - The vector to add
     * @returns {Vector2D} This vector for chaining
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**
     * Subtracts another vector from this vector
     * @param {Vector2D} vector - The vector to subtract
     * @returns {Vector2D} This vector for chaining
     */
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    /**
     * Multiplies this vector by a scalar value
     * @param {number} scalar - The scalar to multiply by
     * @returns {Vector2D} This vector for chaining
     */
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * Calculates the magnitude (length) of this vector
     * @returns {number} The magnitude of the vector
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Normalizes this vector (makes it unit length)
     * @returns {Vector2D} This vector for chaining
     */
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    /**
     * Creates a copy of this vector
     * @returns {Vector2D} A new vector with the same components
     */
    clone() {
        return new Vector2D(this.x, this.y);
    }

    /**
     * Copies the values from another vector into this vector
     * @param {Vector2D} vector - The vector to copy from
     * @returns {Vector2D} This vector for chaining
     */
    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }

    /**
     * Sets the x and y components of this vector
     * @param {number} x - The new x component
     * @param {number} y - The new y component
     * @returns {Vector2D} This vector for chaining
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Resets this vector to zero
     * @returns {Vector2D} This vector for chaining
     */
    zero() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    /**
     * Calculates the dot product with another vector
     * @param {Vector2D} vector - The vector to dot with
     * @returns {number} The dot product
     */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    /**
     * Calculates the distance to another vector
     * @param {Vector2D} vector - The target vector
     * @returns {number} The distance between vectors
     */
    distanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Returns a string representation of this vector
     * @returns {string} String representation
     */
    toString() {
        return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // ===========================
    // STATIC FACTORY METHODS
    // ===========================

    /**
     * Creates a zero vector
     * @returns {Vector2D} A new zero vector
     */
    static zero() {
        return new Vector2D(0, 0);
    }

    /**
     * Creates a vector from an angle (in radians)
     * @param {number} angle - The angle in radians
     * @param {number} magnitude - The magnitude (default: 1)
     * @returns {Vector2D} A new vector
     */
    static fromAngle(angle, magnitude = 1) {
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }

    /**
     * Adds two vectors and returns a new vector
     * @param {Vector2D} v1 - First vector
     * @param {Vector2D} v2 - Second vector
     * @returns {Vector2D} A new vector
     */
    static add(v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * Subtracts two vectors and returns a new vector
     * @param {Vector2D} v1 - First vector
     * @param {Vector2D} v2 - Second vector
     * @returns {Vector2D} A new vector
     */
    static subtract(v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * Multiplies a vector by a scalar and returns a new vector
     * @param {Vector2D} vector - The vector
     * @param {number} scalar - The scalar
     * @returns {Vector2D} A new vector
     */
    static multiply(vector, scalar) {
        return new Vector2D(vector.x * scalar, vector.y * scalar);
    }
}
