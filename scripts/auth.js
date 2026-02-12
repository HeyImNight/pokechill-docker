const API_URL = '/api';

// State
let currentUser = localStorage.getItem('pokechill_username') || null;
let authToken = localStorage.getItem('pokechill_token') || null;

// UI Elements (to be created in index.html)
// Assuming IDs: auth-modal, auth-username, auth-password, auth-submit, auth-toggle-mode, auth-status, auth-open-btn, auth-logout-btn

function updateAuthUI() {
    const loginBtn = document.getElementById('auth-open-btn');
    const logoutBtn = document.getElementById('auth-logout-btn');
    const statusDisplay = document.getElementById('auth-display-username');

    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'flex';
        if (statusDisplay) statusDisplay.textContent = `User: ${currentUser}`;
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (statusDisplay) statusDisplay.textContent = 'Not Logged In';
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            currentUser = data.username;
            localStorage.setItem('pokechill_token', authToken);
            localStorage.setItem('pokechill_username', currentUser);
            alert('Logged in successfully!');
            updateAuthUI();
            closeAuthModal();
            // Try to load cloud save
            loadCloudSave();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
}

async function register(username, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please log in.');
            // Switch to login mode or auto-login
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('pokechill_token');
    localStorage.removeItem('pokechill_username');
    updateAuthUI();
    alert('Logged out.');
    window.location.reload(); // clear state
}

async function saveToCloud(gameData) {
    if (!authToken) return;

    // console.log("Saving to cloud...", gameData);

    try {
        const response = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ data: gameData })
        });

        if (!response.ok) {
            console.error('Failed to save to cloud');
        } else {
            // console.log('Saved to cloud successfully');
        }
    } catch (error) {
        console.error('Cloud save error:', error);
    }
}

async function loadCloudSave() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_URL}/save`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data) {
                const choice = confirm("Cloud save found. Do you want to load it? This will overwrite your current local session.");
                if (choice) {
                    localStorage.setItem("gameData", JSON.stringify(data.data));
                    window.location.reload();
                }
            }
        }
    } catch (error) {
        console.error('Cloud load error:', error);
    }
}

// Modal Logic
let isLoginMode = true;

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleBtn = document.getElementById('auth-toggle-mode');

    if (isLoginMode) {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleBtn.textContent = 'Need an account? Register';
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleBtn.textContent = 'Have an account? Login';
    }
}

function handleAuthSubmit() {
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (isLoginMode) {
        login(username, password);
    } else {
        register(username, password);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});
