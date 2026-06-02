/**
 * Comprehensive Test Suite for Transaction Builder
 */

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('Starting test suite...\n');
        
        for (const test of this.tests) {
            try {
                await test.fn();
                this.results.push({ name: test.name, pass: true });
                console.log(`✓ ${test.name}`);
            } catch (error) {
                this.results.push({ name: test.name, pass: false, error: error.message });
                console.error(`✗ ${test.name}: ${error.message}`);
            }
        }

        this.displayResults();
    }

    displayResults() {
        const passed = this.results.filter(r => r.pass).length;
        const failed = this.results.filter(r => !r.pass).length;
        
        const resultsDiv = document.getElementById('testResults');
        
        let html = '<div class="test-suite">';
        
        this.results.forEach(result => {
            html += `<div class="test-case ${result.pass ? 'pass' : 'fail'}">
                ${result.pass ? '✓' : '✗'} ${result.name}
                ${result.error ? `<br><small style="color: #666;">Error: ${result.error}</small>` : ''}
            </div>`;
        });
        
        html += '</div>';
        html += `<div class="summary ${failed === 0 ? 'pass' : 'fail'}">
            Total: ${this.results.length} | Passed: ${passed} | Failed: ${failed}
        </div>`;
        
        resultsDiv.innerHTML = html;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message || 'Values not equal'}: expected ${expected}, got ${actual}`);
    }
}

// Initialize test runner
const runner = new TestRunner();

// ========== TransactionHistory Tests ==========

runner.test('TransactionHistory: Push and undo single state', () => {
    const history = new TransactionHistory();
    const state1 = { amount: 100 };
    const state2 = { amount: 200 };
    
    history.pushState(state1);
    history.pushState(state2);
    
    const undone = history.undo();
    assertEqual(undone.amount, 100, 'Undo should return previous state');
    assert(history.canUndo() === false, 'Should not be able to undo further');
});

runner.test('TransactionHistory: Redo after undo', () => {
    const history = new TransactionHistory();
    history.pushState({ amount: 100 });
    history.pushState({ amount: 200 });
    
    history.undo();
    const redone = history.redo();
    
    assertEqual(redone.amount, 200, 'Redo should return next state');
});

runner.test('TransactionHistory: Maintain max history limit (50)', () => {
    const history = new TransactionHistory(50);
    
    // Push 60 states
    for (let i = 0; i < 60; i++) {
        history.pushState({ step: i });
    }
    
    const stats = history.getStats();
    assert(stats.undoCount <= 50, 'Should not exceed max history');
});

runner.test('TransactionHistory: Clear redo stack on new action', () => {
    const history = new TransactionHistory();
    history.pushState({ amount: 100 });
    history.pushState({ amount: 200 });
    history.undo();
    
    assert(history.canRedo(), 'Should be able to redo');
    
    history.pushState({ amount: 300 });
    assert(!history.canRedo(), 'Redo stack should be cleared');
});

runner.test('TransactionHistory: Export and import', () => {
    const history = new TransactionHistory();
    history.pushState({ amount: 100 });
    history.pushState({ amount: 200 });
    
    const exported = history.export();
    
    const newHistory = new TransactionHistory();
    newHistory.import(exported);
    
    assertEqual(newHistory.getCurrentState().amount, 200, 'Import should restore state');
});

// ========== DraftManager Tests ==========

runner.test('DraftManager: Save and load draft', () => {
    localStorage.clear();
    const manager = new DraftManager();
    
    const transaction = { amount: 500, type: 'payment' };
    const saved = manager.saveDraft('Test Draft', transaction);
    
    assert(saved.name === 'Test Draft', 'Draft should be saved with correct name');
    
    const loaded = manager.loadDraft(saved.id);
    assertEqual(loaded.transaction.amount, 500, 'Loaded draft should match saved');
});

runner.test('DraftManager: Update existing draft by name', () => {
    localStorage.clear();
    const manager = new DraftManager();
    
    manager.saveDraft('My Draft', { amount: 100 });
    manager.saveDraft('My Draft', { amount: 200 });
    
    assertEqual(manager.getDraftCount(), 1, 'Should have only one draft');
    
    const draft = manager.loadDraftByName('My Draft');
    assertEqual(draft.transaction.amount, 200, 'Draft should be updated');
});

runner.test('DraftManager: Maintain max drafts limit (20)', () => {
    localStorage.clear();
    const manager = new DraftManager(20);
    
    // Save 25 drafts
    for (let i = 0; i < 25; i++) {
        manager.saveDraft(`Draft ${i}`, { amount: i });
    }
    
    assertEqual(manager.getDraftCount(), 20, 'Should maintain max limit');
});

runner.test('DraftManager: Delete draft', () => {
    localStorage.clear();
    const manager = new DraftManager();
    
    const saved = manager.saveDraft('Delete Me', { amount: 100 });
    const deleted = manager.deleteDraft(saved.id);
    
    assert(deleted, 'Delete should return true');
    assertEqual(manager.getDraftCount(), 0, 'Draft count should be zero');
});

runner.test('DraftManager: Persist to localStorage', () => {
    localStorage.clear();
    const manager1 = new DraftManager();
    manager1.saveDraft('Persistent', { amount: 999 });
    
    // Create new instance - should load from storage
    const manager2 = new DraftManager();
    const draft = manager2.loadDraftByName('Persistent');
    
    assertEqual(draft.transaction.amount, 999, 'Should persist across instances');
});

// ========== TransactionBuilder Tests ==========

runner.test('TransactionBuilder: Set transaction fields', () => {
    const builder = new TransactionBuilder();
    
    builder.setType('payment');
    builder.setAmount(100);
    builder.setFrom('Alice');
    builder.setTo('Bob');
    
    const transaction = builder.getTransaction();
    
    assertEqual(transaction.type, 'payment', 'Type should be set');
    assertEqual(transaction.amount, 100, 'Amount should be set');
    assertEqual(transaction.from, 'Alice', 'From should be set');
    assertEqual(transaction.to, 'Bob', 'To should be set');
});

runner.test('TransactionBuilder: Undo/redo integration', () => {
    const builder = new TransactionBuilder();
    
    builder.setAmount(100);
    builder.setAmount(200);
    builder.setAmount(300);
    
    assert(builder.canUndo(), 'Should be able to undo');
    
    builder.undo();
    assertEqual(builder.getTransaction().amount, 200, 'Undo should work');
    
    builder.redo();
    assertEqual(builder.getTransaction().amount, 300, 'Redo should work');
});

runner.test('TransactionBuilder: Save and load draft with history', () => {
    localStorage.clear();
    const builder = new TransactionBuilder();
    
    builder.setAmount(100);
    builder.setAmount(200);
    builder.setAmount(300);
    
    const saved = builder.saveDraft('Test with History');
    
    builder.reset();
    assertEqual(builder.getTransaction().amount, 0, 'Should be reset');
    
    builder.loadDraft(saved.id);
    assertEqual(builder.getTransaction().amount, 300, 'Should load correct amount');
    assert(builder.canUndo(), 'History should be restored');
});

runner.test('TransactionBuilder: Validation', () => {
    const builder = new TransactionBuilder();
    
    let result = builder.validate();
    assert(!result.valid, 'Empty transaction should be invalid');
    
    builder.setType('payment');
    builder.setAmount(100);
    builder.setFrom('Alice');
    builder.setTo('Bob');
    
    result = builder.validate();
    assert(result.valid, 'Complete transaction should be valid');
});

runner.test('TransactionBuilder: Reset clears history', () => {
    const builder = new TransactionBuilder();
    
    builder.setAmount(100);
    builder.setAmount(200);
    
    builder.reset();
    
    assert(!builder.canUndo(), 'Undo should not be available after reset');
    assertEqual(builder.getTransaction().amount, 0, 'Amount should be reset');
});

runner.test('TransactionBuilder: Event listeners', () => {
    const builder = new TransactionBuilder();
    let eventFired = false;
    
    builder.addListener((event, data) => {
        if (event === 'amount_changed') {
            eventFired = true;
        }
    });
    
    builder.setAmount(100);
    assert(eventFired, 'Event listener should be called');
});

runner.test('TransactionBuilder: Multiple field updates maintain history', () => {
    const builder = new TransactionBuilder();
    
    builder.setType('payment');
    builder.setAmount(100);
    builder.setFrom('Alice');
    
    const stats = builder.getStats();
    assert(stats.history.undoCount >= 3, 'Should track multiple changes');
});

// ========== Integration Tests ==========

runner.test('Integration: Complete workflow', () => {
    localStorage.clear();
    const builder = new TransactionBuilder();
    
    // Build transaction
    builder.setType('transfer');
    builder.setAmount(500);
    builder.setCurrency('USD');
    builder.setFrom('Account-1');
    builder.setTo('Account-2');
    builder.setDescription('Monthly payment');
    
    // Validate
    const validation = builder.validate();
    assert(validation.valid, 'Transaction should be valid');
    
    // Save draft
    builder.saveDraft('Monthly Transfer');
    
    // Reset
    builder.reset();
    
    // Load draft
    const drafts = builder.getAllDrafts();
    assert(drafts.length === 1, 'Should have one draft');
    
    builder.loadDraft(drafts[0].id);
    assertEqual(builder.getTransaction().amount, 500, 'Should restore transaction');
});

// Run all tests
runner.run();
