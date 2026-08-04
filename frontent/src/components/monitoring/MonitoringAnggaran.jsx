import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Wallet, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import useIuranKeanggotaan from '../../hooks/useIuranKeanggotaan';

const KOMPARTEMEN_COLORS = {
  'Manajemen Keuangan': '#10b981',       // Emerald
  'Satuan Pengawasan Intern': '#f59e0b', // Amber
  'Sekretaris Perusahaan': '#0ea5e9',    // Sky Blue
  'HSE dan Teknologi': '#ef4444',        // Red
  'Sumber Daya Manusia': '#8b5cf6',      // Purple
  'Tidak Diketahui': '#64748b'           // Slate
};
export default function MonitoringAnggaran() {
  const { data, loading, error } = useIuranKeanggotaan();

  const {
    totalAnggaran,
    totalIuran,
    kompartemenData
  } = useMemo(() => {
    let tAnggaran = 0;
    const kompartemenMap = {};
    
    data.forEach(item => {
      const nom = Number(item.nominal) || 0;
      tAnggaran += nom;

      const komp = item.kompartemen || 'Tidak Diketahui';
      if (!kompartemenMap[komp]) {
        kompartemenMap[komp] = 0;
      }
      kompartemenMap[komp] += nom;
    });

    const kompData = Object.keys(kompartemenMap).map(k => ({
      name: k,
      value: kompartemenMap[k]
    })).sort((a, b) => b.value - a.value);

    return {
      totalAnggaran: tAnggaran,
      totalIuran: data.length,
      kompartemenData: kompData
    };
  }, [data]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg text-xs font-mono-data">
          <p className="font-bold text-slate-800 mb-1">{payload[0].name}</p>
          <p className="text-[#005ea4]">{formatRupiah(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#005ea4]" />
        <p className="text-slate-500 font-bold font-mono-data">Memuat Data Anggaran...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 font-bold">
        Gagal memuat data anggaran: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans-clean animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TOTAL ANGGARAN HIGHLIGHT */}
      <div className="bg-gradient-to-r from-[#005ea4] to-[#003f6f] rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden group">
        {/* Ornamen Background */}
        <div className="absolute -right-20 -top-20 bg-white/10 w-64 h-64 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-700"></div>
        <div className="absolute right-10 bottom-0 opacity-10 transform translate-y-1/4">
          <Wallet className="w-48 h-48 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col w-full gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shadow-inner">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-blue-100 uppercase tracking-widest">Total Anggaran Keseluruhan</p>
            </div>
            <h4 className="text-4xl md:text-5xl font-black text-white font-mono-data tracking-tight drop-shadow-sm">
              {formatRupiah(totalAnggaran)}
            </h4>
            <p className="text-sm text-blue-200 mt-3 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Berdasarkan kalkulasi dari <b>{totalIuran} iuran aktif</b> di sistem
            </p>
          </div>
          
          {/* MINI PROGRESS BAR */}
          <div className="mt-2 w-full max-w-3xl">
            <div className="h-2.5 md:h-3 rounded-full flex overflow-hidden bg-blue-900/40 shadow-inner">
              {kompartemenData.map((item, idx) => {
                const pct = totalAnggaran > 0 ? (item.value / totalAnggaran) * 100 : 0;
                return (
                  <div 
                    key={idx}
                    style={{ 
                      width: `${pct}%`,
                      backgroundColor: KOMPARTEMEN_COLORS[item.name] || '#cbd5e1'
                    }}
                    title={`${item.name} (${pct.toFixed(1)}%)`}
                    className="h-full hover:brightness-110 cursor-help"
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] md:text-xs text-blue-200/70 font-mono-data font-medium px-1">
              <span>0%</span>
              <span className="flex-1 text-center">Proporsi Anggaran per Kompartemen</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* PIE CHART */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-lg">Rincian Anggaran</h3>
            <p className="text-xs text-slate-500 font-medium">Berdasarkan total nominal rupiah yang diinput.</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            {kompartemenData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kompartemenData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {kompartemenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={KOMPARTEMEN_COLORS[entry.name] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-mono-data text-xs">
                Tidak ada data
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div className="space-y-4 mt-2">

        {/* GRID KOMPARTEMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kompartemenData.map((item, index) => (
            <div key={index} className="relative group">
              {/* Glowing shadow layer */}
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: KOMPARTEMEN_COLORS[item.name] || '#64748b' }}
              ></div>
              
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden h-full transform transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/50 group-hover:shadow-md">
                <div 
                  className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundColor: KOMPARTEMEN_COLORS[item.name] || '#64748b' }}
                ></div>
                <div className="relative">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ 
                      backgroundColor: `${KOMPARTEMEN_COLORS[item.name] || '#64748b'}20`, 
                      color: KOMPARTEMEN_COLORS[item.name] || '#64748b' 
                    }}
                  >
                    <Wallet className="w-5 h-5" />
                  </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 leading-snug min-h-[34px]" title={item.name}>
                  {item.name === 'Satuan Pengawasan Intern' ? (
                    <>Satuan Pengawasan<br />Intern</>
                  ) : (
                    item.name
                  )}
                </p>
                <h4 className="text-xl font-black text-slate-900 font-mono-data tracking-tight">
                  {formatRupiah(item.value)}
                </h4>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Total rincian anggaran</p>
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>

    </div>
  );
}
