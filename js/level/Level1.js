/**
 * Level1.js
 *
 * Classic Donkey Kong Level 1 configuration
 * Implements issue #31: Create Level1 configuration
 *
 * Features:
 * - 4-tier platform structure
 * - Multiple ladders between platforms (6-8 ladders)
 * - Broken/angled platforms (classic design with gaps)
 * - Arcade-accurate layout
 * - Top platform for DK and princess
 * - Bottom platform for player start
 */

class Level1 {
    /**
     * Create Level 1 configuration
     * Returns the classic Donkey Kong Level 1 layout
     * @param {Level} level - The level instance to configure
     */
    static create(level) {
        // Clear existing arrays
        level.platforms = [];
        level.ladders = [];
        level.entities = [];

        // Set player start position (bottom left)
        level.playerStartX = 100;
        level.playerStartY = Constants.PLATFORM_GROUND - 60;

        // Set princess position (top right)
        level.princessX = Constants.PRINCESS_X;
        level.princessY = Constants.PRINCESS_Y;

        // ===========================
        // PLATFORMS (4-tier structure)
        // ===========================

        // Ground platform (bottom - full width)
        level.platforms.push(new Platform(
            0,
            Constants.PLATFORM_GROUND,
            Constants.CANVAS_WIDTH,
            Constants.PLATFORM_HEIGHT
        ));

        // Platform 1 (second from bottom - broken with gap in middle)
        // Left section
        level.platforms.push(new Platform(
            0,
            Constants.PLATFORM_1,
            550,
            Constants.PLATFORM_HEIGHT
        ));
        // Right section (gap between 550-700 for ladder passage)
        level.platforms.push(new Platform(
            700,
            Constants.PLATFORM_1,
            Constants.CANVAS_WIDTH - 700,
            Constants.PLATFORM_HEIGHT
        ));

        // Platform 2 (middle - full width for princess escape path)
        level.platforms.push(new Platform(
            0,
            Constants.PLATFORM_2,
            Constants.CANVAS_WIDTH,
            Constants.PLATFORM_HEIGHT
        ));

        // Platform 3 (second from top - broken with gap in middle)
        // Left section
        level.platforms.push(new Platform(
            0,
            Constants.PLATFORM_3,
            580,
            Constants.PLATFORM_HEIGHT
        ));
        // Right section (gap between 580-730 for ladder passage)
        level.platforms.push(new Platform(
            730,
            Constants.PLATFORM_3,
            Constants.CANVAS_WIDTH - 730,
            Constants.PLATFORM_HEIGHT
        ));

        // Platform 4 (top - where DK and princess are located)
        level.platforms.push(new Platform(
            0,
            Constants.PLATFORM_4,
            Constants.CANVAS_WIDTH,
            Constants.PLATFORM_HEIGHT
        ));

        // ===========================
        // LADDERS (6-8 ladders for arcade accuracy)
        // ===========================

        // Ladder 1: Ground to Platform 1 (left side)
        level.ladders.push(new Ladder(
            250,
            Constants.PLATFORM_1,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_GROUND - Constants.PLATFORM_1
        ));

        // Ladder 2: Ground to Platform 1 (center-right, through gap)
        level.ladders.push(new Ladder(
            620,
            Constants.PLATFORM_1,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_GROUND - Constants.PLATFORM_1
        ));

        // Ladder 3: Platform 1 to Platform 2 (right side)
        level.ladders.push(new Ladder(
            950,
            Constants.PLATFORM_2,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_1 - Constants.PLATFORM_2
        ));

        // Ladder 4: Platform 1 to Platform 2 (left-center)
        level.ladders.push(new Ladder(
            380,
            Constants.PLATFORM_2,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_1 - Constants.PLATFORM_2
        ));

        // Ladder 5: Platform 2 to Platform 3 (center, through gap)
        level.ladders.push(new Ladder(
            650,
            Constants.PLATFORM_3,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_2 - Constants.PLATFORM_3
        ));

        // Ladder 6: Platform 2 to Platform 3 (left side)
        level.ladders.push(new Ladder(
            200,
            Constants.PLATFORM_3,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_2 - Constants.PLATFORM_3
        ));

        // Ladder 7: Platform 3 to Platform 4 (right side)
        level.ladders.push(new Ladder(
            1050,
            Constants.PLATFORM_4,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_3 - Constants.PLATFORM_4
        ));

        // Ladder 8: Platform 3 to Platform 4 (center-left)
        level.ladders.push(new Ladder(
            450,
            Constants.PLATFORM_4,
            Constants.LADDER_WIDTH,
            Constants.PLATFORM_3 - Constants.PLATFORM_4
        ));
    }

    /**
     * Get level metadata
     * @returns {Object} Level metadata
     */
    static getMetadata() {
        return {
            name: "Classic Donkey Kong - Level 1",
            description: "The iconic first level with 4-tier platform structure",
            difficulty: 1,
            platformCount: 7,
            ladderCount: 8,
            hasGaps: true
        };
    }
}
