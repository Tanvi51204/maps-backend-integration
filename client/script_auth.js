document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const authMessageDiv = document.getElementById('auth-message'); // Get the message div

    const API_BASE_URL = 'http://localhost:8000/api/v1/auth';

    // --- Toggle Functionality ---

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent link from navigating
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            clearMessages(); // Clear any previous messages when toggling
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent link from navigating
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            clearMessages(); // Clear any previous messages when toggling
        });
    }

     // --- Helper to display messages ---
    function showMessage(message, isError = false) {
        if (!authMessageDiv) return; // Exit if the div doesn't exist
        authMessageDiv.textContent = message;
        authMessageDiv.className = 'message-area'; // Reset classes
        if (message) {
            authMessageDiv.classList.add(isError ? 'error' : 'success');
        }
    }

     // --- Helper to clear messages ---
    function clearMessages() {
        showMessage(""); // Set empty message clears content and classes
    }


    // --- Form Submission Logic (PLACEHOLDER - Needs fetch calls) ---

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default page reload
            clearMessages(); // Clear previous messages

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            console.log('Login attempt with:', { email });
            showMessage("Attempting login...", false); // Show loading/attempt message

            // ========================================================
            // TODO: Add fetch() call to backend /api/v1/auth/login
            // ========================================================
            try {
                const response = await fetch(`${API_BASE_URL}/login`, { // Adjust URL if needed
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }), // Send email and password
                });

                const result = await response.json(); // Always parse JSON response

                if (!response.ok) {
                     // Use the message from the backend ApiError
                    throw new Error(result.message || `HTTP error! status: ${response.status}`);
                }

                // --- SUCCESS ---
                console.log('Login successful:', result);
                showMessage('Login successful! Redirecting...', false);
                 // Store user data or token if needed (e.g., localStorage, though cookies are handled by backend)
                // Redirect to the main application page after a short delay
                setTimeout(() => {
                   window.location.href = 'map.html'; // Or your main app page e.g., '/dashboard.html'
                }, 1500); // Wait 1.5 seconds

            } catch (error) {
                console.error('Login failed:', error);
                 // Display the error message from backend or a generic one
                showMessage(error.message || 'Login failed. Please check credentials.', true);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default page reload
            clearMessages();

            const username = document.getElementById('register-username').value;
            const fullName = document.getElementById('register-fullname').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            console.log('Register attempt with:', { username, fullName, email, password });
            showMessage("Attempting registration...", false);

            // Basic frontend check for domain (backend enforces it anyway)
            if (!email.toLowerCase().endsWith('@igdtuw.ac.in')) {
                showMessage('Invalid email domain. Use your @igdtuw.ac.in address.', true);
                return; // Stop submission
            }

            // ===========================================================
            // TODO: Add fetch() call to backend /api/v1/auth/register
            // ===========================================================
             try {
                const response = await fetch(`${API_BASE_URL}/register`, { // Adjust URL if needed
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, fullName, email, password }),
                });

                const result = await response.json(); // Always parse JSON

                if (!response.ok) {
                    // Use the message from the backend ApiError
                    throw new Error(result.message || `HTTP error! status: ${response.status}`);
                }

                // --- SUCCESS ---
                console.log('Registration successful:', result);
                showMessage('Registration successful! Please login.', false);

                // Optionally switch to the login form automatically after successful registration
                setTimeout(() => {
                    registerForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                    clearMessages(); // Clear the success message before showing login
                    loginForm.reset(); // Clear login form fields (optional)
                    registerForm.reset(); // Clear register form fields
                    document.getElementById('login-password').focus(); // Focus password field
                }, 2000); // Wait 2 seconds


            } catch (error) {
                console.error('Registration failed:', error);
                 // Display the error message from backend or a generic one
                showMessage(error.message || 'Registration failed. Please try again.', true);
            }
        });
    }
});