/**
 * Constants.js
 *
 * Global constants for the Donkey Kong game.
 * All measurements in pixels unless otherwise specified.
 */

const Constants = {
    // ===========================
    // SCREEN DIMENSIONS
    // ===========================
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,

    // ===========================
    // PHYSICS CONSTANTS
    // ===========================

    // Gravity (pixels per second squared)
    GRAVITY: 980,

    // Terminal velocity (maximum fall speed in pixels per second)
    MAX_FALL_SPEED: 500,

    // Jump velocity (pixels per second, negative = upward)
    JUMP_VELOCITY: -400,

    // Friction coefficient for ground movement
    GROUND_FRICTION: 0.85,

    // Air resistance coefficient
    AIR_RESISTANCE: 0.98,

    // ===========================
    // PLAYER CONSTANTS
    // ===========================

    // Player dimensions
    PLAYER_WIDTH: 32,
    PLAYER_HEIGHT: 48,

    // Player speeds (pixels per second)
    PLAYER_WALK_SPEED: 150,
    PLAYER_RUN_SPEED: 250,
    PLAYER_CLIMB_SPEED: 100,

    // Player acceleration (pixels per second squared)
    PLAYER_ACCELERATION: 800,
    PLAYER_DECELERATION: 1200,

    // Player starting position
    PLAYER_START_X: 100,
    PLAYER_START_Y: 620,

    // Player animation frame rate (frames per second)
    PLAYER_ANIMATION_FPS: 8,

    // Player lives
    PLAYER_STARTING_LIVES: 3,

    // ===========================
    // BARREL CONSTANTS
    // ===========================

    // Barrel dimensions
    BARREL_WIDTH: 24,
    BARREL_HEIGHT: 24,

    // Barrel speeds (pixels per second)
    BARREL_ROLL_SPEED: 120,
    BARREL_FALL_SPEED: 150,

    // Barrel spawn position (at Donkey Kong)
    BARREL_SPAWN_X: 200,
    BARREL_SPAWN_Y: 120,

    // Barrel spawn rate (seconds between spawns)
    BARREL_SPAWN_MIN_DELAY: 2.0,
    BARREL_SPAWN_MAX_DELAY: 5.0,

    // Maximum active barrels on screen
    MAX_BARRELS: 8,

    // ===========================
    // DONKEY KONG CONSTANTS
    // ===========================

    // Donkey Kong dimensions
    DK_WIDTH: 64,
    DK_HEIGHT: 64,

    // Donkey Kong position (top platform)
    DK_X: 180,
    DK_Y: 80,

    // Animation speed
    DK_ANIMATION_FPS: 4,

    // ===========================
    // PRINCESS CONSTANTS
    // ===========================

    // Princess dimensions
    PRINCESS_WIDTH: 32,
    PRINCESS_HEIGHT: 48,

    // Princess position (top platform, next to DK)
    PRINCESS_X: 1100,
    PRINCESS_Y: 80,

    // ===========================
    // PLATFORM CONSTANTS
    // ===========================

    // Platform heights (y-coordinates from top)
    PLATFORM_GROUND: 670,
    PLATFORM_1: 540,
    PLATFORM_2: 410,
    PLATFORM_3: 280,
    PLATFORM_4: 150,
    PLATFORM_TOP: 120,

    // Platform thickness
    PLATFORM_HEIGHT: 20,

    // ===========================
    // LADDER CONSTANTS
    // ===========================

    // Ladder dimensions
    LADDER_WIDTH: 32,
    LADDER_RUNG_HEIGHT: 16,

    // ===========================
    // HAMMER CONSTANTS
    // ===========================

    // Hammer dimensions
    HAMMER_WIDTH: 32,
    HAMMER_HEIGHT: 32,

    // Hammer power-up duration (seconds)
    HAMMER_DURATION: 10.0,

    // Hammer swing animation speed
    HAMMER_SWING_FPS: 12,

    // ===========================
    // SCORING CONSTANTS
    // ===========================

    // Points awarded
    POINTS_BARREL_SMASH: 300,
    POINTS_BARREL_JUMP: 100,
    POINTS_REACH_PRINCESS: 1000,
    POINTS_TIME_BONUS: 10, // per second remaining

    // ===========================
    // GAME TIMING CONSTANTS
    // ===========================

    // Target frame rate
    TARGET_FPS: 60,
    FRAME_DURATION: 1000 / 60, // milliseconds

    // Level time limit (seconds)
    LEVEL_TIME_LIMIT: 180,

    // Invincibility duration after hit (seconds)
    INVINCIBILITY_DURATION: 2.0,

    // Death animation duration (seconds)
    DEATH_ANIMATION_DURATION: 1.5,

    // ===========================
    // COLLISION CONSTANTS
    // ===========================

    // Collision tolerance (pixels)
    COLLISION_TOLERANCE: 2,

    // Ladder climb tolerance (pixels from ladder center)
    LADDER_SNAP_DISTANCE: 8,

    // ===========================
    // GAME STATES
    // ===========================

    STATE_MENU: 'menu',
    STATE_PLAYING: 'playing',
    STATE_PAUSED: 'paused',
    STATE_LEVEL_COMPLETE: 'level_complete',
    STATE_GAME_OVER: 'game_over',

    // ===========================
    // COLORS (Retro Palette)
    // ===========================

    COLOR_BACKGROUND: '#000080',
    COLOR_PLATFORM: '#FF0000',
    COLOR_LADDER: '#00FFFF',
    COLOR_PLAYER: '#FFFF00',
    COLOR_BARREL: '#8B4513',
    COLOR_TEXT: '#FFFFFF',
    COLOR_UI_RED: '#FF0000',
    COLOR_UI_YELLOW: '#FFFF00',

    // ===========================
    // AUDIO CONSTANTS
    // ===========================

    // Volume levels (0.0 to 1.0)
    MASTER_VOLUME: 0.7,
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.8,
};

// Freeze the object to prevent modifications
Object.freeze(Constants);
