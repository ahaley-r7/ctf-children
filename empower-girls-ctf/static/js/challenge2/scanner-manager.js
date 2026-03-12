// challenge2-scanner-manager.js – Scanner Manager for Interactive Security Scanner Challenge
// Manages the draggable scanner, scan trail effects, and collision detection

/**
 * Manages the draggable scanner, scan trail effects, and collision detection with vulnerable areas
 */
class ScannerManager {
  constructor(scannerElement, vulnerabilityAreas, onVulnerabilityClick, vulnerabilityManager) {
    this.scannerElement = scannerElement;
    this.vulnerabilityAreas = vulnerabilityAreas || [];
    this.isDragging = false;
    this.lastTrailTime = 0;
    this.trailDelay = 50; // Create trail every 50ms
    this.drake = null; // Dragula instance
    this.onVulnerabilityClick = onVulnerabilityClick; // Callback for vulnerability discovery
    this.clickedVulnerabilities = new Set(); // Track clicked vulnerabilities
    this.vulnerabilityManager = vulnerabilityManager; // Reference to vulnerability manager for severity colors
    this.cursorFollower = null; // Cursor follower element
    
    this.positionScannerInCenter();
    this.initializeDragula();
    this.enableKeyboardNavigation();
    this.attachClickHandlers();
    this.createCursorFollower();
  }

