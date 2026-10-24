/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, X, ShieldCheck, ArrowLeft, UserCheck } from 'lucide-react';
import { User, UnionConfig } from '../types';
import { SYSTEM_USERS, AppStorage } from '../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  config: UnionConfig;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  config
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = SYSTEM_USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (found) {
      AppStorage.setCurrentUser(found);
      onLoginSuccess(found);
      onClose();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
  };

  const handleQuickLogin = (user: User) => {
    AppStorage.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">فضاء المسؤولين والأمانة النقابية</h3>
              <p className="text-xs text-slate-500">تسجيل الدخول إلى لوحة الإدارة المحمية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم الإداري:</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin_national أو memb_officer..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              dir="ltr"
            />
          </div>

          {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shadow-xs"
          >
            تسجيل الدخول
          </button>
        </form>

        {/* Fast Role Login buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] text-slate-500 font-bold block">
            دخول سريع للتجربة بحسب الصلاحيات (RBAC):
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin(SYSTEM_USERS[0])}
              className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-right text-slate-800 font-semibold transition-colors"
            >
              <div className="text-[10px] text-emerald-700 font-bold">مدير عام النظام</div>
              <div className="text-[11px] truncate">{SYSTEM_USERS[0].fullName}</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(SYSTEM_USERS[1])}
              className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-right text-slate-800 font-semibold transition-colors"
            >
              <div className="text-[10px] text-emerald-700 font-bold">مسؤول العضوية</div>
              <div className="text-[11px] truncate">{SYSTEM_USERS[1].fullName}</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(SYSTEM_USERS[2])}
              className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-right text-slate-800 font-semibold transition-colors"
            >
              <div className="text-[10px] text-amber-700 font-bold">مسؤول الشكاوى</div>
              <div className="text-[11px] truncate">{SYSTEM_USERS[2].fullName}</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(SYSTEM_USERS[3])}
              className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-right text-slate-800 font-semibold transition-colors"
            >
              <div className="text-[10px] text-blue-700 font-bold">مسؤول ولائي (الجزائر)</div>
              <div className="text-[11px] truncate">{SYSTEM_USERS[3].fullName}</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
