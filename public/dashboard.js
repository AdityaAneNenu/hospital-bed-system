// Dashboard functionality for Hospital Bed Tracker

// Import Supabase
import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
// Note: Replace these with your actual Supabase credentials
const supabaseUrl = 'your_project_url_here';
const supabaseKey = 'your_anon_key_here';

let supabase;
let currentUser = null;
let userRole = null;
let map = null;

// Initialize Supabase
try {
  if (supabaseUrl !== 'your_project_url_here' && supabaseKey !== 'your_anon_key_here') {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('Please configure your Supabase credentials');
  }
} catch (error) {
  console.error('Error initializing Supabase:', error);
}

// DOM elements
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const adminPanel = document.getElementById('admin-panel');
const patientPanel = document.getElementById('patient-panel');
const hospitalSelect = document.getElementById('hospital-select');
const updateForm = document.getElementById('update-form');
const bedsInput = document.getElementById('beds');
const oxygenInput = document.getElementById('oxygen');
const updateStatus = document.getElementById('update-status');
const updateMessage = document.getElementById('update-message');
const hospitalsList = document.getElementById('hospitals-list');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Utility functions
function showLoading() {
  loadingDiv.classList.remove('hidden');
}

function hideLoading() {
  loadingDiv.classList.add('hidden');
}

function showError(message) {
  errorText.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  errorDiv.classList.add('hidden');
}

function showUpdateStatus(message, isSuccess = true) {
  updateMessage.textContent = message;
  updateMessage.style.color = isSuccess ? '#16a34a' : '#dc2626';
  updateStatus.classList.remove('hidden');
  
  setTimeout(() => {
    updateStatus.classList.add('hidden');
  }, 3000);
}

// Authentication check
async function checkAuth() {
  if (!supabase) {
    showError('Please configure Supabase credentials first. Check the SUPABASE_SETUP.md file for instructions.');
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = 'index.html';
      return;
    }

    currentUser = session.user;
    userEmailSpan.textContent = currentUser.email;

    // Get user role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      userRole = 'patient'; // Default to patient
    } else {
      userRole = profile.role;
    }

    // Show appropriate panel based on role
    if (userRole === 'admin') {
      adminPanel.classList.remove('hidden');
      await loadHospitalsForAdmin();
    }

    // Load data for all users
    await loadHospitalsData();
    initializeMap();

  } catch (error) {
    console.error('Auth check error:', error);
    showError('Authentication error. Please try logging in again.');
  }
}

