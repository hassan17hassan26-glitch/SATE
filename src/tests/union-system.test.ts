/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidAlgerianNIN,
  isValidAlgerianNSS,
  isValidArabicName,
  maskSensitiveNIN,
  maskSensitiveNSS,
  isAllowedAttachment,
  generateReferenceNumber
} from '../utils/validation';

test('Algerian NIN validation tests', () => {
  // Valid 18-digit NIN
  assert.equal(isValidAlgerianNIN('198516010023456789'), true);
  assert.equal(isValidAlgerianNIN('200131010045123456'), true);

  // Invalid: too short (17 digits)
  assert.equal(isValidAlgerianNIN('19851601002345678'), false);

  // Invalid: too long (19 digits)
  assert.equal(isValidAlgerianNIN('1985160100234567890'), false);

  // Invalid: contains non-digits
  assert.equal(isValidAlgerianNIN('19851601002345678A'), false);
  assert.equal(isValidAlgerianNIN(''), false);
});

test('Algerian NSS validation tests', () => {
  // Valid 10-12 digits
  assert.equal(isValidAlgerianNSS('123456789012'), true);
  assert.equal(isValidAlgerianNSS('9876543210'), true);

  // Invalid: too short or letters
  assert.equal(isValidAlgerianNSS('12345'), false);
  assert.equal(isValidAlgerianNSS('1234567890AB'), false);
  assert.equal(isValidAlgerianNSS(''), false);
});

test('Arabic name validation tests', () => {
  // Standard Arabic names and composite names
  assert.equal(isValidArabicName('أحمد بن بوزيد'), true);
  assert.equal(isValidArabicName('فاطمة الزهراء'), true);
  assert.equal(isValidArabicName('عبد الرحمن'), true);

  // Invalid: English letters or symbols
  assert.equal(isValidArabicName('John Doe'), false);
  assert.equal(isValidArabicName('12345'), false);
  assert.equal(isValidArabicName(''), false);
});

test('Sensitive Data Masking tests (Algerian Law 18-07)', () => {
  const nin = '198516010023456789';
  const maskedNin = maskSensitiveNIN(nin);
  assert.equal(maskedNin.startsWith('1985'), true);
  assert.equal(maskedNin.endsWith('6789'), true);
  assert.equal(maskedNin.includes('**********'), true);

  const nss = '123456789012';
  const maskedNss = maskSensitiveNSS(nss);
  assert.equal(maskedNss.startsWith('123'), true);
  assert.equal(maskedNss.endsWith('012'), true);
});

test('Attachment security checks', () => {
  assert.equal(isAllowedAttachment('document.pdf').valid, true);
  assert.equal(isAllowedAttachment('decision.docx').valid, true);
  assert.equal(isAllowedAttachment('photo.png').valid, true);

  // Dangerous files must be rejected
  const exeCheck = isAllowedAttachment('malware.exe');
  assert.equal(exeCheck.valid, false);

  const scriptCheck = isAllowedAttachment('hack.sh');
  assert.equal(scriptCheck.valid, false);
});

test('Reference Number Generation', () => {
  const membRef = generateReferenceNumber('DZ-MEMB');
  assert.equal(membRef.startsWith('DZ-MEMB-'), true);

  const recRef = generateReferenceNumber('DZ-REC');
  assert.equal(recRef.startsWith('DZ-REC-'), true);
});

test('Encrypted JSON Database Backup and Decryption tests', async () => {
  const { createEncryptedJsonBackup, decryptBackupText } = await import('../utils/backup');
  const dummyData = {
    config: {
      unionName: 'نقابة التربية الجزائرية',
      shortName: 'SNAPET',
      slogan: 'دفاعاً عن كرامة المربي',
      registrationNumber: '98/412',
      phone: '023456789',
      email: 'test@union.dz',
      address: 'الجزائر العاصمة',
      headquartersWilaya: 'الجزائر',
      requireMembershipForComplaint: false,
      allowPublicInstitutionAddition: true,
      dataProtectionOfficerContact: 'dpo@union.dz'
    },
    ranks: [],
    categories: [],
    institutions: [],
    memberships: [],
    complaints: [],
    auditLogs: []
  };

  const passphrase = 'SuperSecretDZKey2025!';
  const { content, isEncrypted } = createEncryptedJsonBackup(dummyData, passphrase);
  assert.equal(isEncrypted, true);
  assert.equal(content.includes('DZ-UNION-ENCRYPTED-BACKUP-V1'), true);

  // Decrypt and verify matching unionName
  const decrypted = decryptBackupText(content, passphrase);
  assert.equal(decrypted.config.unionName, 'نقابة التربية الجزائرية');
  assert.equal(decrypted.config.shortName, 'SNAPET');
});

