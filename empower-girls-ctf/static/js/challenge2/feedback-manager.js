/**
 * FeedbackManager - Manages feedback display for correct and incorrect answers
 * 
 * Extends ModalManager base class for common modal functionality.
 * 
 * Responsibilities:
 * - Display correct answer feedback (green checkmark, confetti, positive message)
 * - Display incorrect answer feedback ("HACKED!" animation, explanation)
 * - Show explanation text for both correct and incorrect answers
 * - Provide "Continue" button to proceed to next vulnerability
 */

class FeedbackManager extends ModalManager {
  constructor() {
    // Initialize base modal manager (prevent closing on overlay/escape - students must click Continue)
    super('feedback-modal', { closeOnOverlay: false, closeOnEscape: false });
    
    // Feedback-specific elements
    this.modalContent = document.querySelector('.feedback-modal-content');
    this.feedbackIcon = document.getElementById('feedback-icon');
    this.feedbackMessage = document.getElementById('feedback-message');
    this.feedbackExplanation = document.getElementById('feedback-explanation');
    this.continueBtn = document.getElementById('feedback-continue');
    
    this.onContinueCallback = null;
    
    this._initializeFeedbackEventListeners();
  }
  
  /**
   * Initialize feedback-specific event listeners
   * @private
   */
  _initializeFeedbackEventListeners() {
    // Continue button click
    this.addCloseButton('#feedback-continue', () => {
      this._cleanupAnimations();
      if (this.onContinueCallback) {
        this.onContinueCallback();
      }
    });
  }
  
  /**
   * Display correct answer feedback
   * @param {string} explanation - Explanation of why the answer is correct
   */
  showCorrectFeedback(explanation) {
    if (!this.modal || !this.modalContent) {
      console.error('FeedbackManager: Modal elements not found');
      return;
    }
    
    // Set modal to correct state
    this.modalContent.classList.remove('incorrect', 'shake');
    this.modalContent.classList.add('correct');
    
    // Remove red flash from overlay if present
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('red-flash');
    }
    
    // Set icon (green checkmark with happy AppSpider)
    if (this.feedbackIcon) {
      this.feedbackIcon.innerHTML = `
        <div class="d-flex flex-column align-items-center gap-2">
          <img src="/static/images/appspider-icon.png" alt="Happy AppSpider" style="width: 60px; height: 60px;">
          <i class="fas fa-circle-check" style="color: #28a745; font-size: 40px;"></i>
        </div>
      `;
    }
    
    // Set positive message (randomize for variety)
    const positiveMessages = [
      'Great job!',
      'Correct!',
      'You got it!',
      'Excellent!',
      'Well done!',
      'Perfect!'
    ];
    const randomMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
    
    if (this.feedbackMessage) {
      this.feedbackMessage.textContent = randomMessage;
      this.feedbackMessage.classList.remove('glitch');
    }
    
    // Set explanation
    if (this.feedbackExplanation) {
      this.feedbackExplanation.textContent = explanation;
    }
    
    // Show modal using base class method
    this.show();
    
    // Trigger confetti animation
    this._triggerConfetti();
    
    // Focus on continue button for accessibility
    this.focusElement('#feedback-continue');
  }
  
  /**
   * Display incorrect answer feedback
   * @param {string} explanation - Explanation of the correct answer
   */
  showIncorrectFeedback(explanation) {
    if (!this.modal || !this.modalContent) {
      console.error('FeedbackManager: Modal elements not found');
      return;
    }
    
    // Set modal to incorrect state
    this.modalContent.classList.remove('correct');
    this.modalContent.classList.add('incorrect');
    
    // Randomly choose a disappointed AppSpider expression
    const appspiderExpressions = [
      'confused-appspider.png',
      'disgust-appspider.png',
      'side-eye-appspider.png'
    ];
    const randomExpression = appspiderExpressions[Math.floor(Math.random() * appspiderExpressions.length)];
    
    // Set icon (red X with disappointed AppSpider)
    if (this.feedbackIcon) {
      this.feedbackIcon.innerHTML = `
        <div class="d-flex flex-column align-items-center gap-2">
          <img src="/static/images/${randomExpression}" alt="Disappointed AppSpider" style="width: 60px; height: 60px;">
          <i class="fas fa-circle-xmark" style="color: #FF6B6B; font-size: 40px;"></i>
        </div>
      `;
    }
    
    // Set "HACKED!" message with glitch effect
    if (this.feedbackMessage) {
      this.feedbackMessage.textContent = 'HACKED!';
      this.feedbackMessage.setAttribute('data-text', 'HACKED!');
      this.feedbackMessage.classList.add('glitch');
    }
    
    // Set explanation with encouragement
    if (this.feedbackExplanation) {
      this.feedbackExplanation.textContent = explanation + ' Don\'t worry, keep learning!';
    }
    
    // Show modal using base class method
    this.show();
    
    // Trigger "HACKED!" animation effects
    this._triggerHackedAnimation();
    
    // Focus on continue button for accessibility
    this.focusElement('#feedback-continue');
  }
  
  /**
   * Hide the feedback modal (alias for base class hide method)
   */
  hideFeedback() {
    this._cleanupAnimations();
    this.hide();
  }
  
  /**
   * Set callback function to be called when Continue button is clicked
   * @param {Function} callback - Function to call when feedback is acknowledged
   */
  onFeedbackAcknowledged(callback) {
    this.onContinueCallback = callback;
  }
  
  /**
   * Clean up animation classes
   * @private
   */
  _cleanupAnimations() {
    if (this.modalContent) {
      this.modalContent.classList.remove('shake');
    }
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('red-flash');
    }
    if (this.feedbackMessage) {
      this.feedbackMessage.classList.remove('glitch');
      this.feedbackMessage.removeAttribute('data-text');
    }
  }
  
  /**
   * Trigger confetti animation for correct answers
   * Uses party.js library with configured count, spread, and size
   * @private
   */
  _triggerConfetti() {
    // Check if party.js is available
    if (typeof party !== 'undefined' && party.confetti) {
      // Trigger confetti from the center of the screen
      // Configuration: count (50-100), spread (70 degrees), size (0.8-1.2)
      party.confetti(document.body, {
        count: party.variation.range(50, 100),  // Random count between 50-100 particles
        spread: 70,                              // 70 degree spread angle
        size: party.variation.range(0.8, 1.2)   // Random size variation for visual interest
      });
    } else {
      console.warn('FeedbackManager: party.js not available for confetti animation');
    }
  }
  
  /**
   * Trigger "HACKED!" animation effects for incorrect answers
   * @private
   */
  _triggerHackedAnimation() {
    // Screen shake effect
    if (this.modalContent) {
      this.modalContent.classList.add('shake');
      
      // Remove shake class after animation completes
      setTimeout(() => {
        this.modalContent.classList.remove('shake');
      }, 500);
    }
    
    // Red flash overlay effect
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('red-flash');
      
      // Remove red flash class after animation completes
      setTimeout(() => {
        this.modalOverlay.classList.remove('red-flash');
      }, 600);
    }
    
    // Glitch text effect is handled by CSS class on feedbackMessage
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeedbackManager;
}
