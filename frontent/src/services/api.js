import axios from 'axios';

// Konfigurasi dasar Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Kirim dan terima cookies (HttpOnly) otomatis
});

// Interceptor request untuk otomatis melampirkan Token Auth jika ada
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response untuk menangani Token Expired (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Jika error 401 dan bukan sedang mencoba refresh token
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
        const refreshRes = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
        const newAccessToken = refreshRes.data?.access_token;
        if (newAccessToken) {
          sessionStorage.setItem('token', newAccessToken);
          localStorage.setItem('token', newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn("Session refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const USE_DUMMY_DATA = import.meta.env.VITE_USE_DUMMY_DATA === 'true';

export default api;
