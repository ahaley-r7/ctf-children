// challenge3.js – Substitution Cipher Challenge (Empower Girls CTF)
// Interactive decoder for teaching cryptography concepts

// ============================================================================
// CORE CIPHER LOGIC
// ============================================================================

/**
 * Generate a random substitution cipher mapping using Fisher-Yates shuffle
 * Ensures no letter maps to itself
 * @returns {Map<string, string>} Mapping from plain letters to cipher letters
 */
function generateSubstitutionMapping() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let shuffled;
  let hasIdentityMapping;
  
  // Retry until we get a mapping with no letter mapping to itself
  do {
    shuffled = [...alphabet];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Check if any letter maps to itself
    hasIdentityMapping = alphabet.some((letter, index) => letter === shuffled[index]);
  } while (hasIdentityMapping);
  
  // Create mapping: plain letter -> cipher letter
  const mapping = new Map();
  alphabet.forEach((letter, index) => {
    mapping.set(letter, shuffled[index]);
  });
  
  return mapping;
}

/**
 * Encrypt plain text using a substitution mapping
 * @param {string} plainText - The text to encrypt
 * @param {Map<string, string>} mapping - The substitution mapping
 * @returns {string} The encrypted cipher text
 */
function encrypt(plainText, mapping) {
  return plainText.split('').map(char => {
    const upper = char.toUpperCase();
    if (mapping.has(upper)) {
      return mapping.get(upper);
    }
    // Preserve spaces, punctuation, and other characters
    return char;
  }).join('');
}

/**
 * Decrypt cipher text using a substitution mapping
 * @param {string} cipherText - The text to decrypt
 * @param {Map<string, string>} mapping - The substitution mapping
 * @returns {string} The decrypted plain text
 */
function decrypt(cipherText, mapping) {
  // Create inverse mapping
  const inverseMapping = new Map();
  for (const [plain, cipher] of mapping.entries()) {
    inverseMapping.set(cipher, plain);
  }
  
  return cipherText.split('').map(char => {
    const upper = char.toUpperCase();
    if (inverseMapping.has(upper)) {
      return inverseMapping.get(upper);
    }
    // Preserve spaces, punctuation, and other characters
    return char;
  }).join('');
}

// ============================================================================
// PREDEFINED MESSAGES WITH THEMES
// ============================================================================

const MESSAGES = [
  {
    text: "MEET ME AT THE OLD BRIDGE AFTER SUNSET. BRING THE SMALL RED BOX AND SAY NOTHING. IF SOMEONE FOLLOWS YOU WALK PAST WITHOUT LOOKING BACK.",
    scenario: 'Secret Bridge Meeting',
    description: 'Decode this mysterious spy message about a secret meeting!',
    story: 'You found a coded note slipped under your door! It looks like instructions for a secret spy mission. Someone wants to meet you at the old bridge. Decode the message to find out what to bring and what to do if you\'re being followed!',
    iconImage: 'icon-note.png'
  },
  {
    text: "LEAVE THE KEY UNDER THE THIRD STEP BEFORE MIDNIGHT. IF THE PORCH LIGHT IS ON WAIT IN THE ALLEY UNTIL IT TURNS OFF.",
    scenario: 'Midnight Key Drop',
    description: 'Decode these secret instructions about hiding a key!',
    story: 'A secret agent left you coded instructions for a nighttime mission! You need to hide a key in a specific place, but only when it\'s safe. Decode the message to learn where to leave the key and how to know if the coast is clear!',
    iconImage: 'icon-note.png'
  },
  {
    text: "TAKE THE LONG ROAD THROUGH THE FOREST TOMORROW. STOP BY THE FALLEN TREE AND MARK THE BARK WITH A SMALL WHITE STONE.",
    scenario: 'Forest Trail Mission',
    description: 'Decode this coded message about a secret forest path!',
    story: 'Someone sent you a coded treasure hunt through the forest! You need to follow a special route and leave a secret mark. Decode the instructions to find out which path to take and what sign to leave behind!',
    iconImage: 'icon-note.png'
  },
  {
    text: "WHEN THE CHURCH BELL RINGS TWICE AT DAWN OPEN THE WINDOW AND PLACE THE BLUE CLOTH OUTSIDE. CLOSE IT QUICKLY AND STAY QUIET.",
    scenario: 'Dawn Signal Code',
    description: 'Decode these secret signal instructions!',
    story: 'You\'re part of a secret spy network! This coded message tells you how to send a signal to other agents. Decode it to learn when to give the signal and what to do. Remember, timing is everything in spy work!',
    iconImage: 'icon-note.png'
  },
  {
    text: "IF YOU SEE THE BLACK CAR PARKED NEAR THE MARKET ENTER THE SHOP BESIDE IT. ASK FOR FRESH APPLES AND WAIT BY THE DOOR.",
    scenario: 'Market Rendezvous',
    description: 'Decode this spy\'s secret meeting instructions!',
    story: 'A fellow spy sent you coded instructions for a secret meeting at the market! You need to look for a specific signal and use a code phrase. Decode the message to learn what to look for and what secret words to say!',
    iconImage: 'icon-note.png'
  }
];


// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Manages the state of the challenge
 */
class ChallengeState {
  constructor(plainText, cipherText, actualMapping) {
    this.plainText = plainText;
    this.cipherText = cipherText;
    this.actualMapping = actualMapping;
    this.userMapping = new Map(); // encrypted letter -> plain letter
    this.hintRevealedMappings = new Set(); // Track which mappings were revealed by hints
    this.hintsUsed = 0;
    this.startTime = new Date();
    this.completionTime = null;
    this.isComplete = false;
  }
  
  /**
   * Set a user mapping from encrypted letter to plain letter
   */
  setMapping(encryptedLetter, plainLetter, isHintRevealed = false) {
    this.userMapping.set(encryptedLetter.toUpperCase(), plainLetter.toUpperCase());
    if (isHintRevealed) {
      this.hintRevealedMappings.add(encryptedLetter.toUpperCase());
    }
  }
  
  /**
   * Check if a mapping was revealed by a hint
   */
  isHintRevealed(encryptedLetter) {
    return this.hintRevealedMappings.has(encryptedLetter.toUpperCase());
  }
  
  /**
   * Get the plain letter for an encrypted letter
   */
  getMapping(encryptedLetter) {
    return this.userMapping.get(encryptedLetter.toUpperCase());
  }
  
  /**
   * Clear a specific mapping
   */
  clearMapping(encryptedLetter) {
    this.userMapping.delete(encryptedLetter.toUpperCase());
    this.hintRevealedMappings.delete(encryptedLetter.toUpperCase());
  }
  
  /**
   * Clear all mappings
   */
  clearAllMappings() {
    this.userMapping.clear();
    this.hintRevealedMappings.clear();
  }
  
  /**
   * Check if a plain letter is already used in the mapping
   */
  isPlainLetterUsed(plainLetter) {
    const upper = plainLetter.toUpperCase();
    for (const [, value] of this.userMapping.entries()) {
      if (value === upper) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get the encrypted letter that maps to a plain letter
   */
  getEncryptedForPlain(plainLetter) {
    const upper = plainLetter.toUpperCase();
    for (const [key, value] of this.userMapping.entries()) {
      if (value === upper) {
        return key;
      }
    }
    return null;
  }
  
  /**
   * Get all current mappings
   */
  getAllMappings() {
    return new Map(this.userMapping);
  }
  
  /**
   * Increment hints used counter
   */
  incrementHints() {
    this.hintsUsed++;
  }
  
  /**
   * Mark challenge as complete
   */
  markComplete() {
    this.isComplete = true;
    this.completionTime = new Date();
  }
  
  /**
   * Get time elapsed in seconds
   */
  getElapsedSeconds() {
    const endTime = this.completionTime || new Date();
    return Math.floor((endTime - this.startTime) / 1000);
  }
}


// ============================================================================
// DECODER INTERFACE
// ============================================================================

/**
 * Manages the interactive decoder UI
 */
class DecoderInterface {
  constructor(cipherText, state, containerElement) {
    this.cipherText = cipherText;
    this.state = state;
    this.container = containerElement;
    this.selectedEncryptedLetter = null;
    this.onMappingChange = null; // Callback for when mapping changes
  }
  
  /**
   * Render the cipher text with clickable letters in a retro CRT monitor style
   */
  render() {
    // Get the cipher display element (already in HTML)
    const cipherDisplay = document.getElementById('cipher-display');
    if (!cipherDisplay) {
      console.error('cipher-display element not found!');
      return;
    }

    // Clear and populate cipher display
    cipherDisplay.innerHTML = '';

    // Split into words and create clickable letters
    const words = this.cipherText.split(' ');
    words.forEach((word) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'cipher-word';

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (/[A-Z]/.test(char)) {
          const letterSpan = document.createElement('span');
          letterSpan.className = 'cipher-letter clickable-letter';
          letterSpan.textContent = char;
          letterSpan.dataset.encrypted = char;

          // Add click handler
          letterSpan.addEventListener('click', () => this.onLetterClick(char));

          wordSpan.appendChild(letterSpan);
        } else {
          // Non-letter character (punctuation)
          const charSpan = document.createElement('span');
          charSpan.textContent = char;
          charSpan.className = 'cipher-punctuation';
          wordSpan.appendChild(charSpan);
        }
      }

      cipherDisplay.appendChild(wordSpan);
    });

    // Populate keyboard rows (already in HTML, just add letter keys)
    this.populateKeyboard();

    this.updateDisplay();
  }

