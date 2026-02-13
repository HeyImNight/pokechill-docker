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
            loadCloudSave().then((saveLoaded) => {
                if (!saveLoaded) {
                    // New account or no save: Wipe local data to prevent inheriting guest data
                    debugLog("No cloud save. Starting fresh...");
                    if (typeof wipeNewUser === 'function') {
                        wipeNewUser();
                    } else {
                        localStorage.removeItem("gameData");
                        window.location.reload();
                    }
                } else {
                    if (window.startGame) window.startGame();
                }
            });
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
            debugLog("Registration Success! Logging in...");
            alert('Registration successful! Logging in...');
            // Auto login
            login(username, password);
        } else {
            console.error("Register failed:", data);
            debugLog("Error: " + (data.error || 'Registration failed'));
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        debugLog("Error: " + error.message);
        alert('An error occurred during registration');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('pokechill_token');
    localStorage.removeItem('pokechill_username');
    // Wipe game data on logout to enforce server-only persistence
    localStorage.removeItem('gameData');
    localStorage.removeItem('pokechill_saved_team');
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
    if (!authToken) return false;

    try {
        const response = await fetch(`${API_URL}/save`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data) {
                const cloudDataStr = JSON.stringify(data.data);
                const localData = localStorage.getItem("gameData");

                if (cloudDataStr !== localData) {
                    debugLog("New cloud save found, auto-loading...");
                    localStorage.setItem("gameData", cloudDataStr);
                    window.location.reload();
                    return new Promise(() => { }); // Never resolve if reloading
                }
                return true; // Save loaded/synced
            }
        }
        return false; // No save found
    } catch (error) {
        console.error('Cloud load error:', error);
        return false;
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
    const confirmInput = document.getElementById('auth-confirm-password');

    if (isLoginMode) {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleBtn.textContent = 'Need an account? Register';
        debugLog("Please Login");
        if (confirmInput) confirmInput.style.display = 'none';
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleBtn.textContent = 'Have an account? Login';
        debugLog("Please Register");
        if (confirmInput) confirmInput.style.display = 'block';
    }
}

function togglePasswordVisibility() {
    console.log("Toggling password visibility");
    const passwordInput = document.getElementById('auth-password');
    const confirmInput = document.getElementById('auth-confirm-password');
    const toggleCheckbox = document.getElementById('auth-show-password');

    // Use the checkbox state directly
    const type = toggleCheckbox && toggleCheckbox.checked ? 'text' : 'password';
    console.log("Setting input type to:", type);

    if (passwordInput) passwordInput.type = type;
    if (confirmInput) confirmInput.type = type;
}

async function handleAuthSubmit() {
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const confirmInput = document.getElementById('auth-confirm-password');

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        debugLog("Error: Missing username/password");
        return;
    }

    if (isLoginMode) {
        login(username, password);
    } else {
        const confirmPassword = confirmInput.value;
        if (password !== confirmPassword) {
            debugLog("Error: Passwords do not match");
            alert("Passwords do not match!");
            return;
        }
        register(username, password);
    }
}

// Play as Guest
window.playAsGuest = function () {
    console.log("Play as Guest clicked");

    // Check if we need to wipe old data first
    if (localStorage.getItem("gameData")) {
        debugLog("Clearing old data for Guest Mode...");
        localStorage.removeItem("gameData");
        localStorage.removeItem("pokechill_saved_team");
        localStorage.removeItem("pokechill_saved_version");
        localStorage.setItem("pokechill_guest_pending", "true");
        window.location.reload();
        return;
    }

    closeAuthModal();
    if (typeof window.startGame === 'function') {
        try {
            window.startGame();
        } catch (e) {
            console.error("Error starting game:", e);
            debugLog("Error starting game: " + e.message);
        }
    } else {
        console.error("startGame function not found!");
        debugLog("Error: Game init failed");
    }
}

// Initialize
function debugLog(msg) {
    console.log(msg);
    const statusEl = document.getElementById('auth-debug-status');
    if (statusEl) statusEl.textContent = msg;
}

// Initialize
function initAuth() {
    // debugLog("Auth Script Initializing..."); // Silent init

    // Check for pending Guest Mode
    if (localStorage.getItem("pokechill_guest_pending")) {
        localStorage.removeItem("pokechill_guest_pending");
        debugLog("Starting Guest Mode (Clean)...");
        playAsGuest();
        return;
    }

    // Attach Event Listeners
    const submitBtn = document.getElementById('auth-submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            debugLog("Submit Clicked");
            handleAuthSubmit();
        });
    }

    const toggleBtn = document.getElementById('auth-toggle-mode');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleAuthMode);

    const showPassBox = document.getElementById('auth-show-password');
    if (showPassBox) {
        showPassBox.addEventListener('change', () => {
            togglePasswordVisibility();
        });
    }

    const guestBtn = document.getElementById('auth-guest-btn');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            debugLog("Guest Clicked");
            playAsGuest();
        });
    }

    // Initial UI Setup
    updateAuthUI();
    if (authToken) {
        debugLog("Auto-loading Cloud Save...");
        // If logged in, check cloud save then start
        loadCloudSave().then((saveLoaded) => {
            // Only start if we didn't reload
            if (!saveLoaded) {
                if (localStorage.getItem("gameData") || localStorage.getItem("pokechill_saved_team")) {
                    // Check for loop guard
                    if (sessionStorage.getItem('pokechill_just_wiped')) {
                        debugLog("Fresh data detected. Starting game...");
                        sessionStorage.removeItem('pokechill_just_wiped');
                        closeAuthModal();
                        if (window.startGame) window.startGame();
                        return;
                    }

                    debugLog("Cloud empty, local dirty. Wiping...");
                    sessionStorage.setItem('pokechill_just_wiped', 'true');

                    if (typeof wipeNewUser === 'function') {
                        wipeNewUser();
                    } else {
                        localStorage.removeItem("gameData");
                        localStorage.removeItem("pokechill_saved_team");
                        window.location.reload();
                    }
                } else {
                    debugLog("New Game (No Cloud Save).");
                    closeAuthModal();
                    if (window.startGame) window.startGame();
                }
            } else {
                debugLog("Save Synced. Starting...");
                closeAuthModal();
                if (window.startGame) window.startGame();
            }
        });
    } else {
        debugLog("Please Login");
        // Ensure no local data is accessible without login
        if (localStorage.getItem("gameData")) {
            localStorage.removeItem("gameData");
            window.location.reload();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
