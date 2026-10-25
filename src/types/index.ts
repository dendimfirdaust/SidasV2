export type UserRole = 'admin' | 'operator' | 'guru';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  active: boolean;
  assigned_class_ids?: string[]; // For teachers/guru
  created_at: string;
}

export interface SchoolSettings {
  id: string;
  name: string;
  npsn: string;
  level: string; // 'SD' | 'SMP' | 'SMA' | 'SMK'
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postal_code: string;
  phone: string;
  email: string;
  website: string;
  headmaster_name: string;
  headmaster_nip: string;
  operator_name: string;
  active_academic_year_id: string;
  logo_url?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026/2027"
  semester: 'Ganjil' | 'Genap';
  is_active: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "7-A", "8-B", "9-C"
  grade_level: number; // 7, 8, 9
  rombel: string; // 'A', 'B', 'C'
  academic_year_id: string;
  homeroom_teacher: string;
  max_capacity: number;
}

export type StudentStatus = 'Aktif' | 'Pindah' | 'Lulus' | 'Keluar';
export type Gender = 'L' | 'P';
export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu' | 'Lainnya';
export type ResidenceStatus = 'Bersama Orang Tua' | 'Wali' | 'Kos' | 'Asrama' | 'Panti Asuhan' | 'Lainnya';

export interface Student {
  id: string;
  nipd: string;
  nisn: string;
  nik: string;
  full_name: string;
  nickname?: string;
  gender: Gender;
  birth_place: string;
  birth_date: string;
  religion: Religion;
  nationality: string;
  order_in_family?: number;
  sibling_count?: number;
  daily_language?: string;
  special_needs?: string;
  photo_url?: string;
  status: StudentStatus;
  exit_date?: string;
  exit_destination?: string;
  admin_notes?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentEducation {
  student_id: string;
  education_level: string;
  admission_year: number;
  academic_year_id: string;
  semester: 'Ganjil' | 'Genap';
  class_id: string;
  rombel: string;
  register_book_no: string;
  previous_school?: string;
  accepted_date: string;
}

export interface StudentAddress {
  student_id: string;
  full_address: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postal_code: string;
  residence_status: ResidenceStatus;
  transport_mode?: string;
  distance_km?: number;
}

export interface ParentGuardian {
  id: string;
  role_type: 'father' | 'mother' | 'guardian';
  full_name: string;
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  education?: string;
  job?: string;
  monthly_income?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_alive?: boolean;
  relationship_with_student?: string; // for guardian
  notes?: string;
}

export interface EmergencyContact {
  student_id: string;
  name: string;
  relationship: string;
  phone: string;
  notes?: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  doc_type: string;
  doc_name: string;
  file_url: string;
  file_size_kb: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface StudentEnrollmentHistory {
  id: string;
  student_id: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'Ganjil' | 'Genap';
  status: 'Aktif' | 'Naik Kelas' | 'Tinggal Kelas' | 'Lulus' | 'Pindah' | 'Keluar';
  start_date: string;
  end_date?: string;
}

export interface FullStudentData {
  student: Student;
  education: StudentEducation;
  address: StudentAddress;
  father?: ParentGuardian;
  mother?: ParentGuardian;
  guardian?: ParentGuardian;
  emergency_contact?: EmergencyContact;
  documents?: StudentDocument[];
  enrollment_history?: StudentEnrollmentHistory[];
  current_class_name?: string;
  academic_year_name?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'RESTORE' | 'IMPORT' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'RESET';
  entity_type: 'STUDENT' | 'PARENT' | 'CLASS' | 'USER' | 'SETTINGS' | 'SYSTEM';
  entity_id?: string;
  description: string;
  ip_address: string;
}

export interface ImportJob {
  id: string;
  filename: string;
  total_rows: number;
  success_count: number;
  error_count: number;
  duplicate_count: number;
  timestamp: string;
  imported_by: string;
  errors: { row: number; identifier: string; reason: string }[];
}

export interface DashboardStats {
  totalActive: number;
  totalMale: number;
  totalFemale: number;
  totalNewStudentsThisYear: number;
  totalTransferred: number;
  totalGraduated: number;
  totalDroppedOut: number;
  totalIncompleteData: number;
  totalArchived: number;
  classCounts: { className: string; gradeLevel: number; count: number }[];
  religionCounts: { religion: string; count: number }[];
  admissionYearTrends: { year: number; count: number }[];
}