  /**
   * Create a pulsing cursor follower that tracks mouse movement
   */
  createCursorFollower() {
    // Create first cursor follower ring
    this.cursorFollower = document.createElement('div');
    this.cursorFollower.className = 'cursor-follower';
    this.cursorFollower.style.cssText = `
      position: fixed;
      width: 60px;
      height: 60px;
      border: 3px solid rgba(255, 98, 0, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      display: none;
    `;
    document.body.appendChild(this.cursorFollower);

    // Create second cursor follower ring (delayed pulse)
    this.cursorFollower2 = document.createElement('div');
    this.cursorFollower2.className = 'cursor-follower-2';
    this.cursorFollower2.style.cssText = `
      position: fixed;
      width: 60px;
      height: 60px;
      border: 3px solid rgba(255, 98, 0, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      display: none;
    `;
    document.body.appendChild(this.cursorFollower2);

    // Add pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cursor-pulse {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 1;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.3);
          opacity: 0.5;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.6);
          opacity: 0;
        }
      }
      @keyframes cursor-pulse-delayed {
        0% {
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0.8;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.3);
          opacity: 0.4;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.6);
          opacity: 0;
        }
      }
      .cursor-follower {
        animation: cursor-pulse 2s ease-out infinite;
      }
      .cursor-follower-2 {
        animation: cursor-pulse-delayed 2s ease-out infinite;
        animation-delay: 0.3s;
      }
    `;
    document.head.appendChild(style);

    // Track mouse movement over fake-site-wrapper
    const fakeSiteWrapper = document.getElementById('fake-site-wrapper');
    if (fakeSiteWrapper) {
      fakeSiteWrapper.addEventListener('mouseenter', () => {
        this.cursorFollower.style.display = 'block';
        this.cursorFollower2.style.display = 'block';
      });

      fakeSiteWrapper.addEventListener('mouseleave', () => {
        this.cursorFollower.style.display = 'none';
        this.cursorFollower2.style.display = 'none';
      });

      fakeSiteWrapper.addEventListener('mousemove', (e) => {
        this.cursorFollower.style.left = `${e.clientX}px`;
        this.cursorFollower.style.top = `${e.clientY}px`;
        this.cursorFollower2.style.left = `${e.clientX}px`;
        this.cursorFollower2.style.top = `${e.clientY}px`;
      });
    }
  }

  /**
   * Position scanner - no longer needed since scanner is removed
   */
  positionScannerInCenter() {
    // Scanner element removed - using cursor follower only
    console.log('Scanner element removed - using cursor follower pulses');
  }

  /**
   * Initialize scanner - no longer needed since scanner is removed
   */
  initializeDragula() {
    // Scanner is removed - just using cursor follower and direct clicks
    console.log('Scanner initialized in cursor-only mode');
  }

  /**
   * Constrain scanner element to viewport bounds
   */
  constrainToViewport(el) {
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = parseFloat(el.style.left) || rect.left;
    let top = parseFloat(el.style.top) || rect.top;
    
    // Calculate bounds (accounting for transform: translate(-50%, -50%))
    const minLeft = rect.width / 2;
    const maxLeft = viewportWidth - rect.width / 2;
    const minTop = rect.height / 2;
    const maxTop = viewportHeight - rect.height / 2;
    
    // Constrain position
    left = Math.max(minLeft, Math.min(maxLeft, left));
    top = Math.max(minTop, Math.min(maxTop, top));
    
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  /**
   * Fallback dragging - disabled
   */
  initializeFallbackDragging() {
    // Fallback dragging disabled - using direct clicks instead
  }

  /**
   * Create a fading trail effect behind the scanner
   */
  createTrailEffect(x, y) {
    const trail = document.createElement('div');
    trail.className = 'scan-trail';
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    trail.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(trail);

    // Remove trail after animation completes (1.5s fade duration)
    setTimeout(() => {
      trail.remove();
    }, 1500);
  }

  /**
   * Check for collisions - disabled since we're using direct clicks
   */
  checkCollisions() {
    // Collision detection disabled - using direct clicks instead
  }

  /**
   * Get current scanner position - returns center of viewport since scanner is removed
   */
  getCurrentPosition() {
    // Return center of viewport since scanner element is removed
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  /**
   * Move scanner to specific position - no longer needed since scanner is removed
   */
  moveTo(x, y) {
    // Scanner element removed - no movement needed
    console.log('Scanner movement disabled - using cursor follower only');
  }

  /**
   * Enable keyboard navigation - no longer needed since scanner is removed
   */
  enableKeyboardNavigation() {
    // Keyboard navigation disabled - using cursor follower and direct clicks
    console.log('Keyboard navigation disabled - using direct clicks');
  }

  /**
   * Attach click handlers to all vulnerable areas
   * Allows direct clicking on vulnerable areas without requiring scanner overlap
   * Prevents multiple clicks on same vulnerability (one attempt only)
   */
  attachClickHandlers() {
    this.vulnerabilityAreas.forEach(area => {
      const areaElement = document.querySelector(area.selector);
      if (!areaElement) {
        console.warn(`Vulnerable area not found: ${area.selector}`);
        return;
      }

      // Extract vulnerability ID from data attribute
      const vulnerabilityId = areaElement.getAttribute('data-vulnerable');
      if (!vulnerabilityId) {
        console.warn(`No data-vulnerable attribute found for: ${area.selector}`);
        return;
      }

      // Attach click event listener - only one attempt allowed
      areaElement.addEventListener('click', (e) => {
        // Check if already discovered (correct answer)
        if (this.vulnerabilityManager && this.vulnerabilityManager.isDiscovered(vulnerabilityId)) {
          console.log(`Vulnerability ${vulnerabilityId} already discovered`);
          // Show tooltip if tippy is available
          if (window.tippy && !areaElement._tippy) {
            window.tippy(areaElement, {
              content: 'Vulnerability already discovered',
              trigger: 'mouseenter',
              placement: 'top',
              theme: 'light-border'
            });
            // Trigger the tooltip to show immediately
            areaElement._tippy.show();
          }
          return;
        }

        // Check if already attempted (one attempt only)
        if (this.clickedVulnerabilities.has(vulnerabilityId)) {
          console.log(`Vulnerability ${vulnerabilityId} already attempted`);
          return;
        }

        // Mark as clicked (attempted) - do this BEFORE callback
        this.clickedVulnerabilities.add(vulnerabilityId);
        console.log(`Vulnerability ${vulnerabilityId} clicked - starting discovery flow`);

        // Trigger vulnerability discovery flow callback
        if (this.onVulnerabilityClick) {
          this.onVulnerabilityClick(vulnerabilityId, areaElement);
        }
      });

      // Add cursor pointer to indicate clickable
      areaElement.style.cursor = 'pointer';
      
      // Add tooltip for discovered vulnerabilities on hover
      areaElement.addEventListener('mouseenter', () => {
        // Check if discovered and add tooltip
        if (this.vulnerabilityManager && this.vulnerabilityManager.isDiscovered(vulnerabilityId)) {
          if (window.tippy && !areaElement._tippy) {
            window.tippy(areaElement, {
              content: 'Vulnerability already discovered',
              trigger: 'mouseenter',
              placement: 'top',
              theme: 'light-border'
            });
          }
        } else if (!this.clickedVulnerabilities.has(vulnerabilityId)) {
          areaElement.style.opacity = '0.8';
        }
      });

      areaElement.addEventListener('mouseleave', () => {
        areaElement.style.opacity = '1';
      });
    });
  }

  /**
   * Reset clicked vulnerabilities (for testing/restart)
   */
  resetClickedVulnerabilities() {
    this.clickedVulnerabilities.clear();
    
    // Remove discovered class from all areas
    this.vulnerabilityAreas.forEach(area => {
      const areaElement = document.querySelector(area.selector);
      if (areaElement) {
        areaElement.classList.remove('vulnerability-discovered');
      }
    });
  }
}
