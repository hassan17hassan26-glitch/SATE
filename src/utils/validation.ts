/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validates Algerian National Identification Number (NIN / رقم التعريف الوطني)
 * Standard Algerian biometric NIN consists of exactly 18 digits.
 */
export function isValidAlgerianNIN(nin: string): boolean {
  if (!nin) return false;
  const clean = nin.trim();
  // Check exactly 18 digits
  return /^\d{18}$/.test(clean);
}

/**
 * Validates Algerian Social Security Number (NSS / رقم الضمان الاجتماعي)
 * Standard Algerian CNAS/CASNOS format is typically 10 to 12 digits.
 */
export function isValidAlgerianNSS(nss: string): boolean {
  if (!nss) return false;
  const clean = nss.trim();
  return /^\d{10,12}$/.test(clean);
}

/**
 * Validates Algerian Mobile/Fixed Phone number
 * E.g., 0550123456, 0661234567, 0770987654, 023456789 (9 to 10 digits starting with 0)
 */
export function isValidAlgerianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-\.]/g, '');
  return /^(0[2-7]\d{7,8}|\+213[2-7]\d{7,8})$/.test(clean);
}

/**
 * Validates Arabic Names (allows Arabic characters, spaces, hyphens and composite names)
 */
export function isValidArabicName(name: string): boolean {
  if (!name) return false;
  const clean = name.trim();
  if (clean.length < 2) return false;
  // Accepts Arabic Unicode characters, spaces, and hyphens/apostrophes
  const arabicRegex = /^[\u0621-\u064A\u0671-\u06D3\s\-\']{2,50}$/;
  return arabicRegex.test(clean);
}

/**
 * Masks sensitive NIN according to Algerian Data Protection Law 18-07.
 * Shows first 4 and last 4 digits only.
 */
export function maskSensitiveNIN(nin: string): string {
  if (!nin) return '******************';
  const clean = nin.trim();
  if (clean.length < 8) return '********';
  return `${clean.slice(0, 4)}**********${clean.slice(-4)}`;
}

/**
 * Masks sensitive NSS according to Algerian Data Protection Law 18-07.
 */
export function maskSensitiveNSS(nss: string): string {
  if (!nss) return '************';
  const clean = nss.trim();
  if (clean.length < 6) return '******';
  return `${clean.slice(0, 3)}******${clean.slice(-3)}`;
}

/**
 * Generates secure, collision-resistant reference number.
 * Format: DZ-MEMB-YEAR-XXXXX or DZ-REC-YEAR-XXXXX
 */
export function generateReferenceNumber(prefix: 'DZ-MEMB' | 'DZ-REC'): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${year}-${randomChars}${randomDigits}`;
}

/**
 * Generates a 6-digit secure access PIN for application/complaint tracking.
 */
export function generateAccessPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Safe file check for uploaded complaint attachments.
 * Prevents executable, script, and dangerous extensions.
 */
export function isAllowedAttachment(fileName: string, mimeType?: string): { valid: boolean; error?: string } {
  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: 'نوع الملف غير مسموح به. الصيغ المقبولة فقط هي: PDF، JPG، PNG، DOCX'
    };
  }

  // Deny hazardous executables explicitly
  const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'php', 'js', 'vbs', 'scr', 'html', 'jar'];
  if (dangerousExtensions.includes(ext)) {
    return {
      valid: false,
      error: 'محاولة رفع ملف تنفيذي أو برمجي محظور لأسباب أمنية.'
    };
  }

  return { valid: true };
}
