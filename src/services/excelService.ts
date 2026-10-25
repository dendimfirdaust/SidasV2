import * as XLSX from 'xlsx';
import { FullStudentData } from '../types/index.ts';
import { sanitizeSpreadsheetCell } from '../utils/validation.ts';
import { db } from './db.ts';

export interface ParsedImportRow {
  rowNumber: number;
  nisn: string;
  nipd: string;
  nik: string;
  full_name: string;
  nickname: string;
  gender: 'L' | 'P';
  birth_place: string;
  birth_date: string;
  religion: string;
  class_name: string;
  admission_year: number;
  full_address: string;
  father_name: string;
  mother_name: string;
  parent_phone: string;
  status: string;
  isValid: boolean;
  errors: string[];
}

export interface ImportValidationResult {
  totalRows: number;
  validRows: ParsedImportRow[];
  invalidRows: ParsedImportRow[];
  duplicateCount: number;
}

export class ExcelService {
  /**
   * Generates and downloads official Excel template with sample guidance
   */
  public static downloadTemplate(): void {
    const templateData = [
      {
        'NIPD*': '26010',
        'NISN* (10 digit)': '0081234510',
        'NIK (16 digit)': '3171011504120010',
        'Nama Lengkap*': 'Ahmad Fauzan Pratama',
        'Nama Panggilan': 'Fauzan',
        'Jenis Kelamin* (L/P)': 'L',
        'Tempat Lahir*': 'Jakarta',
        'Tanggal Lahir* (YYYY-MM-DD)': '2012-05-14',
        'Agama*': 'Islam',
        'Kewarganegaraan': 'WNI',
        'Anak Ke': 1,
        'Jml Saudara': 2,
        'Kelas*': '7-A',
        'Tahun Masuk*': 2026,
        'Alamat Lengkap': 'Jl. Diponegoro No. 15',
        'RT': '002',
        'RW': '005',
        'Kelurahan/Desa': 'Menteng',
        'Kecamatan': 'Menteng',
        'Kabupaten/Kota': 'Jakarta Pusat',
        'Provinsi': 'DKI Jakarta',
        'Kode Pos': '10310',
        'Nama Ayah': 'Ir. Bambang Pratama',
        'NIK Ayah': '3171010101700001',
        'Pekerjaan Ayah': 'Karyawan Swasta',
        'Nama Ibu': 'Siti Nurhaliza, S.Pd',
        'NIK Ibu': '3171014202750002',
        'Pekerjaan Ibu': 'Guru',
        'No HP Orang Tua': '081234567890',
        'Status Siswa': 'Aktif',
      },
      {
        'NIPD*': '26011',
        'NISN* (10 digit)': '0081234511',
        'NIK (16 digit)': '3171025508120011',
        'Nama Lengkap*': 'Zahra Annisa Putri',
        'Nama Panggilan': 'Zahra',
        'Jenis Kelamin* (L/P)': 'P',
        'Tempat Lahir*': 'Bandung',
        'Tanggal Lahir* (YYYY-MM-DD)': '2012-09-20',
        'Agama*': 'Islam',
        'Kewarganegaraan': 'WNI',
        'Anak Ke': 2,
        'Jml Saudara': 1,
        'Kelas*': '7-B',
        'Tahun Masuk*': 2026,
        'Alamat Lengkap': 'Jl. Cikini Raya No. 42',
        'RT': '004',
        'RW': '001',
        'Kelurahan/Desa': 'Cikini',
        'Kecamatan': 'Menteng',
        'Kabupaten/Kota': 'Jakarta Pusat',
        'Provinsi': 'DKI Jakarta',
        'Kode Pos': '10330',
        'Nama Ayah': 'H. Ridwan Kamil, M.M',
        'NIK Ayah': '3171021203710003',
        'Pekerjaan Ayah': 'Wiraswasta',
        'Nama Ibu': 'Hj. Atalia Praratya',
        'NIK Ibu': '3171025011740004',
        'Pekerjaan Ibu': 'Ibu Rumah Tangga',
        'No HP Orang Tua': '081398765432',
        'Status Siswa': 'Aktif',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    // Set auto column width
    worksheet['!cols'] = [
      { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 26 }, { wch: 15 },
      { wch: 20 }, { wch: 16 }, { wch: 25 }, { wch: 12 }, { wch: 16 },
      { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 30 },
      { wch: 8 }, { wch: 8 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
      { wch: 15 }, { wch: 10 }, { wch: 24 }, { wch: 20 }, { wch: 20 },
      { wch: 24 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Siswa');

    XLSX.writeFile(workbook, 'Template_Impor_Siswa_SIDAS.xlsx');
  }

  /**
   * Reads raw file bytes and parses worksheet into records
   */
  public static async parseSpreadsheetFile(file: File): Promise<ImportValidationResult> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    // Read raw with raw values to keep leading zeros intact
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { raw: false, defval: '' });

    const existingStudents = db.getStudents(true);
    const existingNisns = new Set(existingStudents.map(s => s.student.nisn.trim()));
    const existingNipds = new Set(existingStudents.map(s => s.student.nipd.trim()));

    const seenFileNisns = new Set<string>();
    const seenFileNipds = new Set<string>();

    const validRows: ParsedImportRow[] = [];
    const invalidRows: ParsedImportRow[] = [];
    let duplicateCount = 0;

    rawData.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const errors: string[] = [];

      // Flexible column mapper
      const getVal = (possibleKeys: string[]): string => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[*()]/g, '').trim();
          for (const pk of possibleKeys) {
            if (cleanK === pk.toLowerCase() || cleanK.includes(pk.toLowerCase())) {
              return String(row[k] ?? '').trim();
            }
          }
        }
        return '';
      };

      const nipd = getVal(['nipd', 'no induk']);
      const nisn = getVal(['nisn']);
      const nik = getVal(['nik']);
      const full_name = getVal(['nama lengkap', 'nama']);
      const nickname = getVal(['nama panggilan']);
      const rawGender = getVal(['jenis kelamin', 'jk', 'l/p', 'gender']).toUpperCase();
      const birth_place = getVal(['tempat lahir']);
      let birth_date = getVal(['tanggal lahir', 'tgl lahir']);
      const religion = getVal(['agama']) || 'Islam';
      const class_name = getVal(['kelas']) || '7-A';
      const admission_year_str = getVal(['tahun masuk', 'tahun']) || '2026';
      const full_address = getVal(['alamat lengkap', 'alamat']);
      const father_name = getVal(['nama ayah', 'ayah']);
      const mother_name = getVal(['nama ibu', 'ibu']);
      const parent_phone = getVal(['no hp', 'telepon', 'hp']);
      const status = getVal(['status siswa', 'status']) || 'Aktif';

      // Normalize gender
      let gender: 'L' | 'P' = 'L';
      if (rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') || rawGender.includes('WANITA')) {
        gender = 'P';
      } else if (rawGender.startsWith('L') || rawGender.includes('LAKI')) {
        gender = 'L';
      } else if (rawGender) {
        errors.push(`Jenis kelamin tidak valid ("${rawGender}"). Gunakan L atau P.`);
      } else {
        errors.push('Jenis kelamin wajib diisi');
      }

      // Format date if needed
      if (birth_date && birth_date.includes('/')) {
        const parts = birth_date.split('/');
        if (parts.length === 3) {
          // DD/MM/YYYY or YYYY/MM/DD
          if (parts[2].length === 4) {
            birth_date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      }

      // Validations
      if (!full_name) {
        errors.push('Nama lengkap wajib diisi');
      }

      if (!nisn) {
        errors.push('NISN wajib diisi');
      } else if (!/^\d{10}$/.test(nisn)) {
        errors.push(`NISN harus 10 digit angka (Ditemukan: "${nisn}")`);
      } else if (existingNisns.has(nisn)) {
        errors.push(`NISN ${nisn} sudah terdaftar di database`);
        duplicateCount++;
      } else if (seenFileNisns.has(nisn)) {
        errors.push(`NISN ${nisn} duplikat di dalam berkas impor ini`);
        duplicateCount++;
      } else {
        seenFileNisns.add(nisn);
      }

      if (!nipd) {
        errors.push('NIPD wajib diisi');
      } else if (existingNipds.has(nipd)) {
        errors.push(`NIPD ${nipd} sudah terdaftar di database`);
        duplicateCount++;
      } else if (seenFileNipds.has(nipd)) {
        errors.push(`NIPD ${nipd} duplikat di dalam berkas impor ini`);
        duplicateCount++;
      } else {
        seenFileNipds.add(nipd);
      }

      if (nik && !/^\d{16}$/.test(nik)) {
        errors.push(`NIK harus 16 digit angka jika diisi (Ditemukan: "${nik}")`);
      }

      if (!birth_date) {
        errors.push('Tanggal lahir wajib diisi');
      }

      const admission_year = parseInt(admission_year_str) || 2026;

      const parsedRow: ParsedImportRow = {
        rowNumber: rowNum,
        nisn,
        nipd,
        nik,
        full_name,
        nickname,
        gender,
        birth_place: birth_place || 'Jakarta',
        birth_date: birth_date || '2012-01-01',
        religion,
        class_name,
        admission_year,
        full_address,
        father_name,
        mother_name,
        parent_phone,
        status,
        isValid: errors.length === 0,
        errors,
      };

      if (parsedRow.isValid) {
        validRows.push(parsedRow);
      } else {
        invalidRows.push(parsedRow);
      }
    });

    return {
      totalRows: rawData.length,
      validRows,
      invalidRows,
      duplicateCount,
    };
  }

