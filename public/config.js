// Configuration for the Hospital Bed Tracker app
const config = {
  supabase: {
    url: 'your_project_url_here',
    anonKey: 'your_anon_key_here'
  },
  
  // Map configuration
  map: {
    defaultCenter: [40.7128, -74.0060], // Default to NYC
    defaultZoom: 12
  },
  
  // App settings
  app: {
    name: 'Hospital Bed Tracker',
    version: '1.0.0'
  }
};

// Export for use in other modules
window.APP_CONFIG = config;
