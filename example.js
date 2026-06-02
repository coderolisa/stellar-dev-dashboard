/**
 * Advanced Usage Examples for Transaction Builder
 * Run this file in Node.js or browser console
 */

// Example 1: Basic Transaction Building
function example1_BasicUsage() {
    console.log('\n=== Example 1: Basic Transaction Building ===');
    
    const builder = new TransactionBuilder();
    
    // Build a transaction step by step
    builder.setType('payment');
    console.log('Step 1: Set type');
    
    builder.setAmount(250.50);
    console.log('Step 2: Set amount');
    
    builder.setFrom('user_12345');
    console.log('Step 3: Set sender');
    
    builder.setTo('merchant_98765');
    console.log('Step 4: Set recipient');
    
    builder.setDescription('Purchase: Premium subscription');
    console.log('Step 5: Set description');
    
    console.log('\nFinal transaction:', builder.getTransaction());
    
    const validation = builder.validate();
    console.log('Validation:', validation.valid ? '✓ Valid' : '✗ Invalid');
}

// Example 2: Undo/Redo Operations
function example2_UndoRedo() {
    console.log('\n=== Example 2: Undo/Redo Operations ===');
    
    const builder = new TransactionBuilder();
    
    builder.setAmount(100);
    console.log('Amount:', builder.getTransaction().amount);
    
    builder.setAmount(200);
    console.log('Amount:', builder.getTransaction().amount);
    
    builder.setAmount(300);
    console.log('Amount:', builder.getTransaction().amount);
    
    // Undo operations
    console.log('\nUndo operations:');
    builder.undo();
    console.log('After 1st undo:', builder.getTransaction().amount);
    
    builder.undo();
    console.log('After 2nd undo:', builder.getTransaction().amount);
    
    // Redo operations
    console.log('\nRedo operations:');
    builder.redo();
    console.log('After 1st redo:', builder.getTransaction().amount);
    
    builder.redo();
    console.log('After 2nd redo:', builder.getTransaction().amount);
    
    // Check availability
    console.log('\nCan undo?', builder.canUndo());
    console.log('Can redo?', builder.canRedo());
}

// Example 3: Draft Management
function example3_DraftManagement() {
    console.log('\n=== Example 3: Draft Management ===');
    
    const builder = new TransactionBuilder();
    
    // Create first transaction
    builder.setType('transfer');
    builder.setAmount(1000);
    builder.setFrom('savings');
    builder.setTo('checking');
    
    const draft1 = builder.saveDraft('Savings Transfer');
    console.log('Draft 1 saved:', draft1.name);
    
    // Create second transaction
    builder.reset();
    builder.setType('payment');
    builder.setAmount(50);
    builder.setFrom('checking');
    builder.setTo('utility_company');
    
    const draft2 = builder.saveDraft('Utility Bill');
    console.log('Draft 2 saved:', draft2.name);
    
    // List all drafts
    const drafts = builder.getAllDrafts();
    console.log('\nAll drafts:', drafts.map(d => d.name));
    
    // Load a draft
    builder.loadDraft(draft1.id);
    console.log('\nLoaded draft:', builder.getTransaction().type);
}

// Example 4: Event Listening
function example4_EventListening() {
    console.log('\n=== Example 4: Event Listening ===');
    
    const builder = new TransactionBuilder();
    
    // Add event listener
    builder.addListener((event, data, transaction) => {
        console.log(`Event: ${event}, Amount: ${transaction.amount}`);
    });
    
    console.log('Performing operations (watch events):');
    builder.setAmount(100);
    builder.setAmount(200);
    builder.undo();
    builder.redo();
}

// Example 5: History Statistics
function example5_Statistics() {
    console.log('\n=== Example 5: History Statistics ===');
    
    const builder = new TransactionBuilder();
    
    // Perform multiple operations
    for (let i = 1; i <= 10; i++) {
        builder.setAmount(i * 10);
    }
    
    const stats = builder.getStats();
    
    console.log('History Stats:');
    console.log('  Undo count:', stats.history.undoCount);
    console.log('  Redo count:', stats.history.redoCount);
    console.log('  Max history:', stats.history.maxHistory);
    
    console.log('\nDraft Stats:');
    console.log('  Draft count:', stats.drafts.draftCount);
    console.log('  Max drafts:', stats.drafts.maxDrafts);
    console.log('  Remaining slots:', stats.drafts.remainingSlots);
}

// Example 6: Complex Workflow
function example6_ComplexWorkflow() {
    console.log('\n=== Example 6: Complex Workflow ===');
    
    const builder = new TransactionBuilder();
    
    // Step 1: Build transaction
    console.log('Building transaction...');
    builder.setType('transfer');
    builder.setAmount(500);
    builder.setCurrency('EUR');
    builder.setFrom('account_001');
    builder.setTo('account_002');
    builder.setDescription('International wire transfer');
    
    // Step 2: Make some changes
    console.log('Updating amount...');
    builder.setAmount(600);
    builder.setAmount(700);
    
    // Step 3: Undo a mistake
    console.log('Undoing last change...');
    builder.undo();
    
    // Step 4: Validate
    const validation = builder.validate();
    console.log('Validation:', validation);
    
    // Step 5: Save as draft
    const draft = builder.saveDraft('Wire Transfer Draft');
    console.log('Draft saved with ID:', draft.id);
    
    // Step 6: Start new transaction
    console.log('Starting new transaction...');
    builder.reset();
    builder.setType('payment');
    builder.setAmount(25);
    
    // Step 7: Load previous draft
    console.log('Loading previous draft...');
    builder.loadDraft(draft.id);
    console.log('Loaded transaction amount:', builder.getTransaction().amount);
}

