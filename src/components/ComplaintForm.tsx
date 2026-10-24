/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  Lock, 
  EyeOff, 
  Calendar, 
  ArrowLeft,
  HelpCircle,
  Paperclip
} from 'lucide-react';
import { 
  Complaint, 
  ComplaintCategory, 
  ProfessionalRank, 
  Wilaya, 
  UnionConfig,
  ComplaintAttachment 
} from '../types';
import { 
  isValidArabicName, 
  isValidAlgerianPhone, 
  isAllowedAttachment, 
  generateReferenceNumber, 
  generateAccessPin 
} from '../utils/validation';
import { AppStorage } from '../utils/storage';

interface ComplaintFormProps {
  categories: ComplaintCategory[];
  ranks: ProfessionalRank[];
  wilayas: Wilaya[];
  config: UnionConfig;
  onSuccess: (complaint: Complaint) => void;
  onOpenPrivacyModal: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  categories,
  ranks,
  wilayas,
  config,
  onSuccess,
  onOpenPrivacyModal
}) => {
  // Complainant info
  const [complainantName, setComplainantName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rankTitle, setRankTitle] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(16);
  const [communeName, setCommuneName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [membershipRef, setMembershipRef] = useState('');

  // Complaint details
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [concernedDepartment, setConcernedDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [previousActions, setPreviousActions] = useState('');
  const [soughtSolution, setSoughtSolution] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState('');

  // Confirmation & submission state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCategories = categories.filter(c => c.isActive);
  const currentWilaya = wilayas.find(w => w.id === selectedWilayaId) || wilayas[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length >= 5) {
      setAttachmentError('الحد الأقصى للمرفقات هو 5 وثائق');
      return;
    }

    const file = files[0];
    const validation = isAllowedAttachment(file.name, file.type);
    if (!validation.valid) {
      setAttachmentError(validation.error || 'الملف غير صالح');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError('حجم الملف يتجاوز الحد المسموح به (5 ميغابايت)');
      return;
    }

    const newAttachment: ComplaintAttachment = {
      id: 'att_' + Date.now(),
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      isSensitive: isConfidential
    };

    setAttachments([...attachments, newAttachment]);
    // Reset file input
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!isValidArabicName(complainantName)) {
      errs.complainantName = 'يرجى كتابة الاسم واللقب بالعربية وبشكل صحيح';
    }

    if (!rankTitle) {
      errs.rankTitle = 'يرجى تحديد الرتبة المهنية';
    }

    if (!institutionName.trim()) {
      errs.institutionName = 'يرجى كتابة المؤسسة التربوية المعنية بالشكوى';
    }

    if (!isValidAlgerianPhone(phone)) {
      errs.phone = 'يرجى إدخال رقم هاتف جزائري صالح للتواصل معك';
    }

    if (!categoryId) {
      errs.categoryId = 'يرجى اختيار تصنيف الشكوى المناسب';
    }

    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'يرجى كتابة موضوع أو عنوان واضح وموجز للشكوى';
    }

    if (!description.trim() || description.trim().length < 20) {
      errs.description = 'يرجى تقديم تفاصيل وافية عن الوقائع ومضمون المشكلة (20 حرفاً على الأقل)';
    }

    if (!soughtSolution.trim()) {
      errs.soughtSolution = 'يرجى تحديد النتيجة أو الحل المرجو من تدخل النقابة';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowPreviewModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    const selectedCategory = categories.find(c => c.id === categoryId);
    const refNumber = generateReferenceNumber('DZ-REC');
    const accessPin = generateAccessPin();

    const newComplaint: Complaint = {
      id: 'comp_' + Date.now(),
      referenceNumber: refNumber,
      accessPin,
      complainantName: complainantName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      rankTitle,
      wilayaId: selectedWilayaId,
      wilayaName: currentWilaya.nameAr,
      communeName: communeName || currentWilaya.communes[0] || 'البلدية المركزية',
      institutionName: institutionName.trim(),
      membershipReferenceNumber: membershipRef.trim() || undefined,
      categoryId,
      categoryTitle: selectedCategory ? selectedCategory.title : 'أخرى',
      title: title.trim(),
      incidentDate: incidentDate || undefined,
      description: description.trim(),
      concernedDepartment: concernedDepartment.trim() || undefined,
      previousActions: previousActions.trim() || undefined,
      soughtSolution: soughtSolution.trim(),
      isConfidential,
      status: 'received',
      submissionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments,
      officialResponses: [],
      internalNotes: [],
      complainantUpdates: [],
      statusHistory: [
        {
          id: 'csh_' + Date.now(),
          status: 'received',
          timestamp: new Date().toISOString(),
          actorName: 'نظام إدارة الشكاوى الموحد',
          note: 'تم استلام الشكوى وإيداعها في جدول الفرز'
        }
      ]
    };

    AppStorage.addComplaint(newComplaint);
    setSubmittedComplaint(newComplaint);
    setShowPreviewModal(false);
    onSuccess(newComplaint);
  };

  // SUCCESS / RECEIPT VIEW
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        <div className="bg-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-800 text-amber-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10 text-amber-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            تم تسجيل الشكوى بنجاح!
          </h2>
          <p className="text-sm text-amber-100 max-w-xl mx-auto leading-relaxed">
            تم إحالة ملفك إلى أمانة النزاعات والمنازعات المهنية بـ {config.unionName}. احتفظ ببيانات الملف لمتابعة المعالجة والردود الرسمية.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2 text-slate-900">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">الرقم المرجعي للشكوى</span>
              <span className="font-mono text-lg font-black text-amber-900 select-all block" dir="ltr">
                {submittedComplaint.referenceNumber}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">الرمز السري لمتابعة الشكوى (PIN)</span>
              <span className="font-mono text-lg font-black text-emerald-800 select-all block" dir="ltr">
                {submittedComplaint.accessPin}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>ضمانات معالجة الشكوى وسريتها:</span>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              • تم تحديد الحالة الأولية للملف كـ: <strong className="text-amber-800">«مستلمة — قيد الفرز»</strong>.
            </p>
            <p>
              • {submittedComplaint.isConfidential ? 'تم تفعيل خيار السرية: لن يطلع على التفاصيل سوى المسؤول المخول مباشرة بالملف.' : 'الملف مسجل للمتابعة الإدارية العادية لدى المكتب الولائي.'}
            </p>
            <p>
              • لا يمثل تسجيل الشكوى إيداعاً رسمياً لدى المحاكم أو مفتشيات العمل، بل هو إجراء نقابي موازٍ للمرافقة والدفاع.
            </p>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              onClick={() => setSubmittedComplaint(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              تقديم شكوى أخرى
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black"
            >
              طباعة إشعار الاستلام
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
          <FileText className="w-4 h-4" />
          <span>فضاء الشكاوى والتظلمات</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          تقديم شكوى أو طعن إداري
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          اطرح انشغالك المهني بالتفصيل لتمكين النقابة من دراسته والتدخل لدى المصالح المعنية. بياناتك ومرفقاتك محمية بسرية تامة.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleOpenPreview} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
        
        {/* Section 1: بيانات صاحب الشكوى */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            1. معلومات مقدم الشكوى
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم واللقب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={complainantName}
                onChange={e => setComplainantName(e.target.value)}
                placeholder="الاسم واللقب الكامل بالعربية"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                  errors.complainantName ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.complainantName && <p className="text-[11px] text-red-500 mt-1">{errors.complainantName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الرتبة المهنية <span className="text-red-500">*</span>
              </label>
              <select
                value={rankTitle}
                onChange={e => setRankTitle(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white ${
                  errors.rankTitle ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              >
                <option value="">-- حدد رتبتك المهنية --</option>
                {ranks.filter(r => r.isActive).map(r => (
                  <option key={r.id} value={r.title}>{r.title}</option>
                ))}
              </select>
              {errors.rankTitle && <p className="text-[11px] text-red-500 mt-1">{errors.rankTitle}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">الولاية <span className="text-red-500">*</span></label>
              <select
                value={selectedWilayaId}
                onChange={e => {
                  setSelectedWilayaId(Number(e.target.value));
                  setCommuneName('');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                {wilayas.map(w => (
                  <option key={w.id} value={w.id}>{w.code} - ولاية {w.nameAr}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">البلدية</label>
              <select
                value={communeName}
                onChange={e => setCommuneName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="">-- البلدية --</option>
                {currentWilaya.communes.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">المؤسسة التربوية <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                placeholder="ثانوية / متوسطة / ابتدائية"
                className={`w-full px-3 py-2.5 rounded-xl border text-xs ${
                  errors.institutionName ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.institutionName && <p className="text-[11px] text-red-500 mt-0.5">{errors.institutionName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهاتف للتواصل والمتابعة <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0550123456"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono ${
                  errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                dir="ltr"
              />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم ملف الانخراط (اختياري إن كنت منخرطاً)
              </label>
              <input
                type="text"
                value={membershipRef}
                onChange={e => setMembershipRef(e.target.value)}
                placeholder="DZ-MEMB-XXXX-XXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Section 2: موضوع الشكوى وتصنيفها */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            2. موضوع وتصنيف الشكوى
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              التصنيف الرسمي للشكوى <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white ${
                errors.categoryId ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
              }`}
            >
              <option value="">-- اختر التصنيف المناسب --</option>
              {activeCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-[11px] text-red-500 mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان موجز للشكوى <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: تأخر صرف المخلفات المالية، طعن في نقطة التفتيش، تعسف في جدول التوقيت..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                errors.title ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ وقوع الواقعة أو القرار (إن كان معروفاً)
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الجهة أو المصلحة المعنية بالشكوى
              </label>
              <input
                type="text"
                value={concernedDepartment}
                onChange={e => setConcernedDepartment(e.target.value)}
                placeholder="مثال: إدارة المؤسسة، مصلحة الرواتب، مصلحة التمدرس..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: تفاصيل الوقائع والحل الملتمس */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            3. تفاصيل الوقائع والحل الملتمس
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الوصف التفصيلي للوقائع <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اشرح بدقة حيثيات المشكلة، القرارات الصادرة، والتواريخ ذات الصلة. يرجى تجنب إدراج بيانات شخصية غير ضرورية تخص أطرافاً أخرى."
              className={`w-full p-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.description ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الإجراءات أو المراسلات السابقة التي اتخذتها (إن وجدت)
            </label>
            <input
              type="text"
              value={previousActions}
              onChange={e => setPreviousActions(e.target.value)}
              placeholder="مثال: تقديم تظلم كتابي للمدير، طلب استفسار لدى مديرية التربية..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              النتيجة أو الحل الذي تلتمسه من النقابة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={soughtSolution}
              onChange={e => setSoughtSolution(e.target.value)}
              placeholder="مثال: تدخل النقابة لدى مصلحة الموظفين، تقديم طعن في اللجنة المتساوية الأعضاء..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${
                errors.soughtSolution ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            {errors.soughtSolution && <p className="text-[11px] text-red-500 mt-1">{errors.soughtSolution}</p>}
          </div>
        </div>

        {/* Section 4: المرفقات والمستندات الداعمة */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-amber-600" />
              4. الوثائق والمستندات الداعمة
            </h3>
            <span className="text-[11px] text-slate-500">حتى 5 ملفات (PDF, JPG, PNG, DOCX)</span>
          </div>

          <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 transition-colors text-center bg-slate-50/60">
            <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <label className="cursor-pointer font-bold text-xs text-amber-800 hover:text-amber-950 underline">
              انقر لرفع وثيقة داعمة (قرار إداري، جدول توقيت، مراسلة...)
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-[10px] text-slate-500 mt-1">
              الحد الأقصى لكل ملف: 5 ميغابايت. تُفحص الملفات تلقائياً لمنع أي برمجيات ضارة.
            </p>
          </div>

          {attachmentError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {attachmentError}
            </p>
          )}

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{att.fileName}</span>
                    <span className="text-[10px] text-slate-400">({(att.fileSize / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: طلب التعامل السري مع الشكوى */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isConfidential 
            ? 'bg-amber-50/90 border-amber-300 shadow-xs' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confidentialToggle"
              checked={isConfidential}
              onChange={e => setIsConfidential(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <div className="space-y-1">
              <label htmlFor="confidentialToggle" className="font-bold text-xs sm:text-sm text-slate-900 cursor-pointer flex items-center gap-2 select-none">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>طلب التعامل السري مع الشكوى (Traitement Confidentiel)</span>
              </label>
              <p className="text-xs text-slate-600 leading-relaxed">
                عند تفعيل هذا الخيار، يتم تقييد الوصول للشكوى حصراً بالمسؤول المباشر أو لجنة المنازعات؛ وتُحجب هويتك وبيانات الشكوى عن القوائم والتقارير العامة لحمايتك من أي تضييق.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>سيتم إنشاء رقم مرجعي عشوائي فريد لمتابعة الردود</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>مراجعة الشكوى وتأكيد الإرسال</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

      </form>

      {/* REVIEW SUMMARY MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 text-right">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">مراجعة وتأكيد إيداع الشكوى</h3>
                <p className="text-xs text-slate-500">تحقق من الوقائع المذكورة قبل الإرسال النهائي</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">صاحب الشكوى:</span>
                <span className="font-bold text-slate-900">{complainantName} ({rankTitle})</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">المؤسسة والولاية:</span>
                <span className="font-bold text-slate-900">{institutionName} - {currentWilaya.nameAr}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">التصنيف:</span>
                <span className="font-bold text-amber-800">{categories.find(c => c.id === categoryId)?.title}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">عنوان الشكوى:</span>
                <span className="font-bold text-slate-900">{title}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-slate-500">التعامل السري:</span>
                <span className={`font-bold ${isConfidential ? 'text-amber-800' : 'text-slate-700'}`}>
                  {isConfidential ? 'نعم — ملف سري مقيد' : 'لا — معالجة عادية'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">عدد المرفقات:</span>
                <span className="font-bold text-slate-900">{attachments.length} ملفات</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50 leading-relaxed">
              تنبيه: استلام الشكوى لا يعني قبولها الموضوعي الفوري أو إثبات الوقائع المذكورة فيها، بل ستخضع للفرس والمطابقة القانونية.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                تعديل الشكوى
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm cursor-pointer"
              >
                تأكيد الإرسال النهائي
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
