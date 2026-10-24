/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutGrid, 
  UserCheck, 
  FileText, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  User, 
  ChevronDown,
  Building,
  Lock
} from 'lucide-react';
import { User as UserType, UnionConfig } from '../../types';
import { SYSTEM_USERS, AppStorage } from '../../utils/storage';

interface AdminLayoutProps {
  currentUser: UserType;
  config: UnionConfig;
  currentAdminTab: string;
  onSelectAdminTab: (tab: string) => void;
  onSwitchUser: (user: UserType) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  config,
  currentAdminTab,
  onSelectAdminTab,
  onSwitchUser,
  onLogout,
  children
}) => {
  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'مدير النظام (Super Admin)';
      case 'membership_officer':
        return 'مسؤول أمانة العضوية';
      case 'complaints_officer':
        return 'مسؤول الشكاوى والمنازعات';
      case 'wilaya_officer':
        return `مسؤول ولائي (${currentUser.wilayaId === 16 ? 'الجزائر العاصمة' : 'وهران'})`;
      case 'committee':
        return 'عضو اللجنة الوطنية للنزاعات';
      default:
        return 'مستخدم النظام';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Admin Top Navigation & Role Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          {/* User identity & active role */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-lg border border-emerald-600/40">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{currentUser.fullName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {getRoleTitle(currentUser.role)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser.email} • {config.shortName} - الجزائر
              </p>
            </div>
          </div>

          {/* Quick Role Switcher for live verification & testing */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block mb-1">تبديل الدور للتجربة (RBAC):</span>
              <select
                value={currentUser.id}
                onChange={e => {
                  const target = SYSTEM_USERS.find(u => u.id === e.target.value);
                  if (target) onSwitchUser(target);
                }}
                className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {SYSTEM_USERS.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} — {getRoleTitle(u.role)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors self-end"
              title="العودة للواجهة العامة"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>خروج</span>
            </button>
          </div>

        </div>

        {/* Admin Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-1">
          <button
            onClick={() => onSelectAdminTab('admin-dashboard')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              currentAdminTab === 'admin-dashboard'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-emerald-300" />
            <span>لوحة المؤشرات المخصصة</span>
          </button>

          <button
            onClick={() => onSelectAdminTab('admin-memberships')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              currentAdminTab === 'admin-memberships'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>إدارة الانخراطات والعضوية</span>
          </button>

          <button
            onClick={() => onSelectAdminTab('admin-complaints')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              currentAdminTab === 'admin-complaints'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>إدارة الشكاوى والمنازعات</span>
          </button>

          <button
            onClick={() => onSelectAdminTab('admin-settings')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              currentAdminTab === 'admin-settings'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-300" />
            <span>تهيئة الرتب وتصنيفات الشكاوى</span>
          </button>

          <button
            onClick={() => onSelectAdminTab('admin-audit')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              currentAdminTab === 'admin-audit'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>سجل التدقيق الأمني (18-07)</span>
          </button>
        </div>

      </div>

      {/* Main Admin View Content */}
      <main>
        {children}
      </main>

    </div>
  );
};
