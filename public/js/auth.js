// Authentication page functionality

class AuthPageManager {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    // Wait for DOM and common scripts to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    try {
      // Wait for global instances to be available
      await this.waitForGlobals();
      
      // Check if user is already authenticated
      await this.checkExistingAuth();
      
      // Initialize form handlers
      this.initializeForm();
      
      // Handle URL parameters
      this.handleUrlParams();
      
      this.isInitialized = true;
      console.log('✅ Auth page initialized');
    } catch (error) {
      console.error('❌ Failed to initialize auth page:', error);
    }
  }

  async waitForGlobals() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (!window.hospitalTracker || !window.authManager) {
      if (attempts >= maxAttempts) {
        throw new Error('Global instances not available');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  async checkExistingAuth() {
    try {
      const user = await window.authManager.checkAuth();
      if (user) {
        // User is already logged in, redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Continue with login page - user is not authenticated
    }
  }

  initializeForm() {
    const loginForm = document.getElementById('login-form');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    if (signupBtn) {
      signupBtn.addEventListener('click', () => this.handleSignupRedirect());
    }

    // Real-time validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('input', () => this.clearEmailError());
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('blur', () => this.validatePassword());
      passwordInput.addEventListener('input', () => this.clearPasswordError());
    }
  }

  handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'logged_out') {
      window.showToast('You have been logged out successfully', 'info');
    } else if (message === 'signup_success') {
      window.showToast('Account created successfully! Please sign in.', 'success');
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    
    // Clear previous errors
    window.hospitalTracker.clearAllErrors();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!this.validateInputs(email, password)) {
      return;
    }

    try {
      // Show loading state
      window.hospitalTracker.showButtonLoading('login-btn');
      
      // Attempt login
      await window.authManager.signIn(email, password);
      
      // Success
      window.showToast('Login successful! Redirecting...', 'success');
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      }
      
      window.showToast(errorMessage, 'error');
      
    } finally {
      // Hide loading state
      window.hospitalTracker.hideButtonLoading('login-btn');
    }
  }

  handleSignupRedirect() {
    // For now, show a signup modal or redirect to signup page
    // In this simple version, we'll show a toast and stay on the same page
    this.showSignupModal();
  }

  showSignupModal() {
    // Simple inline signup for demo
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      window.showToast('Please fill in email and password to create an account', 'warning');
      return;
    }
    
    if (!window.hospitalTracker.validateEmail(email)) {
      window.showToast('Please enter a valid email address', 'error');
      return;
    }
    
    if (!window.hospitalTracker.validatePassword(password)) {
      window.showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    
    this.handleSignup(email, password);
  }

  async handleSignup(email, password) {
    try {
      window.hospitalTracker.showButtonLoading('signup-btn');
      
      await window.authManager.signUp(email, password);
      
      // Clear form
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      
      window.showToast(
        'Account created successfully! You can now sign in.',
        'success',
        'Welcome!'
      );
      
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      window.showToast(errorMessage, 'error');
      
    } finally {
      window.hospitalTracker.hideButtonLoading('signup-btn');
    }
  }

  validateInputs(email, password) {
    let isValid = true;
    
    if (!email) {
      window.hospitalTracker.showFieldError('email', 'Email is required');
      isValid = false;
    } else if (!window.hospitalTracker.validateEmail(email)) {
      window.hospitalTracker.showFieldError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      window.hospitalTracker.showFieldError('password', 'Password is required');
      isValid = false;
    } else if (!window.hospitalTracker.validatePassword(password)) {
      window.hospitalTracker.showFieldError('password', 'Password must be at least 6 characters long');
      isValid = false;
    }
    
    return isValid;
  }

  validateEmail() {
    const email = document.getElementById('email').value.trim();
    if (email && !window.hospitalTracker.validateEmail(email)) {
      window.hospitalTracker.showFieldError('email', 'Please enter a valid email address');
      return false;
    }
    return true;
  }

  validatePassword() {
    const password = document.getElementById('password').value;
    if (password && !window.hospitalTracker.validatePassword(password)) {
      window.hospitalTracker.showFieldError('password', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  }

  clearEmailError() {
    window.hospitalTracker.clearFieldError('email');
  }

  clearPasswordError() {
    window.hospitalTracker.clearFieldError('password');
  }
}

// Global function for template compatibility
window.initializeAuth = () => {
  new AuthPageManager();
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AuthPageManager();
  });
} else {
  new AuthPageManager();
}
