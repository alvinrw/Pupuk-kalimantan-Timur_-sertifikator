import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Edit2, Trash2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { socket } from '../services/socket';

export default function ManajemenPengguna() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ type: '', title: '', user: null });
  const [deleteConfirmData, setDeleteConfirmData] = useState({ isOpen: false, user: null });
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ nama: '', npk: '', username: '', password: '', roleName: 'Admin 2' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      const formattedUsers = response.data.map(u => ({
        id: u.id,
        nama: u.nama,
        npk: u.npk,
        username: u.username,
        role: typeof u.role === 'object' ? u.role.name : u.role,
        isOnline: u.isOnline
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        showToast('Sesi Anda telah habis. Silakan Log Out dan Log In kembali.', 'error');
      } else if (error.response?.status === 403) {
        showToast('Anda tidak memiliki akses ke halaman ini.', 'error');
      } else {
        showToast('Gagal memuat data pengguna. Memeriksa koneksi backend...', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type, title, user = null) => {
    setModalData({ type, title, user });
    if (type === 'add') {
      setFormData({ nama: '', npk: '', username: '', password: '', roleName: 'Admin 2' });
    } else if (type === 'edit') {
      setFormData({ 
        nama: user.nama, 
        npk: user.npk, 
        username: user.username, 
        password: '', // Kosongkan agar tidak perlu diisi jika tidak ingin ganti password
        roleName: user.role 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    // Validasi NPK hanya boleh diisi angka
    if (name === 'npk') {
      value = value.replace(/\D/g, ''); 
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (modalData.type === 'add') {
        if (!formData.nama || !formData.npk || !formData.username || !formData.password) {
          showToast('Mohon lengkapi semua field!', 'error');
          return;
        }
        await api.post('/users', formData);
        showToast('Pengguna berhasil ditambahkan!');
      } else if (modalData.type === 'edit') {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Jangan kirim jika kosong
        await api.patch(`/users/${modalData.user.id}`, payload);
        showToast('Data pengguna berhasil diperbarui!');
      }
      closeModal();
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error saving user:', error);
      showToast(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error');
    }
  };

  const handleDelete = (u) => {
    setDeleteConfirmData({ isOpen: true, user: u });
  };

  const confirmDelete = async () => {
    const u = deleteConfirmData.user;
    if (!u) return;

    try {
      await api.delete(`/users/${u.id}`);
      showToast('Akun berhasil dihapus!');
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(error.response?.data?.message || 'Gagal menghapus pengguna', 'error');
    } finally {
      setDeleteConfirmData({ isOpen: false, user: null });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleStatusChange = ({ userId, isOnline }) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, isOnline } : u
        )
      );
    };

    socket.on('user_status_changed', handleStatusChange);

    return () => {
      socket.off('user_status_changed', handleStatusChange);
    };
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin 1': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Admin 2':
      case 'Admin 3': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'User': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Viewer': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#005ea4]" />
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola hak akses, role, dan data pengguna sistem Sertifikator.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari NPK atau Nama..." 
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]/30 w-64"
            />
          </div>
          <button 
            onClick={() => openModal('add', 'Tambah Pengguna Baru')}
            className="flex items-center gap-2 px-4 py-2 bg-[#005ea4] text-white text-sm font-semibold rounded-lg hover:bg-[#004a82] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Pengguna</th>
                <th className="px-6 py-4 font-semibold">NPK</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#005ea4] rounded-full animate-spin"></div>
                      <p>Memuat data pengguna...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                    Belum ada data pengguna yang ditambahkan.
                  </td>
                </tr>
              ) : users.map((u) => {
                const isAdmin1 = u.role === 'Admin 1';
                const isActionDisabled = isAdmin1 && currentUser.role !== 'Admin 1';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#005ea4] font-bold text-xs">
                        {u.nama.charAt(0)}
                      </div>
                      {u.nama}
                      {isAdmin1 && <Shield className="w-3.5 h-3.5 text-purple-500 ml-1" title="Super Admin" />}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.npk}</td>
                    <td className="px-6 py-4 text-slate-500">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                        <span className={`text-xs font-semibold ${u.isOnline ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {u.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal('edit', `Edit Data: ${u.nama}`, u)}
                          className={`p-1.5 rounded-lg transition-colors ${isActionDisabled ? 'text-slate-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                          disabled={isActionDisabled}
                          title={isActionDisabled ? "Tidak bisa mengubah Admin 1" : "Edit Akun"}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u)}
                          className={`p-1.5 rounded-lg transition-colors ${isAdmin1 ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                          disabled={isAdmin1}
                          title={isAdmin1 ? "Admin 1 Permanen (Tidak bisa dihapus)" : "Hapus Akun"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{modalData.title}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-[#005ea4]/50 outline-none" placeholder="Masukkan Nama..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">NPK</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" name="npk" value={formData.npk} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-[#005ea4]/50 outline-none" placeholder="Masukkan NPK (Hanya Angka)..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-[#005ea4]/50 outline-none" placeholder="Masukkan Username login..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Password {modalData.type === 'edit' && <span className="text-xs text-slate-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-[#005ea4]/50 outline-none" placeholder="Masukkan Password..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Pilih Role</label>
                <select name="roleName" value={formData.roleName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-[#005ea4]/50 outline-none">
                  <option value="Admin 1" disabled={currentUser.role !== 'Admin 1'}>Admin 1</option>
                  <option value="Admin 2">Admin 2</option>
                  <option value="Admin 3">Admin 3</option>
                  <option value="User">User</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Batal
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-[#005ea4] hover:bg-[#004a82] rounded-lg shadow-sm transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteConfirmData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Hapus Akun</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong>{deleteConfirmData.user?.nama}</strong> secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmData({ isOpen: false, user: null })} 
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
