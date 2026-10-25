import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStudent,
  maskSensitiveId,
  maskPhoneNumber,
  sanitizeSpreadsheetCell,
  calculateProfileCompleteness,
} from './validation.ts';

test('validateStudent detects missing required fields', () => {
  const errors = validateStudent({});
  const errorFields = errors.map(e => e.field);
  assert.ok(errorFields.includes('nisn'));
  assert.ok(errorFields.includes('nipd'));
  assert.ok(errorFields.includes('full_name'));
  assert.ok(errorFields.includes('gender'));
  assert.ok(errorFields.includes('birth_date'));
});

test('validateStudent enforces 10 digit NISN format', () => {
  const invalidErrors = validateStudent({ nisn: '12345' });
  assert.ok(invalidErrors.some(e => e.field === 'nisn' && e.message.includes('10 digit')));

  const validErrors = validateStudent({
    nisn: '0081234567',
    nipd: '26001',
    full_name: 'Ahmad Rizky Pratama',
    gender: 'L',
    birth_date: '2012-05-14',
  });
  assert.equal(validErrors.length, 0);
});

test('validateStudent prevents duplicate NISN and NIPD', () => {
  const existing = [
    {
      nisn: '0081234567',
      nipd: '26001',
      nik: '3201010101010001',
      full_name: 'Ahmad',
      gender: 'L' as const,
      birth_date: '2012-01-01',
    },
  ];

  const duplicateNISN = validateStudent(
    {
      nisn: '0081234567',
      nipd: '26002',
      full_name: 'Budi Santoso',
      gender: 'L',
      birth_date: '2012-02-02',
    },
    existing
  );
  assert.ok(duplicateNISN.some(e => e.field === 'nisn' && e.message.includes('sudah terdaftar')));

  const duplicateNIPD = validateStudent(
    {
      nisn: '0089999999',
      nipd: '26001',
      full_name: 'Budi Santoso',
      gender: 'L',
      birth_date: '2012-02-02',
    },
    existing
  );
  assert.ok(duplicateNIPD.some(e => e.field === 'nipd' && e.message.includes('sudah terdaftar')));
});

test('maskSensitiveId masks Indonesian NIK securely', () => {
  const nik = '3201012304990001';
  const masked = maskSensitiveId(nik);
  assert.equal(masked, '3201**********01');
  assert.equal(masked.length, nik.length);
});

test('maskPhoneNumber masks Indonesian mobile numbers', () => {
  const phone = '081234567890';
  const masked = maskPhoneNumber(phone);
  assert.equal(masked, '0812-****-7890');
});

test('sanitizeSpreadsheetCell prevents CSV/formula injection attacks', () => {
  assert.equal(sanitizeSpreadsheetCell('=1+1'), "'=1+1");
  assert.equal(sanitizeSpreadsheetCell('+cmd|'), "'+cmd|");
  assert.equal(sanitizeSpreadsheetCell('-SUM(A1:A10)'), "'-SUM(A1:A10)");
  assert.equal(sanitizeSpreadsheetCell('@evil'), "'@evil");
  assert.equal(sanitizeSpreadsheetCell('Normal Name'), 'Normal Name');
  assert.equal(sanitizeSpreadsheetCell(12345), '12345');
});

test('calculateProfileCompleteness computes percentage and identifies missing fields', () => {
  const partial = {
    nisn: '0081234567',
    nipd: '26001',
    full_name: 'Ahmad Rizky Pratama',
  };
  const res = calculateProfileCompleteness(partial);
  assert.ok(res.percentage < 50);
  assert.equal(res.isComplete, false);
  assert.ok(res.missingFields.includes('Tanggal Lahir'));
  assert.ok(res.missingFields.includes('Nama Ibu'));
});
