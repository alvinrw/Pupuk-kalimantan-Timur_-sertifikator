import React, { useState } from 'react';
import {
  LayoutDashboard,
  Factory,
  Building2,
  FileSpreadsheet,
  FolderKanban,
  PackageCheck,
  Activity,
  ClipboardList,
  History,
  HelpCircle,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import RoleGuard from './RoleGuard';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({ 'admin-dropdown': false, 'informasi-dropdown': false });

  const toggleDropdown = (dropdownId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

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
        { 
          id: "administrasi-dropdown", 
          label: "Administrasi Lainnya", 
          icon: FileSpreadsheet,
          isDropdown: true,
          subItems: [
            { id: "iuran-keanggotaan", label: "Data Keanggotaan" }
          ]
        },
        { id: "perizinan-proyek", label: "Perizinan Proyek", icon: FolderKanban },
        { id: "perizinan-produk", label: "Perizinan Produk", icon: PackageCheck },
      ]
    },
    {
      group: "MONITORING & SISTEM",
      items: [
        { id: "monitoring", label: "Monitoring & Evaluasi", icon: Activity },
        { id: "tugas-terdekat", label: "Tugas Terdekat", icon: ClipboardList, roleGuard: ['Super Admin', 'Admin', 'Admin 1', 'Admin 2', 'Admin 3', 'User'] },
        {
          id: "informasi-dropdown",
          label: "Informasi Lainnya",
          icon: HelpCircle,
          isDropdown: true,
          subItems: [
            { id: "informasi-modul", label: "Modul Aplikasi" },
            { id: "informasi-status", label: "Warna Status Dokumen" },
            { id: "informasi-alur-kerja", label: "Alur Kerja" },
            { id: "informasi-panduan", label: "Panduan Tambah Item" },
            { id: "informasi-kolom-csv", label: "Struktur Kolom & CSV" },
          ]
        },
        { id: "histori-pencatatan", label: "Histori Pencatatan", icon: History, roleGuard: ['Super Admin', 'Admin', 'Admin 1', 'Admin 2', 'Admin 3'] },
        { id: "manajemen-pengguna", label: "Manajemen Pengguna", icon: Users, roleGuard: ['Super Admin', 'Admin', 'Admin 1', 'Admin 2', 'Admin 3'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col shrink-0 h-screen sticky top-0 z-30 font-sans-clean border-r border-slate-200 shadow-xs">
      {/* Brand Header: CLEAN TULISAN SERTIFIKATOR */}
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
                
                if (item.isDropdown) {
                  const isOpen = openDropdowns[item.id];
                  const hasActiveChild = item.subItems.some(sub => sub.id === activeTab);
                  
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => {
                          toggleDropdown(item.id);
                          // If dropdown is currently closed and user clicks, navigate to first sub-item
                          if (!isOpen) {
                            setActiveTab(item.subItems[0].id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                          hasActiveChild
                            ? "bg-[#005ea4]/10 text-[#005ea4]"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${hasActiveChild ? "text-[#005ea4]" : "text-slate-500"}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transform transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                      </button>
                      
                      <div 
                        className={`grid transition-all duration-200 ease-in-out ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pl-9 pr-3 space-y-1 mt-1">
                            {item.subItems.map(subItem => {
                              const isSubActive = activeTab === subItem.id;
                              return (
                                <button
                                  key={subItem.id}
                                  onClick={() => setActiveTab(subItem.id)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                                    isSubActive
                                      ? "bg-[#005ea4] text-white shadow-xs"
                                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-white' : 'bg-slate-300'}`}></span>
                                  {subItem.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const isActive = activeTab === item.id;
                const buttonElement = (
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

                if (item.roleGuard) {
                  return (
                    <RoleGuard key={item.id} allowedRoles={item.roleGuard}>
                      {buttonElement}
                    </RoleGuard>
                  );
                }
                return buttonElement;
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Profile Widget */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nama || 'User')}&background=eff6ff&color=005ea4`} 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full ring-2 ring-slate-100 object-cover shrink-0" 
          />
          <div className="flex flex-col overflow-hidden flex-1">
            <span 
              className="text-sm font-bold text-slate-900 truncate tracking-tight"
              title={user?.nama || 'Pengguna'}
            >
              {(() => {
                const fullName = user?.nama;
                if (!fullName) return 'Pengguna';
                const parts = fullName.trim().split(/\s+/);
                if (parts.length <= 2) return fullName;
                const firstTwo = parts.slice(0, 2).join(' ');
                const abbreviated = parts.slice(2).map(p => p[0].toUpperCase() + '.').join(' ');
                return `${firstTwo} ${abbreviated}`;
              })()}
            </span>
            <span className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{user?.role || 'Sistem RBAC'}</span>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

