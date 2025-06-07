const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API request function with auth
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Auth API functions
export const loginUser = (credentials) => {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const registerUser = (userData) => {
  return apiRequest('/user', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const logoutUser = () => {
  return apiRequest('/admin/logout', {
    method: 'POST'
  });
};

// Protected API functions (require authentication)
export const getUserPhotos = (userId) => {
  return apiRequest(`/users/${userId}/photos`);
};

export const uploadPhoto = (userId, formData) => {
  return apiRequest(`/users/${userId}/photos`, {
    method: 'POST',
    body: formData,
    headers: {} // Let browser set content-type for FormData
  });
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getUserPhotos,
  uploadPhoto
}; 