import React from 'react';
import {
  LayoutDashboard,
  Factory,
  Building2,
  FileSpreadsheet,
  FolderKanban,
  PackageCheck,
  Activity,
  History,
  HelpCircle,
  Settings
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuGroups = [
    {
      group: "UTAMA",
      items: [
        { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
      ]
    },
    {
      group: "PERIZINAN & DOKUMEN",
      items: [
        { id: "peralatan-pabrik", label: "Perizinan Peralatan Pabrik", icon: Factory },
        { id: "perizinan-aset", label: "Perizinan Aset", icon: Building2 },
        { id: "administrasi-lainnya", label: "Administrasi Lainnya", icon: FileSpreadsheet },
        { id: "perizinan-proyek", label: "Perizinan Proyek", icon: FolderKanban },
        { id: "perizinan-produk", label: "Perizinan Produk", icon: PackageCheck },
      ]
    },
    {
      group: "MONITORING & SISTEM",
      items: [
        { id: "monitoring", label: "Monitoring & Evaluasi", icon: Activity },
        { id: "informasi-lainnya", label: "Informasi Lainnya", icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col shrink-0 h-screen sticky top-0 z-30 font-sans-clean border-r border-slate-200 shadow-xs">
      {/* Brand Header: CLEAN TULISAN SERTIFIKATOR (TANPA KOTAK S, TANPA LOGO SAMPING, TANPA SUBTITLE PT PUPUK KALTIM) */}
      <div className="h-16 px-6 flex items-center border-b border-slate-200 bg-slate-50/50">
        <h1 className="font-logo-sutasoma text-2xl font-bold tracking-tight text-[#005ea4] select-none">
          SERTIFIKATOR
        </h1>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[11px] font-sans-clean font-bold text-slate-400 uppercase tracking-wider">
              {group.group}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                      isActive
                        ? "bg-[#005ea4] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

    </aside>
  );
}


