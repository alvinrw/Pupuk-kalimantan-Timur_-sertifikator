import React, { useState } from 'react';
import { User, Shield, KeyRound, Mail, IdCard, Activity, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.patch('/users/change-password', {
        currentPassword,
        newPassword
      });
      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengubah password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Accent background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#005ea4]/10 to-transparent rounded-bl-full pointer-events-none -z-0"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&background=005ea4&color=fff&size=80`} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-4 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Online"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.nama}</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <IdCard className="w-4 h-4" /> NPK: {user.npk}
            </p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col md:items-end mt-4 md:mt-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#005ea4]/10 text-[#005ea4] mb-2">
            <Shield className="w-3.5 h-3.5" />
            {user.role}
          </span>
          <p className="text-xs text-slate-500">Akun terdaftar dalam sistem Sertifikator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Informasi Data Diri */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-[#005ea4]" />
              Informasi Pribadi
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                <div className="mt-1 font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{user.nama}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NPK</label>
                <div className="mt-1 font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-mono">{user.npk}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                <div className="mt-1 font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">@{user.username || user.nama.toLowerCase().replace(/\s/g, '_')}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Hak Akses</label>
                <div className="mt-1 font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {user.role} Aktif
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Untuk mengubah data pribadi, silakan hubungi Administrator sistem HR.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Keamanan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-[#005ea4]" />
              Ganti Password
            </h3>
            
            {user.role === 'Viewer' ? (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mt-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Perubahan Password Dinonaktifkan</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Untuk alasan keamanan, akun dengan hak akses <strong>Viewer</strong> tidak diizinkan mengubah password secara mandiri. Silakan hubungi <strong>Super Admin</strong> untuk melakukan reset password.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-6">Pastikan password baru Anda kuat dan belum pernah digunakan sebelumnya.</p>
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Saat Ini</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4]/20 focus:border-[#005ea4] text-sm transition-all"
                    placeholder="Masukkan password lama"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4]/20 focus:border-[#005ea4] text-sm transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4]/20 focus:border-[#005ea4] text-sm transition-all"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#005ea4] hover:bg-[#004780] text-white font-semibold rounded-xl transition-all shadow-sm shadow-[#005ea4]/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : 'Simpan Password'}
                </button>
              </div>
            </form>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
