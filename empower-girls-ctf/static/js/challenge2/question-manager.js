/**
 * QuestionManager - Manages question modal display with progressive difficulty
 * 
 * Extends ModalManager base class for common modal functionality.
 * 
 * Responsibilities:
 * - Display question text and answer choices
 * - Implement N+1 difficulty: vulnerability N has N+1 choices
 * - Shuffle answer choices to prevent pattern memorization
 * - Disable answer selection after choice is made
 * - Trigger callback with selected answer index
 */

class QuestionManager extends ModalManager {
  constructor() {
    // Initialize base modal manager (prevent closing - students must answer)
    super('question-modal', { closeOnOverlay: false, closeOnEscape: false });
    
    // Question-specific elements
    this.modalTitle = document.getElementById('question-title');
    this.questionText = document.getElementById('question-text');
    this.questionNumber = document.getElementById('question-number');
    this.answerChoicesContainer = document.getElementById('answer-choices');
    
    this.onAnswerCallback = null;
    this.currentQuestionNumber = 0;
  }
  
  /**
   * Display a question with answer choices
   * @param {Object} vulnerability - Vulnerability object containing question data
   * @param {number} questionNumber - Question number (1-5) for progressive difficulty
   */
  showQuestion(vulnerability, questionNumber) {
    if (!this.modal || !vulnerability || !vulnerability.question) {
      console.error('QuestionManager: Invalid vulnerability data or modal not found');
      return;
    }
    
    this.currentQuestionNumber = questionNumber;
    
    // Set question number badge
    if (this.questionNumber) {
      this.questionNumber.textContent = `Question ${questionNumber} of 5`;
    }
    
    // Set question text
    if (this.questionText) {
      this.questionText.textContent = vulnerability.question.text;
    }
    
    // Get the correct number of answer choices based on progressive difficulty
    const choiceCount = this.getAnswerChoiceCount(questionNumber);
    const choices = vulnerability.question.choices.slice(0, choiceCount);
    
    // Shuffle choices to prevent pattern memorization
    const shuffledChoices = this._shuffleArray([...choices]);
    
    // Store the mapping from shuffled index to original index
    this.shuffledToOriginalMap = shuffledChoices.map(choice => 
      vulnerability.question.choices.indexOf(choice)
    );
    
    // Render answer choices
    this._renderAnswerChoices(shuffledChoices);
    
    // Show modal using base class method
    this.show();
    
    // Focus on first answer choice for accessibility
    this.focusElement('.answer-choice-btn');
  }
  
  /**
   * Calculate the number of answer choices based on question number
   * Progressive difficulty: Question N has N+1 choices
   * @param {number} questionNumber - Question number (1-5)
   * @returns {number} Number of answer choices to display
   */
  getAnswerChoiceCount(questionNumber) {
    return questionNumber + 1; // N+1 difficulty
  }
  
  /**
   * Render answer choice buttons
   * @private
   * @param {string[]} choices - Array of answer choice texts
   */
  _renderAnswerChoices(choices) {
    if (!this.answerChoicesContainer) {
      return;
    }
    
    // Clear existing choices
    this.answerChoicesContainer.innerHTML = '';
    
    // Create button for each choice
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'answer-choice-btn';
      button.textContent = choice;
      button.setAttribute('data-choice-index', index);
      button.setAttribute('aria-label', `Answer choice ${index + 1}: ${choice}`);
      
      // Add click handler
      button.addEventListener('click', () => {
        this._handleAnswerSelection(index);
      });
      
      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._handleAnswerSelection(index);
        }
      });
      
      this.answerChoicesContainer.appendChild(button);
    });
  }
  
  /**
   * Handle answer selection
   * @private
   * @param {number} shuffledIndex - Index of selected answer in shuffled array
   */
  _handleAnswerSelection(shuffledIndex) {
    // Map shuffled index back to original index
    const originalIndex = this.shuffledToOriginalMap[shuffledIndex];
    
    // Disable all answer buttons
    this.disableAnswers();
    
    // Highlight selected answer
    const buttons = this.answerChoicesContainer.querySelectorAll('.answer-choice-btn');
    buttons[shuffledIndex].classList.add('selected');
    
    // Hide modal
    this.hideQuestion();
    
    // Trigger callback with original answer index
    if (this.onAnswerCallback) {
      this.onAnswerCallback(originalIndex);
    }
  }
  
  /**
   * Disable all answer choice buttons
   */
  disableAnswers() {
    if (!this.answerChoicesContainer) {
      return;
    }
    
    const buttons = this.answerChoicesContainer.querySelectorAll('.answer-choice-btn');
    buttons.forEach(button => {
      button.disabled = true;
    });
  }
  
  /**
   * Hide the question modal (alias for base class hide method)
   */
  hideQuestion() {
    this.hide();
  }
  
  /**
   * Set callback function to be called when answer is selected
   * @param {Function} callback - Function to call with selected answer index
   */
  onAnswerSelected(callback) {
    this.onAnswerCallback = callback;
  }
  
  /**
   * Shuffle array using Fisher-Yates algorithm
   * @private
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  _shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionManager;
}