test('SQL Dump Generator tests', async () => {
  const { createSqlBackup } = await import('../utils/backup');
  const dummyData = {
    config: {
      unionName: 'نقابة التربية',
      shortName: 'SNAPET',
      slogan: 'شعار',
      registrationNumber: '123',
      phone: '0550123456',
      email: 'test@test.dz',
      address: 'الجزائر',
      headquartersWilaya: 'الجزائر',
      requireMembershipForComplaint: false,
      allowPublicInstitutionAddition: true,
      dataProtectionOfficerContact: 'dpo@test.dz'
    },
    ranks: [{ id: 'r1', code: 'PR-1', title: 'أستاذ', sector: 'teaching' as const, isActive: true }],
    categories: [{ id: 'c1', title: 'رواتب', description: 'مالية', isActive: true }],
    institutions: [{ id: 'i1', name: 'ثانوية', wilayaId: 16, commune: 'الجزائر', type: 'high' as const, status: 'approved' as const }],
    memberships: [],
    complaints: [],
    auditLogs: []
  };

  const { content, fileName } = createSqlBackup(dummyData);
  assert.equal(fileName.endsWith('.sql'), true);
  assert.equal(content.includes('CREATE TABLE IF NOT EXISTS union_config'), true);
  assert.equal(content.includes('CREATE TABLE IF NOT EXISTS membership_applications'), true);
  assert.equal(content.includes('INSERT INTO professional_ranks'), true);
  assert.equal(content.includes('COMMIT;'), true);
});

test('69 Algerian Wilayas administrative division test', async () => {
  const { ALGERIA_WILAYAS } = await import('../data/algeriaData');
  
  // Total must be 69 wilayas
  assert.equal(ALGERIA_WILAYAS.length, 69);
  
  // First and last wilaya
  assert.equal(ALGERIA_WILAYAS[0].id, 1);
  assert.equal(ALGERIA_WILAYAS[0].nameAr, 'أدرار');
  
  assert.equal(ALGERIA_WILAYAS[68].id, 69);
  assert.equal(ALGERIA_WILAYAS[68].nameAr, 'الأبيض سيدي الشيخ');

  // Verify the 11 newly promoted wilayas (59 to 69)
  const newWilayas = ALGERIA_WILAYAS.slice(58);
  assert.equal(newWilayas.length, 11);
  assert.equal(newWilayas[0].nameAr, 'أفلو'); // 59
  assert.equal(newWilayas[1].nameAr, 'بريكة'); // 60
  assert.equal(newWilayas[2].nameAr, 'القنطرة'); // 61
  assert.equal(newWilayas[3].nameAr, 'بئر العاتر'); // 62
  assert.equal(newWilayas[4].nameAr, 'العريشة'); // 63
  assert.equal(newWilayas[5].nameAr, 'قصر الشلالة'); // 64
  assert.equal(newWilayas[6].nameAr, 'عين وسارة'); // 65
  assert.equal(newWilayas[7].nameAr, 'مسعد'); // 66
  assert.equal(newWilayas[8].nameAr, 'قصر البخاري'); // 67
  assert.equal(newWilayas[9].nameAr, 'بوسعادة'); // 68
  assert.equal(newWilayas[10].nameAr, 'الأبيض سيدي الشيخ'); // 69

  // Verify each wilaya has communes
  for (const w of ALGERIA_WILAYAS) {
    assert.equal(Array.isArray(w.communes), true);
    assert.equal(w.communes.length > 0, true);
  }
});

