function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function calculateNetBalance(transactions) {
    const totalIncome = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    return totalIncome - totalExpenses;
}

function setActiveNav(element) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.style.textDecoration = "none";
        item.style.fontWeight = "normal";
        item.style.fontSize = "16px";
        item.style.color = "#667eea";
    });
    element.style.textDecoration = "underline";
    element.style.fontWeight = "bold";
    element.style.fontSize = "20px";
    element.style.color = "#2d1445";
}

function showPage(pageName) {
    const views = {
        login: document.querySelector(".loginView"),
        signup: document.querySelector(".signUpView"),
        home: document.querySelector(".homePage")
    };

    Object.values(views).forEach(view => {
        if (view) view.style.display = "none";
    });

    const page = views[pageName];
    if (page) {
        page.style.display = "block";
    } else {
        console.error(`Page "${pageName}" not found.`);
    }
}

function showPopup(message, type = 'info') {
    const popup = document.createElement('div');
    popup.className = `custom-popup ${type}`;
    
    popup.innerHTML = `
        <div class="popup-content">
            <button class="popup-close" onclick="this.closest('.custom-popup').remove()">×</button>
            <p>${message}</p>
            <div class="popup-actions">
                <button class="popup-btn confirm" onclick="this.closest('.custom-popup').remove()">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function showConfirmPopup(message, onConfirm) {
    const popup = document.createElement('div');
    popup.className = 'custom-popup confirm';
    
    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <div class="popup-actions">
                <button class="popup-btn confirm" id="confirmYes">Yes</button>
                <button class="popup-btn cancel" id="confirmNo">No</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);

    popup.querySelector('#confirmYes').addEventListener('click', () => {
        popup.remove();
        onConfirm();
    });

    popup.querySelector('#confirmNo').addEventListener('click', () => {
        popup.remove();
    });
}
