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

    // Jump cut multiplier (for variable jump height when releasing spacebar early)
    JUMP_CUT_MULTIPLIER: 0.4,

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

    // Player animation states (issue #19)
    PLAYER_ANIM_STATE_IDLE: 'idle',
    PLAYER_ANIM_STATE_WALK: 'walk',
    PLAYER_ANIM_STATE_JUMP: 'jump',
    PLAYER_ANIM_STATE_CLIMB: 'climb',

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

    // Barrel ladder behavior (issue #24)
    BARREL_LADDER_FALL_CHANCE: 0.4, // 40% chance to fall down ladder

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

    // Animation speed (issue #29: 8-12 FPS)
    DK_ANIMATION_FPS: 10,

    // ===========================
    // PRINCESS CONSTANTS
    // ===========================

    // Princess dimensions (Simplified Platformer Pack - 96x96 pixels)
    PRINCESS_WIDTH: 48,
    PRINCESS_HEIGHT: 48,

    // Princess position (top platform, next to DK)
    PRINCESS_X: 1100,
    PRINCESS_Y: 92,

    // Princess animation frame rate (frames per second)
    PRINCESS_ANIMATION_FPS: 4,

    // Princess sprite paths (Simplified Platformer Pack)
    PRINCESS_SPRITE_IDLE: 'assets/sprites/princess/character_pink_idle.png',
    PRINCESS_SPRITE_FRONT: 'assets/sprites/princess/character_pink_front.png',

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
    POINTS_CLIMBING_PER_METER: 10, // 10 points per meter climbed

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
    STATE_SETTINGS: 'settings',
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

    // Sound file paths
    SOUND_JUMP: 'assets/sounds/jump.ogg',
    SOUND_BARREL_ROLL: 'assets/sounds/barrel_roll.ogg',
    SOUND_DEATH: 'assets/sounds/death.ogg',
    SOUND_HAMMER_PICKUP: 'assets/sounds/hammer_pickup.ogg',
    SOUND_BARREL_DESTROY: 'assets/sounds/barrel_destroy.ogg',
    SOUND_LEVEL_COMPLETE: 'assets/sounds/level_complete.ogg',

    // Music file paths
    MUSIC_BACKGROUND: 'assets/sounds/music.ogg',

    // ===========================
    // MOBILE TOUCH CONTROL CONSTANTS
    // ===========================

    /**
     * Size of mobile D-pad buttons in pixels
     * Used for both width and height of D-pad touch buttons
     */
    MOBILE_BUTTON_SIZE: 80,

    /**
     * Size of mobile jump button in pixels
     * Larger than D-pad buttons for better thumb accessibility
     * Used for both width and height of jump button (120px diameter)
     */
    MOBILE_JUMP_BUTTON_SIZE: 120,

    /**
     * Margin from screen edge for D-pad controls (left side)
     * Distance in pixels from left and bottom edges
     */
    MOBILE_DPAD_MARGIN: 30,

    /**
     * Margin from screen edge for jump button (right side)
     * Distance in pixels from right and bottom edges
     */
    MOBILE_JUMP_MARGIN: 30,

    /**
     * Default opacity for mobile control buttons
     * Range: 0.0 (transparent) to 1.0 (opaque)
     */
    MOBILE_BUTTON_OPACITY: 0.6,

    /**
     * Opacity for mobile control buttons when pressed
     * Higher opacity provides visual feedback for touch interaction
     */
    MOBILE_BUTTON_OPACITY_PRESSED: 0.9,

    /**
     * Touch dead zone radius in pixels
     * Minimum movement required to register a touch direction
     * Helps prevent accidental inputs from finger wobble
     */
    MOBILE_TOUCH_DEAD_ZONE: 10,

    /**
     * D-pad button background color (dark retro fill)
     */
    MOBILE_COLOR_DPAD_BG: '#1a1a1a',

    /**
     * D-pad button border color (bright red)
     */
    MOBILE_COLOR_DPAD_BORDER: '#ff0000',

    /**
     * Jump button background color (dark retro fill)
     */
    MOBILE_COLOR_JUMP_BG: '#1a1a1a',

    /**
     * Jump button border color (bright yellow)
     */
    MOBILE_COLOR_JUMP_BORDER: '#ffff00',

    /**
     * Mobile button text/symbol color
     */
    MOBILE_COLOR_TEXT: '#ffffff',

    /**
     * Enable glow effect on mobile buttons
     */
    MOBILE_GLOW_ENABLED: true,

    /**
     * Glow blur radius in pixels
     */
    MOBILE_GLOW_BLUR: 10,

    /**
     * Enable scanline overlay on mobile buttons
     */
    MOBILE_SCANLINE_ENABLED: true,

    /**
     * Scanline spacing in pixels
     */
    MOBILE_SCANLINE_SPACING: 4,

    /**
     * Scanline opacity
     */
    MOBILE_SCANLINE_OPACITY: 0.3,

    /**
     * Enable haptic feedback on mobile devices
     * Provides tactile response when buttons are pressed
     */
    MOBILE_HAPTIC_ENABLED: true,

    /**
     * Duration of haptic feedback vibration in milliseconds
     * Short pulse for button press confirmation
     */
    MOBILE_HAPTIC_DURATION: 20,

    /**
     * Screen width breakpoint for mobile detection in pixels
     * Devices with width <= this value are considered mobile
     */
    MOBILE_BREAKPOINT: 768,

    /**
     * Scale factor for buttons in normal state
     * Default scale (1.0 = 100% size)
     */
    MOBILE_BUTTON_SCALE_NORMAL: 1.0,

    /**
     * Scale factor for buttons when pressed
     * Slight increase (1.05 = 105% size) provides visual feedback
     */
    MOBILE_BUTTON_SCALE_PRESSED: 1.05,

    /**
     * Glow blur radius for pressed buttons (enhanced glow)
     * Larger than normal glow to emphasize button press
     */
    MOBILE_GLOW_BLUR_PRESSED: 20,

    /**
     * Background color shift for D-pad buttons when pressed
     * Brighter shade of dark background
     */
    MOBILE_COLOR_DPAD_BG_PRESSED: '#2a2a2a',

    /**
     * Background color shift for jump button when pressed
     * Brighter shade of dark background
     */
    MOBILE_COLOR_JUMP_BG_PRESSED: '#2a2a2a',

    /**
     * Transition speed for button animations in milliseconds
     * Used for smooth scale and color transitions
     */
    MOBILE_TRANSITION_DURATION: 150,

    /**
     * Easing function name for button animations
     * Options: 'linear', 'easeInOut', 'easeOut', 'easeIn'
     */
    MOBILE_TRANSITION_EASING: 'easeOut',

    // ===========================
    // MOBILE PERFORMANCE OPTIMIZATION CONSTANTS
    // ===========================

    /**
     * Throttle interval for touchmove events in milliseconds
     * 16ms = 60 FPS (1000ms / 60fps = 16.67ms)
     * Prevents excessive event processing on high-frequency touch updates
     */
    MOBILE_TOUCHMOVE_THROTTLE_MS: 16,

    /**
     * Enable passive event listeners for better scroll performance
     * Passive listeners tell browser preventDefault() won't be called,
     * allowing scroll to start immediately without waiting for JS
     * Note: touchstart/touchend remain non-passive to prevent defaults
     */
    MOBILE_PASSIVE_LISTENERS: false,

    /**
     * Enable performance profiling and logging
     * When true, logs touch event processing time and FPS metrics
     * Should be false in production for optimal performance
     */
    MOBILE_PERFORMANCE_LOGGING: false,

    /**
     * Maximum touch event processing time in milliseconds
     * If processing exceeds this, a warning is logged (when logging enabled)
     * Target: <16.67ms to maintain 60 FPS
     */
    MOBILE_MAX_EVENT_TIME_MS: 16,

    /**
     * Enable dirty flag optimization for rendering
     * Only redraws buttons when their state has changed
     * Significantly reduces canvas operations during steady state
     */
    MOBILE_DIRTY_FLAG_OPTIMIZATION: true,

    // ===========================
    // MOBILE TUTORIAL OVERLAY CONSTANTS
    // ===========================

    /**
     * LocalStorage key for tutorial shown flag
     * Used to track if first-time mobile tutorial has been displayed
     */
    TUTORIAL_STORAGE_KEY: 'barrelBlasterTutorialShown',

    /**
     * Tutorial overlay background color with opacity
     * Semi-transparent dark overlay to focus attention on tutorial
     */
    TUTORIAL_OVERLAY_BG: 'rgba(0, 0, 0, 0.85)',

    /**
     * Tutorial highlight pulse animation color
     * Bright cyan glow to draw attention to control areas
     */
    TUTORIAL_HIGHLIGHT_COLOR: '#00ffff',

    /**
     * Tutorial highlight pulse animation duration in milliseconds
     * Controls the speed of the pulsing glow effect
     */
    TUTORIAL_PULSE_DURATION: 1500,

    /**
     * Tutorial text color
     * Bright white for maximum readability on dark background
     */
    TUTORIAL_TEXT_COLOR: '#ffffff',

    /**
     * Tutorial text font size in pixels
     * Large enough for mobile readability
     */
    TUTORIAL_TEXT_SIZE: 20,

    /**
     * Tutorial dismiss button background color
     * Yellow to match retro arcade aesthetic
     */
    TUTORIAL_BUTTON_BG: '#ffff00',

    /**
     * Tutorial dismiss button text color
     * Black for strong contrast on yellow background
     */
    TUTORIAL_BUTTON_TEXT: '#000000',

    /**
     * Tutorial dismiss button width in pixels
     */
    TUTORIAL_BUTTON_WIDTH: 200,

    /**
     * Tutorial dismiss button height in pixels
     */
    TUTORIAL_BUTTON_HEIGHT: 60,

    /**
     * Tutorial dismiss button border width in pixels
     */
    TUTORIAL_BUTTON_BORDER: 3,

    // ===========================
    // RESPONSIVE BUTTON SCALING CONSTANTS (issue #156)
    // ===========================

    /**
     * Screen width threshold for small screen detection (pixels)
     * Screens narrower than this will trigger automatic button scaling
     * Target: iPhone SE (320px) and other small devices
     */
    MOBILE_SMALL_SCREEN_WIDTH: 400,

    /**
     * Scale increase factor for small screens
     * 2.5 = 250% of original size in canvas coordinates
     * Makes buttons larger in canvas space so they remain usable
     * when canvas is scaled down to fit small viewports
     * At 320px viewport: 50px D-pad, 75px jump (comfortable touch targets)
     * Applied multiplicatively with user's size preference
     */
    MOBILE_SMALL_SCREEN_SCALE: 2.5,

    /**
     * Margin scale factor for small screens
     * Scales margins proportionally with button size
     * Same factor as button scaling to maintain visual balance
     */
    MOBILE_SMALL_SCREEN_MARGIN_SCALE: 2.5,

    // ===========================
    // VIRTUAL JOYSTICK CONSTANTS (issue #158)
    // ===========================

    /**
     * Joystick base circle radius in pixels
     * Outer boundary circle for joystick area
     */
    JOYSTICK_BASE_RADIUS: 80,

    /**
     * Joystick thumb circle radius in pixels
     * Draggable inner circle (smaller than base)
     */
    JOYSTICK_THUMB_RADIUS: 35,

    /**
     * Maximum distance thumb can move from center in pixels
     * Limits thumb movement to stay within visual boundary
     */
    JOYSTICK_MAX_DISTANCE: 45,

    /**
     * Dead zone radius for joystick center in pixels
     * Thumb must move beyond this to register input
     * Prevents drift from finger wobble at rest position
     */
    JOYSTICK_DEAD_ZONE: 15,

    /**
     * Joystick base circle color
     */
    JOYSTICK_COLOR_BASE: '#1a1a1a',

    /**
     * Joystick base border color (red to match D-pad)
     */
    JOYSTICK_COLOR_BASE_BORDER: '#ff0000',

    /**
     * Joystick thumb color
     */
    JOYSTICK_COLOR_THUMB: '#2a2a2a',

    /**
     * Joystick thumb border color when active
     */
    JOYSTICK_COLOR_THUMB_BORDER: '#ffff00',

    /**
     * Joystick thumb border color when in dead zone
     */
    JOYSTICK_COLOR_THUMB_BORDER_INACTIVE: '#ff0000',

    /**
     * Joystick opacity (matches D-pad opacity)
     */
    JOYSTICK_OPACITY: 0.6,

    /**
     * Joystick opacity when active
     */
    JOYSTICK_OPACITY_ACTIVE: 0.9,

    /**
     * Enable glow effect on joystick
     */
    JOYSTICK_GLOW_ENABLED: true,

    /**
     * Joystick glow blur radius
     */
    JOYSTICK_GLOW_BLUR: 10,

    /**
     * Joystick glow blur radius when active
     */
    JOYSTICK_GLOW_BLUR_ACTIVE: 20,

    /**
     * Angle threshold for 8-directional snapping in degrees
     * 22.5 degrees = 45 degrees / 2 (provides clean 8-direction zones)
     */
    JOYSTICK_DIRECTION_THRESHOLD: 22.5,
};

// Freeze the object to prevent modifications
Object.freeze(Constants);
