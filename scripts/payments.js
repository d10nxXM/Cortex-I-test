document.querySelector("#payments").addEventListener("click", showPayments);

function showPayments(e) {
    if (e) e.preventDefault();
    setActiveNav(document.querySelector("#payments"));
    
    const paymentsHTML = `
        <div class="payments-container">
            <div class="payments-header">
                <h2>Bill Payments</h2>
            </div>
            <div class="payments-categories-wrapper">
                <div class="payment-section">
                    <h3>Utilities</h3>
                    <div class="payment-items">
                        <button class="payment-item" onclick="handlePaymentClick('electricity')">
                            <span class="icon">⚡</span>
                            <span>Electricity</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('water')">
                            <span class="icon">💧</span>
                            <span>Water</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('gas')">
                            <span class="icon">🔥</span>
                            <span>Gas</span>
                        </button>
                    </div>
                </div>

                <div class="payment-section">
                    <h3>Entertainment</h3>
                    <div class="payment-items">
                        <button class="payment-item" onclick="handlePaymentClick('netflix')">
                            <span class="icon">🎬</span>
                            <span>Netflix</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('spotify')">
                            <span class="icon">🎵</span>
                            <span>Spotify</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('gaming')">
                            <span class="icon">🎮</span>
                            <span>Gaming</span>
                        </button>
                    </div>
                </div>

                <div class="payment-section">
                    <h3>Insurance</h3>
                    <div class="payment-items">
                        <button class="payment-item" onclick="handlePaymentClick('health')">
                            <span class="icon">🏥</span>
                            <span>Health</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('car')">
                            <span class="icon">🚗</span>
                            <span>Car</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('home')">
                            <span class="icon">🏠</span>
                            <span>Home</span>
                        </button>
                    </div>
                </div>

                <div class="payment-section">
                    <h3>Communications</h3>
                    <div class="payment-items">
                        <button class="payment-item" onclick="handlePaymentClick('phone')">
                            <span class="icon">📱</span>
                            <span>Phone</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('internet')">
                            <span class="icon">🌐</span>
                            <span>Internet</span>
                        </button>
                        <button class="payment-item" onclick="handlePaymentClick('cable')">
                            <span class="icon">📺</span>
                            <span>Cable TV</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.querySelector('.dashboard').innerHTML = paymentsHTML;
}

function handlePaymentClick(service) {
    const currentUser = db.getCurrentUser();
    const savedAccounts = JSON.parse(localStorage.getItem(`savedAccounts_${currentUser.id}`) || '{}');
    const savedAccount = savedAccounts[service];

    const modalHTML = `
        <div class="payment-modal">
            <div class="payment-modal-content">
                <h3>Pay ${service.charAt(0).toUpperCase() + service.slice(1)}</h3>
                ${savedAccount ? 
                    `<form id="paymentForm">
                        <p class="saved-account-info">Using saved account: ${savedAccount}</p>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="useNewAccount"> Use different account
                            </label>
                        </div>
                        <div id="newAccountFields" style="display: none;">
                            <div class="form-group">
                                <label>Account Number</label>
                                <input type="text" id="accountNumber" class="payment-input">
                                <label>
                                    <input type="checkbox" id="saveAccount"> Save this account for future payments
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Amount</label>
                            <input type="number" id="amount" required min="1" step="0.01" class="payment-input">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="confirm-payment">Pay</button>
                            <button type="button" onclick="closePaymentModal()" class="cancel-payment">Cancel</button>
                        </div>
                    </form>` 
                    :
                    `<form id="paymentForm">
                        <div class="form-group">
                            <label>Account Number</label>
                            <input type="text" id="accountNumber" required class="payment-input">
                        </div>
                        <div class="form-group">
                            <label>Amount</label>
                            <input type="number" id="amount" required min="1" step="0.01" class="payment-input">
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="saveAccount"> Save account for future payments
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="confirm-payment">Pay</button>
                            <button type="button" onclick="closePaymentModal()" class="cancel-payment">Cancel</button>
                        </div>
                    </form>`
                }
                <button class="modal-close" onclick="closePaymentModal()">×</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupPaymentFormListeners(service, savedAccount);
}

function setupPaymentFormListeners(service, savedAccount) {
    const form = document.getElementById('paymentForm');
    const useNewAccountCheckbox = document.getElementById('useNewAccount');
    
    if (useNewAccountCheckbox) {
        useNewAccountCheckbox.addEventListener('change', (e) => {
            document.getElementById('newAccountFields').style.display = e.target.checked ? 'block' : 'none';
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUser = db.getCurrentUser();
        const amount = parseFloat(document.getElementById('amount').value);
        
        let accountNumber;
        let shouldSave = false;

        if (savedAccount && !useNewAccountCheckbox?.checked) {
            accountNumber = savedAccount;
        } else {
            accountNumber = document.getElementById('accountNumber').value;
            shouldSave = document.getElementById('saveAccount')?.checked || false;
        }

        if (shouldSave) {
            const savedAccounts = JSON.parse(localStorage.getItem(`savedAccounts_${currentUser.id}`) || '{}');
            savedAccounts[service] = accountNumber;
            localStorage.setItem(`savedAccounts_${currentUser.id}`, JSON.stringify(savedAccounts));
        }

        handlePayment(service, amount);
    });
}

function handlePayment(service, amount) {
    const currentUser = db.getCurrentUser();
    
    if (amount > currentUser.balance) {
        showInsufficientFundsPopup(currentUser.balance);
        return;
    }

    try {
        db.handlePayment(currentUser.id, amount, service);
        alert('Payment successful!');
        closePaymentModal();
    } catch (error) {
        alert(error.message);
    }
}

function showInsufficientFundsPopup(balance) {
    const popupHTML = `
        <div class="insufficient-funds-popup">
            <div class="popup-content">
                <h3>Insufficient Funds</h3>
                <p>You don't have enough funds to complete this payment.</p>
                <p>Current balance: ${formatMoney(balance)}</p>
                <p>Please enter a lower amount or add funds to your account.</p>
                <div class="popup-actions">
                    <button onclick="closeInsufficientFundsPopup()" class="close-popup-btn">OK</button>
                    <button onclick="redirectToAddFunds()" class="add-funds-btn">Add Funds</button>
                </div>
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

function redirectToAddFunds() {
    closeInsufficientFundsPopup();
    showTransfers();  
    setTimeout(() => {
        document.querySelector('.section-add-funds')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) modal.remove();
}
