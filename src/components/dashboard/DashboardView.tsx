import React from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Printer,
  GraduationCap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { DashboardStats, FullStudentData, AuditLog, UserRole } from '../../types/index.ts';
import { ActiveTab } from '../layout/Sidebar.tsx';

interface DashboardViewProps {
  stats: DashboardStats;
  recentStudents: FullStudentData[];
  recentLogs: AuditLog[];
  onNavigate: (tab: ActiveTab) => void;
  onViewStudent: (student: FullStudentData) => void;
  userRole: UserRole;
  onQuickExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentStudents,
  recentLogs,
  onNavigate,
  onViewStudent,
  userRole,
  onQuickExport,
}) => {
  // Max value calculation for class bar chart
  const maxClassCount = Math.max(...stats.classCounts.map(c => c.count), 1);
  const totalStudentsGender = stats.totalMale + stats.totalFemale || 1;
  const malePercent = Math.round((stats.totalMale / totalStudentsGender) * 100);
  const femalePercent = Math.round((stats.totalFemale / totalStudentsGender) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ringkasan Administrasi Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistik terkini dihitung langsung secara real-time dari database sekolah
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {userRole !== 'guru' && (
            <>
              <button
                onClick={() => onNavigate('add-student')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
              <button
                onClick={() => onNavigate('import')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Impor Excel</span>
              </button>
            </>
          )}

          <button
            onClick={onQuickExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor Data</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Active */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Siswa Aktif</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalActive}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Total siswa terdaftar aktif
          </div>
        </div>

        {/* Siswa Laki-laki & Perempuan */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Perbandingan Gender</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{stats.totalMale} L</span>
            <span className="text-slate-300">/</span>
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{stats.totalFemale} P</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {malePercent}% Putra · {femalePercent}% Putri
          </div>
        </div>

        {/* Siswa Baru Tahun Aktif */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Siswa Baru 2026</span>
            <UserPlus className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalNewStudentsThisYear}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Diterima di tahun ajaran aktif
          </div>
        </div>

        {/* Data Belum Lengkap */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Data Belum Lengkap</span>
            <AlertCircle className={`w-4 h-4 ${stats.totalIncompleteData > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalIncompleteData}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {stats.totalIncompleteData === 0 ? 'Semua data telah valid' : 'Perlu dilengkapi orang tua/operator'}
          </div>
        </div>
      </div>

      {/* Secondary Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-slate-600">Siswa Pindah</span>
          <span className="font-bold text-slate-800 font-mono tabular-nums">{stats.totalTransferred}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-slate-600">Siswa Lulus</span>
          <span className="font-bold text-slate-800 font-mono tabular-nums">{stats.totalGraduated}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-slate-600">Siswa Keluar (DO)</span>
          <span className="font-bold text-slate-800 font-mono tabular-nums">{stats.totalDroppedOut}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-slate-600">Data Diarsipkan</span>
          <span className="font-bold text-slate-800 font-mono tabular-nums">{stats.totalArchived}</span>
        </div>
      </div>

      {/* Charts Section: Class Distribution & Religion Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Siswa Berdasarkan Kelas */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Distribusi Siswa per Rombel Kelas</h2>
              <p className="text-xs text-slate-500">Kapasitas rombongan belajar aktif</p>
            </div>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {stats.classCounts.map(item => {
              const widthPct = Math.min(100, Math.round((item.count / maxClassCount) * 100));
              return (
                <div key={item.className} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Kelas {item.className}</span>
                    <span className="font-mono tabular-nums text-slate-900 font-semibold">
                      {item.count} <span className="text-slate-400 font-normal">siswa</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(widthPct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Distribusi Berdasarkan Agama & Rasio Gender */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Komposisi Siswa Berdasarkan Agama</h2>
                <p className="text-xs text-slate-500">Pencatatan data identitas keagamaan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-6">
              {stats.religionCounts.map(rel => (
                <div key={rel.religion} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{rel.religion}</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">{rel.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Ratio Bar */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700">Proporsi Gender Keseluruhan</span>
              <span className="text-slate-500">
                {stats.totalMale} Laki-laki · {stats.totalFemale} Perempuan
              </span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-md overflow-hidden flex">
              <div
                className="h-full bg-indigo-600 transition-all text-[9px] text-white flex items-center justify-center font-bold"
                style={{ width: `${malePercent}%` }}
              >
                {malePercent > 15 ? `${malePercent}%` : ''}
              </div>
              <div
                className="h-full bg-emerald-500 transition-all text-[9px] text-white flex items-center justify-center font-bold"
                style={{ width: `${femalePercent}%` }}
              >
                {femalePercent > 15 ? `${femalePercent}%` : ''}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-indigo-600" /> Laki-laki
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-emerald-500" /> Perempuan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grids: Recently Added Students & Operator Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Siswa Baru Ditambahkan */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Siswa Baru Terdaftar</h2>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
            >
              <span>Semua Siswa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentStudents.slice(0, 5).map(item => (
              <div
                key={item.student.id}
                onClick={() => onViewStudent(item)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {item.student.gender === 'L' ? 'L' : 'P'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{item.student.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      NISN: <span className="font-mono tabular-nums">{item.student.nisn}</span> · Kelas {item.current_class_name || '-'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.student.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Operator Terbaru */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Aktivitas Operator & Log Audit</h2>
            {userRole === 'admin' && (
              <button
                onClick={() => onNavigate('audit-backup')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
              >
                <span>Lihat Seluruh Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {recentLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-2.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{log.user_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
