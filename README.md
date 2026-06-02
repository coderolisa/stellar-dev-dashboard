# Transaction Builder - Undo/Redo & Draft Management System

A complete, production-ready transaction history management system with full undo/redo functionality and draft persistence using localStorage.

## ✨ Features

### Core Requirements ✓
- ✅ **Transaction Build History** - Track all transaction building steps
- ✅ **Undo/Redo Stack** - Last 50 steps maintained in memory
- ✅ **Save Draft Transactions** - Persist drafts to localStorage
- ✅ **Load Draft Transactions** - Restore drafts with full history
- ✅ **Up to 20 Drafts** - Maximum 20 drafts with automatic management

### Acceptance Criteria ✓
- ✅ **Flawless Undo/Redo** - Deep cloning prevents reference issues
- ✅ **LocalStorage Persistence** - Drafts persist across browser sessions
- ✅ **20 Draft Limit** - Automatic overflow management

## 🏗️ Architecture

### Components

1. **TransactionHistory.js** - Core undo/redo functionality
   - Maintains separate undo and redo stacks
   - Enforces 50-step history limit
   - Deep clones states to prevent mutations
   - Export/import for persistence

2. **DraftManager.js** - Draft persistence layer
   - localStorage integration
   - 20-draft limit with automatic cleanup
   - Draft metadata (created, updated timestamps)
   - Import/export functionality

3. **TransactionBuilder.js** - Main API interface
   - Combines history and draft management
   - Transaction validation
   - Event system for UI updates
   - Complete transaction lifecycle management

4. **app.js** - UI Controller
   - Form handling
   - Real-time updates
   - User feedback
   - Draft list management

## 🚀 Quick Start

### 1. Open the Application
```bash
# Open index.html in your browser
open index.html
```

### 2. Build a Transaction
- Select transaction type
- Enter amount and currency
- Fill in sender and recipient
- Add description

### 3. Use Undo/Redo
- Click **Undo** to revert changes
- Click **Redo** to restore undone changes
- Up to 50 steps tracked

### 4. Save Drafts
- Enter a draft name
- Click **Save Draft**
- Drafts persist in localStorage
- Load anytime to continue editing

## 📋 Usage Examples

### Basic Usage
```javascript
// Create builder
const builder = new TransactionBuilder();

// Build transaction
builder.setType('payment');
builder.setAmount(100);
builder.setFrom('Alice');
builder.setTo('Bob');
builder.setDescription('Coffee');

// Undo/Redo
builder.undo();  // Reverts last change
builder.redo();  // Restores undone change

// Save draft
builder.saveDraft('My Payment');

// Load draft
const drafts = builder.getAllDrafts();
builder.loadDraft(drafts[0].id);
```

### Advanced Usage

```javascript
// Transaction validation
const result = builder.validate();
if (result.valid) {
    console.log('Transaction is valid');
} else {
    console.log('Errors:', result.errors);
}

// Event listening
builder.addListener((event, data, transaction) => {
    console.log(`Event: ${event}`, transaction);
});

// Get statistics
const stats = builder.getStats();
console.log('Undo available:', stats.history.undoCount);
console.log('Drafts saved:', stats.drafts.draftCount);

// Export/Import drafts
const exported = builder.draftManager.exportDrafts();
// ... save to file or send to server ...
builder.draftManager.importDrafts(exported);
```

## 🧪 Testing

### Run Tests
Open `test.html` in your browser to run the complete test suite.

### Test Coverage
- ✅ TransactionHistory: 5 tests
- ✅ DraftManager: 5 tests
- ✅ TransactionBuilder: 8 tests
- ✅ Integration: 1 comprehensive test

**Total: 19 automated tests**

### Manual Testing
1. Build a transaction with multiple fields
2. Undo several steps - verify each revert
3. Redo steps - verify restoration
4. Save multiple drafts
5. Close and reopen browser
6. Verify drafts persist
7. Load a draft - verify history is restored

## 📊 Technical Specifications

### History Management
- **Stack Type**: Separate undo/redo stacks
- **Max Capacity**: 50 steps
- **Memory Management**: Automatic overflow removal (FIFO)
- **Data Integrity**: Deep cloning via JSON serialization

### Draft Storage
- **Backend**: localStorage
- **Max Drafts**: 20
- **Storage Key**: `transaction_drafts`
- **Data Format**: JSON with metadata
- **Overflow Strategy**: Keep newest 20 drafts

### Transaction Structure
```javascript
{
  id: null,
  type: string,          // 'transfer', 'payment', 'withdrawal', 'deposit'
  amount: number,        // Transaction amount
  currency: string,      // 'USD', 'EUR', 'GBP', 'JPY'
  from: string,          // Sender identifier
  to: string,            // Recipient identifier
  description: string,   // Transaction description
  metadata: object,      // Additional data
  timestamp: string      // ISO 8601 timestamp
}
```

