import axios from 'axios';

// Konfigurasi dasar Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const USE_DUMMY_DATA = import.meta.env.VITE_USE_DUMMY_DATA === 'true';

export default api;
