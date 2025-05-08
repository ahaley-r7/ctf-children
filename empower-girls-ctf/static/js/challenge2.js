// static/js/challenge2.js – Dragula matching with scan results review step
// Powered by Rapid7 Moose spirit

document.addEventListener('DOMContentLoaded', () => {
    const scanBtn          = document.getElementById('scan-btn');
    const scannerAnimation = document.querySelector('.scanner-animation');
    const fakeSiteWrapper  = document.getElementById('fake-site-wrapper');
    const scannerSection   = document.getElementById('scanner-section');
    const gameArea         = document.getElementById('game-area');
    const submitBtn        = document.getElementById('submit-fixes');
    const resetBtn         = document.getElementById('reset-fixes');
    let attemptsRemaining  = 5;
  
    // Initially hide game area
    gameArea.classList.add('d-none');
  
    scanBtn.addEventListener('click', e => {
      e.preventDefault();
      scanBtn.style.display = 'none';
      scannerAnimation.classList.remove('d-none');
  
      setTimeout(() => {
        scannerAnimation.classList.add('d-none');
        fakeSiteWrapper.classList.remove('d-none');
  
        // Add vulnerability tooltips using Tippy.js
        const vulnerabilityTips = [
          {
            element: '#upload-status',
            content: 'Allows ANY file type! Hackers could upload harmful code.',
            id: 'upload-fix'
          },
          {
            element: '.card img[src*="broken-image.png"]',
            content: 'Broken image - looks unprofessional and causes confusion.',
            id: 'img-fix'
          },
          {
            element: 'input[value="1234"]',
            content: 'Weak password "1234" - too easy to guess!',
            id: 'pw-fix'
          },
          {
            element: '#admin-link',
            content: 'Admin panel visible to everyone. Should be hidden!',
            id: 'admin-fix'
          },
          {
            element: '#url-bar',
            content: 'Using HTTP instead of HTTPS - information not encrypted!',
            id: 'https-fix'
          }
        ];
  
        // Create and apply Tippy tooltips
        vulnerabilityTips.forEach(tip => {
          const element = document.querySelector(tip.element);
          if (element) {
            // Add a distinctive style to highlight the vulnerable element
            element.classList.add('vuln-highlight');
            
            // Create the tooltip
            tippy(element, {
              content: tip.content,
              theme: 'empower',
              animation: 'shift-away',
              inertia: true,
              duration: [300, 250],
              arrow: true,
              placement: 'top',
              allowHTML: true,
              trigger: 'manual', // Don't use hover trigger
              hideOnClick: false, // Don't hide when clicked
              showOnCreate: true, // Show immediately when created
              interactive: true, // Allow interacting with tooltip content
              maxWidth: 250,
              size: 'small',
              onShow(instance) {
                // Add pulse effect when tooltip shows
                element.classList.add('pulse');
              },
              onHide(instance) {
                // Remove pulse when tooltip hides
                element.classList.remove('pulse');
              }
            });
            
            // Store the vulnerability ID for later reference
            element.dataset.vulnId = tip.id;
          }
        });
  
        // Add CSS for highlighting vulnerable elements
        const style = document.createElement('style');
        style.textContent = `
          .vuln-highlight {
            box-shadow: 0 0 8px #FF6200;
            border: 2px solid #FF6200;
            border-radius: 4px;
            transition: all 0.3s ease;
          }
          .vuln-highlight:hover {
            box-shadow: 0 0 15px #FF6200;
            transform: scale(1.03);
          }
          .pulse {
            animation: pulse-animation 1.5s infinite;
          }
          @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0 rgba(255, 98, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 98, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 98, 0, 0); }
          }
          .tippy-box {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
          }
          .tippy-content {
            padding: 0.5rem 0.75rem !important;
          }
        `;
        document.head.appendChild(style);
  
        // Replace Bootstrap tooltips with Tippy.js
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
          const originalTitle = el.getAttribute('title');
          if (originalTitle) {
            tippy(el, {
              content: originalTitle,
              theme: 'empower',
              animation: 'shift-away',
              maxWidth: 200,
              size: 'small'
            });
            
            // Remove Bootstrap tooltip attribute to prevent conflicts
            el.removeAttribute('data-bs-toggle');
            el.removeAttribute('title');
          }
        });
  
        // Add proceed button for matching step
        const proceed = document.createElement('button');
        proceed.id = 'proceed-btn';
        proceed.className = 'btn btn-success btn-sm fw-bold mt-3';
        proceed.textContent = "Let's get matching";
        scannerSection.appendChild(proceed);
  
        proceed.addEventListener('click', () => {
          // Destroy Tippy instances before moving to next step
          document.querySelectorAll('.vuln-highlight').forEach(el => {
            if (el._tippy) {
              el._tippy.destroy();
            }
          });
          
          fakeSiteWrapper.classList.add('d-none');
          proceed.remove();
          gameArea.classList.remove('d-none');
          buildGameLayout();
          initDragula();
          updateAttemptsDisplay(false); // Don't decrement on first display
        });
  
      }, 3000);
    });
  
    function buildGameLayout() {
      const vulnZone = document.getElementById('vuln-zone');
      const fixZone  = document.getElementById('fix-zone');
      vulnZone.innerHTML = '';
      fixZone.innerHTML  = '';
  
      // Clone and shuffle vuln cards
      const vulnTemplates = Array.from(document.querySelectorAll('#original-vulns .droppable-vuln'));
      shuffle(vulnTemplates).forEach(v => vulnZone.appendChild(v.cloneNode(true)));
  
      // Clone and shuffle fix cards
      const fixTemplates = Array.from(document.querySelectorAll('#original-vulns .draggable-fix'));
      shuffle(fixTemplates).forEach(f => {
        const c = f.cloneNode(true);
        c.id = f.dataset.fix;
        fixZone.appendChild(c);
      });
  
      document.getElementById('feedback').textContent = '';
      submitBtn.classList.remove('d-none');
      resetBtn.classList.add('d-none');
    }
  
    function updateSubmitButtonState() {
      // Get all vulnerability zones in the game area
      const vulnerabilityZones = document.querySelectorAll('#vuln-zone .droppable-vuln');
      // Check if all zones have an item dropped on them
      const allZonesHaveItems = Array.from(vulnerabilityZones).every(zone => 
        zone.classList.contains('has-item')
      );
      
      // Enable/disable the submit button based on completeness
      submitBtn.disabled = !allZonesHaveItems;
      
      // Add visual feedback
      if (allZonesHaveItems) {
        submitBtn.classList.add('btn-warning');
        submitBtn.classList.remove('btn-secondary');
        submitBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Submit Matches';
      } else {
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-secondary');
        submitBtn.innerHTML = 'Match All Vulnerabilities First';
      }
    }
  
    function initDragula() {
      const fixZone = document.getElementById('fix-zone');
      const targets = Array.from(document.querySelectorAll('.droppable-vuln'));
      const drake   = dragula([fixZone, ...targets], {
        copy: false,
        revertOnSpill: true,
        accepts: (el, t) => t.classList.contains('droppable-vuln')
      });
  
      drake.on('drop', (el, target) => {
        // Only show that something was dropped, not whether it's correct
        target.classList.add('has-item');
        
        // Update submit button state whenever a fix is dropped
        updateSubmitButtonState();
      });
      
      drake.on('remove', (el, container, source) => {
        // When an item is removed from a vulnerability zone
        if (source.classList.contains('droppable-vuln')) {
          source.classList.remove('has-item');
          // Update submit button state
          updateSubmitButtonState();
        }
      });
      
      // Initialize button state (should be disabled at start)
      updateSubmitButtonState();
    }
  
    submitBtn.addEventListener('click', () => {
      // Specifically target only game area vulnerability boxes
      const droppableAreas = Array.from(document.querySelectorAll('#vuln-zone .droppable-vuln'));
      
      const allMatched = droppableAreas.every(box => {
        const child = box.querySelector('.draggable-fix');
        return child && child.dataset.fix === box.dataset.expect;
      });
      
      const msgEl = document.getElementById('feedback');
      
      if (allMatched) {
        // Calculate points based on attempts
        const points = Math.max(5 - (5 - attemptsRemaining), 1);

        // Submit points to the API
        window.submitScore(points);
                  
        // Create a success message outside the game area
        const successMsg = document.createElement('div');
        successMsg.innerHTML = `✅ All vulnerabilities fixed! <br>You earned ${points} points!`;
        successMsg.className = 'alert alert-success text-center fw-bold';
        
        // Hide game components
        document.getElementById('vuln-fix-wrapper').style.display = 'none';
        document.getElementById('feedback').style.display = 'none';
        document.querySelector('.text-center.mt-2').style.display = 'none'; // Buttons container
        
        // Also hide the attempts display
        const attemptsDisplay = document.getElementById('attempts-display');
        if (attemptsDisplay) {
          attemptsDisplay.style.display = 'none';
        }
        
        // Add success message before the fixed website will appear
        gameArea.prepend(successMsg);
        
        // Show confetti animation
        triggerConfettiOnSuccess(true);
        
        // Show the fixed website
        setTimeout(() => {
          showFixedWebsite();
        }, 800);
        
        // Show next challenge button after delay
        setTimeout(() => {
          const nextLink = document.createElement('a');
          nextLink.href = '/challenge3';
          nextLink.className = 'btn btn-next fw-bold mt-4 d-block mx-auto';
          nextLink.style.width = 'fit-content';
          nextLink.textContent = 'Next Challenge';
          
          // Place at the bottom of the fixed site
          gameArea.appendChild(nextLink);
        }, 1500);
      } else {
        msgEl.textContent = 'Some fixes are misplaced—try again.';
        msgEl.className = 'text-danger fw-bold text-center';
        
        submitBtn.classList.add('d-none');
        resetBtn.classList.remove('d-none');
      }
    });
  
    resetBtn.addEventListener('click', () => {
      const boxes = document.querySelectorAll('.droppable-vuln');
      const fixZone = document.getElementById('fix-zone');
  
      boxes.forEach(box => {
        const child = box.querySelector('.draggable-fix');
        // Remove wrong matches back to fix zone
        if (child && child.dataset.fix !== box.dataset.expect) {
          box.removeChild(child);
          fixZone.appendChild(child);
        }
        // Disable dragging for correct matches
        if (child && child.dataset.fix === box.dataset.expect) {
          child.draggable = false;
        }
        // Clear visual indicators from boxes
        box.classList.remove('match-wrong');
      });
  
      document.getElementById('feedback').textContent = '';
      submitBtn.classList.remove('d-none');
      resetBtn.classList.add('d-none');
      updateAttemptsDisplay();
      
      if (attemptsRemaining === 0) {
        // No more attempts, show next challenge button
        resetBtn.classList.add('d-none');
        
        const nextLink = document.createElement('a');
        nextLink.href = '/challenge3';
        nextLink.className = 'btn btn-next fw-bold';
        nextLink.textContent = 'Next Challenge';
        
        // Replace the reset button
        const buttonContainer = document.querySelector('.text-center.mt-2');
        if (buttonContainer) {
          buttonContainer.appendChild(nextLink);
        }
        
        const msgEl = document.getElementById('feedback');
        msgEl.innerHTML = 'No more attempts left. Don\'t worry - you can still continue to the next challenge!';
        msgEl.className = 'text-warning fw-bold text-center';
      }
    });
  
    // Replace updateAttemptsDisplay with this simpler function
    function updateAttemptsDisplay(decrementFirst = true) {
      // Create or get attempts display element
      if (!document.getElementById('attempts-counter')) {
        const attemptsCounter = document.createElement('div');
        attemptsCounter.id = 'attempts-counter';
        attemptsCounter.className = 'attempts-counter';
        attemptsCounter.innerHTML = '<span class="attempts-label">Attempts remaining:</span><span id="attempts-circles"></span>';
        
        // Insert after title
        const title = document.querySelector('#game-area h3');
        title.after(attemptsCounter);
      }
      
      // Only decrement if specified
      if (decrementFirst) {
        attemptsRemaining = Math.max(attemptsRemaining - 1, 0);
      }
      
      // Update the circles display
      const circlesDisplay = document.getElementById('attempts-circles');
      let html = '';
      for (let i = 0; i < 5; i++) {
        html += `<span class="attempt-circle${i >= attemptsRemaining ? ' used' : ''}"></span>`;
      }
      circlesDisplay.innerHTML = html;
    }
  
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function showFixedWebsite() {
      // Create a copy of the original website but with fixes
      const fixedSiteContainer = document.createElement('div');
      fixedSiteContainer.id = 'fixed-site-wrapper';
      fixedSiteContainer.className = 'mt-4 mb-4';
      
      // Add a header to explain what they're seeing
      const fixedHeader = document.createElement('div');
      fixedHeader.className = 'alert alert-success';
      fixedHeader.innerHTML = '<h4 class="alert-heading">🎉 Secure Website Created!</h4>' +
                               '<p>Here\'s how WackyHacky looks after your security fixes:</p>';
      fixedSiteContainer.appendChild(fixedHeader);
      
      // Clone the original fake site as a starting point
      const fixedSite = fakeSiteWrapper.querySelector('.card').cloneNode(true);
      
      // Define tooltip content for each fix
      const fixDescriptions = {
        'https': 'HTTPS provides encrypted connections, preventing attackers from seeing sensitive data.',
        'password': 'Strong passwords are much harder for hackers to guess or crack.',
        'image': 'Proper image handling prevents confusion and improves user experience.',
        'upload': 'Restricting file types prevents hackers from uploading malicious code.',
        'admin': 'Hidden admin panels reduce the attack surface by limiting discovery.'
      };
      
      // Apply fixes to the cloned site
      const urlBar = fixedSite.querySelector('#url-bar');
      if (urlBar) {
        urlBar.src = urlBar.src.replace('wacky-hacky-url.png', 'wacky-hacky-safe-url.png');
        urlBar.classList.add('security-fixed');
        urlBar.dataset.fixType = 'https';
      }

      const passwordField = fixedSite.querySelector('input[value="1234"]');
      if (passwordField) {
        passwordField.value = '••••••••••••••';
        passwordField.title = 'Strong password!';
        passwordField.classList.add('security-fixed');
        passwordField.dataset.fixType = 'password';
      }

      const brokenImage = fixedSite.querySelector('img[src*="broken-image.png"]');
      if (brokenImage) {
        brokenImage.src = brokenImage.src.replace('broken-image.png', 'super-gadget.png');
        brokenImage.classList.add('security-fixed');
        brokenImage.dataset.fixType = 'image';
      }

      const uploadStatus = fixedSite.querySelector('#upload-status');
      if (uploadStatus) {
        uploadStatus.src = uploadStatus.src.replace('upload-anything.png', 'upload-pictures-only.png');
        uploadStatus.classList.add('security-fixed');
        uploadStatus.dataset.fixType = 'upload';
      }

      const adminLink = fixedSite.querySelector('#admin-link');
      if (adminLink) {
        adminLink.className = 'btn btn-secondary btn-sm fw-bold ms-0 ms-md-2';
        adminLink.innerHTML = '<i class="fas fa-lock"></i> Secured Admin';
        adminLink.style.pointerEvents = 'none';
        adminLink.classList.add('security-fixed');
        adminLink.dataset.fixType = 'admin';
      }

      // Add styles for enhanced glowing effect
      const fixedStyle = document.createElement('style');
      fixedStyle.textContent = `
        .security-fixed {
          box-shadow: 0 0 12px #28a745;
          border: 2px solid #28a745;
          border-radius: 4px;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        .security-fixed::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: rgba(40, 167, 69, 0.15);
          border-radius: 8px;
          z-index: -1;
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0% { opacity: 0.6; }
          50% { opacity: 0.9; }
          100% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(fixedStyle);

      fixedSiteContainer.appendChild(fixedSite);
      gameArea.appendChild(fixedSiteContainer);

      // Hide "Secure Wacky Hacky" title and attempts counter
      const title = document.querySelector('#game-area h3.text-primary');
      const attemptsCounter = document.getElementById('attempts-counter');
      if (title) title.style.display = 'none';
      if (attemptsCounter) attemptsCounter.style.display = 'none';

      // Apply tooltips to all fixed elements
      fixedSite.querySelectorAll('.security-fixed').forEach(el => {
        const fixType = el.dataset.fixType;
        if (fixType && fixDescriptions[fixType]) {
          tippy(el, {
            content: `<strong>Security Fix:</strong> ${fixDescriptions[fixType]}`,
            allowHTML: true,
            theme: 'light-border',
            animation: 'shift-away',
            placement: 'top',
            trigger: 'mouseenter focus', // Show on hover or focus
            interactive: true,
            appendTo: document.body,
            maxWidth: 250,
            size: 'small',
            onShow(instance) {
              el.style.boxShadow = '0 0 20px #28a745';
            },
            onHide(instance) {
              el.style.boxShadow = '0 0 12px #28a745';
            }
          });
        }
      });
    }
  });
  
  /* CSS feedback classes (add to style.css):
  .match-correct { border-color: #28a745 !important; }
  .match-wrong   { border-color: #dc3545 !important; } */

