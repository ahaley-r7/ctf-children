/**
 * Challenge2Controller - Main orchestrator for Interactive Security Scanner Challenge
 * 
 * Responsibilities:
 * - Initialize all manager components
 * - Implement state machine (scanning, lesson, question, feedback, complete)
 * - Handle state transitions
 * - Coordinate component interactions
 * 
 * State Machine Flow:
 * [Initial] → [Scanning] → [Vulnerability Discovered] → [Mini-Lesson] → 
 * [Question] → [Feedback] → [Scanning] → ... → [All Complete] → [Final Score]
 * 
 * Requirements: All
 */

class Challenge2Controller {
  /**
   * Create a new Challenge2Controller
   * @param {Object} config - Configuration object
   * @param {HTMLElement} config.scannerElement - The scanner element
   * @param {HTMLElement} config.fakeSiteWrapper - The fake website container
   * @param {HTMLElement} config.scannerSection - The scanner section container
   */
  constructor(config) {
    // Store configuration
    this.scannerElement = config.scannerElement;
    this.fakeSiteWrapper = config.fakeSiteWrapper;
    this.scannerSection = config.scannerSection;
    
    // State machine
    this.currentState = 'initial'; // initial, scanning, lesson, question, feedback, complete
    this.discoveredCount = 0;
    this.attemptedCount = 0; // Track number of vulnerabilities attempted (for progressive difficulty)
    this.currentVulnerability = null;
    
    // Hint system
    this.hintBtn = document.getElementById('hint-btn');
    this.hintDisplay = document.getElementById('hint-display');
    this.hintCardContainer = document.getElementById('hint-card-container');
    this.hintShown = false;
    
    // Vulnerability hints
    this.vulnerabilityHints = {
      'sql-injection': 'Look at the search bar - what happens when someone types special characters?',
      'xss': 'Check the customer reviews section - can you spot any suspicious code?',
      'exposed-api': 'Scroll down to the footer - is there any sensitive information visible?',
      'insecure-http': 'Look at the URL bar at the top - is the connection secure?',
      'weak-auth': 'Find the login form - how strong is the password requirement?'
    };
    
    // Initialize all manager components
    this.vulnerabilityManager = new VulnerabilityManager();
    this.lessonManager = new LessonManager();
    this.questionManager = new QuestionManager();
    this.feedbackManager = new FeedbackManager();
    this.scoringManager = new ScoringManager(5); // Initialize with 5 points
    this.scannerManager = null; // Will be initialized when challenge starts
    
    // Bind methods to preserve context
    this.handleVulnerabilityClick = this.handleVulnerabilityClick.bind(this);
    this.startVulnerabilityFlow = this.startVulnerabilityFlow.bind(this);
    this.transitionToScanning = this.transitionToScanning.bind(this);
    this.showChallengeCompletion = this.showChallengeCompletion.bind(this);
    this.showHint = this.showHint.bind(this);
  }
  
  /**
   * Initialize the challenge
   * Sets up the scanner and vulnerable areas
   */
  initialize() {
    console.log('Challenge2Controller: Initializing challenge');
    
    // Load saved progress first
    this.loadProgress();
    
    // Create and display score indicator
    this.createScoreDisplay();
    this.updateScoreDisplay();
    
    // Set up hint button
    if (this.hintBtn) {
      this.hintBtn.addEventListener('click', this.showHint);
    }
    
    // Define vulnerable areas for collision detection
    const vulnerableAreas = [
      { selector: '[data-vulnerable="sql-injection"]' },
      { selector: '[data-vulnerable="xss"]' },
      { selector: '[data-vulnerable="exposed-api"]' },
      { selector: '[data-vulnerable="insecure-http"]' },
      { selector: '[data-vulnerable="weak-auth"]' }
    ];
    
    // Initialize Scanner Manager (scanner element is optional - using cursor follower)
    this.scannerManager = new ScannerManager(
      this.scannerElement,  // Can be null - scanner manager will use cursor follower only
      vulnerableAreas,
      this.handleVulnerabilityClick,
      this.vulnerabilityManager
    );
    
    console.log('Challenge2Controller: Scanner manager initialized (cursor follower mode)');
    
    // Set up callback chains for component interactions
    this.setupCallbacks();
    
    // Transition to scanning state
    this.transitionToScanning();
  }
  
