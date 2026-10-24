/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Lock, 
  Send, 
  Paperclip, 
  Printer, 
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { Complaint, ComplaintStatus, UnionConfig } from '../types';
import { AppStorage } from '../utils/storage';

interface ComplaintTrackingProps {
  config: UnionConfig;
  onOpenPrivacyModal: () => void;
}

export const ComplaintTracking: React.FC<ComplaintTrackingProps> = ({ config, onOpenPrivacyModal }) => {
  const [refNumber, setRefNumber] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [searched, setSearched] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Additional info submit state
  const [additionalText, setAdditionalText] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearched(true);
    setUpdateSuccess(false);

    if (!refNumber.trim() || !accessPin.trim()) {
      setErrorMsg('يرجى إدخال كل من الرقم المرجعي للشكوى والرمز السري (PIN)');
      setComplaint(null);
      return;
    }

    const complaints = AppStorage.getComplaints();
    const found = complaints.find(
      c => c.referenceNumber.trim().toUpperCase() === refNumber.trim().toUpperCase() &&
           c.accessPin.trim() === accessPin.trim()
    );

    if (found) {
      setComplaint(found);
    } else {
      setComplaint(null);
      setErrorMsg('لم يتم العثور على أي شكوى تطابق هذه البيانات. تأكد من صحة الرقم المرجعي والرمز السري.');
    }
  };

  const handleSendAdditionalInfo = () => {
    if (!complaint || !additionalText.trim()) return;

    const newUpdate = {
      id: 'upd_' + Date.now(),
      date: new Date().toISOString(),
      text: additionalText.trim(),
      hasAttachment: false
    };

    const updatedComplaint: Complaint = {
      ...complaint,
      status: 'under_study', // updates to under_study when complainant sends info
      updatedAt: new Date().toISOString(),
      complainantUpdates: [...(complaint.complainantUpdates || []), newUpdate],
      statusHistory: [
        ...complaint.statusHistory,
        {
          id: 'csh_' + Date.now(),
          status: 'under_study',
          timestamp: new Date().toISOString(),
          actorName: `${complaint.complainantName} (صاحب الشكوى)`,
          note: 'إضافة توضيحات ومعلومات تكميلية من طرف المشتكي'
        }
      ]
    };

    AppStorage.updateComplaint(
      updatedComplaint,
      complaint.complainantName,
      'مقدم الشكوى',
      'إضافة توضيحات ومعلومات تكميلية للشكوى'
    );

    setComplaint(updatedComplaint);
    setAdditionalText('');
    setUpdateSuccess(true);
  };

  const getStatusDetails = (status: ComplaintStatus) => {
    switch (status) {
      case 'received':
        return { label: 'مستلمة — قيد الفرز الأولي', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'triaging':
        return { label: 'قيد الفرز والتحقق الإداري', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'under_study':
        return { label: 'قيد الدراسة والبحث القانوني', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'needs_info':
        return { label: 'بحاجة إلى معلومات إضافية منكم', color: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'referred':
        return { label: 'محالة إلى المسؤول / اللجنة المختصة', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'in_progress':
        return { label: 'قيد المتابعة مع الجهات المعنية', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'response_drafted':
        return { label: 'تم إعداد مسودة الرد — قيد الاعتماد', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'responded':
        return { label: 'تم الرد الرسمي على الشكوى ✓', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'closed':
        return { label: 'مغلقة', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'out_of_jurisdiction':
        return { label: 'غير داخلة ضمن اختصاص النقابة', color: 'bg-red-50 text-red-800 border-red-200' };
      case 'archived':
        return { label: 'محفوظة في الأرشيف', color: 'bg-slate-50 text-slate-600 border-slate-200' };
      default:
        return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
          <Search className="w-4 h-4" />
          <span>المتابعة الآمنة للشكاوى</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          متابعة شكوى سابقة
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          أدخل الرقم المرجعي للشكوى والرمز السري (PIN) للاطلاع على المستجدات والردود الرسمية المعتمدة من أمانة المنازعات.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الرقم المرجعي للشكوى
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={e => setRefNumber(e.target.value)}
              placeholder="مثال: DZ-REC-2025-0193"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
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

        {/* Demo Complaint Shortcut */}
        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
          <span>شكوى تجريبية تم الرد عليها: <strong className="font-mono text-amber-800" dir="ltr">DZ-REC-2025-0193</strong> / رمز: <strong className="font-mono text-amber-800" dir="ltr">492015</strong></span>
          <button
            type="button"
            onClick={() => {
              setRefNumber('DZ-REC-2025-0193');
              setAccessPin('492015');
            }}
            className="text-amber-700 underline font-semibold"
          >
            تعبئة تلقائية
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-600 text-white font-bold text-xs sm:text-sm hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>الاطلاع على الشكوى</span>
          </button>
        </div>
      </form>

      {/* COMPLAINT DETAILS VIEW */}
      {complaint && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 animate-in fade-in">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-slate-900" dir="ltr">
                  {complaint.referenceNumber}
                </span>
                {complaint.isConfidential && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    تعامل سري
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">{complaint.categoryTitle}</span>
            </div>

            <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${getStatusDetails(complaint.status).color}`}>
              {getStatusDetails(complaint.status).label}
            </div>
          </div>

          {/* Title & Description */}
          <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-sm text-slate-900">{complaint.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
            {complaint.soughtSolution && (
              <div className="pt-2 text-xs border-t border-slate-200/60 mt-2">
                <span className="font-bold text-slate-700">الحل الملتمس: </span>
                <span className="text-slate-600">{complaint.soughtSolution}</span>
              </div>
            )}
          </div>

          {/* OFFICIAL RESPONSES (الردود الرسمية المعتمدة) */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b pb-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>الردود الرسمية المعتمدة من النقابة:</span>
            </h4>

            {complaint.officialResponses && complaint.officialResponses.length > 0 ? (
              <div className="space-y-3">
                {complaint.officialResponses.map(resp => (
                  <div key={resp.id} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex justify-between items-center text-xs border-b border-emerald-200/60 pb-1.5">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{resp.authorName} ({resp.authorRoleTitle})</span>
                      </div>
                      <span className="text-emerald-700 text-[11px]">
                        {new Date(resp.date).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-emerald-900">{resp.title}</div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {resp.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                لا توجد ردود رسمية منشورة حتى الآن. ملفك حالياً ضمن مراحل المعالجة والمتابعة النقابية.
              </div>
            )}
          </div>

          {/* Section: Provide Additional Information (عند طلب معلومات تكميلية) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>إرسال توضيحات أو معلومات إضافية للملف:</span>
            </h4>

            {updateSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                ✓ تم إرسال توضيحاتك بنجاح وأُلحقت بملف الشكوى لدى المشرف المختص.
              </div>
            )}

            <div className="space-y-2">
              <textarea
                rows={2}
                value={additionalText}
                onChange={e => setAdditionalText(e.target.value)}
                placeholder="اكتب هنا أي مستجدات أو معلومات إضافية أو رد على استفسار النقابة..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSendAdditionalInfo}
                  disabled={!additionalText.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  إرسال التوضيحات التكميلية
                </button>
              </div>
            </div>

            {/* List of past complainant updates */}
            {complaint.complainantUpdates && complaint.complainantUpdates.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] text-slate-500 font-bold block">التوضيحات السابقة المرسلة منكم:</span>
                {complaint.complainantUpdates.map(u => (
                  <div key={u.id} className="text-xs bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-0.5">{new Date(u.date).toLocaleDateString('ar-DZ')}</span>
                    {u.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline of Status History */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>سجل الإجراءات ومسار الشكوى:</span>
            </h4>
            <div className="space-y-2 border-r-2 border-slate-200 pr-4 mr-2">
              {complaint.statusHistory.map((item, idx) => (
                <div key={idx} className="relative text-xs space-y-0.5">
                  <div className="font-bold text-slate-800">{getStatusDetails(item.status as any).label}</div>
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center no-print">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الشكوى</span>
            </button>
            <span className="text-[11px] text-slate-400">
              الملاحظات والتحقيقات الداخلية لا تظهر للعامة صوناً للسرية المهنية
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
