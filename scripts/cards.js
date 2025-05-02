document.querySelector("#cards").addEventListener("click", showCards);

function showCards(e) {
    if (e) e.preventDefault();
    setActiveNav(document.querySelector("#cards"));
    const currentUser = db.getCurrentUser();
    const userCards = db.getUserCards(currentUser.id);

    const cardsHTML = `
        <div class="cards-container">
            <div class="cards-header">
                <h2>My Cards</h2>
                <button class="add-card-btn" onclick="showAddCardForm()">+ Add New Card</button>
            </div>
            <div class="cards-grid">
                ${userCards.length ? userCards.map(card => createCardHTML(card)).join('') 
                : `<div class="no-cards">
                    <p>You haven't added any cards yet</p>
                    <button onclick="showAddCardForm()" class="add-first-card">Add Your First Card</button>
                   </div>`
                }
            </div>

            <div id="cardFormModal" class="card-modal">
                <div class="modal-content">
                    <h3>Add New Card</h3>
                    <form id="addCardForm" onsubmit="handleAddCard(event)">
                        <div class="form-group">
                            <label>Card Type</label>
                            <select name="type" required>
                                <option value="Visa">Visa</option>
                                <option value="MasterCard">MasterCard</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Card Number</label>
                            <input type="text" name="number" maxlength="19" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" name="expiry" placeholder="MM/YY" maxlength="5" required>
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="password" name="cvv" maxlength="3" required>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="save-btn">Add Card</button>
                            <button type="button" onclick="hideCardForm()" class="cancel-btn">Cancel</button>
                        </div>
                    </form>
                    <button class="modal-close" onclick="hideCardForm()">×</button>
                </div>
            </div>
        </div>
    `;

    document.querySelector('.dashboard').innerHTML = cardsHTML;
    setupCardListeners();
}

function createCardHTML(card) {
    return `
        <div class="credit-card-wrapper" data-id="${card.id}">
            <div class="credit-card">
                <div class="credit-card-front">
                    <div class="card-chip"></div>
                    <div class="card-details">
                        <div class="card-type">${card.type}</div>
                        <div class="card-number">${card.maskedNumber}</div>
                        <div class="card-exp">Expires: ${card.expiry}</div>
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editCard(${card.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteCard(${card.id})">Delete</button>
                    </div>
                </div>
                <div class="credit-card-back">
                    <div class="card-stripe"></div>
                    <div class="card-cvv">
                        <span>CVV</span>
                        <div class="cvv-number">***</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupCardListeners() {
    
    const numberInput = document.querySelector('input[name="number"]');
    if (numberInput) {
        numberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.match(/.{1,4}/g)?.join(' ') || '';
            e.target.value = value;
        });
    }

    
    const expiryInput = document.querySelector('input[name="expiry"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value;
        });
    }

    
    document.querySelectorAll('.credit-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-actions')) {
                card.classList.toggle('is-flipped');
            }
        });
    });
}

function showAddCardForm() {
    const modal = document.getElementById('cardFormModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}

function hideCardForm() {
    const modal = document.getElementById('cardFormModal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; 
}

function editCard(cardId) {
    const currentUser = db.getCurrentUser();
    const card = db.getUserCards(currentUser.id).find(c => c.id === cardId);
    
    if (!card) return;

    const editModalHTML = `
        <div class="edit-card-modal">
            <div class="modal-content">
                <h3>Edit Card</h3>
                <form id="editCardForm" onsubmit="handleEditCardSubmit(event, ${cardId})">
                    <div class="form-group">
                        <label>Card Type</label>
                        <select name="type" required>
                            <option value="Visa" ${card.type === 'Visa' ? 'selected' : ''}>Visa</option>
                            <option value="MasterCard" ${card.type === 'MasterCard' ? 'selected' : ''}>MasterCard</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" name="number" maxlength="19" required
                               placeholder="1234 5678 9012 3456">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" name="expiry" required value="${card.expiry}"
                                   placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="password" name="cvv" required 
                                   placeholder="***" maxlength="3">
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="save-btn">Save Changes</button>
                        <button type="button" class="cancel-btn" onclick="closeEditModal()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', editModalHTML);
    setupEditFormListeners();
}

function setupEditFormListeners() {
    const form = document.querySelector('#editCardForm');
    const numberInput = form.querySelector('input[name="number"]');
    const expiryInput = form.querySelector('input[name="expiry"]');

    // Card number formatting
    numberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.match(/.{1,4}/g)?.join(' ') || '';
        e.target.value = value;
    });

    // Expiry date formatting
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
    });
}

function handleEditCardSubmit(e, cardId) {
    e.preventDefault();
    const form = e.target;
    const updates = {
        type: form.type.value,
        number: form.number.value.replace(/\s/g, ''),
        expiry: form.expiry.value,
        cvv: form.cvv.value
    };

    try {
        const currentUser = db.getCurrentUser();
        db.editCard(currentUser.id, cardId, updates);
        closeEditModal();
        refreshCards();
    } catch (error) {
        alert('Failed to update card: ' + error.message);
    }
}

function refreshCards() {
    const currentUser = db.getCurrentUser();
    const userCards = db.getUserCards(currentUser.id);
    const cardsGrid = document.querySelector('.cards-grid');
    
    if (cardsGrid) {
        cardsGrid.innerHTML = userCards.length ? 
            userCards.map(card => createCardHTML(card)).join('') :
            `<div class="no-cards">
                <p>You haven't added any cards yet</p>
                <button onclick="showAddCardForm()" class="add-first-card">Add Your First Card</button>
            </div>`;
        
        setupCardListeners();
    }
}

function closeEditModal() {
    const modal = document.querySelector('.edit-card-modal');
    if (modal) {
        modal.remove();
    }
}

function handleAddCard(e) {
    e.preventDefault();
    const form = e.target;
    const cardData = {
        type: form.type.value,
        number: form.number.value.replace(/\s/g, ''),
        expiry: form.expiry.value,
        cvv: form.cvv.value
    };

    try {
        const user = db.getCurrentUser();
        db.addCard(user.id, cardData);
        hideCardForm();
        showCards();
    } catch (error) {
        alert('Failed to add card: ' + error.message);
    }
}

function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        const user = db.getCurrentUser();
        db.deleteCard(user.id, cardId);
        showCards();
    }
}


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'cardFormModal') {
            hideCardForm();
        } else if (e.target.classList.contains('edit-card-modal')) {
            closeEditModal();
        }
    }
});
