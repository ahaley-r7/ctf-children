// challenge1.js – Spot the Phish Challenge (Empower Girls CTF)

let currentEmailIndex = 0;
const emailCards = document.querySelectorAll('.email-card');
const phishBtn = document.querySelector('.btn-phish');
const safeBtn = document.querySelector('.btn-safe');
const nextEmailBar = document.getElementById('next-email-container');
const nextChallengeBar = document.getElementById('next-challenge-container');

let correctAnswers = 0;
let totalAnswers = 0;

function getCurrentCard() {
  const idx = currentEmailIndex + 1;
  return {
    card: document.getElementById(`email${idx}-card`),
    explanation: document.getElementById(`email${idx}-explanation`),
    result: document.getElementById(`email${idx}-result`)
  };
}

window.checkEmail = function(firstArg, secondArg) {
  const userChoice = secondArg ?? firstArg;
  const { card, explanation, result } = getCurrentCard();
  if (!card) return;

  const correct = card.getAttribute('data-correct');
  explanation.classList.remove('d-none');
  
  totalAnswers++;
  
  if (userChoice === correct) {
    result.textContent = 'Correct!';
    result.classList.remove('text-danger');
    result.classList.add('text-success');
    triggerConfettiOnSuccess(true);
    correctAnswers++; // Increment correct answers count
  } else {
    result.textContent = 'Incorrect!';
    result.classList.remove('text-success');
    result.classList.add('text-danger');
  }

  phishBtn.style.display = safeBtn.style.display = 'none';
  phishBtn.disabled = safeBtn.disabled = true;

  if (currentEmailIndex + 1 === emailCards.length) {
    // Calculate and submit final score when all emails are processed
    const score = Math.round((correctAnswers / totalAnswers) * 5); // Max 5 points
    window.submitScore(score);
    
    // Display score before showing next challenge button
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'alert alert-success text-center my-4 fw-bold';
    scoreDisplay.innerHTML = `
      <h4 class="mb-3">Challenge Complete! 🎉</h4>
      <p>You identified ${correctAnswers} out of ${totalAnswers} emails correctly.</p>
      <p>Your score: <span class="fs-3">${score} ${score === 1 ? 'point' : 'points'}</span></p>
    `;
    
    // Insert score display before the next challenge container
    nextChallengeBar.parentNode.insertBefore(scoreDisplay, nextChallengeBar);
    nextChallengeBar.style.display = 'block';
  } else {
    nextEmailBar.style.display = 'block';
  }
};

window.showNextEmail = function() {
  emailCards[currentEmailIndex].classList.add('d-none');
  currentEmailIndex++;

  if (currentEmailIndex < emailCards.length) {
    const nextCard = emailCards[currentEmailIndex];
    nextCard.classList.remove('d-none');
    phishBtn.style.display = safeBtn.style.display = 'inline-block';
    phishBtn.disabled = safeBtn.disabled = false;
    nextEmailBar.style.display = 'none';
  } else {
    nextChallengeBar.style.display = 'block';
  }
};

// Activate Tippy.js tooltips on phishing links
document.addEventListener('DOMContentLoaded', function() {
  console.log("Challenge 1 script loaded");

  const allEmailCards = document.querySelectorAll('.email-card');
  allEmailCards.forEach(card => {
    card.classList.add('d-none');
  });

  if (allEmailCards.length > 0) {
    allEmailCards[0].classList.remove('d-none');
    console.log("First email card displayed");
  } else {
    console.error("No email cards found on the page!");
  }

  if (phishBtn && safeBtn) {
    phishBtn.style.display = safeBtn.style.display = 'inline-block';
    phishBtn.disabled = safeBtn.disabled = false;
  }

  if (nextEmailBar) nextEmailBar.style.display = 'none';
  if (nextChallengeBar) nextChallengeBar.style.display = 'none';

  // Add this at the end of your DOMContentLoaded event handler

  // Set up the start button functionality
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      // Hide the intro card
      const introCard = document.getElementById('intro-card');
      if (introCard) {
        introCard.classList.add('d-none');
      }
      
      // Show the challenge content
      const challengeContent = document.querySelector('.challenge-content');
      if (challengeContent) {
        challengeContent.classList.remove('d-none');
      }
      
      // Initialize tooltips for phishing links and enhance their appearance
      const tooltipLinks = document.querySelectorAll('.tooltip-link');
      tooltipLinks.forEach(link => {
        // Make links look more like traditional web links
        link.style.color = '#0d6efd';
        link.style.textDecoration = 'underline';
        link.style.cursor = 'pointer';
        link.style.fontWeight = 'bold';
        
        // Add a subtle hover effect
        link.addEventListener('mouseover', () => {
          link.style.color = '#0a58ca';
          link.style.textDecoration = 'underline';
          link.style.textShadow = '0 0 1px rgba(13, 110, 253, 0.4)';
        });
        
        link.addEventListener('mouseout', () => {
          link.style.color = '#0d6efd';
          link.style.textDecoration = 'underline';
          link.style.textShadow = 'none';
        });
        
        // Remove any existing tooltips or data-bs-* attributes that might be creating duplicates
        if (link._tippy) {
          link._tippy.destroy();
        }
        
        // Remove Bootstrap tooltip attributes if they exist
        link.removeAttribute('data-bs-toggle');
        link.removeAttribute('data-bs-placement');
        link.removeAttribute('data-bs-title');
        
        // Apply tooltip using only Tippy.js
        tippy(link, {
          content: link.getAttribute('data-tippy-content'),
          placement: 'top',
          theme: 'light-border',
          arrow: true,
          allowHTML: true
        });
      });

      console.log("Challenge started");
    });
  }
});
