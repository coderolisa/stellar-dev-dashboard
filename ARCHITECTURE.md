# System Architecture

## 📐 High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface (UI)                   │
│                       (app.js)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐  │
│  │  Forms  │  │ Buttons │  │  Lists  │  │ Preview  │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬─────┘  │
└───────┼───────────┼────────────┼────────────┼─────────┘
        │           │            │            │
        └───────────┴────────────┴────────────┘
                    │
        ┌───────────▼───────────┐
        │  TransactionBuilder   │ ◄─── Main API
        │ (Business Logic Layer)│
        └───────┬───────┬───────┘
                │       │
        ┌───────▼──┐  ┌─▼────────────┐
        │ History  │  │ DraftManager │
        │ Manager  │  │              │
        └────┬─────┘  └──────┬───────┘
             │                │
    ┌────────▼────────┐  ┌───▼──────────┐
    │   Undo Stack    │  │ localStorage │
    │   Redo Stack    │  │              │
    │  (In Memory)    │  │  (Persist)   │
    └─────────────────┘  └──────────────┘
```

## 🔧 Component Details

### Layer 1: UI Layer (app.js + index.html)
**Responsibilities:**
- Capture user input
- Display transaction state
- Show validation feedback
- Render draft list
- Update statistics

**Communication:**
- Calls TransactionBuilder methods
- Listens to builder events
- Updates DOM based on state changes

---

### Layer 2: Business Logic (TransactionBuilder.js)
**Responsibilities:**
- Coordinate between history and drafts
- Validate transactions
- Manage transaction lifecycle
- Emit events to UI
- Provide unified API

**Key Operations:**
```javascript
setType()        → history.pushState()
setAmount()      → history.pushState()
undo()           → history.undo() → update transaction
saveDraft()      → draftManager.saveDraft()
loadDraft()      → draftManager.loadDraft() → restore state
```

---

### Layer 3: History Management (TransactionHistory.js)
**Responsibilities:**
- Maintain undo stack (max 50)
- Maintain redo stack
- Deep clone states
- Handle overflow

**Data Flow:**
```
New State → Push to Undo Stack → Set as Current
                ↓
           Clear Redo Stack

Undo → Pop from Undo → Push Current to Redo → Set Previous as Current

Redo → Pop from Redo → Push Current to Undo → Set Next as Current
```

**Memory Management:**
```javascript
Undo Stack: [State1, State2, ... State50]
                                   ↑
                            Oldest removed when
                            new state exceeds limit
```

---

### Layer 4: Draft Persistence (DraftManager.js)
**Responsibilities:**
- Save to localStorage
- Load from localStorage
- Enforce 20-draft limit
- Manage metadata

**Storage Structure:**
```javascript
localStorage['transaction_drafts'] = {
  drafts: [
    {
      id: "draft_1234567890_abc123",
      name: "My Draft",
      transaction: { /* full transaction */ },
      history: { /* undo/redo stacks */ },
      createdAt: "2026-06-02T10:00:00Z",
      updatedAt: "2026-06-02T10:30:00Z"
    },
    // ... up to 20 drafts
  ],
  version: "1.0",
  lastUpdated: "2026-06-02T10:30:00Z"
}
```

## 🔄 Data Flow Diagrams

### Scenario 1: User Edits Amount

```
User Types "100" in Amount Field
        ↓
app.js: amountInput.addEventListener('input')
        ↓
builder.setAmount(100)
        ↓
transaction.amount = 100
        ↓
history.pushState(transaction)
        ↓
- Clone transaction via JSON
- Push to undo stack
- Clear redo stack
- Store as current state
        ↓
builder.notifyListeners('amount_changed')
        ↓
app.js: updateUI()
        ↓
- Update button states
- Update preview JSON
- Update validation
- Update statistics
```

### Scenario 2: User Clicks Undo

```
User Clicks Undo Button
        ↓
app.js: undoBtn.addEventListener('click')
        ↓
builder.undo()
        ↓
history.undo()
        ↓
- Pop from undo stack
- Push current to redo stack
- Return previous state
        ↓
builder.transaction = previousState
        ↓
builder.notifyListeners('undo')
        ↓
app.js: loadTransactionToForm()
        ↓
- Update all form fields
- Update UI
```

### Scenario 3: User Saves Draft

```
User Clicks "Save Draft"
        ↓
app.js: saveDraftBtn.addEventListener('click')
        ↓
builder.saveDraft(name)
        ↓
draftManager.saveDraft(name, transaction, history)
        ↓
