/**
 * ScoreManager Utility Class
 * 
 * Provides centralized score management functionality for CTF challenges.
 * Handles score submission to backend API, local storage operations, and score display updates.
 * 
 * Requirements: 4.1, 4.4
 */
class ScoreManager {
  /**
   * Create a new ScoreManager instance
   * @param {string} challengeId - The unique identifier for the challenge (e.g., 'challenge1', 'challenge2')
   */
  constructor(challengeId) {
    this.challengeId = challengeId;
    this.scoreKey = `challenge_${challengeId}_score`;
  }

  /**
   * Submit score to the backend API
   * @param {number} score - The score/points to submit
   * @param {number} maxScore - The maximum possible score for context (optional, for logging)
   * @returns {Promise<Object>} Response data from the API
   */
  async submitScore(score, maxScore = null) {
    try {
      console.log(`ScoreManager: Submitting score for ${this.challengeId}: ${score} points`);
      
      const response = await fetch('/api/submit_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: score
        })
      });

      const data = await response.json();
      console.log(`ScoreManager: API response:`, data);

      if (data.success) {
        console.log(`ScoreManager: Score updated for ${this.challengeId}:`, data.new_score);
        
        // Dispatch custom event to update team score display
        const event = new CustomEvent('score-updated', {
          detail: { 
            newScore: data.new_score,
            challengeId: this.challengeId,
            score: score,
            maxScore: maxScore
          }
        });
        console.log(`ScoreManager: Dispatching score-updated event:`, event.detail);
        window.dispatchEvent(event);
        
        return data;
      } else {
        console.error(`ScoreManager: Score update failed for ${this.challengeId}:`, data.message);
        return data;
      }
    } catch (err) {
      console.error(`ScoreManager: Error submitting score for ${this.challengeId}:`, err);
      throw err;
    }
  }

  /**
   * Save score to local storage
   * @param {number} score - The score to save locally
   */
  saveLocalScore(score) {
    try {
      localStorage.setItem(this.scoreKey, score.toString());
      console.log(`ScoreManager: Saved local score for ${this.challengeId}: ${score}`);
    } catch (err) {
      console.error(`ScoreManager: Error saving local score for ${this.challengeId}:`, err);
    }
  }

  /**
   * Retrieve score from local storage
   * @returns {number} The stored score, or 0 if not found
   */
  getLocalScore() {
    try {
      const score = localStorage.getItem(this.scoreKey);
      return score ? parseInt(score, 10) : 0;
    } catch (err) {
      console.error(`ScoreManager: Error retrieving local score for ${this.challengeId}:`, err);
      return 0;
    }
  }

  /**
   * Update the score display in the DOM
   * @param {string} elementId - The ID of the element to update
   * @param {number} score - The current score
   * @param {number} maxScore - The maximum possible score
   */
  updateScoreDisplay(elementId, score, maxScore) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = `${score}/${maxScore}`;
      console.log(`ScoreManager: Updated score display for ${elementId}: ${score}/${maxScore}`);
    } else {
      console.warn(`ScoreManager: Element with ID '${elementId}' not found`);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreManager;
}
