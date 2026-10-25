import React, { useState } from 'react';
import {
  School,
  Save,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
} from 'lucide-react';
import { SchoolSettings, AcademicYear } from '../../types/index.ts';

interface SchoolSettingsViewProps {
  settings: SchoolSettings;
  academicYears: AcademicYear[];
  onSaveSettings: (settings: SchoolSettings) => void;
  onSaveAcademicYear: (year: AcademicYear) => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  settings,
  academicYears,
  onSaveSettings,
  onSaveAcademicYear,
}) => {
  const [form, setForm] = useState<SchoolSettings>({ ...settings });
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleActiveYearToggle = (yearId: string) => {
    const target = academicYears.find(y => y.id === yearId);
    if (target) {
      onSaveAcademicYear({ ...target, is_active: true });
      setForm(prev => ({ ...prev, active_academic_year_id: yearId }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengaturan Identitas Sekolah</h1>
          <p className="text-xs text-slate-500">
            Data ini digunakan secara otomatis pada Kop Surat Resmi, Lembar Buku Induk, dan Laporan Administrasi
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Pengaturan</span>
        </button>
      </div>

      {showSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan dan identitas sekolah berhasil diperbarui ke database!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identitas Dasar & NPSN */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <span>Identitas Satuan Pendidikan (Sekolah)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Resmi Satuan Pendidikan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NPSN (Nomor Pokok Sekolah Nasional) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={form.npsn}
                onChange={e => setForm({ ...form, npsn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenjang Pendidikan</label>
              <select
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="SD">SD / Madrasah Ibtidaiyah</option>
                <option value="SMP">SMP / Madrasah Tsanawiyah</option>
                <option value="SMA">SMA / Madrasah Aliyah</option>
                <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon Resmi</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi Sekolah</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Lokasi & Alamat Satuan Pendidikan */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Alamat & Lokasi Sekolah</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Jalan & Nomor</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Desa / Kelurahan</label>
              <input
                type="text"
                value={form.village}
                onChange={e => setForm({ ...form, village: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={form.regency}
                onChange={e => setForm({ ...form, regency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                maxLength={5}
                value={form.postal_code}
                onChange={e => setForm({ ...form, postal_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website Sekolah</label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Pimpinan & Pejabat Pengesah */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Pimpinan & Penandatangan Dokumen Resmi</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap Kepala Sekolah & Gelar
              </label>
              <input
                type="text"
                required
                value={form.headmaster_name}
                onChange={e => setForm({ ...form, headmaster_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                required
                value={form.headmaster_nip}
                onChange={e => setForm({ ...form, headmaster_nip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Operator SIDAS / Dapodik
              </label>
              <input
                type="text"
                value={form.operator_name}
                onChange={e => setForm({ ...form, operator_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Tahun Ajaran Aktif */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Tahun Ajaran Aktif Sistem</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tahun ajaran yang aktif menjadi rujukan otomatis saat pendaftaran siswa baru dan cetak buku induk
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            {academicYears.map(yr => (
              <div
                key={yr.id}
                onClick={() => handleActiveYearToggle(yr.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  yr.id === form.active_academic_year_id
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{yr.name}</span>
                  {yr.id === form.active_academic_year_id && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      Aktif Sekarang
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Semester {yr.semester}</p>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