- Generate unique ID
- Clone transaction
- Export history
- Add metadata (timestamps)
        ↓
Check if name exists
  Yes → Update existing draft
  No  → Add new draft
        ↓
Enforce 20-draft limit
        ↓
localStorage.setItem()
        ↓
builder.notifyListeners('draft_saved')
        ↓
app.js: updateDraftList()
```

### Scenario 4: User Loads Draft

```
User Clicks "Load" on Draft
        ↓
app.js: loadDraft(id)
        ↓
builder.loadDraft(id)
        ↓
draftManager.loadDraft(id)
        ↓
- Find draft by ID
- Clone draft data
- Return draft object
        ↓
builder.transaction = draft.transaction
history.import(draft.history)
        ↓
builder.notifyListeners('draft_loaded')
        ↓
app.js: loadTransactionToForm()
        ↓
- Update all form fields
- Restore undo/redo stacks
- Update UI
```

## 🧩 State Management

### Transaction State
```javascript
{
  id: null,
  type: 'payment',
  amount: 100,
  currency: 'USD',
  from: 'Alice',
  to: 'Bob',
  description: 'Coffee',
  metadata: {},
  timestamp: '2026-06-02T10:00:00Z'
}
```

### History State
```javascript
{
  undoStack: [state1, state2, ...],  // Max 50
  redoStack: [state4, state5, ...],
  currentState: state3
}
```

### Draft State
```javascript
{
  id: 'draft_123',
  name: 'My Draft',
  transaction: { /* transaction state */ },
  history: { /* history state */ },
  createdAt: '2026-06-02T10:00:00Z',
  updatedAt: '2026-06-02T10:30:00Z'
}
```

## 🎯 Design Patterns

### 1. **Observer Pattern**
- TransactionBuilder emits events
- UI listens and updates accordingly
- Decouples business logic from presentation

### 2. **Command Pattern**
- Each state change is a "command"
- Commands stored in undo stack
- Can be undone/redone

### 3. **Repository Pattern**
- DraftManager abstracts storage layer
- Can swap localStorage for other backends
- Business logic doesn't know storage details

### 4. **Facade Pattern**
- TransactionBuilder is facade over History & Drafts
- Simplifies complex subsystems
- Single point of entry for UI

## 🔒 Data Integrity

### Deep Cloning Strategy
```javascript
// Prevents reference sharing
const cloned = JSON.parse(JSON.stringify(original));
```

**Why?**
- History entries must be immutable
- Changes to current state shouldn't affect history
- Drafts must be independent copies

### Validation Strategy
```javascript
validate() {
  - Check required fields
  - Check data types
  - Check business rules (amount > 0)
  - Return errors array
}
```

## 📊 Performance Characteristics

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Set field | O(1) + clone | Clone is O(n) where n = object size |
| Undo | O(1) | Pop from stack |
| Redo | O(1) | Pop from stack |
| Save draft | O(n) | n ≤ 20, plus localStorage write |
| Load draft | O(n) | n ≤ 20, localStorage read |
| Validate | O(1) | Fixed number of checks |

## 🎨 UI/UX Flow

```
┌─────────────┐
│   Initial   │
│   State     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  User Edits Fields      │◄──────┐
│  - Type, Amount, etc.   │       │
└──────┬──────────────────┘       │
       │                          │
       ▼                          │
┌─────────────────────────┐       │
│  Real-time Validation   │       │
│  - Show errors/success  │       │
└──────┬──────────────────┘       │
       │                          │
       ├─────► Undo ──────────────┘
       │
       ├─────► Redo ──────────────┐
       │                          │
       │                          ▼
       ▼                    ┌──────────┐
┌─────────────────┐         │ Previous │
│  Save Draft     │         │  State   │
└──────┬──────────┘         └──────────┘
       │
       ▼
┌─────────────────┐
│  Draft Saved    │
│  to localStorage│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Can Load       │
│  Anytime        │
└─────────────────┘
```

## 🔧 Extensibility Points

### Easy to Add:
1. **New Transaction Types** - Add to dropdown
2. **New Currencies** - Add to dropdown
3. **Additional Fields** - Add setter methods
4. **Custom Validation Rules** - Extend validate()
5. **Event Handlers** - Add more listeners
6. **Export Formats** - Add export methods

### Example Extension:
```javascript
// Add tax field
builder.setTax(tax) {
    this.transaction.tax = tax;
    this.history.pushState(this.transaction);
    this.notifyListeners('tax_changed', tax);
}
```

This architecture provides a **solid foundation** for a scalable, maintainable transaction management system!
