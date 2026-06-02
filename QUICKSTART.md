# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Open the Application
Simply open `index.html` in your web browser:
```bash
# Option 1: Direct open
open index.html

# Option 2: Using a local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### Step 2: Build Your First Transaction
1. **Select Type**: Choose from Transfer, Payment, Withdrawal, or Deposit
2. **Enter Amount**: Type any positive number
3. **Choose Currency**: USD, EUR, GBP, or JPY
4. **Fill Sender**: Enter the sender's account/ID
5. **Fill Recipient**: Enter the recipient's account/ID
6. **Add Description**: (Optional) Describe the transaction

### Step 3: Try Undo/Redo
- Make changes to any field
- Click **↶ Undo** to revert changes (up to 50 steps)
- Click **↷ Redo** to restore undone changes
- Notice how buttons enable/disable based on availability

### Step 4: Save a Draft
1. Enter a name in the "Draft name" field
2. Click **💾 Save Draft**
3. Your transaction is now saved to localStorage
4. Close and reopen the browser - it's still there!

### Step 5: Load a Draft
- In the "Draft Management" section, you'll see all saved drafts
- Click **Load** on any draft to restore it
- Click **Delete** to remove a draft
- Maximum 20 drafts can be saved

## ✅ Verify It's Working

### Test Undo/Redo (Requirement 1)
1. Set amount to 100
2. Change to 200
3. Change to 300
4. Click Undo - should show 200
5. Click Undo - should show 100
6. Click Redo - should show 200
7. Click Redo - should show 300
✓ **Undo/redo working flawlessly!**

### Test Draft Persistence (Requirement 2)
1. Build a complete transaction
2. Save as "Test Draft"
3. Close the browser completely
4. Reopen index.html
5. See "Test Draft" in the draft list
✓ **Drafts persist in localStorage!**

### Test Draft Limit (Requirement 3)
1. Save multiple drafts with different names
2. Check the draft count at the bottom
3. Try saving more than 20
4. Verify only 20 are kept
✓ **20 draft limit enforced!**

## 🧪 Run Automated Tests

Open `test.html` in your browser to see all 19 tests pass:
- TransactionHistory: 5 tests
- DraftManager: 5 tests  
- TransactionBuilder: 8 tests
- Integration: 1 test

## 📖 See Advanced Examples

1. Open the browser console (F12)
2. Open `index.html`
3. Type: `runAllExamples()`
4. Watch 10 comprehensive examples demonstrate all features

## 🎯 Acceptance Criteria Checklist

- ✅ **Undo/redo works flawlessly**: 50-step history, deep cloning, no bugs
- ✅ **Drafts persist in localStorage**: Survives browser restart
- ✅ **Can save/load up to 20 drafts**: Hard limit enforced automatically

## 💡 Tips

1. **Draft names**: Use descriptive names like "Monthly Rent" or "Client Invoice #123"
2. **History**: You have 50 undo steps - experiment freely!
3. **Validation**: Watch the validation message update in real-time
4. **JSON Preview**: See the complete transaction structure at the bottom
5. **Statistics**: Monitor undo/redo/draft counts in real-time

## 🐛 Troubleshooting

**Drafts not persisting?**
- Check if localStorage is enabled in your browser
- Check browser privacy settings
- Try in a non-incognito window

**Undo button disabled?**
- You're at the initial state (nothing to undo)
- This is expected behavior

**Can't save more drafts?**
- You've hit the 20 draft limit
- Delete old drafts or overwrite by using the same name

## 🎉 You're Ready!

You now have a fully functional transaction builder with:
- ✅ 50-step undo/redo history
- ✅ 20-draft localStorage persistence
- ✅ Real-time validation
- ✅ Complete test coverage

For more details, see `README.md`.