  /**
   * Populate the keyboard with letter keys
   */
  populateKeyboard() {
    const qwertyRows = [
      { id: 'keyboard-row-1', letters: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'] },
      { id: 'keyboard-row-2', letters: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'] },
      { id: 'keyboard-row-3-letters', letters: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'] }
    ];

    qwertyRows.forEach(row => {
      const rowElement = document.getElementById(row.id);
      if (rowElement) {
        row.letters.forEach(letter => {
          const key = this.createLetterKey(letter);
          rowElement.appendChild(key);
        });
      }
    });
  }
  
  /**
   * Create a clickable letter key for the keyboard
   */
  createLetterKey(letter) {
    const btn = document.createElement('button');
    btn.className = 'btn letter-key';
    btn.textContent = letter;
    btn.dataset.plain = letter;

    btn.addEventListener('click', () => this.onPlainLetterSelect(letter));
    return btn;
  }
  
  
  /**
   * Handle click on encrypted letter
   */
  onLetterClick(encryptedLetter) {
        this.selectedEncryptedLetter = encryptedLetter;

        // Update all letters - remove selected class from all, add to clicked one
        const allLetters = document.querySelectorAll('.cipher-letter');
        allLetters.forEach(el => {
          const encrypted = el.dataset.encrypted;

          // Remove selected class
          el.classList.remove('selected');

          if (encrypted === encryptedLetter) {
            // Add selected class to clicked letter
            el.classList.add('selected');
          } else {
            // Restore proper state classes for other letters
            const plain = this.state.getMapping(encrypted);
            if (plain) {
              const correctPlain = this.getCorrectMapping(encrypted);
              const isCorrect = plain === correctPlain;
              const isHintRevealed = this.state.isHintRevealed(encrypted);

              // Remove all state classes first
              el.classList.remove('hint-revealed', 'correct', 'incorrect');

              // Add appropriate state class
              if (isHintRevealed) {
                el.classList.add('hint-revealed');
              } else if (isCorrect) {
                el.classList.add('correct');
              } else {
                el.classList.add('incorrect');
              }
            }
          }
        });

        // Update keyboard to show which letters are available and highlight selected
        this.updateKeyboardState();
      }
  
  /**
   * Update keyboard state to show used/available letters and highlight selected
   */
  updateKeyboardState() {
    const buttons = document.querySelectorAll('.letter-key');
    buttons.forEach(btn => {
      const letter = btn.dataset.plain;
      const isUsed = this.state.isPlainLetterUsed(letter);
      const currentMapping = this.state.getMapping(this.selectedEncryptedLetter);

      // Reset classes
      btn.classList.remove('selected', 'highlighted');
      
      if (isUsed && letter !== currentMapping) {
        btn.disabled = true;
      } else {
        btn.disabled = false;

        // Highlight current mapping with selected class
        if (letter === currentMapping) {
          btn.classList.add('selected');
        }
      }
    });

    // Highlight the selected encrypted letter on the keyboard
    if (this.selectedEncryptedLetter) {
      const mappedPlain = this.state.getMapping(this.selectedEncryptedLetter);
      if (mappedPlain) {
        buttons.forEach(btn => {
          if (btn.dataset.plain === mappedPlain) {
            btn.classList.add('highlighted');
          }
        });
      }
    }
  }
  
  /**
   * Handle selection of plain letter
   */
  onPlainLetterSelect(plainLetter) {
    // If no encrypted letter is selected, check if this plain letter is already mapped
    if (!this.selectedEncryptedLetter) {
      // Find which encrypted letter this plain letter is mapped to
      const existingEncrypted = this.state.getEncryptedForPlain(plainLetter);
      if (existingEncrypted) {
        // Select that encrypted letter so user can remap it
        this.selectedEncryptedLetter = existingEncrypted;
        this.onLetterClick(existingEncrypted);
        return;
      }
      // If not mapped, do nothing (user needs to select an encrypted letter first)
      return;
    }
    
    // Check if the selected encrypted letter already has a different mapping
    const currentMapping = this.state.getMapping(this.selectedEncryptedLetter);
    if (currentMapping && currentMapping !== plainLetter) {
      // Clear the old mapping from the selected encrypted letter
      this.state.clearMapping(this.selectedEncryptedLetter);
    }
    
    // Check if this plain letter is already used for a different encrypted letter
    const existingEncrypted = this.state.getEncryptedForPlain(plainLetter);
    if (existingEncrypted && existingEncrypted !== this.selectedEncryptedLetter) {
      // Clear the existing mapping
      this.state.clearMapping(existingEncrypted);
    }
    
    // Set the new mapping
    this.state.setMapping(this.selectedEncryptedLetter, plainLetter);
    
    // Update display
    this.updateDisplay();
    
    // DON'T clear selection - keep the encrypted letter selected
    // so user can keep trying different plain letters
    
    // Update keyboard state to reflect new mapping
    this.updateKeyboardState();
    
    // Trigger callback
    if (this.onMappingChange) {
      this.onMappingChange();
    }
  }
  
  /**
   * Update the display with current mappings
   */
  updateDisplay() {
          // Update cipher letters to show mappings
          const allLetters = document.querySelectorAll('.cipher-letter');
          allLetters.forEach(el => {
            const encrypted = el.dataset.encrypted;
            const plain = this.state.getMapping(encrypted);

            if (plain) {
              // Check if this mapping is correct
              const correctPlain = this.getCorrectMapping(encrypted);
              const isCorrect = plain === correctPlain;
              const isHintRevealed = this.state.isHintRevealed(encrypted);

              // Determine color class
              let colorClass = 'incorrect-color';
              if (isHintRevealed) {
                colorClass = 'hint-color';
              } else if (isCorrect) {
                colorClass = 'correct-color';
              }

              // Make decoded letter bigger and more prominent using CSS classes
              el.innerHTML = `<span class="encrypted-text">${encrypted}</span><br><span class="plain-text ${colorClass}">${plain}</span>`;
              el.classList.add('mapped');

              // Remove all state classes first
              el.classList.remove('hint-revealed', 'correct', 'incorrect', 'selected');

              // Background color class (only if not currently selected)
              if (encrypted !== this.selectedEncryptedLetter) {
                if (isHintRevealed) {
                  el.classList.add('hint-revealed');
                } else if (isCorrect) {
                  el.classList.add('correct');
                } else {
                  el.classList.add('incorrect');
                }
              } else {
                el.classList.add('selected');
              }
            } else {
              el.textContent = encrypted;
              el.classList.remove('mapped', 'hint-revealed', 'correct', 'incorrect');

              // Only keep selected class if currently selected
              if (encrypted !== this.selectedEncryptedLetter) {
                el.classList.remove('selected');
              }
            }
          });

          // Update current mappings display
          this.renderMappingsTable();
        }
  
  /**
   * Get the correct plain letter for an encrypted letter
   */
  getCorrectMapping(encryptedLetter) {
    // Create inverse mapping from the actual cipher mapping
    for (const [plain, cipher] of this.state.actualMapping.entries()) {
      if (cipher === encryptedLetter) {
        return plain;
      }
    }
    return null;
  }
  
  /**
   * Render the current mappings table with colour-coded badges
   */
  renderMappingsTable() {
      const mappingsDiv = document.getElementById('current-mappings');
      if (!mappingsDiv) return;

      const mappings = this.state.getAllMappings();
      if (mappings.size === 0) {
        mappingsDiv.innerHTML = '<p class="text-muted text-center">Click on letters above to start mapping...</p>';
        return;
      }

      // Clone the mappings table template
      const template = document.getElementById('mappings-table-template');
      const clone = template.content.cloneNode(true);
      const badgesContainer = clone.getElementById('mappings-badges');

      // Sort by encrypted letter
      const sortedMappings = Array.from(mappings.entries()).sort((a, b) => a[0].localeCompare(b[0]));

      sortedMappings.forEach(([encrypted, plain]) => {
        // Determine the state class based on correctness and hint status
        const correctPlain = this.getCorrectMapping(encrypted);
        const isCorrect = plain === correctPlain;
        const isHintRevealed = this.state.isHintRevealed(encrypted);

        let stateClass = 'incorrect';
        if (isHintRevealed) {
          stateClass = 'hint-revealed';
        } else if (isCorrect) {
          stateClass = 'correct';
        }

        // Clone badge template
        const badgeTemplate = document.getElementById('mapping-badge-template');
        const badgeClone = badgeTemplate.content.cloneNode(true);
        const badge = badgeClone.querySelector('.mapping-badge');
        
        // Add state class
        badge.classList.add(stateClass);
        
        // Set content
        badge.querySelector('.encrypted-letter').textContent = encrypted;
        badge.querySelector('.plain-letter').textContent = plain;
        
        // Set clear button handler
        const clearBtn = badge.querySelector('.clear-mapping-btn');
        clearBtn.onclick = () => clearSingleMapping(encrypted);
        
        badgesContainer.appendChild(badgeClone);
      });

      mappingsDiv.innerHTML = '';
      mappingsDiv.appendChild(clone);
    }
  
  /**
   * Clear a single mapping
   */
  clearMapping(encryptedLetter) {
    this.state.clearMapping(encryptedLetter);
    this.updateDisplay();
    
    if (this.onMappingChange) {
      this.onMappingChange();
    }
  }
  
  /**
   * Clear all mappings
   */
  clearAll() {
    this.state.clearAllMappings();
    this.updateDisplay();
    
    if (this.onMappingChange) {
      this.onMappingChange();
    }
  }
}

// ============================================================================
// HINT SYSTEM (Challenge 3 Specific)
// ============================================================================

/**
 * Manages hints and educational content for cipher challenge
 */
class CipherHintSystem {
  constructor(actualMapping, plainText, maxHints = 5) {
    this.actualMapping = actualMapping;
    this.plainText = plainText;
    this.maxHints = maxHints;
    this.hintsGiven = 0;
    this.lastActivityTime = new Date();
    
    // Extract words from plain text for word-based hints
    this.words = this.extractWords(plainText);
    this.revealedWords = new Set(); // Track which words have been revealed
    
    // Educational hints about cryptography
    this.educationalHints = [
      "In English, the most common letter is 'E', followed by 'T', 'A', 'O', and 'I'.",
      "Look for single-letter words - they're usually 'A' or 'I'.",
      "Common three-letter words include 'THE', 'AND', 'FOR', 'ARE', and 'BUT'.",
      "Double letters like 'LL', 'EE', 'SS', and 'OO' appear frequently in English.",
      "The letter 'Q' is almost always followed by 'U' in English words."
    ];
    this.educationalHintIndex = 0;
  }
  
  /**
   * Extract words from plain text, sorted by length
   * Excludes single-letter words
   */
  extractWords(text) {
    const words = text.match(/[A-Z]+/g) || [];
    // Remove duplicates, filter out single letters, and sort by length (smallest first)
    const uniqueWords = [...new Set(words)].filter(word => word.length > 1);
    return uniqueWords.sort((a, b) => a.length - b.length);
  }
  
  /**
   * Get initial hints (2-3 pre-filled letters)
   */
  getInitialHints() {
    const hints = new Map();
    
    // Find the most common letters to pre-fill
    const commonLetters = ['E', 'T', 'A'];
    let hintsAdded = 0;
    
    for (const [plain, cipher] of this.actualMapping.entries()) {
      if (commonLetters.includes(plain) && hintsAdded < 2) {
        hints.set(cipher, plain);
        hintsAdded++;
      }
    }
    
    return hints;
  }
  
  /**
   * Get next hint - combines educational tip with word reveal
   */
  getNextHint(currentState) {
    if (this.hintsGiven >= this.maxHints) {
      return {
        type: 'limit_reached',
        content: "You've used all available hints! You can do this - keep trying!",
        educationalTip: null,
        mappings: []
      };
    }
    
    this.hintsGiven++;
    
    // Get educational tip
    const educationalTip = this.educationalHints[this.educationalHintIndex % this.educationalHints.length];
    this.educationalHintIndex++;
    
    // Get word reveal
    const wordHint = this.getWordRevealHint(currentState);
    
    return {
      type: 'combined',
      content: wordHint.content,
      educationalTip: educationalTip,
      mappings: wordHint.mappings
    };
  }
  
  /**
   * Get a hint that reveals a complete word (only words with unmapped letters)
   */
  getWordRevealHint(currentState) {
    // Find the next unrevealed word (starting with smallest)
    for (const word of this.words) {
      if (!this.revealedWords.has(word)) {
        // Check if this word has any unmapped letters (red letters)
        const hasUnmappedLetters = this.hasUnmappedLetters(word, currentState);

        if (!hasUnmappedLetters) {
          // Skip this word - all letters are already mapped (even if incorrect)
          // Mark it as revealed and continue to next
          this.revealedWords.add(word);
          continue;
        }

        // This word has unmapped letters, so reveal it
        this.revealedWords.add(word);

        const mappings = [];
        const uniqueLetters = new Set(word);

        // Get all unique letter mappings for this word
        for (const letter of uniqueLetters) {
          for (const [plain, cipher] of this.actualMapping.entries()) {
            if (plain === letter) {
              // Always add the mapping (will reveal all letters in the word)
              mappings.push({ encrypted: cipher, plain: plain });
              break;
            }
          }
        }

        return {
          content: `Revealing the word: "${word}"`,
          mappings: mappings
        };
      }
    }

    // Fallback if all words revealed
    return {
      content: "All words have been revealed! You can do this!",
      mappings: []
    };
  }

    /**
     * Check if a word has any unmapped letters (red letters)
     */
    hasUnmappedLetters(word, currentState) {
      // Get the current state from the challenge
      if (!currentState) return true;

      // Check each letter in the word
      for (const letter of word) {
        // Find the encrypted version of this letter
        for (const [plain, cipher] of this.actualMapping.entries()) {
          if (plain === letter) {
            // Check if user has mapped this encrypted letter
            const userMapping = currentState.getMapping(cipher);
            if (!userMapping) {
              // This letter is not mapped yet (still red)
              return true;
            }
            break;
          }
        }
      }

      // All letters in the word are mapped (no red letters)
      return false;
    }
  
  /**
   * Check if hints are available
   */
  hasHintsRemaining() {
    return this.hintsGiven < this.maxHints;
  }
  
  /**
   * Get hints used count
   */
  getHintsUsed() {
    return this.hintsGiven;
  }
  
  /**
   * Update last activity time
   */
  updateActivity() {
    this.lastActivityTime = new Date();
  }
  
  /**
   * Check if encouragement hint should be shown (after 2 minutes of inactivity)
   */
  shouldShowEncouragement() {
    const now = new Date();
    const inactiveSeconds = (now - this.lastActivityTime) / 1000;
    return inactiveSeconds > 120; // 2 minutes
  }
  
  /**
   * Get encouragement hint (doesn't count towards hints used)
   */
  getEncouragementHint() {
    this.lastActivityTime = new Date(); // Reset timer
    return "You're doing great! Keep looking for patterns in the encrypted message.";
  }
}


// ============================================================================
// VALIDATION AND SCORING (Challenge 3 Specific)
// ============================================================================

/**
 * Handles solution validation and scoring for cipher challenge
 */
class CipherScoringSystem {
  constructor(actualMapping, cipherText, maxPoints = 5) {
    this.actualMapping = actualMapping;
    this.cipherText = cipherText;
    this.maxPoints = maxPoints;
    
    // Create inverse mapping (cipher -> plain)
    this.inverseMapping = new Map();
    for (const [plain, cipher] of actualMapping.entries()) {
      this.inverseMapping.set(cipher, plain);
    }
    
    // Get unique letters in cipher text
    this.uniqueLetters = new Set();
    for (const char of cipherText) {
      if (/[A-Z]/.test(char)) {
        this.uniqueLetters.add(char.toUpperCase());
      }
    }
  }
  
  /**
   * Validate the user's solution
   */
  validateSolution(userMapping) {
    let correctCount = 0;
    let totalCount = this.uniqueLetters.size;
    const incorrectLetters = [];
    
    for (const cipherLetter of this.uniqueLetters) {
      const correctPlain = this.inverseMapping.get(cipherLetter);
      const userPlain = userMapping.get(cipherLetter);
      
      if (userPlain === correctPlain) {
        correctCount++;
      } else {
        incorrectLetters.push(cipherLetter);
      }
    }
    
    return {
      isCorrect: correctCount === totalCount,
      correctCount,
      totalCount,
      incorrectLetters
    };
  }
  
  /**
   * Calculate points based on hints used
   */
  calculatePoints(hintsUsed) {
    return Math.max(1, this.maxPoints - hintsUsed);
  }
  
  /**
   * Submit score to backend API using ScoreManager
   */
  async submitScore(points) {
    try {
      if (!scoreManager) {
        scoreManager = new ScoreManager('challenge3');
      }
      await scoreManager.submitScore(points, this.maxPoints);
      return true;
    } catch (error) {
      console.error('Error submitting score:', error);
      
      // Retry logic
      for (let i = 0; i < 2; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        try {
          await scoreManager.submitScore(points, this.maxPoints);
          return true;
        } catch (retryError) {
          console.error(`Retry ${i + 1} failed:`, retryError);
        }
      }
      
      return false;
    }
  }
  
  /**
   * Show success feedback
   */
  showSuccess(points) {
    // Trigger confetti animation
    if (typeof triggerConfettiOnSuccess === 'function') {
      triggerConfettiOnSuccess(true);
    }
    
    // Use the success panel template from HTML
    const successPanel = document.getElementById('success-panel');
    if (successPanel) {
      // Update points value
      const pointsEarned = document.getElementById('points-earned');
      if (pointsEarned) {
        pointsEarned.textContent = points;
      }
      
      // Show the success panel
      successPanel.classList.remove('d-none');
      
      // Scroll to it
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  /**
   * Show partial feedback for incorrect attempts
   */
  showPartialFeedback(correctCount, totalCount, container) {
    const percentage = Math.round((correctCount / totalCount) * 100);
    
    // Clone the partial feedback template
    const template = document.getElementById('partial-feedback-template');
    const clone = template.content.cloneNode(true);
    
    // Update values
    clone.querySelector('.correct-count').textContent = correctCount;
    clone.querySelector('.total-count').textContent = totalCount;
    clone.querySelector('.percentage').textContent = percentage;
    
    container.innerHTML = '';
    container.appendChild(clone);
  }
}


// ============================================================================
// GLOBAL VARIABLES AND INITIALIZATION
// ============================================================================

let challengeState = null;
let decoderInterface = null;
let cipherHintSystem = null;
let cipherScoringSystem = null;
let encouragementTimer = null;
let scoreManager = null;
let progressManager = null;

/**
 * Mark challenge as complete on the server
 */
async function markChallengeComplete(challengeId) {
  try {
    const response = await fetch('/api/mark_challenge_complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: challengeId })
    });
    const data = await response.json();
    console.log('Challenge3: Challenge marked complete:', data);
  } catch (error) {
    console.error('Challenge3: Error marking challenge complete:', error);
  }
}

/**
 * Global function to clear a single mapping (called from HTML)
 */
function clearSingleMapping(encryptedLetter) {
  if (decoderInterface) {
    decoderInterface.clearMapping(encryptedLetter);
  }
}

/**
 * Global function to clear all mappings (called from HTML)
 */
function clearAllMappings() {
  if (decoderInterface) {
    decoderInterface.clearAll();
  }
}

/**
 * Show hint with confirmation
 */
function showHint() {
  if (!cipherHintSystem || !cipherHintSystem.hasHintsRemaining()) {
    showHintConfirmation(
      "No Hints Remaining",
      "You've used all available hints! You can do this - keep trying!",
      null,
      null,
      true
    );
    return;
  }
  
  const pointCost = 1;
  const currentPoints = cipherScoringSystem.maxPoints - challengeState.hintsUsed;
  const newPoints = Math.max(1, currentPoints - pointCost);
  
  showHintConfirmation(
    "Use a Hint?",
    `This hint will cost 1 point.`,
    currentPoints,
    newPoints,
    false
  );
}

/**
 * Show hint confirmation UI using template
 */
function showHintConfirmation(title, message, currentPoints, newPoints, isError) {
  // Choose the appropriate template
  const templateId = isError ? 'error-modal-template' : 'hint-modal-template';
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);
  
  // Get the overlay element
  const overlay = clone.querySelector('.hint-modal-overlay');
  
  // Set title and message
  clone.querySelector('.modal-title').textContent = title;
  clone.querySelector('.modal-message').textContent = message;
  
  if (!isError && currentPoints !== null) {
    // Update points display
    clone.querySelector('.current-points').textContent = currentPoints;
    clone.querySelector('.new-points').textContent = newPoints;
    
    // Set up button handlers
    const confirmBtn = clone.querySelector('.confirm-btn');
    confirmBtn.onclick = () => {
      document.body.removeChild(overlay);
      applyHint();
    };
    
    const cancelBtn = clone.querySelector('.cancel-btn');
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
    };
  } else {
    // Hide points info for error modal
    const pointsInfo = clone.querySelector('.modal-points-info');
    if (pointsInfo) pointsInfo.remove();
    
    // Set up OK button
    const okBtn = clone.querySelector('.ok-btn');
    okBtn.onclick = () => {
      document.body.removeChild(overlay);
    };
  }
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };
  
  document.body.appendChild(clone);
}

/**
 * Apply the hint after confirmation
 */
function applyHint() {
  const hint = cipherHintSystem.getNextHint(challengeState);
  challengeState.incrementHints();
  
  // Update hints display
  updateHintsDisplay();
  
  // Show hint content using template
  const hintContainer = document.getElementById('hint-content');
  if (hintContainer) {
    const template = document.getElementById('hint-display-template');
    const clone = template.content.cloneNode(true);
    
    // Set hint number
    clone.querySelector('.hint-number').textContent = `Hint ${cipherHintSystem.getHintsUsed()}:`;
    
    // Show educational tip if available
    const tipDiv = clone.querySelector('.hint-tip');
    if (hint.educationalTip) {
      tipDiv.innerHTML = `<strong>Crypto Tip:</strong> ${hint.educationalTip}`;
    } else {
      tipDiv.remove();
    }
    
    // Show word reveal
    clone.querySelector('.hint-content-text').innerHTML = `<strong>${hint.content}</strong>`;
    
    hintContainer.innerHTML = '';
    hintContainer.appendChild(clone);
  }
  
  // If it's a letter/word reveal, apply the mappings and mark as hint-revealed
  if (hint.mappings && hint.mappings.length > 0) {
    hint.mappings.forEach(mapping => {
      challengeState.setMapping(mapping.encrypted, mapping.plain, true); // Mark as hint-revealed
    });
    decoderInterface.updateDisplay();
  }
  
  // Update activity
  cipherHintSystem.updateActivity();
}

/**
 * Update hints display
 */
function updateHintsDisplay() {
  const hintsUsedEl = document.getElementById('hints-used');
  if (hintsUsedEl) {
    const remaining = cipherScoringSystem.maxPoints - challengeState.hintsUsed;
    hintsUsedEl.textContent = `Hints used: ${challengeState.hintsUsed} (${remaining} points remaining)`;
  }
}

/**
 * Check solution
 */
function checkSolution() {
  const validation = cipherScoringSystem.validateSolution(challengeState.userMapping);
  const feedbackContainer = document.getElementById('validation-feedback');
  
  if (validation.isCorrect) {
    // Success!
    challengeState.markComplete();
    
    const points = cipherScoringSystem.calculatePoints(challengeState.hintsUsed);
    
    // Mark challenge as complete and clear progress using ProgressManager
    markChallengeComplete('challenge3');
    progressManager.clearProgress();
    
    // Hide the decoder container (monitor and keyboard)
    const decoderContainer = document.getElementById('decoder-container');
    if (decoderContainer) {
      decoderContainer.classList.add('hidden');
    }
    
    // Show success (uses HTML template, handles scrolling internally)
    cipherScoringSystem.showSuccess(points);
    
    // Submit score
    cipherScoringSystem.submitScore(points).then(success => {
      if (!success) {
        console.warn('Score submission failed, but allowing progression');
      }
    });
    
    // Show next challenge button
    const nextBtn = document.getElementById('next-challenge-container');
    if (nextBtn) {
      nextBtn.classList.remove('d-none');
    }
    
    // Disable hint button
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.disabled = true;
    }
    
    // Stop encouragement timer
    if (encouragementTimer) {
      clearInterval(encouragementTimer);
    }
  } else {
    // Partial success
    cipherScoringSystem.showPartialFeedback(
      validation.correctCount,
      validation.totalCount,
      feedbackContainer
    );
  }
}

