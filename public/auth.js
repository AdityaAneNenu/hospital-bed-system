// Authentication functionality for Hospital Bed Tracker

// Import Supabase
import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
// Note: Replace these with your actual Supabase credentials
const supabaseUrl = 'your_project_url_here';
const supabaseKey = 'your_anon_key_here';

let supabase;

// Initialize Supabase (will be properly configured when user sets up their project)
try {
  if (supabaseUrl !== 'your_project_url_here' && supabaseKey !== 'your_anon_key_here') {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('Please configure your Supabase credentials in config.js');
  }
} catch (error) {
  console.error('Error initializing Supabase:', error);
}

// DOM elements
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const successDiv = document.getElementById('success-message');
const successText = document.getElementById('success-text');

// Utility functions
function showLoading() {
  loadingDiv.classList.remove('hidden');
  authForm.style.opacity = '0.5';
  loginBtn.disabled = true;
  signupBtn.disabled = true;
}

function hideLoading() {
  loadingDiv.classList.add('hidden');
  authForm.style.opacity = '1';
  loginBtn.disabled = false;
  signupBtn.disabled = false;
}

function showError(message) {
  errorText.textContent = message;
  errorDiv.classList.remove('hidden');
  successDiv.classList.add('hidden');
}

function showSuccess(message) {
  successText.textContent = message;
  successDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
}

function hideMessages() {
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
}

// Check if user is already logged in
async function checkAuth() {
  if (!supabase) {
    showError('Please configure Supabase credentials first. Check the SUPABASE_SETUP.md file for instructions.');
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // User is logged in, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

// Login function
async function login(email, password) {
  if (!supabase) {
    showError('Supabase is not configured. Please check your setup.');
    return;
  }

  try {
    showLoading();
    hideMessages();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    showSuccess('Login successful! Redirecting...');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);

  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'An error occurred during login');
  } finally {
    hideLoading();
  }
}

// Signup function
async function signup(email, password) {
  if (!supabase) {
    showError('Supabase is not configured. Please check your setup.');
    return;
  }

  try {
    showLoading();
    hideMessages();

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    showSuccess('Account created successfully! You can now sign in.');
    
    // Clear the form
    emailInput.value = '';
    passwordInput.value = '';

  } catch (error) {
    console.error('Signup error:', error);
    showError(error.message || 'An error occurred during signup');
  } finally {
    hideLoading();
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already authenticated
  checkAuth();

  // Form submission (login)
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    await login(email, password);
  });

  // Signup button
  signupBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    await signup(email, password);
  });
});

// Export for potential use in other modules
window.authFunctions = {
  login,
  signup,
  checkAuth
};