// Load hospitals for admin dropdown
async function loadHospitalsForAdmin() {
  try {
    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('id, name')
      .order('name');

    if (error) throw error;

    hospitalSelect.innerHTML = '<option value="">Choose a hospital...</option>';
    hospitals.forEach(hospital => {
      const option = document.createElement('option');
      option.value = hospital.id;
      option.textContent = hospital.name;
      hospitalSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Error loading hospitals for admin:', error);
    showError('Error loading hospitals');
  }
}

// Load hospital data for display
async function loadHospitalsData() {
  try {
    showLoading();
    hideError();

    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select(`
        id,
        name,
        address,
        latitude,
        longitude,
        availability (
          available_beds,
          available_oxygen,
          last_updated
        )
      `)
      .order('name');

    if (error) throw error;

    displayHospitals(hospitals);
    addHospitalsToMap(hospitals);

  } catch (error) {
    console.error('Error loading hospitals data:', error);
    showError('Error loading hospital data');
  } finally {
    hideLoading();
  }
}

// Display hospitals in the list
function displayHospitals(hospitals) {
  hospitalsList.innerHTML = '';

  hospitals.forEach(hospital => {
    const availability = hospital.availability[0] || { available_beds: 0, available_oxygen: 0, last_updated: null };
    
    const hospitalCard = document.createElement('div');
    hospitalCard.className = 'card';
    
    const bedStatus = getAvailabilityStatus(availability.available_beds);
    const oxygenStatus = getAvailabilityStatus(availability.available_oxygen);
    
    const lastUpdated = availability.last_updated 
      ? new Date(availability.last_updated).toLocaleString()
      : 'Never updated';

    hospitalCard.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-lg font-bold">${hospital.name}</h3>
          <p class="text-gray-600">${hospital.address}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold mb-1">${availability.available_beds}</div>
          <div class="text-sm text-gray-600">Available Beds</div>
          <span class="px-2 py-1 rounded text-xs ${bedStatus.class}">${bedStatus.text}</span>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold mb-1">${availability.available_oxygen}</div>
          <div class="text-sm text-gray-600">Oxygen Cylinders</div>
          <span class="px-2 py-1 rounded text-xs ${oxygenStatus.class}">${oxygenStatus.text}</span>
        </div>
      </div>
      
      <div class="text-xs text-gray-500">
        Last updated: ${lastUpdated}
      </div>
    `;

    hospitalsList.appendChild(hospitalCard);
  });
}

// Get availability status styling
function getAvailabilityStatus(count) {
  if (count >= 20) {
    return { text: 'Good', class: 'bg-green-100 text-green-800' };
  } else if (count >= 10) {
    return { text: 'Moderate', class: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { text: 'Low', class: 'bg-red-100 text-red-800' };
  }
}

// Initialize map
function initializeMap() {
  if (map) {
    map.remove();
  }

  map = L.map('map').setView([40.7128, -74.0060], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// Add hospitals to map
function addHospitalsToMap(hospitals) {
  if (!map) return;

  hospitals.forEach(hospital => {
    const availability = hospital.availability[0] || { available_beds: 0, available_oxygen: 0 };
    
    const marker = L.marker([hospital.latitude, hospital.longitude]).addTo(map);
    
    const popupContent = `
      <div>
        <h4 style="margin: 0 0 8px 0; font-weight: bold;">${hospital.name}</h4>
        <p style="margin: 0 0 8px 0; font-size: 12px;">${hospital.address}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div>Beds: <strong>${availability.available_beds}</strong></div>
          <div>Oxygen: <strong>${availability.available_oxygen}</strong></div>
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent);
  });

  // Fit map to show all markers
  if (hospitals.length > 0) {
    const group = new L.featureGroup(hospitals.map(h => 
      L.marker([h.latitude, h.longitude])
    ));
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

// Update availability (admin only)
async function updateAvailability(hospitalId, beds, oxygen) {
  try {
    const { error } = await supabase
      .from('availability')
      .upsert({
        hospital_id: hospitalId,
        available_beds: beds,
        available_oxygen: oxygen,
        last_updated: new Date().toISOString()
      });

    if (error) throw error;

    showUpdateStatus('Availability updated successfully!');
    
    // Reload data to show updated values
    await loadHospitalsData();
    
    // Clear form
    updateForm.reset();

  } catch (error) {
    console.error('Error updating availability:', error);
    showUpdateStatus('Error updating availability: ' + error.message, false);
  }
}

// Logout function
async function logout() {
  try {
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // Logout button
  logoutBtn.addEventListener('click', logout);

  // Hospital selection change (for admin)
  hospitalSelect.addEventListener('change', async (e) => {
    if (!e.target.value) return;

    try {
      // Load current availability data for the selected hospital
      const { data, error } = await supabase
        .from('availability')
        .select('available_beds, available_oxygen')
        .eq('hospital_id', e.target.value)
        .single();

      if (data) {
        bedsInput.value = data.available_beds;
        oxygenInput.value = data.available_oxygen;
      } else {
        bedsInput.value = '';
        oxygenInput.value = '';
      }

    } catch (error) {
      console.error('Error loading current availability:', error);
    }
  });

  // Update form submission (admin only)
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const hospitalId = hospitalSelect.value;
    const beds = parseInt(bedsInput.value);
    const oxygen = parseInt(oxygenInput.value);

    if (!hospitalId) {
      showUpdateStatus('Please select a hospital', false);
      return;
    }

    await updateAvailability(hospitalId, beds, oxygen);
  });

  // Auto-refresh data every 30 seconds
  setInterval(loadHospitalsData, 30000);
});

// Export for potential use in other modules
window.dashboardFunctions = {
  loadHospitalsData,
  updateAvailability,
  logout
};
