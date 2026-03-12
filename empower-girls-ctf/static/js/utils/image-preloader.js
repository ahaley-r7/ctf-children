/**
 * Image Preloader Utility
 * Preloads images before showing challenge content to prevent loading errors
 */

class ImagePreloader {
  constructor() {
    this.loadedImages = new Set();
    this.failedImages = new Set();
  }

  /**
   * Preload a single image
   * @param {string} src - Image source URL
   * @returns {Promise} - Resolves when image loads or rejects on error
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      // Skip if already loaded
      if (this.loadedImages.has(src)) {
        resolve(src);
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(src);
        resolve(src);
      };
      
      img.onerror = () => {
        this.failedImages.add(src);
        console.warn(`Failed to preload image: ${src}`);
        // Resolve anyway to not block the UI
        resolve(src);
      };
      
      img.src = src;
    });
  }

  /**
   * Preload multiple images
   * @param {Array<string>} imageSources - Array of image URLs
   * @returns {Promise} - Resolves when all images are loaded or attempted
   */
  preloadImages(imageSources) {
    const promises = imageSources.map(src => this.preloadImage(src));
    return Promise.all(promises);
  }

  /**
   * Extract image sources from a container element
   * @param {HTMLElement} container - Container to search for images
   * @returns {Array<string>} - Array of image URLs
   */
  extractImageSources(container) {
    const images = container.querySelectorAll('img');
    const sources = [];
    
    images.forEach(img => {
      if (img.src) {
        sources.push(img.src);
      }
      // Also check data-src for lazy loading
      if (img.dataset.src) {
        sources.push(img.dataset.src);
      }
    });
    
    // Also check for background images in CSS
    const elementsWithBg = container.querySelectorAll('[style*="background-image"]');
    elementsWithBg.forEach(el => {
      const style = el.style.backgroundImage;
      const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match && match[1]) {
        sources.push(match[1]);
      }
    });
    
    return sources;
  }

  /**
   * Preload images from a hidden container before showing it
   * @param {HTMLElement} container - Container with images to preload
   * @param {Function} onProgress - Optional callback for progress updates
   * @returns {Promise} - Resolves when all images are loaded
   */
  async preloadFromContainer(container, onProgress = null) {
    const sources = this.extractImageSources(container);
    
    if (sources.length === 0) {
      return Promise.resolve();
    }
    
    let loaded = 0;
    const total = sources.length;
    
    const promises = sources.map(async (src) => {
      await this.preloadImage(src);
      loaded++;
      if (onProgress) {
        onProgress(loaded, total);
      }
    });
    
    return Promise.all(promises);
  }

  /**
   * Get loading statistics
   * @returns {Object} - Object with loaded and failed counts
   */
  getStats() {
    return {
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
      total: this.loadedImages.size + this.failedImages.size
    };
  }
}

// Create global instance
window.imagePreloader = new ImagePreloader();
