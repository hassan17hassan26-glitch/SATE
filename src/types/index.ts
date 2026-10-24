/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'super_admin'          // مدير النظام
  | 'membership_officer'    // مسؤول العضوية
  | 'complaints_officer'    // مسؤول الشكاوى
  | 'wilaya_officer'        // مسؤول ولائي
  | 'local_officer'         // مسؤول محلي
  | 'committee'             // اللجنة المختصة
  | 'member_user';          // موظف / منخرط

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  wilayaId?: number; // للتقييد الجغرافي للمسؤول الولائي
  communeName?: string;
  institutionName?: string;
  isActive: boolean;
  createdAt: string;
}

export type MembershipStatus =
  | 'draft'               // مسودة
  | 'received'            // مستلم
  | 'under_review'        // قيد المراجعة
  | 'needs_correction'    // بحاجة إلى تصحيح
  | 'approved'            // مقبول
  | 'rejected'            // مرفوض
  | 'cancelled';          // ملغى

export interface StatusHistoryItem {
  id: string;
  status: string;
  timestamp: string;
  actorName: string;
  note?: string;
}

export interface MembershipApplication {
  id: string;
  referenceNumber: string; // مثال: DZ-MEMB-2025-0842
  accessPin: string;       // رمز سري للمتابعة الآمنة دون تسريب
  firstName: string;
  lastName: string;
  rankId: string;
  rankTitle: string;
  nin: string;             // رقم التعريف الوطني (18 رقم) - مشفر أو مخزن بشكل محمي
  nss: string;             // رقم الضمان الاجتماعي
  maskedNin: string;       // للعرض الآمن: 1985**********0123
  maskedNss: string;       // للعرض الآمن: 28**********14
  wilayaId: number;
  wilayaName: string;
  communeName: string;
  institutionId: string;
  institutionName: string;
  phone: string;
  email: string;
  status: MembershipStatus;
  submissionDate: string;
  updatedAt: string;
  reviewedBy?: string;
  rejectionReason?: string;
  correctionRequestNote?: string;
  statusHistory: StatusHistoryItem[];
  privacyConsent: {
    accepted: boolean;
    acceptedAt: string;
    lawNotice: string;
  };
}

export type ComplaintStatus =
  | 'draft'               // 1. مسودة
  | 'received'            // 2. مستلمة
  | 'triaging'            // 3. قيد الفرز
  | 'under_study'         // 4. قيد الدراسة
  | 'needs_info'          // 5. بحاجة إلى معلومات إضافية
  | 'referred'            // 6. محالة إلى المسؤول المختص
  | 'in_progress'         // 7. قيد المتابعة
  | 'response_drafted'    // 8. تم إعداد رد
  | 'responded'           // 9. تم الرد على مقدم الشكوى
  | 'closed'              // 10. مغلقة
  | 'out_of_jurisdiction' // 11. غير داخلة ضمن اختصاص النقابة
  | 'archived';           // 12. محفوظة وفق سياسة الاحتفاظ المعتمدة

export interface ComplaintAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number; // bytes
  uploadDate: string;
  isSensitive: boolean;
}

export interface ComplaintOfficialResponse {
  id: string;
  authorName: string;
  authorRoleTitle: string;
  date: string;
  title: string;
  content: string;
  approved: boolean;
}

export interface ComplaintInternalNote {
  id: string;
  authorName: string;
  authorRole: string;
  date: string;
  content: string;
  restrictedToCommitteeOnly: boolean;
}

export interface ComplaintComplainantUpdate {
  id: string;
  date: string;
  text: string;
  hasAttachment: boolean;
}

export interface Complaint {
  id: string;
  referenceNumber: string; // مثال: DZ-REC-2025-0193
  accessPin: string;       // رمز سري لمتابعة الشكوى
  complainantName: string;
  phone: string;
  email: string;
  rankTitle: string;
  wilayaId: number;
  wilayaName: string;
  communeName: string;
  institutionName: string;
  membershipReferenceNumber?: string;
  
  categoryId: string;
  categoryTitle: string;
  
  title: string;
  incidentDate?: string;
  description: string;
  concernedDepartment?: string;
  previousActions?: string;
  soughtSolution: string;
  additionalNotes?: string;
  
  isConfidential: boolean; // طلب التعامل السري
  
  status: ComplaintStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedScope?: string; // ولائي أو وطني أو لجنة
  
  submissionDate: string;
  updatedAt: string;
  closedAt?: string;
  closeReason?: string;
  
  attachments: ComplaintAttachment[];
  officialResponses: ComplaintOfficialResponse[]; // تظهر للمشتكي
  internalNotes: ComplaintInternalNote[];         // لا تظهر إطلاقاً للعامة أو المشتكي
  complainantUpdates: ComplaintComplainantUpdate[];
  statusHistory: StatusHistoryItem[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'membership' | 'complaint' | 'system_config' | 'user_account' | 'export' | 'union_official';
  entityId: string;
  details: string;
  ipAddress?: string;
  severity: 'info' | 'warning' | 'security';
}

export interface Wilaya {
  id: number;
  code: string;
  nameAr: string;
  nameFr: string;
  communes: string[];
}

export interface EducationalInstitution {
  id: string;
  name: string;
  wilayaId: number;
  commune: string;
  type: 'primary' | 'middle' | 'high' | 'administration';
  status: 'approved' | 'pending_review';
}

export interface UnionOfficial {
  id: string;
  fullName: string;
  roleType: 'national_bureau' | 'wilaya_president' | 'wilaya_coordinator';
  roleTitle: string; // e.g. "الأمين العام الوطني", "رئيس المكتب الولائي", "المنسق الولائي"
  wilayaId?: number; // 1 to 69 (null for national bureau)
  wilayaName?: string;
  zone: 'national' | 'center' | 'east' | 'west' | 'south' | 'high_plateaus';
  phone: string;
  email: string;
  officeAddress: string;
  receptionDays: string; // e.g. "الإثنين والأربعاء (09:00 - 15:00)"
  isAvailableForAppointment: boolean;
  notes?: string;
  isActive?: boolean;
}

export interface ProfessionalRank {
  id: string;
  code: string;
  title: string;
  sector: 'teaching' | 'administration' | 'inspection' | 'counseling' | 'laboratory' | 'economics' | 'supervision' | 'general_services';
  isActive: boolean;
}

export interface ComplaintCategory {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface UnionConfig {
  unionName: string;
  shortName: string;
  slogan: string;
  registrationNumber: string;
  phone: string;
  email: string;
  address: string;
  headquartersWilaya: string;
  requireMembershipForComplaint: boolean;
  allowPublicInstitutionAddition: boolean;
  dataProtectionOfficerContact: string;
}

export type DashboardWidgetId =
  | 'membership_stats'
  | 'complaint_status'
  | 'user_activity'
  | 'wilaya_distribution'
  | 'rank_breakdown'
  | 'urgent_complaints'
  | 'quick_actions';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  width: 'full' | 'half' | 'third';
}
