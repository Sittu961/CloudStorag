import { Client, Account, ID } from 'appwrite';

document.addEventListener('DOMContentLoaded', () => {
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
        .setProject('67ddc1cd0024602b01e1'); // Your project ID

    const account = new Account(client);

    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const nameInput = document.getElementById('nameInput');
    const authBtn = document.getElementById('authBtn');
    const signupBtn = document.getElementById('signupBtn');
    const spinner = document.getElementById('spinner');
    const errorMessage = document.getElementById('errorMessage');

    async function checkAuth() {
        console.log('Checking auth status...');
        try {
            const user = await account.get();
            console.log('User is logged in:', user);
            // If the user is on index.html or signup.html and already logged in, redirect to dashboard
            if (window.location.pathname.includes('index.html') || window.location.pathname.includes('signup.html')) {
                redirectToDashboard();
            }
        } catch (error) {
            console.log('Not logged in:', error.message);
            // If the user is on dashboard.html but not logged in, redirect to index.html
            if (window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'index.html';
            }
        }
    }

    function redirectToDashboard() {
        console.log('Attempting to redirect to dashboard.html');
        console.log('Current URL before redirect:', window.location.href);
        window.location.href = 'dashboard.html';
        console.log('Redirect command executed');
        setTimeout(() => {
            console.log('Redirect did not occur after 2 seconds, showing manual navigation option');
            document.body.innerHTML += '<p style="text-align: center; color: red;">Redirect failed. <a href="dashboard.html">Click here to go to the dashboard.</a></p>';
        }, 2000);
    }

    // Function to ensure no active session exists before creating a new one
    async function ensureNoActiveSession() {
        try {
            await account.get(); // Check if a session exists
            console.log('Active session found, deleting it...');
            await account.deleteSession('current'); // Delete the current session
            console.log('Active session deleted');
        } catch (error) {
            console.log('No active session to delete:', error.message);
        }
    }

    // Sign-In Logic
    if (authBtn) {
        console.log('Sign-in logic initialized on page:', window.location.pathname);
        authBtn.onclick = async () => {
            if (!emailInput || !passwordInput) {
                console.error('emailInput or passwordInput element not found on this page');
                errorMessage.textContent = 'Internal error: Form inputs not found.';
                errorMessage.classList.remove('hidden');
                return;
            }

            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                errorMessage.textContent = 'Please fill in all fields!';
                errorMessage.classList.remove('hidden');
                return;
            }

            errorMessage.classList.add('hidden');
            spinner.classList.remove('hidden');
            try {
                console.log('Attempting to sign in with email:', email);
                // Ensure no active session exists before creating a new one
                await ensureNoActiveSession();
                await account.createEmailPasswordSession(email, password);
                console.log('Sign-in successful');
                redirectToDashboard();
            } catch (error) {
                console.error('Sign-in error:', error);
                errorMessage.textContent = `Sign-in failed: ${error.message}`;
                errorMessage.classList.remove('hidden');
            } finally {
                spinner.classList.add('hidden');
            }
        };
    }

    // Sign-Up Logic
    if (signupBtn) {
        console.log('Sign-up logic initialized on page:', window.location.pathname);
        signupBtn.onclick = async () => {
            if (!emailInput || !passwordInput || !nameInput) {
                console.error('emailInput, passwordInput, or nameInput element not found on this page');
                errorMessage.textContent = 'Internal error: Form inputs not found.';
                errorMessage.classList.remove('hidden');
                return;
            }

            const email = emailInput.value;
            const password = passwordInput.value;
            const name = nameInput.value;

            if (!email || !password || !name) {
                errorMessage.textContent = 'Please fill in all fields!';
                errorMessage.classList.remove('hidden');
                return;
            }

            errorMessage.classList.add('hidden');
            spinner.classList.remove('hidden');
            try {
                console.log('Attempting to sign up with email:', email);
                // Ensure no active session exists before creating a new one
                await ensureNoActiveSession();
                const userId = ID.unique();
                await account.create(userId, email, password, name);
                await account.createEmailPasswordSession(email, password);
                console.log('Sign-up successful');
                redirectToDashboard();
            } catch (error) {
                console.error('Sign-up error:', error);
                errorMessage.textContent = `Sign-up failed: ${error.message}`;
                errorMessage.classList.remove('hidden');
            } finally {
                spinner.classList.add('hidden');
            }
        };
    }

    console.log('Page loaded:', window.location.pathname);
    checkAuth();
});