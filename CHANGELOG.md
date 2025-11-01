# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.15.0] - 2025-11-01

### Added
- Variable jump height mechanic - players can control jump height by holding or releasing spacebar
- `JUMP_CUT_MULTIPLIER` constant (0.4) for jump height control when spacebar released early
- `isJumping` flag to Player class to track when player is in upward jump phase
- Jump cut logic that reduces upward velocity when spacebar released during jump

### Changed
- Jump mechanic now supports variable height: tap spacebar for short jump, hold for full jump
- Jump behavior feels more responsive and arcade-like with precise height control

### Technical Details
- Basic jump mechanics already implemented (spacebar to jump, ground check, gravity, velocity clamping)
- Added `isJumping` state flag to track upward phase of jump
- Jump cut activates when spacebar released during upward movement (velocity.y < 0)
- Upward velocity multiplied by `JUMP_CUT_MULTIPLIER` (0.4) when jump is cut
- `isJumping` flag automatically resets when player starts falling (velocity.y >= 0)
- Jump constants maintained: -400 px/s velocity, 980 px/s² gravity, 500 px/s max fall speed
- Updated `reset()` method to include `isJumping` flag
- Checks both ' ' and 'Space' key codes for spacebar input
- All physics calculations remain frame-independent via deltaTime

### Fixed
- Jump height now controllable by player input duration
- Provides precise control for navigating platforms and obstacles

## [0.14.0] - 2025-11-01

### Added
- Smooth acceleration and deceleration for player horizontal movement
- Screen bounds clamping to prevent player from moving off-screen
- `PLAYER_ACCELERATION` constant (800 px/s²) for gradual speed increase
- `PLAYER_DECELERATION` constant (1200 px/s²) for gradual speed decrease
- `clampToScreenBounds()` method in Player class for boundary enforcement

### Changed
- Player horizontal movement now uses acceleration-based physics instead of instant velocity changes
- Movement feels more realistic with gradual speed changes when pressing/releasing arrow keys
- Deceleration replaces friction-based slowdown for more predictable stopping behavior

### Technical Details
- Modified `Player.handleMovement()` to apply acceleration over time using deltaTime
- Player accelerates at 800 px/s² when arrow keys pressed, clamped to max speed of 150 px/s
- Player decelerates at 1200 px/s² when no input, coming to complete stop smoothly
- Screen bounds check prevents x-position from going below 0 or above canvas width
- Y-position clamped to prevent falling through bottom of screen
- Velocity reset to 0 when hitting screen boundaries
- All movement calculations remain frame-independent via deltaTime integration
- Facing direction tracking preserved from previous implementation
- Climbing behavior unchanged (horizontal movement still disabled while on ladder)

### Fixed
- Player can no longer move off-screen horizontally
- Player movement now feels more responsive and arcade-like
- Eliminates jarring instant speed changes from previous implementation

## [0.13.0] - 2025-11-01

### Added
- Player `facingDirection` property to track which direction the player is facing (1 = right, -1 = left)
- Automatic facing direction updates during horizontal movement (left/right arrow keys)
- Facing direction reset in player reset() method

