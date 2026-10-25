import React, { useState } from 'react';
import {
  DatabaseBackup,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { AuditLog } from '../../types/index.ts';
import { db } from '../../services/db.ts';

interface AuditBackupViewProps {
  auditLogs: AuditLog[];
  onDatabaseRestored: () => void;
}

export const AuditBackupView: React.FC<AuditBackupViewProps> = ({
  auditLogs,
  onDatabaseRestored,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntityType, setFilterEntityType] = useState<string>('all');
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterEntityType !== 'all' && log.entity_type !== filterEntityType) return false;
    return true;
  });

  const handleDownloadBackup = () => {
    const jsonStr = db.exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIDAS_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (!content) return;

      const res = db.restoreFullDatabase(content);
      if (res.success) {
        setRestoreMessage({ type: 'success', text: res.message });
        onDatabaseRestored();
      } else {
        setRestoreMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSample = () => {
    if (
      confirm(
        'PERINGATAN: Tindakan ini akan mengembalikan data sistem ke data contoh fiktif standar. Seluruh perubahan manual akan direset. Lanjutkan?'
      )
    ) {
      db.resetToSampleData();
      onDatabaseRestored();
      setRestoreMessage({
        type: 'success',
        text: 'Sistem berhasil direset kembali ke data contoh fiktif awal.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pencadangan Basis Data & Audit Aktivitas</h1>
          <p className="text-xs text-slate-500">
            Jejak rekaman integritas data (Audit Trail) dan manajemen pencadangan/pemulihan sistem (Disaster Recovery)
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Berkas Backup JSON</span>
        </button>
      </div>

      {restoreMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            restoreMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {restoreMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{restoreMessage.text}</span>
        </div>
      )}

      {/* Backup & Restore Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Restore from File */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Pemulihan Data (Restore Database)</span>
          </div>
          <p className="text-xs text-slate-500">
            Unggah berkas cadangan JSON yang sebelumnya diunduh untuk memulihkan seluruh identitas siswa, kelas, dan riwayat.
          </p>

          <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Pilih Berkas Cadangan (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Card 2: Sample Data Reset */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Reset ke Data Contoh Fiktif</span>
          </div>
          <p className="text-xs text-slate-500">
            Gunakan fungsi ini jika Anda ingin mengembalikan sistem ke kondisi data contoh fiktif resmi SMPN 1 Nusantara.
          </p>

          <button
            onClick={handleResetToSample}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Reset Data Sekarang</span>
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Log Audit Aktivitas Pengguna Terkini</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan riwayat penambahan, modifikasi, penghapusan, arsip, dan ekspor data
            </p>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="py-1 px-2 border border-slate-200 rounded bg-slate-50"
            >
              <option value="all">Semua Tindakan</option>
              <option value="CREATE">CREATE (Tambah)</option>
              <option value="UPDATE">UPDATE (Ubah)</option>
              <option value="DELETE">DELETE (Hapus)</option>
              <option value="ARCHIVE">ARCHIVE (Arsip)</option>
              <option value="RESTORE">RESTORE (Pulihkan)</option>
              <option value="IMPORT">IMPORT (Impor)</option>
              <option value="EXPORT">EXPORT (Ekspor)</option>
              <option value="LOGIN">LOGIN (Masuk)</option>
            </select>

            <select
              value={filterEntityType}
              onChange={e => setFilterEntityType(e.target.value)}
              className="py-1 px-2 border border-slate-200 rounded bg-slate-50"
            >
              <option value="all">Semua Entitas</option>
              <option value="STUDENT">Data Siswa</option>
              <option value="CLASS">Data Kelas</option>
              <option value="USER">Akun Pengguna</option>
              <option value="SETTINGS">Pengaturan</option>
              <option value="SYSTEM">Sistem</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Waktu & Tanggal</th>
                <th className="py-2.5 px-3">Petugas (Pengguna)</th>
                <th className="py-2.5 px-2 text-center">Tindakan</th>
                <th className="py-2.5 px-3">Entitas</th>
                <th className="py-2.5 px-4">Deskripsi Aktivitas</th>
                <th className="py-2.5 px-3 font-mono">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const actionColor =
                  log.action === 'CREATE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : log.action === 'UPDATE'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : log.action === 'DELETE'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : log.action === 'ARCHIVE'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : log.action === 'IMPORT'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900">{log.user_name}</span>
                      <span className="text-[10px] text-slate-400 block capitalize">{log.user_role}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${actionColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{log.entity_type}</td>
                    <td className="py-2.5 px-4 text-slate-800 leading-relaxed">{log.description}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ip_address}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