## 🎯 Validation Rules

A transaction is valid when:
1. ✅ Type is selected
2. ✅ Amount > 0
3. ✅ From field is filled
4. ✅ To field is filled

## 🔒 Data Safety

### State Isolation
- All states are deep cloned
- No reference sharing between history entries
- Mutations don't affect history

### LocalStorage Safety
- Try-catch error handling
- Graceful degradation if storage fails
- No data loss on storage errors

### Browser Compatibility
- Works in all modern browsers
- localStorage API required
- ES6+ features used

## 📁 File Structure

```
black/
├── index.html              # Main application UI
├── test.html               # Test suite UI
├── styles.css              # Application styles
├── TransactionHistory.js   # Undo/redo core logic
├── DraftManager.js         # Draft persistence
├── TransactionBuilder.js   # Main API
├── app.js                  # UI controller
├── test.js                 # Test suite
└── README.md               # This file
```

## 🎨 UI Features

- **Responsive Design** - Works on desktop and mobile
- **Real-time Validation** - Instant feedback
- **Visual Feedback** - Button states reflect availability
- **Draft List** - Easy management interface
- **Statistics Display** - History and draft counts
- **Transaction Preview** - JSON view of current state

## 🔧 API Reference

### TransactionBuilder

#### Methods
- `setType(type)` - Set transaction type
- `setAmount(amount)` - Set amount
- `setCurrency(currency)` - Set currency
- `setFrom(from)` - Set sender
- `setTo(to)` - Set recipient
- `setDescription(description)` - Set description
- `undo()` - Undo last change
- `redo()` - Redo last undone change
- `canUndo()` - Check if undo available
- `canRedo()` - Check if redo available
- `saveDraft(name)` - Save current state
- `loadDraft(id)` - Load saved draft
- `deleteDraft(id)` - Delete draft
- `getAllDrafts()` - Get all drafts
- `validate()` - Validate transaction
- `reset()` - Reset to empty state
- `getTransaction()` - Get current state
- `getStats()` - Get statistics

### TransactionHistory

#### Methods
- `pushState(state)` - Add state to history
- `undo()` - Revert to previous state
- `redo()` - Restore undone state
- `canUndo()` - Check undo availability
- `canRedo()` - Check redo availability
- `getCurrentState()` - Get current state
- `clear()` - Clear all history
- `export()` - Export history data
- `import(data)` - Import history data

### DraftManager

#### Methods
- `saveDraft(name, transaction, history)` - Save draft
- `loadDraft(id)` - Load draft by ID
- `loadDraftByName(name)` - Load by name
- `getAllDrafts()` - Get all drafts
- `deleteDraft(id)` - Delete draft
- `deleteAllDrafts()` - Clear all drafts
- `getDraftCount()` - Get draft count
- `isStorageFull()` - Check if limit reached
- `exportDrafts()` - Export as JSON
- `importDrafts(json)` - Import from JSON

## 🐛 Error Handling

- localStorage failures are caught and logged
- Invalid JSON during import is handled gracefully
- Undo/redo on empty stacks returns null safely
- Draft operations validate input data

## 🚀 Performance

- **O(1)** - Undo/redo operations
- **O(1)** - State push (with overflow check)
- **O(n)** - Draft list operations (n ≤ 20)
- **Deep cloning** - Uses JSON.parse/stringify (fast for small objects)

## 📝 Best Practices

1. **Always validate** before submission
2. **Save drafts frequently** for complex transactions
3. **Use descriptive names** for drafts
4. **Check canUndo/canRedo** before calling undo/redo
5. **Handle localStorage limits** (usually ~5-10MB)

## 🎯 Acceptance Criteria Verification

### ✅ Undo/Redo Works Flawlessly
- 19 automated tests pass
- Deep cloning prevents mutations
- History limit enforced correctly
- Redo stack cleared on new actions

### ✅ Drafts Persist in localStorage
- Data survives page refresh
- New instances load from storage
- Automatic serialization/deserialization

### ✅ Can Save/Load Up to 20 Drafts
- Hard limit enforced
- Oldest drafts removed on overflow
- Draft count displayed to user
- Visual feedback when storage full

## 📞 Support

For issues or questions:
1. Check the test suite for examples
2. Review the API reference
3. Inspect browser console for errors
4. Verify localStorage is enabled

## 📄 License

MIT License - Free to use and modify

## 🎉 Conclusion

This implementation provides a **complete, production-ready** solution for transaction history management with undo/redo and draft persistence. All requirements and acceptance criteria are met with comprehensive testing and documentation.
