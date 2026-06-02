/**
 * Application - UI Controller
 */

// Initialize builder
const builder = new TransactionBuilder();

// DOM Elements
const typeInput = document.getElementById('type');
const amountInput = document.getElementById('amount');
const currencyInput = document.getElementById('currency');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const descriptionInput = document.getElementById('description');

const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const resetBtn = document.getElementById('resetBtn');

const draftNameInput = document.getElementById('draftName');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const draftList = document.getElementById('draftList');
const draftStats = document.getElementById('draftStats');

const historyStats = document.getElementById('historyStats');
const transactionPreview = document.getElementById('transactionPreview');
const validation = document.getElementById('validation');

// Event Listeners - Form Inputs
typeInput.addEventListener('change', (e) => {
    builder.setType(e.target.value);
    updateUI();
});

amountInput.addEventListener('input', (e) => {
    builder.setAmount(e.target.value);
    updateUI();
});

currencyInput.addEventListener('change', (e) => {
    builder.setCurrency(e.target.value);
    updateUI();
});

fromInput.addEventListener('input', (e) => {
    builder.setFrom(e.target.value);
    updateUI();
});

toInput.addEventListener('input', (e) => {
    builder.setTo(e.target.value);
    updateUI();
});

descriptionInput.addEventListener('input', (e) => {
    builder.setDescription(e.target.value);
    updateUI();
});

// Event Listeners - Action Buttons
undoBtn.addEventListener('click', () => {
    if (builder.undo()) {
        loadTransactionToForm(builder.getTransaction());
        updateUI();
    }
});

redoBtn.addEventListener('click', () => {
    if (builder.redo()) {
        loadTransactionToForm(builder.getTransaction());
        updateUI();
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the transaction?')) {
        builder.reset();
        loadTransactionToForm(builder.getTransaction());
        updateUI();
    }
});

// Event Listeners - Draft Management
saveDraftBtn.addEventListener('click', () => {
    const name = draftNameInput.value.trim();
    
    if (!name) {
        alert('Please enter a draft name');
        return;
    }
    
    const stats = builder.getStats();
    if (stats.drafts.isFull) {
        const confirmSave = confirm('Draft storage is full (20/20). This will overwrite an existing draft if the name matches, or replace the oldest draft. Continue?');
        if (!confirmSave) return;
    }
    
    builder.saveDraft(name);
    draftNameInput.value = '';
    updateDraftList();
    updateDraftStats();
    
    showMessage('Draft saved successfully!', 'success');
});

// Load transaction to form
function loadTransactionToForm(transaction) {
    typeInput.value = transaction.type || '';
    amountInput.value = transaction.amount || 0;
    currencyInput.value = transaction.currency || 'USD';
    fromInput.value = transaction.from || '';
    toInput.value = transaction.to || '';
    descriptionInput.value = transaction.description || '';
}

// Update UI
function updateUI() {
    updateButtons();
    updateHistoryStats();
    updateTransactionPreview();
    updateValidation();
}

// Update button states
function updateButtons() {
    undoBtn.disabled = !builder.canUndo();
    redoBtn.disabled = !builder.canRedo();
}

// Update history stats
function updateHistoryStats() {
    const stats = builder.getStats();
    
    historyStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">Undo Available</div>
            <div class="stat-value">${stats.history.undoCount}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Redo Available</div>
            <div class="stat-value">${stats.history.redoCount}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Max History</div>
            <div class="stat-value">${stats.history.maxHistory}</div>
        </div>
    `;
}

// Update transaction preview
function updateTransactionPreview() {
    const transaction = builder.getTransaction();
    transactionPreview.textContent = JSON.stringify(transaction, null, 2);
}

// Update validation
function updateValidation() {
    const result = builder.validate();
    
    if (!result.valid) {
        validation.className = 'validation-message error';
        validation.textContent = result.errors.join(', ');
    } else {
        validation.className = 'validation-message success';
        validation.textContent = '✓ Transaction is valid';
    }
}

// Update draft list
function updateDraftList() {
    const drafts = builder.getAllDrafts();
    
    if (drafts.length === 0) {
        draftList.innerHTML = '<p class="empty-state">No drafts saved yet</p>';
        return;
    }
    
    draftList.innerHTML = drafts.map(draft => `
        <div class="draft-item">
            <div class="draft-info">
                <div class="draft-name">${escapeHtml(draft.name)}</div>
                <div class="draft-date">${formatDate(draft.updatedAt)}</div>
            </div>
            <div class="draft-actions">
                <button class="btn-small btn-load" onclick="loadDraft('${draft.id}')">Load</button>
                <button class="btn-small btn-delete" onclick="deleteDraft('${draft.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update draft stats
function updateDraftStats() {
    const stats = builder.getStats();
    
    draftStats.innerHTML = `
        <strong>Drafts:</strong> ${stats.drafts.draftCount} / ${stats.drafts.maxDrafts} used
        ${stats.drafts.isFull ? ' <span style="color: #dc3545;">• Storage Full</span>' : ''}
    `;
}

// Load draft
function loadDraft(id) {
    if (builder.loadDraft(id)) {
        loadTransactionToForm(builder.getTransaction());
        updateUI();
        showMessage('Draft loaded successfully!', 'success');
    }
}

// Delete draft
function deleteDraft(id) {
    if (confirm('Are you sure you want to delete this draft?')) {
        if (builder.deleteDraft(id)) {
            updateDraftList();
            updateDraftStats();
            showMessage('Draft deleted successfully!', 'success');
        }
    }
}

// Show message
function showMessage(message, type) {
    validation.className = `validation-message ${type}`;
    validation.textContent = message;
    
    setTimeout(() => {
        updateValidation();
    }, 3000);
}

// Format date
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize UI
function init() {
    loadTransactionToForm(builder.getTransaction());
    updateUI();
    updateDraftList();
    updateDraftStats();
}

// Listen to builder events
builder.addListener((event, data, transaction) => {
    console.log('Builder event:', event, data);
});

// Initialize on load
init();

console.log('Transaction Builder initialized');
console.log('Features: Undo/Redo (50 steps), Drafts (20 max), LocalStorage persistence');
