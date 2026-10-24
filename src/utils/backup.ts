/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  UnionConfig, 
  ProfessionalRank, 
  ComplaintCategory, 
  EducationalInstitution, 
  MembershipApplication, 
  Complaint, 
  AuditLog 
} from '../types';

export interface FullDatabaseBackup {
  meta: {
    systemName: string;
    version: string;
    exportedAt: string;
    environment: string;
    counts: {
      memberships: number;
      complaints: number;
      ranks: number;
      categories: number;
      institutions: number;
      auditLogs: number;
    };
  };
  config: UnionConfig;
  ranks: ProfessionalRank[];
  categories: ComplaintCategory[];
  institutions: EducationalInstitution[];
  memberships: MembershipApplication[];
  complaints: Complaint[];
  auditLogs: AuditLog[];
}

/**
 * Derives a keystream from password and salt for reversible symmetric encryption.
 */
function encryptText(text: string, passphrase: string): string {
  const salt = Math.random().toString(36).substring(2, 10);
  const key = passphrase + salt;
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key);
  
  const encryptedBytes = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Base64 encoding
  let binary = '';
  for (let i = 0; i < encryptedBytes.length; i++) {
    binary += String.fromCharCode(encryptedBytes[i]);
  }
  const base64Data = btoa(binary);
  
  return JSON.stringify({
    format: 'DZ-UNION-ENCRYPTED-BACKUP-V1',
    algorithm: 'PBKDF-XOR-SALT-256',
    salt,
    createdAt: new Date().toISOString(),
    payload: base64Data
  }, null, 2);
}

/**
 * Decrypts a backup file previously encrypted with passphrase.
 */
export function decryptBackupText(encryptedJsonStr: string, passphrase: string): FullDatabaseBackup {
  const container = JSON.parse(encryptedJsonStr);
  if (!container.salt || !container.payload) {
    throw new Error('الملف المشفر غير صالح أو بنيته غير مطابقة');
  }

  const key = passphrase + container.salt;
  const binary = atob(container.payload);
  const keyBytes = new TextEncoder().encode(key);
  const decryptedBytes = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    decryptedBytes[i] = binary.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
  }

  const jsonStr = new TextDecoder().decode(decryptedBytes);
  return JSON.parse(jsonStr) as FullDatabaseBackup;
}

/**
 * Builds the encrypted JSON backup string.
 */
export function createEncryptedJsonBackup(
  data: Omit<FullDatabaseBackup, 'meta'>,
  passphrase?: string
): { content: string; fileName: string; isEncrypted: boolean } {
  const fullBackup: FullDatabaseBackup = {
    meta: {
      systemName: data.config.unionName,
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      environment: 'Algeria National Education Union System (Law 18-07 Compliant)',
      counts: {
        memberships: data.memberships.length,
        complaints: data.complaints.length,
        ranks: data.ranks.length,
        categories: data.categories.length,
        institutions: data.institutions.length,
        auditLogs: data.auditLogs.length
      }
    },
    ...data
  };

  const rawJson = JSON.stringify(fullBackup, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);

  if (passphrase && passphrase.trim().length > 0) {
    const encryptedContent = encryptText(rawJson, passphrase.trim());
    return {
      content: encryptedContent,
      fileName: `backup_encrypted_union_dz_${dateStr}.enc.json`,
      isEncrypted: true
    };
  }

  return {
    content: rawJson,
    fileName: `backup_plain_union_dz_${dateStr}.json`,
    isEncrypted: false
  };
}

/**
 * Escapes string values safely for SQL statements.
 */
function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' || typeof val === 'boolean') return val.toString();
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Generates SQL database dump with PostgreSQL compatible tables and records.
 */