/**
 * Initialize the challenge
 */
function initializeChallenge() {
  // Initialize utility managers
  scoreManager = new ScoreManager('challenge3');
  progressManager = new ProgressManager('challenge3');
  
  // Select random message
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const plainText = message.text;
  
  // Apply theme styling
  applyTheme(message);
  
  // Generate cipher mapping
  const mapping = generateSubstitutionMapping();
  
  // Encrypt the message
  const cipherText = encrypt(plainText, mapping);
  
  // Create challenge state
  challengeState = new ChallengeState(plainText, cipherText, mapping);
  
  // Initialize hint system
  cipherHintSystem = new CipherHintSystem(mapping, plainText);
  
  // Apply initial hints and mark them as hint-revealed
  const initialHints = cipherHintSystem.getInitialHints();
  for (const [encrypted, plain] of initialHints.entries()) {
    challengeState.setMapping(encrypted, plain, true); // Mark as hint-revealed
  }
  
  // Initialize scoring system
  cipherScoringSystem = new CipherScoringSystem(mapping, cipherText);
  
  // Initialize decoder interface
  const decoderContainer = document.getElementById('decoder-container');
  if (decoderContainer) {
    decoderInterface = new DecoderInterface(cipherText, challengeState, decoderContainer);
    decoderInterface.render();
    
    // Set callback for mapping changes
    decoderInterface.onMappingChange = () => {
      cipherHintSystem.updateActivity();
      
      // Auto-check if all letters are mapped
      const uniqueLetters = cipherScoringSystem.uniqueLetters.size;
      const mappedCount = challengeState.userMapping.size;
      
      if (mappedCount >= uniqueLetters) {
        // Small delay before checking
        setTimeout(() => checkSolution(), 500);
      }
    };
  }
  
  // Update hints display
  updateHintsDisplay();
  
  // Start encouragement timer (check every 30 seconds)
  encouragementTimer = setInterval(() => {
    if (cipherHintSystem.shouldShowEncouragement() && !challengeState.isComplete) {
      const encouragement = cipherHintSystem.getEncouragementHint();
      const hintContainer = document.getElementById('hint-content');
      if (hintContainer) {
        const template = document.getElementById('encouragement-template');
        const clone = template.content.cloneNode(true);
        clone.querySelector('.encouragement-text').innerHTML = `<strong>Keep Going!</strong> ${encouragement}`;
        hintContainer.innerHTML = '';
        hintContainer.appendChild(clone);
      }
    }
  }, 30000);
}

