/**
 * SettingsPanel.js
 *
 * DOM-based settings panel UI for Barrel Blaster game settings.
 * Provides an accessible modal overlay with form controls for adjusting game settings.
 *
 * Features (issue #151):
 * - Modal overlay accessible from pause menu
 * - Size slider (small/medium/large for mobile controls)
 * - Opacity slider (30%-100% for mobile controls)
 * - Haptic feedback checkbox
 * - Control scheme toggle (D-pad/joystick - future feature)
 * - Real-time preview of changes
 * - Save button (persists to localStorage via SettingsManager)
 * - Cancel button (reverts changes)
 * - Reset to Defaults button
 * - Retro arcade styling (red/cyan colors, pixel fonts)
 * - Keyboard and touch navigation support
 */

class SettingsPanel {
    /**
     * Create a new SettingsPanel instance
     * @param {SettingsManager} settingsManager - The settings manager instance
     * @param {MobileControls} mobileControls - The mobile controls instance (for preview)
     */
    constructor(settingsManager, mobileControls) {
        this.settingsManager = settingsManager;
        this.mobileControls = mobileControls;

        // Store original settings for cancel functionality
        this.originalSettings = null;

        // Panel visibility state
        this.isVisible = false;

        // DOM elements (created lazily)
        this.panelElement = null;
        this.overlayElement = null;

        // Form control references
        this.sizeSlider = null;
        this.opacitySlider = null;
        this.hapticCheckbox = null;
        this.controlSchemeToggle = null;

        // Bind event handlers
        this.handleSave = this.handleSave.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleSizeChange = this.handleSizeChange.bind(this);
        this.handleOpacityChange = this.handleOpacityChange.bind(this);
        this.handleHapticChange = this.handleHapticChange.bind(this);
        this.handleControlSchemeChange = this.handleControlSchemeChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
    }

    /**
     * Create DOM elements for the settings panel
     * Only called once, lazily on first show
     */
    createPanel() {
        // Create overlay (semi-transparent background)
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'settings-overlay';
        this.overlayElement.className = 'settings-overlay';
        this.overlayElement.addEventListener('click', this.handleOverlayClick);

        // Create panel container
        this.panelElement = document.createElement('div');
        this.panelElement.id = 'settings-panel';
        this.panelElement.className = 'settings-panel';

        // Prevent clicks on panel from closing the overlay
        this.panelElement.addEventListener('click', (e) => e.stopPropagation());

        // Build panel content
        this.panelElement.innerHTML = `
            <div class="settings-header">
                <h2 class="settings-title">SETTINGS</h2>
                <button class="settings-close" aria-label="Close settings">&times;</button>
            </div>

            <div class="settings-content">
                <!-- Button Size -->
                <div class="settings-group">
                    <label for="setting-size" class="settings-label">
                        <span class="label-text">Button Size</span>
                        <span class="label-value" id="size-value">Medium</span>
                    </label>
                    <div class="slider-container">
                        <span class="slider-label">Small</span>
                        <input
                            type="range"
                            id="setting-size"
                            class="settings-slider"
                            min="0"
                            max="2"
                            step="1"
                            value="1"
                            aria-label="Button size"
                        />
                        <span class="slider-label">Large</span>
                    </div>
                </div>

                <!-- Opacity -->
                <div class="settings-group">
                    <label for="setting-opacity" class="settings-label">
                        <span class="label-text">Button Opacity</span>
                        <span class="label-value" id="opacity-value">60%</span>
                    </label>
                    <div class="slider-container">
                        <span class="slider-label">30%</span>
                        <input
                            type="range"
                            id="setting-opacity"
                            class="settings-slider"
                            min="30"
                            max="100"
                            step="5"
                            value="60"
                            aria-label="Button opacity"
                        />
                        <span class="slider-label">100%</span>
                    </div>
                </div>

                <!-- Haptic Feedback -->
                <div class="settings-group">
                    <label for="setting-haptic" class="settings-label checkbox-label">
                        <span class="label-text">Haptic Feedback</span>
                        <div class="checkbox-container">
                            <input
                                type="checkbox"
                                id="setting-haptic"
                                class="settings-checkbox"
                                checked
                                aria-label="Enable haptic feedback"
                            />
                            <span class="checkbox-custom"></span>
                        </div>
                    </label>
                </div>

                <!-- Control Scheme (future feature) -->
                <div class="settings-group">
                    <label class="settings-label">
                        <span class="label-text">Control Scheme</span>
                        <span class="label-note">(Coming Soon)</span>
                    </label>
                    <div class="toggle-container">
                        <button
                            class="toggle-button active"
                            data-value="dpad"
                            disabled
                            aria-label="D-pad control scheme"
                        >
                            D-PAD
                        </button>
                        <button
                            class="toggle-button"
                            data-value="joystick"
                            disabled
                            aria-label="Joystick control scheme"
                        >
                            JOYSTICK
                        </button>
                    </div>
                </div>
            </div>

            <div class="settings-footer">
                <button class="settings-button button-save" id="button-save">
                    SAVE
                </button>
                <button class="settings-button button-cancel" id="button-cancel">
                    CANCEL
                </button>
                <button class="settings-button button-reset" id="button-reset">
                    RESET TO DEFAULTS
                </button>
            </div>
        `;

        // Get references to form controls
        this.sizeSlider = this.panelElement.querySelector('#setting-size');
        this.opacitySlider = this.panelElement.querySelector('#setting-opacity');
        this.hapticCheckbox = this.panelElement.querySelector('#setting-haptic');
        this.controlSchemeToggle = this.panelElement.querySelectorAll('.toggle-button');

        // Get references to buttons
        const saveButton = this.panelElement.querySelector('#button-save');
        const cancelButton = this.panelElement.querySelector('#button-cancel');
        const resetButton = this.panelElement.querySelector('#button-reset');
        const closeButton = this.panelElement.querySelector('.settings-close');

        // Attach event listeners
        this.sizeSlider.addEventListener('input', this.handleSizeChange);
        this.opacitySlider.addEventListener('input', this.handleOpacityChange);
        this.hapticCheckbox.addEventListener('change', this.handleHapticChange);

        saveButton.addEventListener('click', this.handleSave);
        cancelButton.addEventListener('click', this.handleCancel);
        resetButton.addEventListener('click', this.handleReset);
        closeButton.addEventListener('click', this.handleCancel);

        // Add panel to overlay
        this.overlayElement.appendChild(this.panelElement);

        // Add overlay to document body
        document.body.appendChild(this.overlayElement);
    }

