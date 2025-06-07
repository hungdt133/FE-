// Action Types
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

// Action Creators
export const login = (data) => {
  // Store token in localStorage
  localStorage.setItem('token', data.token);
  
  return {
    type: LOGIN,
    payload: data.user
  };
};

export const logout = () => {
  // Remove token from localStorage
  localStorage.removeItem('token');
  
  return {
    type: LOGOUT
  };
};
