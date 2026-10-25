import { jsPDF } from 'jspdf';
import { FullStudentData, SchoolSettings } from '../types/index.ts';
import { db } from './db.ts';

export class PdfService {
  /**
   * Generates official Indonesian Biodata Siswa PDF (Buku Induk Siswa)
   */
  public static generateStudentBiodataPdf(studentData: FullStudentData, settings?: SchoolSettings): void {
    const s = studentData.student;
    const edu = studentData.education;
    const addr = studentData.address;
    const father = studentData.father;
    const mother = studentData.mother;
    const guardian = studentData.guardian;
    const school = settings || db.getSettings();

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let y = 18;

    // --- Official Kop Surat Sekolah ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PEMERINTAH PROVINSI ' + (school.province || 'DKI JAKARTA').toUpperCase(), 105, y, { align: 'center' });
    y += 5;
    doc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', 105, y, { align: 'center' });
    y += 6;
    doc.setFontSize(14);
    doc.text(school.name.toUpperCase(), 105, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(
      `${school.address}, Kel. ${school.village}, Kec. ${school.district}, ${school.regency}`,
      105,
      y,
      { align: 'center' }
    );
    y += 4;
    doc.text(
      `Telp: ${school.phone} | Email: ${school.email} | NPSN: ${school.npsn}`,
      105,
      y,
      { align: 'center' }
    );
    y += 3;

    // Double rule line (Kop surat standard)
    doc.setLineWidth(0.8);
    doc.line(15, y, 195, y);
    y += 1;
    doc.setLineWidth(0.2);
    doc.line(15, y, 195, y);
    y += 8;

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('LEMBAR BUKU INDUK SISWA / BIODATA PESERTA DIDIK', 105, y, { align: 'center' });
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tahun Ajaran: ${studentData.academic_year_name || '2026/2027'} | Nomor Induk: ${s.nipd} | NISN: ${s.nisn}`, 105, y, { align: 'center' });
    y += 7;

    // Photo Box Placeholder on Top Right (3 x 4 cm = 30 x 40 mm)
    const photoX = 160;
    const photoY = y;
    doc.setLineWidth(0.3);
    doc.rect(photoX, photoY, 30, 40);
    doc.setFontSize(8);
    doc.text('Pas Foto Siswa\n3 x 4 cm', photoX + 15, photoY + 18, { align: 'center' });

    // Helper for table row
    const drawRow = (label: string, value: string | undefined, currentY: number, maxWidth = 135): number => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(label, 18, currentY);
      doc.text(':', 68, currentY);
      doc.text(value || '-', 72, currentY, { maxWidth: currentY < photoY + 42 ? 85 : maxWidth });
      return currentY + 5;
    };

    const drawSectionHeader = (title: string, currentY: number): number => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setFillColor(241, 245, 249);
      doc.rect(15, currentY - 3.5, 180, 5, 'F');
      doc.text(title, 18, currentY);
      return currentY + 5.5;
    };

    // A. KETERANGAN PRIBADI SISWA
    y = drawSectionHeader('A. IDENTITAS PRIBADI SISWA', y);
    y = drawRow('1. Nama Lengkap', s.full_name, y);
    y = drawRow('2. Nama Panggilan', s.nickname, y);
    y = drawRow('3. Nomor Induk Siswa (NIPD)', s.nipd, y);
    y = drawRow('4. Nomor Induk Siswa Nasional (NISN)', s.nisn, y);
    y = drawRow('5. NIK Siswa', s.nik, y);
    y = drawRow('6. Jenis Kelamin', s.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)', y);
    y = drawRow('7. Tempat, Tanggal Lahir', `${s.birth_place}, ${s.birth_date}`, y);
    y = drawRow('8. Agama & Kepercayaan', s.religion, y);
    y = drawRow('9. Kewarganegaraan', s.nationality || 'WNI', y);
    y = drawRow('10. Anak Ke / Jumlah Saudara', `${s.order_in_family || 1} dari ${s.sibling_count || 1} bersaudara`, y);
    y = drawRow('11. Bahasa Sehari-hari', s.daily_language || 'Bahasa Indonesia', y);
    y += 2;

    // B. DATA PENDIDIKAN & KELAS
    y = drawSectionHeader('B. DATA PENDIDIKAN & PENERIMAAN', y);
    y = drawRow('1. Kelas Saat Ini', `${studentData.current_class_name || edu?.class_id || '-'} (Rombel ${edu?.rombel || '-'})`, y);
    y = drawRow('2. Nomor Buku Induk', edu?.register_book_no || `BI-${s.nipd}`, y);
    y = drawRow('3. Asal Sekolah Sebelumnya', edu?.previous_school || '-', y);
    y = drawRow('4. Tanggal Diterima di Sekolah Ini', edu?.accepted_date || '-', y);
    y = drawRow('5. Status Siswa', s.status, y);
    if (s.status !== 'Aktif') {
      y = drawRow('   - Tanggal & Alasan Keluar/Lulus', `${s.exit_date || '-'} (${s.exit_destination || s.admin_notes || '-'})`, y);
    }
    y += 2;

    // C. ALAMAT SISWA
    y = drawSectionHeader('C. ALAMAT DAN TEMPAT TINGGAL', y);
    y = drawRow('1. Alamat Rumah Lengkap', addr?.full_address, y);
    y = drawRow('2. RT / RW / Kelurahan', `RT ${addr?.rt || '-'} / RW ${addr?.rw || '-'}, Kel. ${addr?.village || '-'}`, y);
    y = drawRow('3. Kecamatan / Kabupaten/Kota', `Kec. ${addr?.district || '-'}, ${addr?.regency || '-'}`, y);
    y = drawRow('4. Provinsi & Kode Pos', `${addr?.province || '-'} - ${addr?.postal_code || '-'}`, y);
    y = drawRow('5. Status Tempat Tinggal', addr?.residence_status || 'Bersama Orang Tua', y);
    y += 2;

    // D. DATA ORANG TUA / WALI
    y = drawSectionHeader('D. DATA ORANG TUA KANDUNG / WALI', y);
    y = drawRow('1. Nama Ayah Kandung', father?.full_name, y);
    y = drawRow('2. Pendidikan & Pekerjaan Ayah', `${father?.education || '-'} / ${father?.job || '-'}`, y);
    y = drawRow('3. No. Telepon / HP Ayah', father?.phone, y);
    y = drawRow('4. Nama Ibu Kandung', mother?.full_name, y);
    y = drawRow('5. Pendidikan & Pekerjaan Ibu', `${mother?.education || '-'} / ${mother?.job || '-'}`, y);
    y = drawRow('6. No. Telepon / HP Ibu', mother?.phone, y);

    if (guardian && guardian.full_name) {
      y = drawRow('7. Nama Wali / Hubungan', `${guardian.full_name} (${guardian.relationship_with_student || 'Wali'})`, y);
      y = drawRow('8. Pekerjaan & No HP Wali', `${guardian.job || '-'} / ${guardian.phone || '-'}`, y);
    }
    y += 7;

    // Signatures
    const printDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(8.5);
    doc.text(`${school.district || 'Jakarta'}, ${printDate}`, 150, y, { align: 'center' });
    y += 4;
    doc.text('Mengetahui,', 40, y, { align: 'center' });
    doc.text('Orang Tua / Wali Siswa,', 150, y, { align: 'center' });
    y += 4;
    doc.text('Kepala Sekolah,', 40, y, { align: 'center' });

    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text(school.headmaster_name, 40, y, { align: 'center' });
    doc.text(`( ${father?.full_name || mother?.full_name || guardian?.full_name || '...........................................'} )`, 150, y, { align: 'center' });
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(`NIP. ${school.headmaster_nip}`, 40, y, { align: 'center' });

    doc.save(`Biodata_${s.nisn}_${s.full_name.replace(/\s+/g, '_')}.pdf`);
    db.addAuditLog('EXPORT', 'STUDENT', `Mencetak Biodata Resmi PDF siswa: ${s.full_name} (NISN: ${s.nisn})`, s.id);
  }

  /**
   * Generates Official Class Student List PDF (Landscape A4)
   */
  public static generateClassListPdf(className: string, students: FullStudentData[], settings?: SchoolSettings): void {
    const school = settings || db.getSettings();
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    let y = 15;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(school.name.toUpperCase(), 148, y, { align: 'center' });
    y += 5;
    doc.setFontSize(13);
    doc.text(`DAFTAR SISWA KELAS ${className.toUpperCase()}`, 148, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Tahun Ajaran: 2026/2027 Ganjil | Total Siswa: ${students.length} orang`, 148, y, { align: 'center' });
    y += 6;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(12, y, 273, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('NO', 15, y + 4.5);
    doc.text('NIPD', 24, y + 4.5);
    doc.text('NISN', 42, y + 4.5);
    doc.text('NAMA LENGKAP', 68, y + 4.5);
    doc.text('L/P', 130, y + 4.5);
    doc.text('TEMPAT, TGL LAHIR', 142, y + 4.5);
    doc.text('AGAMA', 190, y + 4.5);
    doc.text('NAMA AYAH / IBU', 215, y + 4.5);
    doc.text('STATUS', 265, y + 4.5);

    y += 7;
    doc.setFont('helvetica', 'normal');

    students.forEach((item, index) => {
      if (y > 185) {
        doc.addPage();
        y = 20;
      }

      const s = item.student;
      doc.text(String(index + 1), 15, y + 4);
      doc.text(s.nipd, 24, y + 4);
      doc.text(s.nisn, 42, y + 4);
      doc.text(s.full_name.slice(0, 32), 68, y + 4);
      doc.text(s.gender, 131, y + 4);
      doc.text(`${s.birth_place.slice(0, 10)}, ${s.birth_date}`, 142, y + 4);
      doc.text(s.religion, 190, y + 4);
      doc.text((item.father?.full_name || item.mother?.full_name || '-').slice(0, 24), 215, y + 4);
      doc.text(s.status, 265, y + 4);

      doc.setLineWidth(0.1);
      doc.setDrawColor(226, 232, 240);
      doc.line(12, y + 6, 285, y + 6);
      y += 6;
    });

    const printDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    y += 10;
    if (y > 175) {
      doc.addPage();
      y = 25;
    }

    doc.text(`${school.district || 'Jakarta'}, ${printDate}`, 240, y, { align: 'center' });
    y += 5;
    doc.text('Wali Kelas,', 240, y, { align: 'center' });
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('( .................................................... )', 240, y, { align: 'center' });

    doc.save(`Daftar_Siswa_Kelas_${className}_${Date.now()}.pdf`);
    db.addAuditLog('EXPORT', 'CLASS', `Mencetak Daftar Siswa PDF Kelas: ${className}`);
  }
}
