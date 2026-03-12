/**
 * ModalManager - Utility class for managing modal dialogs
 * 
 * Provides common functionality for modal show/hide operations,
 * content updates, and event handling for close buttons and backdrop clicks.
 * Supports both Bootstrap modals and custom modals.
 * 
 * Usage:
 *   const modal = new ModalManager('myModalId');
 *   modal.show();
 *   modal.setContent('Title', '<p>Body content</p>', '<button>OK</button>');
 *   modal.hide();
 */
class ModalManager {
  /**
   * Initialize modal manager
   * @param {string} modalId - ID of the modal element
   */
  constructor(modalId) {
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    
    if (!this.modal) {
      console.warn(`ModalManager: Modal with id "${modalId}" not found`);
      return;
    }
    
    // Detect if this is a Bootstrap modal
    this.isBootstrap = this.modal.classList.contains('modal');
    
    // For Bootstrap modals, use Bootstrap's Modal API
    if (this.isBootstrap && typeof bootstrap !== 'undefined') {
      this.bootstrapModal = null; // Will be initialized on first show()
    }
    
    // For custom modals, set up event listeners
    if (!this.isBootstrap) {
      this.closeBtn = this.modal.querySelector('.close');
      this.setupEventListeners();
    }
  }
  
  /**
   * Set up event listeners for close button and backdrop click (custom modals only)
   * @private
   */
  setupEventListeners() {
    // Close button handler
    if (this.closeBtn) {
      this.closeBtn.onclick = () => this.hide();
    }
    
    // Backdrop click handler - close modal when clicking outside content
    window.onclick = (event) => {
      if (event.target === this.modal) {
        this.hide();
      }
    };
  }
  
  /**
   * Show the modal
   */
  show() {
    if (!this.modal) return;
    
    if (this.isBootstrap && typeof bootstrap !== 'undefined') {
      // Use Bootstrap Modal API
      if (!this.bootstrapModal) {
        // Ensure modal has proper Bootstrap attributes
        if (!this.modal.hasAttribute('tabindex')) {
          this.modal.setAttribute('tabindex', '-1');
        }
        if (!this.modal.hasAttribute('aria-hidden')) {
          this.modal.setAttribute('aria-hidden', 'true');
        }
        
        // Remove any existing backdrops before creating new modal
        const existingBackdrops = document.querySelectorAll('.modal-backdrop');
        existingBackdrops.forEach(backdrop => backdrop.remove());
        
        this.bootstrapModal = new bootstrap.Modal(this.modal, {
          backdrop: true,
          keyboard: true,
          focus: true
        });
      }
      
      // Remove any stale backdrops before showing
      const staleBackdrops = document.querySelectorAll('.modal-backdrop');
      staleBackdrops.forEach(backdrop => backdrop.remove());
      
      this.bootstrapModal.show();
    } else {
      // Use simple display toggle
      this.modal.style.display = 'block';
    }
  }
  
  /**
   * Hide the modal
   */
  hide() {
    if (!this.modal) return;
    
    if (this.isBootstrap && typeof bootstrap !== 'undefined') {
      // Use Bootstrap Modal API
      const instance = bootstrap.Modal.getInstance(this.modal);
      if (instance) {
        instance.hide();
      }
    } else {
      // Use simple display toggle
      this.modal.style.display = 'none';
    }
  }
  
  /**
   * Update modal content
   * @param {string} title - Modal title text
   * @param {string} body - Modal body HTML content
   * @param {string} footer - Modal footer HTML content (optional)
   */
  setContent(title, body, footer = '') {
    if (!this.modal) {
      return;
    }
    
    // Try multiple selectors for title (h2, h5, .modal-title)
    const titleEl = this.modal.querySelector('.modal-header h2') || 
                    this.modal.querySelector('.modal-header h5') ||
                    this.modal.querySelector('.modal-title');
    const bodyEl = this.modal.querySelector('.modal-body');
    const footerEl = this.modal.querySelector('.modal-footer');
    
    if (titleEl) {
      titleEl.textContent = title;
    }
    
    if (bodyEl) {
      bodyEl.innerHTML = body;
    }
    
    if (footerEl && footer) {
      footerEl.innerHTML = footer;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalManager;
}
