// challenge3.js – Caesar-Shift Encryption Challenge (Empower Girls CTF)
// Using the existing HTML elements

document.addEventListener('DOMContentLoaded', function() {
  // Get existing elements from DOM
  const challengeContent = document.querySelector('.challenge3-content');
  const scrambledTextEl = document.getElementById('scrambled-text');
  const shiftButtons = document.querySelectorAll('.shift-btn');
  const resultMessage = document.getElementById('result-message');
  const decodedTextEl = document.getElementById('decoded-text');
  const pointsDisplay = document.getElementById('points-display-container');
  const pointsEarned = document.getElementById('points-earned');
  const nextChallengeContainer = document.getElementById('next-challenge-container');
  
  console.log('Initializing Caesar cipher challenge...');
  
  // Basic Caesar cipher implementation with separate encode/decode functions
  const phrases = [
    { phrase: 'HELLO THERE', shift: 3 },
    { phrase: 'HACK THE PLANET', shift: 5 },
    { phrase: 'SECRET CODE', shift: 7 },
    { phrase: 'STAY SAFE', shift: 1 },
    { phrase: 'RAPID SEVEN', shift: 13 }
  ];
  
  // Choose a random phrase
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  const originalPhrase = randomPhrase.phrase;
  const shift = randomPhrase.shift;
  
  // Caesar cipher encoding function
  const caesarEncode = (text, shift) => {
    return text.split('').map(char => {
      if (char === ' ') return ' ';
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      return char;
    }).join('');
  };

  // Caesar cipher decoding function
  const caesarDecode = (text, shift) => {
    // For decoding, we need to apply the inverse shift
    return caesarEncode(text, 26 - (shift % 26));
  };

  // Updated animateLetters function with sequential animation
  function animateLetters(element, text) {
    // Clear previous content
    element.innerHTML = '';
    
    // Animation duration for each letter
    const duration = 0.15; // seconds per letter
    
    // Create letter elements with animation for each character
    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'letter';
      
      // Set animation properties - each letter waits for previous to finish
      span.style.animation = `spinIn ${duration}s ease forwards`;
      span.style.animationDelay = `${index * duration}s`; // Wait for previous letters
      span.style.opacity = '0'; // Start invisible
      span.style.display = 'inline-block'; // Ensure proper animation
      
      element.appendChild(span);
    });
  }

  // Add the animation keyframes directly to the document
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes spinIn {
      0% { 
        transform: rotateY(180deg); 
        opacity: 0;
      }
      100% { 
        transform: rotateY(0deg);
        opacity: 1;
      }
    }
    
    .letter {
      display: inline-block;
      transform-style: preserve-3d;
      perspective: 500px;
    }
  `;
  document.head.appendChild(styleElement);

  // Create encoded text
  const encodedText = caesarEncode(originalPhrase, shift);
  console.log(`Original: "${originalPhrase}", Encoded: "${encodedText}" with shift ${shift}`);

  // Set the scrambled text
  animateLetters(scrambledTextEl, encodedText);

  // The correct decode shift is the same as the encoding shift
  // Users need to figure out what number to use to reverse the process
  const correctDecodeShift = shift;
  console.log(`Correct decoding shift: ${correctDecodeShift}`);
  
  // Generate possible shift values (including the correct one)
  const possibleShifts = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25];
  
  // Ensure correct answer is included
  let shiftOptions = [correctDecodeShift];
  while (shiftOptions.length < 5) {
    const randomShift = possibleShifts[Math.floor(Math.random() * possibleShifts.length)];
    if (!shiftOptions.includes(randomShift)) {
      shiftOptions.push(randomShift);
    }
  }
  
  // Shuffle the options
  shiftOptions = shiftOptions.sort(() => 0.5 - Math.random());
  
  // Update shift buttons with our values - remove all hover functionality
  shiftButtons.forEach((btn, index) => {
    if (index < shiftOptions.length) {
      const shiftVal = shiftOptions[index];
      btn.textContent = shiftVal;
      btn.dataset.shift = shiftVal;
      
      // Remove all mouseover/mouseout event listeners
      // No hover preview functionality
    }
  });
  
  // Handle button clicks
  let attempts = 0;
  const maxAttempts = 5;

  // Update button click handler to show decoded text with animation
  shiftButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const selectedShift = parseInt(this.dataset.shift);
      attempts++;
      
      // Disable this button immediately and style it as used
      this.disabled = true;
      this.classList.remove('btn-outline-success');
      this.classList.add('btn-secondary');
      this.style.opacity = '0.6';
      
      // Show the decoded text for this shift value in the preview area WITH ANIMATION
      const decodedText = caesarDecode(encodedText, selectedShift);
      animateLetters(decodedTextEl, decodedText);
      
      setTimeout(() => {
        if (selectedShift === correctDecodeShift) {
          // Correct answer - this is a match!
          const points = Math.max(5 - (attempts - 1), 0);
          resultMessage.innerHTML = `<span class="text-success">✅ Correct! The original message was "${originalPhrase}".</span>`;
          
          // Show points earned
          pointsEarned.textContent = points;
          pointsDisplay.classList.remove('d-none');
          
          // Disable all buttons
          shiftButtons.forEach(b => b.disabled = true);
          
          // Show decoded text
          scrambledTextEl.textContent = originalPhrase;
          scrambledTextEl.classList.add('text-success');
          
          // Submit score
          window.submitScore(points);
          
          // Show next challenge button
          nextChallengeContainer.classList.remove('d-none');
        } else if (attempts >= maxAttempts) {
          // Out of attempts
          resultMessage.innerHTML = `<span class="text-danger">🔒 No more attempts! The correct answer was: "${originalPhrase}"</span>`;
          
          // Disable all buttons
          shiftButtons.forEach(b => b.disabled = true);
          
          // Show decoded text
          scrambledTextEl.textContent = originalPhrase;
          scrambledTextEl.classList.add('text-danger');
          
          // Show next challenge button
          nextChallengeContainer.classList.remove('d-none');
        } else {
          // Wrong answer, still have attempts
          resultMessage.innerHTML = `<span class="text-danger">❌ Oops! Try again. ${maxAttempts - attempts} attempts remaining.</span>`;
        }
      }, 800); // Short delay for decoding animation
    });
  });
});
