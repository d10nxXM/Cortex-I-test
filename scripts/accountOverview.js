document.querySelector("#accountOverview").addEventListener("click", showAccountOverview);

function showAccountOverview(e) {
    if (e) e.preventDefault();
    setActiveNav(document.querySelector("#accountOverview"));
    const currentUser = db.getCurrentUser();
    const userTransactions = db.getUserTransactions(currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5); 

    const netBalance = calculateNetBalance(userTransactions);

    const totalIncome = userTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = userTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    const transactionsHTML = userTransactions.map(trans => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-type">${trans.category || 'Transaction'}</span>
                <span class="transaction-date">${new Date(trans.date).toLocaleDateString()}</span>
            </div>
            <span class="transaction-amount ${trans.type}">
                ${trans.type === 'credit' ? '+' : '-'} ${formatMoney(Math.abs(trans.amount))}
            </span>
        </div>
    `).join('');

    const dashboardHTML = `
        <div class="dashboard-grid">
            <div class="account-card main-balance">
                <h3>Current Balance</h3>
                <p class="balance">${formatMoney(netBalance)}</p>
                <div class="quick-actions">
                    <button onclick="showTransfers(event)" class="action-btn">Transfer</button>
                    <button onclick="showPayments(event)" class="action-btn">Pay Bills</button>
                </div>
            </div>
            <div class="account-card transactions-card">
                <h3>Recent Transactions</h3>
                <div class="transactions-list">
                    ${transactionsHTML || '<p>No recent transactions found</p>'}
                </div>
                <button onclick="showTransactions(event)" class="view-all-btn">View All Transactions</button>
            </div>
            <div class="account-card summary-card">
                <h3>Spending Summary</h3>
                <div class="summary-items">
                    <div class="summary-item">
                        <span>Total Income</span>
                        <span class="income">${formatMoney(totalIncome)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Total Expenses</span>
                        <span class="expense">${formatMoney(totalExpenses)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Net Balance</span>
                        <span class="${netBalance >= 0 ? 'income' : 'expense'}">${formatMoney(netBalance)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.querySelector('.dashboard').innerHTML = dashboardHTML;
}