  /**
   * Commits validated rows into database
   */
  public static commitImport(validRows: ParsedImportRow[], filename: string, operatorName: string): number {
    const classes = db.getClasses();
    const activeAY = db.getAcademicYears().find(y => y.is_active) || db.getAcademicYears()[0];

    let successCount = 0;

    for (const r of validRows) {
      // Find or create class match
      let targetClass = classes.find(c => c.name.toLowerCase() === r.class_name.toLowerCase());
      if (!targetClass) {
        targetClass = classes[0]; // fallback
      }

      const fullData: FullStudentData = {
        student: {
          id: `std_imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          nipd: r.nipd,
          nisn: r.nisn,
          nik: r.nik || '',
          full_name: r.full_name,
          nickname: r.nickname || '',
          gender: r.gender,
          birth_place: r.birth_place,
          birth_date: r.birth_date,
          religion: (r.religion as any) || 'Islam',
          nationality: 'WNI',
          status: 'Aktif',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        education: {
          student_id: '',
          education_level: 'SMP',
          admission_year: r.admission_year,
          academic_year_id: activeAY.id,
          semester: activeAY.semester,
          class_id: targetClass.id,
          rombel: targetClass.rombel,
          register_book_no: `BI-${r.admission_year}-${r.nipd}`,
          accepted_date: new Date().toISOString().split('T')[0],
        },
        address: {
          student_id: '',
          full_address: r.full_address || 'Jl. Pendidikan No. 1',
          rt: '001',
          rw: '001',
          village: 'Menteng',
          district: 'Menteng',
          regency: 'Jakarta Pusat',
          province: 'DKI Jakarta',
          postal_code: '10310',
          residence_status: 'Bersama Orang Tua',
        },
        father: r.father_name ? {
          id: `pg_f_${Date.now()}`,
          role_type: 'father',
          full_name: r.father_name,
          phone: r.parent_phone,
          is_alive: true,
        } : undefined,
        mother: r.mother_name ? {
          id: `pg_m_${Date.now()}`,
          role_type: 'mother',
          full_name: r.mother_name,
          phone: r.parent_phone,
          is_alive: true,
        } : undefined,
        current_class_name: targetClass.name,
        academic_year_name: `${activeAY.name} ${activeAY.semester}`,
      };

      fullData.education.student_id = fullData.student.id;
      fullData.address.student_id = fullData.student.id;

      const res = db.saveStudent(fullData);
      if (res.success) {
        successCount++;
      }
    }

    // Record job
    db.recordImportJob({
      id: `job_${Date.now()}`,
      filename,
      total_rows: validRows.length,
      success_count: successCount,
      error_count: validRows.length - successCount,
      duplicate_count: 0,
      timestamp: new Date().toISOString(),
      imported_by: operatorName,
      errors: [],
    });

    return successCount;
  }

  /**
   * Generates downloadable CSV of error rows
   */
  public static downloadErrorReport(invalidRows: ParsedImportRow[]): void {
    const errorData = invalidRows.map(r => ({
      'Baris Ke': r.rowNumber,
      'Nama': r.full_name || '-',
      'NISN': r.nisn || '-',
      'NIPD': r.nipd || '-',
      'Penyebab Kesalahan': r.errors.join('; '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(errorData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Kesalahan_Impor_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Exports student data to Excel (.xlsx) or CSV (.csv) with formula injection protection
   */
  public static exportStudents(
    students: FullStudentData[],
    format: 'xlsx' | 'csv' = 'xlsx',
    includeSensitive = false
  ): void {
    const exportRows = students.map((s, idx) => {
      const row: Record<string, string | number> = {
        'No': idx + 1,
        'NIPD': sanitizeSpreadsheetCell(s.student.nipd),
        'NISN': sanitizeSpreadsheetCell(s.student.nisn),
        'Nama Lengkap': sanitizeSpreadsheetCell(s.student.full_name),
        'Jenis Kelamin': s.student.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        'Kelas': sanitizeSpreadsheetCell(s.current_class_name || '-'),
        'Tempat Lahir': sanitizeSpreadsheetCell(s.student.birth_place),
        'Tanggal Lahir': s.student.birth_date,
        'Agama': s.student.religion,
        'Tahun Masuk': s.education?.admission_year || 2026,
        'Status Siswa': s.student.status,
        'Nama Ayah': sanitizeSpreadsheetCell(s.father?.full_name || '-'),
        'Nama Ibu': sanitizeSpreadsheetCell(s.mother?.full_name || '-'),
      };

      if (includeSensitive) {
        row['NIK Siswa'] = sanitizeSpreadsheetCell(s.student.nik || '-');
        row['Alamat Lengkap'] = sanitizeSpreadsheetCell(s.address?.full_address || '-');
        row['No HP Ortu'] = sanitizeSpreadsheetCell(s.father?.phone || s.mother?.phone || '-');
        row['Penghasilan Ayah'] = sanitizeSpreadsheetCell(s.father?.monthly_income || '-');
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Data_Siswa_${timestamp}.${format}`;

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      XLSX.writeFile(workbook, filename);
    }

    db.addAuditLog('EXPORT', 'STUDENT', `Mengekspor ${students.length} baris data siswa ke format ${format.toUpperCase()}`);
  }
}
