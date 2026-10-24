/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MembershipApplication,
  Complaint,
  AuditLog,
  ProfessionalRank,
  ComplaintCategory,
  EducationalInstitution,
  UnionConfig,
  User,
  UnionOfficial
} from '../types';
import {
  ALGERIA_WILAYAS,
  INITIAL_RANKS,
  INITIAL_COMPLAINT_CATEGORIES,
  INITIAL_INSTITUTIONS,
  DEFAULT_UNION_CONFIG,
  INITIAL_OFFICIALS
} from '../data/algeriaData';
import { maskSensitiveNIN, maskSensitiveNSS } from './validation';

const STORAGE_KEYS = {
  CONFIG: 'algeria_union_config_v1',
  RANKS: 'algeria_union_ranks_v1',
  CATEGORIES: 'algeria_union_categories_v1',
  INSTITUTIONS: 'algeria_union_institutions_v1',
  MEMBERSHIPS: 'algeria_union_memberships_v1',
  COMPLAINTS: 'algeria_union_complaints_v1',
  AUDIT_LOGS: 'algeria_union_audit_logs_v1',
  CURRENT_USER: 'algeria_union_current_user_v1',
  DASHBOARD_WIDGETS: 'algeria_union_dashboard_widgets_v1',
  OFFICIALS: 'algeria_union_officials_v1',
};

export const DEFAULT_DASHBOARD_WIDGETS: import('../types').DashboardWidgetConfig[] = [
  {
    id: 'membership_stats',
    title: 'إحصائيات الانخراطات الجديدة',
    description: 'مؤشرات الطلبات الجديدة، المقبولة، قيد المراجعة ومعدل القبول',
    enabled: true,
    order: 1,
    width: 'half'
  },
  {
    id: 'complaint_status',
    title: 'مؤشرات حالات الشكاوى',
    description: 'توزيع الشكاوى حسب الحالات، الشكاوى السرية، ونسب المعالجة',
    enabled: true,
    order: 2,
    width: 'half'
  },
  {
    id: 'urgent_complaints',
    title: 'الشكاوى المستعجلة والسرية',
    description: 'قائمة الشكاوى التي تتطلب دراسة عاجلة أو رداً نقابياً رسمياً',
    enabled: true,
    order: 3,
    width: 'full'
  },
  {
    id: 'user_activity',
    title: 'نشاط المستخدمين وسجل التدقيق الفوري',
    description: 'تتبع العمليات الأمنية، تسجيل الدخول، والتعديلات الإدارية',
    enabled: true,
    order: 4,
    width: 'half'
  },
  {
    id: 'wilaya_distribution',
    title: 'التوزيع الجغرافي حسب الولايات (58 ولاية)',
    description: 'نسبة المنخرطين والشكاوى حسب المقاطعات والولايات الجزائرية',
    enabled: true,
    order: 5,
    width: 'half'
  },
  {
    id: 'rank_breakdown',
    title: 'توزيع المنخرطين حسب الرتب والأسلاك',
    description: 'إحصائيات أسلاك التدريس، الإدارة، التوجيه والتفتيش',
    enabled: true,
    order: 6,
    width: 'half'
  },
  {
    id: 'quick_actions',
    title: 'إجراءات سريعة وتقارير فورية',
    description: 'روابط فورية للتصدير، المعاينة، وإضافة البيانات',
    enabled: true,
    order: 7,
    width: 'half'
  }
];

// Default seed users representing the role hierarchy
export const SYSTEM_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin_national',
    fullName: 'عبد القادر بن حمودة',
    email: 'admin@syndicat-dz.org',
    phone: '0550112233',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: 'user_membership',
    username: 'memb_officer',
    fullName: 'نادية بلقاسمي',
    email: 'adhesions@syndicat-dz.org',
    phone: '0555443322',
    role: 'membership_officer',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'user_complaints',
    username: 'rec_officer',
    fullName: 'مصطفى قادري',
    email: 'recours@syndicat-dz.org',
    phone: '0560778899',
    role: 'complaints_officer',
    isActive: true,
    createdAt: '2024-02-01'
  },
  {
    id: 'user_wilaya_alger',
    username: 'wilaya_alger',
    fullName: 'سليمان بوجمعة',
    email: 'alger@syndicat-dz.org',
    phone: '0551998877',
    role: 'wilaya_officer',
    wilayaId: 16,
    isActive: true,
    createdAt: '2024-02-10'
  },
  {
    id: 'user_wilaya_oran',
    username: 'wilaya_oran',
    fullName: 'فاطمة الزهراء منصوري',
    email: 'oran@syndicat-dz.org',
    phone: '0552334455',
    role: 'wilaya_officer',
    wilayaId: 31,
    isActive: true,
    createdAt: '2024-02-12'
  },
  {
    id: 'user_committee',
    username: 'comite_litiges',
    fullName: 'اللجنة الوطنية للنزاعات والقضايا الإدارية',
    email: 'litiges@syndicat-dz.org',
    phone: '023456789',
    role: 'committee',
    isActive: true,
    createdAt: '2024-02-20'
  }
];

