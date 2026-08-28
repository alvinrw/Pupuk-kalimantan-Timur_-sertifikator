import React, { createContext, useState, useContext, useEffect } from 'react';
import { socket } from '../services/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Ubah null menjadi { nama: "Muhfi", role: "Super Admin" } jika ingin bypass login saat dev
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Verifikasi token saat pertama kali dimuat (misal saat direfresh)
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
          const response = await fetch(`${baseUrl}/auth/heartbeat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          // Jika token tidak valid / unauthorized
          if (!response.ok) {
            setUser(null);
            setToken(null);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            socket.disconnect();
            console.log("Sesi kedaluwarsa, harap login kembali.");
          }
        } catch (error) {
          console.error("Gagal memverifikasi token ke server", error);
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
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || 'Login gagal, periksa username dan password.');
        return;
      }

      // Simpan data
      setToken(data.access_token);
      setUser(data.user);
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Dismiss any lingering toasts (like "Password salah")
      toast.dismiss();

      // Koneksi socket (dihapus karena sudah ditangani oleh useEffect di atas saat state token berubah)
      console.log("Login sukses dari backend!", data.user);
    } catch (error) {
      console.error("Error during login", error);
      toast.error('Tidak dapat terhubung ke server.');
    }
  };

  const logout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
      if (token) {
        await fetch(`${baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Error during logout", error);
    } finally {
      socket.disconnect();
      setUser(null);
      setToken(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
