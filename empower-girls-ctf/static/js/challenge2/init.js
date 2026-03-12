/**
 * Challenge 2 Initialization
 * Interactive Security Scanner Challenge
 * 
 * This file handles the initialization and startup flow for Challenge 2.
 * It manages the transition from intro card to the interactive scanner challenge.
 */

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const introCard = document.getElementById('intro-card');
  const challengeContent = document.querySelector('.challenge-content');
  const scanBtn = document.getElementById('scan-btn');
  const fakeSiteWrapper = document.getElementById('fake-site-wrapper');
  const scannerSection = document.getElementById('scanner-section');
  
  let challenge2Controller = null;

  // Initially hide fake site wrapper
  if (fakeSiteWrapper) {
    fakeSiteWrapper.classList.add('d-none');
  }

  // Check if intro was already completed or challenge was started
  const introCompleted = localStorage.getItem('challenge2_introCompleted');
  const savedProgress = localStorage.getItem('challenge2_progress');
  
  if (introCompleted === 'true' || savedProgress) {
    // Skip intro and show challenge
    if (introCard) {
      introCard.classList.add('d-none');
    }
    if (challengeContent) {
      challengeContent.classList.remove('d-none');
    }
    
    // If there's saved progress, check if challenge is complete
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        
        // If all 5 vulnerabilities discovered, show completion screen
        if (progress.discoveredCount >= 5 || 
            (progress.discoveredVulnerabilities && progress.discoveredVulnerabilities.length >= 5)) {
          // Challenge is complete, clear progress and show completion
          localStorage.removeItem('challenge2_progress');
          localStorage.removeItem('challenge2_introCompleted');
          
          // Show completion screen
          if (scanBtn) {
            scanBtn.style.display = 'none';
          }
          if (fakeSiteWrapper) {
            fakeSiteWrapper.style.display = 'none';
          }
          
          const completionContainer = document.createElement('div');
          completionContainer.className = 'challenge-completion';
          completionContainer.innerHTML = `
            <div class="completion-card">
              <h2><i class="fas fa-trophy"></i> Challenge Complete!</h2>
              <div class="final-score">
                <div class="score-label">Final Score</div>
                <div class="score-value-large">${progress.score || 5}</div>
                <div class="score-max">out of 5 points</div>
              </div>
              <div class="completion-message">
                You've already completed this challenge!
              </div>
              <a href="/challenge3" class="btn btn-primary btn-lg mt-4">Next Challenge</a>
            </div>
          `;
          
          if (scannerSection) {
            scannerSection.appendChild(completionContainer);
          }
          
          console.log('Challenge already complete, showing completion screen');
        } else {
          // Challenge in progress, restore state
          if (scanBtn) {
            scanBtn.style.display = 'none';
          }
          if (fakeSiteWrapper) {
            fakeSiteWrapper.classList.remove('d-none');
          }
          
          // Initialize Challenge2Controller with saved state (scanner element no longer needed)
          const scannerElement = document.getElementById('scanner-element');
          
          // Scanner element is now optional - controller works with cursor follower only
          if (true) {  // Always initialize, scanner element is optional
            challenge2Controller = new Challenge2Controller({
              scannerElement: scannerElement,
              fakeSiteWrapper: fakeSiteWrapper,
              scannerSection: scannerSection
            });
            
            challenge2Controller.initialize();
            console.log('Challenge2Controller initialized with saved progress');
          }
        }
      } catch (e) {
        console.error('Error parsing saved progress:', e);
        // Clear corrupted progress
        localStorage.removeItem('challenge2_progress');
      }
    }
  }

  /**
   * Handle Start button click - show challenge content
   */
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Start button clicked - initializing challenge');
      
      // Mark intro as completed
      localStorage.setItem('challenge2_introCompleted', 'true');
      
      // Hide intro card
      if (introCard) {
        introCard.classList.add('d-none');
      }
      
      // Show challenge content
      if (challengeContent) {
        challengeContent.classList.remove('d-none');
      }
      
      // Scroll to top when challenge starts
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Handle scan button click - start the interactive scanner challenge
   */
  if (scanBtn) {
    scanBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Scan button clicked - starting interactive scanner');
      
      // Hide scan button
      scanBtn.style.display = 'none';

      // Show the fake website immediately (no animation)
      fakeSiteWrapper.classList.remove('d-none');

      // Initialize Challenge2Controller (scanner element no longer needed)
      const scannerElement = document.getElementById('scanner-element');
      
      // Scanner element is now optional - controller works with cursor follower only
      if (true) {  // Always initialize, scanner element is optional
        challenge2Controller = new Challenge2Controller({
          scannerElement: scannerElement,
          fakeSiteWrapper: fakeSiteWrapper,
          scannerSection: scannerSection
        });
        
        // Initialize the challenge
        challenge2Controller.initialize();
        
        console.log('Challenge2Controller initialized successfully');
      } else {
        console.error('Scanner element not found');
      }
    });
  }
});
