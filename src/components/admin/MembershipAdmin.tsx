/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  Printer, 
  Lock, 
  Clock, 
  MapPin, 
  Building,
  Check,
  X
} from 'lucide-react';
import { MembershipApplication, User, Wilaya, ProfessionalRank } from '../../types';
import { AppStorage } from '../../utils/storage';

interface MembershipAdminProps {
  currentUser: User;
  memberships: MembershipApplication[];
  wilayas: Wilaya[];
  ranks: ProfessionalRank[];
  onRefreshData: () => void;
  onExportCSV: () => void;
}

export const MembershipAdmin: React.FC<MembershipAdminProps> = ({
  currentUser,
  memberships,
  wilayas,
  ranks,
  onRefreshData,
  onExportCSV
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');

  // Selected item modal
  const [activeApp, setActiveApp] = useState<MembershipApplication | null>(null);

  // Sensitive reveal state
  const [revealedNINs, setRevealedNINs] = useState<Record<string, boolean>>({});
  const [showRevealConfirm, setShowRevealConfirm] = useState<string | null>(null);
  const [revealJustification, setRevealJustification] = useState('');

  // Action modals
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'correction' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Filter memberships (apply wilaya restriction if user is a Wilaya Officer)
  const filtered = memberships.filter(m => {
    // If user is a wilaya officer, only show their wilaya
    if (currentUser.role === 'wilaya_officer' && currentUser.wilayaId && m.wilayaId !== currentUser.wilayaId) {
      return false;
    }

    if (selectedWilaya !== 'all' && m.wilayaId.toString() !== selectedWilaya) {
      return false;
    }

    if (selectedStatus !== 'all' && m.status !== selectedStatus) {
      return false;
    }

    if (selectedRank !== 'all' && m.rankId !== selectedRank) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = `${m.firstName} ${m.lastName}`.toLowerCase().includes(q);
      const matchRef = m.referenceNumber.toLowerCase().includes(q);
      const matchInst = m.institutionName.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchInst) return false;
    }

    return true;
  });

  const handleRevealNIN = (appId: string) => {
    setShowRevealConfirm(appId);
    setRevealJustification('');
  };

  const confirmRevealNIN = () => {
    if (!showRevealConfirm) return;
    const target = memberships.find(m => m.id === showRevealConfirm);
    if (!target) return;

    // Log security audit for Law 18-07
    AppStorage.logAudit({
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'كشف رقم التعريف الوطني (NIN)',
      entityType: 'membership',
      entityId: target.referenceNumber,
      details: `تم كشف الرقم الوطني للمنخرط ${target.firstName} ${target.lastName}. المبرر: ${revealJustification || 'تدقيق العضوية الرسمي'}`,
      severity: 'security'
    });

    setRevealedNINs(prev => ({ ...prev, [showRevealConfirm]: true }));
    setShowRevealConfirm(null);
  };

  const handleApplyAction = () => {
    if (!activeApp || !actionType) return;

    let newStatus = activeApp.status;
    let logAction = '';
    let statusNote = '';

    if (actionType === 'approve') {
      newStatus = 'approved';
      logAction = 'قبول طلب الانخراط';
      statusNote = actionReason || 'تم تدقيق الملف واعتماد العضوية النقابية رسمياً';
    } else if (actionType === 'reject') {
      newStatus = 'rejected';
      logAction = 'رفض طلب الانخراط';
      statusNote = actionReason || 'رفض الطلب لعدم استيفاء الشروط';
    } else if (actionType === 'correction') {
      newStatus = 'needs_correction';
      logAction = 'طلب تصحيح واستكمال بيانات';
      statusNote = actionReason || 'إشعار الموظف بتصحيح وتدقيق المعطيات';
    }

    const updatedApp: MembershipApplication = {
      ...activeApp,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      reviewedBy: `${currentUser.fullName} (${currentUser.role})`,
      rejectionReason: actionType === 'reject' ? actionReason : undefined,
      correctionRequestNote: actionType === 'correction' ? actionReason : undefined,
      statusHistory: [
        ...activeApp.statusHistory,
        {
          id: 'sh_' + Date.now(),
          status: newStatus,
          timestamp: new Date().toISOString(),
          actorName: currentUser.fullName,
          note: statusNote
        }
      ]
    };

    AppStorage.updateMembership(
      updatedApp,
      currentUser.fullName,
      currentUser.role,
      `${logAction} للملف ${activeApp.referenceNumber}`
    );

    setActiveApp(updatedApp);
    setActionType(null);
    setActionReason('');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <span>إدارة ومراجعة طلبات الانخراط النقابي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تدقيق طلبات موظفي التربية، اعتماد العضوية، وإصدار البطاقات النقابية
          </p>
        </div>

        <button
          onClick={onExportCSV}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>تصدير القائمة (CSV مجهّل)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم، الرقم المرجعي أو المؤسسة..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          {/* Wilaya Filter */}
          <div>
            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(e.target.value)}
              disabled={currentUser.role === 'wilaya_officer'}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل الولايات (58 ولاية)</option>
              {wilayas.map(w => (
                <option key={w.id} value={w.id.toString()}>
                  {w.code} - ولاية {w.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل الحالات</option>
              <option value="received">مستلم (جديد)</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="needs_correction">بحاجة لتصحيح</option>
              <option value="approved">مقبول ومعتمد</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          {/* Rank Filter */}
          <div>
            <select
              value={selectedRank}
              onChange={e => setSelectedRank(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل الرتب التعليمية</option>
              {ranks.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
          <span>النتائج المعروضة: <strong>{filtered.length}</strong> طلب</span>
          <span>الحماية مطبقة: أرقام التعريف مشفرة افتراضياً</span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">الرقم المرجعي</th>
                <th className="py-3 px-4">اسم الموظف</th>
                <th className="py-3 px-4">الرتبة المهنية</th>
                <th className="py-3 px-4">المؤسسة والولاية</th>
                <th className="py-3 px-4">رقم NIN (محمي)</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">تاريخ الإيداع</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(app => {
                const isRevealed = revealedNINs[app.id];
                return (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900" dir="ltr">
                      {app.referenceNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {app.firstName} {app.lastName}
                    </td>
                    <td className="py-3 px-4 text-emerald-950 font-medium">
                      {app.rankTitle}
                    </td>
                    <td className="py-3 px-4">
                      <div>{app.institutionName}</div>
                      <div className="text-[10px] text-slate-400">{app.wilayaName} ({app.communeName})</div>
                    </td>
                    <td className="py-3 px-4 font-mono" dir="ltr">
                      <div className="flex items-center gap-1.5">
                        <span>{isRevealed ? app.nin : app.maskedNin}</span>
                        {!isRevealed ? (
                          <button
                            type="button"
                            onClick={() => handleRevealNIN(app.id)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-100"
                            title="كشف الرقم مع تسجيل أمني"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded">مكشوف</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        app.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        app.status === 'under_review' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        app.status === 'needs_correction' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        app.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {app.status === 'approved' ? 'مقبول' :
                         app.status === 'under_review' ? 'قيد المراجعة' :
                         app.status === 'needs_correction' ? 'بحاجة لتصحيح' :
                         app.status === 'rejected' ? 'مرفوض' : 'مستلم'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(app.submissionDate).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveApp(app)}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                      >
                        معاينة واتخاذ قرار
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            لا توجد طلبات انخراط تطابق معايير الفلترة المحددة.
          </div>
        )}
      </div>

      {/* MODAL 1: APPLICATION DETAILS & REVIEW */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 text-right max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    ملف انخراط: {activeApp.firstName} {activeApp.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono" dir="ltr">{activeApp.referenceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
              <div className="space-y-2">
                <div><span className="text-slate-500">الرتبة:</span> <strong>{activeApp.rankTitle}</strong></div>
                <div>
                  <span className="text-slate-500">تاريخ ومكان الميلاد:</span>{' '}
                  <strong>
                    {activeApp.birthDate ? new Date(activeApp.birthDate).toLocaleDateString('ar-DZ') : 'غير محدد'}{' '}
                    {activeApp.birthPlace ? `(${activeApp.birthPlace})` : ''}
                  </strong>
                </div>
                <div><span className="text-slate-500">المؤسسة:</span> <strong>{activeApp.institutionName}</strong></div>
                <div><span className="text-slate-500">المقاطعة:</span> <strong>ولاية {activeApp.wilayaName} ({activeApp.communeName})</strong></div>
              </div>
              <div className="space-y-2">
                <div><span className="text-slate-500">الهاتف:</span> <strong className="font-mono" dir="ltr">{activeApp.phone}</strong></div>
                <div><span className="text-slate-500">البريد الإلكتروني:</span> <strong className="font-mono">{activeApp.email || 'غير مسجل'}</strong></div>
                <div><span className="text-slate-500">NIN:</span> <strong className="font-mono" dir="ltr">{activeApp.maskedNin}</strong></div>
                <div><span className="text-slate-500">الضمان الاجتماعي:</span> <strong className="font-mono" dir="ltr">{activeApp.maskedNss}</strong></div>
              </div>
            </div>

            {/* History timeline */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800">سجل القرارات السابقة:</h4>
              <div className="space-y-1.5 border-r-2 border-slate-200 pr-3">
                {activeApp.statusHistory.map((h, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-bold text-slate-800">{h.status}</span>
                    <span className="text-slate-500 text-[11px]"> ({h.actorName} - {new Date(h.timestamp).toLocaleDateString('ar-DZ')})</span>
                    {h.note && <p className="text-[11px] text-slate-600 bg-white p-1 rounded border mt-0.5">{h.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Action form */}
            {actionType ? (
              <div className="p-4 rounded-2xl border bg-slate-50 space-y-3">
                <h4 className="font-bold text-xs text-slate-900">
                  {actionType === 'approve' && 'تأكيد قبول الملف واعتماد العضوية'}
                  {actionType === 'reject' && 'تأكيد رفض الطلب مع تسجيل السبب'}
                  {actionType === 'correction' && 'طلب تصحيح البيانات من الموظف'}
                </h4>
                <textarea
                  rows={2}
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="اكتب التوجيه أو التعليل الإداري المصاحب للقرار..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="px-3 py-1.5 rounded-xl border text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAction}
                    className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold"
                  >
                    تثبيت القرار
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة استمارة الانخراط</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActionType('correction'); setActionReason(''); }}
                    className="px-3 py-2 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold hover:bg-orange-100"
                  >
                    طلب تصحيح
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActionType('reject'); setActionReason(''); }}
                    className="px-3 py-2 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-bold hover:bg-red-100"
                  >
                    رفض الطلب
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActionType('approve'); setActionReason(''); }}
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900"
                  >
                    قبول واعتماد الانخراط
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM SENSITIVE REVEAL (LAW 18-07 COMPLIANCE) */}
      {showRevealConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-right">
            
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-red-700">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-sm">كشف بيانات حساسة (القانون 18-07)</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              وفقاً لقانون حماية البيانات الشخصية، سيتم تسجيل كشف هذا الرقم في سجل التدقيق الأمني متضمناً اسمك، صفتك وتوقيت العملية.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المبرر الإداري لكشف الرقم (إلزامي):
              </label>
              <input
                type="text"
                value={revealJustification}
                onChange={e => setRevealJustification(e.target.value)}
                placeholder="مثال: مطابقة مع شهادة العمل للتحقق من العضوية"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRevealConfirm(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmRevealNIN}
                disabled={!revealJustification.trim()}
                className="px-4 py-1.5 rounded-xl bg-red-700 text-white text-xs font-bold disabled:opacity-50"
              >
                تأكيد الكشف والتسجيل
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
