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
  LogOut,
  X
} from 'lucide-react';
import RoleGuard from './RoleGuard';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({ 'admin-dropdown': false, 'informasi-dropdown': false });

  const toggleDropdown = (dropdownId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onMobileClose) onMobileClose(); // tutup drawer di mobile setelah navigasi
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
        { id: "perizinan-proyek", label: "Perizinan Proyek", icon: FolderKanban },
        { id: "perizinan-produk", label: "Perizinan Produk", icon: PackageCheck },
        { 
          id: "administrasi-dropdown", 
          label: "Administrasi Lainnya", 
          icon: FileSpreadsheet,
          isDropdown: true,
          subItems: [
            { id: "iuran-keanggotaan", label: "Data Keanggotaan" }
          ]
        },
      ]
    },
    {
      group: "MONITORING & SISTEM",
      items: [
        { id: "monitoring", label: "Monitoring & Evaluasi", icon: Activity },
        { 
          id: "atur-kolom-baris-dropdown", 
          label: "Atur Kolom & Baris", 
          icon: Settings,
          isDropdown: true,
          roleGuard: ['Super Admin', 'Admin'],
          subItems: [
            { id: "atur-kolom-baris-peralatan", label: "Peralatan Pabrik" },
            { id: "atur-kolom-baris-aset", label: "Perizinan Aset" },
            { id: "atur-kolom-baris-proyek", label: "Perizinan Proyek" },
            { id: "atur-kolom-baris-produk", label: "Perizinan Produk" },
          ]
        },
        { id: "tugas-terdekat", label: "Agenda & Perpanjangan", icon: ClipboardList, roleGuard: ['Super Admin', 'Admin', 'User'] },
        {
          id: "informasi-website",
          label: "Informasi Website",
          icon: HelpCircle,
        },
        { id: "histori-pencatatan", label: "Histori Pencatatan", icon: History, roleGuard: ['Super Admin', 'Admin'] },
        { id: "manajemen-pengguna", label: "Manajemen Pengguna", icon: Users, roleGuard: ['Super Admin', 'Admin'] },
      ]
    }
  ];

  const sidebarContent = (
    <aside className="w-64 bg-white text-slate-800 flex flex-col h-full font-sans-clean border-r border-slate-200 shadow-xs">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-slate-50/50 shrink-0">
        <h1 className="font-logo-sutasoma text-2xl font-bold tracking-tight text-[#005ea4] select-none">
          SERTIFIKATOR
        </h1>
        {/* Tombol close untuk mobile drawer */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
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
                  
                  const dropdownElement = (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => {
                          toggleDropdown(item.id);
                          if (!isOpen) {
                            handleNavClick(item.subItems[0].id);
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
                                  onClick={() => handleNavClick(subItem.id)}
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
                  
                  if (item.roleGuard) {
                    return (
                      <RoleGuard key={item.id} allowedRoles={item.roleGuard}>
                        {dropdownElement}
                      </RoleGuard>
                    );
                  }
                  return dropdownElement;
                }

                const isActive = activeTab === item.id;
                const buttonElement = (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
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
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
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
            <span className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{user?.role?.replace(/Admin \d+/, 'Admin') || 'Sistem RBAC'}</span>
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

  return (
    <>
      {/* ── Desktop: sticky sidebar (lg dan ke atas) ── */}
      <div className="hidden lg:flex h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </div>

      {/* ── Mobile: drawer + overlay ── */}
      {/* Overlay backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
      />

      {/* Drawer slide-in dari kiri */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
