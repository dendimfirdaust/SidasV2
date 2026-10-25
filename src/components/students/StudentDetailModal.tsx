import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit2,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
  MapPin,
  Users,
  PhoneCall,
  Calendar,
} from 'lucide-react';
import { FullStudentData, UserRole } from '../../types/index.ts';
import { maskSensitiveId, maskPhoneNumber, calculateProfileCompleteness } from '../../utils/validation.ts';
import { PdfService } from '../../services/pdfService.ts';

interface StudentDetailModalProps {
  studentData: FullStudentData;
  userRole: UserRole;
  onClose: () => void;
  onEdit: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentData,
  userRole,
  onClose,
  onEdit,
}) => {
  const [revealSensitive, setRevealSensitive] = useState(false);
  const s = studentData.student;
  const edu = studentData.education;
  const addr = studentData.address;
  const father = studentData.father;
  const mother = studentData.mother;
  const guardian = studentData.guardian;
  const emergency = studentData.emergency_contact;

  const completeness = calculateProfileCompleteness({
    nisn: s.nisn,
    nipd: s.nipd,
    nik: s.nik,
    full_name: s.full_name,
    birth_place: s.birth_place,
    birth_date: s.birth_date,
    gender: s.gender,
    religion: s.religion,
    address: addr?.full_address,
    father_name: father?.full_name,
    mother_name: mother?.full_name,
    class_id: edu?.class_id,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm">
              {s.gender === 'L' ? 'L' : 'P'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{s.full_name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>NISN: <span className="font-mono font-medium text-slate-700">{s.nisn}</span></span>
                <span>·</span>
                <span>NIPD: <span className="font-mono font-medium text-slate-700">{s.nipd}</span></span>
                <span>·</span>
                <span className="font-semibold text-slate-800">Kelas {studentData.current_class_name || '-'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole !== 'guru' && (
              <button
                onClick={() => setRevealSensitive(!revealSensitive)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                title="Buka / Tutup data sensitif NIK & Telepon"
              >
                {revealSensitive ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                <span>{revealSensitive ? 'Masking Aktif' : 'Lihat NIK Lengkap'}</span>
              </button>
            )}

            <button
              onClick={() => PdfService.generateStudentBiodataPdf(studentData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Biodata PDF</span>
            </button>

            {userRole !== 'guru' && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Completeness Badge Banner */}
          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            completeness.isComplete
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              : 'bg-amber-50/70 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center gap-2">
              {completeness.isComplete ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span className="font-semibold">
                Status Kelengkapan Biodata: {completeness.percentage}%
              </span>
            </div>
            {!completeness.isComplete && (
              <span className="text-[11px] text-amber-700">
                Kolom belum terisi: {completeness.missingFields.join(', ')}
              </span>
            )}
          </div>

          {/* Section A: Identitas Siswa */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>1. Identitas Inti Peserta Didik</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4">
              <div>
                <p className="text-slate-400">Nama Lengkap</p>
                <p className="font-semibold text-slate-900">{s.full_name}</p>
              </div>
              <div>
                <p className="text-slate-400">Nama Panggilan</p>
                <p className="font-semibold text-slate-900">{s.nickname || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Nomor Induk Siswa (NIPD)</p>
                <p className="font-mono text-slate-900 font-semibold">{s.nipd}</p>
              </div>
              <div>
                <p className="text-slate-400">NISN (Nasional)</p>
                <p className="font-mono text-slate-900 font-semibold">{s.nisn}</p>
              </div>
              <div>
                <p className="text-slate-400">NIK Siswa</p>
                <p className="font-mono text-slate-900 font-medium">
                  {revealSensitive ? s.nik || '-' : maskSensitiveId(s.nik)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Jenis Kelamin</p>
                <p className="font-medium text-slate-900">
                  {s.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Tempat, Tanggal Lahir</p>
                <p className="font-medium text-slate-900">{s.birth_place}, {s.birth_date}</p>
              </div>
              <div>
                <p className="text-slate-400">Agama</p>
                <p className="font-medium text-slate-900">{s.religion}</p>
              </div>
              <div>
                <p className="text-slate-400">Kewarganegaraan</p>
                <p className="font-medium text-slate-900">{s.nationality || 'WNI'}</p>
              </div>
              <div>
                <p className="text-slate-400">Anak Ke / Dari</p>
                <p className="font-medium text-slate-900">{s.order_in_family || 1} dari {s.sibling_count || 1} bersaudara</p>
              </div>
              <div>
                <p className="text-slate-400">Bahasa Sehari-hari</p>
                <p className="font-medium text-slate-900">{s.daily_language || 'Bahasa Indonesia'}</p>
              </div>
              <div>
                <p className="text-slate-400">Kebutuhan Khusus</p>
                <p className="font-medium text-slate-900">{s.special_needs || 'Tidak Ada'}</p>
              </div>
            </div>
          </div>

          {/* Section B: Data Pendidikan */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Riwayat Pendidikan & Kelas</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4">
              <div>
                <p className="text-slate-400">Kelas Aktif</p>
                <p className="font-semibold text-slate-900">
                  Kelas {studentData.current_class_name || '-'} (Rombel {edu?.rombel || '-'})
                </p>
              </div>
              <div>
                <p className="text-slate-400">Tahun Masuk / Diterima</p>
                <p className="font-mono text-slate-900">{edu?.admission_year} ({edu?.accepted_date})</p>
              </div>
              <div>
                <p className="text-slate-400">Nomor Buku Induk</p>
                <p className="font-mono text-slate-900">{edu?.register_book_no || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Asal Sekolah Sebelumnya</p>
                <p className="font-medium text-slate-900">{edu?.previous_school || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Status Siswa</p>
                <p className="font-semibold text-slate-900">{s.status}</p>
              </div>
              {s.status !== 'Aktif' && (
                <>
                  <div>
                    <p className="text-slate-400">Tanggal Keluar/Lulus</p>
                    <p className="font-mono text-slate-900">{s.exit_date || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400">Sekolah Lanjutan / Keterangan</p>
                    <p className="font-medium text-slate-900">{s.exit_destination || s.admin_notes || '-'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section C: Alamat */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Alamat dan Domisili</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4">
              <div className="col-span-2">
                <p className="text-slate-400">Alamat Lengkap</p>
                <p className="font-medium text-slate-900">{addr?.full_address || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">RT / RW</p>
                <p className="font-mono text-slate-900">RT {addr?.rt || '-'} / RW {addr?.rw || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Kelurahan / Kecamatan</p>
                <p className="font-medium text-slate-900">{addr?.village || '-'}, {addr?.district || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Kabupaten / Kota</p>
                <p className="font-medium text-slate-900">{addr?.regency || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400">Provinsi & Kode Pos</p>
                <p className="font-medium text-slate-900">{addr?.province || '-'} ({addr?.postal_code || '-'})</p>
              </div>
              <div>
                <p className="text-slate-400">Tinggal Bersama</p>
                <p className="font-medium text-slate-900">{addr?.residence_status || 'Orang Tua'}</p>
              </div>
              <div>
                <p className="text-slate-400">Transportasi & Jarak</p>
                <p className="font-medium text-slate-900">{addr?.transport_mode || '-'} ({addr?.distance_km || 0} km)</p>
              </div>
            </div>
          </div>

          {/* Section D: Orang Tua & Wali */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>4. Data Orang Tua Kandung & Wali</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ayah */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Ayah: {father?.full_name || '-'}</p>
                <p className="text-slate-500">
                  NIK: <span className="font-mono">{revealSensitive ? father?.nik || '-' : maskSensitiveId(father?.nik)}</span>
                </p>
                <p className="text-slate-500">Pekerjaan: <span className="text-slate-800">{father?.job || '-'}</span></p>
                <p className="text-slate-500">Pendidikan: <span className="text-slate-800">{father?.education || '-'}</span></p>
                <p className="text-slate-500">
                  Telepon: <span className="font-mono">{revealSensitive ? father?.phone || '-' : maskPhoneNumber(father?.phone)}</span>
                </p>
              </div>

              {/* Ibu */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Ibu: {mother?.full_name || '-'}</p>
                <p className="text-slate-500">
                  NIK: <span className="font-mono">{revealSensitive ? mother?.nik || '-' : maskSensitiveId(mother?.nik)}</span>
                </p>
                <p className="text-slate-500">Pekerjaan: <span className="text-slate-800">{mother?.job || '-'}</span></p>
                <p className="text-slate-500">Pendidikan: <span className="text-slate-800">{mother?.education || '-'}</span></p>
                <p className="text-slate-500">
                  Telepon: <span className="font-mono">{revealSensitive ? mother?.phone || '-' : maskPhoneNumber(mother?.phone)}</span>
                </p>
              </div>
            </div>

            {guardian && guardian.full_name && (
              <div className="mt-3 p-3 bg-indigo-50/60 rounded-lg border border-indigo-200 space-y-1">
                <p className="font-bold text-indigo-900">
                  Wali Siswa: {guardian.full_name} ({guardian.relationship_with_student || 'Wali'})
                </p>
                <p className="text-indigo-800">Pekerjaan: {guardian.job || '-'} · No HP: {guardian.phone || '-'}</p>
                {guardian.notes && <p className="text-slate-600 text-[11px]">Keterangan: {guardian.notes}</p>}
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          {emergency && emergency.name && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-900">Kontak Darurat: {emergency.name} ({emergency.relationship})</p>
                  <p className="text-[11px] text-amber-700 font-mono">
                    Nomor Telepon: {revealSensitive ? emergency.phone : maskPhoneNumber(emergency.phone)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
