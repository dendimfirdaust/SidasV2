import React, { useState } from 'react';
import {
  School,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types/index.ts';

interface LoginModalProps {
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      setErrorMessage('Username atau kata sandi tidak ditemukan.');
      return;
    }

    if (!user.active) {
      setErrorMessage('Akun ini dinonaktifkan oleh administrator.');
      return;
    }

    onLogin(user);
  };

  const handleQuickDemoLogin = (targetUser: UserProfile) => {
    setUsername(targetUser.username);
    setPassword(`${targetUser.username}123`);
    onLogin(targetUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-md mb-3">
            <School className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">SIDAS NUSANTARA</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Informasi Data Siswa Sekolah Berbasis Web
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="admin / operator / guru"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              <span>Masuk ke Sistem SIDAS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Pilihan Cepat Masuk Peran Pengguna (Demo):
            </p>
            <div className="space-y-1.5">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(u)}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs text-left"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{u.full_name}</span>
                    <span className="text-[10px] text-slate-400 block capitalize">
                      Peran: {u.role === 'admin' ? 'Administrator Utama' : u.role === 'operator' ? 'Operator Dapodik' : 'Guru / Wali Kelas'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Masuk
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
