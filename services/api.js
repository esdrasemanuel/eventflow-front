import axios from 'axios';

// CENTRALIZED API URL

const API_URL = 'http://192.168.0.254:3000';
// my machine local IP for Expo Go testing, or a production server.

// Create a global custom instance of Axios with the base URL pre-configured
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Disconnects if the server takes longer than 10 seconds to respond
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;