export class AppStorage {
  static getConfig(): UnionConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      this.saveConfig(DEFAULT_UNION_CONFIG);
      return DEFAULT_UNION_CONFIG;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.shortName === 'SNAPET' || !parsed.shortName || parsed.shortName === 'النقابة') {
        parsed.unionName = DEFAULT_UNION_CONFIG.unionName;
        parsed.shortName = DEFAULT_UNION_CONFIG.shortName;
        parsed.slogan = DEFAULT_UNION_CONFIG.slogan;
        this.saveConfig(parsed);
      }
      return parsed;
    } catch {
      return DEFAULT_UNION_CONFIG;
    }
  }

  static saveConfig(config: UnionConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  static getRanks(): ProfessionalRank[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RANKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RANKS, JSON.stringify(INITIAL_RANKS));
      return INITIAL_RANKS;
    }
    try {
      const parsed: ProfessionalRank[] = JSON.parse(raw);
      // Auto-update if previous dataset was small or missing new statute ranks (50+ ranks)
      if (parsed.length < 40) {
        localStorage.setItem(STORAGE_KEYS.RANKS, JSON.stringify(INITIAL_RANKS));
        return INITIAL_RANKS;
      }
      return parsed;
    } catch {
      return INITIAL_RANKS;
    }
  }

  static saveRanks(ranks: ProfessionalRank[]): void {
    localStorage.setItem(STORAGE_KEYS.RANKS, JSON.stringify(ranks));
  }

  static getOfficials(): UnionOfficial[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFICIALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(INITIAL_OFFICIALS));
      return INITIAL_OFFICIALS;
    }
    try {
      const parsed: UnionOfficial[] = JSON.parse(raw);
      // Auto-update if dataset is incomplete (less than 70 officials including all 69 wilayas)
      if (parsed.length < 70) {
        localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(INITIAL_OFFICIALS));
        return INITIAL_OFFICIALS;
      }
      return parsed;
    } catch {
      return INITIAL_OFFICIALS;
    }
  }

  static saveOfficials(officials: UnionOfficial[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(officials));
  }

  static updateOfficial(updated: UnionOfficial, actorName?: string, actorRole?: string): void {
    const list = this.getOfficials();
    const idx = list.findIndex(o => o.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveOfficials(list);
      this.logAudit({
        actorName: actorName || 'مسؤول الإدارة',
        actorRole: actorRole || 'مدير النظام',
        action: `تعديل معلومات مسؤول نقابي [${updated.fullName}]`,
        entityType: 'union_official',
        entityId: updated.id,
        details: `تم تحديث بيانات ${updated.roleTitle} (${updated.wilayaName ? 'ولاية ' + updated.wilayaName : 'المكتب الوطني'}) - الهاتف: ${updated.phone}`,
        severity: 'info'
      });
    }
  }

  static addOfficial(official: UnionOfficial, actorName?: string, actorRole?: string): void {
    const list = this.getOfficials();
    list.unshift(official);
    this.saveOfficials(list);
    this.logAudit({
      actorName: actorName || 'مسؤول الإدارة',
      actorRole: actorRole || 'مدير النظام',
      action: `إضافة مسؤول نقابي جديد [${official.fullName}]`,
      entityType: 'union_official',
      entityId: official.id,
      details: `تم تسجيل ${official.roleTitle} جديد (${official.wilayaName ? 'ولاية ' + official.wilayaName : 'المكتب الوطني'})`,
      severity: 'info'
    });
  }

  static deleteOfficial(officialId: string, actorName?: string, actorRole?: string): void {
    const list = this.getOfficials();
    const target = list.find(o => o.id === officialId);
    const updatedList = list.filter(o => o.id !== officialId);
    this.saveOfficials(updatedList);
    this.logAudit({
      actorName: actorName || 'مسؤول الإدارة',
      actorRole: actorRole || 'مدير النظام',
      action: `حذف/إلغاء تنصيب مسؤول نقابي [${target ? target.fullName : officialId}]`,
      entityType: 'union_official',
      entityId: officialId,
      details: `تم حذف بيانات ${target ? target.roleTitle + ' (' + (target.wilayaName || 'مركزي') + ')' : ''} من الدليل الرسمي`,
      severity: 'warning'
    });
  }

  static resetOfficialsToDefault(actorName?: string, actorRole?: string): void {
    localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(INITIAL_OFFICIALS));
    this.logAudit({
      actorName: actorName || 'مسؤول الإدارة',
      actorRole: actorRole || 'مدير النظام',
      action: 'استعادة دليل المسؤولين الافتراضي',
      entityType: 'union_official',
      entityId: 'RESET-ALL',
      details: 'تمت استعادة القائمة الاسمية الرسمية لكافة ولايات الوطن الـ 69 والمكتب الوطني التنفيذي (79 مسؤولاً)',
      severity: 'warning'
    });
  }

  static getCategories(): ComplaintCategory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_COMPLAINT_CATEGORIES));
      return INITIAL_COMPLAINT_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_COMPLAINT_CATEGORIES;
    }
  }

  static saveCategories(cats: ComplaintCategory[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  }

  static getInstitutions(): EducationalInstitution[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(INITIAL_INSTITUTIONS));
      return INITIAL_INSTITUTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_INSTITUTIONS;
    }
  }

  static saveInstitutions(insts: EducationalInstitution[]): void {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(insts));
  }

  static getDashboardWidgets(): import('../types').DashboardWidgetConfig[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_WIDGETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_WIDGETS, JSON.stringify(DEFAULT_DASHBOARD_WIDGETS));
      return DEFAULT_DASHBOARD_WIDGETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_DASHBOARD_WIDGETS;
    }
  }

  static saveDashboardWidgets(widgets: import('../types').DashboardWidgetConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_WIDGETS, JSON.stringify(widgets));
  }

  static getMemberships(): MembershipApplication[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS);
    if (!raw) {
      const initial = this.getSeedMemberships();
      localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveMemberships(items: MembershipApplication[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(items));
  }

  static addMembership(item: MembershipApplication): void {
    const items = this.getMemberships();
    items.unshift(item);
    this.saveMemberships(items);
    this.logAudit({
      actorName: `${item.firstName} ${item.lastName}`,
      actorRole: 'مقدم طلب انخراط',
      action: 'إيداع طلب انخراط جديد',
      entityType: 'membership',
      entityId: item.referenceNumber,
      details: `تم إيداع طلب انخراط برتبة ${item.rankTitle} - ولاية ${item.wilayaName}`,
      severity: 'info'
    });
  }

  static updateMembership(item: MembershipApplication, actorName: string, actorRole: string, logNote?: string): void {
    const items = this.getMemberships();
    const idx = items.findIndex(m => m.id === item.id);
    if (idx !== -1) {
      items[idx] = item;
      this.saveMemberships(items);
      this.logAudit({
        actorName,
        actorRole,
        action: `تحديث طلب انخراط [${item.status}]`,
        entityType: 'membership',
        entityId: item.referenceNumber,
        details: logNote || `تحديث حالة طلب الانخراط إلى ${item.status}`,
        severity: item.status === 'rejected' ? 'warning' : 'info'
      });
    }
  }

  static getComplaints(): Complaint[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (!raw) {
      const initial = this.getSeedComplaints();
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveComplaints(items: Complaint[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(items));
  }

  static addComplaint(item: Complaint): void {
    const items = this.getComplaints();
    items.unshift(item);
    this.saveComplaints(items);
    this.logAudit({
      actorName: item.isConfidential ? 'مشتكٍ (سري)' : item.complainantName,
      actorRole: 'مقدم شكوى',
      action: 'إيداع شكوى جديدة',
      entityType: 'complaint',
      entityId: item.referenceNumber,
      details: `تم إيداع شكوى بعنوان: ${item.title.substring(0, 30)}... [سرية: ${item.isConfidential ? 'نعم' : 'لا'}]`,
      severity: item.isConfidential ? 'security' : 'info'
    });
  }

  static updateComplaint(item: Complaint, actorName: string, actorRole: string, logNote?: string): void {
    const items = this.getComplaints();
    const idx = items.findIndex(c => c.id === item.id);
    if (idx !== -1) {
      items[idx] = item;
      this.saveComplaints(items);
      this.logAudit({
        actorName,
        actorRole,
        action: `إجراء على الشكوى [${item.status}]`,
        entityType: 'complaint',
        entityId: item.referenceNumber,
        details: logNote || `تعديل حالة الشكوى أو إضافة رد رسمي/ملاحظة`,
        severity: item.isConfidential ? 'security' : 'info'
      });
    }
  }

  static getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      const initial: AuditLog[] = [
        {
          id: 'log_init',
          timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          actorName: 'النظام الآلي',
          actorRole: 'النواة الأمنية',
          action: 'تهيئة المنصة وقواعد البيانات',
          entityType: 'system_config',
          entityId: 'SYS-INIT',
          details: 'تفعيل معايير التشفير والامتثال للقانون 18-07 لحماية البيانات الشخصية',
          severity: 'info'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...entry,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newEntry);
    // Keep max 500 audit logs
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  static getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.logAudit({
        actorName: user.fullName,
        actorRole: user.role,
        action: 'تسجيل الدخول للمنصة',
        entityType: 'user_account',
        entityId: user.id,
        details: `جلسة نشطة للمستخدم ${user.username}`,
        severity: 'info'
      });
    } else {
      const current = this.getCurrentUser();
      if (current) {
        this.logAudit({
          actorName: current.fullName,
          actorRole: current.role,
          action: 'تسجيل الخروج',
          entityType: 'user_account',
          entityId: current.id,
          details: `إنهاء الجلسة للمستخدم ${current.username}`,
          severity: 'info'
        });
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  private static getSeedMemberships(): MembershipApplication[] {
    return [
      {
        id: 'memb_1',
        referenceNumber: 'DZ-MEMB-2025-0842',
        accessPin: '192834',
        firstName: 'أحمد',
        lastName: 'بوزيد',
        rankId: 'rank_7',
        rankTitle: 'أستاذ التعليم الثانوي',
        nin: '198216010045231984',
        nss: '123456789012',
        maskedNin: maskSensitiveNIN('198216010045231984'),
        maskedNss: maskSensitiveNSS('123456789012'),
        wilayaId: 16,
        wilayaName: 'الجزائر العاصمة',
        communeName: 'سيدي امحمد',
        institutionId: 'inst_1',
        institutionName: 'ثانوية العقيد لطفي',
        phone: '0551234567',
        email: 'ahmed.bouzid@example.dz',
        status: 'approved',
        submissionDate: '2025-01-14T09:30:00.000Z',
        updatedAt: '2025-01-16T11:20:00.000Z',
        reviewedBy: 'نادية بلقاسمي (مسؤول العضوية)',
        statusHistory: [
          { id: 'sh_1', status: 'received', timestamp: '2025-01-14T09:30:00.000Z', actorName: 'النظام الآلي', note: 'استلام الاستمارة بنجاح' },
          { id: 'sh_2', status: 'under_review', timestamp: '2025-01-15T10:00:00.000Z', actorName: 'نادية بلقاسمي', note: 'تدقيق شهادة العمل والمؤسسة' },
          { id: 'sh_3', status: 'approved', timestamp: '2025-01-16T11:20:00.000Z', actorName: 'نادية بلقاسمي', note: 'تم التحقق وقبول الانخراط وإصدار بطاقة العضوية' }
        ],
        privacyConsent: {
          accepted: true,
          acceptedAt: '2025-01-14T09:29:45.000Z',
          lawNotice: 'القانون 18-07 المؤرخ في 10 يونيو 2018 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي'
        }
      },
      {
        id: 'memb_2',
        referenceNumber: 'DZ-MEMB-2025-0915',
        accessPin: '384729',
        firstName: 'فاطمة',
        lastName: 'بن عيسى',
        rankId: 'rank_1',
        rankTitle: 'أستاذ المدرسة الابتدائية',
        nin: '198809010023849102',
        nss: '234567890123',
        maskedNin: maskSensitiveNIN('198809010023849102'),
        maskedNss: maskSensitiveNSS('234567890123'),
        wilayaId: 9,
        wilayaName: 'البليدة',
        communeName: 'البليدة',
        institutionId: 'inst_10',
        institutionName: 'مدرسة أول نوفمبر 1954',
        phone: '0662345678',
        email: 'fatima.benaissa@example.dz',
        status: 'under_review',
        submissionDate: '2025-02-01T14:15:00.000Z',
        updatedAt: '2025-02-02T08:45:00.000Z',
        reviewedBy: 'نادية بلقاسمي (مسؤول العضوية)',
        statusHistory: [
          { id: 'sh_4', status: 'received', timestamp: '2025-02-01T14:15:00.000Z', actorName: 'النظام الآلي' },
          { id: 'sh_5', status: 'under_review', timestamp: '2025-02-02T08:45:00.000Z', actorName: 'نادية بلقاسمي', note: 'المطابقة مع القوائم الاسمية للمقاطعة التفتيشية' }
        ],
        privacyConsent: {
          accepted: true,
          acceptedAt: '2025-02-01T14:14:20.000Z',
          lawNotice: 'القانون 18-07 لحماية المعطيات ذات الطابع الشخصي'
        }
      },
      {
        id: 'memb_3',
        referenceNumber: 'DZ-MEMB-2025-1044',
        accessPin: '582014',
        firstName: 'مراد',
        lastName: 'بلعربي',
        rankId: 'rank_19',
        rankTitle: 'مستشار التوجيه والإرشاد المدرسي',
        nin: '199031010012984567',
        nss: '345678901234',
        maskedNin: maskSensitiveNIN('199031010012984567'),
        maskedNss: maskSensitiveNSS('345678901234'),
        wilayaId: 31,
        wilayaName: 'وهران',
        communeName: 'وهران',
        institutionId: 'inst_5',
        institutionName: 'ثانوية مفدي زكرياء',
        phone: '0770981234',
        email: 'mourad.belarbi@example.dz',
        status: 'needs_correction',
        submissionDate: '2025-02-10T11:00:00.000Z',
        updatedAt: '2025-02-12T16:30:00.000Z',
        reviewedBy: 'نادية بلقاسمي (مسؤول العضوية)',
        correctionRequestNote: 'يرجى التأكد من البلدية المسجلة وتطابقها مع المؤسسة الأصلية للتعيين',
        statusHistory: [
          { id: 'sh_6', status: 'received', timestamp: '2025-02-10T11:00:00.000Z', actorName: 'النظام الآلي' },
          { id: 'sh_7', status: 'needs_correction', timestamp: '2025-02-12T16:30:00.000Z', actorName: 'نادية بلقاسمي', note: 'إشعار المعني بتصحيح مقر التعيين الفعلي' }
        ],
        privacyConsent: {
          accepted: true,
          acceptedAt: '2025-02-10T10:58:00.000Z',
          lawNotice: 'القانون 18-07 لحماية المعطيات ذات الطابع الشخصي'
        }
      }
    ];
  }

  private static getSeedComplaints(): Complaint[] {
    return [
      {
        id: 'comp_1',
        referenceNumber: 'DZ-REC-2025-0193',
        accessPin: '492015',
        complainantName: 'رابح كمال ساسي',
        phone: '0550445566',
        email: 'r.sassi@example.dz',
        rankTitle: 'أستاذ التعليم الثانوي',
        wilayaId: 16,
        wilayaName: 'الجزائر العاصمة',
        communeName: 'سيدي امحمد',
        institutionName: 'ثانوية العقيد لطفي',
        membershipReferenceNumber: 'DZ-MEMB-2025-0842',
        categoryId: 'cat_3',
        categoryTitle: 'الرواتب والمستحقات المالية',
        title: 'تأخر صرف المخلفات المالية للدرجة السادسة لسنة 2024',
        incidentDate: '2024-09-01',
        description: 'تم إصدار قرار الترقية في الدرجة السادسة منذ جوان 2024، إلا أن مصلحة الرواتب بمديرية التربية لولاية الجزائر وسط لم تدرج المخلفات المالية بأثر رجعي في صب الرواتب حتى تاريخه رغم تقديم استفسار كتابي.',
        concernedDepartment: 'مصلحة نفقات المستخدمين - مديرية التربية الجزائر وسط',
        previousActions: 'تم إيداع طلب استفسار بمكتب الرواتب بتاريخ 10 أكتوبر 2024 دون تلقي أي توضيح.',
        soughtSolution: 'التدخل لدى مصالح مديرية التربية لتسريع التأشير المالي على الجدول التكميلي وصرف المستحقات.',
        isConfidential: false,
        status: 'responded',
        assignedOfficerId: 'user_complaints',
        assignedOfficerName: 'مصطفى قادري (مسؤول الشكاوى)',
        assignedScope: 'وطني / ولائي',
        submissionDate: '2025-01-20T10:15:00.000Z',
        updatedAt: '2025-01-25T14:30:00.000Z',
        attachments: [
          {
            id: 'att_1',
            fileName: 'قرار_الترقية_في_الدرجة.pdf',
            fileType: 'application/pdf',
            fileSize: 420000,
            uploadDate: '2025-01-20T10:15:00.000Z',
            isSensitive: false
          }
        ],
        officialResponses: [
          {
            id: 'resp_1',
            authorName: 'المكتب الولائي للجزائر العاصمة - أمانة النزاعات',
            authorRoleTitle: 'مسؤول الشكاوى والمنازعات',
            date: '2025-01-25T14:30:00.000Z',
            title: 'إشعار بمتابعة الملف لدى مصلحة الميزانية',
            content: 'تحية نقابية أخوية، نعلمكم أن المكتب الولائي قد راسل رسميًا مديرية التربية، وأفادت مصلحة الرواتب بأن المخلفات أُدرجت ضمن الجدول المالي التكميلي لشهر فيفري 2025 وسيتم صبها في الحساب البريدي تلقائيًا.',
            approved: true
          }
        ],
        internalNotes: [
          {
            id: 'in_1',
            authorName: 'سليمان بوجمعة',
            authorRole: 'مسؤول ولائي - الجزائر',
            date: '2025-01-22T11:00:00.000Z',
            content: 'تم الاتصال برئيس مصلحة الرواتب وأكد أن التأخير كان عاماً وشمل 140 أستاذ بسبب التدقيق المالي من المراقب المالي.',
            restrictedToCommitteeOnly: false
          }
        ],
        complainantUpdates: [],
        statusHistory: [
          { id: 'csh_1', status: 'received', timestamp: '2025-01-20T10:15:00.000Z', actorName: 'النظام الآلي' },
          { id: 'csh_2', status: 'under_study', timestamp: '2025-01-21T09:00:00.000Z', actorName: 'مصطفى قادري', note: 'فحص القرار الإداري المرفق' },
          { id: 'csh_3', status: 'referred', timestamp: '2025-01-22T10:30:00.000Z', actorName: 'مصطفى قادري', note: 'إحالة الملف إلى المكتب الولائي بالجزائر وسط للمتابعة' },
          { id: 'csh_4', status: 'responded', timestamp: '2025-01-25T14:30:00.000Z', actorName: 'سليمان بوجمعة', note: 'اعتماد ونشر الرد الرسمي للمشتكي' }
        ]
      },
      {
        id: 'comp_2',
        referenceNumber: 'DZ-REC-2025-0248',
        accessPin: '739201',
        complainantName: 'حسين مراحي',
        phone: '0661122334',
        email: 'hocine.m@example.dz',
        rankTitle: 'أستاذ التعليم المتوسط',
        wilayaId: 31,
        wilayaName: 'وهران',
        communeName: 'السانية',
        institutionName: 'متوسطة الأمير عبد القادر',
        categoryId: 'cat_2',
        categoryTitle: 'الترقية والتصنيف المهني',
        title: 'طلب مراجعة تنقيط الترقية بالاختيار إلى رتبة أستاذ رئيسي',
        incidentDate: '2024-12-15',
        description: 'فوجئت بعدم احتساب نقطة التفتيش الأخيرة المؤرخة في ماي 2024 في جدول الترقية بالاختيار مما حرمني من المرتبة المستحقة في القائمة الاسمية المقترحة.',
        concernedDepartment: 'مصلحة المستخدمين والتفتيش - وهران',
        previousActions: 'طعن كتابي لدى اللجنة المتساوية الأعضاء المختصة بالسلك.',
        soughtSolution: 'إعادة تدقيق مجموع النقاط وتصحيح الترتيب وفق المحضر الأصلي.',
        isConfidential: false,
        status: 'under_study',
        assignedOfficerId: 'user_wilaya_oran',
        assignedOfficerName: 'فاطمة الزهراء منصوري (مسؤول ولائي وهران)',
        assignedScope: 'ولائي',
        submissionDate: '2025-02-05T16:00:00.000Z',
        updatedAt: '2025-02-07T10:00:00.000Z',
        attachments: [
          {
            id: 'att_2',
            fileName: 'تقرير_التفتيش_ماي_2024.pdf',
            fileType: 'application/pdf',
            fileSize: 310000,
            uploadDate: '2025-02-05T16:00:00.000Z',
            isSensitive: false
          }
        ],
        officialResponses: [],
        internalNotes: [
          {
            id: 'in_2',
            authorName: 'فاطمة الزهراء منصوري',
            authorRole: 'مسؤول ولائي - وهران',
            date: '2025-02-07T10:00:00.000Z',
            content: 'سيعقد اجتماع اللجنة المتساوية الأعضاء للنظر في الطعون يوم الخميس القادم، وسيمثل النقابة ممثلونا في اللجنة.',
            restrictedToCommitteeOnly: true
          }
        ],
        complainantUpdates: [],
        statusHistory: [
          { id: 'csh_5', status: 'received', timestamp: '2025-02-05T16:00:00.000Z', actorName: 'النظام الآلي' },
          { id: 'csh_6', status: 'under_study', timestamp: '2025-02-07T10:00:00.000Z', actorName: 'فاطمة الزهراء منصوري' }
        ]
      },
      {
        id: 'comp_3',
        referenceNumber: 'DZ-REC-2025-0312',
        accessPin: '849203',
        complainantName: 'مشتكية موظفة في التعليم',
        phone: '0770554433',
        email: 'confidentiel@syndicat-dz.org',
        rankTitle: 'مشرف رئيسي للتربية',
        wilayaId: 25,
        wilayaName: 'قسنطينة',
        communeName: 'الخروب',
        institutionName: 'متوسطة الشيخ عبد الحميد بن باديس',
        categoryId: 'cat_7',
        categoryTitle: 'المعاملة غير الملائمة أو التعسف الإداري المزعوم',
        title: 'طلب تدخل عاجل بشأن تضييق وتعسف إداري في التكليف بالمهام',
        incidentDate: '2025-01-10',
        description: 'أتعرض لتكليفات بمهام لا تندرج ضمن المهام القانونية المنصوص عليها في القرار الوزاري، مع توجيه استجوابات متكررة غير مبررة عند الاعتراض القانوني.',
        concernedDepartment: 'إدارة المؤسسة',
        soughtSolution: 'إيفاد لجنة نقابية أو مستشار للتسوية الودية ووقف الإجراءات الكيدية وحماية المسار المهني.',
        isConfidential: true, // سري
        status: 'referred',
        assignedOfficerId: 'user_complaints',
        assignedOfficerName: 'مصطفى قادري (مسؤول الشكاوى)',
        assignedScope: 'لجنة النزاعات والحماية القانونية',
        submissionDate: '2025-02-14T08:20:00.000Z',
        updatedAt: '2025-02-15T12:00:00.000Z',
        attachments: [],
        officialResponses: [
          {
            id: 'resp_sec',
            authorName: 'خلية الاستماع والمرافقة النقابية',
            authorRoleTitle: 'أمانة المنازعات',
            date: '2025-02-15T12:00:00.000Z',
            title: 'تأكيد التكفل السري بالملف',
            content: 'نؤكد لكم استلام الملف وتكليف عضو المكتب الولائي بمتابعة الأمر بسرية تامة لضمان حقوقكم دون تعريضكم لأي تضييق.',
            approved: true
          }
        ],
        internalNotes: [
          {
            id: 'in_sec_1',
            authorName: 'مصطفى قادري',
            authorRole: 'مسؤول الشكاوى',
            date: '2025-02-15T09:30:00.000Z',
            content: 'ملف سري: يمنع مشاركة هوية المشتكية في أي تقرير ولائي عام. التواصل محصور برقم الهاتف الشخصي حصراً.',
            restrictedToCommitteeOnly: true
          }
        ],
        complainantUpdates: [],
        statusHistory: [
          { id: 'csh_7', status: 'received', timestamp: '2025-02-14T08:20:00.000Z', actorName: 'النظام الآلي' },
          { id: 'csh_8', status: 'referred', timestamp: '2025-02-15T12:00:00.000Z', actorName: 'مصطفى قادري', note: 'إحالة سرية للجنة الحماية النقابية' }
        ]
      }
    ];
  }
}
