/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Lock, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Send, 
  Plus, 
  Eye, 
  X,
  Building,
  Paperclip,
  Share2
} from 'lucide-react';
import { 
  Complaint, 
  ComplaintStatus, 
  User, 
  ComplaintCategory, 
  Wilaya 
} from '../../types';
import { AppStorage } from '../../utils/storage';

interface ComplaintsAdminProps {
  currentUser: User;
  complaints: Complaint[];
  categories: ComplaintCategory[];
  wilayas: Wilaya[];
  onRefreshData: () => void;
  onExportCSV: () => void;
}

export const ComplaintsAdmin: React.FC<ComplaintsAdminProps> = ({
  currentUser,
  complaints,
  categories,
  wilayas,
  onRefreshData,
  onExportCSV
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [confidentialOnly, setConfidentialOnly] = useState(false);

  // Active complaint modal
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'responses' | 'internal_notes' | 'history'>('details');

  // New Official Response state
  const [newResponseTitle, setNewResponseTitle] = useState('');
  const [newResponseContent, setNewResponseContent] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);

  // New Internal Note state
  const [newInternalNote, setNewInternalNote] = useState('');
  const [isCommitteeOnly, setIsCommitteeOnly] = useState(false);

  // State Transition Modal
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('under_study');
  const [statusComment, setStatusComment] = useState('');
  const [assigneeName, setAssigneeName] = useState('');

  // Filter complaints according to role & filters
  const filtered = complaints.filter(c => {
    // Wilaya Officer restriction
    if (currentUser.role === 'wilaya_officer' && currentUser.wilayaId && c.wilayaId !== currentUser.wilayaId) {
      return false;
    }

    if (confidentialOnly && !c.isConfidential) return false;
    if (selectedWilaya !== 'all' && c.wilayaId.toString() !== selectedWilaya) return false;
    if (selectedCategory !== 'all' && c.categoryId !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchRef = c.referenceNumber.toLowerCase().includes(q);
      const matchName = c.complainantName.toLowerCase().includes(q);
      if (!matchTitle && !matchRef && !matchName) return false;
    }

    return true;
  });

  const handleOpenComplaint = (comp: Complaint) => {
    setActiveComplaint(comp);
    setActiveTab('details');
    setNewStatus(comp.status);
    setStatusComment('');
    setResponseSuccess(false);

    // If confidential, log access audit
    if (comp.isConfidential) {
      AppStorage.logAudit({
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'الاطلاع على شكوى سرية',
        entityType: 'complaint',
        entityId: comp.referenceNumber,
        details: `اطلاع المسؤول على الشكوى السرية المعنونة: ${comp.title.slice(0, 30)}...`,
        severity: 'security'
      });
    }
  };

  const handlePublishOfficialResponse = () => {
    if (!activeComplaint || !newResponseTitle.trim() || !newResponseContent.trim()) return;

    const newResp = {
      id: 'resp_' + Date.now(),
      authorName: currentUser.fullName,
      authorRoleTitle: currentUser.role === 'super_admin' ? 'الأمانة العامة للنقابة' : 'مسؤول الشكاوى والمنازعات',
      date: new Date().toISOString(),
      title: newResponseTitle.trim(),
      content: newResponseContent.trim(),
      approved: true
    };

    const updated: Complaint = {
      ...activeComplaint,
      status: 'responded', // moves status to responded
      updatedAt: new Date().toISOString(),
      officialResponses: [...(activeComplaint.officialResponses || []), newResp],
      statusHistory: [
        ...activeComplaint.statusHistory,
        {
          id: 'csh_' + Date.now(),
          status: 'responded',
          timestamp: new Date().toISOString(),
          actorName: currentUser.fullName,
          note: `نشر الرد الرسمي: "${newResponseTitle.trim()}"`
        }
      ]
    };

    AppStorage.updateComplaint(
      updated,
      currentUser.fullName,
      currentUser.role,
      `نشر رد رسمي للمشتكي على الملف ${activeComplaint.referenceNumber}`
    );

    setActiveComplaint(updated);
    setNewResponseTitle('');
    setNewResponseContent('');
    setResponseSuccess(true);
    onRefreshData();
  };

  const handleAddInternalNote = () => {
    if (!activeComplaint || !newInternalNote.trim()) return;

    const newNote = {
      id: 'in_' + Date.now(),
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      date: new Date().toISOString(),
      content: newInternalNote.trim(),
      restrictedToCommitteeOnly: isCommitteeOnly
    };

    const updated: Complaint = {
      ...activeComplaint,
      updatedAt: new Date().toISOString(),
      internalNotes: [...(activeComplaint.internalNotes || []), newNote]
    };

    AppStorage.updateComplaint(
      updated,
      currentUser.fullName,
      currentUser.role,
      `إضافة ملاحظة داخلية سرية للملف ${activeComplaint.referenceNumber}`
    );

    setActiveComplaint(updated);
    setNewInternalNote('');
    onRefreshData();
  };

  const handleUpdateStatus = () => {
    if (!activeComplaint) return;

    const updated: Complaint = {
      ...activeComplaint,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      assignedOfficerName: assigneeName.trim() || activeComplaint.assignedOfficerName,
      statusHistory: [
        ...activeComplaint.statusHistory,
        {
          id: 'csh_' + Date.now(),
          status: newStatus,
          timestamp: new Date().toISOString(),
          actorName: currentUser.fullName,
          note: statusComment.trim() || `تغيير الحالة إلى ${newStatus}`
        }
      ]
    };

    AppStorage.updateComplaint(
      updated,
      currentUser.fullName,
      currentUser.role,
      `تعديل حالة الشكوى ${activeComplaint.referenceNumber} إلى ${newStatus}`
    );

    setActiveComplaint(updated);
    setStatusComment('');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>إدارة وتدبير شكاوى موظفي التربية والتعليم</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            الفرز، التحقيق الإداري، الإحالة للجان المختصة، ونشر الردود الرسمية المعتمدة
          </p>
        </div>

        <button
          onClick={onExportCSV}
          className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span>تصدير إحصائيات الشكاوى (CSV)</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="البحث بالموضوع، الرقم المرجعي أو المشتكي..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(e.target.value)}
              disabled={currentUser.role === 'wilaya_officer'}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل الولايات (58 ولاية)</option>
              {wilayas.map(w => (
                <option key={w.id} value={w.id.toString()}>{w.code} - ولاية {w.nameAr}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل التصنيفات (10 تصنيفات)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل حالات الشكوى (12 حالة)</option>
              <option value="received">مستلمة (جديدة)</option>
              <option value="triaging">قيد الفرز</option>
              <option value="under_study">قيد الدراسة</option>
              <option value="needs_info">بحاجة لمعلومات</option>
              <option value="referred">محالة لمسؤول / لجنة</option>
              <option value="in_progress">قيد المتابعة</option>
              <option value="response_drafted">تم إعداد رد</option>
              <option value="responded">تم الرد رسمياً</option>
              <option value="closed">مغلقة</option>
              <option value="out_of_jurisdiction">خارج الاختصاص</option>
            </select>
          </div>

        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={confidentialOnly}
              onChange={e => setConfidentialOnly(e.target.checked)}
              className="rounded text-amber-600"
            />
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              عرض الشكاوى ذات «التعامل السري» فقط
            </span>
          </label>

          <span className="text-slate-400 text-[11px]">
            إجمالي الشكاوى المتطابقة: <strong>{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">الرقم المرجعي</th>
                <th className="py-3 px-4">موضوع الشكوى</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">المشتكي / المؤسسة</th>
                <th className="py-3 px-4">الولاية</th>
                <th className="py-3 px-4">السرية</th>
                <th className="py-3 px-4">الحالة الحالية</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(comp => (
                <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900" dir="ltr">
                    {comp.referenceNumber}
                  </td>
                  <td className="py-3 px-4 max-w-[220px]">
                    <div className="font-bold text-slate-900 truncate">{comp.title}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(comp.submissionDate).toLocaleDateString('ar-DZ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {comp.categoryTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">
                      {comp.isConfidential ? 'مشتكٍ (محجوب الهوية)' : comp.complainantName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{comp.institutionName}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {comp.wilayaName}
                  </td>
                  <td className="py-3 px-4">
                    {comp.isConfidential ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 w-max">
                        <Lock className="w-3 h-3" /> سري
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">عادي</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {comp.status === 'responded' ? 'تم الرد ✓' :
                       comp.status === 'under_study' ? 'قيد الدراسة' :
                       comp.status === 'referred' ? 'محالة للجنة' :
                       comp.status === 'needs_info' ? 'تنتظر معلومات' : comp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenComplaint(comp)}
                      className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold transition-colors cursor-pointer"
                    >
                      معالجة الشكوى
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            لا توجد شكاوى تطابق معايير البحث والفلترة المحددة.
          </div>
        )}
      </div>

      {/* COMPLAINT DETAIL & PROCESSING MODAL */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 text-right max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-slate-900" dir="ltr">
                    {activeComplaint.referenceNumber}
                  </span>
                  {activeComplaint.isConfidential && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      معاملة سرية مشددة
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{activeComplaint.title}</h3>
              </div>
              <button
                onClick={() => setActiveComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs inside modal */}
            <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                تفاصيل الشكوى والمرفقات
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'responses' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>الردود الرسمية المعتمدة</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
                  {activeComplaint.officialResponses?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('internal_notes')}
                className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'internal_notes' ? 'border-purple-600 text-purple-800' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>الملاحظات الداخلية السرية</span>
                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px]">
                  {activeComplaint.internalNotes?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'history' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                مسار الحالات وتغيير الوضعية
              </button>
            </div>

            {/* Tab 1: Details */}
            {activeTab === 'details' && (
              <div className="space-y-4 overflow-y-auto text-xs pr-1">
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>المشتكي: <strong className="text-slate-900">{activeComplaint.complainantName} ({activeComplaint.rankTitle})</strong></div>
                    <div>المؤسسة: <strong className="text-slate-900">{activeComplaint.institutionName}</strong></div>
                    <div>الولاية: <strong className="text-slate-900">{activeComplaint.wilayaName} ({activeComplaint.communeName})</strong></div>
                    <div>الهاتف: <strong className="font-mono text-slate-900" dir="ltr">{activeComplaint.phone}</strong></div>
                    <div>المصلحة المعنية: <strong className="text-slate-900">{activeComplaint.concernedDepartment || 'غير محدد'}</strong></div>
                    <div>تاريخ الواقعة: <strong>{activeComplaint.incidentDate || 'غير مسجل'}</strong></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">شرح الوقائع:</span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-line leading-relaxed">
                    {activeComplaint.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">الحل أو النتيجة الملتمسة:</span>
                  <p className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-950 font-medium leading-relaxed">
                    {activeComplaint.soughtSolution}
                  </p>
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block">المرفقات والوثائق ({activeComplaint.attachments?.length || 0}):</span>
                  {activeComplaint.attachments && activeComplaint.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeComplaint.attachments.map(att => (
                        <div key={att.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate">{att.fileName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{(att.fileSize / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">لا توجد وثائق مرفقة مع هذه الشكوى.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Official Responses (الردود الرسمية المعتمدة الظاهرة للمشتكي) */}
            {activeTab === 'responses' && (
              <div className="space-y-4 overflow-y-auto text-xs pr-1">
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 leading-relaxed">
                  <strong>الردود الرسمية المعتمدة:</strong> هذه الردود تظهر مباشرة للمشتكي في صفحة المتابعة بعد النشر والاعتماد.
                </div>

                {responseSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم نشر الرد الرسمي بنجاح وأصبح متاحاً لصاحب الشكوى!</span>
                  </div>
                )}

                {/* List of responses */}
                {activeComplaint.officialResponses && activeComplaint.officialResponses.length > 0 ? (
                  <div className="space-y-3">
                    {activeComplaint.officialResponses.map(resp => (
                      <div key={resp.id} className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1.5">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="font-bold text-emerald-950">{resp.title}</span>
                          <span className="text-slate-400 text-[10px]">{new Date(resp.date).toLocaleDateString('ar-DZ')}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{resp.content}</p>
                        <div className="text-[10px] text-emerald-700 pt-1">
                          حرره: {resp.authorName} ({resp.authorRoleTitle})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-2">لا توجد ردود رسمية حتى الآن.</p>
                )}

                {/* Add new response form */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-700" />
                    <span>صياغة رد نقابي رسمي جديد لصاحب الشكوى:</span>
                  </h4>
                  <input
                    type="text"
                    value={newResponseTitle}
                    onChange={e => setNewResponseTitle(e.target.value)}
                    placeholder="عنوان الرد (مثال: إشعار بمتابعة الملف لدى مديرية التربية...)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <textarea
                    rows={3}
                    value={newResponseContent}
                    onChange={e => setNewResponseContent(e.target.value)}
                    placeholder="نص الرد الرسمي والتوجيهات النقابية..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handlePublishOfficialResponse}
                      disabled={!newResponseTitle.trim() || !newResponseContent.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>اعتماد ونشر الرد للمشتكي</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Internal Notes (الملاحظات والتحقيقات السرية الخاصة بالمسؤولين) */}
            {activeTab === 'internal_notes' && (
              <div className="space-y-4 overflow-y-auto text-xs pr-1">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 leading-relaxed">
                  <strong>الملاحظات والتحقيقات الداخلية:</strong> هذه الملاحظات خاصة بأعضاء المكتب واللجنة فقط، ولا تظهر إطلاقاً لصاحب الشكوى أو في الإشعارات العامة.
                </div>

                {activeComplaint.internalNotes && activeComplaint.internalNotes.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeComplaint.internalNotes.map(note => (
                      <div key={note.id} className="p-3 rounded-xl bg-white border border-purple-200 shadow-2xs space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-purple-900">{note.authorName} ({note.authorRole})</span>
                          <span className="text-slate-400">{new Date(note.date).toLocaleDateString('ar-DZ')}</span>
                        </div>
                        <p className="text-slate-700">{note.content}</p>
                        {note.restrictedToCommitteeOnly && (
                          <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold inline-block">
                            مقيد باللجنة المختصة فقط
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-2">لا توجد ملاحظات داخلية مسجلة بعد.</p>
                )}

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-xs text-slate-800">إضافة ملاحظة داخلية / تحقيق:</h4>
                  <textarea
                    rows={2}
                    value={newInternalNote}
                    onChange={e => setNewInternalNote(e.target.value)}
                    placeholder="اكتب التوجيه الداخلي، ملخص الاتصال بالإدارة، أو توصية اللجنة..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCommitteeOnly}
                        onChange={e => setIsCommitteeOnly(e.target.checked)}
                        className="rounded"
                      />
                      <span>حصر الملاحظة باللجنة المختصة فقط</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddInternalNote}
                      disabled={!newInternalNote.trim()}
                      className="px-4 py-1.5 rounded-xl bg-purple-800 text-white font-bold text-xs hover:bg-purple-900 disabled:opacity-50"
                    >
                      تسجيل الملاحظة
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: History & State Transition (دورة الحياة الـ 12 مرحلة) */}
            {activeTab === 'history' && (
              <div className="space-y-4 overflow-y-auto text-xs pr-1">
                {/* Status Changer form */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>تغيير حالة الشكوى (دورة المعالجة الرسمية):</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">الحالة المستهدفة:</label>
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="received">2. مستلمة</option>
                        <option value="triaging">3. قيد الفرز</option>
                        <option value="under_study">4. قيد الدراسة</option>
                        <option value="needs_info">5. بحاجة إلى معلومات إضافية</option>
                        <option value="referred">6. محالة إلى المسؤول المختص</option>
                        <option value="in_progress">7. قيد المتابعة</option>
                        <option value="response_drafted">8. تم إعداد رد</option>
                        <option value="responded">9. تم الرد على مقدم الشكوى</option>
                        <option value="closed">10. مغلقة</option>
                        <option value="out_of_jurisdiction">11. غير داخلة ضمن اختصاص النقابة</option>
                        <option value="archived">12. محفوظة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">تعيين المسؤول / اللجنة:</label>
                      <input
                        type="text"
                        value={assigneeName}
                        onChange={e => setAssigneeName(e.target.value)}
                        placeholder="مثال: مسؤول ولاية وهران، لجنة النزاعات..."
                        className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">بيان الإجراء / سبب التغيير:</label>
                    <input
                      type="text"
                      value={statusComment}
                      onChange={e => setStatusComment(e.target.value)}
                      placeholder="اكتب توضيحاً للإجراء المتخذ..."
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleUpdateStatus}
                      className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold"
                    >
                      تحديث الحالة وتسجيل التدقيق
                    </button>
                  </div>
                </div>

                {/* History list */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800">سجل تطور الحالات:</h4>
                  <div className="space-y-1.5 border-r-2 border-slate-200 pr-3">
                    {activeComplaint.statusHistory.map((h, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-bold text-slate-800">{h.status}</span>
                        <span className="text-slate-500 text-[11px]"> ({h.actorName} - {new Date(h.timestamp).toLocaleDateString('ar-DZ')})</span>
                        {h.note && <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border mt-0.5">{h.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
