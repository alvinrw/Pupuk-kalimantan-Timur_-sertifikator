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
        alert(data.message || 'Login gagal, periksa username dan password.');
        return;
      }

      // Simpan data user SAJA, token disimpan rahasia oleh browser via Cookie
      setUser(data.user);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      // Koneksi socket akan tertrigger oleh useEffect

      console.log("Login sukses dari backend!", data.user);
    } catch (error) {
      console.error("Error during login", error);
      alert('Tidak dapat terhubung ke server.');
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
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
