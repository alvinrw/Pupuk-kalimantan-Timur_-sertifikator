import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, User } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      login(username, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans-clean">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center">

        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="font-logo-sutasoma text-3xl font-bold tracking-tight text-[#005ea4] select-none text-center">
            PERISAI
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Pengelolaan Riwayat Sertifikasi & Izin
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username / NPK</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005ea4]/50 focus:border-[#005ea4] transition-colors"
                placeholder="Masukkan Username atau NPK"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005ea4]/50 focus:border-[#005ea4] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 bg-[#005ea4] text-white rounded-xl font-bold hover:bg-[#004a82] focus:outline-none focus:ring-4 focus:ring-[#005ea4]/30 transition-all shadow-md active:scale-[0.98]"
          >
            Masuk ke Sistem
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
          <p className="text-xs text-slate-400">
            © 2026 PT Pupuk Kalimantan Timur
          </p>
        </div>
      </div>
    </div>
  );
}
