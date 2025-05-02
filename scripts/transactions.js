document.querySelector("#transactions").addEventListener("click", showTransactions);

let transactionsData = []; 

function showTransactions(e) {
    if (e) e.preventDefault();
    setActiveNav(document.querySelector("#transactions"));
    const currentUser = db.getCurrentUser();
    transactionsData = db.getUserTransactions(currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    renderTransactions(transactionsData);
}

function renderFilterControls() {
    return `
        <h2>Transaction History</h2>
        <div class="filter-controls">
            <form id="filterForm" onsubmit="handleFilterSubmit(event)">
                <div class="filter-group">
                    <label>Date Range:</label>
                    <input type="date" id="dateFrom" class="filter-input">
                    <span>to</span>
                    <input type="date" id="dateTo" class="filter-input">
                </div>
                <div class="filter-group">
                    <select id="categoryFilter" class="filter-input">
                        <option value="">All Categories</option>
                        <option value="transfer">Transfers</option>
                        <option value="payment">Payments</option>
                        <option value="deposit">Deposits</option>
                    </select>
                    <select id="typeFilter" class="filter-input">
                        <option value="">All Types</option>
                        <option value="credit">Income</option>
                        <option value="debit">Expense</option>
                    </select>
                    <input type="text" id="searchTransactions" 
                           class="filter-input" 
                           placeholder="Search transactions...">
                    <button type="submit" class="search-btn">Search</button>
                    <button type="button" onclick="resetFilters()" class="reset-btn">Reset</button>
                </div>
            </form>
        </div>
    `;
}

function handleFilterSubmit(e) {
    e.preventDefault();
    const filters = {
        category: document.querySelector("#categoryFilter").value.toLowerCase(),
        type: document.querySelector("#typeFilter").value,
        search: document.querySelector("#searchTransactions").value.toLowerCase(),
        dateFrom: document.querySelector("#dateFrom").value,
        dateTo: document.querySelector("#dateTo").value
    };

    let filtered = [...transactionsData];

    if (filters.category) {
        filtered = filtered.filter(t => t.category?.toLowerCase() === filters.category);
    }

    if (filters.type) {
        filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.search) {
        filtered = filtered.filter(t => 
            t.description?.toLowerCase().includes(filters.search) ||
            t.category?.toLowerCase().includes(filters.search)
        );
    }

    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(t => new Date(t.date) >= fromDate);
    }

    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => new Date(t.date) <= toDate);
    }

    renderTransactions(filtered);
}

function resetFilters() {
    document.querySelector("#filterForm").reset();
    renderTransactions(transactionsData);
}

function renderTransactions(transactions) {
    if (!transactions.length) {
        document.querySelector('.dashboard').innerHTML = `
            <div class="transactions-container">
                <div class="transactions-header">
                    ${renderFilterControls()}
                </div>
                <div class="no-transactions">
                    <p>No transactions found matching your filters</p>
                </div>
            </div>
        `;
        return;
    }

    const transactionsHTML = transactions.map(trans => `
        <div class="transaction-row">
            <div class="cell">${new Date(trans.date).toLocaleDateString('en-GB')}</div>
            <div class="cell description">
                ${trans.description}
                ${trans.category === 'Transfer' ? `
                    <div class="transfer-details">
                        <small>Type: ${trans.transferDetails?.transferType || 'Standard'}</small>
                        ${trans.transferDetails?.notes ? `<small>Notes: ${trans.transferDetails.notes}</small>` : ''}
                    </div>
                ` : ''}
            </div>
            <div class="cell">
                <span class="category-tag ${trans.category?.toLowerCase() || 'other'}">
                    ${trans.category || 'Other'}
                </span>
            </div>
            <div class="cell amount ${trans.type}">
                ${trans.type === 'credit' ? '+' : '-'} ${formatMoney(Math.abs(trans.amount))}
            </div>
            <div class="cell status">
                <span class="status-tag ${trans.status?.toLowerCase() || 'completed'}">
                    ${trans.status || 'Completed'}
                </span>
            </div>
        </div>
    `).join('');

    document.querySelector('.dashboard').innerHTML = `
        <div class="transactions-container">
            <div class="transactions-header">
                ${renderFilterControls()}
            </div>
            <div class="transactions-table">
                <div class="table-header">
                    <div class="header-cell">Date</div>
                    <div class="header-cell">Description</div>
                    <div class="header-cell">Category</div>
                    <div class="header-cell">Amount</div>
                    <div class="header-cell">Status</div>
                </div>
                <div class="table-body">
                    ${transactionsHTML || '<p>No transactions found</p>'}
                </div>
            </div>
        </div>
    `;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
