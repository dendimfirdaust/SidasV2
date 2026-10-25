import React from 'react';
import {
  Bell,
  LogOut,
  Calendar,
  School,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { UserProfile, SchoolSettings } from '../../types/index.ts';

interface NavbarProps {
  currentUser: UserProfile;
  schoolSettings: SchoolSettings;
  activeAcademicYearName: string;
  onLogout: () => void;
  onSwitchUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  schoolSettings,
  activeAcademicYearName,
  onLogout,
  onSwitchUser,
  allUsers,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const roleBadgeColor: Record<string, string> = {
    admin: 'text-indigo-700 bg-indigo-50 border border-indigo-200',
    operator: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    guru: 'text-amber-700 bg-amber-50 border border-amber-200',
  };

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    operator: 'Operator Sekolah',
    guru: 'Guru / Wali Kelas',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 no-print">
      {/* Zone 1: Brand & School Lockup */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-700 text-white shadow-xs">
          <School className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              SIDAS
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-700 tracking-wide">
              {schoolSettings.name || 'SMP NEGERI 1 NUSANTARA'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            NPSN: <span className="font-mono tabular-nums">{schoolSettings.npsn}</span> · Jenjang: {schoolSettings.level}
          </p>
        </div>
      </div>

      {/* Zone 2: Academic Year Indicator */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
        <Calendar className="w-4 h-4 text-indigo-600" />
        <span className="font-medium text-slate-500">Tahun Ajaran Aktif:</span>
        <span className="font-semibold text-slate-900">{activeAcademicYearName}</span>
      </div>

      {/* Zone 3: Notification, User Switcher & Logout */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative"
            title="Notifikasi"
            aria-label="Notifikasi sistem"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Pemberitahuan Sistem</span>
                <span className="text-[11px] text-slate-500">Terkini</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2 rounded bg-slate-50">
                  <p className="font-medium text-slate-800">Tahun Ajaran 2026/2027 Aktif</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dapodik sinkronisasi lokal siap diperbarui.</p>
                </div>
                <div className="p-2 rounded bg-slate-50">
                  <p className="font-medium text-slate-800">Pencadangan Basis Data</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Seluruh data siswa tersimpan aman di storage.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors text-left"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800 text-white text-xs font-bold">
              {currentUser.full_name.charAt(0)}
            </div>
            <div className="hidden sm:block text-xs leading-tight pr-1">
              <p className="font-semibold text-slate-900 truncate max-w-[130px]">{currentUser.full_name}</p>
              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium mt-0.5 ${roleBadgeColor[currentUser.role] || ''}`}>
                {roleLabel[currentUser.role] || currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <p className="text-[11px] text-slate-400 font-medium">Ganti Peran Pengguna (Demo):</p>
              </div>
              {allUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 transition-colors ${
                    u.id === currentUser.id ? 'bg-indigo-50/60 font-semibold text-indigo-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-3.5 h-3.5 ${u.id === currentUser.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <p>{u.full_name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role}</p>
                    </div>
                  </div>
                  {u.id === currentUser.id && (
                    <span className="text-[10px] font-bold text-indigo-600">Aktif</span>
                  )}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Sesi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
