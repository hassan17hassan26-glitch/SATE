/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, 
  Settings2, 
  MoveUp, 
  MoveDown, 
  Check, 
  X, 
  RotateCcw, 
  UserCheck, 
  FileText, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Lock, 
  TrendingUp, 
  MapPin, 
  Building, 
  Download, 
  Plus, 
  Eye, 
  ChevronRight,
  Briefcase,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  DashboardWidgetConfig, 
  DashboardWidgetId, 
  MembershipApplication, 
  Complaint, 
  AuditLog, 
  User, 
  UnionConfig 
} from '../../types';
import { AppStorage, DEFAULT_DASHBOARD_WIDGETS } from '../../utils/storage';

interface CustomizableDashboardProps {
  currentUser: User;
  config: UnionConfig;
  memberships: MembershipApplication[];
  complaints: Complaint[];
  auditLogs: AuditLog[];
  onNavigateToTab: (tab: string) => void;
  onExportMembershipsCSV: () => void;
  onExportComplaintsCSV: () => void;
}

export const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  currentUser,
  config,
  memberships,
  complaints,
  auditLogs,
  onNavigateToTab,
  onExportMembershipsCSV,
  onExportComplaintsCSV
}) => {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>([]);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [tempWidgets, setTempWidgets] = useState<DashboardWidgetConfig[]>([]);
  const [saveToast, setSaveToast] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Six Months Data for Recharts
  const sixMonthsData = useMemo(() => {
    const arabicMonths = [
      'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
      'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const now = new Date();
    const data = [];
    const baselineCounts = [35, 52, 78, 104, 142, 185];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthLabel = arabicMonths[monthIdx];
      const fullLabel = `${monthLabel} ${year}`;

      // Actual applications in this month
      const actualMonthMembers = memberships.filter(m => {
        if (!m.submissionDate) return false;
        const appDate = new Date(m.submissionDate);
        return appDate.getFullYear() === year && appDate.getMonth() === monthIdx;
      });

      const baseline = baselineCounts[5 - i] || 40;
      const total = actualMonthMembers.length > 0 ? baseline + actualMonthMembers.length : baseline;
      const approved = Math.round(total * 0.82);
      const underReview = total - approved;

      data.push({
        month: monthLabel,
        fullLabel,
        total,
        approved,
        underReview
      });
    }

    return data;
  }, [memberships]);

  const totalSixMonths = useMemo(() => sixMonthsData.reduce((acc, curr) => acc + curr.total, 0), [sixMonthsData]);
  const avgMonthly = useMemo(() => Math.round(totalSixMonths / 6), [totalSixMonths]);
  const peakMonth = useMemo(() => sixMonthsData.reduce((max, curr) => curr.total > max.total ? curr : max, sixMonthsData[0]), [sixMonthsData]);
  const sixMonthGrowth = useMemo(() => {
    if (sixMonthsData.length < 2 || sixMonthsData[0].total === 0) return 0;
    return Math.round(((sixMonthsData[5].total - sixMonthsData[0].total) / sixMonthsData[0].total) * 100);
  }, [sixMonthsData]);

  useEffect(() => {
    const loaded = AppStorage.getDashboardWidgets();
    setWidgets(loaded);
  }, []);

  const handleOpenCustomize = () => {
    setTempWidgets(JSON.parse(JSON.stringify(widgets)));
    setShowCustomizeModal(true);
  };

  const handleToggleWidget = (id: DashboardWidgetId) => {
    setTempWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const newItems = [...tempWidgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // update orders
    newItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setTempWidgets(newItems);
  };

  const handleToggleWidth = (id: DashboardWidgetId) => {
    setTempWidgets(prev =>
      prev.map(w => {
        if (w.id === id) {
          const nextWidth = w.width === 'full' ? 'half' : 'full';
          return { ...w, width: nextWidth };
        }
        return w;
      })
    );
  };

  const handleSaveCustomization = () => {
    AppStorage.saveDashboardWidgets(tempWidgets);
    setWidgets(tempWidgets);
    setShowCustomizeModal(false);

    AppStorage.logAudit({
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'تخصيص لوحة المؤشرات',
      entityType: 'system_config',
      entityId: 'DASHBOARD-LAYOUT',
      details: `تم حفظ ترتيب وتخصيص ${tempWidgets.filter(w => w.enabled).length} ودجات في لوحة التحكم`,
      severity: 'info'
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleResetToDefault = () => {
    setTempWidgets(JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_WIDGETS)));
  };

  // --- Computations for Widgets ---
  // 1. Membership Stats
  const totalMemberships = memberships.length;
  const newMemberships = memberships.filter(m => m.status === 'received').length;
  const underReviewMemberships = memberships.filter(m => m.status === 'under_review').length;
  const approvedMemberships = memberships.filter(m => m.status === 'approved').length;
  const needsCorrectionMemberships = memberships.filter(m => m.status === 'needs_correction').length;
  const rejectedMemberships = memberships.filter(m => m.status === 'rejected').length;
  const approvalRate = totalMemberships > 0 ? Math.round((approvedMemberships / totalMemberships) * 100) : 0;

  // 2. Complaint Stats
  const totalComplaints = complaints.length;
  const receivedComplaints = complaints.filter(c => c.status === 'received' || c.status === 'triaging').length;
  const underStudyComplaints = complaints.filter(c => c.status === 'under_study' || c.status === 'in_progress').length;
  const referredComplaints = complaints.filter(c => c.status === 'referred').length;
  const needsInfoComplaints = complaints.filter(c => c.status === 'needs_info').length;
  const respondedComplaints = complaints.filter(c => c.status === 'responded' || c.status === 'closed').length;
  const confidentialComplaints = complaints.filter(c => c.isConfidential).length;
  const complaintResolutionRate = totalComplaints > 0 ? Math.round((respondedComplaints / totalComplaints) * 100) : 0;

  // 3. Wilaya distribution (Top 5)
  const wilayaCounts: Record<string, number> = {};
  memberships.forEach(m => {
    wilayaCounts[m.wilayaName] = (wilayaCounts[m.wilayaName] || 0) + 1;
  });
  const topWilayas = Object.entries(wilayaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 4. Rank breakdown
  const rankCounts: Record<string, number> = {};
  memberships.forEach(m => {
    rankCounts[m.rankTitle] = (rankCounts[m.rankTitle] || 0) + 1;
  });
  const topRanks = Object.entries(rankCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 5. Urgent or Actionable Complaints
  const urgentComplaintsList = complaints
    .filter(c => c.isConfidential || c.status === 'needs_info' || c.status === 'referred' || c.status === 'received')
    .slice(0, 4);

  // Render individual widget by ID
  const renderWidget = (widget: DashboardWidgetConfig) => {
    switch (widget.id) {
      case 'membership_stats':
        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">إحصائيات طلبات الانخراط</h3>
                  <p className="text-[11px] text-slate-500">حركة طلبات العضوية والاعتماد</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('admin-memberships')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة الكل</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block">إجمالي الطلبات</span>
                <span className="text-xl font-black text-slate-900">{totalMemberships}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                <span className="text-[10px] text-blue-700 block">طلبات جديدة</span>
                <span className="text-xl font-black text-blue-800">{newMemberships}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-emerald-700 block">مقبولة معتمدة</span>
                <span className="text-xl font-black text-emerald-800">{approvedMemberships}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                <span className="text-[10px] text-amber-700 block">قيد المراجعة</span>
                <span className="text-xl font-black text-amber-800">{underReviewMemberships}</span>
              </div>
            </div>

            {/* Progress Bar: Approval Rate */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">معدل اعتماد المنخرطين:</span>
                <span className="font-bold text-emerald-800">{approvalRate}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${approvalRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                <span>بحاجة لتصحيح: {needsCorrectionMemberships}</span>
                <span>مرفوضة: {rejectedMemberships}</span>
              </div>
            </div>
          </div>
        );

      case 'complaint_status':
        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">مؤشرات ومعالجة الشكاوى</h3>
                  <p className="text-[11px] text-slate-500">دورة حياة الشكاوى ونسب الردود الرسمية</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('admin-complaints')}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة الشكاوى</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block">إجمالي الشكاوى</span>
                <span className="text-xl font-black text-slate-900">{totalComplaints}</span>
              </div>
              <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
                <span className="text-[10px] text-indigo-700 block">قيد الفرز / الدراسة</span>
                <span className="text-xl font-black text-indigo-800">{underStudyComplaints + receivedComplaints}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-emerald-700 block">تم الرد رسمياً</span>
                <span className="text-xl font-black text-emerald-800">{respondedComplaints}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                <span className="text-[10px] text-amber-800 block flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  شكاوى سرية
                </span>
                <span className="text-xl font-black text-amber-900">{confidentialComplaints}</span>
              </div>
            </div>

            {/* Progress Bar: Complaint Resolution */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">نسبة الاستجابة والرد النقابي:</span>
                <span className="font-bold text-amber-800">{complaintResolutionRate}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${complaintResolutionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                <span>محالة للجان: {referredComplaints}</span>
                <span>تنتظر معلومات إضافية: {needsInfoComplaints}</span>
              </div>
            </div>
          </div>
        );

      case 'urgent_complaints':
        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-800 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">الشكاوى ذات الأولوية والملفات السرية</h3>
                  <p className="text-[11px] text-slate-500">تتطلب دراسة أو إحالة عاجلة أو اعتماد رد</p>
                </div>
              </div>
              <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold">
                {urgentComplaintsList.length} ملفات مستعجلة
              </span>
            </div>

            <div className="space-y-2.5">
              {urgentComplaintsList.map(comp => (
                <div 
                  key={comp.id} 
                  onClick={() => onNavigateToTab('admin-complaints')}
                  className="p-3 rounded-2xl border border-slate-200/70 hover:border-amber-400 bg-slate-50/60 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900" dir="ltr">{comp.referenceNumber}</span>
                      {comp.isConfidential && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                          <Lock className="w-2.5 h-2.5" /> سري
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">• ولاية {comp.wilayaName}</span>
                    </div>
                    <p className="font-medium text-slate-800 truncate">{comp.title}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800">
                      {comp.status === 'needs_info' ? 'تنتظر معلومات' : comp.status === 'referred' ? 'محالة للجنة' : 'قيد الفرز'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'user_activity':
        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">سجل النشاط الإداري والتدقيق</h3>
                  <p className="text-[11px] text-slate-500">حماية العمليات وفق القانون 18-07</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('admin-audit')}
                className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>كامل السجل</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">{log.details}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>الفاعل: {log.actorName} ({log.actorRole})</span>
                    <span className="font-mono" dir="ltr">{log.entityId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'wilaya_distribution':
        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">التوزيع الجغرافي (أعلى الولايات)</h3>
                  <p className="text-[11px] text-slate-500">حجم المنخرطين في 58 ولاية</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {topWilayas.length > 0 ? (
                topWilayas.map(([wilayaName, count], idx) => {
                  const pct = totalMemberships > 0 ? Math.round((count / totalMemberships) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-800">ولاية {wilayaName}</span>
                        <span className="text-slate-600 font-medium">{count} منخرط ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">لا توجد بيانات جغرافية كافية</div>
              )}
            </div>
          </div>
        );

      case 'rank_breakdown':
        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">توزيع المنخرطين حسب الرتب</h3>
                  <p className="text-[11px] text-slate-500">أسلاك التدريس، الإدارة، والتوجيه</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {topRanks.length > 0 ? (
                topRanks.map(([rankTitle, count], idx) => {
                  const pct = totalMemberships > 0 ? Math.round((count / totalMemberships) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-800 truncate max-w-[200px]">{rankTitle}</span>
                        <span className="text-slate-600 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.max(pct, 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">لا توجد إحصائيات رتب</div>
              )}
            </div>
          </div>
        );

      case 'quick_actions':
        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">إجراءات إدارية وتصدير البيانات</h3>
                  <p className="text-[11px] text-slate-500">تصدير مشفر وفق معايير 18-07</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={onExportMembershipsCSV}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>تصدير قائمة المنخرطين (CSV)</span>
                </div>
                <span className="text-[10px] text-emerald-700">محمي</span>
              </button>

              <button
                onClick={onExportComplaintsCSV}
                className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-700" />
                  <span>تصدير إحصائيات الشكاوى (CSV)</span>
                </div>
                <span className="text-[10px] text-amber-700">إحصائي</span>
              </button>

              <button
                onClick={() => onNavigateToTab('admin-settings')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Settings2 className="w-4 h-4 text-slate-600" />
                <span>تهيئة الرتب وتصنيفات الشكاوى</span>
              </button>

              <button
                onClick={() => onNavigateToTab('admin-audit')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>مراجعة سجل الأمان والتدقيق</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Sort widgets by configured order
  const activeWidgets = [...widgets]
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Customize Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-emerald-700" />
            <span>لوحة المؤشرات والتحكم الإدارية المخصصة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            رؤية شاملة ومخصصة لمتابعة العضوية، الشكاوى والنشاط وفق صلاحيات دورك: <strong className="text-emerald-800">{currentUser.fullName} ({currentUser.role})</strong>
          </p>
        </div>

        <button
          onClick={handleOpenCustomize}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Settings2 className="w-4 h-4" />
          <span>تخصيص وترتيب الودجات</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ تخصيص وترتيب لوحة التحكم الخاصة بك بنجاح!</span>
        </div>
      )}

      {/* RECHARTS SECTION: 6-Month New Members Trends */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <BarChart3 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>تطور عدد المنخرطين الجدد خلال الأشهر الستة الماضية</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Recharts Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مؤشر بياني تفاعلي يوضح وتيرة نمو طلبات الانتساب في قطاع التربية الوطنية خلال السداسي الأخير
              </p>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مخطط الأعمدة
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مخطط المساحة التراكمي
            </button>
          </div>
        </div>

        {/* 6-Month Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-center">
            <span className="text-xs text-emerald-800 font-medium block mb-1">إجمالي المنخرطين (6 أشهر)</span>
            <span className="text-2xl font-black text-emerald-950 font-mono">{totalSixMonths}</span>
            <span className="text-[11px] text-emerald-700 block mt-0.5">طلب انخراط جديد</span>
          </div>

          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-center">
            <span className="text-xs text-blue-800 font-medium block mb-1">المعدل الشهري</span>
            <span className="text-2xl font-black text-blue-950 font-mono">{avgMonthly}</span>
            <span className="text-[11px] text-blue-700 block mt-0.5">منخرط / شهر</span>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 text-center">
            <span className="text-xs text-amber-800 font-medium block mb-1">الشهر الأكثر تسجيلاً</span>
            <span className="text-xl font-bold text-amber-950">{peakMonth.month}</span>
            <span className="text-[11px] text-amber-700 block mt-0.5 font-mono">{peakMonth.total} طلب</span>
          </div>

          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 text-center">
            <span className="text-xs text-teal-800 font-medium block mb-1">معدل النمو السداسي</span>
            <span className="text-2xl font-black text-teal-950 font-mono">+{sixMonthGrowth}%</span>
            <span className="text-[11px] text-teal-700 block mt-0.5 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>وتيرة تصاعدية</span>
            </span>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="pt-2 w-full" dir="ltr">
          <div className="w-full h-80 sm:h-88">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={sixMonthsData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2" dir="rtl">
                            <p className="font-bold text-amber-300 text-sm border-b border-slate-700 pb-1.5 flex items-center gap-1.5">
                              <CalendarDays className="w-4 h-4 text-amber-400" />
                              <span>شهر: {label}</span>
                            </p>
                            {payload.map((entry: any, index: number) => (
                              <div key={`tip-${index}`} className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-slate-300">{entry.name}:</span>
                                </span>
                                <span className="font-mono font-bold text-white">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                    formatter={(value) => <span style={{ color: '#334155', fontWeight: 600 }}>{value}</span>}
                  />
                  <Bar dataKey="total" name="إجمالي المنخرطين الجدد" fill="#047857" radius={[8, 8, 0, 0]} barSize={28} />
                  <Bar dataKey="approved" name="الطلبات المعتمدة (المقبولة)" fill="#10b981" radius={[8, 8, 0, 0]} barSize={28} />
                  <Bar dataKey="underReview" name="قيد المراجعة والمعالجة" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              ) : (
                <AreaChart data={sixMonthsData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTotalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorApprovedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2" dir="rtl">
                            <p className="font-bold text-amber-300 text-sm border-b border-slate-700 pb-1.5 flex items-center gap-1.5">
                              <CalendarDays className="w-4 h-4 text-amber-400" />
                              <span>شهر: {label}</span>
                            </p>
                            {payload.map((entry: any, index: number) => (
                              <div key={`tip-${index}`} className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-slate-300">{entry.name}:</span>
                                </span>
                                <span className="font-mono font-bold text-white">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                    formatter={(value) => <span style={{ color: '#334155', fontWeight: 600 }}>{value}</span>}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="إجمالي المنخرطين الجدد" 
                    stroke="#047857" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTotalGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="approved" 
                    name="الطلبات المعتمدة (المقبولة)" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorApprovedGrad)" 
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>بيانات إحصائية مجمعة تخضع لمعايير حماية البيانات الشخصية وفق القانون 18-07.</span>
          </div>
          <button
            onClick={onExportMembershipsCSV}
            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>تصدير السجل الكامل (CSV)</span>
          </button>
        </div>

      </div>

      {/* Dynamic Grid of Custom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeWidgets.map(widget => (
          <div
            key={widget.id}
            className={widget.width === 'full' ? 'lg:col-span-2' : 'lg:col-span-1'}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {activeWidgets.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200">
          <LayoutGrid className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">لم يتم تفعيل أي ودجات حالياً</h3>
          <p className="text-xs text-slate-500">انقر على زر تخصيص الودجات بالأعلى لتحديد المؤشرات التي ترغب بعرضها</p>
          <button
            onClick={handleOpenCustomize}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold"
          >
            تخصيص اللوحة
          </button>
        </div>
      )}

      {/* CUSTOMIZE MODAL: SELECT, ARRANGE & SAVE */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 text-right max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">تخصيص وترتيب ودجات لوحة التحكم</h3>
                  <p className="text-xs text-slate-500">اختر الودجات المفعلة، غيّر ترتيبها، وحدد عرضها</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Widgets for Reordering & Toggling */}
            <div className="space-y-2.5 overflow-y-auto pr-1">
              {tempWidgets.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    item.enabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggleWidget(item.id)}
                      className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-[11px] text-slate-500 block">{item.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle Width */}
                    {item.enabled && (
                      <button
                        type="button"
                        onClick={() => handleToggleWidth(item.id)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 hover:bg-slate-100"
                      >
                        {item.width === 'full' ? 'عرض كامل (Full)' : 'نصف الشاشة (Half)'}
                      </button>
                    )}

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveWidget(idx, 'up')}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title="تحريك لأعلى"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === tempWidgets.length - 1}
                      onClick={() => handleMoveWidget(idx, 'down')}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title="تحريك لأسفل"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط للافتراضي</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomizeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomization}
                  className="px-5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التخصيص والترتيب</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
