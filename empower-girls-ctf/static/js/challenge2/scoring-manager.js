/**
 * ScoringManager - Manages scoring for the Interactive Security Scanner Challenge
 * 
 * Responsibilities:
 * - Initialize score at 5 points
 * - Decrease score by 1 for each incorrect answer
 * - Enforce minimum score of 1 point
 * - Track wrong answer count
 * - Submit final score to API using utility ScoreManager
 * - Display final score to student
 * 
 * Requirements: 7.1, 7.2, 7.3, 4.1
 */

class ScoringManager {
  /**
   * Create a new ScoringManager
   * @param {number} initialScore - Starting score (default: 5)
   */
  constructor(initialScore = 5) {
    this.initialScore = initialScore;
    this.currentScore = initialScore;
    this.wrongAnswerCount = 0;
    this.minScore = 1;
    
    // Use utility ScoreManager for score submission
    this.scoreManager = new ScoreManager('challenge2');
  }
  
  /**
   * Decrease the score by 1 point for an incorrect answer
   * Score can drop to 0 points
   * 
   * Requirements: 7.2, 7.3
   */
  decrementScore() {
    // Increment wrong answer count
    this.wrongAnswerCount++;
    
    // Decrease score by 1, can go to 0
    this.currentScore = Math.max(0, this.currentScore - 1);
    
    console.log(`Score decremented. Current score: ${this.currentScore}, Wrong answers: ${this.wrongAnswerCount}`);
  }
  
  /**
   * Deduct points (for hints or other penalties)
   * Score can drop to 0 points
   * 
   * @param {number} points - Number of points to deduct
   */
  deductPoints(points) {
    // Decrease score, can go to 0
    this.currentScore = Math.max(0, this.currentScore - points);
    
    console.log(`${points} point(s) deducted. Current score: ${this.currentScore}`);
  }
  
  /**
   * Get the current score
   * @returns {number} Current score (1-5)
   */
  getScore() {
    return this.currentScore;
  }
  
  /**
   * Get the number of wrong answers
   * @returns {number} Count of incorrect answers
   */
  getWrongAnswerCount() {
    return this.wrongAnswerCount;
  }
  
  /**
   * Get the initial score
   * @returns {number} Initial score value
   */
  getInitialScore() {
    return this.initialScore;
  }
  
  /**
   * Get the minimum score
   * @returns {number} Minimum score value (always 1)
   */
  getMinScore() {
    return this.minScore;
  }
  
  /**
   * Reset the score to initial value
   * Useful for testing or restarting the challenge
   */
  reset() {
    this.currentScore = this.initialScore;
    this.wrongAnswerCount = 0;
    console.log('Score reset to initial value');
  }
  
  /**
   * Set the score to a specific value (for state persistence)
   * @param {number} score - The score to set
   */
  setScore(score) {
    if (score >= this.minScore && score <= this.initialScore) {
      this.currentScore = score;
      // Calculate wrong answer count based on score difference
      this.wrongAnswerCount = this.initialScore - score;
      console.log(`Score set to ${score}, wrong answers: ${this.wrongAnswerCount}`);
    } else {
      console.error(`Invalid score: ${score}. Must be between ${this.minScore} and ${this.initialScore}`);
    }
  }
  
  /**
   * Award 1 point for a correct answer and submit to API immediately
   * 
   * @returns {Promise<boolean>} True if submission successful, false otherwise
   */
  async submitCorrectAnswer() {
    try {
      // Award 1 point for correct answer
      const pointsEarned = 1;
      
      // Use utility ScoreManager to submit the point immediately
      await this.scoreManager.submitScore(pointsEarned, 1);
      
      console.log(`Correct answer! Submitted ${pointsEarned} point immediately`);
      return true;
    } catch (error) {
      console.error('ScoringManager: Error submitting correct answer score:', error);
      return false;
    }
  }
  
  /**
   * Submit the final score to the scoring API
   * Uses the utility ScoreManager for consistent score submission
   * 
   * Requirements: 7.4, 4.1
   * 
   * @returns {Promise<boolean>} True if submission successful, false otherwise
   */
  async submitScore() {
    try {
      // Use utility ScoreManager to submit score
      await this.scoreManager.submitScore(this.currentScore, this.initialScore);
      
      console.log(`Score submitted: ${this.currentScore} points`);
      return true;
    } catch (error) {
      console.error('ScoringManager: Error submitting score:', error);
      return false;
    }
  }
  
  /**
   * Display the final score to the student
   * Creates a visual score display element
   * 
   * Requirements: 7.5
   * 
   * @param {HTMLElement} container - Container element to append score display to
   */
  displayFinalScore(container) {
    if (!container) {
      console.error('ScoringManager: No container provided for score display');
      return;
    }
    
    // Create score display element
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'final-score-display';
    scoreDisplay.innerHTML = `
      <div class="score-card">
        <h3>Challenge Complete!</h3>
        <div class="score-value">${this.currentScore}</div>
        <div class="score-label">Points Earned</div>
        <div class="score-details">
          ${this.wrongAnswerCount === 0 
            ? '<i class="fas fa-trophy"></i> Perfect score! No wrong answers!' 
            : `Wrong answers: ${this.wrongAnswerCount}`}
        </div>
      </div>
    `;
    
    // Append to container
    container.appendChild(scoreDisplay);
    
    console.log(`Final score displayed: ${this.currentScore} points`);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoringManager;
}
