/**
 * DraftManager - Manages transaction drafts with localStorage persistence
 * Supports up to 20 drafts with metadata
 */
class DraftManager {
  constructor(maxDrafts = 20, storageKey = 'transaction_drafts') {
    this.maxDrafts = maxDrafts;
    this.storageKey = storageKey;
    this.drafts = this.loadDraftsFromStorage();
  }

  /**
   * Save a draft transaction
   * @param {string} name - Draft name
   * @param {Object} transaction - Transaction data
   * @param {Object} history - Optional history data
   * @returns {Object} Saved draft with metadata
   */
  saveDraft(name, transaction, history = null) {
    const draft = {
      id: this.generateId(),
      name: name.trim(),
      transaction: JSON.parse(JSON.stringify(transaction)),
      history: history,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if draft with same name exists
    const existingIndex = this.drafts.findIndex(d => d.name === draft.name);
    
    if (existingIndex !== -1) {
      // Update existing draft
      draft.id = this.drafts[existingIndex].id;
      draft.createdAt = this.drafts[existingIndex].createdAt;
      this.drafts[existingIndex] = draft;
    } else {
      // Add new draft
      this.drafts.unshift(draft);
      
      // Maintain max drafts limit
      if (this.drafts.length > this.maxDrafts) {
        this.drafts = this.drafts.slice(0, this.maxDrafts);
      }
    }

    this.saveDraftsToStorage();
    return draft;
  }

  /**
   * Load a draft by ID
   * @param {string} id - Draft ID
   * @returns {Object|null} Draft data or null if not found
   */
  loadDraft(id) {
    const draft = this.drafts.find(d => d.id === id);
    return draft ? JSON.parse(JSON.stringify(draft)) : null;
  }

  /**
   * Load a draft by name
   * @param {string} name - Draft name
   * @returns {Object|null} Draft data or null if not found
   */
  loadDraftByName(name) {
    const draft = this.drafts.find(d => d.name === name);
    return draft ? JSON.parse(JSON.stringify(draft)) : null;
  }

  /**
   * Get all drafts
   * @returns {Array} List of all drafts
   */
  getAllDrafts() {
    return JSON.parse(JSON.stringify(this.drafts));
  }

  /**
   * Delete a draft by ID
   * @param {string} id - Draft ID
   * @returns {boolean} Success status
   */
  deleteDraft(id) {
    const initialLength = this.drafts.length;
    this.drafts = this.drafts.filter(d => d.id !== id);
    
    if (this.drafts.length < initialLength) {
      this.saveDraftsToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * Delete all drafts
   */
  deleteAllDrafts() {
    this.drafts = [];
    this.saveDraftsToStorage();
  }

  /**
   * Get draft count
   * @returns {number}
   */
  getDraftCount() {
    return this.drafts.length;
  }

  /**
   * Check if storage limit reached
   * @returns {boolean}
   */
  isStorageFull() {
    return this.drafts.length >= this.maxDrafts;
  }

  /**
   * Generate unique ID
   * @returns {string}
   */
  generateId() {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save drafts to localStorage
   */
  saveDraftsToStorage() {
    try {
      const data = {
        drafts: this.drafts,
        version: '1.0',
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save drafts to localStorage:', error);
      return false;
    }
  }

  /**
   * Load drafts from localStorage
   * @returns {Array} Loaded drafts or empty array
   */
  loadDraftsFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }
      
      const data = JSON.parse(stored);
      return Array.isArray(data.drafts) ? data.drafts : [];
    } catch (error) {
      console.error('Failed to load drafts from localStorage:', error);
      return [];
    }
  }

  /**
   * Export drafts as JSON
   * @returns {string} JSON string of all drafts
   */
  exportDrafts() {
    return JSON.stringify({
      drafts: this.drafts,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Import drafts from JSON
   * @param {string} jsonString - JSON string of drafts
   * @returns {boolean} Success status
   */
  importDrafts(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.drafts)) {
        this.drafts = data.drafts.slice(0, this.maxDrafts);
        this.saveDraftsToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import drafts:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   * @returns {Object}
   */
  getStats() {
    return {
      draftCount: this.drafts.length,
      maxDrafts: this.maxDrafts,
      remainingSlots: this.maxDrafts - this.drafts.length,
      isFull: this.isStorageFull()
    };
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DraftManager;
}
