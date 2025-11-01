/**
 * Level.js
 *
 * Extensible Level class architecture for Donkey Kong game.
 * Implements issue #30: Create Level class architecture
 *
 * Features:
 * - Abstract/base Level class with level-specific configurations
 * - Arrays for platforms, ladders, and entities
 * - loadLevel() static factory method for extensibility
 * - Player start position and princess end position
 * - Support for multiple levels
 */

class Level {
    /**
     * Create a new level
     * @param {number} levelNumber - The level number (1, 2, 3, etc.)
     */
    constructor(levelNumber) {
        this.levelNumber = levelNumber;

        // Arrays for platforms, ladders, and entities (issue #30)
        this.platforms = [];
        this.ladders = [];
        this.entities = [];

        // Start position for player (issue #30)
        this.playerStartX = Constants.PLAYER_START_X;
        this.playerStartY = Constants.PLAYER_START_Y;

        // End position - princess location (issue #30)
        this.princessX = Constants.PRINCESS_X;
        this.princessY = Constants.PRINCESS_Y;

        // Initialize level-specific layout
        this.initializeLevel();
    }

    /**
     * Static factory method to load a level by number (issue #30)
     * Extensible for multiple levels
     * @param {number} levelNumber - The level number to load
     * @returns {Level} The loaded level instance
     */
    static loadLevel(levelNumber) {
        return new Level(levelNumber);
    }

    /**
     * Initialize level-specific layout
     * Dispatches to appropriate level creation method based on level number
     */
    initializeLevel() {
        // Clear existing arrays
        this.platforms = [];
        this.ladders = [];
        this.entities = [];

        // Create level based on level number (extensible for multiple levels)
        switch (this.levelNumber) {
            case 1:
                this.createLevel1();
                break;
            case 2:
                // Future: this.createLevel2();
                // For now, default to level 1
                this.createLevel1();
                break;
            case 3:
                // Future: this.createLevel3();
                // For now, default to level 1
                this.createLevel1();
                break;
            default:
                // Default to level 1 for any unimplemented level
                this.createLevel1();
                break;
        }
    }

    /**
     * Create the first level layout
     * Classic Donkey Kong level structure with platforms and ladders
     * Delegates to Level1 class for arcade-accurate layout (issue #31)
     */
    createLevel1() {
        // Use Level1 configuration class for arcade-accurate layout
        Level1.create(this);
    }

    /**
     * Get all platforms
     * @returns {Array<Platform>}
     */
    getPlatforms() {
        return this.platforms;
    }

    /**
     * Get all ladders
     * @returns {Array<Ladder>}
     */
    getLadders() {
        return this.ladders;
    }

    /**
     * Get all entities
     * @returns {Array<Object>} Array of game entities (barrels, hammers, etc.)
     */
    getEntities() {
        return this.entities;
    }

    /**
     * Get player start position
     * @returns {{x: number, y: number}} Player starting coordinates
     */
    getPlayerStartPosition() {
        return {
            x: this.playerStartX,
            y: this.playerStartY
        };
    }

    /**
     * Get princess end position
     * @returns {{x: number, y: number}} Princess coordinates
     */
    getPrincessPosition() {
        return {
            x: this.princessX,
            y: this.princessY
        };
    }

    /**
     * Get level number
     * @returns {number} The current level number
     */
    getLevelNumber() {
        return this.levelNumber;
    }

    /**
     * Add an entity to the level
     * @param {Object} entity - Entity to add (barrel, hammer, etc.)
     */
    addEntity(entity) {
        this.entities.push(entity);
    }

    /**
     * Remove an entity from the level
     * @param {Object} entity - Entity to remove
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    /**
     * Render the level
     * @param {Renderer} renderer
     */
    render(renderer) {
        // Render platforms
        for (const platform of this.platforms) {
            platform.render(renderer);
        }

        // Render ladders
        for (const ladder of this.ladders) {
            ladder.render(renderer);
        }

        // Render entities (if any have render methods)
        for (const entity of this.entities) {
            if (entity.render) {
                entity.render(renderer);
            }
        }
    }
}
