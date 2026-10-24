/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  HelpCircle, 
  Home, 
  Lock, 
  Menu, 
  ShieldCheck, 
  UserCheck, 
  X,
  Phone,
  ChevronDown,
  Users
} from 'lucide-react';
import { UnionConfig, User } from '../types';

interface NavbarProps {
  config: UnionConfig;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAdminLogin: () => void;
  onOpenPrivacyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAdminLogin,
  onOpenPrivacyModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [membershipDropdownOpen, setMembershipDropdownOpen] = useState(false);
  const [complaintsDropdownOpen, setComplaintsDropdownOpen] = useState(false);

  const handleNav = (tab: string) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setMembershipDropdownOpen(false);
    setComplaintsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-900/10 shadow-xs">
      {/* Top Algerian institutional bar */}
      <div className="bg-emerald-900 text-emerald-50 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
            <span className="font-medium tracking-wide">الجمهورية الجزائرية الديمقراطية الشعبية — قطاع التربية والتعليم</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200 text-[11px]">
            <span className="hidden sm:inline">الامتثال للقانون 18-07 لحماية البيانات الشخصية</span>
            <button 
              onClick={onOpenPrivacyModal}
              className="hover:text-white underline cursor-pointer"
            >
              سياسة الخصوصية
            </button>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3 h-3" /> {config.phone.split('/')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Union Title */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center gap-2 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform border border-emerald-600/30 shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200" />
            </div>
            <div className="text-right min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 tracking-wider">
                  {config.shortName}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-700 font-medium hidden xs:inline">نقابة معتمدة</span>
              </div>
              <h1 className="text-xs sm:text-base lg:text-lg font-bold text-slate-900 leading-tight truncate max-w-[150px] sm:max-w-md">
                {config.unionName}
              </h1>
              <p className="text-xs text-slate-700 hidden sm:block">
                {config.slogan}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                  : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-700" />
              الرئيسية
            </button>

            {/* Membership Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMembershipDropdownOpen(!membershipDropdownOpen)}
                onBlur={() => setTimeout(() => setMembershipDropdownOpen(false), 200)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentTab.startsWith('membership')
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                    : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                الانخراط النقابي
                <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
              </button>
              {membershipDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 text-right animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => handleNav('membership-new')}
                    className="w-full text-right px-4 py-2.5 text-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center justify-between"
                  >
                    <span>تسجيل منخرط جديد</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">استمارة</span>
                  </button>
                  <button
                    onClick={() => handleNav('membership-track')}
                    className="w-full text-right px-4 py-2.5 text-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center justify-between"
                  >
                    <span>متابعة طلب الانخراط</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">برقم الملف</span>
                  </button>
                </div>
              )}
            </div>

            {/* Complaints Dropdown */}
            <div className="relative">
              <button
                onClick={() => setComplaintsDropdownOpen(!complaintsDropdownOpen)}
                onBlur={() => setTimeout(() => setComplaintsDropdownOpen(false), 200)}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentTab.startsWith('complaints')
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                    : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-700" />
                فضاء الشكاوى
                <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
              </button>
              {complaintsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 text-right animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => handleNav('complaints-new')}
                    className="w-full text-right px-4 py-2.5 text-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center justify-between"
                  >
                    <span>تقديم شكوى جديدة</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">مهنية وإدارية</span>
                  </button>
                  <button
                    onClick={() => handleNav('complaints-track')}
                    className="w-full text-right px-4 py-2.5 text-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 flex items-center justify-between"
                  >
                    <span>متابعة شكوى سابقة</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">آمن وسري</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('directory')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'directory'
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                  : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-700" />
              المكاتب والمنسقين
            </button>

            <button
              onClick={() => handleNav('faq')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'faq'
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                  : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              الأسئلة الشائعة
            </button>

            <button
              onClick={() => handleNav('privacy')}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'privacy'
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                  : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              حماية البيانات
            </button>
          </nav>

          {/* Right Action: Admin / Staff Portal Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {currentUser ? (
              <button
                onClick={() => handleNav('admin')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs ${
                  currentTab.startsWith('admin')
                    ? 'bg-emerald-800 text-white ring-2 ring-emerald-500'
                    : 'bg-emerald-900 text-white hover:bg-emerald-950'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.fullName}</span>
                <span className="text-[10px] bg-emerald-700 text-emerald-100 px-1.5 py-0.5 rounded">
                  الإدارة
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">فضاء المسؤولين</span>
                <span className="sm:hidden">دخول</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 text-slate-700"
          >
            الرئيسية
          </button>
          <div className="border-t border-slate-100 pt-2 pb-1 text-xs font-bold text-slate-700 px-3">
            الانخراط النقابي
          </div>
          <button
            onClick={() => handleNav('membership-new')}
            className="w-full text-right px-3 py-2 rounded-lg text-sm hover:bg-emerald-50 text-slate-600 pr-6"
          >
            تسجيل منخرط جديد
          </button>
          <button
            onClick={() => handleNav('membership-track')}
            className="w-full text-right px-3 py-2 rounded-lg text-sm hover:bg-emerald-50 text-slate-600 pr-6"
          >
            متابعة طلب الانخراط
          </button>

          <div className="border-t border-slate-100 pt-2 pb-1 text-xs font-bold text-slate-700 px-3">
            فضاء شكاوى الموظفين
          </div>
          <button
            onClick={() => handleNav('complaints-new')}
            className="w-full text-right px-3 py-2 rounded-lg text-sm hover:bg-emerald-50 text-slate-600 pr-6"
          >
            تقديم شكوى جديدة
          </button>
          <button
            onClick={() => handleNav('complaints-track')}
            className="w-full text-right px-3 py-2 rounded-lg text-sm hover:bg-emerald-50 text-slate-600 pr-6"
          >
            متابعة شكوى سابقة
          </button>

          <div className="border-t border-slate-100 pt-2"></div>
          <button
            onClick={() => handleNav('directory')}
            className="w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 text-slate-700 flex items-center justify-between"
          >
            <span>دليل المكاتب والمنسقين (69 ولاية)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">69 ولاية</span>
          </button>
          <button
            onClick={() => handleNav('faq')}
            className="w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 text-slate-700"
          >
            الأسئلة الشائعة
          </button>
          <button
            onClick={() => handleNav('privacy')}
            className="w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 text-slate-700"
          >
            حماية المعطيات والخصوصية (18-07)
          </button>
          <button
            onClick={() => {
              if (currentUser) {
                handleNav('admin');
              } else {
                onOpenAdminLogin();
                setMobileMenuOpen(false);
              }
            }}
            className="w-full mt-2 text-right px-3 py-2.5 rounded-lg text-sm font-bold bg-emerald-900 text-white flex items-center justify-between"
          >
            <span>{currentUser ? 'الدخول إلى لوحة الإدارة' : 'تسجيل دخول الإدارة والنقابة'}</span>
            <Lock className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
