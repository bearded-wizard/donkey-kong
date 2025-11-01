# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.6.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.6.0
[0.5.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.5.0
[0.4.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.4.0
[0.3.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.3.0
[0.2.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.2.0
[0.1.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.1.0
[0.0.1]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.0.1
