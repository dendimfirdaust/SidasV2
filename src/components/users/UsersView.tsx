import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  KeyRound,
  Shield,
  User,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types/index.ts';

interface UsersViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onSaveUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [form, setForm] = useState<{
    username: string;
    email: string;
    full_name: string;
    role: UserRole;
    active: boolean;
  }>({
    username: '',
    email: '',
    full_name: '',
    role: 'operator',
    active: true,
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      username: '',
      email: '',
      full_name: '',
      role: 'operator',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      active: user.active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.full_name.trim()) return;

    const payload: UserProfile = {
      id: editingUser ? editingUser.id : `usr_${Date.now()}`,
      username: form.username.trim().toLowerCase(),
      email: form.email.trim(),
      full_name: form.full_name.trim(),
      role: form.role,
      active: form.active,
      created_at: editingUser ? editingUser.created_at : new Date().toISOString(),
    };

    onSaveUser(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengguna & Hak Akses (RBAC)</h1>
          <p className="text-xs text-slate-500">
            Kelola akun petugas sekolah, peran wewenang (Role-Based Access Control), dan keamanan login
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-3">Peran Akses</th>
                <th className="py-3 px-3 text-center">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const roleBadge =
                  u.role === 'admin'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : u.role === 'operator'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[11px]">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <span>{u.full_name}</span>
                          {u.id === currentUser.id && (
                            <span className="ml-2 text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                              Akun Anda
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{u.username}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${roleBadge} capitalize`}>
                        {u.role === 'admin' ? 'Administrator' : u.role === 'operator' ? 'Operator Sekolah' : 'Guru / Wali Kelas'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Edit akun"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus akun pengguna "${u.full_name}"?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Matriks Hak Akses & Kewenangan Pengguna (RBAC Matrix)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Setiap peran memiliki batasan akses teknis demi menjamin kerahasiaan dan privasi data anak
        </p>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold">
                <th className="p-2 border border-slate-200">Fitur & Modul</th>
                <th className="p-2 border border-slate-200 text-center">Administrator</th>
                <th className="p-2 border border-slate-200 text-center">Operator Sekolah</th>
                <th className="p-2 border border-slate-200 text-center">Guru / Wali Kelas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              <tr>
                <td className="p-2 border border-slate-200 font-medium">Dashboard Statistik Real-time</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 font-medium">Tambah & Edit Data Siswa</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-2 border border-slate-200 text-center text-slate-400">✗ Terbatas (Lihat saja)</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 font-medium">Lihat NIK & Nomor HP Sensitif (Masking)</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Buka Masking</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Buka Masking</td>
                <td className="p-2 border border-slate-200 text-center text-rose-600 font-semibold">✗ Disamarkan (Privasi)</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 font-medium">Impor Data Massal Excel (.xlsx)</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-2 border border-slate-200 text-center text-slate-400">✗ Tidak Ada Akses</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 font-medium">Arsipkan & Pulihkan Siswa</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Penuh (Soft & Hard)</td>
                <td className="p-2 border border-slate-200 text-center text-amber-600 font-medium">✓ Hanya Arsip</td>
                <td className="p-2 border border-slate-200 text-center text-slate-400">✗ Tidak Ada Akses</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-200 font-medium">Kelola Akun, Pengaturan Sekolah, & Backup</td>
                <td className="p-2 border border-slate-200 text-center text-emerald-600 font-bold">✓ Administrator Saja</td>
                <td className="p-2 border border-slate-200 text-center text-slate-400">✗ Tidak Ada Akses</td>
                <td className="p-2 border border-slate-200 text-center text-slate-400">✗ Tidak Ada Akses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah / Edit Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {editingUser ? `Edit Akun: ${editingUser.full_name}` : 'Tambah Akun Pengguna Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Pd"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: budi.santoso"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Sekolah</label>
                <input
                  type="email"
                  required
                  placeholder="budi@smpn1nusantara.sch.id"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran Hak Akses (Role)</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value="operator">Operator Sekolah (Kelola Siswa & Impor/Ekspor)</option>
                  <option value="guru">Guru / Wali Kelas (Lihat Data Kelas & Rekap)</option>
                  <option value="admin">Administrator (Akses Penuh Seluruh Sistem)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Akun Aktif (Dapat Login)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
