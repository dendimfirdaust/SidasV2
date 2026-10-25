import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  HeartHandshake,
  GraduationCap,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Settings,
  DatabaseBackup,
  Menu,
  X,
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'add-student'
  | 'parents'
  | 'classes'
  | 'import'
  | 'reports'
  | 'users'
  | 'settings'
  | 'audit-backup';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userRole }) => {
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);

  // Define navigation items with RBAC visibility
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['admin', 'operator', 'guru'] as UserRole[],
    },
    {
      id: 'students' as ActiveTab,
      label: 'Data Siswa',
      icon: Users,
      allowedRoles: ['admin', 'operator', 'guru'] as UserRole[],
    },
    {
      id: 'add-student' as ActiveTab,
      label: 'Tambah Siswa',
      icon: UserPlus,
      allowedRoles: ['admin', 'operator'] as UserRole[], // Teachers cannot add student
    },
    {
      id: 'parents' as ActiveTab,
      label: 'Data Orang Tua/Wali',
      icon: HeartHandshake,
      allowedRoles: ['admin', 'operator'] as UserRole[],
    },
    {
      id: 'classes' as ActiveTab,
      label: 'Data Kelas & Rombel',
      icon: GraduationCap,
      allowedRoles: ['admin', 'operator', 'guru'] as UserRole[],
    },
    {
      id: 'import' as ActiveTab,
      label: 'Impor Data Excel',
      icon: FileSpreadsheet,
      allowedRoles: ['admin', 'operator'] as UserRole[],
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Laporan & Cetak',
      icon: Printer,
      allowedRoles: ['admin', 'operator', 'guru'] as UserRole[],
    },
    {
      id: 'users' as ActiveTab,
      label: 'Pengguna & Hak Akses',
      icon: ShieldCheck,
      allowedRoles: ['admin'] as UserRole[], // Admin only
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Pengaturan Sekolah',
      icon: Settings,
      allowedRoles: ['admin'] as UserRole[], // Admin only
    },
    {
      id: 'audit-backup' as ActiveTab,
      label: 'Backup & Audit',
      icon: DatabaseBackup,
      allowedRoles: ['admin'] as UserRole[], // Admin only
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50 no-print">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-3 bg-indigo-700 text-white rounded-full shadow-lg hover:bg-indigo-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs no-print"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-transform duration-200 flex flex-col justify-between overflow-y-auto no-print ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>
          <nav className="space-y-0.5">
            {navItems.map(item => {
              const isAllowed = item.allowedRoles.includes(userRole);
              if (!isAllowed) return null;

              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600">SIDAS v1.2 Kemdikbud-Ready</p>
          <p>Database: Relasional Aktif</p>
          <p className="text-[10px] text-slate-400">Hak Akses: {userRole.toUpperCase()}</p>
        </div>
      </aside>
    </>
  );
};
