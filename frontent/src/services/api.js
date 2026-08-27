import axios from 'axios';

// Konfigurasi dasar Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Kirim dan terima cookies (HttpOnly) otomatis
});

// Interceptor response untuk menangani Token Expired (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Jika error 401 dan bukan sedang mencoba refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        // Coba perpanjang token via HttpOnly Cookie (refresh_token)
        await api.post('/auth/refresh');
        // Jika sukses, ulang request aslinya
        return api(originalRequest);
      } catch (refreshError) {
        // Jika gagal (refresh token invalid/habis), hapus session user
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const USE_DUMMY_DATA = import.meta.env.VITE_USE_DUMMY_DATA === 'true';

export default api;
