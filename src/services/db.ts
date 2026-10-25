import {
  FullStudentData,
  SchoolSettings,
  AcademicYear,
  SchoolClass,
  UserProfile,
  AuditLog,
  ImportJob,
  DashboardStats,
  ParentGuardian,
} from '../types/index.ts';
import {
  initialSchoolSettings,
  initialAcademicYears,
  initialClasses,
  initialUsers,
  initialStudents,
  initialAuditLogs,
} from './sampleData.ts';
import { calculateProfileCompleteness } from '../utils/validation.ts';

const DB_KEYS = {
  SETTINGS: 'sidas_school_settings_v1',
  ACADEMIC_YEARS: 'sidas_academic_years_v1',
  CLASSES: 'sidas_classes_v1',
  USERS: 'sidas_users_v1',
  STUDENTS: 'sidas_students_v1',
  AUDIT_LOGS: 'sidas_audit_logs_v1',
  IMPORT_JOBS: 'sidas_import_jobs_v1',
  CURRENT_USER: 'sidas_current_user_v1',
};

class DatabaseService {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // --- Initialization ---
  public init(): void {
    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
      this.setStorage(DB_KEYS.SETTINGS, initialSchoolSettings);
    }
    if (!localStorage.getItem(DB_KEYS.ACADEMIC_YEARS)) {
      this.setStorage(DB_KEYS.ACADEMIC_YEARS, initialAcademicYears);
    }
    if (!localStorage.getItem(DB_KEYS.CLASSES)) {
      this.setStorage(DB_KEYS.CLASSES, initialClasses);
    }
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      this.setStorage(DB_KEYS.USERS, initialUsers);
    }
    if (!localStorage.getItem(DB_KEYS.STUDENTS)) {
      this.setStorage(DB_KEYS.STUDENTS, initialStudents);
    }
    if (!localStorage.getItem(DB_KEYS.AUDIT_LOGS)) {
      this.setStorage(DB_KEYS.AUDIT_LOGS, initialAuditLogs);
    }
    if (!localStorage.getItem(DB_KEYS.CURRENT_USER)) {
      this.setStorage(DB_KEYS.CURRENT_USER, initialUsers[0]); // default admin
    }
  }

  // --- Auth & Session ---
  public getCurrentUser(): UserProfile {
    return this.getStorage<UserProfile>(DB_KEYS.CURRENT_USER, initialUsers[0]);
  }

  public setCurrentUser(user: UserProfile): void {
    this.setStorage(DB_KEYS.CURRENT_USER, user);
    this.addAuditLog('LOGIN', 'SYSTEM', `Pengguna ${user.full_name} (${user.role.toUpperCase()}) berganti sesi/login.`);
  }

  public getUsers(): UserProfile[] {
    return this.getStorage<UserProfile[]>(DB_KEYS.USERS, initialUsers);
  }

  public saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
      this.addAuditLog('UPDATE', 'USER', `Memperbarui akun pengguna: ${user.full_name} (${user.role})`);
    } else {
      users.push(user);
      this.addAuditLog('CREATE', 'USER', `Menambahkan akun pengguna baru: ${user.full_name} (${user.role})`);
    }
    this.setStorage(DB_KEYS.USERS, users);
  }

  public deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.setStorage(DB_KEYS.USERS, users);
    this.addAuditLog('DELETE', 'USER', `Menghapus akun pengguna ID: ${userId}`);
  }

  // --- School Settings ---
  public getSettings(): SchoolSettings {
    return this.getStorage<SchoolSettings>(DB_KEYS.SETTINGS, initialSchoolSettings);
  }

  public saveSettings(settings: SchoolSettings): void {
    this.setStorage(DB_KEYS.SETTINGS, settings);
    this.addAuditLog('UPDATE', 'SETTINGS', `Memperbarui identitas dan pengaturan sekolah: ${settings.name}`);
  }

  // --- Academic Years ---
  public getAcademicYears(): AcademicYear[] {
    return this.getStorage<AcademicYear[]>(DB_KEYS.ACADEMIC_YEARS, initialAcademicYears);
  }

  public saveAcademicYear(year: AcademicYear): void {
    let years = this.getAcademicYears();
    if (year.is_active) {
      // Deactivate other years if this one is made active
      years = years.map(y => ({ ...y, is_active: y.id === year.id }));
    }
    const idx = years.findIndex(y => y.id === year.id);
    if (idx >= 0) {
      years[idx] = year;
    } else {
      years.push(year);
    }
    this.setStorage(DB_KEYS.ACADEMIC_YEARS, years);

    if (year.is_active) {
      const settings = this.getSettings();
      settings.active_academic_year_id = year.id;
      this.setStorage(DB_KEYS.SETTINGS, settings);
    }
    this.addAuditLog('UPDATE', 'SETTINGS', `Memperbarui data tahun ajaran: ${year.name} ${year.semester}`);
  }

  // --- Classes ---
  public getClasses(): SchoolClass[] {
    return this.getStorage<SchoolClass[]>(DB_KEYS.CLASSES, initialClasses);
  }

  public saveClass(cls: SchoolClass): void {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === cls.id);
    if (idx >= 0) {
      classes[idx] = cls;
      this.addAuditLog('UPDATE', 'CLASS', `Memperbarui data kelas: ${cls.name}`);
    } else {
      classes.push(cls);
      this.addAuditLog('CREATE', 'CLASS', `Menambahkan kelas baru: ${cls.name} (Tingkat ${cls.grade_level})`);
    }
    this.setStorage(DB_KEYS.CLASSES, classes);
  }

  public deleteClass(classId: string): void {
    const classes = this.getClasses().filter(c => c.id !== classId);
    this.setStorage(DB_KEYS.CLASSES, classes);
    this.addAuditLog('DELETE', 'CLASS', `Menghapus kelas ID: ${classId}`);
  }

  // --- Students ---
  public getStudents(includeArchived = false): FullStudentData[] {
    const students = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);
    if (includeArchived) return students;
    return students.filter(s => !s.student.is_archived);
  }

  public getStudentById(id: string): FullStudentData | undefined {
    const students = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);
    return students.find(s => s.student.id === id);
  }

  public saveStudent(data: FullStudentData): { success: boolean; message?: string } {
    const all = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);

    // Duplicate check for NISN and NIPD across other students
    const duplicateNisn = all.find(
      s => s.student.id !== data.student.id && s.student.nisn === data.student.nisn.trim()
    );
    if (duplicateNisn) {
      return { success: false, message: `NISN ${data.student.nisn} sudah digunakan oleh ${duplicateNisn.student.full_name}` };
    }

    const duplicateNipd = all.find(
      s => s.student.id !== data.student.id && s.student.nipd === data.student.nipd.trim()
    );
    if (duplicateNipd) {
      return { success: false, message: `NIPD ${data.student.nipd} sudah digunakan oleh ${duplicateNipd.student.full_name}` };
    }

    // Attach current class name and academic year name for convenience
    const classes = this.getClasses();
    const currentClass = classes.find(c => c.id === data.education.class_id);
    if (currentClass) {
      data.current_class_name = currentClass.name;
    }

    const years = this.getAcademicYears();
    const currentYear = years.find(y => y.id === data.education.academic_year_id);
    if (currentYear) {
      data.academic_year_name = `${currentYear.name} ${currentYear.semester}`;
    }

    data.student.updated_at = new Date().toISOString();

    const idx = all.findIndex(s => s.student.id === data.student.id);
    if (idx >= 0) {
      all[idx] = data;
      this.addAuditLog('UPDATE', 'STUDENT', `Memperbarui biodata siswa: ${data.student.full_name} (${data.student.nisn})`, data.student.id);
    } else {
      if (!data.student.created_at) {
        data.student.created_at = new Date().toISOString();
      }
      all.push(data);
      this.addAuditLog('CREATE', 'STUDENT', `Menambahkan siswa baru: ${data.student.full_name} (${data.student.nisn}, Kelas ${data.current_class_name || '-'})`, data.student.id);
    }

    this.setStorage(DB_KEYS.STUDENTS, all);
    return { success: true };
  }

  public archiveStudent(studentId: string): void {
    const all = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);
    const target = all.find(s => s.student.id === studentId);
    if (target) {
      target.student.is_archived = true;
      target.student.updated_at = new Date().toISOString();
      this.setStorage(DB_KEYS.STUDENTS, all);
      this.addAuditLog('ARCHIVE', 'STUDENT', `Mengarsipkan data siswa: ${target.student.full_name} (${target.student.nisn})`, studentId);
    }
  }

  public restoreStudent(studentId: string): void {
    const all = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);
    const target = all.find(s => s.student.id === studentId);
    if (target) {
      target.student.is_archived = false;
      target.student.updated_at = new Date().toISOString();
      this.setStorage(DB_KEYS.STUDENTS, all);
      this.addAuditLog('RESTORE', 'STUDENT', `Memulihkan data siswa dari arsip: ${target.student.full_name} (${target.student.nisn})`, studentId);
    }
  }

  public permanentlyDeleteStudent(studentId: string): void {
    const all = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);
    const target = all.find(s => s.student.id === studentId);
    const filtered = all.filter(s => s.student.id !== studentId);
    this.setStorage(DB_KEYS.STUDENTS, filtered);
    this.addAuditLog('DELETE', 'STUDENT', `Menghapus permanen data siswa: ${target?.student.full_name || studentId}`, studentId);
  }

  // --- Move student to another class ---
  public moveStudentClass(studentId: string, targetClassId: string, reason?: string): { success: boolean; message?: string } {
    const all = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);
    const target = all.find(s => s.student.id === studentId);
    if (!target) return { success: false, message: 'Data siswa tidak ditemukan' };

    const classes = this.getClasses();
    const newClass = classes.find(c => c.id === targetClassId);
    if (!newClass) return { success: false, message: 'Kelas tujuan tidak ditemukan' };

    const oldClassName = target.current_class_name || 'Tidak ada kelas';

    // Update enrollment history
    if (!target.enrollment_history) target.enrollment_history = [];
    const activeAY = this.getAcademicYears().find(y => y.is_active) || this.getAcademicYears()[0];

    target.enrollment_history.push({
      id: `eh_${Date.now()}`,
      student_id: studentId,
      class_id: targetClassId,
      class_name: newClass.name,
      academic_year_id: activeAY.id,
      academic_year_name: `${activeAY.name} ${activeAY.semester}`,
      semester: activeAY.semester,
      status: 'Aktif',
      start_date: new Date().toISOString().split('T')[0],
    });

    target.education.class_id = targetClassId;
    target.education.rombel = newClass.rombel;
    target.current_class_name = newClass.name;
    target.student.updated_at = new Date().toISOString();

    this.setStorage(DB_KEYS.STUDENTS, all);
    this.addAuditLog('UPDATE', 'STUDENT', `Memindahkan siswa ${target.student.full_name} dari kelas ${oldClassName} ke kelas ${newClass.name}. Keterangan: ${reason || 'Perubahan Rombel'}`, studentId);
    return { success: true };
  }

  // --- Parents & Guardians Directory ---
  public getAllParentsAndGuardians(): { parent: ParentGuardian; studentNames: string[]; studentCount: number }[] {
    const students = this.getStudents(true);
    const map = new Map<string, { parent: ParentGuardian; studentNames: string[] }>();

    for (const item of students) {
      if (item.father && item.father.full_name) {
        const key = item.father.nik || item.father.full_name;
        if (!map.has(key)) {
          map.set(key, { parent: item.father, studentNames: [item.student.full_name] });
        } else {
          map.get(key)!.studentNames.push(item.student.full_name);
        }
      }
      if (item.mother && item.mother.full_name) {
        const key = item.mother.nik || item.mother.full_name;
        if (!map.has(key)) {
          map.set(key, { parent: item.mother, studentNames: [item.student.full_name] });
        } else {
          map.get(key)!.studentNames.push(item.student.full_name);
        }
      }
      if (item.guardian && item.guardian.full_name) {
        const key = item.guardian.nik || item.guardian.full_name;
        if (!map.has(key)) {
          map.set(key, { parent: item.guardian, studentNames: [item.student.full_name] });
        } else {
          map.get(key)!.studentNames.push(item.student.full_name);
        }
      }
    }

    return Array.from(map.values()).map(v => ({
      parent: v.parent,
      studentNames: v.studentNames,
      studentCount: v.studentNames.length,
    }));
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.getStorage<AuditLog[]>(DB_KEYS.AUDIT_LOGS, initialAuditLogs);
  }

  public addAuditLog(
    action: AuditLog['action'],
    entity_type: AuditLog['entity_type'],
    description: string,
    entity_id?: string
  ): void {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.full_name || 'System',
      user_role: currentUser?.role || 'admin',
      action,
      entity_type,
      entity_id,
      description,
      ip_address: '127.0.0.1 (Lokal)',
    };
    logs.unshift(newLog);
    // Keep max 500 logs
    if (logs.length > 500) logs.pop();
    this.setStorage(DB_KEYS.AUDIT_LOGS, logs);
  }

  // --- Import Jobs ---
  public getImportJobs(): ImportJob[] {
    return this.getStorage<ImportJob[]>(DB_KEYS.IMPORT_JOBS, []);
  }

  public recordImportJob(job: ImportJob): void {
    const jobs = this.getImportJobs();
    jobs.unshift(job);
    this.setStorage(DB_KEYS.IMPORT_JOBS, jobs);
    this.addAuditLog(
      'IMPORT',
      'STUDENT',
      `Impor data dari berkas "${job.filename}": ${job.success_count} berhasil, ${job.error_count} ditolak, ${job.duplicate_count} duplikat.`
    );
  }

  // --- Real Live Dashboard Statistics (Direct from Database) ---
  public getDashboardStats(): DashboardStats {
    const all = this.getStorage<FullStudentData[]>(DB_KEYS.STUDENTS, initialStudents);
    const active = all.filter(s => !s.student.is_archived && s.student.status === 'Aktif');
    const classes = this.getClasses();
    const settings = this.getSettings();
    const activeYear = this.getAcademicYears().find(y => y.id === settings.active_academic_year_id);

    const totalActive = active.length;
    const totalMale = active.filter(s => s.student.gender === 'L').length;
    const totalFemale = active.filter(s => s.student.gender === 'P').length;

    // New students in current academic year (admission_year == 2026 or current active year)
    const activeYearNumber = activeYear ? parseInt(activeYear.name.split('/')[0]) : 2026;
    const totalNewStudentsThisYear = active.filter(s => s.education.admission_year === activeYearNumber).length;

    const totalTransferred = all.filter(s => !s.student.is_archived && s.student.status === 'Pindah').length;
    const totalGraduated = all.filter(s => !s.student.is_archived && s.student.status === 'Lulus').length;
    const totalDroppedOut = all.filter(s => !s.student.is_archived && s.student.status === 'Keluar').length;
    const totalArchived = all.filter(s => s.student.is_archived).length;

    // Incomplete profile counts
    let totalIncompleteData = 0;
    for (const item of active) {
      const completeness = calculateProfileCompleteness({
        nisn: item.student.nisn,
        nipd: item.student.nipd,
        nik: item.student.nik,
        full_name: item.student.full_name,
        birth_place: item.student.birth_place,
        birth_date: item.student.birth_date,
        gender: item.student.gender,
        religion: item.student.religion,
        address: item.address?.full_address,
        father_name: item.father?.full_name,
        mother_name: item.mother?.full_name,
        class_id: item.education?.class_id,
      });
      if (!completeness.isComplete) {
        totalIncompleteData++;
      }
    }

    // Class counts
    const classCounts = classes.map(cls => {
      const count = active.filter(s => s.education.class_id === cls.id).length;
      return {
        className: cls.name,
        gradeLevel: cls.grade_level,
        count,
      };
    });

    // Religion counts
    const religionMap: Record<string, number> = {
      Islam: 0,
      Kristen: 0,
      Katolik: 0,
      Hindu: 0,
      Buddha: 0,
      Konghucu: 0,
      Lainnya: 0,
    };
    for (const item of active) {
      const rel = item.student.religion || 'Lainnya';
      religionMap[rel] = (religionMap[rel] || 0) + 1;
    }
    const religionCounts = Object.entries(religionMap).map(([religion, count]) => ({ religion, count }));

    // Admission year trends
    const yearMap: Record<number, number> = {};
    for (const item of all.filter(s => !s.student.is_archived)) {
      const y = item.education?.admission_year || 2026;
      yearMap[y] = (yearMap[y] || 0) + 1;
    }
    const admissionYearTrends = Object.entries(yearMap)
      .map(([yr, count]) => ({ year: parseInt(yr), count }))
      .sort((a, b) => a.year - b.year);

    return {
      totalActive,
      totalMale,
      totalFemale,
      totalNewStudentsThisYear,
      totalTransferred,
      totalGraduated,
      totalDroppedOut,
      totalIncompleteData,
      totalArchived,
      classCounts,
      religionCounts,
      admissionYearTrends,
    };
  }

  // --- Full Database Backup & Restore ---
  public exportFullDatabase(): string {
    const backup = {
      app: 'SIDAS - Sistem Informasi Data Siswa Sekolah',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      exported_by: this.getCurrentUser()?.full_name || 'Administrator',
      data: {
        settings: this.getSettings(),
        academic_years: this.getAcademicYears(),
        classes: this.getClasses(),
        users: this.getUsers(),
        students: this.getStudents(true),
        audit_logs: this.getAuditLogs(),
        import_jobs: this.getImportJobs(),
      },
    };
    this.addAuditLog('EXPORT', 'SYSTEM', 'Mengunduh berkas pencadangan penuh basis data (Full JSON Backup)');
    return JSON.stringify(backup, null, 2);
  }

  public restoreFullDatabase(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !parsed.data.students || !parsed.data.classes) {
        return { success: false, message: 'Format berkas backup tidak valid atau rusak.' };
      }

      this.setStorage(DB_KEYS.SETTINGS, parsed.data.settings || initialSchoolSettings);
      this.setStorage(DB_KEYS.ACADEMIC_YEARS, parsed.data.academic_years || initialAcademicYears);
      this.setStorage(DB_KEYS.CLASSES, parsed.data.classes || initialClasses);
      this.setStorage(DB_KEYS.USERS, parsed.data.users || initialUsers);
      this.setStorage(DB_KEYS.STUDENTS, parsed.data.students || initialStudents);
      if (parsed.data.audit_logs) this.setStorage(DB_KEYS.AUDIT_LOGS, parsed.data.audit_logs);
      if (parsed.data.import_jobs) this.setStorage(DB_KEYS.IMPORT_JOBS, parsed.data.import_jobs);

      this.addAuditLog('RESTORE', 'SYSTEM', `Memulihkan basis data dari berkas cadangan (${parsed.data.students.length} siswa dipulihkan)`);
      return { success: true, message: `Basis data berhasil dipulihkan! Total ${parsed.data.students.length} siswa dimuat.` };
    } catch (e) {
      return { success: false, message: `Gagal membaca berkas: ${(e as Error).message}` };
    }
  }

  public resetToSampleData(): void {
    this.setStorage(DB_KEYS.SETTINGS, initialSchoolSettings);
    this.setStorage(DB_KEYS.ACADEMIC_YEARS, initialAcademicYears);
    this.setStorage(DB_KEYS.CLASSES, initialClasses);
    this.setStorage(DB_KEYS.USERS, initialUsers);
    this.setStorage(DB_KEYS.STUDENTS, initialStudents);
    this.setStorage(DB_KEYS.AUDIT_LOGS, initialAuditLogs);
    this.setStorage(DB_KEYS.IMPORT_JOBS, []);
    this.setStorage(DB_KEYS.CURRENT_USER, initialUsers[0]);
    this.addAuditLog('RESET', 'SYSTEM', 'Mereset sistem kembali ke data contoh fiktif awal.');
  }
}

export const db = new DatabaseService();
