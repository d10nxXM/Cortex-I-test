document.querySelector("#SignUpLink").addEventListener("click", showSignUpView);
document.querySelector("#loginLink").addEventListener("click", showLoginView);

function showSignUpView(e) {
    e.preventDefault();
    document.querySelector('.signUpView').style.display = 'flex';
    document.querySelector('.loginView').style.display = 'none';
}

function showLoginView(e) {
    e.preventDefault();
    document.querySelector('.loginView').style.display = 'flex';
    document.querySelector('.signUpView').style.display = 'none';
}

document.querySelector("#signup-form").addEventListener("submit", handleSignup);

function handleSignup(e) {
    e.preventDefault();
    const emailInput = document.querySelector("#signup-email");
    const confirmEmailInput = document.querySelector("#confirm-email");
    const passwordInput = document.querySelector("#signup-password");

    if (emailInput.value !== confirmEmailInput.value) {
        alert("Emails do not match");
        return;
    }

    if (!db.isValidEmail(emailInput.value)) {
        alert("Invalid email format");
        return;
    }

    if (!db.isValidPassword(passwordInput.value)) {
        alert("Password does not meet requirements");
        return;
    }

    try {
        const user = db.createUser(emailInput.value, passwordInput.value);
        if (user) {
            db.loginUser(emailInput.value, passwordInput.value);
            emailInput.value = "";
            confirmEmailInput.value = "";
            passwordInput.value = "";
            showPage("home");
        }
    } catch (error) {
        alert("Email is already registered");
    }
}
