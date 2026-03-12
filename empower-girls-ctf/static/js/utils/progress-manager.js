class ProgressManager {
  constructor(challengeId) {
    this.challengeId = challengeId;
    this.progressKey = `challenge_${challengeId}_progress`;
  }

  saveProgress(progressData) {
    localStorage.setItem(this.progressKey, JSON.stringify(progressData));
  }

  loadProgress() {
    const data = localStorage.getItem(this.progressKey);
    return data ? JSON.parse(data) : null;
  }

  clearProgress() {
    localStorage.removeItem(this.progressKey);
  }

  hasProgress() {
    return localStorage.getItem(this.progressKey) !== null;
  }
}
