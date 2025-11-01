# Barrel Blaster

A classic arcade-style platform climbing game reimplemented using pure HTML, CSS, and JavaScript. Climb the platforms, dodge the barrels, and reach the top!

## About

Barrel Blaster is an educational reimplementation of classic 1980s arcade platform-climbing gameplay. Inspired by iconic arcade games of that era, this project demonstrates game development using vanilla JavaScript and HTML5 Canvas.

**Note**: This is an original implementation created for educational purposes. All code and assets are original or open-source. Not affiliated with or endorsed by Nintendo.

## Features

- Classic arcade gameplay mechanics
- State-based player sprite rendering with animations
- Smooth character movement with acceleration/deceleration
- Variable-height jumping
- Climbable ladders with animated climbing
- Platform-based level design
- Game state management (menu, playing, paused, game over)
- Score tracking and lives system
- High score tracking
- Responsive canvas rendering

## How to Play

1. Open `index.html` in your web browser
2. Press **SPACE** to start from the menu
3. Use arrow keys to move and climb
4. Press spacebar to jump
5. Avoid rolling barrels
6. Reach the top platform to win!

## Controls

- **Left Arrow** - Move left
- **Right Arrow** - Move right
- **Up Arrow** - Climb ladder up
- **Down Arrow** - Climb ladder down
- **Spacebar** - Jump
- **P or Escape** - Pause/Resume game

## Installation

No installation required! Simply:

```bash
git clone https://github.com/bearded-wizard/barrel-blaster.git
cd barrel-blaster
```

Then open `index.html` in your web browser.

For development with live reload:
```bash
python -m http.server 8000
# or
npx serve
```

## Project Structure

```
barrel-blaster/
├── index.html              # Main HTML file with canvas
├── styles.css              # Game styling (retro arcade theme)
├── js/
│   ├── utils/
│   │   ├── Vector2D.js     # 2D vector math utilities
│   │   └── Constants.js    # Game constants and configuration
│   ├── systems/
│   │   ├── InputHandler.js    # Keyboard input handling
│   │   ├── Renderer.js         # Canvas rendering wrapper
│   │   ├── Physics.js          # Physics and collision detection
│   │   ├── CollisionDetector.js # Collision detection utilities
│   │   └── AudioManager.js     # Audio system (stub)
│   ├── entities/
│   │   ├── Player.js       # Player character with animations
│   │   ├── Platform.js     # Platform obstacles
│   │   ├── Ladder.js       # Climbable ladders
│   │   ├── Barrel.js       # Barrel obstacles (stub)
│   │   ├── DonkeyKong.js   # Kong character (stub)
│   │   ├── Princess.js     # Princess character (stub)
│   │   └── Hammer.js       # Hammer power-up (stub)
│   ├── level/
│   │   ├── Level.js        # Base level class
│   │   └── Level1.js       # Level 1 configuration
│   ├── Game.js             # Main game class with state management
│   ├── GameState.js        # Gameplay state management
│   └── main.js             # Entry point and game loop
└── CHANGELOG.md            # Version history
```

## Development

This project uses vanilla JavaScript with no build tools or dependencies. To modify:

1. Edit the JavaScript files in `js/` directory
2. Refresh your browser to see changes
3. Use browser DevTools for debugging

### Key Components

- **Canvas Rendering**: All graphics rendered using HTML5 Canvas 2D API at 1280×720
- **Game Loop**: Uses `requestAnimationFrame()` for smooth 60 FPS gameplay
- **Physics**: Custom gravity system (980 px/s²) with collision detection
- **Animation**: Frame-based sprite animations at 8 FPS
- **State Management**: Game state machine (menu, playing, paused, game over)
- **Level System**: Extensible level architecture with factory pattern

## Roadmap

- [x] Player movement and physics
- [x] Ladder climbing
- [x] Platform collision
- [x] Player sprite animations
- [x] Game state management (menu, pause, game over)
- [x] Level architecture
- [ ] Barrel obstacles (rolling down platforms)
- [ ] Multiple levels
- [ ] Sound effects and music
- [ ] Hammer power-up
- [ ] High score persistence (localStorage)
- [ ] Mobile touch controls
- [ ] Sprite sheets (replace procedural rendering)

## Technical Details

- **Language**: Pure JavaScript (ES6+)
- **Rendering**: HTML5 Canvas API with pixel-perfect rendering
- **No Dependencies**: No frameworks or libraries required
- **Architecture**: Entity-component pattern with systems
- **Browser Support**: Modern browsers with ES6 support (classes, arrow functions, etc.)
- **Performance**: Targets 60 FPS with efficient rendering

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

Latest: **v0.21.0** - Player sprite rendering with animations

## License

MIT License - Feel free to use and modify for your own projects.

## Credits

- Inspired by classic 1980s arcade platform-climbing games
- Educational reimplementation for learning game development
- All code and assets are original or open-source (CC0)

## Contributing

This is an educational project, but contributions are welcome! Feel free to:
- Report bugs via GitHub Issues
- Submit pull requests for improvements
- Share feedback and suggestions

---

**Educational Project** - Created to demonstrate vanilla JavaScript game development techniques.
