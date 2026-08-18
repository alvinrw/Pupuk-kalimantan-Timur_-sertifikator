import { useState, useEffect } from 'react';
import {
  getIuranKeanggotaan,
  createIuranKeanggotaan,
  updateIuranKeanggotaan,
  deleteIuranKeanggotaan,
} from '../services/iuranService';

export default function useIuranKeanggotaan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [sortOrder, setSortOrder] = useState('desc');
  const [formData, setFormData] = useState({
    id: '',
    nomer: '',
    kompartemen: '',
    unitKerja: '',
    asosiasi: '',
    periode: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    nominal: '',
    status: 'Belum Lunas',
    nama: '',
    npk: '',
    keterangan: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getIuranKeanggotaan();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedItem(null);
    setFormData({
      id: '',
      nomer: '',
      kompartemen: '',
      unitKerja: '',
      asosiasi: '',
      periode: '',
      tanggalMulai: '',
      tanggalSelesai: '',
      nominal: '',
      status: 'Belum Lunas',
      nama: '',
      npk: '',
      keterangan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    let tMulai = '';
    let tSelesai = '';
    if (item.periode && item.periode.includes(' s/d ')) {
      const parts = item.periode.split(' s/d ');
      tMulai = parts[0].substring(0, 4);
      tSelesai = parts[1].substring(0, 4);
    } else if (item.periode) {
      tMulai = item.periode.substring(0, 4);
      tSelesai = '';
    }

    setFormData({
      id: item.id || '',
      nomer: item.nomer || '',
      kompartemen: item.kompartemen || '',
      unitKerja: item.unitKerja || '',
      asosiasi: item.asosiasi || '',
      periode: item.periode || '',
      tanggalMulai: tMulai,
      tanggalSelesai: tSelesai,
      nominal: item.nominal ? item.nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
      status: item.status || 'Belum Lunas',
      nama: item.nama || '',
      npk: item.npk || '',
      keterangan: item.keterangan || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nominal') {
      const numericValue = value.replace(/\D/g, '');
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPeriode = formData.periode;
      if (formData.tanggalMulai && formData.tanggalSelesai) {
        finalPeriode = `${formData.tanggalMulai} s/d ${formData.tanggalSelesai}`;
      } else if (formData.tanggalMulai) {
        finalPeriode = `${formData.tanggalMulai}`;
      }

      const payload = {
        ...formData,
        periode: finalPeriode,
        nominal: formData.nominal ? parseFloat(formData.nominal.toString().replace(/\./g, '')) : null,
      };
      
      delete payload.tanggalMulai;
      delete payload.tanggalSelesai;

      if (modalMode === 'add') {
        await createIuranKeanggotaan(payload);
      } else {
        await updateIuranKeanggotaan(selectedItem.id, payload);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        await deleteIuranKeanggotaan(id);
        await fetchData();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Gagal menghapus data.');
      }
    }
  };

  return {
    data,
    loading,
    error,
    isModalOpen,
    modalMode,
    formData,
    isSubmitting,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
    handleDelete,
    setData,
    fetchData,
    sortOrder,
    setSortOrder
  };
}
