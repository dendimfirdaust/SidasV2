import React, { useState, useEffect } from 'react';
import { db } from './services/db.ts';
import {
  UserProfile,
  SchoolSettings,
  AcademicYear,
  SchoolClass,
  FullStudentData,
  AuditLog,
} from './types/index.ts';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar, ActiveTab } from './components/layout/Sidebar.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { StudentListView } from './components/students/StudentListView.tsx';
import { StudentFormView } from './components/students/StudentFormView.tsx';
import { StudentDetailModal } from './components/students/StudentDetailModal.tsx';
import { ParentsView } from './components/parents/ParentsView.tsx';
import { ClassManagementView } from './components/classes/ClassManagementView.tsx';
import { ImportView } from './components/import/ImportView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { UsersView } from './components/users/UsersView.tsx';
import { SchoolSettingsView } from './components/settings/SchoolSettingsView.tsx';
import { AuditBackupView } from './components/audit/AuditBackupView.tsx';
import { LoginModal } from './components/auth/LoginModal.tsx';
import { ExcelService } from './services/excelService.ts';

export default function App() {
  // Initialize Database on App load
  useEffect(() => {
    db.init();
  }, []);

  // Application State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => db.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Core Data
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => db.getSettings());
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => db.getAcademicYears());
  const [classes, setClasses] = useState<SchoolClass[]>(() => db.getClasses());
  const [students, setStudents] = useState<FullStudentData[]>(() => db.getStudents(true));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => db.getAuditLogs());

  // Modal / Sub-views
  const [viewingStudent, setViewingStudent] = useState<FullStudentData | null>(null);
  const [editingStudent, setEditingStudent] = useState<FullStudentData | null>(null);

  // Refresh all state from db
  const refreshData = () => {
    setSchoolSettings(db.getSettings());
    setAcademicYears(db.getAcademicYears());
    setClasses(db.getClasses());
    setStudents(db.getStudents(true));
    setAuditLogs(db.getAuditLogs());
    setCurrentUser(db.getCurrentUser());
  };

  // Active Academic Year Display
  const activeAY = academicYears.find(y => y.id === schoolSettings.active_academic_year_id) || academicYears[0];
  const activeAYName = activeAY ? `${activeAY.name} Semester ${activeAY.semester}` : '2026/2027 Ganjil';

  // Live Statistics
  const stats = db.getDashboardStats();

  // Parents List
  const parentsList = db.getAllParentsAndGuardians();

  // Handlers
  const handleSaveStudent = (data: FullStudentData) => {
    const res = db.saveStudent(data);
    if (res.success) {
      refreshData();
      setActiveTab('students');
      setEditingStudent(null);
    }
    return res;
  };

  const handleArchiveStudent = (studentId: string) => {
    db.archiveStudent(studentId);
    refreshData();
  };

  const handleRestoreStudent = (studentId: string) => {
    db.restoreStudent(studentId);
    refreshData();
  };

  const handleDeletePermanent = (studentId: string) => {
    db.permanentlyDeleteStudent(studentId);
    refreshData();
  };

  const handleMoveStudent = (studentId: string, targetClassId: string, reason?: string) => {
    const res = db.moveStudentClass(studentId, targetClassId, reason);
    if (res.success) {
      refreshData();
    }
    return res;
  };

  const handleSaveClass = (cls: SchoolClass) => {
    db.saveClass(cls);
    refreshData();
  };

  const handleDeleteClass = (classId: string) => {
    db.deleteClass(classId);
    refreshData();
  };

  const handleSaveUser = (user: UserProfile) => {
    db.saveUser(user);
    refreshData();
  };

  const handleDeleteUser = (userId: string) => {
    db.deleteUser(userId);
    refreshData();
  };

  const handleSaveSettings = (settings: SchoolSettings) => {
    db.saveSettings(settings);
    refreshData();
  };

  const handleSaveAcademicYear = (year: AcademicYear) => {
    db.saveAcademicYear(year);
    refreshData();
  };

  const handleSwitchUser = (user: UserProfile) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    refreshData();
  };

  const handleLogout = () => {
    db.addAuditLog('LOGOUT', 'SYSTEM', `Pengguna ${currentUser.full_name} keluar dari sesi.`);
    setIsLoggedIn(false);
  };

  const handleLogin = (user: UserProfile) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    refreshData();
  };

  const handleQuickExport = () => {
    const activeOnly = students.filter(s => !s.student.is_archived && s.student.status === 'Aktif');
    ExcelService.exportStudents(activeOnly, 'xlsx', currentUser.role === 'admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        schoolSettings={schoolSettings}
        activeAcademicYearName={activeAYName}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={db.getUsers()}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={tab => {
            setActiveTab(tab);
            setEditingStudent(null);
          }}
          userRole={currentUser.role}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentStudents={students.filter(s => !s.student.is_archived)}
              recentLogs={auditLogs}
              onNavigate={tab => setActiveTab(tab)}
              onViewStudent={std => setViewingStudent(std)}
              userRole={currentUser.role}
              onQuickExport={handleQuickExport}
            />
          )}

          {/* TAB 2: DATA SISWA LIST */}
          {activeTab === 'students' && (
            <StudentListView
              students={students}
              classes={classes}
              userRole={currentUser.role}
              onAddStudent={() => {
                setEditingStudent(null);
                setActiveTab('add-student');
              }}
              onEditStudent={std => {
                setEditingStudent(std);
                setActiveTab('add-student');
              }}
              onViewStudent={std => setViewingStudent(std)}
              onArchiveStudent={handleArchiveStudent}
              onRestoreStudent={handleRestoreStudent}
              onDeletePermanent={handleDeletePermanent}
            />
          )}

          {/* TAB 3: TAMBAH / EDIT SISWA */}
          {activeTab === 'add-student' && (
            <StudentFormView
              initialData={editingStudent || undefined}
              classes={classes}
              academicYears={academicYears}
              existingStudents={students}
              onSave={handleSaveStudent}
              onCancel={() => {
                setEditingStudent(null);
                setActiveTab('students');
              }}
            />
          )}

          {/* TAB 4: DATA ORANG TUA / WALI */}
          {activeTab === 'parents' && (
            <ParentsView
              parentsList={parentsList}
              userRole={currentUser.role}
            />
          )}

          {/* TAB 5: DATA KELAS & ROMBEL */}
          {activeTab === 'classes' && (
            <ClassManagementView
              classes={classes}
              academicYears={academicYears}
              students={students}
              userRole={currentUser.role}
              onSaveClass={handleSaveClass}
              onDeleteClass={handleDeleteClass}
              onMoveStudent={handleMoveStudent}
              onViewStudent={std => setViewingStudent(std)}
            />
          )}

          {/* TAB 6: IMPOR DATA EXCEL */}
          {activeTab === 'import' && (
            <ImportView
              currentUser={currentUser}
              onImportSuccess={() => {
                refreshData();
                setActiveTab('students');
              }}
            />
          )}

          {/* TAB 7: LAPORAN & CETAK PDF */}
          {activeTab === 'reports' && (
            <ReportsView
              students={students}
              classes={classes}
              settings={schoolSettings}
            />
          )}

          {/* TAB 8: PENGGUNA & HAK AKSES */}
          {activeTab === 'users' && (
            <UsersView
              users={db.getUsers()}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* TAB 9: PENGATURAN SEKOLAH */}
          {activeTab === 'settings' && (
            <SchoolSettingsView
              settings={schoolSettings}
              academicYears={academicYears}
              onSaveSettings={handleSaveSettings}
              onSaveAcademicYear={handleSaveAcademicYear}
            />
          )}

          {/* TAB 10: BACKUP & AUDIT */}
          {activeTab === 'audit-backup' && (
            <AuditBackupView
              auditLogs={auditLogs}
              onDatabaseRestored={refreshData}
            />
          )}
        </main>
      </div>

      {/* Student Detail Modal */}
      {viewingStudent && (
        <StudentDetailModal
          studentData={viewingStudent}
          userRole={currentUser.role}
          onClose={() => setViewingStudent(null)}
          onEdit={() => {
            setEditingStudent(viewingStudent);
            setViewingStudent(null);
            setActiveTab('add-student');
          }}
        />
      )}

      {/* Login Screen Modal if logged out */}
      {!isLoggedIn && (
        <LoginModal
          users={db.getUsers()}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
