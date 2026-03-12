/**
 * PasswordValidator - Validates password guesses against backend
 */
class PasswordValidator {
  /**
   * Validate password guess
   * @param {string} guess
   * @param {number} level
   * @returns {Promise<Object>}
   */
  async validatePassword(guess, level) {
    try {
      const response = await fetch('/api/validate_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess, level })
      });
      const data = await response.json();
      return {
        correct: data.correct,
        message: data.message
      };
    } catch (error) {
      console.error('Error validating password:', error);
      return {
        correct: false,
        message: 'Error validating password. Please try again.'
      };
    }
  }

  /**
   * Show validation feedback
   * @param {boolean} correct
   * @param {string} message
   */
  showFeedback(correct, message) {
    const feedbackEl = document.getElementById('validation-feedback');
    if (!feedbackEl) return;
    
    // Clear any existing feedback first
    feedbackEl.innerHTML = '';
    
    // Add new feedback
    feedbackEl.innerHTML = `
      <div class="alert alert-${correct ? 'success' : 'danger'}" role="alert">
        <i class="fas fa-${correct ? 'check' : 'times'} me-2"></i>${message}
      </div>
    `;
  }

  /**
   * Show success animation
   */
  showSuccessAnimation() {
    const modal = document.getElementById('password-modal');
    if (modal) {
      modal.classList.add('celebration');
      setTimeout(() => {
        modal.classList.remove('celebration');
      }, 1500);
    }
  }
}
