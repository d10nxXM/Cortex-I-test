document.querySelector("#transfers").addEventListener("click", showTransfers);

function showTransfers(e) {
    if (e) e.preventDefault();
    setActiveNav(document.querySelector("#transfers"));

    const currentUser = db.getCurrentUser();
    const userTransactions = db.getUserTransactions(currentUser.id)
        .filter(t => t.category === "Transfer")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const recentTransfersHTML = userTransactions.map(trans => `
        <div class="transfer-item">
            <div class="transfer-info">
                <span class="transfer-recipient">${trans.description}</span>
                <span class="transfer-date">${new Date(trans.date).toLocaleDateString()}</span>
            </div>
            <span class="transfer-amount ${trans.type}">
                ${trans.type === 'credit' ? '+' : '-'} ${formatMoney(Math.abs(trans.amount))}
            </span>
        </div>
    `).join('');

    const transferHTML = `
        <div class="transfer-page">
            <div class="transfer-sections">
                <div class="section-transfer">
                    <h2>Transfer Money</h2>
                    <form id="transfer-form" class="transfer-form">
                        <div class="form-group">
                            <label for="recipient">Recipient Name</label>
                            <input type="text" id="recipient" class="transfer-input" placeholder="Enter recipient name" required>
                        </div>
                        <div class="form-group">
                            <label for="accountNumber">Recipient Account Number</label>
                            <input type="text" id="accountNumber" class="transfer-input" placeholder="Enter account number" required>
                        </div>
                        <div class="form-group">
                            <label for="transferType">Transfer Type</label>
                            <select id="transferType" class="transfer-input" required>
                                <option value="domestic">Domestic Transfer</option>
                                <option value="international">International Transfer</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="amount">Amount</label>
                            <div class="amount-input-wrapper">
                                <span class="currency-symbol">€</span>
                                <input type="number" id="amount" class="transfer-input" placeholder="0.00" min="0.01" step="0.01" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <input type="text" id="description" class="transfer-input" placeholder="Enter transfer description" required>
                        </div>
                        <div class="form-group">
                            <label for="notes">Notes (Optional)</label>
                            <textarea id="notes" class="transfer-input" placeholder="Add any additional notes"></textarea>
                        </div>
                        <button type="submit" class="transfer-btn">Send Money</button>
                    </form>
                </div>
                
                <div class="section-add-funds">
                    <h2>Add Funds</h2>
                    <form id="add-funds-form" class="funds-form">
                        <div class="form-group">
                            <label for="fundingMethod">Select Payment Method</label>
                            <select id="fundingMethod" class="transfer-input" required>
                                <option value="">Choose payment method</option>
                                <option value="saved_card">Use Saved Card</option>
                                <option value="new_card">New Card</option>
                            </select>
                        </div>
                        
                        <div id="payment-details" class="payment-details">
                            <!-- Dynamic content will be inserted here -->
                        </div>

                        <div class="form-group">
                            <label for="fundAmount">Amount</label>
                            <div class="amount-input-wrapper">
                                <span class="currency-symbol">€</span>
                                <input type="number" id="fundAmount" class="transfer-input" 
                                    min="10" step="0.01" placeholder="0.00" required>
                            </div>
                        </div>

                        <button type="submit" class="transfer-btn">Add Funds</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.querySelector('.dashboard').innerHTML = transferHTML;

    document.querySelector("#transfer-form").addEventListener("submit", handleTransfer);
    document.querySelector("#add-funds-form").addEventListener("submit", handleAddFunds);
    document.querySelector("#fundingMethod").addEventListener("change", updatePaymentDetails);
}

function updatePaymentDetails(e) {
    const method = e.target.value;
    const detailsDiv = document.querySelector('#payment-details');
    const currentUser = db.getCurrentUser();

    let detailsHTML = '';
    switch(method) {
        case 'saved_card':
            const userCards = db.getUserCards(currentUser.id);
            detailsHTML = `
                <div class="form-group">
                    <label>Select Card</label>
                    <select class="transfer-input" id="savedCard" required>
                        <option value="">Choose a card</option>
                        ${userCards.map(card => `
                            <option value="${card.id}">
                                ${card.type} ending in ${card.lastFourDigits}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;
            break;

        case 'new_card':
            detailsHTML = `
                <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" class="transfer-input" id="cardNumber" 
                           placeholder="1234 5678 9012 3456" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Expiry Date</label>
                        <input type="text" class="transfer-input" id="cardExpiry" 
                               placeholder="MM/YY" required>
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" class="transfer-input" id="cardCVV" 
                               placeholder="123" required maxlength="3">
                    </div>
                </div>
            `;
            break;
    }

    detailsDiv.innerHTML = detailsHTML;
}

function handleTransfer(e) {
    e.preventDefault();
    const amount = parseFloat(document.querySelector("#amount").value);
    const currentUser = db.getCurrentUser();
    
    if (amount <= 0) {
        alert("Please enter a valid amount greater than 0");
        return;
    }

    if (amount > currentUser.balance) {
        showInsufficientFundsPopup(currentUser.balance);
        return;
    }

    const recipient = document.querySelector("#recipient").value.trim();
    const accountNumber = document.querySelector("#accountNumber").value.trim();
    const transferType = document.querySelector("#transferType").value;
    const description = document.querySelector("#description").value.trim();
    const notes = document.querySelector("#notes").value.trim();

    if (!recipient || !accountNumber || !transferType || !description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const transferDetails = {
            recipient,
            accountNumber,
            transferType,
            notes,
            description
        };

        db.handleTransfer(
            currentUser.id, 
            amount, 
            `${recipient} (${accountNumber})`, 
            description,
            transferDetails
        );
        
        alert("Transfer successful!");
        showTransactions(); 
    } catch (error) {
        alert(`Transfer failed: ${error.message}`);
    }
}

function showInsufficientFundsPopup(balance) {
    const popupHTML = `
        <div class="insufficient-funds-popup">
            <div class="popup-content">
                <h3>Insufficient Funds</h3>
                <p>You don't have enough funds to complete this transfer.</p>
                <p>Current balance: ${formatMoney(balance)}</p>
                <p>Please enter a lower amount or add funds to your account.</p>
                <button onclick="closeInsufficientFundsPopup()" class="close-popup-btn">OK</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function closeInsufficientFundsPopup() {
    const popup = document.querySelector('.insufficient-funds-popup');
    if (popup) {
        popup.remove();
    }
}

function handleAddFunds(e) {
    e.preventDefault();
    const method = document.querySelector("#fundingMethod").value;
    const amount = parseFloat(document.querySelector("#fundAmount").value);

    if (!method || !amount) {
        alert("Please fill in all required fields");
        return;
    }

    try {
        const currentUser = db.getCurrentUser();
        let details = { method };

        if (method === 'saved_card') {
            const cardId = document.querySelector("#savedCard").value;
            details.cardId = cardId;
        } else if (method === 'new_card') {
            details = {
                ...details,
                cardNumber: document.querySelector("#cardNumber").value,
                expiry: document.querySelector("#cardExpiry").value,
                cvv: document.querySelector("#cardCVV").value
            };
        }

        db.addFunds(currentUser.id, amount, method, details);
        alert("Funds added successfully!");
        showTransactions();
    } catch (error) {
        alert(`Failed to add funds: ${error.message}`);
    }
}
