/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Lock, 
  UserCheck, 
  FileText, 
  Settings,
  Calendar
} from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogAdminProps {
  auditLogs: AuditLog[];
}

export const AuditLogAdmin: React.FC<AuditLogAdminProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');

  const filtered = auditLogs.filter(log => {
    if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;
    if (selectedEntity !== 'all' && log.entityType !== selectedEntity) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchEntity = log.entityId.toLowerCase().includes(q);
      if (!matchAction && !matchActor && !matchDetails && !matchEntity) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
          <span>سجل التدقيق الأمني والعمليات الإدارية (Audit Trail)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          سجل غير قابل للتعديل يوثق جميع عمليات الوصول، كشف البيانات الحساسة، القرارات الإدارية، وتعديلات النظام وفق القانون 18-07
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="البحث بالفاعل، الإجراء، أو المعرف..."
              className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل مستويات الأمان</option>
              <option value="info">إجراءات عادية (Info)</option>
              <option value="warning">تنبيهات إدارية (Warning)</option>
              <option value="security">أمنية حساسة (Security / NIN Reveal)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedEntity}
              onChange={e => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">كل الكيانات</option>
              <option value="membership">طلبات الانخراط</option>
              <option value="complaint">الشكاوى والتظلمات</option>
              <option value="system_config">إعدادات النظام</option>
              <option value="user_account">الحسابات والجلسات</option>
            </select>
          </div>

        </div>

        <div className="text-[11px] text-slate-400">
          إجمالي السجلات المسجلة: <strong>{filtered.length}</strong> عملية تدقيق
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">التوقيت والتاريخ</th>
                <th className="py-3 px-4">الفاعل (المستخدم)</th>
                <th className="py-3 px-4">نوع الإجراء</th>
                <th className="py-3 px-4">المعرف المرتبط</th>
                <th className="py-3 px-4">التفاصيل والمبرر</th>
                <th className="py-3 px-4">الأمان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap" dir="ltr">
                    {new Date(log.timestamp).toLocaleString('ar-DZ')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <div>{log.actorName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600" dir="ltr">
                    {log.entityId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[300px] truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {log.severity === 'security' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-max">
                        <Lock className="w-2.5 h-2.5" /> أمني مشدد
                      </span>
                    ) : log.severity === 'warning' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        تحذير
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        عادي
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
