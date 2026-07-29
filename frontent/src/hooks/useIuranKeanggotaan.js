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
  const [formData, setFormData] = useState({
    nomer: '',
    kompartemen: '',
    unitKerja: '',
    asosiasi: '',
    periode: '',
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
      nomer: '',
      kompartemen: '',
      unitKerja: '',
      asosiasi: '',
      periode: '',
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
    setFormData({
      nomer: item.nomer || '',
      kompartemen: item.kompartemen || '',
      unitKerja: item.unitKerja || '',
      asosiasi: item.asosiasi || '',
      periode: item.periode || '',
      nominal: item.nominal || '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        nominal: formData.nominal ? parseFloat(formData.nominal) : null,
      };

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
  };
}
