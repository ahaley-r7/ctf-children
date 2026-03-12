/**
 * ChatInterface - Manages chat message display and interactions
 */
class ChatInterface {
  constructor(messagesContainer, initialLevel) {
    this.messagesContainer = messagesContainer;
    this.currentLevel = initialLevel;
  }

  /**
   * Add a message to the chat
   * @param {string} text - Message text
   * @param {string} sender - 'user' or 'cipher'
   */
  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = this.getCurrentTime();
    
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(time);
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.classList.remove('d-none');
      this.scrollToBottom();
    }
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.classList.add('d-none');
    }
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    // Keep only the initial greeting
    const messages = this.messagesContainer.querySelectorAll('.message');
    messages.forEach((msg, index) => {
      if (index > 0) { // Keep first message
        msg.remove();
      }
    });
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Get current time formatted
   * @returns {string} Formatted time
   */
  getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
}
