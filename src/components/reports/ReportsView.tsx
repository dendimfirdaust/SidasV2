import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Download,
  Users,
  GraduationCap,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { FullStudentData, SchoolClass, SchoolSettings } from '../../types/index.ts';
import { PdfService } from '../../services/pdfService.ts';

interface ReportsViewProps {
  students: FullStudentData[];
  classes: SchoolClass[];
  settings: SchoolSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ students, classes, settings }) => {
  const [reportType, setReportType] = useState<
    'all' | 'by-class' | 'by-gender' | 'new-students' | 'transferred-graduated' | 'individual'
  >('by-class');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.student.id || '');
  const [genderFilter, setGenderFilter] = useState<'L' | 'P'>('L');

  // Filtered dataset for preview
  const activeStudents = students.filter(s => !s.student.is_archived && s.student.status === 'Aktif');

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const selectedStudent = students.find(s => s.student.id === selectedStudentId) || students[0];

  const getReportData = () => {
    switch (reportType) {
      case 'all':
        return activeStudents;
      case 'by-class':
        return activeStudents.filter(s => s.education?.class_id === selectedClassId);
      case 'by-gender':
        return activeStudents.filter(s => s.student.gender === genderFilter);
      case 'new-students':
        return activeStudents.filter(s => s.education?.admission_year === 2026);
      case 'transferred-graduated':
        return students.filter(
          s => !s.student.is_archived && (s.student.status === 'Pindah' || s.student.status === 'Lulus' || s.student.status === 'Keluar')
        );
      default:
        return activeStudents;
    }
  };

  const previewData = getReportData();

  const handlePrintPdf = () => {
    if (reportType === 'individual') {
      if (selectedStudent) {
        PdfService.generateStudentBiodataPdf(selectedStudent, settings);
      }
    } else {
      const title =
        reportType === 'by-class'
          ? `Kelas ${selectedClass?.name || ''}`
          : reportType === 'by-gender'
          ? `Siswa ${genderFilter === 'L' ? 'Laki-laki' : 'Perempuan'}`
          : reportType === 'new-students'
          ? 'Siswa Baru 2026/2027'
          : reportType === 'transferred-graduated'
          ? 'Siswa Mutasi, Lulus & Keluar'
          : 'Seluruh Siswa Aktif';

      PdfService.generateClassListPdf(title, previewData, settings);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pusat Laporan & Cetak PDF Resmi</h1>
          <p className="text-xs text-slate-500">
            Cetak format resmi standar A4 dengan Kop Surat Sekolah, Buku Induk Siswa, dan Rekapitulasi Rombel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBrowserPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Langsung (Printer)</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Berkas PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Bar */}
      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Laporan
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="by-class">1. Daftar Siswa Berdasarkan Kelas</option>
              <option value="all">2. Daftar Seluruh Siswa Aktif</option>
              <option value="by-gender">3. Daftar Siswa Berdasarkan Gender (L/P)</option>
              <option value="new-students">4. Daftar Siswa Baru (Tahun Ajaran Aktif)</option>
              <option value="transferred-graduated">5. Daftar Siswa Pindah / Lulus / Keluar</option>
              <option value="individual">6. Biodata Individual Siswa (Buku Induk)</option>
            </select>
          </div>

          {/* Conditional Dropdown for Class */}
          {reportType === 'by-class' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Kelas
              </label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Dropdown for Gender */}
          {reportType === 'by-gender' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Jenis Kelamin
              </label>
              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value as any)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          )}

          {/* Conditional Dropdown for Individual Student */}
          {reportType === 'individual' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Peserta Didik
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                {students.map(s => (
                  <option key={s.student.id} value={s.student.id}>
                    {s.student.full_name} ({s.student.nisn} - Kelas {s.current_class_name || '-'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Live Official Printable Document Preview (A4 Paper Aesthetic) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-md p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Resmi */}
        <div className="text-center pb-4 border-b-2 border-slate-900 relative">
          <p className="text-xs font-bold text-slate-800 tracking-wider uppercase">
            PEMERINTAH PROVINSI {(settings.province || 'DKI JAKARTA').toUpperCase()}
          </p>
          <p className="text-xs font-bold text-slate-800 tracking-wider uppercase">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </p>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1 uppercase">
            {settings.name || 'SMP NEGERI 1 NUSANTARA'}
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {settings.address}, Kel. {settings.village}, Kec. {settings.district}, {settings.regency}
          </p>
          <p className="text-[11px] text-slate-600">
            Telp: {settings.phone} | Email: {settings.email} | NPSN: {settings.npsn}
          </p>
          <div className="w-full h-0.5 bg-slate-900 mt-2" />
          <div className="w-full h-[1px] bg-slate-900 mt-0.5" />
        </div>

        {/* Individual Student Biodata View */}
        {reportType === 'individual' && selectedStudent ? (
          <div className="mt-6 space-y-6 text-xs text-slate-800">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold tracking-wide uppercase">
                LEMBAR BUKU INDUK SISWA / BIODATA PESERTA DIDIK
              </h3>
              <p className="text-[11px] text-slate-500">
                Nomor Induk: {selectedStudent.student.nipd} | NISN: {selectedStudent.student.nisn} | Kelas: {selectedStudent.current_class_name || '-'}
              </p>
            </div>

            {/* Photo Box & Identity Grid */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                  A. IDENTITAS PRIBADI SISWA
                </div>
                <div className="grid grid-cols-3 gap-y-1.5 text-xs pl-2">
                  <span className="text-slate-500">1. Nama Lengkap</span>
                  <span className="col-span-2 font-bold text-slate-900">: {selectedStudent.student.full_name}</span>
                  <span className="text-slate-500">2. NIPD / NISN</span>
                  <span className="col-span-2 font-mono">: {selectedStudent.student.nipd} / {selectedStudent.student.nisn}</span>
                  <span className="text-slate-500">3. Jenis Kelamin</span>
                  <span className="col-span-2">: {selectedStudent.student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  <span className="text-slate-500">4. Tempat, Tanggal Lahir</span>
                  <span className="col-span-2">: {selectedStudent.student.birth_place}, {selectedStudent.student.birth_date}</span>
                  <span className="text-slate-500">5. Agama & Kewarganegaraan</span>
                  <span className="col-span-2">: {selectedStudent.student.religion} / {selectedStudent.student.nationality || 'WNI'}</span>
                </div>
              </div>

              {/* Photo Box Placeholder (3x4 cm) */}
              <div className="w-24 h-32 border-2 border-slate-300 rounded flex flex-col items-center justify-center text-center p-2 text-slate-400 bg-slate-50 shrink-0">
                <span className="text-[10px] font-medium">Pas Foto 3x4</span>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                B. KETERANGAN TEMPAT TINGGAL
              </div>
              <div className="grid grid-cols-3 gap-y-1.5 text-xs pl-2">
                <span className="text-slate-500">Alamat Rumah</span>
                <span className="col-span-2">: {selectedStudent.address?.full_address || '-'}</span>
                <span className="text-slate-500">RT / RW / Kelurahan</span>
                <span className="col-span-2">: RT {selectedStudent.address?.rt || '-'} / RW {selectedStudent.address?.rw || '-'}, Kel. {selectedStudent.address?.village || '-'}</span>
                <span className="text-slate-500">Kecamatan & Kota</span>
                <span className="col-span-2">: Kec. {selectedStudent.address?.district || '-'}, {selectedStudent.address?.regency || '-'}</span>
              </div>
            </div>

            {/* Parents */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                C. DATA ORANG TUA KANDUNG / WALI
              </div>
              <div className="grid grid-cols-3 gap-y-1.5 text-xs pl-2">
                <span className="text-slate-500">Nama Ayah Kandung</span>
                <span className="col-span-2 font-medium">: {selectedStudent.father?.full_name || '-'} ({selectedStudent.father?.job || '-'})</span>
                <span className="text-slate-500">Nama Ibu Kandung</span>
                <span className="col-span-2 font-medium">: {selectedStudent.mother?.full_name || '-'} ({selectedStudent.mother?.job || '-'})</span>
                {selectedStudent.guardian && selectedStudent.guardian.full_name && (
                  <>
                    <span className="text-slate-500">Nama Wali Siswa</span>
                    <span className="col-span-2 font-medium">: {selectedStudent.guardian.full_name} ({selectedStudent.guardian.relationship_with_student || 'Wali'})</span>
                  </>
                )}
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs">
              <div>
                <p>Mengetahui,</p>
                <p>Kepala Sekolah,</p>
                <div className="h-16" />
                <p className="font-bold underline">{settings.headmaster_name}</p>
                <p className="text-slate-500 text-[10px]">NIP. {settings.headmaster_nip}</p>
              </div>

              <div>
                <p>{settings.district || 'Jakarta'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Orang Tua / Wali Siswa,</p>
                <div className="h-16" />
                <p className="font-bold">( .................................................... )</p>
              </div>
            </div>
          </div>
        ) : (
          /* Table Roster View */
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                {reportType === 'by-class'
                  ? `DAFTAR SISWA ROMBONGAN BELAJAR KELAS ${selectedClass?.name || ''}`
                  : reportType === 'by-gender'
                  ? `DAFTAR PESERTA DIDIK BERJENIS KELAMIN ${genderFilter === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}`
                  : reportType === 'new-students'
                  ? 'DAFTAR PESERTA DIDIK BARU TAHUN AJARAN 2026/2027'
                  : reportType === 'transferred-graduated'
                  ? 'REKAPITULASI SISWA PINDAH, LULUS, DAN KELUAR'
                  : 'DAFTAR SELURUH PESERTA DIDIK AKTIF'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Siswa: <span className="font-bold text-slate-800">{previewData.length} orang</span>
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2 px-2 text-center w-8 border-r border-slate-300">No</th>
                  <th className="py-2 px-3 border-r border-slate-300">NIPD</th>
                  <th className="py-2 px-3 border-r border-slate-300">NISN</th>
                  <th className="py-2 px-3 border-r border-slate-300">Nama Lengkap</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">L/P</th>
                  <th className="py-2 px-3 border-r border-slate-300">Kelas</th>
                  <th className="py-2 px-3 border-r border-slate-300">Agama</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {previewData.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{idx + 1}</td>
                    <td className="py-1.5 px-3 font-mono border-r border-slate-200">{item.student.nipd}</td>
                    <td className="py-1.5 px-3 font-mono border-r border-slate-200">{item.student.nisn}</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-200">{item.student.full_name}</td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200">{item.student.gender}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200">{item.current_class_name || '-'}</td>
                    <td className="py-1.5 px-3 border-r border-slate-200">{item.student.religion}</td>
                    <td className="py-1.5 px-3">{item.student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer with Headmaster Signature */}
            <div className="pt-6 flex justify-end text-xs text-center pr-6">
              <div>
                <p>{settings.district || 'Jakarta'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Kepala Sekolah,</p>
                <div className="h-14" />
                <p className="font-bold underline">{settings.headmaster_name}</p>
                <p className="text-slate-500 text-[10px]">NIP. {settings.headmaster_nip}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
