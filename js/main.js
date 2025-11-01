/**
 * main.js
 *
 * Main entry point for Barrel Blaster game.
 * Initializes the game loop and manages frame timing.
 *
 * Updated for issue #37: Uses Game class for state management
 * - Initializes Game instance
 * - Delegates update/render to Game class
 * - Game class handles all state transitions
 */

// Game variables
let canvas;
let ctx;
let renderer;
let game;
let lastFrameTime = 0;
let animationId = null;

/**
 * Initialize the game when DOM is ready
 */
function init() {
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context');
        return;
    }

    // Initialize Renderer
    try {
        renderer = new Renderer(canvas);
    } catch (error) {
        console.error('Failed to initialize Renderer:', error);
        return;
    }

    // Initialize Game (issue #37)
    if (typeof Game !== 'undefined') {
        game = new Game(canvas, renderer);
    } else {
        console.error('Game class not found');
        return;
    }

    // Start the game loop
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);

    // Log successful initialization
    console.log('Barrel Blaster initialized - Game loop started');
    console.log('Press SPACE to start game');
}

/**
 * Main game loop using requestAnimationFrame
 * @param {number} currentTime - Current timestamp from requestAnimationFrame
 */
function gameLoop(currentTime) {
    // Calculate delta time in seconds
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    // Cap delta time to prevent spiral of death
    const cappedDeltaTime = Math.min(deltaTime, 0.1);

    // Update and render (Game class handles pause state)
    update(cappedDeltaTime);
    render(renderer);

    // Continue the loop
    animationId = requestAnimationFrame(gameLoop);
}

/**
 * Update game state
 * @param {number} deltaTime - Time elapsed since last frame in seconds
 */
function update(deltaTime) {
    if (game && typeof game.update === 'function') {
        game.update(deltaTime);
    }
}

/**
 * Render game graphics
 * @param {Renderer} renderer - Renderer instance
 */
function render(renderer) {
    if (game && typeof game.render === 'function') {
        game.render(renderer);
    }
}

/**
 * Pause the game (delegates to Game class)
 */
function pauseGame() {
    if (game && typeof game.pause === 'function') {
        game.pause();
        console.log('Game paused');
    }
}

/**
 * Resume the game (delegates to Game class)
 */
function resumeGame() {
    if (game && typeof game.resume === 'function') {
        game.resume();
        lastFrameTime = performance.now(); // Reset time to prevent large delta
        console.log('Game resumed');
    }
}

/**
 * Toggle pause state (delegates to Game class)
 */
function togglePause() {
    if (game && typeof game.togglePause === 'function') {
        game.togglePause();
    }
}

/**
 * Stop the game loop
 */
function stopGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        console.log('Game loop stopped');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export functions for external use (if needed)
if (typeof window !== 'undefined') {
    window.pauseGame = pauseGame;
    window.resumeGame = resumeGame;
    window.togglePause = togglePause;
    window.stopGame = stopGame;
}
