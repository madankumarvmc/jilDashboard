// Configuration
const BASE_URL = 'https://lookerstudio.google.com/embed/reporting/4feb571f-30a6-4f0f-9a82-33befc2fdae9/page/C4QHF';
const DEFAULT_PARAMS = '?rm=minimal';

// User permissions (in production, this would come from your auth system)
const userPermissions = {
  canViewAllDepartments: true, // Set based on user role
  departments: ['production', 'quality', 'logistics', 'sales'], // Allowed departments
  canViewSensitiveData: false // Set based on user clearance
};

function initializeFilters() {
  // Show/hide custom date inputs
  document.getElementById('dateRange').addEventListener('change', function() {
    const customGroup = document.getElementById('customDateGroup');
    customGroup.style.display = this.value === 'custom' ? 'flex' : 'none';
  });

  // Apply user permissions to department filter
  const deptSelect = document.getElementById('department');
  if (!userPermissions.canViewAllDepartments) {
    // Remove departments user can't access
    Array.from(deptSelect.options).forEach(option => {
      if (option.value && !userPermissions.departments.includes(option.value)) {
        option.remove();
      }
    });
  }

  // Load filters from URL params if present
  loadFiltersFromURL();
}

function loadFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('dept')) {
    document.getElementById('department').value = urlParams.get('dept');
  }
  if (urlParams.get('status')) {
    document.getElementById('status').value = urlParams.get('status');
  }
  if (urlParams.get('days')) {
    document.getElementById('dateRange').value = urlParams.get('days');
  }
}

function applyFilters() {
  const dateRange = document.getElementById('dateRange').value;
  const department = document.getElementById('department').value;
  const status = document.getElementById('status').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  // Build filter parameters
  const params = new URLSearchParams(DEFAULT_PARAMS);
  
  // Add date filter
  if (dateRange && dateRange !== 'custom') {
    params.append('params', JSON.stringify({
      'date_range_days': dateRange
    }));
  } else if (dateRange === 'custom' && startDate && endDate) {
    params.append('params', JSON.stringify({
      'start_date': startDate,
      'end_date': endDate
    }));
  }

  // Add department filter
  if (department) {
    const currentParams = params.get('params') ? JSON.parse(params.get('params')) : {};
    currentParams['department'] = department;
    params.set('params', JSON.stringify(currentParams));
  }

  // Add status filter
  if (status) {
    const currentParams = params.get('params') ? JSON.parse(params.get('params')) : {};
    currentParams['status'] = status;
    params.set('params', JSON.stringify(currentParams));
  }

  // Update iframe src
  const newSrc = BASE_URL + '?' + params.toString();
  document.getElementById('dashboardFrame').src = newSrc;

  // Update browser URL to maintain state
  const pageParams = new URLSearchParams();
  if (department) pageParams.set('dept', department);
  if (status) pageParams.set('status', status);
  if (dateRange && dateRange !== 'custom') pageParams.set('days', dateRange);
  
  const newURL = window.location.pathname + (pageParams.toString() ? '?' + pageParams.toString() : '');
  window.history.replaceState({}, '', newURL);
}

function handleIframeLoad() {
  // Hide loading message if present
  const loading = document.querySelector('.loading');
  if (loading) loading.style.display = 'none';
}

function handleIframeError() {
  // Show authentication message if iframe fails to load
  document.getElementById('authMessage').style.display = 'block';
}

// Check user authentication status
function checkAuthentication() {
  // In production, implement your authentication logic here
  // For now, we'll assume user is authenticated
  return true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuthentication()) {
    document.getElementById('authMessage').style.display = 'block';
    return;
  }
  
  initializeFilters();
});

// Post message communication with iframe (for advanced filtering)
window.addEventListener('message', function(event) {
  // Handle messages from Looker Studio iframe if needed
  if (event.origin === 'https://lookerstudio.google.com') {
    console.log('Message from Looker Studio:', event.data);
  }
});