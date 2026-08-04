import { useState, useMemo } from 'react';

/**
 * Reusable Custom Hook untuk Manajemen State Tabel (Search, Filter, Sort, & Selection)
 * Digunakan untuk menyatukan logika duplikat pada PeralatanPabrik, PerizinanGeneric, & Monitoring.
 */
export function useTableData({ initialData = [], searchKeys = [] }) {
  const [searchTerm, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeUnit, setActiveUnit] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtered & Sorted Result
  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      // 1. Search Query Filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesSearch = searchKeys.some((key) => {
          const val = item[key];
          return val && String(val).toLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      // 2. Category Filter
      if (activeCategory !== 'All') {
        const kat = item.kategoriDokumen || item.categoryKey || item.kategori || '';
        if (kat !== activeCategory) return false;
      }

      // 3. Unit Pabrik Filter
      if (activeUnit !== 'All') {
        const unit = item.unitPabrik || item.unit || item.lokasi || '';
        if (unit !== activeUnit) return false;
      }

      // 4. Status Filter
      if (activeStatus !== 'All') {
        const stat = item.statusOperasional || item.status || item.documentStatus || '';
        if (stat !== activeStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
      if (sortBy === 'title') {
        const titleA = a.merekItem || a.title || a.namaPeralatan || '';
        const titleB = b.merekItem || b.title || b.namaPeralatan || '';
        return titleA.localeCompare(titleB);
      }
      return 0;
    });
  }, [initialData, searchTerm, activeCategory, activeUnit, activeStatus, sortBy, searchKeys]);

  // Checkbox Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    searchTerm,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeUnit,
    setActiveUnit,
    activeStatus,
    setActiveStatus,
    sortBy,
    setSortBy,
    selectedIds,
    setSelectedIds,
    handleSelectAll,
    handleSelectOne,
    clearSelection,
    filteredData
  };
}