// Example 7: History Limit Testing
function example7_HistoryLimit() {
    console.log('\n=== Example 7: History Limit Testing (50 steps) ===');
    
    const builder = new TransactionBuilder();
    
    // Push 60 changes (exceeds limit of 50)
    console.log('Pushing 60 changes...');
    for (let i = 1; i <= 60; i++) {
        builder.setAmount(i);
    }
    
    const stats = builder.getStats();
    console.log('Undo count:', stats.history.undoCount);
    console.log('Max maintained:', stats.history.undoCount <= 50 ? '✓' : '✗');
    
    // Undo all available
    let undoCount = 0;
    while (builder.canUndo()) {
        builder.undo();
        undoCount++;
    }
    console.log('Total undos performed:', undoCount);
}

// Example 8: Draft Limit Testing
function example8_DraftLimit() {
    console.log('\n=== Example 8: Draft Limit Testing (20 max) ===');
    
    localStorage.clear();
    const builder = new TransactionBuilder();
    
    // Create 25 drafts (exceeds limit of 20)
    console.log('Creating 25 drafts...');
    for (let i = 1; i <= 25; i++) {
        builder.setAmount(i * 100);
        builder.saveDraft(`Draft ${i}`);
    }
    
    const stats = builder.getStats();
    console.log('Draft count:', stats.drafts.draftCount);
    console.log('Limit maintained:', stats.drafts.draftCount === 20 ? '✓' : '✗');
    
    const drafts = builder.getAllDrafts();
    console.log('Oldest draft:', drafts[drafts.length - 1].name);
    console.log('Newest draft:', drafts[0].name);
}

// Example 9: Validation Scenarios
function example9_Validation() {
    console.log('\n=== Example 9: Validation Scenarios ===');
    
    const builder = new TransactionBuilder();
    
    // Test 1: Empty transaction
    let result = builder.validate();
    console.log('Empty transaction:', result.valid ? '✓ Valid' : '✗ Invalid');
    console.log('Errors:', result.errors);
    
    // Test 2: Partial transaction
    builder.setType('payment');
    builder.setAmount(100);
    result = builder.validate();
    console.log('\nPartial transaction:', result.valid ? '✓ Valid' : '✗ Invalid');
    console.log('Errors:', result.errors);
    
    // Test 3: Complete transaction
    builder.setFrom('Alice');
    builder.setTo('Bob');
    result = builder.validate();
    console.log('\nComplete transaction:', result.valid ? '✓ Valid' : '✗ Invalid');
    console.log('Errors:', result.errors);
    
    // Test 4: Zero amount
    builder.setAmount(0);
    result = builder.validate();
    console.log('\nZero amount:', result.valid ? '✓ Valid' : '✗ Invalid');
    console.log('Errors:', result.errors);
}

// Example 10: Persistence Testing
function example10_Persistence() {
    console.log('\n=== Example 10: Persistence Testing ===');
    
    localStorage.clear();
    
    // Create and save drafts
    const builder1 = new TransactionBuilder();
    builder1.setType('payment');
    builder1.setAmount(999);
    builder1.saveDraft('Persistent Draft');
    
    console.log('Draft saved in first instance');
    
    // Create new instance - should load from storage
    const builder2 = new TransactionBuilder();
    const drafts = builder2.getAllDrafts();
    
    console.log('Drafts in second instance:', drafts.length);
    console.log('Draft persisted:', drafts.length > 0 ? '✓' : '✗');
    
    if (drafts.length > 0) {
        builder2.loadDraft(drafts[0].id);
        console.log('Loaded amount:', builder2.getTransaction().amount);
    }
}

// Run all examples
function runAllExamples() {
    console.log('\n');
    console.log('='.repeat(60));
    console.log('  TRANSACTION BUILDER - ADVANCED EXAMPLES');
    console.log('='.repeat(60));
    
    example1_BasicUsage();
    example2_UndoRedo();
    example3_DraftManagement();
    example4_EventListening();
    example5_Statistics();
    example6_ComplexWorkflow();
    example7_HistoryLimit();
    example8_DraftLimit();
    example9_Validation();
    example10_Persistence();
    
    console.log('\n');
    console.log('='.repeat(60));
    console.log('  ALL EXAMPLES COMPLETED');
    console.log('='.repeat(60));
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('Examples loaded. Run runAllExamples() to see all demonstrations.');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        example1_BasicUsage,
        example2_UndoRedo,
        example3_DraftManagement,
        example4_EventListening,
        example5_Statistics,
        example6_ComplexWorkflow,
        example7_HistoryLimit,
        example8_DraftLimit,
        example9_Validation,
        example10_Persistence,
        runAllExamples
    };
}
