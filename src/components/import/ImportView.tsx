import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileX,
  RefreshCw,
  Info,
} from 'lucide-react';
import { ExcelService, ImportValidationResult } from '../../services/excelService.ts';
import { UserProfile } from '../../types/index.ts';

interface ImportViewProps {
  currentUser: UserProfile;
  onImportSuccess: () => void;
}

export const ImportView: React.FC<ImportViewProps> = ({ currentUser, onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importSummary, setImportSummary] = useState<{
    committedCount: number;
    errorCount: number;
    filename: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsProcessing(true);
    setImportSummary(null);

    try {
      const result = await ExcelService.parseSpreadsheetFile(selected);
      setValidationResult(result);
    } catch (err) {
      alert(`Gagal memproses berkas Excel: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = () => {
    if (!validationResult || validationResult.validRows.length === 0 || !file) return;

    const count = ExcelService.commitImport(
      validationResult.validRows,
      file.name,
      currentUser.full_name
    );

    setImportSummary({
      committedCount: count,
      errorCount: validationResult.invalidRows.length,
      filename: file.name,
    });

    onImportSuccess();
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setImportSummary(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Impor Data Siswa dari Excel / CSV</h1>
          <p className="text-xs text-slate-500">
            Unggah dan validasi data siswa secara massal menggunakan format standar Dapodik/SIDAS
          </p>
        </div>

        <button
          onClick={() => ExcelService.downloadTemplate()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Template Excel Resmi (.xlsx)</span>
        </button>
      </div>

      {/* Step Guide Banner */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs text-indigo-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-indigo-950">
          <Info className="w-4 h-4 text-indigo-700" />
          <span>Alur Proses Impor yang Aman & Terverifikasi:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-indigo-800">
          <div className="p-2 rounded bg-white/70 border border-indigo-100">
            <span className="font-bold">1. Unduh Template</span>
            <p className="text-slate-600 mt-0.5">Format standar dengan tipe teks terjaga.</p>
          </div>
          <div className="p-2 rounded bg-white/70 border border-indigo-100">
            <span className="font-bold">2. Unggah Berkas</span>
            <p className="text-slate-600 mt-0.5">Sistem memindai kesalahan & duplikasi.</p>
          </div>
          <div className="p-2 rounded bg-white/70 border border-indigo-100">
            <span className="font-bold">3. Pratinjau Baris</span>
            <p className="text-slate-600 mt-0.5">Periksa baris valid vs ditolak.</p>
          </div>
          <div className="p-2 rounded bg-white/70 border border-indigo-100">
            <span className="font-bold">4. Komit Transaksi</span>
            <p className="text-slate-600 mt-0.5">Data valid tersimpan aman ke database.</p>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      {!validationResult && !importSummary && (
        <div className="p-10 bg-white border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-center space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Pilih Berkas Excel (.xlsx, .xls) atau CSV (.csv)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mendukung format spreadsheet standar dengan nomor induk dan NISN teks lengkap
            </p>
          </div>

          <label className="inline-block cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs">
            <span>Pilih Berkas Komputer</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Validation Result Preview */}
      {validationResult && !importSummary && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500">Total Baris Dibaca</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {validationResult.totalRows}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 bg-emerald-50/40">
              <span className="text-emerald-700 font-medium">Siap Diimpor (Valid)</span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {validationResult.validRows.length}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-rose-200 bg-rose-50/40">
              <span className="text-rose-700 font-medium">Ditolak / Salah Format</span>
              <p className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                {validationResult.invalidRows.length}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-amber-200 bg-amber-50/40">
              <span className="text-amber-700 font-medium">Potensi Duplikat</span>
              <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                {validationResult.duplicateCount}
              </p>
            </div>
          </div>

          {/* Action Bar for Commit / Cancel / Error Report */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-xs">
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-900">{file?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {validationResult.invalidRows.length > 0 && (
                <button
                  onClick={() => ExcelService.downloadErrorReport(validationResult.invalidRows)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Laporan Kesalahan CSV</span>
                </button>
              )}

              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>

              <button
                onClick={handleCommitImport}
                disabled={validationResult.validRows.length === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan {validationResult.validRows.length} Data Valid ke Database</span>
              </button>
            </div>
          </div>

          {/* Detailed Preview Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Pratinjau Hasil Validasi Setiap Baris
              </span>
              <span className="text-[11px] text-slate-500">
                Menampilkan baris teratas dari berkas
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                    <th className="py-2 px-3 w-16">Baris</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Nama Lengkap</th>
                    <th className="py-2 px-3 font-mono">NISN</th>
                    <th className="py-2 px-3 font-mono">NIPD</th>
                    <th className="py-2 px-3">Kelas</th>
                    <th className="py-2 px-4">Keterangan / Diagnosa Validasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Invalid Rows First */}
                  {validationResult.invalidRows.map(r => (
                    <tr key={`inv_${r.rowNumber}`} className="bg-rose-50/40 hover:bg-rose-50">
                      <td className="py-2 px-3 font-mono text-slate-400 tabular-nums">#{r.rowNumber}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Ditolak
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{r.full_name || '-'}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{r.nisn || '-'}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{r.nipd || '-'}</td>
                      <td className="py-2 px-3">{r.class_name || '-'}</td>
                      <td className="py-2 px-4 text-rose-700 text-[11px]">
                        {r.errors.join('; ')}
                      </td>
                    </tr>
                  ))}

                  {/* Valid Rows */}
                  {validationResult.validRows.map(r => (
                    <tr key={`val_${r.rowNumber}`} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-400 tabular-nums">#{r.rowNumber}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Valid
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{r.full_name}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{r.nisn}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{r.nipd}</td>
                      <td className="py-2 px-3">{r.class_name}</td>
                      <td className="py-2 px-4 text-emerald-700 text-[11px]">
                        Lengkap & Siap Masuk Database
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Completion Summary Card */}
      {importSummary && (
        <div className="p-8 bg-white rounded-xl border border-emerald-200 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Proses Impor Berhasil Diselesaikan!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Sebanyak <span className="font-bold text-emerald-700 font-mono">{importSummary.committedCount}</span> data siswa baru telah berhasil disimpan secara permanen ke database sekolah.
            {importSummary.errorCount > 0 && ` (${importSummary.errorCount} data salah format ditolak).`}
          </p>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Impor Berkas Lainnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
