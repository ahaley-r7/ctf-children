// challenge4.js – Password Challenge logic for Empower Girls CTF

// Initialize utility managers
const scoreManager = new ScoreManager('challenge4');
const progressManager = new ProgressManager('challenge4');

(() => {
  let attempts = 0;
  const correctPassword = 'bubbleMilo2013!';
  let errorMessageTimer = null;

  const passwordInput = document.getElementById('passwordInput');
  const feedback = document.getElementById('feedback');
  const attemptsCounter = document.getElementById('attempts-counter');
  const attemptsCirclesEl = document.getElementById('attempts-circles');

  // ============================================================================
  // STATE PERSISTENCE - Save/Load Progress
  // ============================================================================

  function loadProgress() {
    const progress = progressManager.loadProgress();
    if (progress) {
      try {
        attempts = progress.attempts || 0;
        console.log('Challenge4: Loaded progress:', progress);
        
        // Update attempts display
        updateAttemptsCircles();
        
        // Check if intro was completed
        const introCompleted = localStorage.getItem('challenge4_introCompleted');
        if (introCompleted === 'true') {
          // Skip intro and show challenge
          const introCard = document.getElementById('intro-card');
          const challengeContent = document.querySelector('.challenge-content');
          if (introCard && challengeContent) {
            introCard.classList.add('d-none');
            challengeContent.classList.remove('d-none');
          }
        }
      } catch (e) {
        console.error('Challenge4: Error loading progress:', e);
      }
    }
  }

  function saveProgress() {
    const progress = {
      attempts: attempts,
      timestamp: new Date().toISOString()
    };
    progressManager.saveProgress(progress);
    console.log('Challenge4: Saved progress:', progress);
  }

  function clearProgress() {
    progressManager.clearProgress();
    localStorage.removeItem('challenge4_introCompleted');
    console.log('Challenge4: Progress cleared');
  }

  async function markChallengeComplete(challengeId) {
    try {
      const response = await fetch('/api/mark_challenge_complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId })
      });
      const data = await response.json();
      console.log('Challenge4: Challenge marked complete:', data);
    } catch (error) {
      console.error('Challenge4: Error marking challenge complete:', error);
    }
  }

  // Load saved progress on page load
  loadProgress();

  // Initialize the counter with circles
  updateAttemptsCircles();

  if (!passwordInput || !feedback) return; // Not on this page
  
  // Clear any initial content in the feedback area
  feedback.innerHTML = '';

  // Set up intro skip on page load
  document.addEventListener('DOMContentLoaded', function() {
    const introCompleted = localStorage.getItem('challenge4_introCompleted');
    if (introCompleted === 'true') {
      const introCard = document.getElementById('intro-card');
      const challengeContent = document.querySelector('.challenge-content');
      if (introCard && challengeContent) {
        introCard.classList.add('d-none');
        challengeContent.classList.remove('d-none');
        // Scroll to top when challenge starts
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // Set up start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', async function() {
        // Disable button and show loading state
        startBtn.disabled = true;
        const originalText = startBtn.innerHTML;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        
        try {
          // Preload images from challenge content
          const challengeContent = document.querySelector('.challenge-content');
          if (challengeContent && window.imagePreloader) {
            await window.imagePreloader.preloadFromContainer(challengeContent);
            const stats = window.imagePreloader.getStats();
            console.log(`Preloaded ${stats.loaded} images, ${stats.failed} failed`);
          }
        } catch (error) {
          console.error('Error preloading images:', error);
        }
        
        localStorage.setItem('challenge4_introCompleted', 'true');
        const introCard = document.getElementById('intro-card');
        if (introCard) {
          introCard.classList.add('d-none');
        }
        if (challengeContent) {
          challengeContent.classList.remove('d-none');
        }
        // Scroll to top when challenge starts
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });

  // Add this function to toggle password visibility
  function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
  }

  // Make the function accessible globally
  window.togglePassword = togglePassword;

  // Function to go to next challenge
  window.goToNextChallenge = function() {
    window.location.href = '/challenge5';
  };

  // Add this function to update the attempts display
  function updateAttemptsCircles() {
    if (attemptsCirclesEl) {
      let html = '';
      const maxAttempts = 5;
      const usedAttempts = attempts;
      const remainingAttempts = maxAttempts - usedAttempts;
      
      for (let i = 0; i < maxAttempts; i++) {
        html += `<span class="attempt-circle${i >= remainingAttempts ? ' used' : ''}"></span>`;
      }
      attemptsCirclesEl.innerHTML = html;
    }
  }

  // Add this function to show a tooltip on the password element
  function addPasswordTooltip(element, message) {
    if (element) {
      // Use Tippy.js for the tooltip
      tippy(element, {
        content: message,
        allowHTML: true,
        theme: 'light-border',
        animation: 'shift-away',
        placement: 'top',
        trigger: 'mouseenter focus', // Show on hover or focus
        interactive: true,
        appendTo: document.body,
        maxWidth: 250,
      });

      // Optionally, highlight the element to draw attention
      element.style.boxShadow = '0 0 10px rgba(255, 106, 0, 0.8)';
      element.style.border = '2px solid #FF6A00';
      element.style.borderRadius = '6px';
    }
  }

  window.checkPassword = async function (event) {
    event.preventDefault();
    attempts++;

    // Save progress after each attempt
    saveProgress();

    // Update attempts display with circles
    updateAttemptsCircles();

    const input = passwordInput.value.trim();
    const success = input === correctPassword;

    if (success) {
      const score = Math.max(5 - (attempts - 1), 0); // Calculate points based on remaining attempts
      await scoreManager.submitScore(score);

      // Mark challenge as complete and clear progress
      markChallengeComplete('challenge4');
      clearProgress();

      // Hide attempts counter
      if (attemptsCirclesEl) {
        attemptsCirclesEl.parentElement.style.display = 'none';
      }

      // Update success message with points scored
      feedback.style.display = 'block';
      feedback.innerHTML = `
        <div class="d-flex flex-column align-items-center">
          <span class="text-success fw-bold mb-2">Correct! You scored ${score} point${score !== 1 ? 's' : ''}.</span>
          <button onclick="goToNextChallenge()" class="btn btn-warning fw-bold mt-2">
            Next Challenge →
          </button>
        </div>
      `;

      triggerConfettiOnSuccess(true);
    } else {
      // Add shake animation to form
      const loginForm = document.querySelector('.login-form');
      if (loginForm) {
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
      }

      // Add error pulse to password field
      passwordInput.classList.add('error-pulse');
      setTimeout(() => passwordInput.classList.remove('error-pulse'), 500);

      // Clear the password field
      passwordInput.value = '';
      passwordInput.focus();

      if (attempts >= 5) {
        // Mark challenge as complete (with 0 score) and clear progress
        markChallengeComplete('challenge4');
        clearProgress();

        // Hide attempts counter
        if (attemptsCirclesEl) {
          attemptsCirclesEl.parentElement.style.display = 'none';
        }

        // Initial message with countdown
        feedback.style.display = 'block';
        feedback.innerHTML = `
          <div class="d-flex flex-column align-items-center">
            <span class="text-danger fw-bold mb-2">Oops! You're out of attempts!</span>
            <span class="text-info">Revealing password in <span id="countdown">3</span>...</span>
          </div>
        `;
        
        // Countdown animation
        let count = 3;
        const countdownEl = document.getElementById('countdown');
        
        const countdownTimer = setInterval(async () => {
          count--;
          if (countdownEl) countdownEl.textContent = count;
          
          if (count <= 0) {
            clearInterval(countdownTimer);

            // Submit a score of 0 for unsuccessful completion
            await scoreManager.submitScore(0);
            
            // Find and dramatically highlight the hidden password
            const hiddenPasswordElement = document.querySelector('span[style*="color: white"]');

            if (hiddenPasswordElement) {
              // Add tooltip to the password element
              addPasswordTooltip(hiddenPasswordElement, '<i class="fas fa-search"></i> This password was hiding in plain sight the whole time!');

              // First show message to prepare user
              feedback.style.display = 'block';
              feedback.innerHTML = `
                <div class="d-flex flex-column align-items-center">
                  <span class="text-danger fw-bold mb-2">The password was hidden in plain sight!</span>
                  <span class="text-info mb-3">Scrolling to reveal it in 3 seconds...</span>
                </div>
              `;
              
              // Wait 3 seconds before scrolling
              setTimeout(() => {
                // Create a floating notification that stays visible during scroll
                const floatingMessage = document.createElement('div');
                floatingMessage.innerHTML = `<div class="p-3 bg-dark text-white rounded shadow-lg">Password found: <strong>${correctPassword}</strong></div>`;
                floatingMessage.style.position = 'fixed';
                floatingMessage.style.bottom = '20px';
                floatingMessage.style.right = '20px';
                floatingMessage.style.zIndex = '9999';
                floatingMessage.style.opacity = '0';
                floatingMessage.style.transition = 'opacity 0.5s';
                document.body.appendChild(floatingMessage);
                
                // Scroll to password element
                hiddenPasswordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // After scrolling completes, show floating message and highlight password
                setTimeout(() => {
                  floatingMessage.style.opacity = '1';
                  
                  // Create dramatic highlight effect
                  hiddenPasswordElement.style.color = '#FF6A00'; 
                  hiddenPasswordElement.style.backgroundColor = '#fff8f0';
                  hiddenPasswordElement.style.padding = '5px 12px';
                  hiddenPasswordElement.style.borderRadius = '6px';
                  hiddenPasswordElement.style.fontWeight = 'bold';
                  hiddenPasswordElement.style.fontSize = '1.1em';
                  hiddenPasswordElement.style.boxShadow = '0 0 10px rgba(255, 106, 0, 0.5)';
                  hiddenPasswordElement.style.transition = 'all 0.8s';
                  
                  // Pulse animation
                  setTimeout(() => {
                    hiddenPasswordElement.style.transform = 'scale(1.1)';
                    setTimeout(() => { 
                      hiddenPasswordElement.style.transform = 'scale(1)';
                    }, 300);
                  }, 300);
                  
                  // Set timeout to redirect after longer viewing time
                  setTimeout(() => {
                    document.body.removeChild(floatingMessage);
                    // Redirect to Challenge 5 instead of finish
                    window.location.href = '/challenge5';
                  }, 10000);  // Increased from 4000 to 9000 (5 more seconds)
                }, 1000);
              }, 3000);
            }
          }
        }, 1000);
      } else {
        feedback.style.display = 'block';
        feedback.style.color = 'red';
        feedback.textContent = 'Oops! Try again.';

        errorMessageTimer = setTimeout(() => {
          feedback.textContent = '';
          errorMessageTimer = null;
        }, 4000);
      }
    }
  }

})();
