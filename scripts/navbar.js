document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("accountTrigger").addEventListener("click", toggleAccountMenu);
    document.getElementById("logout").addEventListener("click", handleLogout);
    document.getElementById("resetData").addEventListener("click", handleResetData);
    document.getElementById("profileSettings").addEventListener("click", handleProfileSettings);
    document.getElementById("securitySettings").addEventListener("click", handleSecuritySettings);
    document.getElementById("accountSettings").addEventListener("click", handleAccountSettings);

    document.addEventListener('click', (e) => {
        const menu = document.getElementById("accountMenu");
        const trigger = document.getElementById("accountTrigger");
        if (menu && !menu.contains(e.target) && !trigger.contains(e.target)) {
            menu.classList.remove("active");
        }
    });
});

function toggleAccountMenu() {
    const menu = document.getElementById("accountMenu");
    const currentUser = db.getCurrentUser();
    
    document.querySelectorAll('.user-email').forEach(el => {
        el.textContent = currentUser.email;
    });
    
    const userSince = new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    document.querySelector('.user-since').textContent = `Member since ${userSince}`;
    
    menu.classList.toggle("active");
}

function handleLogout() {
    showConfirmPopup(
        'Are you sure you want to log out?',
        () => {
            db.logoutUser();
            window.location.reload();
        }
    );
}

function handleResetData() {
    showConfirmPopup(
        'Are you sure you want to reset all your data? This cannot be undone.',
        () => {
            const currentUser = db.getCurrentUser();
            try {
                const transactions = {};
                transactions[currentUser.id] = [];
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                const cards = {};
                cards[currentUser.id] = [];
                localStorage.setItem('userCards', JSON.stringify(cards));
                
                const users = JSON.parse(localStorage.getItem('users'));
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].balance = 0;
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                }
                
                showPopup('Your data has been reset successfully!', 'success');
                showAccountOverview();
            } catch (error) {
                showPopup(`Failed to reset data: ${error.message}`, 'error');
            }
        }
    );
}

function handleProfileSettings() {
    const currentUser = db.getCurrentUser();
    const modalHTML = `
        <div class="settings-modal">
            <div class="modal-content">
                <h3>Profile Settings</h3>
                <div class="profile-info">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" value="${currentUser.email}" disabled>
                    </div>
                    <div class="form-group">
                        <label>Account Created</label>
                        <input type="text" value="${new Date(currentUser.createdAt).toLocaleDateString()}" disabled>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="closeModal('.settings-modal')" class="cancel-btn">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function handleSecuritySettings() {
    const modalHTML = `
        <div class="settings-modal">
            <div class="modal-content">
                <h3>Security Settings</h3>
                <form id="changePasswordForm" class="settings-form">
                    <div class="form-group">
                        <label>Current Password</label>
                        <input type="password" id="currentPassword" required>
                    </div>
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="newPassword" required>
                    </div>
                    <div class="form-group">
                        <label>Confirm New Password</label>
                        <input type="password" id="confirmPassword" required>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="save-btn">Update Password</button>
                        <button type="button" onclick="closeModal('.settings-modal')" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);
}

function handleAccountSettings() {
    const modalHTML = `
        <div class="settings-modal">
            <div class="modal-content">
                <h3>Account Settings</h3>
                <div class="settings-list">
                    <div class="settings-item">
                        <span>Currency</span>
                        <span>EUR</span>
                    </div>
                    <div class="settings-item">
                        <span>Account Type</span>
                        <span>Personal</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="closeModal('.settings-modal')" class="cancel-btn">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function handlePasswordChange(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert("New passwords don't match!");
        return;
    }

    try {
        const currentUser = db.getCurrentUser();
        if (currentUser.password !== currentPassword) {
            alert("Current password is incorrect!");
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        alert("Password updated successfully!");
        closeModal('.settings-modal');
    } catch (error) {
        alert("Failed to update password: " + error.message);
    }
}

function closeModal(selector) {
    const modal = document.querySelector(selector);
    if (modal) 
        modal.remove();
}
