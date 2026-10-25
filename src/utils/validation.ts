/**
 * Pure validation and transformation utilities for SIDAS.
 */

export interface StudentInput {
  nisn: string;
  nipd: string;
  nik: string;
  full_name: string;
  gender: 'L' | 'P';
  birth_date: string;
  class_id?: string;
  academic_year_id?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates mandatory student fields and format rules
 */
export function validateStudent(input: Partial<StudentInput>, existingStudents: StudentInput[] = []): ValidationError[] {
  const errors: ValidationError[] = [];

  // NISN validation: exactly 10 digits in Indonesian Dapodik
  if (!input.nisn || !input.nisn.trim()) {
    errors.push({ field: 'nisn', message: 'NISN wajib diisi' });
  } else if (!/^\d{10}$/.test(input.nisn.trim())) {
    errors.push({ field: 'nisn', message: 'NISN harus terdiri dari 10 digit angka' });
  } else if (existingStudents.some(s => s.nisn === input.nisn?.trim())) {
    errors.push({ field: 'nisn', message: 'NISN sudah terdaftar di sistem' });
  }

  // NIPD validation: required, digits and letters allowed, unique
  if (!input.nipd || !input.nipd.trim()) {
    errors.push({ field: 'nipd', message: 'NIPD wajib diisi' });
  } else if (existingStudents.some(s => s.nipd === input.nipd?.trim())) {
    errors.push({ field: 'nipd', message: 'NIPD sudah terdaftar di sistem' });
  }

  // NIK validation: 16 digits Indonesian national ID
  if (input.nik && input.nik.trim()) {
    if (!/^\d{16}$/.test(input.nik.trim())) {
      errors.push({ field: 'nik', message: 'NIK harus terdiri dari 16 digit angka' });
    }
  }

  // Full name validation: min 3 characters
  if (!input.full_name || input.full_name.trim().length < 3) {
    errors.push({ field: 'full_name', message: 'Nama lengkap minimal 3 karakter' });
  }

  // Gender validation
  if (!input.gender || (input.gender !== 'L' && input.gender !== 'P')) {
    errors.push({ field: 'gender', message: 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan)' });
  }

  // Birth date validation
  if (!input.birth_date) {
    errors.push({ field: 'birth_date', message: 'Tanggal lahir wajib diisi' });
  }

  return errors;
}

/**
 * Masks sensitive Indonesian ID numbers (NIK)
 * Example: 3201012304990001 -> 3201**********01
 */
export function maskSensitiveId(id: string | undefined): string {
  if (!id) return '-';
  const clean = id.trim();
  if (clean.length <= 6) return '******';
  const start = clean.slice(0, 4);
  const end = clean.slice(-2);
  const masked = '*'.repeat(Math.max(4, clean.length - 6));
  return `${start}${masked}${end}`;
}

/**
 * Masks phone numbers
 * Example: 081234567890 -> 0812-****-7890
 */
export function maskPhoneNumber(phone: string | undefined): string {
  if (!phone) return '-';
  const clean = phone.trim();
  if (clean.length < 8) return '****';
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start}-****-${end}`;
}

/**
 * Sanitizes input to prevent spreadsheet formula injection (CSV/Excel injection)
 */
export function sanitizeSpreadsheetCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    // Prefix dangerous leading characters with a single quote
    return `'${str}`;
  }
  return str;
}

/**
 * Calculates completeness percentage of student profile
 */
export function calculateProfileCompleteness(student: {
  nisn?: string;
  nipd?: string;
  nik?: string;
  full_name?: string;
  birth_place?: string;
  birth_date?: string;
  gender?: string;
  religion?: string;
  address?: string;
  father_name?: string;
  mother_name?: string;
  class_id?: string;
  photo_url?: string;
}): { percentage: number; isComplete: boolean; missingFields: string[] } {
  const fields = [
    { key: 'nisn', label: 'NISN' },
    { key: 'nipd', label: 'NIPD' },
    { key: 'nik', label: 'NIK' },
    { key: 'full_name', label: 'Nama Lengkap' },
    { key: 'birth_place', label: 'Tempat Lahir' },
    { key: 'birth_date', label: 'Tanggal Lahir' },
    { key: 'gender', label: 'Jenis Kelamin' },
    { key: 'religion', label: 'Agama' },
    { key: 'address', label: 'Alamat Siswa' },
    { key: 'father_name', label: 'Nama Ayah' },
    { key: 'mother_name', label: 'Nama Ibu' },
    { key: 'class_id', label: 'Kelas' },
  ];

  const missing: string[] = [];
  let filled = 0;

  for (const f of fields) {
    const val = (student as Record<string, unknown>)[f.key];
    if (val && String(val).trim()) {
      filled++;
    } else {
      missing.push(f.label);
    }
  }

  const percentage = Math.round((filled / fields.length) * 100);
  return {
    percentage,
    isComplete: percentage === 100,
    missingFields: missing,
  };
}