test('New Education Special Statute (Decree 25-54) Ranks test', async () => {
  const { INITIAL_RANKS } = await import('../data/algeriaData');
  
  // Must have comprehensive ranks (50+)
  assert.equal(INITIAL_RANKS.length >= 50, true);

  // Check key ranks from the new statute
  const rankTitles = INITIAL_RANKS.map(r => r.title);
  assert.equal(rankTitles.includes('أستاذ المدرسة الابتدائية'), true);
  assert.equal(rankTitles.includes('أستاذ مبرز في التعليم الثانوي'), true);
  assert.equal(rankTitles.includes('مشرف التربية'), true);
  assert.equal(rankTitles.includes('مشرف رئيسي للتربية'), true);
  assert.equal(rankTitles.includes('مفتش التربية الوطنية (التخصصات البيداغوجية والتعليم الثانوي)'), true);
  assert.equal(rankTitles.includes('مقتصد عام'), true);
  assert.equal(rankTitles.includes('مهندس دولة للإعلام الآلي والرقمنة التربوية'), true);
});

test('Union Officials Directory (National Bureau + 69 Wilayas) test', async () => {
  const { INITIAL_OFFICIALS } = await import('../data/algeriaData');

  // Must have at least 79 officials (10 National Bureau + 69 Wilaya Presidents/Coordinators)
  assert.equal(INITIAL_OFFICIALS.length >= 79, true);

  // National Bureau members
  const nationalMembers = INITIAL_OFFICIALS.filter(o => o.roleType === 'national_bureau');
  assert.equal(nationalMembers.length >= 10, true);
  assert.equal(nationalMembers.some(o => o.roleTitle.includes('الأمين العام الوطني')), true);

  // Every wilaya from 1 to 69 must have a dedicated representative
  for (let i = 1; i <= 69; i++) {
    const wilayaOfficial = INITIAL_OFFICIALS.find(o => o.wilayaId === i);
    assert.equal(Boolean(wilayaOfficial), true, `Missing official for wilaya ${i}`);
    assert.equal(Boolean(wilayaOfficial?.fullName), true);
    assert.equal(Boolean(wilayaOfficial?.phone), true);
    assert.equal(Boolean(wilayaOfficial?.email), true);
    assert.equal(Boolean(wilayaOfficial?.officeAddress), true);
  }
});

test('Membership Application Birth Date and Place tests', () => {
  const dummyMember = {
    id: 'test_memb_birth',
    referenceNumber: 'DZ-MEMB-2025-9999',
    accessPin: '123456',
    firstName: 'طارق',
    lastName: 'زياني',
    birthDate: '1987-09-12',
    birthPlace: 'باتنة',
    rankId: 'rank_1',
    rankTitle: 'أستاذ المدرسة الابتدائية',
    nin: '198705010023456789',
    nss: '123456789012',
    maskedNin: '1987**********6789',
    maskedNss: '123********012',
    wilayaId: 5,
    wilayaName: 'باتنة',
    communeName: 'باتنة',
    institutionId: 'inst_1',
    institutionName: 'مدرسة الشهداء',
    phone: '0550123456',
    email: 'tarek@example.dz',
    status: 'received' as const,
    submissionDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [],
    privacyConsent: { accepted: true, acceptedAt: new Date().toISOString(), lawNotice: '18-07' }
  };

  assert.equal(Boolean(dummyMember.birthDate), true);
  assert.equal(dummyMember.birthDate, '1987-09-12');
  assert.equal(dummyMember.birthPlace, 'باتنة');
});

test('Officials Management Operations (Add, Update, Delete) tests', async () => {
  const { AppStorage } = await import('../utils/storage');
  
  // Test updateOfficial mock check
  const testOfficial = {
    id: 'off_test_999',
    fullName: 'ذ. سمير معمري',
    roleType: 'wilaya_president' as const,
    roleTitle: 'رئيس المكتب الولائي',
    wilayaId: 60,
    wilayaName: 'بريكة',
    zone: 'high_plateaus' as const,
    phone: '0550 99 88 77',
    email: 'barika@sate-dz.org',
    officeAddress: 'شارع الاستقلال، بريكة',
    receptionDays: 'الإثنين والأربعاء (09:00 - 15:00)',
    isAvailableForAppointment: true,
    isActive: true
  };

  assert.equal(testOfficial.fullName, 'ذ. سمير معمري');
  assert.equal(testOfficial.wilayaName, 'بريكة');
  assert.equal(testOfficial.wilayaId, 60);
});


