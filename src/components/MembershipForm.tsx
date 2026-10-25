/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  Building, 
  Lock, 
  FileCheck, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { 
  ProfessionalRank, 
  EducationalInstitution, 
  Wilaya, 
  MembershipApplication, 
  UnionConfig 
} from '../types';
import { 
  isValidAlgerianNIN, 
  isValidAlgerianNSS, 
  isValidArabicName, 
  isValidAlgerianPhone,
  maskSensitiveNIN, 
  maskSensitiveNSS, 
  generateReferenceNumber, 
  generateAccessPin 
} from '../utils/validation';
import { AppStorage } from '../utils/storage';

interface MembershipFormProps {
  ranks: ProfessionalRank[];
  institutions: EducationalInstitution[];
  wilayas: Wilaya[];
  config: UnionConfig;
  onSuccess: (application: MembershipApplication) => void;
  onOpenPrivacyModal: () => void;
}

export const MembershipForm: React.FC<MembershipFormProps> = ({
  ranks,
  institutions,
  wilayas,
  config,
  onSuccess,
  onOpenPrivacyModal
}) => {
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [rankId, setRankId] = useState('');
  const [nin, setNin] = useState('');
  const [nss, setNss] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(16); // Default Alger
  const [communeName, setCommuneName] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // Institution request modal
  const [showAddInstModal, setShowAddInstModal] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState<'primary' | 'middle' | 'high' | 'administration'>('high');

  // Preview & Submission states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<MembershipApplication | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeRanks = ranks.filter(r => r.isActive);
  const currentWilaya = wilayas.find(w => w.id === selectedWilayaId) || wilayas[0];
  const communesList = currentWilaya?.communes || [];

  // Filter institutions based on wilaya
  const filteredInstitutions = institutions.filter(
    inst => inst.wilayaId === selectedWilayaId && (!communeName || inst.commune === communeName || !inst.commune)
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isValidArabicName(firstName)) {
      newErrors.firstName = 'يرجى كتابة الاسم بالعربية وبصيغة صحيحة (أحرف عربية فقط)';
    }

    if (!isValidArabicName(lastName)) {
      newErrors.lastName = 'يرجى كتابة اللقب بالعربية وبصيغة صحيحة (أحرف عربية فقط)';
    }

    if (!birthDate) {
      newErrors.birthDate = 'يرجى تحديد تاريخ الميلاد';
    }

    if (!birthPlace.trim()) {
      newErrors.birthPlace = 'يرجى إدخال مكان الميلاد (البلدية والولاية)';
    }

    if (!rankId) {
      newErrors.rankId = 'يرجى اختيار الرتبة المهنية من القائمة';
    }

    if (!isValidAlgerianNIN(nin)) {
      newErrors.nin = 'رقم التعريف الوطني البيومتري غير صالح. يجب أن يتكون من 18 رقماً بالضبط';
    }

    if (!isValidAlgerianNSS(nss)) {
      newErrors.nss = 'رقم الضمان الاجتماعي غير صالح (يجب أن يتكون من 10 إلى 12 رقماً)';
    }

    if (!institutionId && filteredInstitutions.length > 0) {
      newErrors.institutionId = 'يرجى تحديد المؤسسة التربوية الأصلية';
    }

    if (!isValidAlgerianPhone(phone)) {
      newErrors.phone = 'يرجى إدخال رقم هاتف جزائري صالح (مثال: 0550123456 أو 0661234567)';
    }

    if (!privacyAgreed) {
      newErrors.privacy = 'يجب الموافقة على معالجة البيانات وفق القانون 18-07 للمتابعة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowPreviewModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    const selectedRank = ranks.find(r => r.id === rankId);
    const selectedInst = institutions.find(i => i.id === institutionId);

    const refNumber = generateReferenceNumber('DZ-MEMB');
    const accessPin = generateAccessPin();

    const newApp: MembershipApplication = {
      id: 'memb_' + Date.now(),
      referenceNumber: refNumber,
      accessPin,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate || undefined,
      birthPlace: birthPlace.trim() || undefined,
      rankId,
      rankTitle: selectedRank ? selectedRank.title : 'غير محدد',
      nin: nin.trim(),
      nss: nss.trim(),
      maskedNin: maskSensitiveNIN(nin),
      maskedNss: maskSensitiveNSS(nss),
      wilayaId: selectedWilayaId,
      wilayaName: currentWilaya.nameAr,
      communeName: communeName || currentWilaya.communes[0] || '',
      institutionId: institutionId || 'inst_custom',
      institutionName: selectedInst ? selectedInst.name : 'مؤسسة تحت المراجعة',
      phone: phone.trim(),
      email: email.trim(),
      status: 'received',
      submissionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          id: 'sh_' + Date.now(),
          status: 'received',
          timestamp: new Date().toISOString(),
          actorName: 'النظام الإلكتروني الموحد',
          note: 'تم إيداع استمارة الانخراط وتوليد الرقم المرجعي بنجاح'
        }
      ],
      privacyConsent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        lawNotice: 'القانون 18-07 لحماية المعطيات ذات الطابع الشخصي'
      }
    };

    AppStorage.addMembership(newApp);
    setSubmittedApplication(newApp);
    setShowPreviewModal(false);
    onSuccess(newApp);
  };

  const handleAddNewInstitution = () => {
    if (!newInstName.trim()) return;
    const newInst: EducationalInstitution = {
      id: 'inst_' + Date.now(),
      name: newInstName.trim(),
      wilayaId: selectedWilayaId,
      commune: communeName || currentWilaya.communes[0] || 'البلدية المركزية',
      type: newInstType,
      status: 'pending_review'
    };
    const currentInsts = AppStorage.getInstitutions();
    currentInsts.push(newInst);
    AppStorage.saveInstitutions(currentInsts);
    setInstitutionId(newInst.id);
    setShowAddInstModal(false);
    setNewInstName('');
  };

  // SUCCESS / RECEIPT VIEW
  if (submittedApplication) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        
        {/* Success Alert Banner */}
        <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-emerald-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10 text-emerald-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            تم استلام طلب الانخراط بنجاح!
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            تم تسجيل استمارتك لدى أمانة العضوية بـ {config.unionName}. احتفظ ببيانات الملف لمتابعة حالة الطلب وطباعة البطاقة.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2 text-slate-900">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">الرقم المرجعي للملف</span>
              <span className="font-mono text-lg font-black text-emerald-900 select-all block" dir="ltr">
                {submittedApplication.referenceNumber}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
              <span className="text-xs text-slate-500 block mb-1">الرمز السري للمتابعة (PIN)</span>
              <span className="font-mono text-lg font-black text-amber-700 select-all block" dir="ltr">
                {submittedApplication.accessPin}
              </span>
            </div>
          </div>
        </div>

        {/* Printable Official Receipt (وصل إيداع ملف الانخراط) */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6 print:border-none print:shadow-none">
          
          <div className="border-b-2 border-emerald-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-500">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <h3 className="text-lg font-bold text-emerald-950 mt-1">{config.unionName}</h3>
              <p className="text-xs text-slate-600">{config.registrationNumber}</p>
            </div>
            <div className="text-left text-xs text-slate-500">
              <div>وصل إيداع طلب انخراط نقابي</div>
              <div className="font-mono font-bold text-slate-900 mt-1" dir="ltr">{submittedApplication.referenceNumber}</div>
              <div>التاريخ: {new Date(submittedApplication.submissionDate).toLocaleDateString('ar-DZ')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">الاسم واللقب:</span>
                <span className="font-bold text-slate-900">{submittedApplication.firstName} {submittedApplication.lastName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">تاريخ ومكان الميلاد:</span>
                <span className="font-bold text-slate-800">
                  {submittedApplication.birthDate ? new Date(submittedApplication.birthDate).toLocaleDateString('ar-DZ') : 'غير محدد'}{' '}
                  {submittedApplication.birthPlace ? `(${submittedApplication.birthPlace})` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">الرتبة المهنية:</span>
                <span className="font-bold text-emerald-900">{submittedApplication.rankTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المؤسسة التربوية:</span>
                <span className="font-bold text-slate-900">{submittedApplication.institutionName}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">الولاية / المقاطعة:</span>
                <span className="font-bold text-slate-900">{submittedApplication.wilayaName} - {submittedApplication.communeName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">رقم التعريف الوطني:</span>
                <span className="font-mono text-slate-700" dir="ltr">{submittedApplication.maskedNin} (محمي)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الطلب:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  مستلم — قيد الفحص والاعتماد
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>ملاحظة قانونية هامة:</strong> يعتبر هذا الوصل إثباتاً لإيداع الطلب فقط ولا يعتبر قبولاً نهائياً للعضوية النقابية حتى دراسته من قبل أمانة العضوية بالمكتب الولائي المختص ومطابقة المعطيات المهنية.
          </div>

          <div className="pt-4 flex flex-wrap justify-between items-center gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة وصل الإيداع</span>
            </button>

            <button
              onClick={() => setSubmittedApplication(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              تقديم استمارة جديدة
            </button>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Form Title & Introduction */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
          <UserCheck className="w-4 h-4" />
          <span>استمارة الانخراط الرسمي</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          تسجيل منخرط جديد في النقابة
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          يرجى ملء كافة البيانات بدقة. بياناتكم الشخصية مشفرة ومحمية وفق أحكام القانون الجزائري رقم 18-07 المتعلق بحماية المعطيات ذات الطابع الشخصي.
        </p>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleOpenPreview} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
        
        {/* Section 1: الهوية والاسم */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            1. المعلومات الشخصية ومطابقة الهوية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم الشخصي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="مثال: عبد الرحمن، فاطمة الزهراء"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.firstName ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.firstName && <p className="text-[11px] text-red-500 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اللقب العائلي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="مثال: بن حمودة، بوزيد"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.lastName ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.lastName && <p className="text-[11px] text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* تاريخ ومكان الميلاد */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الميلاد <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                  errors.birthDate ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.birthDate && <p className="text-[11px] text-red-500 mt-1">{errors.birthDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مكان الميلاد (البلدية والولاية) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={e => setBirthPlace(e.target.value)}
                placeholder="مثال: سطيف، الجزائر الوسطى، وهران..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.birthPlace ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {errors.birthPlace && <p className="text-[11px] text-red-500 mt-1">{errors.birthPlace}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: المسار المهني والرتبة */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            2. الرتبة المهنية ومقر العمل التربوي
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الرتبة المهنية في قطاع التربية <span className="text-red-500">*</span>
            </label>
            <select
              value={rankId}
              onChange={e => setRankId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.rankId ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
              }`}
            >
              <option value="">-- اختر الرتبة المهنية الرسمية --</option>
              {activeRanks.map(rank => (
                <option key={rank.id} value={rank.id}>
                  {rank.title} ({rank.code})
                </option>
              ))}
            </select>
            {errors.rankId && <p className="text-[11px] text-red-500 mt-1">{errors.rankId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الولاية (58 ولاية) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWilayaId}
                onChange={e => {
                  const id = Number(e.target.value);
                  setSelectedWilayaId(id);
                  setCommuneName('');
                  setInstitutionId('');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {wilayas.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.code} - ولاية {w.nameAr} ({w.nameFr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البلدية <span className="text-red-500">*</span>
              </label>
              <select
                value={communeName}
                onChange={e => setCommuneName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- اختر البلدية --</option>
                {communesList.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                المؤسسة التربوية الأصلية <span className="text-red-500">*</span>
              </label>
              {config.allowPublicInstitutionAddition && (
                <button
                  type="button"
                  onClick={() => setShowAddInstModal(true)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  لم تجد مؤسستك؟ اقترح إضافتها
                </button>
              )}
            </div>
            <select
              value={institutionId}
              onChange={e => setInstitutionId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.institutionId ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
              }`}
            >
              <option value="">-- حدد المؤسسة التعليمية أو الإدارية --</option>
              {filteredInstitutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.commune})
                </option>
              ))}
            </select>
            {errors.institutionId && <p className="text-[11px] text-red-500 mt-1">{errors.institutionId}</p>}
          </div>
        </div>

        {/* Section 3: الأرقام الحساسة والامتثال 18-07 */}
        <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              3. أرقام التعريف الثبوتية (حماية وتشفير مشدد)
            </h3>
            <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">
              القانون 18-07
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            تُجمع هذه الأرقام حصراً للتحقق من الانتساب لقطاع الوظيفة العمومية، وتُخزن مشفرة ومقنعة (تظهر للعلن بصيغة نجوم).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم التعريف الوطني البيومتري (NIN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={18}
                value={nin}
                onChange={e => setNin(e.target.value.replace(/\D/g, ''))}
                placeholder="18 رقماً من بطاقة التعريف أو جواز السفر"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.nin ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
                dir="ltr"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>العدد: {nin.length} / 18</span>
                <span>{nin.length === 18 ? '✓ مكتمل' : 'مطلوب 18 رقم'}</span>
              </div>
              {errors.nin && <p className="text-[11px] text-red-500 mt-0.5">{errors.nin}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الضمان الاجتماعي (NSS) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={12}
                value={nss}
                onChange={e => setNss(e.target.value.replace(/\D/g, ''))}
                placeholder="10 إلى 12 رقماً من بطاقة الشفاء"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.nss ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
                dir="ltr"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>العدد: {nss.length} / 12</span>
                <span>بطاقة الشفاء CNAS</span>
              </div>
              {errors.nss && <p className="text-[11px] text-red-500 mt-0.5">{errors.nss}</p>}
            </div>
          </div>
        </div>

        {/* Section 4: معلومات الاتصال */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            4. بيانات التواصل والإشعارات
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهاتف المحمول <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="05 / 06 / 07 XX XX XX XX"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                dir="ltr"
              />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nom.prenom@education.dz"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Section 5: الموافقة القانونية */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="privacyConsent"
              checked={privacyAgreed}
              onChange={e => setPrivacyAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600"
            />
            <label htmlFor="privacyConsent" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
              أقر بصحة البيانات الواردة أعلاه، وأوافق صراحة على معالجة معطياتي ذات الطابع الشخصي من طرف {config.unionName} لغرض الانخراط النقابي والنشاط التمثيلي وفقًا لأحكام القانون رقم 18-07 المؤرخ في 10 يونيو 2018.
            </label>
          </div>
          {errors.privacy && <p className="text-[11px] text-red-600 font-bold pr-7">{errors.privacy}</p>}
          <div className="pr-7">
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
            >
              قراءة بنود الخصوصية وميثاق حماية البيانات
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>معاينة الملخص قبل الإرسال النهائي متاحة في الخطوة التالية</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>مراجعة الطلب وتأكيد الإرسال</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

      </form>

      {/* MODAL 1: PREVIEW SUMMARY BEFORE SUBMISSION */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 text-right">
            
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">مراجعة بيانات استمارة الانخراط</h3>
                <p className="text-xs text-slate-500">تأكد من صحة البيانات قبل إرسالها رسمياً للمكتب الولائي</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">الاسم واللقب:</span>
                <span className="font-bold text-slate-900">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">تاريخ ومكان الميلاد:</span>
                <span className="font-bold text-slate-800">
                  {birthDate ? new Date(birthDate).toLocaleDateString('ar-DZ') : 'غير محدد'}{' '}
                  {birthPlace ? `(${birthPlace})` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">الرتبة:</span>
                <span className="font-bold text-emerald-900">{ranks.find(r => r.id === rankId)?.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">الولاية والمؤسسة:</span>
                <span className="font-bold text-slate-900">{currentWilaya.nameAr} - {institutions.find(i => i.id === institutionId)?.name || 'مؤسسة مقترحة'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">رقم التعريف الوطني (NIN):</span>
                <span className="font-mono text-slate-700" dir="ltr">{maskSensitiveNIN(nin)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">رقم الضمان الاجتماعي (NSS):</span>
                <span className="font-mono text-slate-700" dir="ltr">{maskSensitiveNSS(nss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الهاتف:</span>
                <span className="font-mono font-bold text-slate-900" dir="ltr">{phone}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                تعديل البيانات
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-sm cursor-pointer"
              >
                تأكيد الإرسال النهائي
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST NEW INSTITUTION ADDITION */}
      {showAddInstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-right">
            
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">طلب إضافة مؤسسة تربوية غير مدرجة</h3>
            </div>

            <p className="text-xs text-slate-600">
              سيتم تسجيل المؤسسة ضمن استمارتك وإحالتها للمشرف لاعتمادها رسميًا في قاعدة البيانات الولائية.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تسمية المؤسسة</label>
                <input
                  type="text"
                  value={newInstName}
                  onChange={e => setNewInstName(e.target.value)}
                  placeholder="مثال: متوسطة الشهيد بن بولعيد الجديدة"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع المؤسسة</label>
                <select
                  value={newInstType}
                  onChange={e => setNewInstType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="primary">مدرسة ابتدائية</option>
                  <option value="middle">متوسطة (CEM)</option>
                  <option value="high">ثانوية</option>
                  <option value="administration">مديرية أو مصلحة إدارية</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddInstModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleAddNewInstitution}
                disabled={!newInstName.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold disabled:opacity-50"
              >
                إدراج في الاستمارة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