  /**
   * Load saved progress from localStorage
   * @private
   */
  loadProgress() {
    const saved = localStorage.getItem('challenge2_progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        
        // Restore discovered vulnerabilities
        if (progress.discoveredVulnerabilities && Array.isArray(progress.discoveredVulnerabilities)) {
          progress.discoveredVulnerabilities.forEach(vulnId => {
            this.vulnerabilityManager.markDiscovered(vulnId);
            
            // DO NOT apply visual feedback here - it will be applied when the area is clicked
            // This prevents vulnerabilities from appearing as "fixed" before the challenge starts
          });
          
          this.discoveredCount = progress.discoveredVulnerabilities.length;
          // Attempted count equals discovered count when loading progress
          this.attemptedCount = progress.discoveredVulnerabilities.length;
        }
        
        // Restore score
        if (progress.score !== undefined) {
          this.scoringManager.setScore(progress.score);
        }
        
        console.log('Challenge2Controller: Loaded progress:', progress);
      } catch (e) {
        console.error('Challenge2Controller: Error loading progress:', e);
      }
    }
  }
  
  /**
   * Save current progress to localStorage
   * @private
   */
  saveProgress() {
    const discoveredVulnerabilities = this.vulnerabilityManager.getDiscoveredIds();
    const progress = {
      discoveredVulnerabilities: discoveredVulnerabilities,
      discoveredCount: this.discoveredCount,
      score: this.scoringManager.getScore(),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('challenge2_progress', JSON.stringify(progress));
    console.log('Challenge2Controller: Saved progress:', progress);
  }
  
  /**
   * Clear saved progress from localStorage
   * @private
   */
  clearProgress() {
    localStorage.removeItem('challenge2_progress');
    localStorage.removeItem('challenge2_introCompleted');
    console.log('Challenge2Controller: Progress cleared');
  }
  
  /**
   * Set up callback chains for component interactions
   * @private
   */
  setupCallbacks() {
    // Lesson complete → Show question
    this.lessonManager.onLessonComplete(() => {
      this.transitionToQuestion();
    });
    
    // Answer selected → Show feedback
    this.questionManager.onAnswerSelected((selectedIndex) => {
      this.handleAnswerSelection(selectedIndex);
    });
    
    // Feedback acknowledged → Return to scanning or complete
    this.feedbackManager.onFeedbackAcknowledged(() => {
      this.handleFeedbackAcknowledgment();
    });
  }
  
  /**
   * Handle vulnerability click (discovery)
   * @param {string} vulnerabilityId - ID of the discovered vulnerability
   * @param {HTMLElement} areaElement - The vulnerable area element
   */
  handleVulnerabilityClick(vulnerabilityId, areaElement) {
    console.log(`Challenge2Controller: Vulnerability discovered: ${vulnerabilityId}`);
    
    // Check if already discovered - prevent double-clicking
    if (this.vulnerabilityManager.isDiscovered(vulnerabilityId)) {
      console.log(`Challenge2Controller: Vulnerability ${vulnerabilityId} already discovered, ignoring click`);
      return;
    }
    
    // Get vulnerability data
    const vulnerability = this.vulnerabilityManager.getVulnerability(vulnerabilityId);
    if (!vulnerability) {
      console.error(`Challenge2Controller: Vulnerability not found: ${vulnerabilityId}`);
      return;
    }
    
    // Increment attempted count for progressive difficulty
    this.attemptedCount++;
    
    // DO NOT mark as discovered yet - only mark after correct answer
    // this.vulnerabilityManager.markDiscovered(vulnerabilityId);
    // this.discoveredCount++;
    
    // Store current vulnerability and area element for later feedback
    this.currentVulnerability = vulnerability;
    this.currentAreaElement = areaElement;
    
    // Save progress after discovery
    this.saveProgress();
    
    // Start vulnerability discovery flow
    this.startVulnerabilityFlow(vulnerability, this.discoveredCount);
  }
  
  /**
   * Start the vulnerability discovery flow
   * Shows lesson → question → feedback → return to scanning
   * @param {Object} vulnerability - The discovered vulnerability
   * @param {number} questionNumber - Question number (1-5) for progressive difficulty
   */
  startVulnerabilityFlow(vulnerability, questionNumber) {
    console.log(`Challenge2Controller: Starting vulnerability flow for ${vulnerability.id}`);
    
    // Transition to lesson state
    this.transitionToLesson(vulnerability);
  }
  
  /**
   * Transition to scanning state
   */
  transitionToScanning() {
    console.log('Challenge2Controller: Transitioning to scanning state');
    this.currentState = 'scanning';
    
    // Show scan instructions
    const scanInstructions = document.getElementById('scan-instructions');
    if (scanInstructions) {
      scanInstructions.classList.remove('d-none');
    }
    
    // Show hint card if not all vulnerabilities discovered
    if (this.discoveredCount < 5 && this.hintCardContainer) {
      this.hintCardContainer.classList.remove('d-none');
    }
    
    // Hide hint message when returning to scanning
    if (this.hintMessage) {
      this.hintMessage.classList.add('d-none');
    }
    this.hintShown = false;
    
    // Scanner is already active, just update state
    // Students can now click on vulnerable areas to discover them
  }
  
  /**
   * Show a hint for the next undiscovered vulnerability
   */
  showHint() {
    console.log('Challenge2Controller: Showing hint');
    
    // Find the first undiscovered vulnerability
    const allVulnerabilities = ['sql-injection', 'xss', 'exposed-api', 'insecure-http', 'weak-auth'];
    let nextVulnerability = null;
    
    for (const vulnId of allVulnerabilities) {
      if (!this.vulnerabilityManager.isDiscovered(vulnId)) {
        nextVulnerability = vulnId;
        break;
      }
    }
    
    if (nextVulnerability && this.hintDisplay) {
      // Display the hint
      const hintText = this.vulnerabilityHints[nextVulnerability];
      this.hintDisplay.innerHTML = `
        <div class="alert alert-info mt-3">
          <p class="mb-1"><i class="fas fa-info-circle me-1"></i> <strong>Hint:</strong></p>
          <p class="mb-0"><i class="fas fa-arrow-down me-2"></i>${hintText}</p>
        </div>
      `;
      this.hintShown = true;
      
      // Deduct 1 point for using hint
      this.scoringManager.deductPoints(1);
      this.updateScoreDisplay();
      
      // Save progress after hint usage
      this.saveProgress();
      
      // Optionally add a subtle highlight to the vulnerable area
      const vulnerableElement = document.querySelector(`[data-vulnerable="${nextVulnerability}"]`);
      if (vulnerableElement) {
        vulnerableElement.style.animation = 'hint-pulse 2s ease-in-out 3';
      }
    }
  }
  
  /**
   * Transition to lesson state
   * @param {Object} vulnerability - The vulnerability to show lesson for
   */
  transitionToLesson(vulnerability) {
    console.log(`Challenge2Controller: Transitioning to lesson state for ${vulnerability.id}`);
    this.currentState = 'lesson';
    
    // Hide the website
    this.fakeSiteWrapper.style.display = 'none';
    
    // Hide hint card during lesson/question modals
    if (this.hintCardContainer) {
      this.hintCardContainer.classList.add('d-none');
    }
    
    // Show mini-lesson
    this.lessonManager.showLesson(vulnerability);
  }
  
  /**
   * Transition to question state
   */
  transitionToQuestion() {
    console.log(`Challenge2Controller: Transitioning to question state`);
    this.currentState = 'question';
    
    // Keep hint card hidden during question modal
    if (this.hintCardContainer) {
      this.hintCardContainer.classList.add('d-none');
    }
    
    // Show question with progressive difficulty based on attempts (not discoveries)
    this.questionManager.showQuestion(this.currentVulnerability, this.attemptedCount);
  }
  
  /**
   * Handle answer selection
   * @param {number} selectedIndex - Index of the selected answer
   */
  handleAnswerSelection(selectedIndex) {
    console.log(`Challenge2Controller: Answer selected: ${selectedIndex}`);
    
    // Transition to feedback state
    this.transitionToFeedback(selectedIndex);
  }
  
  /**
   * Clear all vulnerability area outlines
   * @private
   */
  clearAllVulnerabilityOutlines() {
    const allVulnerableAreas = document.querySelectorAll('[data-vulnerable]');
    allVulnerableAreas.forEach(area => {
      area.style.removeProperty('border');
      area.style.removeProperty('box-shadow');
    });
  }
  
  /**
   * Transition to feedback state
   * @param {number} selectedIndex - Index of the selected answer
   */
  transitionToFeedback(selectedIndex) {
    console.log(`Challenge2Controller: Transitioning to feedback state`);
    this.currentState = 'feedback';
    
    // Check if answer is correct
    const isCorrect = selectedIndex === this.currentVulnerability.question.correctIndex;
    
    // Apply visual feedback to the vulnerable area
    if (this.currentAreaElement) {
      if (isCorrect) {
        // Clear ALL vulnerability outlines first to remove any red outlines from wrong answers
        this.clearAllVulnerabilityOutlines();
        
        // Green outline for correct answer
        this.currentAreaElement.style.border = '3px solid #28a745';
        this.currentAreaElement.style.boxShadow = '0 0 15px #28a745';
        
        // Add vulnerability-discovered class for correct answer
        this.currentAreaElement.classList.remove('vulnerability-attempted');
        this.currentAreaElement.classList.add('vulnerability-discovered');
        this.currentAreaElement.setAttribute('title', 'Vulnerability fixed!');
        
        // Apply vulnerability-specific visual fixes
        this.applyVisualFix(this.currentVulnerability.id);
      } else {
        // Red outline for incorrect answer
        this.currentAreaElement.style.border = '3px solid #dc3545';
        this.currentAreaElement.style.boxShadow = '0 0 15px #dc3545';
        
        // Add vulnerability-attempted class for wrong answer (stays red)
        this.currentAreaElement.classList.add('vulnerability-attempted');
        this.currentAreaElement.setAttribute('title', 'Already tried this vulnerability!');
      }
    }
    
    if (isCorrect) {
      // Mark vulnerability as discovered only after correct answer
      this.vulnerabilityManager.markDiscovered(this.currentVulnerability.id);
      this.discoveredCount++;
      
      // Show correct feedback
      this.feedbackManager.showCorrectFeedback(this.currentVulnerability.question.explanation);
      
      // Award 1 point for correct answer and submit immediately
      this.scoringManager.submitCorrectAnswer();
      this.updateScoreDisplay();
      
      // Save progress after score change
      this.saveProgress();
    } else {
      // Mark vulnerability as discovered even for wrong answer (one chance only)
      this.vulnerabilityManager.markDiscovered(this.currentVulnerability.id);
      this.discoveredCount++;
      
      // Decrement score for incorrect answer
      this.scoringManager.decrementScore();
      this.updateScoreDisplay();
      
      // Save progress after score change
      this.saveProgress();
      
      // Show incorrect feedback
      this.feedbackManager.showIncorrectFeedback(this.currentVulnerability.question.explanation);
    }
  }
  
  /**
   * Apply visual fixes to the vulnerable area when answered correctly
   * @param {string} vulnerabilityId - ID of the vulnerability to fix
   * @private
   */
  applyVisualFix(vulnerabilityId) {
    console.log(`Challenge2Controller: Applying visual fix for ${vulnerabilityId}`);
    
    switch(vulnerabilityId) {
      case 'sql-injection':
        // Remove SQL injection code from search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.value = 'Search for gadgets...';
          searchInput.style.color = '#333';
        }
        break;
        
      case 'xss':
        // Remove XSS script from review
        const xssReview = document.querySelector('[data-vulnerable="xss"] .review-text');
        if (xssReview) {
          xssReview.textContent = 'Great products! Fast shipping and excellent quality.';
          xssReview.style.color = '#333';
        }
        break;
        
      case 'exposed-api':
        // Hide exposed API key
        const apiKey = document.querySelector('.footer-debug-text');
        if (apiKey) {
          apiKey.textContent = 'API_KEY=***hidden***';
          apiKey.style.color = '#28a745';
        }
        break;
        
      case 'insecure-http':
        // Change HTTP to HTTPS and lock the padlock
        const urlBar = document.getElementById('url-bar');
        const urlLock = document.querySelector('.url-lock');
        const urlNotSecure = document.querySelector('.url-not-secure');
        const urlText = document.querySelector('.url-text');
        
        if (urlLock) {
          urlLock.classList.remove('url-lock-broken');
          urlLock.innerHTML = '<i class="fas fa-lock"></i>';
          urlLock.style.color = '#28a745';
        }
        if (urlNotSecure) {
          urlNotSecure.textContent = 'Secure';
          urlNotSecure.style.color = '#28a745';
        }
        if (urlText) {
          urlText.textContent = 'https://wackyhacky-gadgets.com';
        }
        if (urlBar) {
          urlBar.style.backgroundColor = '#d4edda';
        }
        break;
        
      case 'weak-auth':
        // Change password to strong password and update strength indicator
        const passwordInput = document.querySelector('[data-vulnerable="weak-auth"] .login-input[type="password"]');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (passwordInput) {
          passwordInput.value = '••••••••••••';
        }
        if (strengthBar) {
          strengthBar.className = 'strength-bar strength-strong';
          strengthBar.style.width = '100%';
          strengthBar.style.backgroundColor = '#28a745';
        }
        if (strengthText) {
          strengthText.textContent = 'Strong';
          strengthText.style.color = '#28a745';
        }
        break;
    }
  }
  
  /**
   * Handle feedback acknowledgment
   * Returns to scanning or shows completion if all vulnerabilities discovered
   */
  handleFeedbackAcknowledgment() {
    console.log(`Challenge2Controller: Feedback acknowledged`);
    
    // Check if all vulnerabilities have been discovered
    if (this.discoveredCount >= 5) {
      // All vulnerabilities discovered - transition to complete state
      this.transitionToComplete();
    } else {
      // Show the website again
      this.fakeSiteWrapper.style.display = 'block';
      
      // Return to scanning state
      this.transitionToScanning();
    }
  }
  
  /**
   * Transition to complete state
   */
  transitionToComplete() {
    console.log(`Challenge2Controller: Transitioning to complete state`);
    this.currentState = 'complete';
    
    // Show challenge completion screen
    this.showChallengeCompletion();
  }
  
  /**
   * Create score display element in the UI
   * @private
   */
  createScoreDisplay() {
    // Score display removed - not needed
  }
  
  /**
   * Update the score display with current score
   * @private
   */
  updateScoreDisplay() {
    // Score display removed - not needed
  }
  
  /**
   * Show challenge completion screen
   * Requirements: 7.4, 7.5
   * @private
   */
  showChallengeCompletion() {
    console.log('Challenge2Controller: Showing challenge completion');
    
    // Hide the fake site
    this.fakeSiteWrapper.style.display = 'none';
    
    // Display final score immediately
    const completionContainer = document.createElement('div');
    completionContainer.className = 'challenge-completion';
    completionContainer.innerHTML = `
      <div class="completion-card">
        <h2><i class="fas fa-trophy"></i> Challenge Complete!</h2>
        <div class="final-score">
          <div class="score-label">Final Score</div>
          <div class="score-value-large">${this.scoringManager.getScore()}</div>
          <div class="score-max">out of 5 points</div>
        </div>
        <div class="completion-message">
          ${this.scoringManager.getWrongAnswerCount() === 0 
            ? '<i class="fas fa-star"></i> Perfect! You got all answers correct!' 
            : `You discovered all 5 vulnerabilities and learned about web security!`}
        </div>
        <div id="score-submission-status" class="mt-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Submitting score...</span>
          </div>
          <span class="ms-2 text-muted">Submitting score...</span>
        </div>
        <a href="/challenge3" class="btn btn-next fw-bold btn-lg px-4 py-2 mt-4" id="next-challenge-btn">
          <i class="fas fa-arrow-right me-2"></i>Next Challenge
        </a>
      </div>
    `;
    
    this.scannerSection.appendChild(completionContainer);
    
    // Mark challenge as complete and clear progress
    this.markChallengeComplete('challenge2');
    this.clearProgress();
    
    // Score already submitted after each correct answer, just show success message
    const statusElement = document.getElementById('score-submission-status');
    if (statusElement) {
      statusElement.innerHTML = `
        <i class="fas fa-check-circle text-success"></i>
        <span class="ms-2 text-success">All scores submitted!</span>
      `;
    }
  }
  
  /**
   * Mark challenge as complete on the server
   * @param {string} challengeId - The challenge ID
   * @private
   */
  async markChallengeComplete(challengeId) {
    try {
      const response = await fetch('/api/mark_challenge_complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId })
      });
      const data = await response.json();
      console.log('Challenge2Controller: Challenge marked complete:', data);
    } catch (error) {
      console.error('Challenge2Controller: Error marking challenge complete:', error);
    }
  }
  
  /**
   * Get current state
   * @returns {string} Current state name
   */
  getCurrentState() {
    return this.currentState;
  }
  
  /**
   * Get discovered count
   * @returns {number} Number of discovered vulnerabilities
   */
  getDiscoveredCount() {
    return this.discoveredCount;
  }
  
  /**
   * Get current score
   * @returns {number} Current score
   */
  getCurrentScore() {
    return this.scoringManager.getScore();
  }
  
  /**
   * Reset the challenge (for testing)
   */
  reset() {
    console.log('Challenge2Controller: Resetting challenge');
    
    // Reset state
    this.currentState = 'initial';
    this.discoveredCount = 0;
    this.currentVulnerability = null;
    
    // Reset managers
    this.vulnerabilityManager.resetAll();
    this.scoringManager.reset();
    
    // Reset scanner
    if (this.scannerManager) {
      this.scannerManager.resetClickedVulnerabilities();
    }
    
    // Update score display
    this.updateScoreDisplay();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Challenge2Controller;
}
