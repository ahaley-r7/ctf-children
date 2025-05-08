// script.js – Common helpers shared by every Empower Girls CTF page (Rapid7)
// This file now contains only reusable utilities. Page‑specific logic has
// moved into challenge1.js … challenge4.js.

/* -------------------------------------------------------------
   1.  Visual feedback for challenge completion
   ------------------------------------------------------------- */
function getRandomColor () {
    const palette = ['#f44336', '#ffeb3b', '#4caf50', '#2196f3', '#ff9800', '#e91e63'];
    return palette[Math.floor(Math.random() * palette.length)];
}

// Wrapper that challenge scripts can call once a task is completed.
function triggerConfettiOnSuccess(flag) {
    if (flag) {
        // Trigger confetti at the center of the screen
        party.confetti(document.body, {
            count: party.variation.range(50, 100), // Number of particles
            spread: 70,                           // Spread angle
            size: party.variation.range(0.8, 1.5) // Particle size
        });
    }
}

/* -------------------------------------------------------------
   2.  Score API & navigation helpers
   ------------------------------------------------------------- */
function submitScore (points) {
    fetch('/api/submit_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Score updated:', data.new_score);
            } else {
                console.error('Score update failed:', data.message);
            }
        })
        .catch(err => console.error('Error submitting score:', err));
}

// Add this line after defining submitScore:
window.submitScore = submitScore;

function showNextButton () {
    const next = document.getElementById('next-challenge-container');
    if (next) next.style.display = 'block';
}

/* -------------------------------------------------------------
   3.  Fun team‑name generator (Register page)
   ------------------------------------------------------------- */
function generateName () {
    const adjectives = [
        'Cyber', 'Pixel', 'Wired', 'Quantum', 'Sneaky', 'Glowing', 'Encrypted',
        'Solar', 'Electric', 'Rainbow', 'Cosmic', 'Ninja', 'Zappy', 'Crypto', 'Hacky'
    ];
    const nouns = [
        'Unicorns', 'Guardians', 'Firewalls', 'Bots', 'Ninjas', 'Sparkles', 'Scanners',
        'Crackers', 'Protectors', 'Detectives', 'Ciphers', 'Panthers', 'Pandas', 'Shields'
    ];
    const emoji = ['🦄', '💻', '🔐', '⚡', '🌈', '🛡️', '👾', '🚀'];

    document.getElementById('team_name').value =
        `${randomItem(adjectives)} ${randomItem(nouns)} ${randomItem(emoji)}`;
}

function randomItem (list) {
    return list[Math.floor(Math.random() * list.length)];
}

/* -------------------------------------------------------------
   4.  Tooltip refresh helper
   ------------------------------------------------------------- */
function refreshTooltips() {
    // Reinitialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}
function positionArrow(arrowId, targetSelector, offsetX = 0, offsetY = 0) {
  const arrow = document.getElementById(arrowId);
  const target = document.querySelector(targetSelector);
  if (arrow && target) {
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    arrow.style.top = (rect.top + scrollTop + offsetY) + "px";
    arrow.style.left = (rect.left + scrollLeft + offsetX) + "px";
  }
}
/* -------------------------------------------------------------
    5.  Tippy.js tooltip initialization
    ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    tippy('.tooltip-link', {
      theme: 'empower',
      animation: 'shift-away',
      inertia: true,
      duration: [300, 250],
      arrow: true,
      placement: 'top',
    });
  });
  /* -------------------------------------------------------------
    6.  Introduction card logic
    ------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const introCard        = document.querySelector('#intro-card');
    const challengeContent = document.querySelector('.challenge-content');
    const startBtn         = document.querySelector('#start-btn');
    
    /* ---  FORCE-HIDE GAME ON PAGE-LOAD  --- */
    if (introCard && challengeContent) {
        challengeContent.classList.add('d-none');   // <-- GUARANTEED hide
    }
    
    /* ---  SHOW GAME WHEN BUTTON CLICKED  --- */
    if (startBtn && introCard && challengeContent) {
        startBtn.addEventListener('click', () => {
        introCard.classList.add('d-none');
        challengeContent.classList.remove('d-none');   // show
        challengeContent.classList.add('fade-in');     // smooth animation (optional)
        });
    }
    });


