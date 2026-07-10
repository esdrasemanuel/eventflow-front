// services/auth.js
import api from './api'; // Import your pre-configured global api instance

export const loginService = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email: email,
      password: password,
    });
    
    return response.data; 
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Authentication failed');
    }
    throw new Error('Could not connect to the server');
  }
};