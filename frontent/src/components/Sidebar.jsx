import React, { useState, useEffect, useRef } from 'react';
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
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck
} from 'lucide-react';
import RoleGuard from './RoleGuard';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({ 'admin-dropdown': false, 'informasi-dropdown': false });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdownId) => {
    if (isCollapsed) {
      setIsCollapsed(false); 
      setOpenDropdowns(prev => ({ ...prev, [dropdownId]: true }));
    } else {
      setOpenDropdowns(prev => ({
        ...prev,
        [dropdownId]: !prev[dropdownId]
      }));
    }
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
          label: "Perizinan Administrasi Lainnya", 
          icon: FileSpreadsheet, 
          isDropdown: true,
          roleGuard: ['Super Admin', 'Admin'],
          subItems: []
        },
        { id: "iuran-keanggotaan", label: "Keanggotaan", icon: Users, roleGuard: ['Super Admin', 'Admin'] },
      ]
    },
    {
      group: "MONITORING & SISTEM",
      items: [
        { id: "monitoring", label: "Monitoring & Evaluasi", icon: Activity },
        { id: "tugas-terdekat", label: "Tugas Terdekat", icon: ClipboardList, roleGuard: ['Super Admin', 'Admin', 'User'] },
        {
          id: "panduan-sop",
          label: "Panduan Pengguna",
          icon: HelpCircle,
        },
        { id: "histori-pencatatan", label: "Histori Pencatatan", icon: History, roleGuard: ['Super Admin', 'Admin'] },
        { id: "manajemen-pengguna", label: "Manajemen Pengguna", icon: Users, roleGuard: ['Super Admin', 'Admin'] },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-white text-slate-800 flex flex-col shrink-0 h-screen sticky top-0 z-30 font-sans-clean border-r border-slate-200 shadow-xs transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px]' : 'w-72'
      }`}
    >
      
      {/* Brand Header */}
      <div className="h-16 flex items-center border-b border-slate-200 bg-slate-50/50 px-3 relative overflow-hidden">
        <div className={`flex items-center gap-2.5 whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[250px] opacity-100'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#005ea4] to-[#003d6d] flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-logo-sutasoma text-xl font-bold tracking-tight text-[#005ea4] select-none pr-2">
            SINTESIS
          </h1>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-[#005ea4] hover:bg-[#005ea4]/10 transition-all duration-300 shrink-0 absolute ${
            isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-3'
          }`}
          title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 space-y-6 custom-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {/* Group Label */}
            <div className="px-1 mb-2 h-4 flex items-center justify-center relative">
              <div 
                className={`text-[10px] font-sans-clean font-extrabold text-slate-400 uppercase tracking-widest transition-all duration-300 ease-in-out absolute left-2 ${
                  isCollapsed ? 'opacity-0 scale-95 max-w-0' : 'opacity-100 scale-100 max-w-full'
                }`}
              >
                {group.group}
              </div>
              <div 
                className={`text-slate-300 font-black transition-all duration-300 ease-in-out absolute ${
                  isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
              >
                •••
              </div>
            </div>
            
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                
                if (item.isDropdown) {
                  const isOpen = openDropdowns[item.id] && !isCollapsed;
                  const hasActiveChild = item.subItems.some(sub => sub.id === activeTab);
                  
                  const dropdownElement = (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => {
                          toggleDropdown(item.id);
                          if (!isOpen && !isCollapsed && item.subItems?.length > 0) {
                            setActiveTab(item.subItems[0].id);
                          }
                        }}
                        title={isCollapsed ? item.label : ""}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden ${
                          hasActiveChild && isCollapsed
                            ? "bg-[#005ea4] text-white shadow-md shadow-[#005ea4]/20" 
                            : hasActiveChild
                              ? "bg-blue-50/80 text-[#005ea4]"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                            hasActiveChild && isCollapsed 
                              ? "text-white" 
                              : hasActiveChild 
                                ? "text-[#005ea4]" 
                                : "text-slate-400"
                          }`} />
                          <span 
                            className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                              isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[190px] opacity-100'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <ChevronDown 
                          className={`w-4 h-4 shrink-0 text-slate-400 transform transition-all duration-300 ease-in-out ${
                            isOpen ? '' : '-rotate-90'
                          } ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[20px] opacity-100'}`} 
                        />
                      </button>
                      
                      {/* Sub-items (hanya dirender jika tidak sedang ditutup) */}
                      {!isCollapsed && (
                        <div 
                          className={`grid transition-all duration-300 ease-in-out ${
                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="pl-[38px] pr-2 space-y-1 mt-1 pb-1">
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
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-white' : 'bg-slate-300'}`}></span>
                                    <span className="truncate whitespace-nowrap text-left">{subItem.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
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

                // Normal Item
                const isActive = activeTab === item.id;
                const buttonElement = (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? item.label : ""}
                    className={`w-full flex items-center p-2.5 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden ${
                      isActive
                        ? "bg-[#005ea4] text-white shadow-md shadow-[#005ea4]/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span 
                        className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                          isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[210px] opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
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
      <div className="p-3 border-t border-slate-200 bg-slate-50/50" ref={profileRef}>
        <div className="relative flex justify-center">
          {/* Dropdown Menu Popup (muncul ke arah kanan jika sidebar ditutup) */}
          <div 
            className={`absolute bottom-[calc(100%+0.5rem)] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-200 origin-bottom-left w-48 ${
              isProfileOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
            } ${isCollapsed ? 'left-10' : 'left-0'}`}
          >
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.nama || 'Pengguna'}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">NPK: {user?.npk || '-'}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              <button 
                onClick={() => {
                  setActiveTab('profil');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#005ea4] rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                Profil & Akun
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                Keluar
              </button>
            </div>
          </div>

          {/* Profile Button */}
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center p-2 rounded-xl border transition-all duration-300 w-full overflow-hidden ${
              isProfileOpen 
                ? "bg-slate-100 border-slate-300 shadow-inner" 
                : "bg-white border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300"
            }`}
            title={isCollapsed ? `${user?.nama} (${user?.role})` : ""}
          >
            <div className="flex items-center gap-3">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nama || 'User')}&background=eff6ff&color=005ea4`} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full ring-2 ring-slate-100 object-cover shrink-0" 
              />
              <div 
                className={`flex flex-col text-left transition-all duration-300 ease-in-out whitespace-nowrap ${
                  isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[120px] opacity-100'
                }`}
              >
                <span className="text-sm font-bold text-slate-900 truncate tracking-tight">
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
            </div>
            
            <ChevronDown 
              className={`w-4 h-4 text-slate-400 shrink-0 transform transition-all duration-300 ease-in-out ml-auto ${
                isProfileOpen ? 'rotate-180' : ''
              } ${isCollapsed ? 'max-w-0 opacity-0 ml-0 hidden' : 'max-w-[20px] opacity-100'}`} 
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
