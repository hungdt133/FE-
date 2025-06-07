const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API request function
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
export const loginUser = async (credentials) => {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const registerUser = async (userData) => {
  return apiRequest('/user', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const logoutUser = async () => {
  return apiRequest('/admin/logout', {
    method: 'POST'
  });
};

// Photo API functions
export const getUserPhotos = async (userId) => {
  return apiRequest(`/photosOfUser/${userId}`);
};

export const getPhotoDetails = async (photoId) => {
  return apiRequest(`/photo/${photoId}`);
};

export const uploadPhoto = async (formData) => {
  return apiRequest('/photos/new', {
    method: 'POST',
    body: formData,
    headers: {} // Let browser set content-type for FormData
  });
};

export const addComment = async (photoId, comment) => {
  return apiRequest(`/commentsOfPhoto/${photoId}`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  });
};

export const getAllUsers = async () => {
  return apiRequest('/users');
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getUserPhotos,
  getPhotoDetails,
  uploadPhoto,
  addComment,
  getAllUsers
}; 

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API request function
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
export const loginUser = async (credentials) => {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const registerUser = async (userData) => {
  return apiRequest('/user', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const logoutUser = async () => {
  return apiRequest('/admin/logout', {
    method: 'POST'
  });
};

// Photo API functions
export const getUserPhotos = async (userId) => {
  return apiRequest(`/photosOfUser/${userId}`);
};

export const getPhotoDetails = async (photoId) => {
  return apiRequest(`/photo/${photoId}`);
};

export const uploadPhoto = async (formData) => {
  return apiRequest('/photos/new', {
    method: 'POST',
    body: formData,
    headers: {} // Let browser set content-type for FormData
  });
};

export const addComment = async (photoId, comment) => {
  return apiRequest(`/commentsOfPhoto/${photoId}`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  });
};

export const getAllUsers = async () => {
  return apiRequest('/users');
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getUserPhotos,
  getPhotoDetails,
  uploadPhoto,
  addComment,
  getAllUsers
}; 