/**
 * Apply theme styling
 */
function applyTheme(message) {
  // Populate scenario banner from HTML template
  const scenarioBanner = document.getElementById('scenario-banner');
  if (scenarioBanner) {
    // Set content
    const iconImg = document.getElementById('scenario-icon-img');
    const title = document.getElementById('scenario-title');
    const description = document.getElementById('scenario-description');
    
    if (iconImg) iconImg.src = `/static/images/${message.iconImage}`;
    if (iconImg) iconImg.alt = message.scenario;
    if (title) title.textContent = message.scenario;
    if (description) description.textContent = message.description;
    // Note: story text is intentionally not displayed to avoid revealing the answer
    
    // Show the banner
    scenarioBanner.classList.remove('d-none');
  }
}

// ============================================================================
// DOCUMENT READY
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  // Initialize progress manager
  progressManager = new ProgressManager('challenge3');
  
  // Check if intro was already completed
  const introCompleted = progressManager.hasProgress();
  if (introCompleted) {
    // Skip intro and show challenge
    const introCard = document.getElementById('intro-card');
    const challengeContent = document.querySelector('.challenge3-content');
    if (introCard && challengeContent) {
      introCard.classList.add('d-none');
      challengeContent.classList.remove('d-none');
      initializeChallenge();
      // Scroll to top when challenge starts
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Wait for the intro "Let's Decode!" button
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', async function() {
      // Disable button and show loading state
      startBtn.disabled = true;
      const originalText = startBtn.innerHTML;
      startBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
      
      try {
        // Preload images from challenge content
        const challengeContent = document.querySelector('.challenge3-content');
        if (challengeContent && window.imagePreloader) {
          await window.imagePreloader.preloadFromContainer(challengeContent);
          const stats = window.imagePreloader.getStats();
          console.log(`Preloaded ${stats.loaded} images, ${stats.failed} failed`);
        }
      } catch (error) {
        console.error('Error preloading images:', error);
      }
      
      // Mark intro as completed using ProgressManager
      progressManager.saveProgress({ introCompleted: true });
      
      // Hide intro card
      const introCard = document.getElementById('intro-card');
      if (introCard) {
        introCard.classList.add('d-none');
      }
      
      // Show challenge content
      if (challengeContent) {
        challengeContent.classList.remove('d-none');
      }
      
      // Initialize the challenge
      initializeChallenge();
      
      // Scroll to top when challenge starts
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