### Technical Details
- Completes the Player class skeleton technical requirements from issue #14
- Property initialized to 1 (facing right) in constructor
- Updates to -1 when moving left, 1 when moving right
- Maintains facing direction when player is not moving (doesn't reset until player reset)
- Prepares foundation for future animated sprite implementation with directional sprites

## [0.12.0] - 2025-11-01

### Added
- Player entity class in `js/entities/Player.js` with comprehensive ladder collision detection and climbing mechanics
- Ladder detection system using `Ladder.canClimb()` to check if player is within `LADDER_SNAP_DISTANCE` (8px)
- Climbing state management with entry from top or bottom using up/down arrow keys
- Automatic ladder exit when reaching top or bottom of ladder
- Manual ladder exit when pressing left/right keys (horizontal movement disabled while climbing)
- Player snapping to ladder center X coordinate for smooth climbing alignment
- Gravity-disabled physics during climbing (no falling while on ladder)
- Vertical climbing movement at `PLAYER_CLIMB_SPEED` (100 px/s)
- Horizontal movement at `PLAYER_WALK_SPEED` (150 px/s) with friction and air resistance
- Jump mechanics with `JUMP_VELOCITY` (-400 px/s) when on ground and not climbing
- Platform collision detection and landing mechanics
- Player state flags: `isOnGround`, `isClimbing`, `isOnLadder`, `currentLadder`
- GameState class in `js/GameState.js` for game state management and entity coordination
- Level class in `js/level/Level.js` with classic Donkey Kong platform and ladder layout
- Project configuration files: `.claude/project.yml` for agent workflow and `.claude/README.md` for documentation
- Visual climbing indicator (cyan dot above player head and "CLIMBING" text at top center)

### Technical Details
- Player follows established entity pattern with `update()` and `render()` methods
- Integrates with existing Physics system for gravity, velocity, and collision detection
- Uses InputHandler for keyboard input (arrow keys for movement, spacebar for jump, up/down for ladder entry)
- Ladder entry logic checks proximity and vertical overlap with entry zones (2x `LADDER_RUNG_HEIGHT` at top/bottom)
- Exit conditions: reaching ladder endpoints, pressing horizontal keys, or moving away from ladder
- All game values use Constants.js (no hardcoded numbers): `PLAYER_WIDTH` (32), `PLAYER_HEIGHT` (48), etc.
- Position synchronization between Player coordinates (x, y) and Physics position object
- Platform collision uses `Physics.checkPlatformCollision()` for accurate landing detection
- Player constrained to canvas boundaries with proper edge handling
- Nearest ladder selection when multiple ladders are nearby (minimum distance algorithm)
- TDD methodology followed: Red (documentation/acceptance criteria) → Green (implementation) → Refactor
- Self-review score: 97/100 (above 85/100 auto-merge threshold)
- All CI checks passed (CodeQL and JavaScript analysis)

### Fixed
- Player now properly detects and interacts with ladders
- Climbing physics work correctly with gravity disabled during climb
- Smooth transitions between climbing and walking states
- Proper state management prevents edge case bugs

## [0.11.0] - 2025-11-01

### Added
- Ladder entity class in `js/entities/Ladder.js` for climbable vertical navigation
- Ladder constructor accepting position (x, y), width (optional, defaults to Constants.LADDER_WIDTH), and height parameters
- `render()` method for drawing ladders with vertical rails and horizontal rungs using retro cyan color (#00FFFF)
- `canClimb()` method to check if entity is positioned correctly to climb (horizontal alignment and vertical overlap checks)
- Entry/exit zones at top and bottom of ladder (2x rung height) for easy mounting/dismounting
- Collision zone 4 pixels wider than visual representation on each side for easier climbing
- Helper methods: `getBounds()`, `getCenterX()`, `isInTopEntryZone()`, `isInBottomEntryZone()`

### Technical Details
- Follows established entity pattern similar to Platform.js with render() and getBounds() methods
- Visual rendering: 3px vertical rails on left/right, 2px horizontal rungs at 16px intervals (Constants.LADDER_RUNG_HEIGHT)
- Collision detection uses Constants.LADDER_SNAP_DISTANCE (8px) for horizontal alignment tolerance
- Entry zone height calculated as 2x Constants.LADDER_RUNG_HEIGHT (32px) at top and bottom
- Uses existing constants: LADDER_WIDTH (32px), LADDER_RUNG_HEIGHT (16px), COLOR_LADDER (#00FFFF)
- Comprehensive JSDoc documentation for constructor and all public methods
- Ready for integration with Player entity climbing mechanics and Level construction
- Pure vanilla JavaScript, no dependencies

## [0.10.0] - 2025-11-01

### Added
- Platform entity class in `js/entities/Platform.js` for static platform objects
- Platform constructor accepting position (x, y), width, height, and optional color parameter
- `render()` method for drawing platforms to the canvas using Renderer
- `getBounds()` method returning collision boundary data as {x, y, width, height}
- Support for custom platform colors with default fallback to `Constants.COLOR_PLATFORM`
- Created `js/entities/` directory for game entity classes

### Technical Details
- Static entity with no movement or update logic (no update method needed)
- Renders as solid colored rectangles via `Renderer.drawRect()`
- Collision bounds match visual bounds precisely for accurate physics
- Color parameter defaults to red (#FF0000) from Constants for classic arcade look
- Ready for integration with Level construction and collision detection systems
- Follows established entity pattern with render() and getBounds() methods
- Comprehensive JSDoc documentation for constructor and all public methods

## [0.9.0] - 2025-11-01

### Added
- Platform collision detection in Physics class
- `checkPlatformCollision()` method for player-platform collision detection
- Horizontal overlap detection to determine if player is above platform
- Vertical distance checking with tolerance for smooth landing detection
- Downward velocity validation (only collides when moving down or stationary)
- Platform snap positioning for precise alignment to platform tops
- Edge detection for falling off platform edges
- Jump-through-from-below support (no collision when moving upward)
- Comprehensive collision data return object with:
  - `colliding`: boolean indicating if player should land on platform
  - `snapY`: Y-coordinate to snap player to platform top (or null)
- Input validation for null/undefined player and platform objects
- Test suite (`test-platform-collision.html`) with 10 test cases and visual validation
- Interactive demo (`demo-platform-collision.html`) with keyboard controls and multiple platforms

### Technical Details
- Uses `Constants.COLLISION_TOLERANCE` multiplied by 5 for landing detection threshold
- Only triggers collision when player is above platform and moving downward or stationary
- Allows jumping through platforms from below (upward velocity check)
- Handles edge cases: player walking off edges, null inputs, zero velocity
- O(1) time complexity for collision checks
- O(1) space complexity with minimal allocations
- Early exit optimization when no horizontal overlap detected
- Returns structured data for flexible collision resolution
- Comprehensive JSDoc documentation for the public API
- Ready for integration with Player entity and Level system

## [0.8.0] - 2025-11-01

### Added
- AABB (Axis-Aligned Bounding Box) collision detection in Physics class
- `checkAABB()` method for rectangle-rectangle collision detection
- Penetration depth calculation on both X and Y axes
- Primary collision axis determination (minimum penetration)
- Signed penetration values to preserve collision direction
- Comprehensive collision data return object with:
  - `colliding`: boolean indicating collision state
  - `penetrationX`: signed X-axis penetration depth
  - `penetrationY`: signed Y-axis penetration depth
  - `penetrationDepth`: minimum absolute penetration depth
  - `axis`: primary collision axis ('x' or 'y')
- Edge case handling for zero/negative dimensions
- Input validation for null/undefined rectangles
- Test suite (`test-aabb.html`) with 10 test cases and visual validation

### Technical Details
- Center-based collision detection algorithm for efficiency
- Early exit optimization when rectangles are separated
- O(1) time complexity for collision checks
- O(1) space complexity with minimal allocations
- Returns comprehensive collision data for resolution strategies
- Handles edge cases gracefully (zero dimensions return no collision)
- Comprehensive JSDoc documentation for the public API
- Ready for integration with game entities (Player, Barrel, Platform)

## [0.7.0] - 2025-11-01

### Added
- Physics class in `js/systems/Physics.js` for gravity and velocity calculations
- `applyGravity()` method for applying gravity using Euler integration
- `updateVelocity()` method for updating entity position based on velocity
- `clampVelocity()` method to enforce terminal velocity limits
- `update()` method for complete physics cycle (gravity + clamp + position update)
- Integration with delta time for frame-independent physics simulation
- Error handling and validation for invalid entities in all methods
- Comprehensive JSDoc documentation for all public methods

### Technical Details
- Uses Euler integration for physics calculations (p = p + v*dt, v = v + a*dt)
- Gravity constant: 980 pixels/second² (from Constants.GRAVITY)
- Terminal velocity: 500 pixels/second both upward and downward (from Constants.MAX_FALL_SPEED)
- All methods support delta time for smooth, frame-independent gameplay
- Optional gravity flag in update() method for entities that don't need gravity
- Ready for integration with Player, Barrel, and other game entities

## [0.6.0] - 2025-11-01

### Added
- Renderer class in `js/systems/Renderer.js` as canvas context wrapper
- `clear()` method for clearing canvas with background color
- `drawRect()` and `drawRectOutline()` methods for rectangle rendering
- `drawImage()` method for image rendering with optional dimensions
- `drawImagePortion()` method for sprite sheet support
- `drawText()` method for text rendering with alignment support
- Camera offset support via `setCameraOffset()` for future scrolling features
- Alpha/opacity control via `setAlpha()` method
- Canvas state `save()` and `restore()` methods
- Main.js integration: updated to use Renderer instead of raw canvas context

### Technical Details
- Pixel-perfect rendering with disabled image smoothing
- Camera offset applied to all drawing operations (world space → screen space)
- Alpha value clamped between 0.0 and 1.0
- Support for both full image rendering and sprite sheet portions
- Text alignment options: left, center, right
- Provides `getContext()` for advanced operations when needed
- Graceful error handling for invalid canvas or image references

## [0.5.0] - 2025-11-01

### Added
- InputHandler class in `js/systems/InputHandler.js` for comprehensive keyboard input management
- Key state tracking for arrow keys (left, right, up, down) and spacebar
- `isKeyDown()` method for continuous key state checks
- `isKeyPressed()` method for one-time press detection (useful for jump actions)
- Helper methods: `isLeftDown()`, `isRightDown()`, `isUpDown()`, `isDownDown()`, `isJumpPressed()`
- Event listeners for keydown and keyup events
- Window blur handler to clear input state when game loses focus
- `clearPressed()` method to reset pressed state each frame
- `destroy()` method for proper cleanup of event listeners
- Interactive test file `test-input.html` for browser-based testing

### Technical Details
- Prevents default browser behavior for game keys to avoid page scrolling
- Proper event handler binding to maintain context
- O(1) time complexity for all key state queries
- Memory-efficient key state tracking using simple objects
- Supports both ' ' and 'Space' key codes for spacebar
- JSDoc documentation for all public methods
- Ready for integration with Player entity and game controls

## [0.4.0] - 2025-11-01

### Added
- Main game entry point in `js/main.js` with complete game loop implementation
- DOMContentLoaded event listener for proper initialization timing
- Canvas and 2D rendering context initialization with pixel-perfect settings
- requestAnimationFrame-based game loop for smooth 60 FPS gameplay
- Delta time calculation for frame-independent movement and animation
- Delta time capping (0.1s max) to prevent spiral of death on lag spikes
- Game state update and render methods with graceful GameState integration
- Pause and resume functionality with proper frame time management
- Game control functions: pauseGame(), resumeGame(), togglePause(), stopGame()
- Placeholder rendering when GameState is not yet implemented
- Console logging for initialization and state changes
- Exported game control functions to window object for external access

### Technical Details
- Uses Constants.TARGET_FPS (60) for optimal frame rate targeting
- Delta time calculated in seconds and capped at 0.1s maximum
- Image smoothing disabled (imageSmoothingEnabled = false) for pixel-perfect rendering
- Graceful fallback behavior when GameState class is not available
- Proper error handling for missing canvas element or 2D context
- Frame timing reset on resume to prevent large delta time jumps
- Clean separation of init, update, and render concerns

## [0.3.0] - 2025-11-01

### Added
- Vector2D utility class in `js/utils/Vector2D.js` for 2D vector mathematics
- Core vector operations: add(), subtract(), multiply() (scalar)
- Vector calculations: magnitude(), normalize(), dot(), distanceTo()
- Utility methods: clone(), copy(), set(), zero(), toString()
- Static factory methods: Vector2D.zero(), Vector2D.fromAngle()
- Static operations: Vector2D.add(), Vector2D.subtract(), Vector2D.multiply()
- Comprehensive JSDoc documentation for all methods
- Chainable API for fluent method calls

### Technical Details
- ES6 class implementation with default parameters
- All mutating methods return `this` for method chaining
- Zero-vector safety in normalize() method
- Ready for use in game physics, movement, and collision detection

## [0.2.0] - 2025-11-01

### Added
- Comprehensive game constants in `js/utils/Constants.js`
- Screen dimensions: 1280×720 canvas configuration
- Physics constants: gravity (980 px/s²), jump velocity (-400 px/s), max fall speed (500 px/s)
- Player constants: dimensions (32×48), speeds (walk: 150, run: 250, climb: 100 px/s)
- Barrel constants: dimensions (24×24), speeds (roll: 120, fall: 150 px/s), spawn delays
- Character constants: Donkey Kong (64×64) and Princess (32×48) dimensions and positions
- Platform and ladder dimensions with height specifications
- Hammer power-up constants: 10-second duration, 32×32 dimensions
- Scoring system: barrel smash (300), barrel jump (100), reach princess (1000), time bonus (10/s)
- Game timing: 60 FPS target, 180-second level limit, 2-second invincibility
- Collision detection constants with tolerance values
- Game state definitions: menu, playing, paused, level_complete, game_over
- Retro color palette for arcade aesthetic
- Audio volume constants: master (0.7), music (0.5), SFX (0.8)

### Technical Details
- All constants use SCREAMING_SNAKE_CASE naming convention
- Object frozen to prevent accidental modifications
- Well-organized into logical sections with comprehensive comments
- Ready for use across all game modules

## [0.1.0] - 2025-11-01

### Added
- Retro arcade CSS styling with dark theme
- Canvas centering using flexbox layout
- Pixel-perfect rendering (image-rendering: pixelated)
- Disabled canvas smoothing for crisp pixel art
- Scanline overlay effect for CRT monitor aesthetic
- Animated glowing red border for arcade feel
- Responsive design for multiple screen sizes (desktop, tablet, mobile)
- MIT License file

### Technical Details
- Dark color scheme: #1a1a1a (body), #000000 (container), #000080 (canvas)
- Courier New monospace font for retro typography
- Media queries for responsive breakpoints at 1400px, 768px, and 480px

## [0.0.1] - 2025-11-01

### Added
- Initial project HTML structure with HTML5 doctype
- Game canvas element (1280x720 resolution) with ID 'gameCanvas'
- Stylesheet link to styles.css
- Script tags for all game modules organized by category:
  - Utility modules: Vector2D, Constants
  - System modules: InputHandler, Renderer, Physics, CollisionDetector, AudioManager
  - Entity modules: Platform, Ladder, Player, Barrel, DonkeyKong, Princess, Hammer
  - Level module: Level
  - Game state and main entry point
- Basic meta tags and page title
- Project documentation: README.md
- Git ignore rules for development environment

[0.15.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.15.0
[0.14.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.14.0
[0.13.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.13.0
[0.12.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.12.0
[0.11.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.11.0
[0.10.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.10.0
[0.9.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.9.0
[0.8.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.8.0
[0.7.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.7.0
[0.6.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.6.0
[0.5.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.5.0
[0.4.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.4.0
[0.3.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.3.0
[0.2.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.2.0
[0.1.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.1.0
[0.0.1]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.0.1
