/**
 * LessonManager - Manages mini-lesson modal display and flow
 * 
 * Extends ModalManager base class for common modal functionality.
 * 
 * Responsibilities:
 * - Display modal with lesson title and content
 * - Show "Continue" button after lesson
 * - Trigger callback when student clicks Continue
 * - Ensure lessons are readable in ~15 seconds (target 50-75 words)
 */

class LessonManager extends ModalManager {
  constructor() {
    // Initialize base modal manager (allows closing on overlay/escape)
    super('lesson-modal', { closeOnOverlay: true, closeOnEscape: true });
    
    // Lesson-specific elements
    this.modalTitle = document.getElementById('lesson-title');
    this.modalContent = document.getElementById('lesson-content');
    this.modalSeverity = document.getElementById('lesson-severity');
    this.continueBtn = document.getElementById('lesson-continue');
    this.closeBtn = document.querySelector('.lesson-modal-close');
    
    this.onCompleteCallback = null;
    
    this._initializeLessonEventListeners();
  }
  
  /**
   * Initialize lesson-specific event listeners
   * @private
   */
  _initializeLessonEventListeners() {
    // Continue button click
    this.addCloseButton('#lesson-continue', () => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    });
    
    // Close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }
  }
  
  /**
   * Display a mini-lesson modal
   * @param {Object} vulnerability - Vulnerability object containing lesson data
   * @param {string} vulnerability.type - Vulnerability type (e.g., "SQL Injection")
   * @param {string} vulnerability.severity - Severity level ("critical", "medium", "low")
   * @param {string} vulnerability.icon - Font Awesome icon class (e.g., "fas fa-database")
   * @param {Object} vulnerability.lesson - Lesson content
   * @param {string} vulnerability.lesson.title - Lesson title
   * @param {string} vulnerability.lesson.content - Lesson content (50-75 words)
   */
  showLesson(vulnerability) {
    if (!this.modal || !vulnerability || !vulnerability.lesson) {
      console.error('LessonManager: Invalid vulnerability data or modal not found');
      return;
    }
    
    // Set lesson title with icon
    if (this.modalTitle) {
      const iconHtml = vulnerability.icon ? `<i class="${vulnerability.icon}" style="margin-right: 10px;"></i>` : '';
      this.modalTitle.innerHTML = iconHtml + (vulnerability.lesson.title || vulnerability.type);
    }
    
    // Set lesson content
    if (this.modalContent) {
      this.modalContent.textContent = vulnerability.lesson.content;
    }
    
    // Set severity badge with icon
    if (this.modalSeverity) {
      const severityIcon = vulnerability.severity === 'critical' 
        ? '<i class="fas fa-circle-exclamation"></i>' 
        : '<i class="fas fa-triangle-exclamation"></i>';
      this.modalSeverity.innerHTML = severityIcon + ' ' + (vulnerability.severity || 'medium');
      this.modalSeverity.className = `lesson-severity-badge ${vulnerability.severity || 'medium'}`;
    }
    
    // Show modal using base class method
    this.show();
    
    // Focus on continue button for accessibility
    this.focusElement('#lesson-continue');
  }
  
  /**
   * Hide the mini-lesson modal (alias for base class hide method)
   */
  hideLesson() {
    this.hide();
  }
  
  /**
   * Set callback function to be called when lesson is complete
   * @param {Function} callback - Function to call when Continue is clicked
   */
  onLessonComplete(callback) {
    this.onCompleteCallback = callback;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonManager;
}
