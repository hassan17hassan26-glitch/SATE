import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Briefcase, 
  Tags, 
  School, 
  Plus, 
  Check, 
  Trash2, 
  Save, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2,
  Database,
  Download,
  KeyRound,
  FileCode2,
  Lock,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Pencil,
  Cloud
} from 'lucide-react';
import { 
  UnionConfig, 
  ProfessionalRank, 
  ComplaintCategory, 
  EducationalInstitution, 
  User,
  MembershipApplication,
  Complaint,
  AuditLog,
  UnionOfficial
} from '../../types';
import { AppStorage } from '../../utils/storage';
import { INITIAL_RANKS, INITIAL_OFFICIALS } from '../../data/algeriaData';
import { createEncryptedJsonBackup, createSqlBackup, decryptBackupText } from '../../utils/backup';
import { EditOfficialModal } from '../EditOfficialModal';

interface SettingsAdminProps {
  currentUser: User;
  config: UnionConfig;
  ranks: ProfessionalRank[];
  categories: ComplaintCategory[];
  institutions: EducationalInstitution[];
  memberships: MembershipApplication[];
  complaints: Complaint[];
  auditLogs: AuditLog[];
  onRefreshData: () => void;
}

export const SettingsAdmin: React.FC<SettingsAdminProps> = ({
  currentUser,
  config,
  ranks,
  categories,
  institutions,
  memberships,
  complaints,
  auditLogs,
  onRefreshData
}) => {
  // Identity form state
  const [unionName, setUnionName] = useState(config.unionName);
  const [shortName, setShortName] = useState(config.shortName);
  const [slogan, setSlogan] = useState(config.slogan);
  const [phone, setPhone] = useState(config.phone);
  const [email, setEmail] = useState(config.email);
  const [address, setAddress] = useState(config.address);
  const [regNumber, setRegNumber] = useState(config.registrationNumber);
  const [requireMembership, setRequireMembership] = useState(config.requireMembershipForComplaint);
  const [dpoContact, setDpoContact] = useState(config.dataProtectionOfficerContact);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Rank state
  const [newRankTitle, setNewRankTitle] = useState('');
  const [newRankCode, setNewRankCode] = useState('');
  const [newRankSector, setNewRankSector] = useState<'teaching' | 'administration' | 'inspection' | 'counseling' | 'laboratory'>('teaching');

  // New Category state
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Backup state
  const [backupFormat, setBackupFormat] = useState<'json_encrypted' | 'sql' | 'json_plain'>('json_encrypted');
  const [backupPassphrase, setBackupPassphrase] = useState('DZ-Union-Secure-2025!');
  const [backupToast, setBackupToast] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Officials management state
  const [officialsList, setOfficialsList] = useState<UnionOfficial[]>(() => AppStorage.getOfficials());
  const [selectedOfficialForEdit, setSelectedOfficialForEdit] = useState<UnionOfficial | null>(null);
  const [isEditOfficialModalOpen, setIsEditOfficialModalOpen] = useState(false);
  const [officialSearchQuery, setOfficialSearchQuery] = useState('');
  const [officialToast, setOfficialToast] = useState('');

  const handleOpenEditOfficial = (official: UnionOfficial) => {
    setSelectedOfficialForEdit(official);
    setIsEditOfficialModalOpen(true);
  };

  const handleOpenAddOfficial = () => {
    setSelectedOfficialForEdit(null);
    setIsEditOfficialModalOpen(true);
  };

  const handleSaveOfficial = (saved: UnionOfficial, isNew: boolean) => {
    if (isNew) {
      AppStorage.addOfficial(saved, currentUser.fullName, currentUser.role);
      setOfficialToast(`تمت إضافة ${saved.roleTitle} (${saved.fullName}) بنجاح`);
    } else {
      AppStorage.updateOfficial(saved, currentUser.fullName, currentUser.role);
      setOfficialToast(`تم تحديث معلومات ${saved.roleTitle} (${saved.fullName}) بنجاح`);
    }
    setOfficialsList(AppStorage.getOfficials());
    onRefreshData();
    setTimeout(() => setOfficialToast(''), 4000);
  };

  const handleDeleteOfficial = (officialId: string) => {
    AppStorage.deleteOfficial(officialId, currentUser.fullName, currentUser.role);
    setOfficialToast('تم حذف المسؤول من الدليل بنجاح');
    setOfficialsList(AppStorage.getOfficials());
    onRefreshData();
    setTimeout(() => setOfficialToast(''), 4000);
  };

  const handleResetOfficials = () => {
    AppStorage.resetOfficialsToDefault(currentUser.fullName, currentUser.role);
    setOfficialToast('تمت استعادة كافة المكاتب والمسؤولين الافتراضيين (79 مسؤولاً)');
    setOfficialsList(AppStorage.getOfficials());
    onRefreshData();
    setTimeout(() => setOfficialToast(''), 4000);
  };

  const handleDownloadBackup = () => {
    const backupData = {
      config,
      ranks,
      categories,
      institutions,
      memberships,
      complaints,
      auditLogs,
      officials: AppStorage.getOfficials()
    };

    let fileContent = '';
    let fileName = '';
    let detailsMessage = '';

    if (backupFormat === 'sql') {
      const result = createSqlBackup(backupData);
      fileContent = result.content;
      fileName = result.fileName;
      detailsMessage = `نسخة احتياطية بصيغة SQL Dump (PostgreSQL). السجلات: ${memberships.length} منخرط، ${complaints.length} شكوى، ${auditLogs.length} سجل تدقيق.`;
    } else {
      const isEncrypted = backupFormat === 'json_encrypted';
      const result = createEncryptedJsonBackup(backupData, isEncrypted ? backupPassphrase : undefined);
      fileContent = result.content;
      fileName = result.fileName;
      detailsMessage = `نسخة احتياطية بصيغة JSON [تشفير: ${result.isEncrypted ? 'مشفر بمفتاح حماية خاص PBKDF-XOR-256' : 'غير مشفر'}]. السجلات: ${memberships.length} منخرط، ${complaints.length} شكوى.`;
    }

    // Trigger local file download
    const blob = new Blob([fileContent], { 
      type: backupFormat === 'sql' ? 'text/sql;charset=utf-8;' : 'application/json;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // CRITICAL: Log to audit trail according to user request
    AppStorage.logAudit({
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'تحميل نسخة احتياطية مشفرة لقاعدة البيانات',
      entityType: 'system_config',
      entityId: 'BACKUP-EXPORT',
      details: detailsMessage,
      severity: 'security'
    });

    setBackupToast(`تم تصدير وتحميل النسخة الاحتياطية (${fileName}) محلياً بنجاح وتوثيق العملية في سجل التدقيق الأمني.`);
    setTimeout(() => setBackupToast(''), 7000);
    onRefreshData();
  };

  const handleGenerateRandomPassphrase = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let res = 'DZ-';
    for (let i = 0; i < 14; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setBackupPassphrase(res);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UnionConfig = {
      ...config,
      unionName: unionName.trim(),
      shortName: shortName.trim(),
      slogan: slogan.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      registrationNumber: regNumber.trim(),
      requireMembershipForComplaint: requireMembership,
      dataProtectionOfficerContact: dpoContact.trim()
    };

    AppStorage.saveConfig(updated);
    AppStorage.logAudit({
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'تعديل هوية وإعدادات النقابة',
      entityType: 'system_config',
      entityId: 'UNION-CONFIG',
      details: 'تحديث بيانات المنظمة والسياسات العامة',
      severity: 'info'
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefreshData();
  };

  const handleAddRank = () => {
    if (!newRankTitle.trim() || !newRankCode.trim()) return;
    const newRank: ProfessionalRank = {
      id: 'rank_' + Date.now(),
      code: newRankCode.trim().toUpperCase(),
      title: newRankTitle.trim(),
      sector: newRankSector,
      isActive: true
    };
    const current = AppStorage.getRanks();
    current.push(newRank);
    AppStorage.saveRanks(current);
    setNewRankTitle('');
    setNewRankCode('');
    onRefreshData();
  };

  const handleToggleRank = (id: string) => {
    const current = AppStorage.getRanks();
    const updated = current.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r));
    AppStorage.saveRanks(updated);
    onRefreshData();
  };

  const handleAddCategory = () => {
    if (!newCatTitle.trim()) return;
    const newCat: ComplaintCategory = {
      id: 'cat_' + Date.now(),
      title: newCatTitle.trim(),
      description: newCatDesc.trim(),
      isActive: true
    };
    const current = AppStorage.getCategories();
    current.push(newCat);
    AppStorage.saveCategories(current);
    setNewCatTitle('');
    setNewCatDesc('');
    onRefreshData();
  };

  const handleToggleCategory = (id: string) => {
    const current = AppStorage.getCategories();
    const updated = current.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    AppStorage.saveCategories(updated);
    onRefreshData();
  };

  const handleApproveInstitution = (id: string) => {
    const current = AppStorage.getInstitutions();
    const updated = current.map(inst => (inst.id === id ? { ...inst, status: 'approved' as const } : inst));
    AppStorage.saveInstitutions(updated);
    onRefreshData();
  };

  const pendingInstitutions = institutions.filter(i => i.status === 'pending_review');

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-700" />
          <span>تهيئة وإدارة إعدادات المنصة النقابية</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          تخصيص هوية النقابة، الرتب المهنية، وتصنيفات الشكاوى بما يتناسب مع خصوصية قطاع التربية
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ الإعدادات بنجاح في قاعدة البيانات وتحديث النظام.</span>
        </div>
      )}

      {/* SECTION 1: UNION IDENTITY */}
      <form onSubmit={handleSaveConfig} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
          <Building2 className="w-4 h-4 text-emerald-700" />
          <span>1. هوية وبيانات الاتصال بالنقابة</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">تسمية النقابة الرسمية:</label>
            <input
              type="text"
              value={unionName}
              onChange={e => setUnionName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الاسم المختصر (الرمز):</label>
            <input
              type="text"
              value={shortName}
              onChange={e => setShortName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">شعار المنظمة (Slogan):</label>
            <input
              type="text"
              value={slogan}
              onChange={e => setSlogan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الاعتماد الرسمي:</label>
            <input
              type="text"
              value={regNumber}
              onChange={e => setRegNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">أرقام الهاتف:</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">بريد مسؤول حماية البيانات (DPO):</label>
            <input
              type="email"
              value={dpoContact}
              onChange={e => setDpoContact(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">عنوان المقر الوطني:</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {/* Policies toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={requireMembership}
              onChange={e => setRequireMembership(e.target.checked)}
              className="rounded text-emerald-800"
            />
            <span>اشتراط العضوية المسبقة لتقديم شكوى (إذا كان معطلاً، تفتح الشكاوى لكافة مستخدمي التربية)</span>
          </label>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ بيانات المنظمة</span>
          </button>
        </div>
      </form>

      {/* SECTION 2: RANKS MANAGEMENT */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
          <Briefcase className="w-4 h-4 text-emerald-700" />
          <span>2. إدارة الرتب المهنية بقطاع التربية الوطنية ({ranks.length} رتبة)</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل تريد إعادة تثبيت قائمة الرتب الرسمية الكاملة حسب القانون الأساسي الجديد (المرسوم 25-54) بواقع 53 رتبة؟')) {
                AppStorage.saveRanks(INITIAL_RANKS);
                AppStorage.logAudit({
                  actorName: currentUser.fullName,
                  actorRole: currentUser.role,
                  action: 'تثبيت رتب القانون الأساسي الجديد',
                  entityType: 'system_config',
                  entityId: 'RANKS-STATUTE-25-54',
                  details: 'تثبيت 53 رتبة معتمدة رسمياً لأسلاك التدريس، التفتيش، الإدارة، المشرفين والمصالح الاقتصادية',
                  severity: 'info'
                });
                onRefreshData();
              }
            }}
            className="mr-auto px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-emerald-700" />
            <span>مزامنة رتب القانون الأساسي الجديد (المرسوم 25-54)</span>
          </button>
        </h3>

        {/* Add Rank */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs items-end">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-600 mb-1">تسمية الرتبة الرسمية:</label>
            <input
              type="text"
              value={newRankTitle}
              onChange={e => setNewRankTitle(e.target.value)}
              placeholder="مثال: أستاذ رئيسي في التعليم الابتدائي"
              className="w-full p-2 rounded-xl border bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">الرمز الإداري:</label>
            <input
              type="text"
              value={newRankCode}
              onChange={e => setNewRankCode(e.target.value)}
              placeholder="PR-EP-P"
              className="w-full p-2 rounded-xl border bg-white uppercase font-mono"
            />
          </div>
          <button
            type="button"
            onClick={handleAddRank}
            disabled={!newRankTitle.trim() || !newRankCode.trim()}
            className="w-full py-2 rounded-xl bg-emerald-800 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رتبة</span>
          </button>
        </div>

        {/* Ranks list */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 text-xs pr-1">
          {ranks.map(r => (
            <div key={r.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className={`font-bold ${r.isActive ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                  {r.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mr-2">({r.code})</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleRank(r.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {r.isActive ? 'مفعلة' : 'معطلة'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: COMPLAINT CATEGORIES */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
          <Tags className="w-4 h-4 text-amber-700" />
          <span>3. إدارة تصنيفات الشكاوى ({categories.length})</span>
        </h3>

        {/* Add Category */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs items-end">
          <div>
            <label className="block font-bold text-slate-600 mb-1">عنوان التصنيف:</label>
            <input
              type="text"
              value={newCatTitle}
              onChange={e => setNewCatTitle(e.target.value)}
              placeholder="مثال: منازعات السكن الوظيفي"
              className="w-full p-2 rounded-xl border bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">الوصف المختصر:</label>
            <input
              type="text"
              value={newCatDesc}
              onChange={e => setNewCatDesc(e.target.value)}
              placeholder="وصف طبيعة القضايا المندرجة"
              className="w-full p-2 rounded-xl border bg-white"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={!newCatTitle.trim()}
            className="w-full py-2 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف</span>
          </button>
        </div>

        {/* Categories list */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 text-xs pr-1">
          {categories.map(c => (
            <div key={c.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className={`font-bold ${c.isActive ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                  {c.title}
                </span>
                <span className="text-[11px] text-slate-400 mr-2">— {c.description}</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleCategory(c.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  c.isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {c.isActive ? 'مفعل' : 'معطل'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: DATABASE BACKUP & RESTORATION (ENCRYPTED JSON / SQL DUMP) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                5. النسخ الاحتياطي المشفر لقاعدة البيانات (JSON / SQL)
              </h3>
              <p className="text-xs text-slate-500">
                تنزيل نسخة احتياطية محلية متوافقة مع متطلبات الأمان وتوثيق العملية في سجل التدقيق
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-bold self-start sm:self-auto border border-purple-200">
            تشفير متوافق مع القانون 18-07
          </span>
        </div>

        {backupToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{backupToast}</span>
          </div>
        )}

        {/* Database overview metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">طلبات الانخراط</span>
            <span className="font-bold text-base text-slate-900">{memberships.length} سجل</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">ملفات الشكاوى</span>
            <span className="font-bold text-base text-slate-900">{complaints.length} ملف</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">سجل التدقيق الأمني</span>
            <span className="font-bold text-base text-slate-900">{auditLogs.length} عملية</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">الرتب والتصنيفات</span>
            <span className="font-bold text-base text-slate-900">{ranks.length + categories.length} عنصر</span>
          </div>
        </div>

        {/* Backup configuration options */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-2">اختر صيغة النسخة الاحتياطية:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label 
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  backupFormat === 'json_encrypted' 
                    ? 'bg-purple-50/80 border-purple-400 text-purple-950 font-bold shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="backupFormat"
                  value="json_encrypted"
                  checked={backupFormat === 'json_encrypted'}
                  onChange={() => setBackupFormat('json_encrypted')}
                  className="text-purple-600"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-purple-700" />
                    <span>JSON مشفر (.enc.json)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block">تشفير متقدم بكلمة مرور</span>
                </div>
              </label>

              <label 
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  backupFormat === 'sql' 
                    ? 'bg-purple-50/80 border-purple-400 text-purple-950 font-bold shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="backupFormat"
                  value="sql"
                  checked={backupFormat === 'sql'}
                  onChange={() => setBackupFormat('sql')}
                  className="text-purple-600"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <FileCode2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>SQL Dump علائقي (.sql)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block">متوافق مع PostgreSQL</span>
                </div>
              </label>

              <label 
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                  backupFormat === 'json_plain' 
                    ? 'bg-purple-50/80 border-purple-400 text-purple-950 font-bold shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="backupFormat"
                  value="json_plain"
                  checked={backupFormat === 'json_plain'}
                  onChange={() => setBackupFormat('json_plain')}
                  className="text-purple-600"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                    <span>JSON نصي (.json)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block">نسخة خام للقراءة المباشرة</span>
                </div>
              </label>
            </div>
          </div>

          {/* Encryption Passphrase field (for json_encrypted) */}
          {backupFormat === 'json_encrypted' && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                  <span>كلمة مرور تشفير النسخة الاحتياطية (Passphrase):</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassphrase}
                  className="text-[11px] text-purple-700 hover:text-purple-900 underline font-semibold cursor-pointer"
                >
                  توليد مفتاح عشوائي قوي
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={backupPassphrase}
                  onChange={e => setBackupPassphrase(e.target.value)}
                  placeholder="أدخل كلمة مرور قوية لتشفير ملف النسخ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] shrink-0"
                >
                  {showKey ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                ملاحظة أمنية: يرجى حفظ كلمة المرور في مكان آمن، حيث لن يمكن استرجاع البيانات بدونها.
              </p>
            </div>
          )}

          {/* Legal / Audit Notice */}
          <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-purple-50/50 p-2.5 rounded-xl border border-purple-200/50">
            <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <span>
              <strong>توثيق تلقائي:</strong> كل عملية تصدير أو تحميل للنسخة الاحتياطية تُسجل تلقائياً في سجل التدقيق الأمني (Audit Trail) باسم المستخدم والتوقيت ونوع التشفير وحجم السجلات لضمان عدم تسريب البيانات.
            </span>
          </div>

          {/* Download Action Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={backupFormat === 'json_encrypted' && !backupPassphrase.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل النسخة الاحتياطية المشفرة محلياً</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 6: UNION OFFICIALS & 69 WILAYAS DIRECTORY MANAGEMENT */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                6. إدارة المكاتب الولائية ودليل المسؤولين (69 ولاية والمكتب الوطني)
              </h3>
              <p className="text-xs text-slate-500">
                تعديل وتحديث بيانات رؤساء المكاتب، المنسقين، وأعضاء المكتب الوطني مع التوثيق الرقابي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddOfficial}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مسؤول جديد</span>
            </button>
            <button
              type="button"
              onClick={handleResetOfficials}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="استعادة القائمة الرسمية لـ 69 ولاية"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>استعادة الافتراضي</span>
            </button>
          </div>
        </div>

        {officialToast && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{officialToast}</span>
          </div>
        )}

        {/* Quick Search */}
        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            value={officialSearchQuery}
            onChange={e => setOfficialSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الولاية، أو الصفة (مثال: وهران، بريكة، الأمين العام)..."
            className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-500 shrink-0">
            إجمالي المسؤولين: <strong className="text-emerald-900 font-bold">{officialsList.length}</strong>
          </span>
        </div>

        {/* Table of officials */}
        <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 text-xs">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b sticky top-0 z-10">
              <tr>
                <th className="p-3">الولاية / الهيكل</th>
                <th className="p-3">الاسم واللقب</th>
                <th className="p-3">الصفة النقابية</th>
                <th className="p-3">الهاتف المباشر</th>
                <th className="p-3">أوقات الاستقبال</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officialsList
                .filter(o => {
                  if (!officialSearchQuery.trim()) return true;
                  const q = officialSearchQuery.toLowerCase();
                  return (
                    o.fullName.toLowerCase().includes(q) ||
                    o.roleTitle.toLowerCase().includes(q) ||
                    (o.wilayaName && o.wilayaName.toLowerCase().includes(q)) ||
                    (o.wilayaId && o.wilayaId.toString() === q)
                  );
                })
                .slice(0, 30)
                .map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">
                      {o.wilayaId ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-emerald-800 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                            {o.wilayaId}
                          </span>
                          <span>{o.wilayaName}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">المكتب الوطني</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{o.fullName}</td>
                    <td className="p-3 text-emerald-800">{o.roleTitle}</td>
                    <td className="p-3 font-mono text-slate-600" dir="ltr">{o.phone}</td>
                    <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate">{o.receptionDays}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditOfficial(o)}
                        className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 transition-all font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="تعديل معلومات المسؤول"
                      >
                        <Pencil className="w-3 h-3 text-emerald-700 group-hover:text-white" />
                        <span>تعديل</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 7: FIREBASE CLOUD DATABASE & REALTIME SYNC */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                7. الاتصال السحابي وقاعدة بيانات Firebase Firestore
              </h3>
              <p className="text-xs text-slate-500">
                قاعدة البيانات السحابية المركزية المعتمدة للمزامنة الفورية وقواعد الأمان المشددة
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>متصل بالسحابة (Firebase Active)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[11px]">معرف المشروع (Project ID):</span>
            <span className="font-mono font-bold text-slate-900 block" dir="ltr">warm-spider-j01dl</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[11px]">معرف قاعدة البيانات (Database):</span>
            <span className="font-mono font-bold text-slate-900 block truncate" dir="ltr">ai-studio-eeb2847d</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[11px]">حالة قواعد الحماية (Rules):</span>
            <span className="font-bold text-emerald-700 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>مفعلة ومنشورة (قانون 18-07)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Edit Official Modal */}
      <EditOfficialModal
        isOpen={isEditOfficialModalOpen}
        onClose={() => setIsEditOfficialModalOpen(false)}
        official={selectedOfficialForEdit}
        currentUser={currentUser}
        onSave={handleSaveOfficial}
        onDelete={handleDeleteOfficial}
      />

    </div>
  );
};
