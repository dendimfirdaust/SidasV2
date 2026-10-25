import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  MapPin,
  HeartHandshake,
  Users,
  ShieldAlert,
  PhoneCall,
  FileText,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import {
  FullStudentData,
  SchoolClass,
  AcademicYear,
  Religion,
  Gender,
  StudentStatus,
  ResidenceStatus,
} from '../../types/index.ts';
import { validateStudent } from '../../utils/validation.ts';

interface StudentFormViewProps {
  initialData?: FullStudentData;
  classes: SchoolClass[];
  academicYears: AcademicYear[];
  existingStudents: FullStudentData[];
  onSave: (data: FullStudentData) => { success: boolean; message?: string };
  onCancel: () => void;
}

export const StudentFormView: React.FC<StudentFormViewProps> = ({
  initialData,
  classes,
  academicYears,
  existingStudents,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialData;
  const activeAY = academicYears.find(y => y.is_active) || academicYears[0];

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasGuardian, setHasGuardian] = useState<boolean>(!!initialData?.guardian?.full_name);

  // Form State
  const [student, setStudent] = useState({
    id: initialData?.student.id || `std_${Date.now()}`,
    nipd: initialData?.student.nipd || '',
    nisn: initialData?.student.nisn || '',
    nik: initialData?.student.nik || '',
    full_name: initialData?.student.full_name || '',
    nickname: initialData?.student.nickname || '',
    gender: (initialData?.student.gender || 'L') as Gender,
    birth_place: initialData?.student.birth_place || '',
    birth_date: initialData?.student.birth_date || '',
    religion: (initialData?.student.religion || 'Islam') as Religion,
    nationality: initialData?.student.nationality || 'WNI',
    order_in_family: initialData?.student.order_in_family || 1,
    sibling_count: initialData?.student.sibling_count || 1,
    daily_language: initialData?.student.daily_language || 'Bahasa Indonesia',
    special_needs: initialData?.student.special_needs || 'Tidak Ada',
    photo_url: initialData?.student.photo_url || '',
    status: (initialData?.student.status || 'Aktif') as StudentStatus,
    exit_date: initialData?.student.exit_date || '',
    exit_destination: initialData?.student.exit_destination || '',
    admin_notes: initialData?.student.admin_notes || '',
    is_archived: initialData?.student.is_archived || false,
    created_at: initialData?.student.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [education, setEducation] = useState({
    student_id: initialData?.education.student_id || '',
    education_level: initialData?.education.education_level || 'SMP',
    admission_year: initialData?.education.admission_year || 2026,
    academic_year_id: initialData?.education.academic_year_id || activeAY.id,
    semester: initialData?.education.semester || activeAY.semester,
    class_id: initialData?.education.class_id || (classes[0]?.id ?? ''),
    rombel: initialData?.education.rombel || (classes[0]?.rombel ?? 'A'),
    register_book_no: initialData?.education.register_book_no || `BI-2026-${Date.now().toString().slice(-4)}`,
    previous_school: initialData?.education.previous_school || '',
    accepted_date: initialData?.education.accepted_date || new Date().toISOString().split('T')[0],
  });

  const [address, setAddress] = useState({
    student_id: initialData?.address.student_id || '',
    full_address: initialData?.address.full_address || '',
    rt: initialData?.address.rt || '001',
    rw: initialData?.address.rw || '001',
    village: initialData?.address.village || '',
    district: initialData?.address.district || '',
    regency: initialData?.address.regency || 'Jakarta Pusat',
    province: initialData?.address.province || 'DKI Jakarta',
    postal_code: initialData?.address.postal_code || '',
    residence_status: (initialData?.address.residence_status || 'Bersama Orang Tua') as ResidenceStatus,
    transport_mode: initialData?.address.transport_mode || 'Jalan Kaki',
    distance_km: initialData?.address.distance_km || 1,
  });

  const [father, setFather] = useState({
    id: initialData?.father?.id || `pg_f_${Date.now()}`,
    role_type: 'father' as const,
    full_name: initialData?.father?.full_name || '',
    nik: initialData?.father?.nik || '',
    birth_place: initialData?.father?.birth_place || '',
    birth_date: initialData?.father?.birth_date || '',
    education: initialData?.father?.education || 'SMA/Sederajat',
    job: initialData?.father?.job || 'Karyawan Swasta',
    monthly_income: initialData?.father?.monthly_income || 'Rp 5.000.000 - Rp 10.000.000',
    phone: initialData?.father?.phone || '',
    email: initialData?.father?.email || '',
    address: initialData?.father?.address || '',
    is_alive: initialData?.father?.is_alive ?? true,
  });

  const [mother, setMother] = useState({
    id: initialData?.mother?.id || `pg_m_${Date.now()}`,
    role_type: 'mother' as const,
    full_name: initialData?.mother?.full_name || '',
    nik: initialData?.mother?.nik || '',
    birth_place: initialData?.mother?.birth_place || '',
    birth_date: initialData?.mother?.birth_date || '',
    education: initialData?.mother?.education || 'SMA/Sederajat',
    job: initialData?.mother?.job || 'Ibu Rumah Tangga',
    monthly_income: initialData?.mother?.monthly_income || 'Tidak Berpenghasilan',
    phone: initialData?.mother?.phone || '',
    email: initialData?.mother?.email || '',
    address: initialData?.mother?.address || '',
    is_alive: initialData?.mother?.is_alive ?? true,
  });

  const [guardian, setGuardian] = useState({
    id: initialData?.guardian?.id || `pg_g_${Date.now()}`,
    role_type: 'guardian' as const,
    full_name: initialData?.guardian?.full_name || '',
    relationship_with_student: initialData?.guardian?.relationship_with_student || 'Paman',
    nik: initialData?.guardian?.nik || '',
    birth_place: initialData?.guardian?.birth_place || '',
    birth_date: initialData?.guardian?.birth_date || '',
    education: initialData?.guardian?.education || '',
    job: initialData?.guardian?.job || '',
    monthly_income: initialData?.guardian?.monthly_income || '',
    phone: initialData?.guardian?.phone || '',
    email: initialData?.guardian?.email || '',
    address: initialData?.guardian?.address || '',
    notes: initialData?.guardian?.notes || '',
  });

  const [emergencyContact, setEmergencyContact] = useState({
    student_id: initialData?.student.id || '',
    name: initialData?.emergency_contact?.name || '',
    relationship: initialData?.emergency_contact?.relationship || 'Orang Tua',
    phone: initialData?.emergency_contact?.phone || '',
    notes: initialData?.emergency_contact?.notes || '',
  });

  // Handle class selection
  const handleClassChange = (classId: string) => {
    const selected = classes.find(c => c.id === classId);
    setEducation(prev => ({
      ...prev,
      class_id: classId,
      rombel: selected ? selected.rombel : 'A',
    }));
  };

  // Submit Handler with Validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // List of other students to check unique NISN and NIPD
    const otherStudents = existingStudents
      .filter(s => s.student.id !== student.id)
      .map(s => ({
        nisn: s.student.nisn,
        nipd: s.student.nipd,
        nik: s.student.nik,
        full_name: s.student.full_name,
        gender: s.student.gender,
        birth_date: s.student.birth_date,
      }));

    const validationErrors = validateStudent(
      {
        nisn: student.nisn,
        nipd: student.nipd,
        nik: student.nik,
        full_name: student.full_name,
        gender: student.gender,
        birth_date: student.birth_date,
      },
      otherStudents
    );

    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.map(err => err.message).join('. '));
      setActiveTab(0); // Jump to first tab where identity is located
      return;
    }

    const payload: FullStudentData = {
      student,
      education: { ...education, student_id: student.id },
      address: { ...address, student_id: student.id },
      father: father.full_name.trim() ? father : undefined,
      mother: mother.full_name.trim() ? mother : undefined,
      guardian: hasGuardian && guardian.full_name.trim() ? guardian : undefined,
      emergency_contact: emergencyContact.name.trim()
        ? { ...emergencyContact, student_id: student.id }
        : undefined,
    };

    const res = onSave(payload);
    if (!res.success) {
      setErrorMessage(res.message || 'Gagal menyimpan ke basis data.');
    }
  };

  const tabs = [
    { id: 0, label: '1. Identitas Pribadi', icon: User },
    { id: 1, label: '2. Data Pendidikan', icon: GraduationCap },
    { id: 2, label: '3. Alamat Siswa', icon: MapPin },
    { id: 3, label: '4. Data Orang Tua (Ayah & Ibu)', icon: Users },
    { id: 4, label: '5. Data Wali (Opsional)', icon: HeartHandshake },
    { id: 5, label: '6. Kontak Darurat & Catatan', icon: PhoneCall },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? `Edit Biodata: ${initialData.student.full_name}` : 'Formulir Pendaftaran Siswa Baru'}
            </h1>
            <p className="text-xs text-slate-500">
              Kolom dengan tanda bintang (<span className="text-rose-500 font-bold">*</span>) wajib diisi sesuai dokumen resmi
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Simpan ke Database</span>
        </button>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">Periksa kembali data formulir:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg border border-slate-200 shadow-xs">
        {/* TAB 0: IDENTITAS PRIBADI */}
        {activeTab === 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Bagian 1: Identitas Inti Peserta Didik
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID Siswa Internal (Otomatis)
                </label>
                <input
                  type="text"
                  value={student.id}
                  disabled
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Siswa (NIPD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 26001"
                  value={student.nipd}
                  onChange={e => setStudent({ ...student, nipd: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NISN (10 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Contoh: 0081234567"
                  value={student.nisn}
                  onChange={e => setStudent({ ...student, nisn: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK Siswa (16 Digit KTP/KIA)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Contoh: 3171011504120001"
                  value={student.nik}
                  onChange={e => setStudent({ ...student, nik: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Sesuai Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Rizky Pratama"
                  value={student.full_name}
                  onChange={e => setStudent({ ...student, full_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Panggilan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rizky"
                  value={student.nickname}
                  onChange={e => setStudent({ ...student, nickname: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <select
                  value={student.gender}
                  onChange={e => setStudent({ ...student, gender: e.target.value as Gender })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agama <span className="text-rose-500">*</span>
                </label>
                <select
                  value={student.religion}
                  onChange={e => setStudent({ ...student, religion: e.target.value as Religion })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jakarta"
                  value={student.birth_place}
                  onChange={e => setStudent({ ...student, birth_place: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={student.birth_date}
                  onChange={e => setStudent({ ...student, birth_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kewarganegaraan
                </label>
                <input
                  type="text"
                  value={student.nationality}
                  onChange={e => setStudent({ ...student, nationality: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anak Ke-
                </label>
                <input
                  type="number"
                  min={1}
                  value={student.order_in_family}
                  onChange={e => setStudent({ ...student, order_in_family: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Saudara Kandung
                </label>
                <input
                  type="number"
                  min={0}
                  value={student.sibling_count}
                  onChange={e => setStudent({ ...student, sibling_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bahasa Sehari-hari di Rumah
                </label>
                <input
                  type="text"
                  value={student.daily_language}
                  onChange={e => setStudent({ ...student, daily_language: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kebutuhan Khusus (Jika Ada)
                </label>
                <input
                  type="text"
                  placeholder="Tidak ada / Tunanetra / dll"
                  value={student.special_needs}
                  onChange={e => setStudent({ ...student, special_needs: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: DATA PENDIDIKAN */}
        {activeTab === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Bagian 2: Data Pendidikan, Kelas, dan Riwayat Masuk
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelas Penempatan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={education.class_id}
                  onChange={e => handleClassChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-semibold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      Kelas {c.name} (Tingkat {c.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Ajaran Penerimaan
                </label>
                <select
                  value={education.academic_year_id}
                  onChange={e => setEducation({ ...education, academic_year_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.name} Semester {y.semester}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Masuk Sekolah
                </label>
                <input
                  type="number"
                  value={education.admission_year}
                  onChange={e => setEducation({ ...education, admission_year: parseInt(e.target.value) || 2026 })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Buku Induk Siswa
                </label>
                <input
                  type="text"
                  value={education.register_book_no}
                  onChange={e => setEducation({ ...education, register_book_no: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal Sekolah Sebelumnya
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SD Negeri 01 Menteng"
                  value={education.previous_school}
                  onChange={e => setEducation({ ...education, previous_school: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Diterima
                </label>
                <input
                  type="date"
                  value={education.accepted_date}
                  onChange={e => setEducation({ ...education, accepted_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Siswa Saat Ini <span className="text-rose-500">*</span>
                </label>
                <select
                  value={student.status}
                  onChange={e => setStudent({ ...student, status: e.target.value as StudentStatus })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pindah">Pindah</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>

              {student.status !== 'Aktif' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Keluar / Lulus
                    </label>
                    <input
                      type="date"
                      value={student.exit_date}
                      onChange={e => setStudent({ ...student, exit_date: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sekolah Tujuan (Jika Pindah/Lulus)
                    </label>
                    <input
                      type="text"
                      placeholder="Nama sekolah lanjutan / tujuan"
                      value={student.exit_destination}
                      onChange={e => setStudent({ ...student, exit_destination: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Khusus Administrasi
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan mengenai beasiswa, berkas mutasi, dll"
                  value={student.admin_notes}
                  onChange={e => setStudent({ ...student, admin_notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALAMAT SISWA */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Bagian 3: Alamat Tempat Tinggal dan Akses ke Sekolah
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap (Jalan, No Rumah, Gang)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Pegangsaan Timur No. 12"
                  value={address.full_address}
                  onChange={e => setAddress({ ...address, full_address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RT</label>
                <input
                  type="text"
                  placeholder="001"
                  value={address.rt}
                  onChange={e => setAddress({ ...address, rt: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RW</label>
                <input
                  type="text"
                  placeholder="002"
                  value={address.rw}
                  onChange={e => setAddress({ ...address, rw: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Menteng"
                  value={address.village}
                  onChange={e => setAddress({ ...address, village: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Menteng"
                  value={address.district}
                  onChange={e => setAddress({ ...address, district: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta Pusat"
                  value={address.regency}
                  onChange={e => setAddress({ ...address, regency: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: DKI Jakarta"
                  value={address.province}
                  onChange={e => setAddress({ ...address, province: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="10310"
                  value={address.postal_code}
                  onChange={e => setAddress({ ...address, postal_code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Tempat Tinggal
                </label>
                <select
                  value={address.residence_status}
                  onChange={e => setAddress({ ...address, residence_status: e.target.value as ResidenceStatus })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Bersama Orang Tua">Bersama Orang Tua</option>
                  <option value="Wali">Wali</option>
                  <option value="Kos">Kos</option>
                  <option value="Asrama">Asrama</option>
                  <option value="Panti Asuhan">Panti Asuhan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Moda Transportasi ke Sekolah
                </label>
                <input
                  type="text"
                  placeholder="Jalan kaki, Sepeda Motor, Angkot, dll"
                  value={address.transport_mode}
                  onChange={e => setAddress({ ...address, transport_mode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jarak Rumah ke Sekolah (KM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={address.distance_km}
                  onChange={e => setAddress({ ...address, distance_km: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA ORANG TUA */}
        {activeTab === 3 && (
          <div className="space-y-6">
            {/* AYAH */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                A. Data Ayah Kandung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Ayah
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap ayah"
                    value={father.full_name}
                    onChange={e => setFather({ ...father, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK Ayah (16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="3171..."
                    value={father.nik}
                    onChange={e => setFather({ ...father, nik: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pekerjaan Ayah
                  </label>
                  <input
                    type="text"
                    placeholder="PNS, Wiraswasta, Karyawan Swasta, dll"
                    value={father.job}
                    onChange={e => setFather({ ...father, job: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pendidikan Terakhir Ayah
                  </label>
                  <select
                    value={father.education}
                    onChange={e => setFather({ ...father, education: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="SD/Sederajat">SD/Sederajat</option>
                    <option value="SMP/Sederajat">SMP/Sederajat</option>
                    <option value="SMA/Sederajat">SMA/Sederajat</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                    <option value="S3">Doktor (S3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor HP / WhatsApp Ayah
                  </label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={father.phone}
                    onChange={e => setFather({ ...father, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penghasilan Bulanan Ayah
                  </label>
                  <select
                    value={father.monthly_income}
                    onChange={e => setFather({ ...father, monthly_income: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                    <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                    <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                    <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                    <option value="Rp 10.000.000 - Rp 20.000.000">Rp 10.000.000 - Rp 20.000.000</option>
                    <option value="Di atas Rp 20.000.000">Di atas Rp 20.000.000</option>
                    <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* IBU */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                B. Data Ibu Kandung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Ibu
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap ibu"
                    value={mother.full_name}
                    onChange={e => setMother({ ...mother, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK Ibu (16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="3171..."
                    value={mother.nik}
                    onChange={e => setMother({ ...mother, nik: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pekerjaan Ibu
                  </label>
                  <input
                    type="text"
                    placeholder="Ibu Rumah Tangga, Guru, PNS, dll"
                    value={mother.job}
                    onChange={e => setMother({ ...mother, job: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pendidikan Terakhir Ibu
                  </label>
                  <select
                    value={mother.education}
                    onChange={e => setMother({ ...mother, education: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="SD/Sederajat">SD/Sederajat</option>
                    <option value="SMP/Sederajat">SMP/Sederajat</option>
                    <option value="SMA/Sederajat">SMA/Sederajat</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                    <option value="S3">Doktor (S3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor HP / WhatsApp Ibu
                  </label>
                  <input
                    type="text"
                    placeholder="0813..."
                    value={mother.phone}
                    onChange={e => setMother({ ...mother, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penghasilan Bulanan Ibu
                  </label>
                  <select
                    value={mother.monthly_income}
                    onChange={e => setMother({ ...mother, monthly_income: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                    <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                    <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                    <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                    <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                    <option value="Di atas Rp 10.000.000">Di atas Rp 10.000.000</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATA WALI (OPSIONAL) */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Bagian 5: Data Wali Siswa</h2>
                <p className="text-xs text-slate-500">
                  Aktifkan bagian ini jika siswa diasuh atau tinggal bersama wali
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={hasGuardian}
                  onChange={e => setHasGuardian(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Siswa Memiliki Wali</span>
              </label>
            </div>

            {hasGuardian ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap wali"
                    value={guardian.full_name}
                    onChange={e => setGuardian({ ...guardian, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hubungan dengan Siswa
                  </label>
                  <input
                    type="text"
                    placeholder="Paman, Kakek, Kakak, dll"
                    value={guardian.relationship_with_student}
                    onChange={e => setGuardian({ ...guardian, relationship_with_student: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pekerjaan Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Pekerjaan wali"
                    value={guardian.job}
                    onChange={e => setGuardian({ ...guardian, job: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Telepon / HP Wali
                  </label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={guardian.phone}
                    onChange={e => setGuardian({ ...guardian, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keterangan Asuhan Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Catatan mengenai perwalian siswa"
                    value={guardian.notes}
                    onChange={e => setGuardian({ ...guardian, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
                Siswa tidak memiliki wali atau tinggal bersama orang tua kandung.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: KONTAK DARURAT & CATATAN */}
        {activeTab === 5 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Bagian 6: Kontak Darurat dan Berkas Siswa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kontak Darurat
                </label>
                <input
                  type="text"
                  placeholder="Nama kerabat/orang tua"
                  value={emergencyContact.name}
                  onChange={e => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hubungan
                </label>
                <input
                  type="text"
                  placeholder="Ayah / Ibu / Paman / Tetangga"
                  value={emergencyContact.relationship}
                  onChange={e => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon Darurat
                </label>
                <input
                  type="text"
                  placeholder="08..."
                  value={emergencyContact.phone}
                  onChange={e => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Pastikan data yang Anda masukkan telah diverifikasi dengan Akta Kelahiran dan Kartu Keluarga (KK).
              </p>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
