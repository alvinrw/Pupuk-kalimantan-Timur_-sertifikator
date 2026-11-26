import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Clock,
  CheckCircle2,
  Filter,
  X,
  RotateCcw,
  Loader2,
  FileMinus,
  Wrench,
  Power,
  Wallet,
  FileX,
  Ban,
  Database,
  Users,
  ChevronDown,
  ShieldCheck,
  Award,
  FileText,
  Lightbulb,
  Search,
  Code2,
  BookOpen,
  Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AnimatedDropdown = ({ value, options, onChange, variant = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLabel = (val) => {
    const opt = options.find(o => o.value === val);
    return opt ? opt.label : val;
  };

  const isLight = variant === 'light';
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none transition-all duration-200 cursor-pointer shadow-xs min-w-[180px] ${
          isLight 
            ? 'bg-white border border-slate-300 text-slate-800 hover:border-[#005ea4] hover:bg-slate-50' 
            : 'bg-slate-700 border border-slate-600 text-white hover:border-[#005ea4] hover:bg-slate-600'
        } ${isOpen && isLight ? 'border-[#005ea4] ring-1 ring-[#005ea4]/20' : ''} ${isOpen && !isLight ? 'border-[#005ea4] ring-1 ring-[#005ea4]/50' : ''}`}
      >
        <span className="truncate">{getLabel(value)}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${isLight ? 'text-slate-400' : 'text-slate-300'}`} />
      </button>

      <div 
        className={`absolute z-50 mt-1 w-max min-w-[100%] rounded-xl border shadow-xl overflow-hidden transform transition-all duration-200 origin-top-left ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        } ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}
      >
        <div className="py-1.5 flex flex-col max-h-[250px] overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`text-left px-3 py-2 text-xs font-semibold transition-colors duration-150 ${
                value === opt.value
                  ? (isLight ? 'bg-blue-50 text-[#005ea4]' : 'bg-slate-700 text-white')
                  : (isLight ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white')
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import * as xlsx from 'xlsx';
import { getMasterItems } from '../services/masterItemsService';
import { getIuranKeanggotaan } from '../services/iuranService';
import MonitoringAnggaran from '../components/monitoring/MonitoringAnggaran';

export default function Dashboard() {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  
  const [activeTab, setActiveTab] = useState('perizinan'); // 'perizinan' | 'administrasi'
  const [filterKategori, setFilterKategori] = useState('All');
  const [customUrgentDays, setCustomUrgentDays] = useState(30);
  const [activeMainTab, setActiveMainTab] = useState('perizinan');

  // States untuk Sub-Tab HAKI di Administrasi & Keanggotaan
  const [activeHakiSubTab, setActiveHakiSubTab] = useState('all'); // 'all' | 'cipta' | 'paten'
  const [hakiSearchTerm, setHakiSearchTerm] = useState('');

  // States untuk filter Tanggal Terbit di bagian bawah
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filterKategoriBawah, setFilterKategoriBawah] = useState('All');

  const [rawItems, setRawItems] = useState([]);
  const [iuranData, setIuranData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [data, iuran] = await Promise.all([
          getMasterItems(),
          getIuranKeanggotaan()
        ]);
        setRawItems(data);
        setIuranData(iuran);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const COLORS = ['#005ea4', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#f97316'];

  const iuranChartData = useMemo(() => {
    const counts = {};
    iuranData.forEach(item => {
      const comp = item.kompartemen || 'Lainnya';
      counts[comp] = (counts[comp] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [iuranData]);

  // Memetakan semua items ke format flat untuk dashboard
  const allDashboardItems = useMemo(() => {
    const calcDiff = (dStr) => {
      if (!dStr || dStr === '-' || dStr === '2030-01-01' || dStr.trim() === '') return -999;
      const expiry = new Date(dStr);
      if (isNaN(expiry.getTime())) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);
      return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const isDecommissionedStatus = (s) => {
      if (!s) return false;
      const lower = String(s).toLowerCase();
      return (
        lower === 'decommissioned' ||
        lower === 'decommissioned' ||
        lower.includes('non-aktif') ||
        lower.includes('non_aktif') ||
        lower.includes('non aktif') ||
        lower.includes('tidak aktif') ||
        lower.includes('inactive')
      );
    };

    const getWfStatus = (certSt, itemSt, docSt) => {
      const lowerCertSt = (certSt || '').toLowerCase();
      const lowerItemSt = (itemSt || '').toLowerCase();

      if (isDecommissionedStatus(lowerCertSt) || isDecommissionedStatus(lowerItemSt)) return 'decommissioned';
      if (
        lowerCertSt === 'perpanjang' || lowerCertSt === 'perpanjangan' || lowerCertSt === 'in progress' || lowerCertSt === 'in_progress' ||
        lowerItemSt === 'perpanjang' || lowerItemSt === 'perpanjangan' || lowerItemSt === 'in progress' || lowerItemSt === 'in_progress'
      ) return 'in_progress';
      if (docSt === 'EXEMPT') return 'exempt';
      return 'completed';
    };

    const flattened = [];
    rawItems.forEach(item => {
      if (item.documentStatus === 'PENDING_DOC') return;

      const rawCerts = item.linkedCertificates || item.history || item.certificates || [];
      const certs = rawCerts.filter(c => {
        const s = (c.status || '').toLowerCase();
        return s !== 'diarsipkan';
      });

      const formatCategoryName = (key) => {
        if (!key) return 'Lainnya';
        if (key === 'peralatan-pabrik' || key.toLowerCase() === 'peralatan pabrik') return 'Perizinan Peralatan Pabrik';
        if (key === 'perizinan-aset' || key.toLowerCase() === 'perizinan aset') return 'Perizinan Aset';
        if (key === 'perizinan-proyek' || key.toLowerCase() === 'perizinan proyek') return 'Perizinan Proyek';
        if (key === 'perizinan-produk' || key.toLowerCase() === 'perizinan produk') return 'Perizinan Produk';
        if (key === 'administrasi-lainnya' || key === 'sertifikat-ciptaan' || key.toLowerCase() === 'sertifikat ciptaan' || key.toLowerCase().includes('administrasi') || key.toLowerCase().includes('cipta') || key.toLowerCase().includes('paten')) return 'Perizinan Administrasi Lainnya';
        return key.charAt(0).toUpperCase() + key.slice(1);
      };

      const formatToDDMMYYYY = (rawDateStr) => {
        if (!rawDateStr || rawDateStr === '-') return '-';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDateStr)) return rawDateStr;
        try {
          const dObj = new Date(rawDateStr);
          if (!isNaN(dObj.getTime())) {
            const dd = String(dObj.getDate()).padStart(2, '0');
            const mm = String(dObj.getMonth() + 1).padStart(2, '0');
            const yyyy = dObj.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
          }
        } catch (_) { }
        return rawDateStr;
      };

      if (item.categoryKey === 'peralatan-pabrik') {
        let meta = {};
        try {
          if (item.keterangan && item.keterangan.startsWith('{')) {
            meta = JSON.parse(item.keterangan);
          }
        } catch (_) {}
        const jenisPeralatanVal = meta.additionalEntities?.find(e => e.key.toUpperCase() === 'JENIS PERALATAN PABRIK')?.value || meta.jenisPeralatan || meta.tipe || 'Peralatan Pabrik';

        if (certs.length === 0) {
          const rawExp = item.expiryDate || '-';
          const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
          const hari = calcDiff(dateVal);
          const wfStatus = getWfStatus(item.status, item.status, item.documentStatus || 'EXEMPT');
          flattened.push({
            id: item.id,
            kategori: formatCategoryName(item.categoryKey || 'peralatan-pabrik'),
            jenis: jenisPeralatanVal,
            unit: item.unitLocation || 'Umum',
            opStatus: item.status || 'Aktif',
            sisaHari: hari,
            workflowStatus: wfStatus,
            merekItem: item.title || '-',
            nomorSeriTipe: item.code || '-',
            nomorSertifikat: item.documentStatus === 'EXEMPT' || item.documentStatus === 'PENDING_DOC' ? 'Tanpa Sertifikat' : '-',
            tglExpired: formatToDDMMYYYY(dateVal),
            tglTerbit: formatToDDMMYYYY(item.issueDate || '-')
          });
        } else {
          // Untuk Peralatan Pabrik, hanya ada 1 sertifikat aktif per item (sisanya adalah history).
          // Ambil sertifikat dengan expiry date paling lama (terbaru).
          const getTimestamp = (dateStr) => {
            if (!dateStr || dateStr === '-') return 0;
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
              const parts = dateStr.split('/');
              return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
            }
            const t = new Date(dateStr).getTime();
            return isNaN(t) ? 0 : t;
          };
          
          const primaryCert = certs.slice().sort((a, b) => getTimestamp(b.expired || b.expiryDate) - getTimestamp(a.expired || a.expiryDate))[0];
          
          if (primaryCert) {
            const rawExp = primaryCert.expired || '-';
            const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
            const rawIssue = primaryCert.terbit || item.issueDate || '-';
            
            flattened.push({
              id: primaryCert.id || item.id,
              kategori: formatCategoryName(item.categoryKey || 'peralatan-pabrik'),
              jenis: jenisPeralatanVal,
              unit: item.unitLocation || 'Umum',
              opStatus: isDecommissionedStatus(primaryCert.status) ? primaryCert.status : (isDecommissionedStatus(item.status) ? item.status : (primaryCert.status || item.status || 'Aktif')),
              sisaHari: calcDiff(dateVal),
              workflowStatus: getWfStatus(primaryCert.status, item.status, primaryCert.status === 'EXEMPT' ? 'EXEMPT' : 'VERIFIED'),
              merekItem: item.title || '-',
              nomorSeriTipe: item.code || '-',
              nomorSertifikat: primaryCert.noSertifikat || primaryCert.noIzin || '-',
              tglExpired: formatToDDMMYYYY(dateVal),
              tglTerbit: formatToDDMMYYYY(rawIssue)
            });
          }
        }
      } else {
        const catKeyLower = String(item.categoryKey || '').toLowerCase();
        const isAdm = catKeyLower === 'administrasi-lainnya' || catKeyLower === 'sertifikat-ciptaan' || catKeyLower === 'hak-cipta' || catKeyLower === 'hak-paten' || catKeyLower.includes('administrasi') || catKeyLower.includes('cipta');
        
        let meta = {};
        try {
          if (item.keterangan && item.keterangan.startsWith('{')) meta = JSON.parse(item.keterangan);
        } catch (_) {}
        
        let jenisVal = meta.additionalEntities?.find(e => e.key.toUpperCase() === 'JENIS PERALATAN')?.value || meta.jenisPeralatan || meta.tipe || item.jenisPeralatan;
        if (isAdm) {
          const checkStr = `${jenisVal || ''} ${item.title || ''} ${item.description || ''} ${meta.tipe || ''}`.toLowerCase();
          jenisVal = checkStr.includes('paten') ? 'Hak Paten' : 'Hak Cipta';
        } else if (!jenisVal) {
          jenisVal = item.title || 'Unknown';
        }

        if (certs.length === 0) {
          const dateVal = (item.expiryDate && item.expiryDate !== '2030-01-01' && item.expiryDate !== '-') ? item.expiryDate : '-';
          flattened.push({
            id: item.id,
            categoryKey: item.categoryKey,
            kategori: formatCategoryName(item.categoryKey),
            jenis: jenisVal,
            unit: item.unitLocation || 'Umum',
            opStatus: item.status || 'Aktif',
            sisaHari: calcDiff(dateVal),
            workflowStatus: getWfStatus(item.status, item.status, item.documentStatus || 'EXEMPT'),
            merekItem: item.title || '-',
            nomorSeriTipe: item.code || '-',
            nomorSertifikat: item.documentStatus === 'EXEMPT' ? 'Tanpa Sertifikat' : (item.noSertifikat || item.code || meta.noSertifikat || '-'),
            tglExpired: formatToDDMMYYYY(dateVal),
            tglTerbit: formatToDDMMYYYY(item.issueDate || '-'),
            keterangan: item.keterangan || ''
          });
        } else {
          certs.forEach(cert => {
            const rawExp = cert.expired || '-';
            const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
            flattened.push({
              id: cert.id || item.id,
              categoryKey: item.categoryKey,
              kategori: formatCategoryName(item.categoryKey),
              jenis: jenisVal,
              unit: item.unitLocation || 'Umum',
              opStatus: isDecommissionedStatus(cert.status) ? cert.status : (isDecommissionedStatus(item.status) ? item.status : (cert.status || item.status || 'Aktif')),
              sisaHari: calcDiff(dateVal),
              workflowStatus: getWfStatus(cert.status, item.status, cert.status === 'EXEMPT' ? 'EXEMPT' : 'VERIFIED'),
              merekItem: item.title || '-',
              nomorSeriTipe: item.code || '-',
              nomorSertifikat: cert.noSertifikat || cert.noIzin || item.noSertifikat || item.code || meta.noSertifikat || '-',
              tglExpired: formatToDDMMYYYY(dateVal),
              tglTerbit: formatToDDMMYYYY(cert.terbit || item.issueDate || '-'),
              keterangan: cert.keterangan || item.keterangan || ''
            });
          });
        }
      }
    });
    return flattened;
  }, [rawItems]);

  const allHistoricalCertificates = useMemo(() => {
    const calcDiff = (dStr) => {
      if (!dStr || dStr === '-' || dStr === '2030-01-01' || dStr.trim() === '') return -999;
      const expiry = new Date(dStr);
      if (isNaN(expiry.getTime())) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);
      return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const isDecommissionedStatus = (s) => {
      if (!s) return false;
      const lower = String(s).toLowerCase();
      return (
        lower === 'decommissioned' ||
        lower === 'decommissioned' ||
        lower.includes('non-aktif') ||
        lower.includes('non_aktif') ||
        lower.includes('non aktif') ||
        lower.includes('tidak aktif') ||
        lower.includes('inactive')
      );
    };

    const getWfStatus = (certSt, itemSt, docSt) => {
      const lowerCertSt = (certSt || '').toLowerCase();
      const lowerItemSt = (itemSt || '').toLowerCase();

      if (isDecommissionedStatus(lowerCertSt) || isDecommissionedStatus(lowerItemSt)) return 'decommissioned';
      if (
        lowerCertSt === 'perpanjang' || lowerCertSt === 'perpanjangan' || lowerCertSt === 'in progress' || lowerCertSt === 'in_progress' ||
        lowerItemSt === 'perpanjang' || lowerItemSt === 'perpanjangan' || lowerItemSt === 'in progress' || lowerItemSt === 'in_progress'
      ) return 'in_progress';
      if (docSt === 'EXEMPT') return 'exempt';
      return 'completed';
    };

    const formatCategoryName = (key) => {
      if (!key) return 'Lainnya';
      if (key === 'peralatan-pabrik' || key.toLowerCase() === 'peralatan pabrik') return 'Perizinan Peralatan Pabrik';
      if (key === 'perizinan-aset' || key.toLowerCase() === 'perizinan aset') return 'Perizinan Aset';
      if (key === 'perizinan-proyek' || key.toLowerCase() === 'perizinan proyek') return 'Perizinan Proyek';
      if (key === 'perizinan-produk' || key.toLowerCase() === 'perizinan produk') return 'Perizinan Produk';
      if (key === 'administrasi-lainnya' || key === 'sertifikat-ciptaan' || key.toLowerCase() === 'sertifikat ciptaan' || key.toLowerCase().includes('administrasi') || key.toLowerCase().includes('cipta') || key.toLowerCase().includes('paten')) return 'Perizinan Administrasi Lainnya';
      return key.charAt(0).toUpperCase() + key.slice(1);
    };

    const formatToDDMMYYYY = (rawDateStr) => {
      if (!rawDateStr || rawDateStr === '-') return '-';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDateStr)) return rawDateStr;
      try {
        const dObj = new Date(rawDateStr);
        if (!isNaN(dObj.getTime())) {
          const dd = String(dObj.getDate()).padStart(2, '0');
          const mm = String(dObj.getMonth() + 1).padStart(2, '0');
          const yyyy = dObj.getFullYear();
          return `${dd}/${mm}/${yyyy}`;
        }
      } catch (_) { }
      return rawDateStr;
    };

    const flattened = [];
    rawItems.forEach(item => {
      if (item.documentStatus === 'PENDING_DOC') return;

      const certs = item.linkedCertificates || item.history || item.certificates || [];
      const catKeyLower = String(item.categoryKey || '').toLowerCase();
      const isAdm = catKeyLower === 'administrasi-lainnya' || catKeyLower === 'sertifikat-ciptaan' || catKeyLower === 'hak-cipta' || catKeyLower === 'hak-paten' || catKeyLower.includes('administrasi') || catKeyLower.includes('cipta');
      
      let meta = {};
      try {
        if (item.keterangan && item.keterangan.startsWith('{')) meta = JSON.parse(item.keterangan);
      } catch (_) {}
      
      let jenisVal = meta.additionalEntities?.find(e => e.key.toUpperCase() === 'JENIS PERALATAN')?.value || meta.jenisPeralatan || meta.tipe || item.jenisPeralatan;
      if (isAdm) {
        const checkStr = `${jenisVal || ''} ${item.title || ''} ${item.description || ''} ${meta.tipe || ''}`.toLowerCase();
        jenisVal = checkStr.includes('paten') ? 'Hak Paten' : 'Hak Cipta';
      } else if (!jenisVal) {
        jenisVal = item.title || 'Unknown';
      }

      if (certs.length === 0) {
        const rawExp = item.expiryDate || '-';
        const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
        flattened.push({
          id: item.id,
          kategori: formatCategoryName(item.categoryKey),
          jenis: jenisVal,
          unit: item.unitLocation || 'Umum',
          opStatus: item.status || 'Aktif',
          sisaHari: calcDiff(dateVal),
          workflowStatus: getWfStatus(item.status, item.status, item.documentStatus || 'EXEMPT'),
          merekItem: item.keterangan ? ((() => { try { return JSON.parse(item.keterangan).merek; } catch(e) { return null; } })() || item.title) : item.title,
          nomorSeriTipe: item.code || '-',
          nomorSertifikat: item.documentStatus === 'EXEMPT' || item.documentStatus === 'PENDING_DOC' ? 'Tanpa Sertifikat' : (item.noSertifikat || '-'),
          tglExpired: formatToDDMMYYYY(dateVal),
          tglTerbit: formatToDDMMYYYY(item.issueDate || '-')
        });
      } else {
        certs.forEach(cert => {
          const rawExp = cert.expired || '-';
          const dateVal = (rawExp && rawExp !== '2030-01-01' && rawExp !== '-') ? rawExp : '-';
          const rawIssue = cert.terbit || item.issueDate || '-';
          flattened.push({
            id: cert.id || item.id,
            kategori: formatCategoryName(item.categoryKey),
            jenis: jenisVal,
            unit: item.unitLocation || 'Umum',
            opStatus: isDecommissionedStatus(cert.status) ? cert.status : (isDecommissionedStatus(item.status) ? item.status : (cert.status || item.status || 'Aktif')),
            sisaHari: calcDiff(dateVal),
            workflowStatus: getWfStatus(cert.status, item.status, cert.status === 'EXEMPT' ? 'EXEMPT' : 'VERIFIED'),
            merekItem: item.keterangan ? ((() => { try { return JSON.parse(item.keterangan).merek; } catch(e) { return null; } })() || item.title) : item.title,
            nomorSeriTipe: item.code || '-',
            nomorSertifikat: cert.noSertifikat || cert.noIzin || '-',
            tglExpired: formatToDDMMYYYY(dateVal),
            tglTerbit: formatToDDMMYYYY(rawIssue)
          });
        });
      }
    });
    return flattened;
  }, [rawItems]);

  const filteredHistoricalCerts = useMemo(() => {
    return allHistoricalCertificates.filter(item => {
      const isNotHaki = item.kategori !== 'Perizinan Administrasi Lainnya' && item.kategori !== 'Perizinan Hak Cipta';
      const matchKategori = filterKategori === 'All' || item.kategori === filterKategori;
      return isNotHaki && matchKategori;
    });
  }, [allHistoricalCertificates, filterKategori]);

  const isPatenItem = (item) => {
    const text = `${item.jenis || ''} ${item.merekItem || ''} ${item.nomorSeriTipe || ''} ${item.nomorSertifikat || ''} ${item.categoryKey || ''} ${item.keterangan || ''}`.toLowerCase();
    return text.includes('paten') || text.includes('patent') || text.startsWith('idp') || text.startsWith('ids');
  };

  const getHakiSubtype = (item) => {
    const text = `${item.jenis || ''} ${item.merekItem || ''} ${item.nomorSeriTipe || ''} ${item.keterangan || ''}`.toLowerCase();
    if (isPatenItem(item)) {
      if (text.includes('sederhana')) return 'Paten Sederhana';
      if (text.includes('biasa')) return 'Paten Biasa';
      return 'Paten Teknologi Industri';
    } else {
      if (text.includes('komputer') || text.includes('software') || text.includes('aplikasi') || text.includes('sistem') || text.includes('it')) {
        return 'Program Komputer';
      }
      if (text.includes('buku') || text.includes('karya tulis') || text.includes('tulis') || text.includes('panduan') || text.includes('modul') || text.includes('sop')) {
        return 'Buku / Karya Tulis';
      }
      if (text.includes('desain') || text.includes('layout') || text.includes('tata letak')) {
        return 'Desain Tata Letak';
      }
      return 'Karya Cipta Terdaftar';
    }
  };

  const hakiDashboardItems = useMemo(() => {
    return allDashboardItems.filter(item => {
      const cat = String(item.kategori || item.categoryKey || '').toLowerCase();
      const jenis = String(item.jenis || '').toLowerCase();
      return (
        item.kategori === 'Perizinan Administrasi Lainnya' ||
        item.kategori === 'Perizinan Hak Cipta' ||
        item.kategori === 'Perizinan Hak Paten' ||
        cat.includes('administrasi') ||
        cat.includes('cipta') ||
        cat.includes('paten') ||
        jenis.includes('cipta') ||
        jenis.includes('paten')
      );
    });
  }, [allDashboardItems]);

  const hakiStats = useMemo(() => {
    const ciptaList = hakiDashboardItems.filter(item => !isPatenItem(item));
    const patenList = hakiDashboardItems.filter(item => isPatenItem(item));

    const activeCipta = ciptaList.filter(item =>
      item.workflowStatus === 'completed' || item.workflowStatus === 'verified' || (item.opStatus || '').toLowerCase() === 'aktif'
    ).length;

    const activePaten = patenList.filter(item =>
      item.workflowStatus === 'completed' || item.workflowStatus === 'verified' || (item.opStatus || '').toLowerCase() === 'aktif'
    ).length;

    const total = hakiDashboardItems.length;
    const activeTotal = activeCipta + activePaten;

    return {
      total,
      totalCipta: ciptaList.length,
      totalPaten: patenList.length,
      activeCipta,
      activePaten,
      activeTotal,
      activePercent: total > 0 ? Math.round((activeTotal / total) * 100) : 100
    };
  }, [hakiDashboardItems]);

  const displayedHakiItems = useMemo(() => {
    let list = hakiDashboardItems;
    if (activeHakiSubTab === 'cipta') {
      list = list.filter(item => !isPatenItem(item));
    } else if (activeHakiSubTab === 'paten') {
      list = list.filter(item => isPatenItem(item));
    }

    if (hakiSearchTerm.trim()) {
      const q = hakiSearchTerm.toLowerCase();
      list = list.filter(item => {
        const titleMatch = (item.merekItem || '').toLowerCase().includes(q);
        const certMatch = (item.nomorSertifikat || '').toLowerCase().includes(q);
        const codeMatch = (item.nomorSeriTipe || '').toLowerCase().includes(q);
        const unitMatch = (item.unit || '').toLowerCase().includes(q);
        const jenisMatch = (item.jenis || '').toLowerCase().includes(q);
        const subtypeMatch = getHakiSubtype(item).toLowerCase().includes(q);
        return titleMatch || certMatch || codeMatch || unitMatch || jenisMatch || subtypeMatch;
      });
    }

    return list;
  }, [hakiDashboardItems, activeHakiSubTab, hakiSearchTerm]);

  const filteredItems = useMemo(() => {
    return allDashboardItems.filter(item => {
      const isNotHaki = item.kategori !== 'Perizinan Administrasi Lainnya' && item.kategori !== 'Perizinan Hak Cipta';
      const matchKategori = filterKategori === 'All' || item.kategori === filterKategori;
      return isNotHaki && matchKategori;
    });
  }, [allDashboardItems, filterKategori]);

  const stats = useMemo(() => {
    const threshold = parseInt(customUrgentDays) || 30;

    const expired = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari <= 0 && c.workflowStatus !== 'decommissioned').length;
    const urgent = filteredItems.filter(c => c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= threshold && c.workflowStatus !== 'decommissioned').length;
    const valid = filteredItems.filter(c => (c.sisaHari === null || c.sisaHari > threshold) && c.workflowStatus !== 'decommissioned' && c.workflowStatus !== 'exempt').length;

    const decommissioned = filteredItems.filter(c => c.workflowStatus === 'decommissioned').length;
    const exempt = filteredItems.filter(c => c.workflowStatus === 'exempt').length;
    const inProgress = filteredItems.filter(c => c.workflowStatus === 'in_progress' || (c.opStatus || '').toLowerCase().includes('perpanjang')).length;
    const total = filteredItems.length;
    const totalActive = filteredItems.filter(c => c.workflowStatus !== 'decommissioned').length;

    return {
      expired, urgent, valid, threshold,
      decommissioned, exempt, inProgress, total, totalActive
    };
  }, [filteredItems, customUrgentDays]);

  // Data Bar Chart (pemetaan status per kategori)
  const categoryBarData = useMemo(() => {
    const threshold = parseInt(customUrgentDays) || 30;
    const defaultCategories = [
      'Perizinan Peralatan Pabrik',
      'Perizinan Aset',
      'Perizinan Proyek',
      'Perizinan Produk'
    ];
    const isExcluded = (c) => {
      const lower = String(c || '').toLowerCase();
      return lower.includes('administrasi') || lower.includes('cipta') || lower.includes('paten');
    };
    const itemCategories = Array.from(new Set(allDashboardItems.map(i => i.kategori))).filter(c => Boolean(c) && !isExcluded(c));
    const categories = Array.from(new Set([...defaultCategories, ...itemCategories]));

    return categories.map(cat => {
      const catItems = filteredItems.filter(i => i.kategori === cat);
      const isDecommissioned = (c) => c.workflowStatus === 'decommissioned';
      const isPerpanjang = (c) => !isDecommissioned(c) && (c.workflowStatus === 'in_progress' || (c.opStatus || '').toLowerCase().includes('perpanjang') || (c.sisaHari !== null && c.sisaHari > 0 && c.sisaHari <= threshold));
      const isExpired = (c) => !isDecommissioned(c) && !isPerpanjang(c) && (c.sisaHari !== null && c.sisaHari !== -999 && c.sisaHari <= 0);
      const isValid = (c) => !isDecommissioned(c) && c.workflowStatus !== 'exempt' && !isPerpanjang(c) && !isExpired(c);

      const validCount = catItems.filter(isValid).length;
      const perpanjangCount = catItems.filter(isPerpanjang).length;
      const expiredCount = catItems.filter(isExpired).length;
      const decommissionedCount = catItems.filter(isDecommissioned).length;

      return {
        name: cat,
        Valid: validCount,
        Perpanjangan: perpanjangCount,
        Expired: expiredCount,
        Decommissioned: decommissionedCount,
      };
    }).filter(u => filterKategori === 'All' ? (u.Valid > 0 || u.Perpanjangan > 0 || u.Expired > 0 || u.Decommissioned > 0 || defaultCategories.includes(u.name)) : filterKategori === u.name);
  }, [filteredItems, allDashboardItems, filterKategori, customUrgentDays]);

  // Filtering untuk list tabel Terbit di bagian bawah
  const displayedIssuedCertificates = useMemo(() => {
    return filteredHistoricalCerts.filter(item => {
      // 1. Filter by Search Query
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          item.merekItem.toLowerCase().includes(q) ||
          item.jenis.toLowerCase().includes(q) ||
          item.nomorSeriTipe.toLowerCase().includes(q) ||
          item.nomorSertifikat.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Filter by Date Range Terbit
      if (isDateFilterActive) {
        if (!item.tglTerbit || item.tglTerbit === '-') return false;
        let pubDate;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.tglTerbit)) {
          const parts = item.tglTerbit.split('/');
          pubDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          pubDate = new Date(item.tglTerbit);
        }
        if (isNaN(pubDate.getTime())) return false;

        if (dateRangeStart) {
          const start = new Date(dateRangeStart + '-01');
          if (pubDate < start) return false;
        }
        if (dateRangeEnd) {
          const [ey, em] = dateRangeEnd.split('-').map(Number);
          const end = new Date(ey, em, 0); // hari terakhir di bulan tersebut
          if (pubDate > end) return false;
        }
      }
      // 3. Filter by Category khusus Bawah
      if (filterKategoriBawah !== 'All') {
        if (item.kategori !== filterKategoriBawah) return false;
      }

      return true;
    });
  }, [filteredHistoricalCerts, searchTerm, dateRangeStart, dateRangeEnd, isDateFilterActive, filterKategoriBawah]);

  const chartDataSertifikatTerbit = useMemo(() => {
    const counts = {};
    displayedIssuedCertificates.forEach(item => {
      const cat = item.kategori || 'Lainnya';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      Jumlah: counts[key]
    })).sort((a, b) => b.Jumlah - a.Jumlah);
  }, [displayedIssuedCertificates]);

  const handleApplyDateFilter = () => {
    setIsDateFilterActive(!!(dateRangeStart || dateRangeEnd));
  };

  const handleResetDateFilter = () => {
    setDateRangeStart('');
    setDateRangeEnd('');
    setIsDateFilterActive(false);
  };

  const handleExportExcel = () => {
    const dataToExport = displayedIssuedCertificates.map((doc, idx) => ({
      'No': idx + 1,
      'Kategori': doc.kategori || '-',
      'Jenis': doc.jenis || '-',
      'Alat': doc.merekItem || '-',
      'No Seri': doc.nomorSeriTipe || '-',
      'No Sertifikat': doc.nomorSertifikat || '-',
      'Tgl Terbit': doc.tglTerbit !== '-' ? doc.tglTerbit : '-',
      'Tgl Expired': doc.tglExpired !== '-' ? doc.tglExpired : '-',
      'Status': doc.workflowStatus || '-'
    }));
    
    const worksheet = xlsx.utils.json_to_sheet(dataToExport);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data Sertifikat');
    
    xlsx.writeFile(workbook, `data_terbit_sertifikasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowExportMenu(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="font-mono-data font-bold">Memuat Statistik Dashboard Overview...</p>
      </div>
    );
  }

  const getCategoryOptions = () => {
    const predefined = [
      'Perizinan Peralatan Pabrik',
      'Perizinan Aset',
      'Perizinan Proyek',
      'Perizinan Produk'
    ];
    const isExcluded = (c) => {
      const lower = String(c || '').toLowerCase();
      return lower.includes('administrasi') || lower.includes('cipta') || lower.includes('paten');
    };
    const categories = Array.from(new Set(allDashboardItems.map(i => i.kategori)))
      .filter(c => Boolean(c) && !isExcluded(c));
    const combined = Array.from(new Set([...predefined, ...categories]));
    return ['All', ...combined.sort()];
  };

  const indicators = [
    { label: 'Non-Sertifikat', value: stats.exempt, color: '#64748B' },
    { label: 'Non-Aktif', value: stats.decommissioned, color: '#0f172a' },
    { label: 'Aktif', value: stats.valid, color: '#10B981' },
    { label: 'Expired', value: stats.expired, color: '#EF4444' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 font-sans-clean max-w-[1400px] mx-auto bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col space-y-4 pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 font-mono-data text-xs md:text-sm max-w-2xl leading-relaxed">
            Ringkasan status legalitas dan operasional seluruh aset, peralatan pabrik, proyek, dan dokumen HAKI.
          </p>
        </div>
        
        <div className="flex border border-slate-200 rounded-xl p-1 bg-white mb-6 w-max shadow-xs">
          <button 
            onClick={() => setActiveMainTab('perizinan')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'perizinan' ? 'bg-[#005ea4] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileCheck2 className="w-4 h-4" />
            Overview Perizinan & Sertifikat
          </button>
          <button 
            onClick={() => setActiveMainTab('administrasi')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeMainTab === 'administrasi' ? 'bg-[#005ea4] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" />
            Administrasi & Keanggotaan
          </button>
        </div>
      </div>

      {activeMainTab === 'perizinan' ? (
        <>
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-slate-200">
            {/* Inline Filter Kategori */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 relative z-50">
                <Filter className="w-4 h-4 text-slate-500" />
                <label className="text-xs font-bold text-slate-600 font-mono-data whitespace-nowrap">Kategori Perizinan:</label>
                <AnimatedDropdown
                  value={filterKategori}
                  onChange={(val) => setFilterKategori(val)}
                  options={getCategoryOptions().map(cat => ({
                    value: cat,
                    label: cat === 'All' ? 'Semua Jenis Perizinan' : cat
                  }))}
                  variant="light"
                />
              </div>

              {filterKategori !== 'All' && (
                <button
                  onClick={() => setFilterKategori('All')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-lg transition-colors shadow-2xs font-mono-data"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* SUMMARY CARDS SECTION */}
          <div className="space-y-5">
            {/* TOP 2 CARDS UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Total Sertifikat */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#005ea4]/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono-data text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#005ea4]">
                      <Database className="w-4 h-4" />
                    </div>
                    Total Sertifikat
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
                    Semua Sertifikat
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#005ea4] tracking-tight">
                    {filteredHistoricalCerts.length}
                  </span>
                  <span className="text-sm font-bold text-slate-500 font-mono-data">Sertifikat</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono-data">
                  Jumlah seluruh sertifikat yang dikelola (aktif maupun tertimbun/histori)
                </p>
              </div>

              {/* Card 2: Aktif */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-mono-data text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    Aktif
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-mono border border-emerald-200">
                    Status Aktif
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-600 tracking-tight">
                    {stats.valid + stats.urgent}
                  </span>
                  <span className="text-sm font-bold text-slate-500 font-mono-data">Sertifikat</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono-data">
                  Jumlah sertifikat yang saat ini sedang aktif & berlaku
                </p>
              </div>
            </div>

            {/* BOTTOM 3 CARDS STATUS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Expired */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-300 transition-all">
                <div className="flex flex-col space-y-2">
                  <span className="text-slate-500 font-mono-data text-[11px] font-bold uppercase flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    Expired
                  </span>
                  <div className="flex items-end gap-1.5 pt-1">
                    <span className="text-2xl font-black text-rose-600">{stats.expired}</span>
                    <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">Sertifikat</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Perpanjangan */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all">
                <div className="flex flex-col space-y-2">
                  <span className="text-slate-500 font-mono-data text-[11px] font-bold uppercase flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    Perpanjangan
                  </span>
                  <div className="flex items-end gap-1.5 pt-1">
                    <span className="text-2xl font-black text-amber-600">
                      {stats.inProgress + stats.urgent}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">Sertifikat</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Non-Aktif */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-400 transition-all">
                <div className="flex flex-col space-y-2">
                  <span className="text-slate-500 font-mono-data text-[11px] font-bold uppercase flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Ban className="w-3.5 h-3.5" />
                    </div>
                    Non-Aktif
                  </span>
                  <div className="flex items-end gap-1.5 pt-1">
                    <span className="text-2xl font-black text-slate-700">{stats.decommissioned}</span>
                    <span className="text-[11px] text-slate-500 font-mono-data mb-0.5">Sertifikat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* CHART VISUALISASI (PEMETAAN STATUS PER KATEGORI PERIZINAN) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Pemetaan Status Kategori Perizinan</h3>
            <p className="text-xs text-slate-500 font-mono-data mt-0.5">Distribusi sertifikat aktif, perpanjangan, expired, dan non-aktif per kategori.</p>
          </div>
        </div>

        <div className="h-[320px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
              <Bar dataKey="Valid" stackId="a" fill="#10B981" name="Aktif" />
              <Bar dataKey="Perpanjangan" stackId="a" fill="#F59E0B" name="Perpanjangan" />
              <Bar dataKey="Expired" stackId="a" fill="#EF4444" name="Expired" />
              <Bar dataKey="Decommissioned" stackId="a" fill="#64748B" name="Non-Aktif" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION: Sertifikat Terbit — Filter + Tabel */}
      <div className="pt-8 mt-8 border-t border-slate-200">
        <div className="mb-4 flex flex-col xl:flex-row xl:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <Database className="w-5 h-5 text-[#005ea4]" />
              Data Sertifikat Terbit
              <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-[#005ea4] text-xs rounded-full font-bold">
                {displayedIssuedCertificates.length} Total
              </span>
            </h2>
            <p className="text-sm text-slate-500 font-medium ml-7">Riwayat sertifikat yang telah terbit berdasarkan rentang waktu dan kategori.</p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 ml-7 xl:ml-0">
            {!isViewer && (
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs font-mono-data"
              >
                Export Excel
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-end gap-4 mb-0">
          {/* Date Range */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono-data font-bold mb-0.5">Dari</span>
              <input
                type="month"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
              />
            </div>
            <span className="text-slate-400 text-xs mb-1.5">s.d.</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono-data font-bold mb-0.5">Sampai</span>
              <input
                type="month"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
              />
            </div>
            <button
              onClick={handleApplyDateFilter}
              className="px-3.5 py-1 bg-[#005ea4] hover:bg-[#004881] text-white font-bold text-xs rounded-lg transition-colors font-mono-data shadow-xs mb-0.5"
            >
              Terapkan
            </button>
            {isDateFilterActive && (
              <button
                onClick={handleResetDateFilter}
                className="px-2 py-1 text-slate-300 hover:text-white font-bold text-xs rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors flex items-center gap-1 mb-0.5"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-slate-600" />

          {/* Category Filter */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono-data font-bold mb-0.5 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Kategori / Jenis Perizinan
              </span>
              <AnimatedDropdown
                variant="dark"
                value={filterKategoriBawah}
                onChange={setFilterKategoriBawah}
                options={[
                  { value: 'All', label: 'Semua Jenis Perizinan' },
                  ...getCategoryOptions().filter(cat => cat !== 'All').map(cat => ({
                    value: cat,
                    label: cat
                  }))
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Sertifikat Terbit */}
      {chartDataSertifikatTerbit.length > 0 && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 font-mono-data">Grafik Distribusi Kategori Sertifikat Terbit</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataSertifikatTerbit} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Bar dataKey="Jumlah" fill="#005ea4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
              <th className="py-3 px-4 text-center font-bold">NO.</th>
              <th className="py-3 px-4 font-bold text-[#005ea4]">KATEGORI DOKUMEN</th>
              <th className="py-3 px-4 font-bold">JENIS PERALATAN</th>
              <th className="py-3 px-4 font-bold">NAMA / OBJEK PERIZINAN</th>
              <th className="py-3 px-4 font-bold">NOMOR SERI</th>
              <th className="py-3 px-4 font-bold">NO. SERTIFIKAT</th>
              <th className="py-3 px-4 font-bold">TANGGAL TERBIT</th>
              <th className="py-3 px-4 font-bold">TANGGAL EXPIRATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {displayedIssuedCertificates.length > 0 ? (
              displayedIssuedCertificates.map((item, index) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono-data font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#005ea4]">
                      {item.kategori}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {item.jenis}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.merekItem}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-slate-600">
                      {item.nomorSeriTipe}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-slate-800">
                      {item.nomorSertifikat}
                    </td>
                    <td className="py-3 px-4 font-mono-data font-bold text-slate-700">
                      {item.tglTerbit !== '-' ? item.tglTerbit : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono-data font-bold text-slate-900">
                      {item.tglExpired !== '-' ? item.tglExpired : '-'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500 font-mono-data">
                  Tidak ada sertifikat yang terbit pada kriteria/rentang ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      ) : (
        <div className="space-y-8 pb-10">
          <MonitoringAnggaran />
          
          {/* HAKI / Kekayaan Intelektual Section (Opsi 1: Card Terpadu dengan Sub-Tab Switcher) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Card Header & Sub-Tab Pill Switcher */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-[#005ea4] shadow-xs shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">Kekayaan Intelektual (HAKI)</h2>
                  <p className="text-xs font-mono-data text-slate-500 mt-0.5">
                    Monitoring perlindungan hak cipta karya program komputer, modul teknis, dan hak paten invensi teknologi industri.
                  </p>
                </div>
              </div>

              {/* Sub-Tab Switcher */}
              <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 shadow-2xs self-start lg:self-auto shrink-0">
                <button
                  onClick={() => setActiveHakiSubTab('all')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeHakiSubTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Semua HAKI
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono-data ${
                    activeHakiSubTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-300/80 text-slate-700'
                  }`}>
                    {hakiStats.total}
                  </span>
                </button>

                <button
                  onClick={() => setActiveHakiSubTab('cipta')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeHakiSubTab === 'cipta'
                      ? 'bg-[#005ea4] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Hak Cipta
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono-data ${
                    activeHakiSubTab === 'cipta' ? 'bg-blue-800 text-white' : 'bg-slate-300/80 text-slate-700'
                  }`}>
                    {hakiStats.totalCipta}
                  </span>
                </button>

                <button
                  onClick={() => setActiveHakiSubTab('paten')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeHakiSubTab === 'paten'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Hak Paten
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono-data ${
                    activeHakiSubTab === 'paten' ? 'bg-amber-800 text-white' : 'bg-slate-300/80 text-slate-700'
                  }`}>
                    {hakiStats.totalPaten}
                  </span>
                </button>
              </div>
            </div>

            {/* Mini KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-gradient-to-r from-blue-50/20 via-white to-amber-50/20 border-b border-slate-200">
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#005ea4] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-data tracking-wider block">
                    Hak Cipta Terdaftar
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-slate-800 font-mono-data">{hakiStats.totalCipta}</span>
                    <span className="text-xs text-slate-500 font-mono-data">Software & Modul Panduan</span>
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-data tracking-wider block">
                    Hak Paten Terlindungi
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-slate-800 font-mono-data">{hakiStats.totalPaten}</span>
                    <span className="text-xs text-slate-500 font-mono-data">Invensi & Formulasi Industri</span>
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-data tracking-wider block">
                    Kepatuhan Legalitas
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-emerald-600 font-mono-data">{hakiStats.activeTotal}</span>
                    <span className="text-xs text-slate-500 font-mono-data">Status Aktif ({hakiStats.activePercent}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar Filter & Pencarian Cepat */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[260px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={hakiSearchTerm}
                  onChange={(e) => setHakiSearchTerm(e.target.value)}
                  placeholder={
                    activeHakiSubTab === 'cipta'
                      ? "Cari nama program komputer, judul buku, no. EC..."
                      : activeHakiSubTab === 'paten'
                      ? "Cari judul invensi paten, no. IDP, unit inventor..."
                      : "Cari judul karya/paten, no. sertifikat, unit pemilik..."
                  }
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005ea4] focus:border-transparent font-mono-data"
                />
                {hakiSearchTerm && (
                  <button
                    onClick={() => setHakiSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-mono-data flex items-center gap-2">
                <span>Menampilkan <strong className="text-slate-800">{displayedHakiItems.length}</strong> dokumen</span>
                {activeHakiSubTab !== 'all' && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    (filter aktif: <strong className="text-slate-600">{activeHakiSubTab === 'cipta' ? 'Hak Cipta' : 'Hak Paten'}</strong>)
                  </span>
                )}
              </div>
            </div>

            {/* TABEL DATA ADAPTIF */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono-data text-slate-700 uppercase tracking-wider select-none">
                    <th className="py-3.5 px-4 text-center font-bold w-12">No</th>
                    {activeHakiSubTab === 'all' && (
                      <th className="py-3.5 px-4 font-bold text-center w-28">Tipe HAKI</th>
                    )}
                    <th className="py-3.5 px-4 font-bold text-slate-800">
                      {activeHakiSubTab === 'cipta'
                        ? 'Judul Ciptaan'
                        : activeHakiSubTab === 'paten'
                        ? 'Judul Invensi Paten'
                        : 'Judul Ciptaan / Paten'}
                    </th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      {activeHakiSubTab === 'cipta'
                        ? 'Jenis Ciptaan'
                        : activeHakiSubTab === 'paten'
                        ? 'Kategori Paten'
                        : 'Kategori / Subtipe'}
                    </th>
                    <th className="py-3.5 px-4 font-bold">
                      {activeHakiSubTab === 'cipta'
                        ? 'No. Sertifikat'
                        : activeHakiSubTab === 'paten'
                        ? 'No. Paten (DJKI)'
                        : 'No. Sertifikat / Registrasi'}
                    </th>
                    <th className="py-3.5 px-4 font-bold">
                      {activeHakiSubTab === 'paten' ? 'Inventor / Unit Riset' : 'Unit Pemilik'}
                    </th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      {activeHakiSubTab === 'paten' ? 'Tanggal Granted' : 'Tanggal Terbit'}
                    </th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      {activeHakiSubTab === 'cipta'
                        ? 'Masa Perlindungan'
                        : activeHakiSubTab === 'paten'
                        ? 'Masa Kedaluwarsa'
                        : 'Masa Berlaku'}
                    </th>
                    <th className="py-3.5 px-4 text-center font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {displayedHakiItems.length > 0 ? (
                    displayedHakiItems.map((item, idx) => {
                      const isPaten = isPatenItem(item);
                      const subtype = getHakiSubtype(item);

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono-data">
                            {idx + 1}
                          </td>

                          {activeHakiSubTab === 'all' && (
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                isPaten
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-300'
                              }`}>
                                {isPaten ? <Lightbulb className="w-3 h-3 text-amber-600" /> : <Code2 className="w-3 h-3 text-[#005ea4]" />}
                                {isPaten ? 'Hak Paten' : 'Hak Cipta'}
                              </span>
                            </td>
                          )}

                          <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">
                            <div className="font-semibold text-slate-900 leading-snug">
                              {item.merekItem !== 'Unknown' && item.merekItem !== '-' ? item.merekItem : (item.title || item.jenis)}
                            </div>
                            <div className="text-[10px] font-normal text-slate-400 font-mono-data mt-0.5">
                              ID: {item.nomorSeriTipe !== '-' ? item.nomorSeriTipe : (item.code || item.id)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-md border font-mono-data ${
                              subtype.includes('Komputer')
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : subtype.includes('Buku') || subtype.includes('Karya')
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : subtype.includes('Sederhana')
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : subtype.includes('Biasa')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {subtype}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono-data font-bold text-slate-700 text-xs">
                            {item.nomorSertifikat && item.nomorSertifikat !== '-' && item.nomorSertifikat !== 'Tanpa Sertifikat'
                              ? item.nomorSertifikat
                              : (item.nomorSeriTipe && item.nomorSeriTipe !== '-' ? item.nomorSeriTipe : '-')}
                          </td>

                          <td className="py-3.5 px-4 font-medium text-slate-700 text-xs">
                            {item.unit && item.unit !== 'Umum' ? item.unit : 'Kantor Pusat / Umum'}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono-data text-slate-600 text-xs">
                            {item.tglTerbit !== '-' ? item.tglTerbit : '-'}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono-data font-semibold text-slate-700 text-xs">
                            {item.tglExpired && item.tglExpired !== '-'
                              ? item.tglExpired
                              : (isPaten ? '20 Tahun' : 'Seumur Hidup')}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                              item.workflowStatus === 'completed' || item.workflowStatus === 'verified' || (item.opStatus || '').toLowerCase() === 'aktif'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : item.workflowStatus === 'exempt'
                                ? 'bg-slate-100 text-slate-600 border-slate-300'
                                : (item.opStatus || '').toLowerCase().includes('perpanjang')
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : (item.opStatus || '').toLowerCase() === 'expired'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              {item.opStatus || 'Aktif'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={activeHakiSubTab === 'all' ? 9 : 8} className="py-14 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                            {activeHakiSubTab === 'paten' ? (
                              <Lightbulb className="w-6 h-6 text-amber-500" />
                            ) : activeHakiSubTab === 'cipta' ? (
                              <Code2 className="w-6 h-6 text-[#005ea4]" />
                            ) : (
                              <FileCheck2 className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">
                              {hakiSearchTerm 
                                ? "Tidak ada dokumen yang cocok dengan kata kunci"
                                : activeHakiSubTab === 'paten'
                                ? "Belum ada data Hak Paten yang didaftarkan"
                                : activeHakiSubTab === 'cipta'
                                ? "Belum ada data Hak Cipta yang didaftarkan"
                                : "Belum ada data Hak Cipta & Hak Paten"}
                            </p>
                            <p className="text-xs text-slate-400 font-mono-data mt-1 leading-relaxed">
                              {hakiSearchTerm
                                ? `Hasil pencarian untuk "${hakiSearchTerm}" nihil. Coba gunakan kata kunci nomor sertifikat atau judul lain.`
                                : "Data baru dapat ditambahkan melalui menu Perizinan Administrasi Lainnya di sidebar."}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
