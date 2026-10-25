import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Search,
  Users,
  Phone,
  Briefcase,
  GraduationCap,
  MapPin,
  Lock,
  Unlock,
} from 'lucide-react';
import { ParentGuardian, UserRole } from '../../types/index.ts';
import { maskPhoneNumber, maskSensitiveId } from '../../utils/validation.ts';

interface ParentsViewProps {
  parentsList: { parent: ParentGuardian; studentNames: string[]; studentCount: number }[];
  userRole: UserRole;
}

export const ParentsView: React.FC<ParentsViewProps> = ({ parentsList, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'father' | 'mother' | 'guardian'>('all');
  const [revealSensitive, setRevealSensitive] = useState(false);

  const filteredParents = useMemo(() => {
    return parentsList.filter(item => {
      if (filterRole !== 'all' && item.parent.role_type !== filterRole) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchParent = item.parent.full_name.toLowerCase().includes(q);
        const matchStudent = item.studentNames.some(name => name.toLowerCase().includes(q));
        const matchJob = (item.parent.job || '').toLowerCase().includes(q);
        return matchParent || matchStudent || matchJob;
      }
      return true;
    });
  }, [parentsList, filterRole, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Direktori Data Orang Tua & Wali</h1>
          <p className="text-xs text-slate-500">
            Daftar terpadu data ayah, ibu, dan wali yang terhubung langsung dengan peserta didik
          </p>
        </div>

        {userRole !== 'guru' && (
          <button
            onClick={() => setRevealSensitive(!revealSensitive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              revealSensitive
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {revealSensitive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{revealSensitive ? 'Tutup Masking Kontak' : 'Buka Masking Kontak'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama orang tua, pekerjaan, atau nama siswa terkait..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value as any)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Kategori (Ayah, Ibu, Wali)</option>
            <option value="father">Hanya Ayah Kandung</option>
            <option value="mother">Hanya Ibu Kandung</option>
            <option value="guardian">Hanya Wali Siswa</option>
          </select>
        </div>
      </div>

      {/* Parents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-lg border border-slate-200">
            Tidak ada data orang tua atau wali yang sesuai kriteria pencarian.
          </div>
        ) : (
          filteredParents.map((item, idx) => {
            const p = item.parent;
            const roleBadge =
              p.role_type === 'father'
                ? { label: 'Ayah Kandung', color: 'bg-blue-50 text-blue-700 border-blue-200' }
                : p.role_type === 'mother'
                ? { label: 'Ibu Kandung', color: 'bg-rose-50 text-rose-700 border-rose-200' }
                : { label: `Wali (${p.relationship_with_student || 'Wali'})`, color: 'bg-amber-50 text-amber-700 border-amber-200' };

            return (
              <div
                key={`${p.id}_${idx}`}
                className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{p.full_name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        NIK: {revealSensitive ? p.nik || '-' : maskSensitiveId(p.nik)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.job || 'Pekerjaan Belum Diisi'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.education || 'Pendidikan Belum Diisi'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">
                        {revealSensitive ? p.phone || '-' : maskPhoneNumber(p.phone)}
                      </span>
                    </div>
                    {userRole === 'admin' && p.monthly_income && revealSensitive && (
                      <div className="text-[11px] text-slate-500 pt-1">
                        Penghasilan: <span className="font-medium text-slate-800">{p.monthly_income}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linked Students Strip */}
                <div className="pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1">
                    <Users className="w-3 h-3 text-indigo-600" />
                    <span>Terhubung dengan {item.studentCount} Siswa:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.studentNames.map((name, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
