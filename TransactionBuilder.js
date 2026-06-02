/**
 * TransactionBuilder - Main transaction building interface with history and draft support
 */
class TransactionBuilder {
  constructor() {
    this.history = new TransactionHistory(50);
    this.draftManager = new DraftManager(20);
    this.transaction = this.createEmptyTransaction();
    this.listeners = [];
    
    // Save initial state
    this.history.pushState(this.transaction);
  }

  /**
   * Create an empty transaction
   * @returns {Object}
   */
  createEmptyTransaction() {
    return {
      id: null,
      type: '',
      amount: 0,
      currency: 'USD',
      from: '',
      to: '',
      description: '',
      metadata: {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Set transaction type
   * @param {string} type - Transaction type
   */
  setType(type) {
    this.transaction.type = type;
    this.history.pushState(this.transaction);
    this.notifyListeners('type_changed', type);
  }

  /**
   * Set transaction amount
   * @param {number} amount - Transaction amount
   */
  setAmount(amount) {
    this.transaction.amount = parseFloat(amount) || 0;
    this.history.pushState(this.transaction);
    this.notifyListeners('amount_changed', amount);
  }

  /**
   * Set transaction currency
   * @param {string} currency - Currency code
   */
  setCurrency(currency) {
    this.transaction.currency = currency;
    this.history.pushState(this.transaction);
    this.notifyListeners('currency_changed', currency);
  }

  /**
   * Set sender
   * @param {string} from - Sender identifier
   */
  setFrom(from) {
    this.transaction.from = from;
    this.history.pushState(this.transaction);
    this.notifyListeners('from_changed', from);
  }

  /**
   * Set recipient
   * @param {string} to - Recipient identifier
   */
  setTo(to) {
    this.transaction.to = to;
    this.history.pushState(this.transaction);
    this.notifyListeners('to_changed', to);
  }

  /**
   * Set description
   * @param {string} description - Transaction description
   */
  setDescription(description) {
    this.transaction.description = description;
    this.history.pushState(this.transaction);
    this.notifyListeners('description_changed', description);
  }

  /**
   * Set metadata field
   * @param {string} key - Metadata key
   * @param {*} value - Metadata value
   */
  setMetadata(key, value) {
    this.transaction.metadata[key] = value;
    this.history.pushState(this.transaction);
    this.notifyListeners('metadata_changed', { key, value });
  }

  /**
   * Undo last action
   * @returns {boolean} Success status
   */
  undo() {
    const previousState = this.history.undo();
    if (previousState) {
      this.transaction = previousState;
      this.notifyListeners('undo', previousState);
      return true;
    }
    return false;
  }

  /**
   * Redo last undone action
   * @returns {boolean} Success status
   */
  redo() {
    const nextState = this.history.redo();
    if (nextState) {
      this.transaction = nextState;
      this.notifyListeners('redo', nextState);
      return true;
    }
    return false;
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return this.history.canUndo();
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.history.canRedo();
  }

  /**
   * Get current transaction
   * @returns {Object}
   */
  getTransaction() {
    return JSON.parse(JSON.stringify(this.transaction));
  }

  /**
   * Load transaction (replaces current)
   * @param {Object} transaction - Transaction to load
   */
  loadTransaction(transaction) {
    this.transaction = JSON.parse(JSON.stringify(transaction));
    this.history.clear();
    this.history.pushState(this.transaction);
    this.notifyListeners('transaction_loaded', transaction);
  }

  /**
   * Reset transaction to empty state
   */
  reset() {
    this.transaction = this.createEmptyTransaction();
    this.history.clear();
    this.history.pushState(this.transaction);
    this.notifyListeners('reset', this.transaction);
  }

  /**
   * Save current transaction as draft
   * @param {string} name - Draft name
   * @returns {Object} Saved draft
   */
  saveDraft(name) {
    const draft = this.draftManager.saveDraft(
      name,
      this.transaction,
      this.history.export()
    );
    this.notifyListeners('draft_saved', draft);
    return draft;
  }

  /**
   * Load draft by ID
   * @param {string} id - Draft ID
   * @returns {boolean} Success status
   */
  loadDraft(id) {
    const draft = this.draftManager.loadDraft(id);
    if (draft) {
      this.transaction = draft.transaction;
      if (draft.history) {
        this.history.import(draft.history);
      } else {
        this.history.clear();
        this.history.pushState(this.transaction);
      }
      this.notifyListeners('draft_loaded', draft);
      return true;
    }
    return false;
  }

  /**
   * Get all drafts
   * @returns {Array}
   */
  getAllDrafts() {
    return this.draftManager.getAllDrafts();
  }

  /**
   * Delete draft by ID
   * @param {string} id - Draft ID
   * @returns {boolean} Success status
   */
  deleteDraft(id) {
    const success = this.draftManager.deleteDraft(id);
    if (success) {
      this.notifyListeners('draft_deleted', id);
    }
    return success;
  }

  /**
   * Get builder statistics
   * @returns {Object}
   */
  getStats() {
    return {
      history: this.history.getStats(),
      drafts: this.draftManager.getStats()
    };
  }

  /**
   * Add event listener
   * @param {Function} callback - Listener callback
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove event listener
   * @param {Function} callback - Listener callback
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners
   * @param {string} event - Event type
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data, this.getTransaction());
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Validate current transaction
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    
    if (!this.transaction.type) {
      errors.push('Transaction type is required');
    }
    
    if (this.transaction.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (!this.transaction.from) {
      errors.push('Sender is required');
    }
    
    if (!this.transaction.to) {
      errors.push('Recipient is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransactionBuilder;
}
