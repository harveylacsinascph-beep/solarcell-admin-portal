// Frontend API Configuration
// Save this as config.js in the root directory of your HTML files

const API_BASE_URL = 'http://192.168.100.158:3001/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// Employee functions
const employeeAPI = {
  getAll: () => apiCall('/employees'),
  getById: (id) => apiCall(`/employees/${id}`),
  create: (data) => apiCall('/employees', 'POST', data),
  update: (id, data) => apiCall(`/employees/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/employees/${id}`, 'DELETE')
};

// Attendance functions
const attendanceAPI = {
  getAll: () => apiCall('/attendance'),
  recordTimeIn: (data) => apiCall('/attendance', 'POST', data),
  recordTimeOut: (id, data) => apiCall(`/attendance/${id}`, 'PUT', data)
};

// Leave request functions
const leaveAPI = {
  getAll: () => apiCall('/leave-requests'),
  create: (data) => apiCall('/leave-requests', 'POST', data),
  updateStatus: (id, status) => apiCall(`/leave-requests/${id}`, 'PUT', { status })
};

// Tap log functions
const tapLogAPI = {
  getAll: () => apiCall('/tap-logs'),
  record: (barcode) => apiCall('/tap-logs', 'POST', { barcode })
};

// Schedule event functions
const scheduleAPI = {
  getAll: () => apiCall('/schedule-events'),
  create: (data) => apiCall('/schedule-events', 'POST', data),
  delete: (id) => apiCall(`/schedule-events/${id}`, 'DELETE')
};

// Announcement functions
const announcementAPI = {
  getAll: () => apiCall('/announcements'),
  create: (data) => apiCall('/announcements', 'POST', data),
  delete: (id) => apiCall(`/announcements/${id}`, 'DELETE')
};