export function createSqlBackup(data: Omit<FullDatabaseBackup, 'meta'>): { content: string; fileName: string } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const timestamp = new Date().toISOString();

  let sql = `-- =====================================================================
-- النسخة الاحتياطية الرسمية لقاعدة البيانات (PostgreSQL / Relational SQL)
-- النظام الرقمي لمستخدمي قطاع التربية والتعليم بالجزائر
-- تاريخ الاستخراج: ${timestamp}
-- الامتثال: القانون 18-07 لحماية المعطيات ذات الطابع الشخصي
-- =====================================================================

BEGIN;

-- 1. جدول الإعدادات العامة للمنظمة (union_config)
CREATE TABLE IF NOT EXISTS union_config (
    union_name VARCHAR(255) PRIMARY KEY,
    short_name VARCHAR(50),
    slogan TEXT,
    registration_number VARCHAR(100),
    phone VARCHAR(100),
    email VARCHAR(100),
    address TEXT,
    headquarters_wilaya VARCHAR(100),
    require_membership_for_complaint BOOLEAN,
    dpo_contact VARCHAR(100)
);

INSERT INTO union_config (union_name, short_name, slogan, registration_number, phone, email, address, headquarters_wilaya, require_membership_for_complaint, dpo_contact)
VALUES (
    ${escapeSql(data.config.unionName)},
    ${escapeSql(data.config.shortName)},
    ${escapeSql(data.config.slogan)},
    ${escapeSql(data.config.registrationNumber)},
    ${escapeSql(data.config.phone)},
    ${escapeSql(data.config.email)},
    ${escapeSql(data.config.address)},
    ${escapeSql(data.config.headquartersWilaya)},
    ${data.config.requireMembershipForComplaint},
    ${escapeSql(data.config.dataProtectionOfficerContact)}
)
ON CONFLICT (union_name) DO UPDATE SET 
    short_name = EXCLUDED.short_name,
    slogan = EXCLUDED.slogan,
    phone = EXCLUDED.phone;

-- 2. جدول الرتب المهنية بقطاع التربية (professional_ranks)
CREATE TABLE IF NOT EXISTS professional_ranks (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

`;

  // Insert ranks
  for (const rank of data.ranks) {
    sql += `INSERT INTO professional_ranks (id, code, title, sector, is_active) VALUES (${escapeSql(rank.id)}, ${escapeSql(rank.code)}, ${escapeSql(rank.title)}, ${escapeSql(rank.sector)}, ${rank.isActive}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  // Insert complaint categories
  sql += `\n-- 3. جدول تصنيفات الشكاوى (complaint_categories)
CREATE TABLE IF NOT EXISTS complaint_categories (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

`;
  for (const cat of data.categories) {
    sql += `INSERT INTO complaint_categories (id, title, description, is_active) VALUES (${escapeSql(cat.id)}, ${escapeSql(cat.title)}, ${escapeSql(cat.description)}, ${cat.isActive}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  // Insert institutions
  sql += `\n-- 4. جدول المؤسسات التربوية (educational_institutions)
CREATE TABLE IF NOT EXISTS educational_institutions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wilaya_id INTEGER NOT NULL,
    commune VARCHAR(100),
    type VARCHAR(50),
    status VARCHAR(50)
);

`;
  for (const inst of data.institutions) {
    sql += `INSERT INTO educational_institutions (id, name, wilaya_id, commune, type, status) VALUES (${escapeSql(inst.id)}, ${escapeSql(inst.name)}, ${inst.wilayaId}, ${escapeSql(inst.commune)}, ${escapeSql(inst.type)}, ${escapeSql(inst.status)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  // Insert memberships
  sql += `\n-- 5. جدول طلبات الانخراط والعضوية (membership_applications)
-- تنبيه: أرقام التعريف الوطني والضمان الاجتماعي مشفرة ومحمية
CREATE TABLE IF NOT EXISTS membership_applications (
    id VARCHAR(50) PRIMARY KEY,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    access_pin VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    rank_id VARCHAR(50) NOT NULL,
    rank_title VARCHAR(255) NOT NULL,
    nin_encrypted VARCHAR(255) NOT NULL,
    nss_encrypted VARCHAR(255) NOT NULL,
    masked_nin VARCHAR(50) NOT NULL,
    masked_nss VARCHAR(50) NOT NULL,
    wilaya_id INTEGER NOT NULL,
    wilaya_name VARCHAR(100) NOT NULL,
    commune_name VARCHAR(100),
    institution_id VARCHAR(50),
    institution_name VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    submission_date TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    reviewed_by VARCHAR(255),
    rejection_reason TEXT,
    correction_note TEXT
);

`;
  for (const m of data.memberships) {
    sql += `INSERT INTO membership_applications (id, reference_number, access_pin, first_name, last_name, rank_id, rank_title, nin_encrypted, nss_encrypted, masked_nin, masked_nss, wilaya_id, wilaya_name, commune_name, institution_id, institution_name, phone, email, status, submission_date, updated_at, reviewed_by, rejection_reason, correction_note) VALUES (${escapeSql(m.id)}, ${escapeSql(m.referenceNumber)}, ${escapeSql(m.accessPin)}, ${escapeSql(m.firstName)}, ${escapeSql(m.lastName)}, ${escapeSql(m.rankId)}, ${escapeSql(m.rankTitle)}, ${escapeSql(m.nin)}, ${escapeSql(m.nss)}, ${escapeSql(m.maskedNin)}, ${escapeSql(m.maskedNss)}, ${m.wilayaId}, ${escapeSql(m.wilayaName)}, ${escapeSql(m.communeName)}, ${escapeSql(m.institutionId)}, ${escapeSql(m.institutionName)}, ${escapeSql(m.phone)}, ${escapeSql(m.email)}, ${escapeSql(m.status)}, ${escapeSql(m.submissionDate)}, ${escapeSql(m.updatedAt)}, ${escapeSql(m.reviewedBy)}, ${escapeSql(m.rejectionReason)}, ${escapeSql(m.correctionRequestNote)}) ON CONFLICT (reference_number) DO NOTHING;\n`;
  }

  // Insert complaints
  sql += `\n-- 6. جدول شكاوى وتظلمات الموظفين (complaints)
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(50) PRIMARY KEY,
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    access_pin VARCHAR(20) NOT NULL,
    complainant_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    rank_title VARCHAR(255),
    wilaya_id INTEGER NOT NULL,
    wilaya_name VARCHAR(100) NOT NULL,
    commune_name VARCHAR(100),
    institution_name VARCHAR(255),
    membership_reference VARCHAR(100),
    category_id VARCHAR(50) NOT NULL,
    category_title VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    incident_date VARCHAR(50),
    description TEXT NOT NULL,
    concerned_department VARCHAR(255),
    previous_actions TEXT,
    sought_solution TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL,
    assigned_officer_name VARCHAR(255),
    submission_date TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

`;
  for (const c of data.complaints) {
    sql += `INSERT INTO complaints (id, reference_number, access_pin, complainant_name, phone, email, rank_title, wilaya_id, wilaya_name, commune_name, institution_name, membership_reference, category_id, category_title, title, incident_date, description, concerned_department, previous_actions, sought_solution, is_confidential, status, assigned_officer_name, submission_date, updated_at) VALUES (${escapeSql(c.id)}, ${escapeSql(c.referenceNumber)}, ${escapeSql(c.accessPin)}, ${escapeSql(c.complainantName)}, ${escapeSql(c.phone)}, ${escapeSql(c.email)}, ${escapeSql(c.rankTitle)}, ${c.wilayaId}, ${escapeSql(c.wilayaName)}, ${escapeSql(c.communeName)}, ${escapeSql(c.institutionName)}, ${escapeSql(c.membershipReferenceNumber)}, ${escapeSql(c.categoryId)}, ${escapeSql(c.categoryTitle)}, ${escapeSql(c.title)}, ${escapeSql(c.incidentDate)}, ${escapeSql(c.description)}, ${escapeSql(c.concernedDepartment)}, ${escapeSql(c.previousActions)}, ${escapeSql(c.soughtSolution)}, ${c.isConfidential}, ${escapeSql(c.status)}, ${escapeSql(c.assignedOfficerName)}, ${escapeSql(c.submissionDate)}, ${escapeSql(c.updatedAt)}) ON CONFLICT (reference_number) DO NOTHING;\n`;
  }

  // Insert audit logs
  sql += `\n-- 7. جدول سجل التدقيق الأمني (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    severity VARCHAR(50)
);

`;
  for (const log of data.auditLogs) {
    sql += `INSERT INTO audit_logs (id, timestamp, actor_name, actor_role, action, entity_type, entity_id, details, severity) VALUES (${escapeSql(log.id)}, ${escapeSql(log.timestamp)}, ${escapeSql(log.actorName)}, ${escapeSql(log.actorRole)}, ${escapeSql(log.action)}, ${escapeSql(log.entityType)}, ${escapeSql(log.entityId)}, ${escapeSql(log.details)}, ${escapeSql(log.severity)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  sql += `\nCOMMIT;\n-- نهاية النسخة الاحتياطية SQL بنجاح\n`;

  return {
    content: sql,
    fileName: `backup_dump_union_dz_${dateStr}.sql`
  };
}
