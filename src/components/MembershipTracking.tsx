/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Lock, 
  Edit3, 
  ArrowLeft,
  XCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { MembershipApplication, UnionConfig } from '../types';
import { AppStorage } from '../utils/storage';

interface MembershipTrackingProps {
  config: UnionConfig;
  onOpenPrivacyModal: () => void;
}

export const MembershipTracking: React.FC<MembershipTrackingProps> = ({ config, onOpenPrivacyModal }) => {
  const [refNumber, setRefNumber] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [searched, setSearched] = useState(false);
  const [application, setApplication] = useState<MembershipApplication | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state for 'needs_correction'
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearched(true);
    setEditSuccess(false);

    if (!refNumber.trim() || !accessPin.trim()) {
      setErrorMsg('يرجى إدخال كل من الرقم المرجعي للملف والرمز السري (PIN)');
      setApplication(null);
      return;
    }

    const memberships = AppStorage.getMemberships();
    const found = memberships.find(
      m => m.referenceNumber.trim().toUpperCase() === refNumber.trim().toUpperCase() &&
           m.accessPin.trim() === accessPin.trim()
    );

    if (found) {
      setApplication(found);
      setEditFirstName(found.firstName);
      setEditLastName(found.lastName);
      setEditInstitution(found.institutionName);
      setEditPhone(found.phone);
    } else {
      setApplication(null);
      setErrorMsg('لم يتم العثور على أي ملف يطابق هذه البيانات. تأكد من صحة الرقم المرجعي والرمز السري.');
    }
  };

  const handleSaveCorrection = () => {
    if (!application) return;

    const updatedApp: MembershipApplication = {
      ...application,
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      institutionName: editInstitution.trim(),
      phone: editPhone.trim(),
      status: 'under_review', // returns to under_review after correction
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...application.statusHistory,
        {
          id: 'sh_' + Date.now(),
          status: 'under_review',
          timestamp: new Date().toISOString(),
          actorName: `${editFirstName} ${editLastName} (صاحب الطلب)`,
          note: 'تم تصحيح البيانات وإعادة إرسال الملف للمراجعة'
        }
      ]
    };

    AppStorage.updateMembership(
      updatedApp,
      `${editFirstName} ${editLastName}`,
      'مقدم الطلب',
      'تصحيح البيانات من طرف الموظف وإعادة إرسالها'
    );

    setApplication(updatedApp);
    setIsEditing(false);
    setEditSuccess(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return {
          label: 'مستلم — في انتظار المراجعة',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <Clock className="w-4 h-4 text-blue-600" />
        };
      case 'under_review':
        return {
          label: 'قيد المراجعة والتدقيق',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Clock className="w-4 h-4 text-amber-600" />
        };
      case 'needs_correction':
        return {
          label: 'بحاجة إلى تصحيح واستكمال بيانات',
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          icon: <AlertCircle className="w-4 h-4 text-orange-600" />
        };
      case 'approved':
        return {
          label: 'مقبول — منخرط معتمد رسميًا',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          bg: 'bg-red-50 text-red-800 border-red-200',
          icon: <XCircle className="w-4 h-4 text-red-600" />
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <HelpCircle className="w-4 h-4 text-slate-500" />
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
          <Search className="w-4 h-4" />
          <span>الاستعلام الآمن عن الانخراط</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          متابعة طلب الانخراط النقابي
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          أدخل الرقم المرجعي للطلب والرمز السري (PIN) المستلم عند إيداع الاستمارة للاطلاع على قرار المكتب الولائي.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الرقم المرجعي للملف (Reference)
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={e => setRefNumber(e.target.value)}
              placeholder="مثال: DZ-MEMB-2025-0842"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الرمز السري (PIN)
            </label>
            <input
              type="password"
              maxLength={6}
              value={accessPin}
              onChange={e => setAccessPin(e.target.value.replace(/\D/g, ''))}
              placeholder="6 أرقام سرية"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              dir="ltr"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Hint */}
        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
          <span>ملف تجريبي معتمد: <strong className="font-mono text-emerald-800" dir="ltr">DZ-MEMB-2025-0842</strong> / رمز: <strong className="font-mono text-emerald-800" dir="ltr">192834</strong></span>
          <button
            type="button"
            onClick={() => {
              setRefNumber('DZ-MEMB-2025-0842');
              setAccessPin('192834');
            }}
            className="text-emerald-700 underline font-semibold"
          >
            تعبئة تلقائية
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-800 text-white font-bold text-xs sm:text-sm hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>الاستعلام عن الملف</span>
          </button>
        </div>
      </form>

      {/* Application Details View */}
      {application && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 animate-in fade-in">
          
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400 block">ملف انخراط رقم:</span>
              <span className="font-mono text-lg font-black text-slate-900" dir="ltr">
                {application.referenceNumber}
              </span>
            </div>

            <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusBadge(application.status).bg}`}>
              {getStatusBadge(application.status).icon}
              <span>{getStatusBadge(application.status).label}</span>
            </div>
          </div>

          {editSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ التعديلات بنجاح وأعيد توجيه الملف للمكتب الولائي لمراجعته.</span>
            </div>
          )}

          {/* Needs Correction Action Banner */}
          {application.status === 'needs_correction' && !isEditing && (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-900 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">ملاحظة أمانة العضوية بخصوص طلب التصحيح:</p>
                  <p className="bg-white/80 p-2.5 rounded-xl border border-orange-200/60 font-medium">
                    {application.correctionRequestNote || 'يرجى مراجعة وتدقيق معطيات المؤسسة أو الاسم.'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل وتصحيح البيانات الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* Inline Edit Form for Correction */}
          {isEditing ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-xs text-slate-900">تعديل البيانات المطلوبة:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">الاسم:</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={e => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">اللقب:</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={e => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">المؤسسة التربوية:</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={e => setEditInstitution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">الهاتف:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveCorrection}
                  className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold"
                >
                  حفظ وإعادة الإرسال
                </button>
              </div>
            </div>
          ) : (
            /* Information Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">الاسم واللقب:</span>
                  <span className="font-bold text-slate-900">{application.firstName} {application.lastName}</span>
                </div>
                {application.birthDate && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">تاريخ ومكان الميلاد:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(application.birthDate).toLocaleDateString('ar-DZ')} {application.birthPlace ? `(${application.birthPlace})` : ''}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">الرتبة في التعليم:</span>
                  <span className="font-bold text-emerald-900">{application.rankTitle}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">المؤسسة التربوية:</span>
                  <span className="font-bold text-slate-900">{application.institutionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الولاية والبلدية:</span>
                  <span className="font-bold text-slate-900">{application.wilayaName} ({application.communeName})</span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">رقم التعريف الوطني (NIN):</span>
                  <span className="font-mono text-slate-700" dir="ltr">{application.maskedNin}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">الضمان الاجتماعي (NSS):</span>
                  <span className="font-mono text-slate-700" dir="ltr">{application.maskedNss}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">تاريخ الإيداع:</span>
                  <span>{new Date(application.submissionDate).toLocaleDateString('ar-DZ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">آخر تحديث:</span>
                  <span>{new Date(application.updatedAt).toLocaleDateString('ar-DZ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* If Approved: Display Union Membership Card (بطاقة المنخرط) */}
          {application.status === 'approved' && (
            <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-xl space-y-4 print:border print:border-slate-300">
              <div className="flex justify-between items-center border-b border-emerald-700/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-200 block">{config.shortName} — قطاع التربية</span>
                    <span className="text-sm font-black text-white">بطاقة الانخراط النقابي الرسمية</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-emerald-300 block">رقم العضوية</span>
                  <span className="font-mono font-bold text-amber-300 text-xs" dir="ltr">AD-DZ-{application.wilayaId}-{application.referenceNumber.slice(-4)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-emerald-300 text-[11px] block">اسم المنخرط:</span>
                  <span className="font-bold text-white text-sm">{application.firstName} {application.lastName}</span>
                </div>
                <div>
                  <span className="text-emerald-300 text-[11px] block">الرتبة:</span>
                  <span className="font-bold text-white text-sm">{application.rankTitle}</span>
                </div>
                <div>
                  <span className="text-emerald-300 text-[11px] block">المؤسسة:</span>
                  <span className="font-medium text-emerald-100">{application.institutionName}</span>
                </div>
                <div>
                  <span className="text-emerald-300 text-[11px] block">المكتب الولائي:</span>
                  <span className="font-medium text-emerald-100">{application.wilayaName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-700/60 flex justify-between items-center text-[10px] text-emerald-300">
                <span>تأشيرة أمانة العضوية: معتمد ✓</span>
                <span>صالحة للموسم الدراسي الحالي</span>
              </div>
            </div>
          )}

          {/* Timeline History */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>سجل تطور معالجة الطلب:</span>
            </h4>
            <div className="space-y-2 border-r-2 border-slate-200 pr-4 mr-2">
              {application.statusHistory.map((item, idx) => (
                <div key={idx} className="relative text-xs space-y-0.5">
                  <div className="font-bold text-slate-800">{getStatusBadge(item.status).label}</div>
                  <div className="text-[11px] text-slate-500">
                    بواسطة: {item.actorName} • {new Date(item.timestamp).toLocaleDateString('ar-DZ')}
                  </div>
                  {item.note && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوصل / البطاقة</span>
            </button>
            <span className="text-[11px] text-slate-400">
              محمي وفق معايير التشفير للقانون 18-07
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
