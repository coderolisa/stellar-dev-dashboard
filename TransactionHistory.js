/**
 * TransactionHistory - Manages undo/redo stack for transaction building
 * Maintains last 50 transaction states with full undo/redo capability
 */
class TransactionHistory {
  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = null;
  }

  /**
   * Save current state and push to undo stack
   * @param {Object} state - Transaction state to save
   */
  pushState(state) {
    // Deep clone to prevent reference issues
    const clonedState = JSON.parse(JSON.stringify(state));
    
    if (this.currentState !== null) {
      this.undoStack.push(this.currentState);
      
      // Maintain max history limit
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }
    }
    
    this.currentState = clonedState;
    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  /**
   * Undo last action
   * @returns {Object|null} Previous state or null if nothing to undo
   */
  undo() {
    if (!this.canUndo()) {
      return null;
    }

    this.redoStack.push(this.currentState);
    this.currentState = this.undoStack.pop();
    
    return JSON.parse(JSON.stringify(this.currentState));
  }

  /**
   * Redo last undone action
   * @returns {Object|null} Next state or null if nothing to redo
   */
  redo() {
    if (!this.canRedo()) {
      return null;
    }

    this.undoStack.push(this.currentState);
    this.currentState = this.redoStack.pop();
    
    return JSON.parse(JSON.stringify(this.currentState));
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Get current state
   * @returns {Object|null}
   */
  getCurrentState() {
    return this.currentState ? JSON.parse(JSON.stringify(this.currentState)) : null;
  }

  /**
   * Get history stats
   * @returns {Object}
   */
  getStats() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      maxHistory: this.maxHistory
    };
  }

  /**
   * Clear all history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = null;
  }

  /**
   * Export history for persistence
   * @returns {Object}
   */
  export() {
    return {
      undoStack: this.undoStack,
      redoStack: this.redoStack,
      currentState: this.currentState,
      maxHistory: this.maxHistory
    };
  }

  /**
   * Import history from persistence
   * @param {Object} data - Exported history data
   */
  import(data) {
    this.undoStack = data.undoStack || [];
    this.redoStack = data.redoStack || [];
    this.currentState = data.currentState || null;
    this.maxHistory = data.maxHistory || 50;
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransactionHistory;
}
