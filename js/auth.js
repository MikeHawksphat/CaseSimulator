import * as dom from './dom.js';
import { state, setAuthState } from './state.js';
import { loadData } from './dataManager.js'; // Import new data manager
import { updateAuthUI, updateSaveStatus } from './ui.js'; // Import UI update functions

// --- Constants ---
const API_BASE = '/api'; // Base path for Vercel serverless functions

// --- UI Interaction ---

export function showAuthModal(modalId) {
    hideAuthErrors(); // Clear previous errors
    dom.authModalBackdrop?.classList.remove('hidden');
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Focus the first input field
        const firstInput = modal.querySelector('input');
        firstInput?.focus();
    }
}

export function hideAuthModal() {
    dom.authModalBackdrop?.classList.add('hidden');
    dom.loginModal?.classList.add('hidden');
    dom.signupModal?.classList.add('hidden');
    hideAuthErrors(); // Clear errors when closing
}

function showAuthError(modalId, message) {
    const errorElement = modalId === 'loginModal' ? dom.loginErrorP : dom.signupErrorP;
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function hideAuthErrors() {
    dom.loginErrorP?.classList.add('hidden');
    dom.signupErrorP?.classList.add('hidden');
    dom.loginErrorP.textContent = '';
    dom.signupErrorP.textContent = '';
}

function setLoadingState(form, isLoading) {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = isLoading;
        button.textContent = isLoading ? 'Processing...' : (form.id === 'loginForm' ? 'Login' : 'Sign Up');
    }
}

// --- API Calls ---

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Include auth token if available and needed
            ...(state.authToken && { 'Authorization': `Bearer ${state.authToken}` }),
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json(); // Assume backend always returns JSON

        if (!response.ok) {
            // Use error message from backend if available, otherwise generic message
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data; // Contains success data (e.g., user info, token)
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error);
        // Re-throw the error with a potentially more specific message from the backend
        throw error; // Let the calling function handle UI display
    }
}

// --- Event Handlers ---

export function handleLoginFormSubmit(event) {
    event.preventDefault();
    hideAuthErrors();
    setLoadingState(dom.loginForm, true);

    const email = dom.loginEmailInput.value;
    const password = dom.loginPasswordInput.value;

    apiRequest('/auth/login', 'POST', { email, password })
        .then(data => {
            console.log('Login successful:', data);
            setAuthState(true, data.user, data.token); // Update global state
            updateAuthUI(); // Update sidebar UI
            hideAuthModal();
            loadData(); // Load user data after login
            updateSaveStatus(); // Update save status indicator
            dom.loginForm.reset(); // Clear form
        })
        .catch(error => {
            showAuthError('loginModal', error.message || 'Login failed. Please check your credentials.');
        })
        .finally(() => {
            setLoadingState(dom.loginForm, false);
        });
}

export function handleSignupFormSubmit(event) {
    event.preventDefault();
    hideAuthErrors();

    const email = dom.signupEmailInput.value;
    const password = dom.signupPasswordInput.value;
    const confirmPassword = dom.signupConfirmPasswordInput.value;

    if (password !== confirmPassword) {
        showAuthError('signupModal', 'Passwords do not match.');
        return;
    }
    if (password.length < 6) {
        showAuthError('signupModal', 'Password must be at least 6 characters long.');
        return;
    }

    setLoadingState(dom.signupForm, true);

    apiRequest('/auth/signup', 'POST', { email, password })
        .then(data => {
            console.log('Signup successful:', data);
            // Optionally log the user in immediately after signup
            setAuthState(true, data.user, data.token);
            updateAuthUI();
            hideAuthModal();
            loadData(); // Load any default/initial data
            updateSaveStatus();
            dom.signupForm.reset();
            alert('Signup successful! You are now logged in.'); // Inform user
        })
        .catch(error => {
            showAuthError('signupModal', error.message || 'Signup failed. Please try again.');
        })
        .finally(() => {
            setLoadingState(dom.signupForm, false);
        });
}

export function handleLogout() {
    console.log('Logging out...');
    // Optional: Call a backend logout endpoint if needed (e.g., to invalidate token server-side)
    // apiRequest('/auth/logout', 'POST').catch(err => console.error("Logout API call failed:", err));

    setAuthState(false, null, null); // Clear local state and token
    updateAuthUI(); // Update sidebar UI
    loadData(); // Load local data after logout
    updateSaveStatus();
    // Optionally redirect to home page or refresh
    // showPage('page-case-opening');
}

// --- Setup ---
export function setupAuthEventListeners() {
    dom.loginButton?.addEventListener('click', () => showAuthModal('loginModal'));
    dom.signupButton?.addEventListener('click', () => showAuthModal('signupModal'));
    dom.logoutButton?.addEventListener('click', handleLogout);

    dom.closeAuthModalButtons.forEach(button => {
        button.addEventListener('click', hideAuthModal);
    });

    // Close modal if backdrop is clicked
    dom.authModalBackdrop?.addEventListener('click', (event) => {
        if (event.target === dom.authModalBackdrop) {
            hideAuthModal();
        }
    });

    dom.loginForm?.addEventListener('submit', handleLoginFormSubmit);
    dom.signupForm?.addEventListener('submit', handleSignupFormSubmit);
}
