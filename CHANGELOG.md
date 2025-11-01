# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.3.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.3.0
[0.2.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.2.0
[0.1.0]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.1.0
[0.0.1]: https://github.com/bearded-wizard/donkey-kong/releases/tag/v0.0.1
