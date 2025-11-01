/**
 * main.js
 *
 * Main entry point for Donkey Kong game.
 * Initializes the game loop and manages frame timing.
 */

// Game state variables
let canvas;
let ctx;
let gameState;
let lastFrameTime = 0;
let isPaused = false;
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

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    // Initialize game state (when GameState class is available)
    if (typeof GameState !== 'undefined') {
        gameState = new GameState(canvas, ctx);
    } else {
        console.warn('GameState not yet implemented - running basic game loop');
        gameState = null;
    }

    // Start the game loop
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);

    // Log successful initialization
    console.log('Donkey Kong initialized - Game loop started');
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

    // Update and render only if not paused
    if (!isPaused) {
        update(cappedDeltaTime);
        render(ctx);
    }

    // Continue the loop
    animationId = requestAnimationFrame(gameLoop);
}

/**
 * Update game state
 * @param {number} deltaTime - Time elapsed since last frame in seconds
 */
function update(deltaTime) {
    if (gameState && typeof gameState.update === 'function') {
        gameState.update(deltaTime);
    } else {
        // Placeholder update logic for when GameState doesn't exist yet
        // This ensures the game loop is functional
    }
}

/**
 * Render game graphics
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 */
function render(ctx) {
    // Clear canvas
    ctx.fillStyle = Constants.COLOR_BACKGROUND;
    ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);

    if (gameState && typeof gameState.render === 'function') {
        gameState.render(ctx);
    } else {
        // Placeholder render logic showing the game is running
        ctx.fillStyle = Constants.COLOR_TEXT;
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Donkey Kong - Game Loop Active', Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2);
        ctx.font = '16px monospace';
        ctx.fillText('Waiting for GameState implementation...', Constants.CANVAS_WIDTH / 2, Constants.CANVAS_HEIGHT / 2 + 40);
    }
}

/**
 * Pause the game
 */
function pauseGame() {
    isPaused = true;
    console.log('Game paused');
}

/**
 * Resume the game
 */
function resumeGame() {
    isPaused = false;
    lastFrameTime = performance.now(); // Reset time to prevent large delta
    console.log('Game resumed');
}

/**
 * Toggle pause state
 */
function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
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
