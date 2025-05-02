document.querySelector("#login-form").addEventListener("submit", handleLogin);

function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const errorMessage = document.querySelector(".error-message");

    if (!emailInput.value || !passwordInput.value) {
        errorMessage.textContent = "Please enter both email and password";
        errorMessage.style.display = "block";
        return;
    }

    const user = db.loginUser(emailInput.value, passwordInput.value);
    if (user) {
        errorMessage.style.display = "none";
        emailInput.value = "";
        passwordInput.value = "";
        showPage("home");
        showAccountOverview(); 
    } else {
        errorMessage.textContent = "Invalid email or password";
        errorMessage.style.display = "block";
    }
}
