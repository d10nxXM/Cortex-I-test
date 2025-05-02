class Database {
    constructor() {
        if(!localStorage.getItem('users')) {
            localStorage.setItem('users', '[]');
        }
        if(!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', 'null');
        }
        if(!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', '{}');
        }
        if(!localStorage.getItem('userCards')) {
            localStorage.setItem('userCards', '{}');
        }
    }

    createUser(email, pass) {
        let users = JSON.parse(localStorage.getItem('users'));
        
        let newUser = {
            id: Date.now(),
            email: email,
            password: pass,
            createdAt: new Date(),
            balance: 2500,
            currency: 'EUR'
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }

  
    getUserTransactions(userId) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || {};
        return transactions[userId] || [];
    }

    addTransaction(userId, transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || {};
        if (!transactions[userId]) transactions[userId] = [];
        
        transaction.id = Date.now();
        transaction.date = transaction.date || new Date().toISOString();
        transactions[userId].push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        return transaction;
    }

    getUserBalance(userId) {
        const user = JSON.parse(localStorage.getItem('users'))
            .find(u => u.id === userId);
        return user ? user.balance : 0;
    }

    addFunds(userId, amount, method, details) {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const transaction = {
            id: Date.now(),
            date: new Date().toISOString(),
            description: `Funds added via ${details.method || method}`,
            amount: amount,
            type: 'credit',
            category: 'Deposit',
            details: details
        };
        
        this.addTransaction(userId, transaction);
        return transaction;
    }

    handleTransfer(userId, amount, recipient, description, details = {}) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) throw new Error("User not found.");
        if (users[userIndex].balance < amount) throw new Error("Insufficient funds.");

        // Deduct amount from user balance
        users[userIndex].balance -= amount;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));

        // Add transaction with more details
        const transaction = {
            id: Date.now(),
            date: new Date().toISOString(),
            description: `Transfer to ${recipient}: ${description}`,
            amount: amount,
            type: 'debit',
            category: 'Transfer',
            transferDetails: details,
            status: 'Completed'
        };

        this.addTransaction(userId, transaction);
        return transaction;
    }

    handlePayment(userId, amount, biller, category = 'Payment') {
        const user = this.getCurrentUser();
        if (user.balance < amount) {
            throw new Error('Insufficient funds');
        }

        const transaction = {
            id: Date.now(),
            date: new Date().toISOString(),
            description: `Payment to ${biller}`,
            amount: amount,
            type: 'debit',
            category: category
        };

        this.addTransaction(userId, transaction);
        return transaction;
    }

    addScheduledPayment(userId, details) {
        const scheduledPayments = JSON.parse(localStorage.getItem('scheduledPayments') || '{}');
        if (!scheduledPayments[userId]) {
            scheduledPayments[userId] = [];
        }
        
        const payment = {
            id: Date.now(),
            ...details,
            status: 'Scheduled'
        };
        
        scheduledPayments[userId].push(payment);
        localStorage.setItem('scheduledPayments', JSON.stringify(scheduledPayments));
        return payment;
    }

    getScheduledPayments(userId) {
        const scheduledPayments = JSON.parse(localStorage.getItem('scheduledPayments') || '{}');
        return scheduledPayments[userId] || [];
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPassword(password) {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
    }

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        }
        return null;
    }

    logoutUser() {
        localStorage.setItem('currentUser', null);
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user === 'null' ? null : JSON.parse(user);
    }

    isLoggedIn() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser !== null && currentUser !== 'null';
    }

    updateUserProfile(userId, data) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data };
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            return users[userIndex];
        }
        throw new Error('User not found');
    }

    updatePassword(userId, currentPassword, newPassword) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) throw new Error('User not found');
        if (users[userIndex].password !== currentPassword) {
            throw new Error('Current password is incorrect');
        }
        if (!this.isValidPassword(newPassword)) {
            throw new Error('New password does not meet requirements');
        }
        
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }

    
    getUserCards(userId) {
        const cards = JSON.parse(localStorage.getItem('userCards'));
        return cards[userId] || [];
    }

    addCard(userId, cardData) {
        const cards = JSON.parse(localStorage.getItem('userCards'));
        if (!cards[userId]) cards[userId] = [];
        
        const newCard = {
            id: Date.now(),
            ...cardData,
            lastFourDigits: cardData.number.slice(-4),
            maskedNumber: `**** **** **** ${cardData.number.slice(-4)}`
        };
        
        cards[userId].push(newCard);
        localStorage.setItem('userCards', JSON.stringify(cards));
        return newCard;
    }

    deleteCard(userId, cardId) {
        const cards = JSON.parse(localStorage.getItem('userCards'));
        if (!cards[userId]) return false;
        
        cards[userId] = cards[userId].filter(card => card.id !== cardId);
        localStorage.setItem('userCards', JSON.stringify(cards));
        return true;
    }

    editCard(userId, cardId, updates) {
        const cards = JSON.parse(localStorage.getItem('userCards'));
        if (!cards[userId]) return null;
        
        const cardIndex = cards[userId].findIndex(card => card.id === cardId);
        if (cardIndex === -1) return null;
        
        cards[userId][cardIndex] = {
            ...cards[userId][cardIndex],
            ...updates
        };
        
        localStorage.setItem('userCards', JSON.stringify(cards));
        return cards[userId][cardIndex];
    }
}

const db = new Database();
