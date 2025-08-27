// Common JavaScript functionality for Hospital Bed Tracker

class HospitalTracker {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.userRole = null;
    this.map = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    try {
      // Initialize Supabase
      await this.initSupabase();
      
      // Set up global event listeners
      this.setupEventListeners();
      
      // Initialize common UI components
      this.initToastSystem();
      
      this.isInitialized = true;
      console.log('🏥 Hospital Tracker initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Hospital Tracker:', error);
      this.showToast('Failed to initialize application', 'error');
    }
  }

  async initSupabase() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.supabase) {
      throw new Error('App configuration not found');
    }

    const { url, anonKey } = window.APP_CONFIG.supabase;
    
    if (url === 'your_project_url_here' || anonKey === 'your_anon_key_here') {
      console.warn('⚠️ Supabase credentials not configured');
      return;
    }

    try {
      const { createClient } = window.supabase;
      this.supabase = createClient(url, anonKey);
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }

    // Escape key to close modals/menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Global error handling
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showToast('An unexpected error occurred', 'error');
    });
  }

  closeAllModals() {
    // Close any open dropdowns, modals, etc.
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
      navMenu.classList.remove('active');
    }
  }

  // Toast notification system
  initToastSystem() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info', title = null, duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      error: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
      warning: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
      info: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
    };

    toast.innerHTML = `
      ${icons[type] || icons.info}
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <svg viewBox="0 0 20 20" fill="currentColor" style="width: 1rem; height: 1rem;">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, duration);
    }

    return toast;
  }

  // Form validation helpers
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password) {
    return password.length >= 6;
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    
    if (field) {
      field.classList.add('error');
    }
    
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.add('show');
    }
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    
    if (field) {
      field.classList.remove('error');
    }
    
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.classList.remove('show');
    }
  }

  clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error.show');
    const fieldElements = document.querySelectorAll('.form-input.error');
    
    errorElements.forEach(el => {
      el.classList.remove('show');
      el.textContent = '';
    });
    
    fieldElements.forEach(el => {
      el.classList.remove('error');
    });
  }

  // Loading states
  showButtonLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const spinner = button.querySelector('.btn-spinner');
    const text = button.querySelector('.btn-text');
    
    if (spinner) spinner.classList.remove('hidden');
    if (text) text.style.opacity = '0';
    
    button.disabled = true;
  }

  hideButtonLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const spinner = button.querySelector('.btn-spinner');
    const text = button.querySelector('.btn-text');
    
    if (spinner) spinner.classList.add('hidden');
    if (text) text.style.opacity = '1';
    
    button.disabled = false;
  }

  // Utility functions
  formatDate(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getAvailabilityStatus(count) {
    if (count >= 20) {
      return { text: 'Good', class: 'status-good' };
    } else if (count >= 10) {
      return { text: 'Moderate', class: 'status-moderate' };
    } else {
      return { text: 'Low', class: 'status-low' };
    }
  }

  // API helpers
  async apiRequest(endpoint, options = {}) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    const url = `${window.APP_CONFIG.api.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Local storage helpers
  setStorageItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  getStorageItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  removeStorageItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
}

// Authentication functionality
class AuthManager {
  constructor(tracker) {
    this.tracker = tracker;
    this.currentUser = null;
    this.userRole = null;
  }

  async checkAuth() {
    if (!this.tracker.supabase) {
      console.warn('Supabase not initialized - auth check skipped');
      return null;
    }

    try {
      const { data: { session }, error } = await this.tracker.supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session) {
        this.currentUser = session.user;
        await this.loadUserProfile();
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('Auth check failed:', error);
      this.tracker.showToast('Authentication check failed', 'error');
      return null;
    }
  }

  async loadUserProfile() {
    if (!this.currentUser || !this.tracker.supabase) return;

    try {
      const { data: profile, error } = await this.tracker.supabase
        .from('profiles')
        .select('role')
        .eq('id', this.currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      this.userRole = profile?.role || 'patient';
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.userRole = 'patient'; // Default fallback
    }
  }

  async signIn(email, password) {
    if (!this.tracker.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await this.tracker.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    this.currentUser = data.user;
    await this.loadUserProfile();
    
    return data;
  }

  async signUp(email, password) {
    if (!this.tracker.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await this.tracker.supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async signOut() {
    if (!this.tracker.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await this.tracker.supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    this.currentUser = null;
    this.userRole = null;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.userRole === 'admin';
  }

  getUserEmail() {
    return this.currentUser?.email || '';
  }
}

// Initialize global instances
const hospitalTracker = new HospitalTracker();
const authManager = new AuthManager(hospitalTracker);

// Global functions for easy access
window.showToast = (message, type, title, duration) => {
  hospitalTracker.showToast(message, type, title, duration);
};

window.hospitalTracker = hospitalTracker;
window.authManager = authManager;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HospitalTracker, AuthManager };
}
