import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Users,
  ArrowRightLeft,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Printer,
  Calendar,
} from 'lucide-react';
import { SchoolClass, AcademicYear, FullStudentData, UserRole } from '../../types/index.ts';
import { PdfService } from '../../services/pdfService.ts';

interface ClassManagementViewProps {
  classes: SchoolClass[];
  academicYears: AcademicYear[];
  students: FullStudentData[];
  userRole: UserRole;
  onSaveClass: (cls: SchoolClass) => void;
  onDeleteClass: (classId: string) => void;
  onMoveStudent: (studentId: string, targetClassId: string, reason?: string) => { success: boolean; message?: string };
  onViewStudent: (student: FullStudentData) => void;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  classes,
  academicYears,
  students,
  userRole,
  onSaveClass,
  onDeleteClass,
  onMoveStudent,
  onViewStudent,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // Move Student Modal State
  const [movingStudent, setMovingStudent] = useState<FullStudentData | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [moveReason, setMoveReason] = useState<string>('Perubahan Rombel');
  const [moveMessage, setMoveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Class Form State
  const [classForm, setClassForm] = useState<Partial<SchoolClass>>({
    name: '',
    grade_level: 7,
    rombel: 'A',
    academic_year_id: academicYears.find(y => y.is_active)?.id || academicYears[0]?.id || '',
    homeroom_teacher: '',
    max_capacity: 32,
  });

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const activeStudentsInSelectedClass = students.filter(
    s => !s.student.is_archived && s.student.status === 'Aktif' && s.education?.class_id === selectedClass?.id
  );

  const handleOpenAdd = () => {
    setEditingClass(null);
    setClassForm({
      name: '',
      grade_level: 7,
      rombel: 'A',
      academic_year_id: academicYears.find(y => y.is_active)?.id || academicYears[0]?.id || '',
      homeroom_teacher: '',
      max_capacity: 32,
    });
    setIsAddingClass(true);
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setClassForm({ ...cls });
    setIsAddingClass(true);
  };

  const handleSaveClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name || !classForm.name.trim()) return;

    const payload: SchoolClass = {
      id: editingClass ? editingClass.id : `cls_${Date.now()}`,
      name: classForm.name.trim().toUpperCase(),
      grade_level: Number(classForm.grade_level) || 7,
      rombel: classForm.rombel || 'A',
      academic_year_id: classForm.academic_year_id || academicYears[0].id,
      homeroom_teacher: classForm.homeroom_teacher || 'Belum Ditentukan',
      max_capacity: Number(classForm.max_capacity) || 32,
    };

