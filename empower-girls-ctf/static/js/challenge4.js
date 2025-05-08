// challenge4.js – Password Challenge logic for Empower Girls CTF

(() => {
  let attempts = 0;
  const correctPassword = 'bubbleMilo2013!';
  let errorMessageTimer = null;

  const passwordInput = document.getElementById('passwordInput');
  const feedback = document.getElementById('feedback');
  const attemptsCounter = document.getElementById('attempts-counter');
  const attemptsCirclesEl = document.getElementById('attempts-circles');

  // Initialize the counter with circles
  updateAttemptsCircles();

  if (!passwordInput || !feedback) return; // Not on this page
  
  // Clear any initial content in the feedback area
  feedback.innerHTML = '';

  // Add this function to toggle password visibility
  function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
  }

  // Make the function accessible globally
  window.togglePassword = togglePassword;

  window.finishAndViewScoreboard = function() {
    fetch('/finish', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(() => {
      window.location.href = '/scoreboard';
    })
    .catch(err => {
      console.error('Error completing challenge:', err);
      window.location.href = '/scoreboard';
    });
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

  window.checkPassword = function (event) {
    event.preventDefault();
    attempts++;

    // Update attempts display with circles
    updateAttemptsCircles();

    const input = passwordInput.value.trim();
    const success = input === correctPassword;

    if (success) {
      const score = Math.max(5 - (attempts - 1), 0); // Calculate points based on remaining attempts
      window.submitScore(score);

      // Hide attempts counter
      if (attemptsCirclesEl) {
        attemptsCirclesEl.parentElement.style.display = 'none';
      }

      // Update success message with points scored
      feedback.innerHTML = `
        <div class="d-flex flex-column align-items-center">
          <span class="text-success fw-bold mb-2">✅ Correct! You scored ${score} point${score !== 1 ? 's' : ''}.</span>
          <button onclick="finishAndViewScoreboard()" class="btn btn-warning fw-bold mt-2">
            View Results
          </button>
        </div>
      `;

      triggerConfettiOnSuccess(true);
    } else {
      if (attempts >= 5) {
        // Hide attempts counter
        if (attemptsCirclesEl) {
          attemptsCirclesEl.parentElement.style.display = 'none';
        }

        // Initial message with countdown
        feedback.innerHTML = `
          <div class="d-flex flex-column align-items-center">
            <span class="text-danger fw-bold mb-2">❌ Oops! You're out of attempts!</span>
            <span class="text-info">Revealing password in <span id="countdown">3</span>...</span>
          </div>
        `;
        
        // Countdown animation
        let count = 3;
        const countdownEl = document.getElementById('countdown');
        
        const countdownTimer = setInterval(() => {
          count--;
          if (countdownEl) countdownEl.textContent = count;
          
          if (count <= 0) {
            clearInterval(countdownTimer);

            // Submit a score of 0 for unsuccessful completion
            window.submitScore(0);
            
            // Find and dramatically highlight the hidden password
            const hiddenPasswordElement = document.querySelector('span[style*="color: white"]');

            if (hiddenPasswordElement) {
              // Add tooltip to the password element
              addPasswordTooltip(hiddenPasswordElement, '🔍 This password was hiding in plain sight the whole time!');

              // First show message to prepare user
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
                    fetch('/finish', { 
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    })
                    .then(() => window.location.href = '/scoreboard')
                    .catch(() => window.location.href = '/scoreboard');
                  }, 10000);  // Increased from 4000 to 9000 (5 more seconds)
                }, 1000);
              }, 3000);
            }
          }
        }, 1000);
      } else {
        feedback.style.color = 'red';
        feedback.textContent = '❌ Oops! Try again.';

        errorMessageTimer = setTimeout(() => {
          feedback.textContent = '';
          errorMessageTimer = null;
        }, 4000);
      }
    }
  }

})();
