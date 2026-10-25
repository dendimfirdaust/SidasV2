import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Archive,
  RefreshCw,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';
import { FullStudentData, SchoolClass, UserRole } from '../../types/index.ts';
import { maskSensitiveId, calculateProfileCompleteness } from '../../utils/validation.ts';
import { PdfService } from '../../services/pdfService.ts';
import { ExcelService } from '../../services/excelService.ts';

interface StudentListViewProps {
  students: FullStudentData[];
  classes: SchoolClass[];
  userRole: UserRole;
  onAddStudent: () => void;
  onEditStudent: (student: FullStudentData) => void;
  onViewStudent: (student: FullStudentData) => void;
  onArchiveStudent: (studentId: string) => void;
  onRestoreStudent: (studentId: string) => void;
  onDeletePermanent: (studentId: string) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  classes,
  userRole,
  onAddStudent,
  onEditStudent,
  onViewStudent,
  onArchiveStudent,
  onRestoreStudent,
  onDeletePermanent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReligion, setSelectedReligion] = useState<string>('all');
  const [selectedAdmissionYear, setSelectedAdmissionYear] = useState<string>('all');
  const [selectedCompleteness, setSelectedCompleteness] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'class' | 'year'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showArchived, setShowArchived] = useState(false);
  const [revealSensitive, setRevealSensitive] = useState(false);

  // Available admission years
  const admissionYears = useMemo(() => {
    const set = new Set(students.map(s => s.education?.admission_year || 2026));
    return Array.from(set).sort((a, b) => b - a);
  }, [students]);

  // Filtering and sorting logic
  const filteredStudents = useMemo(() => {
    return students
      .filter(item => {
        // Archive filter
        if (showArchived) {
          if (!item.student.is_archived) return false;
        } else {
          if (item.student.is_archived) return false;
        }

        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = item.student.full_name.toLowerCase().includes(q);
          const matchNisn = item.student.nisn.includes(q);
          const matchNipd = item.student.nipd.includes(q);
          const matchClass = (item.current_class_name || '').toLowerCase().includes(q);
          if (!matchName && !matchNisn && !matchNipd && !matchClass) return false;
        }

        // Class
        if (selectedClass !== 'all' && item.education?.class_id !== selectedClass) {
          return false;
        }

        // Gender
        if (selectedGender !== 'all' && item.student.gender !== selectedGender) {
          return false;
        }

        // Status
        if (selectedStatus !== 'all' && item.student.status !== selectedStatus) {
          return false;
        }

        // Religion
        if (selectedReligion !== 'all' && item.student.religion !== selectedReligion) {
          return false;
        }

        // Admission Year
        if (selectedAdmissionYear !== 'all' && item.education?.admission_year !== parseInt(selectedAdmissionYear)) {
          return false;
        }

        // Completeness
        if (selectedCompleteness !== 'all') {
          const comp = calculateProfileCompleteness({
            nisn: item.student.nisn,
            nipd: item.student.nipd,
            nik: item.student.nik,
            full_name: item.student.full_name,
            birth_place: item.student.birth_place,
            birth_date: item.student.birth_date,
            gender: item.student.gender,
            religion: item.student.religion,
            address: item.address?.full_address,
            father_name: item.father?.full_name,
            mother_name: item.mother?.full_name,
            class_id: item.education?.class_id,
          });
          if (selectedCompleteness === 'complete' && !comp.isComplete) return false;
          if (selectedCompleteness === 'incomplete' && comp.isComplete) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') {
          diff = a.student.full_name.localeCompare(b.student.full_name);
        } else if (sortBy === 'class') {
          diff = (a.current_class_name || '').localeCompare(b.current_class_name || '');
        } else if (sortBy === 'year') {
          diff = (a.education?.admission_year || 2026) - (b.education?.admission_year || 2026);
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [
    students,
    searchTerm,
    selectedClass,
    selectedGender,
    selectedStatus,
    selectedReligion,
    selectedAdmissionYear,
    selectedCompleteness,
    sortBy,
    sortOrder,
    showArchived,
  ]);

  // Pagination calculation
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Daftar Induk Data Siswa</span>
            {showArchived && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                Mode Arsip
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">
            Total {totalItems} siswa ditemukan sesuai kriteria filter aktif
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sensitive data masking toggle for Admin/Operator */}
          {userRole !== 'guru' && (
            <button
              onClick={() => setRevealSensitive(!revealSensitive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                revealSensitive
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={revealSensitive ? 'Sembunyikan data sensitif' : 'Buka enkripsi tampilan data NIK/Telepon'}
            >
              {revealSensitive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{revealSensitive ? 'Tutup Masking NIK' : 'Buka Masking NIK'}</span>
            </button>
          )}

          {/* Export filtered list to Excel */}
          <button
            onClick={() => ExcelService.exportStudents(filteredStudents, 'xlsx', revealSensitive && userRole === 'admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            title="Ekspor data hasil filter ke Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Hasil Filter</span>
          </button>

          {/* Archive / Active view toggle for admin */}
          {userRole === 'admin' && (
            <button
              onClick={() => {
                setShowArchived(!showArchived);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showArchived
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'Kembali ke Data Aktif' : 'Kelola Data Diarsipkan'}</span>
            </button>
          )}

          {/* Add Student CTA */}
          {userRole !== 'guru' && !showArchived && (
            <button
              onClick={onAddStudent}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NISN, NIPD, atau kelas..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Kelas {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Pindah">Pindah</option>
              <option value="Lulus">Lulus</option>
              <option value="Keluar">Keluar</option>
            </select>
          </div>
        </div>

        {/* Extended Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Gender */}
          <select
            value={selectedGender}
            onChange={e => setSelectedGender(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Semua Gender (L/P)</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>

          {/* Religion */}
          <select
            value={selectedReligion}
            onChange={e => setSelectedReligion(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Semua Agama</option>
            <option value="Islam">Islam</option>
            <option value="Kristen">Kristen</option>
            <option value="Katolik">Katolik</option>
            <option value="Hindu">Hindu</option>
            <option value="Buddha">Buddha</option>
            <option value="Konghucu">Konghucu</option>
          </select>

          {/* Admission Year */}
          <select
            value={selectedAdmissionYear}
            onChange={e => setSelectedAdmissionYear(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Semua Tahun Masuk</option>
            {admissionYears.map(yr => (
              <option key={yr} value={yr}>
                Tahun Masuk {yr}
              </option>
            ))}
          </select>

          {/* Completeness */}
          <select
            value={selectedCompleteness}
            onChange={e => setSelectedCompleteness(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
          >
            <option value="all">Kelengkapan Data (Semua)</option>
            <option value="complete">100% Data Lengkap</option>
            <option value="incomplete">Data Belum Lengkap</option>
          </select>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th
                  onClick={() => {
                    if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('name');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Lengkap</span>
                    {sortBy === 'name' && (
                      <span className="text-[10px] text-indigo-600 font-mono">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-3 font-mono">NIPD</th>
                <th className="py-3 px-3 font-mono">NISN</th>
                <th className="py-3 px-3 text-center">L/P</th>
                <th
                  onClick={() => {
                    if (sortBy === 'class') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('class');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Kelas</span>
                    {sortBy === 'class' && (
                      <span className="text-[10px] text-indigo-600 font-mono">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'year') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('year');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Masuk</span>
                    {sortBy === 'year' && (
                      <span className="text-[10px] text-indigo-600 font-mono">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Kelengkapan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-500">Tidak ada data siswa yang cocok dengan filter.</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter kelas.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((item, idx) => {
                  const s = item.student;
                  const comp = calculateProfileCompleteness({
                    nisn: s.nisn,
                    nipd: s.nipd,
                    nik: s.nik,
                    full_name: s.full_name,
                    birth_place: s.birth_place,
                    birth_date: s.birth_date,
                    gender: s.gender,
                    religion: s.religion,
                    address: item.address?.full_address,
                    father_name: item.father?.full_name,
                    mother_name: item.mother?.full_name,
                    class_id: item.education?.class_id,
                  });

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Nomor */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {/* Nama Lengkap & NIK masked */}
                      <td className="py-2.5 px-4">
                        <div
                          onClick={() => onViewStudent(item)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {s.full_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NIK: {revealSensitive ? s.nik || '-' : maskSensitiveId(s.nik)}
                        </div>
                      </td>

                      {/* NIPD */}
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {s.nipd}
                      </td>

                      {/* NISN */}
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700 font-medium">
                        {s.nisn}
                      </td>

                      {/* Gender */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.gender === 'L'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s.gender}
                        </span>
                      </td>

                      {/* Kelas */}
                      <td className="py-2.5 px-3 text-slate-800 font-semibold">
                        {item.current_class_name || '-'}
                      </td>

                      {/* Tahun Masuk */}
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                        {item.education?.admission_year || 2026}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                            s.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.status === 'Pindah'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : s.status === 'Lulus'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      {/* Kelengkapan */}
                      <td className="py-2.5 px-3 text-center">
                        {comp.isComplete ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium"
                            title="Biodata terisi lengkap"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>100%</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium"
                            title={`Kurang: ${comp.missingFields.join(', ')}`}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{comp.percentage}%</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewStudent(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Lihat Detail Biodata"
                            aria-label={`Detail ${s.full_name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => PdfService.generateStudentBiodataPdf(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Cetak Biodata PDF Resmi"
                            aria-label={`Cetak PDF ${s.full_name}`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {userRole !== 'guru' && !showArchived && (
                            <button
                              onClick={() => onEditStudent(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Edit Biodata Siswa"
                              aria-label={`Edit ${s.full_name}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Archive / Delete Action */}
                          {userRole !== 'guru' && !showArchived && (
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin mengarsipkan data siswa "${s.full_name}"?`)) {
                                  onArchiveStudent(s.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Arsipkan Siswa"
                              aria-label={`Arsipkan ${s.full_name}`}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Restore / Purge for Admin */}
                          {userRole === 'admin' && showArchived && (
                            <>
                              <button
                                onClick={() => onRestoreStudent(s.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Pulihkan Data Siswa"
                                aria-label={`Pulihkan ${s.full_name}`}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`PERINGATAN: Tindakan ini akan menghapus data siswa "${s.full_name}" secara PERMANEN dari basis data. Lanjutkan?`)) {
                                    onDeletePermanent(s.id);
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Hapus Permanen"
                                aria-label={`Hapus permanen ${s.full_name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 border border-slate-200 rounded bg-white text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>baris per halaman</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2">
              Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