    /**
     * Show the settings panel
     * Stores current settings for cancel functionality
     */
    show() {
        // Create panel if it doesn't exist
        if (!this.panelElement) {
            this.createPanel();
        }

        // Store original settings for cancel
        this.originalSettings = this.settingsManager.getAll();

        // Load current settings into form controls
        this.loadCurrentSettings();

        // Show the overlay
        this.overlayElement.style.display = 'flex';
        this.isVisible = true;

        // Add keyboard listener
        document.addEventListener('keydown', this.handleKeyDown);

        // Focus the first focusable element
        this.sizeSlider.focus();
    }

    /**
     * Hide the settings panel
     */
    hide() {
        if (this.overlayElement) {
            this.overlayElement.style.display = 'none';
        }
        this.isVisible = false;

        // Remove keyboard listener
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Load current settings from SettingsManager into form controls
     */
    loadCurrentSettings() {
        const settings = this.settingsManager.getAll();

        // Button size
        const sizeMap = { small: 0, medium: 1, large: 2 };
        this.sizeSlider.value = sizeMap[settings.buttonSize] || 1;
        this.updateSizeDisplay(settings.buttonSize);

        // Opacity
        const opacityPercent = Math.round(settings.buttonOpacity * 100);
        this.opacitySlider.value = opacityPercent;
        this.updateOpacityDisplay(opacityPercent);

        // Haptic
        this.hapticCheckbox.checked = settings.hapticEnabled;

        // Control scheme (future feature - always dpad for now)
        this.updateControlSchemeDisplay(settings.controlScheme);
    }

    /**
     * Update size display label
     * @param {string} size - Size value ('small', 'medium', 'large')
     */
    updateSizeDisplay(size) {
        const displayMap = { small: 'Small', medium: 'Medium', large: 'Large' };
        const display = displayMap[size] || 'Medium';
        const valueElement = this.panelElement.querySelector('#size-value');
        if (valueElement) {
            valueElement.textContent = display;
        }
    }

    /**
     * Update opacity display label
     * @param {number} percent - Opacity percentage (30-100)
     */
    updateOpacityDisplay(percent) {
        const valueElement = this.panelElement.querySelector('#opacity-value');
        if (valueElement) {
            valueElement.textContent = `${percent}%`;
        }
    }

    /**
     * Update control scheme display
     * @param {string} scheme - Control scheme ('dpad' or 'joystick')
     */
    updateControlSchemeDisplay(scheme) {
        this.controlSchemeToggle.forEach(button => {
            const isActive = button.dataset.value === scheme;
            button.classList.toggle('active', isActive);
        });
    }

    /**
     * Handle size slider change (real-time preview)
     * @param {Event} event - Input event
     */
    handleSizeChange(event) {
        const sizeMap = ['small', 'medium', 'large'];
        const size = sizeMap[parseInt(event.target.value, 10)];

        // Update display
        this.updateSizeDisplay(size);

        // Apply preview (update settings temporarily)
        this.settingsManager.set('buttonSize', size);

        // Trigger mobile controls update
        if (this.mobileControls) {
            this.mobileControls.applySettings();
        }
    }

    /**
     * Handle opacity slider change (real-time preview)
     * @param {Event} event - Input event
     */
    handleOpacityChange(event) {
        const percent = parseInt(event.target.value, 10);
        const opacity = percent / 100;

        // Update display
        this.updateOpacityDisplay(percent);

        // Apply preview (update settings temporarily)
        this.settingsManager.set('buttonOpacity', opacity);

        // Trigger mobile controls update
        if (this.mobileControls) {
            this.mobileControls.applySettings();
        }
    }

    /**
     * Handle haptic checkbox change (real-time preview)
     * @param {Event} event - Change event
     */
    handleHapticChange(event) {
        const enabled = event.target.checked;

        // Apply preview (update settings temporarily)
        this.settingsManager.set('hapticEnabled', enabled);

        // Trigger mobile controls update
        if (this.mobileControls) {
            this.mobileControls.applySettings();
        }
    }

    /**
     * Handle control scheme toggle change (future feature)
     * @param {Event} event - Click event
     */
    handleControlSchemeChange(event) {
        const scheme = event.target.dataset.value;

        // Update display
        this.updateControlSchemeDisplay(scheme);

        // Apply preview (update settings temporarily)
        this.settingsManager.set('controlScheme', scheme);

        // Trigger mobile controls update
        if (this.mobileControls) {
            this.mobileControls.applySettings();
        }
    }

    /**
     * Handle Save button click
     * Persists current settings to localStorage
     */
    handleSave() {
        // Settings are already applied via real-time preview
        // Just need to persist to localStorage
        this.settingsManager.save();

        // Hide the panel
        this.hide();
    }

    /**
     * Handle Cancel button click
     * Reverts to original settings
     */
    handleCancel() {
        if (this.originalSettings) {
            // Revert all settings
            for (const key in this.originalSettings) {
                this.settingsManager.set(key, this.originalSettings[key]);
            }

            // Apply reverted settings to mobile controls
            if (this.mobileControls) {
                this.mobileControls.applySettings();
            }
        }

        // Hide the panel
        this.hide();
    }

    /**
     * Handle Reset to Defaults button click
     * Resets all settings to default values
     */
    handleReset() {
        // Reset settings manager to defaults
        this.settingsManager.resetToDefaults();

        // Reload form controls with default values
        this.loadCurrentSettings();

        // Apply defaults to mobile controls
        if (this.mobileControls) {
            this.mobileControls.applySettings();
        }
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        // Escape key closes the panel (same as Cancel)
        if (event.key === 'Escape') {
            event.preventDefault();
            this.handleCancel();
        }

        // Enter key on focused button triggers it
        if (event.key === 'Enter' && event.target.tagName === 'BUTTON') {
            event.preventDefault();
            event.target.click();
        }
    }

    /**
     * Handle click on overlay background (outside panel)
     * Closes the panel (same as Cancel)
     * @param {MouseEvent} event - Click event
     */
    handleOverlayClick(event) {
        // Only close if clicking directly on overlay (not on panel)
        if (event.target === this.overlayElement) {
            this.handleCancel();
        }
    }

    /**
     * Check if panel is currently visible
     * @returns {boolean} True if panel is visible
     */
    isOpen() {
        return this.isVisible;
    }

    /**
     * Cleanup - remove DOM elements and event listeners
     */
    destroy() {
        // Remove keyboard listener
        document.removeEventListener('keydown', this.handleKeyDown);

        // Remove overlay from DOM
        if (this.overlayElement && this.overlayElement.parentNode) {
            this.overlayElement.parentNode.removeChild(this.overlayElement);
        }

        // Clear references
        this.panelElement = null;
        this.overlayElement = null;
        this.sizeSlider = null;
        this.opacitySlider = null;
        this.hapticCheckbox = null;
        this.controlSchemeToggle = null;
    }
}
