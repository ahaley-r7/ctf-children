/**
 * ModalManager - Base class for modal management
 * 
 * Provides common functionality for all modal dialogs:
 * - Show/hide with body scroll prevention
 * - Event listener management
 * - Overlay click handling
 * - Keyboard (Escape) handling
 * 
 * Usage: Extend this class for specific modal types
 */

class ModalManager {
  /**
   * Initialize modal manager
   * @param {string} modalId - ID of the modal element
   * @param {Object} options - Configuration options
   * @param {boolean} options.closeOnOverlay - Allow closing by clicking overlay (default: true)
   * @param {boolean} options.closeOnEscape - Allow closing with Escape key (default: true)
   */
  constructor(modalId, options = {}) {
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.modalOverlay = this.modal?.querySelector('.modal-overlay') || 
                        this.modal?.querySelector(`[class*="modal-overlay"]`);
    this.isOpen = false;
    
    // Configuration
    this.options = {
      closeOnOverlay: options.closeOnOverlay !== undefined ? options.closeOnOverlay : true,
      closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true
    };
    
    // Callbacks
    this.onShowCallback = null;
    this.onHideCallback = null;
    
    // Initialize base event listeners
    this._initializeBaseEventListeners();
  }
  
  /**
   * Initialize base event listeners (overlay, escape key)
   * @private
   */
  _initializeBaseEventListeners() {
    // Overlay click handler
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (this.options.closeOnOverlay) {
          this.hide();
        } else {
          e.stopPropagation();
        }
      });
    }
    
    // Escape key handler
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.hide();
        }
      });
    }
  }
  
  /**
   * Show the modal
   */
  show() {
    if (!this.modal) {
      console.error(`ModalManager: Modal with id "${this.modalId}" not found`);
      return;
    }
    
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
    
    // Call show callback if provided
    if (this.onShowCallback) {
      this.onShowCallback();
    }
  }
  
  /**
   * Hide the modal
   */
  hide() {
    if (!this.modal) {
      return;
    }
    
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.isOpen = false;
    
    // Call hide callback if provided
    if (this.onHideCallback) {
      this.onHideCallback();
    }
  }
  
  /**
   * Check if modal is currently visible
   * @returns {boolean} True if modal is visible
   */
  isVisible() {
    return this.isOpen;
  }
  
  /**
   * Add a click handler to a button that closes the modal
   * @param {string} selector - CSS selector for the button
   * @param {Function} callback - Optional callback to run before closing
   */
  addCloseButton(selector, callback) {
    const button = this.modal?.querySelector(selector);
    if (button) {
      button.addEventListener('click', () => {
        if (callback) {
          callback();
        }
        this.hide();
      });
    }
  }
  
  /**
   * Add a click handler to a button (without closing modal)
   * @param {string} selector - CSS selector for the button
   * @param {Function} callback - Callback to run when button is clicked
   */
  addButtonHandler(selector, callback) {
    const button = this.modal?.querySelector(selector);
    if (button) {
      button.addEventListener('click', callback);
    }
  }
  
  /**
   * Set callback to run when modal is shown
   * @param {Function} callback - Function to call when modal is shown
   */
  onShow(callback) {
    this.onShowCallback = callback;
  }
  
  /**
   * Set callback to run when modal is hidden
   * @param {Function} callback - Function to call when modal is hidden
   */
  onHide(callback) {
    this.onHideCallback = callback;
  }
  
  /**
   * Focus on an element within the modal (for accessibility)
   * @param {string} selector - CSS selector for the element to focus
   * @param {number} delay - Delay in milliseconds before focusing (default: 100)
   */
  focusElement(selector, delay = 100) {
    setTimeout(() => {
      const element = this.modal?.querySelector(selector);
      if (element) {
        element.focus();
      }
    }, delay);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalManager;
}
