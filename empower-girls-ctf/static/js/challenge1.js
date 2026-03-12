// challenge1.js – Spot the Phish Challenge (Empower Girls CTF)

// Initialize utility managers
const scoreManager = new ScoreManager('challenge1');
const progressManager = new ProgressManager('challenge1');

let currentEmailIndex = 0;
const emailCards = document.querySelectorAll('.email-card');
const phishBtn = document.querySelector('.btn-phish');
const safeBtn = document.querySelector('.btn-safe');
const nextEmailBar = document.getElementById('next-email-container');
const nextChallengeBar = document.getElementById('next-challenge-container');

let correctAnswers = 0;
let totalAnswers = 0;

// ============================================================================
// STATE PERSISTENCE - Save/Load Progress
// ============================================================================

function loadProgress() {
  const progress = progressManager.loadProgress();
  if (progress) {
    try {
      currentEmailIndex = progress.currentEmailIndex || 0;
      correctAnswers = progress.correctAnswers || 0;
      totalAnswers = progress.totalAnswers || 0;
      
      console.log('Loaded progress:', progress);
      
      // Check if intro was completed
      const introCompleted = localStorage.getItem('challenge1_introCompleted');
      if (introCompleted === 'true') {
        // Skip intro and show challenge
        const introCard = document.getElementById('intro-card');
        const challengeContent = document.querySelector('.challenge1-content');
        if (introCard && challengeContent) {
          introCard.classList.add('d-none');
          challengeContent.classList.remove('d-none');
          
          // Show the current email
          emailCards.forEach((card, idx) => {
            if (idx === currentEmailIndex) {
              card.classList.remove('d-none');
            } else {
              card.classList.add('d-none');
            }
          });
        }
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  }
}

function saveProgress() {
  const progress = {
    currentEmailIndex: currentEmailIndex,
    correctAnswers: correctAnswers,
    totalAnswers: totalAnswers,
    timestamp: new Date().toISOString()
  };
  progressManager.saveProgress(progress);
  console.log('Saved progress:', progress);
}

function clearProgress() {
  progressManager.clearProgress();
  localStorage.removeItem('challenge1_introCompleted');
  console.log('Progress cleared');
}

// Helper function to mark challenge as complete
async function markChallengeComplete(challengeId) {
  try {
    const response = await fetch('/api/mark_challenge_complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: challengeId })
    });
    const data = await response.json();
    console.log('Challenge marked complete:', data);
  } catch (error) {
    console.error('Error marking challenge complete:', error);
  }
}

function getCurrentCard() {
  const idx = currentEmailIndex + 1;
  return {
    card: document.getElementById(`email${idx}-card`),
    explanation: document.getElementById(`email${idx}-explanation`),
    result: document.getElementById(`email${idx}-result`)
  };
}

window.checkEmail = async function(firstArg, secondArg) {
  const userChoice = secondArg ?? firstArg;
  const { card, explanation, result } = getCurrentCard();
  if (!card) return;

  const correct = card.getAttribute('data-correct');
  explanation.classList.remove('d-none');
  
  totalAnswers++;
  
  // Save progress after answering
  saveProgress();
  
  let pointsEarned = 0;
  
  if (userChoice === correct) {
    result.textContent = 'Correct!';
    result.classList.remove('text-danger');
    result.classList.add('text-success');
    triggerConfettiOnSuccess(true);
    correctAnswers++; // Increment correct answers count
    
    // Award 1 point for correct answer
    pointsEarned = 1;
    console.log('Challenge1: Correct answer - awarding 1 point');
  } else {
    result.textContent = 'Incorrect!';
    result.classList.remove('text-success');
    result.classList.add('text-danger');
    
    // No points for incorrect answer
    pointsEarned = 0;
    console.log('Challenge1: Incorrect answer - no points awarded');
  }

  // Submit score immediately after each answer
  try {
    const result = await scoreManager.submitScore(pointsEarned, 1);
    console.log(`Challenge1: Submitted ${pointsEarned} point(s) for email ${currentEmailIndex + 1}`, result);
    
    // Force update the score display element
    const scoreElement = document.getElementById('team-score-display');
    if (scoreElement && result && result.new_score !== undefined) {
      scoreElement.textContent = result.new_score;
      console.log(`Challenge1: Force updated score display to ${result.new_score}`);
    }
  } catch (error) {
    console.error('Challenge1: Error submitting score:', error);
  }

  phishBtn.style.display = safeBtn.style.display = 'none';
  phishBtn.disabled = safeBtn.disabled = true;

  if (currentEmailIndex + 1 === emailCards.length) {
    // All emails completed
    console.log(`Challenge1: All emails completed - Correct: ${correctAnswers}/${totalAnswers}`);
    
    // Mark challenge as complete
    markChallengeComplete('challenge1');
    
    // Clear progress since challenge is complete
    clearProgress();
    
    // Update points earned in modal (show total correct answers)
    const pointsEarnedElement = document.getElementById('challenge1-points-earned');
    if (pointsEarnedElement) {
      pointsEarnedElement.textContent = correctAnswers;
    }
    
    // Show success modal
    const successModal = new bootstrap.Modal(document.getElementById('challenge1-success-modal'));
    successModal.show();
  } else {
    nextEmailBar.style.display = 'block';
  }
};

window.showNextEmail = function() {
  emailCards[currentEmailIndex].classList.add('d-none');
  currentEmailIndex++;
  
  // Save progress after moving to next email
  saveProgress();

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
  
  // Load saved progress first
  loadProgress();

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
      // Mark intro as completed
      localStorage.setItem('challenge1_introCompleted', 'true');
      
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
      
      // Scroll to top when challenge starts
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
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
