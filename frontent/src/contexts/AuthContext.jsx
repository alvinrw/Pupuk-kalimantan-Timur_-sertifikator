import toast from 'react-hot-toast';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { socket } from '../services/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Ubah null menjadi { nama: "Muhfi", role: "Super Admin" } jika ingin bypass login saat dev
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Karena token sudah diamankan di HttpOnly Cookie, socket.io akan otomatis
  // mengirimkan cookie-nya jika dikonfigurasi dengan withCredentials: true (dilihat di socket.js)
  useEffect(() => {
    if (user) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Verifikasi token saat pertama kali dimuat (misal saat direfresh)
  useEffect(() => {
    const verifyToken = async () => {
      // Hanya verifikasi jika ada data user yang tersimpan
      if (user) {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
          const token = sessionStorage.getItem('token');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch(`${baseUrl}/auth/heartbeat`, {
            method: 'POST',
            headers,
            credentials: 'include'
          });
          
          // Jika token tidak valid / unauthorized
          if (!response.ok) {
            setUser(null);
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('token');
            socket.disconnect();
            console.log("Sesi kedaluwarsa, harap login kembali.");
          }
        } catch (error) {
          console.error("Gagal memverifikasi session ke server", error);
        }
      }
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Penting untuk mengirim/menerima Cookie
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Login gagal, periksa username dan password.');
        return;
      }

      // Simpan data user SAJA, token disimpan rahasia oleh browser via Cookie
      setUser(data.user);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      if (data.access_token) {
        sessionStorage.setItem('token', data.access_token);
        localStorage.setItem('token', data.access_token);
      }
      if (data.refresh_token) {
        sessionStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('refreshToken', data.refresh_token);
      }

      // Koneksi socket akan tertrigger oleh useEffect

      console.log("Login sukses dari backend!", data.user);
    } catch (error) {
      console.error("Error during login", error);
      toast.error('Tidak dapat terhubung ke server.');
    }
  };

  const logout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Otomatis mengirimkan cookies saat logout
        headers: { 
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Error during logout", error);
    } finally {
      socket.disconnect();
      setUser(null);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