    onSaveClass(payload);
    setIsAddingClass(false);
    setSelectedClassId(payload.id);
  };

  const handleExecuteMove = () => {
    if (!movingStudent || !targetClassId) return;
    if (targetClassId === movingStudent.education?.class_id) {
      setMoveMessage({ type: 'error', text: 'Kelas tujuan sama dengan kelas asal siswa.' });
      return;
    }

    const res = onMoveStudent(movingStudent.student.id, targetClassId, moveReason);
    if (res.success) {
      setMoveMessage({ type: 'success', text: `Siswa berhasil dipindahkan ke kelas tujuan!` });
      setTimeout(() => {
        setMovingStudent(null);
        setMoveMessage(null);
      }, 1200);
    } else {
      setMoveMessage({ type: 'error', text: res.message || 'Gagal memindahkan siswa.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Data Kelas & Rombongan Belajar</h1>
          <p className="text-xs text-slate-500">
            Atur rombel, kapasitas kelas, penetapan wali kelas, serta mutasi/pemindahan siswa antar kelas
          </p>
        </div>

        {userRole !== 'guru' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kelas Baru</span>
          </button>
        )}
      </div>

      {/* Class Selector Strip & Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {classes.map(cls => {
          const count = students.filter(
            s => !s.student.is_archived && s.student.status === 'Aktif' && s.education?.class_id === cls.id
          ).length;
          const isSelected = cls.id === selectedClassId;

          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`p-3 rounded-lg border text-left transition-all relative ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Kelas {cls.name}</span>
                <span className="text-[10px] text-slate-400">Tk. {cls.grade_level}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-indigo-700 tabular-nums">{count}</span>
                <span className="text-[10px] text-slate-400">/ {cls.max_capacity} siswa</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Class Detail Panel */}
      {selectedClass && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Class Header Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Rombel Kelas {selectedClass.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                  Tingkat {selectedClass.grade_level} · Rombel {selectedClass.rombel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Wali Kelas: <span className="font-semibold text-slate-800">{selectedClass.homeroom_teacher}</span> · 
                Kapasitas: <span className="font-mono tabular-nums">{activeStudentsInSelectedClass.length}/{selectedClass.max_capacity}</span> Siswa
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => PdfService.generateClassListPdf(selectedClass.name, activeStudentsInSelectedClass)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
                title="Cetak daftar hadir / absensi kelas"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cetak Daftar Siswa</span>
              </button>

              {userRole !== 'guru' && (
                <>
                  <button
                    onClick={() => handleOpenEdit(selectedClass)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-slate-200 transition-colors"
                    title="Edit info kelas"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {classes.length > 1 && (
                    <button
                      onClick={() => {
                        if (activeStudentsInSelectedClass.length > 0) {
                          alert(`Tidak dapat menghapus kelas ${selectedClass.name} karena masih berisi ${activeStudentsInSelectedClass.length} siswa aktif.`);
                          return;
                        }
                        if (confirm(`Hapus kelas ${selectedClass.name}?`)) {
                          onDeleteClass(selectedClass.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200 transition-colors"
                      title="Hapus kelas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Student Roster Table in this Class */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-4">Nama Lengkap</th>
                  <th className="py-2.5 px-3 font-mono">NIPD</th>
                  <th className="py-2.5 px-3 font-mono">NISN</th>
                  <th className="py-2.5 px-3 text-center">L/P</th>
                  <th className="py-2.5 px-4">Nama Orang Tua</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Aksi Siswa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeStudentsInSelectedClass.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Belum ada siswa aktif yang ditempatkan di kelas {selectedClass.name}.
                    </td>
                  </tr>
                ) : (
                  activeStudentsInSelectedClass.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {item.student.full_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {item.student.nipd}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {item.student.nisn}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.student.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.student.gender}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {item.father?.full_name || item.mother?.full_name || item.guardian?.full_name || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.student.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewStudent(item)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded"
                            title="Lihat Biodata Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {userRole !== 'guru' && (
                            <button
                              onClick={() => {
                                setMovingStudent(item);
                                setTargetClassId(classes.find(c => c.id !== selectedClass.id)?.id || '');
                                setMoveMessage(null);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                              title="Pindahkan siswa ke kelas lain"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Pindah Kelas</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Kelas */}
      {isAddingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {editingClass ? `Edit Data Kelas ${editingClass.name}` : 'Tambah Kelas Baru'}
            </h2>

            <form onSubmit={handleSaveClassSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 7-A, 8-B, 9-C"
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={classForm.grade_level}
                    onChange={e => setClassForm({ ...classForm, grade_level: parseInt(e.target.value) || 7 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value={7}>Kelas 7</option>
                    <option value={8}>Kelas 8</option>
                    <option value={9}>Kelas 9</option>
                    <option value={10}>Kelas 10</option>
                    <option value={11}>Kelas 11</option>
                    <option value={12}>Kelas 12</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombongan Belajar</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="A, B, C"
                    value={classForm.rombel}
                    onChange={e => setClassForm({ ...classForm, rombel: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wali Kelas</label>
                <input
                  type="text"
                  placeholder="Nama Guru Wali Kelas"
                  value={classForm.homeroom_teacher}
                  onChange={e => setClassForm({ ...classForm, homeroom_teacher: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimal Siswa</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={classForm.max_capacity}
                  onChange={e => setClassForm({ ...classForm, max_capacity: parseInt(e.target.value) || 32 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingClass(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pindahkan Siswa Antar Kelas */}
      {movingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Pindahkan Siswa Antar Kelas</h2>
            <p className="text-xs text-slate-500 mb-4">
              Riwayat penempatan kelas sebelumnya akan tetap dicatat dalam riwayat mutasi
            </p>

            {moveMessage && (
              <div className={`p-2.5 rounded-lg mb-3 text-xs flex items-center gap-2 ${
                moveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {moveMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{moveMessage.text}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900">{movingStudent.student.full_name}</p>
                <p className="text-slate-500 text-[11px]">
                  NISN: {movingStudent.student.nisn} · Kelas Saat Ini: <span className="font-bold text-slate-800">{movingStudent.current_class_name}</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas Tujuan</label>
                <select
                  value={targetClassId}
                  onChange={e => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id} disabled={c.id === movingStudent.education?.class_id}>
                      Kelas {c.name} {c.id === movingStudent.education?.class_id ? '(Kelas Sekarang)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Pemindahan / Catatan</label>
                <input
                  type="text"
                  value={moveReason}
                  onChange={e => setMoveReason(e.target.value)}
                  placeholder="Contoh: Penyeimbangan Rombel, Rekomendasi BK"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMovingStudent(null)}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMove}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Konfirmasi Pindah Kelas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
