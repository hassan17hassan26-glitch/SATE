/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Building2, ShieldCheck, Phone, Mail, MapPin, Scale } from 'lucide-react';
import { UnionConfig } from '../types';

interface FooterProps {
  config: UnionConfig;
  onOpenPrivacyModal: () => void;
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenPrivacyModal, onSelectTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Union Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="font-bold text-white text-base block">{config.shortName}</span>
                <span className="text-xs text-slate-400 block">{config.unionName}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              منظمة نقابية معتمدة تعمل في قطاع التربية والتعليم الوطني بالجزائر؛ تهدف للدفاع عن الحقوق المهنية والاجتماعية ومرافقة مستخدمي القطاع.
            </p>
            <div className="text-[11px] text-emerald-400 bg-emerald-950/80 p-2.5 rounded-lg border border-emerald-800/60">
              {config.registrationNumber}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              خدمات المنصة
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => onSelectTab('membership-new')} className="hover:text-emerald-400 transition-colors">
                  • تسجيل منخرط جديد
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('membership-track')} className="hover:text-emerald-400 transition-colors">
                  • متابعة طلب الانخراط النقابي
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('complaints-new')} className="hover:text-emerald-400 transition-colors">
                  • فضاء تقديم الشكاوى المهنية
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('complaints-track')} className="hover:text-emerald-400 transition-colors">
                  • متابعة ومعالجة الشكوى برقم الملف
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('directory')} className="hover:text-emerald-400 transition-colors font-semibold text-emerald-300">
                  • دليل المكاتب والمنسقين (69 ولاية)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('faq')} className="hover:text-emerald-400 transition-colors">
                  • الأسئلة الشائعة ودليل المستخدم
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Privacy Law 18-07 */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              الامتثال القانوني والخصوصية
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              تخضع جميع المعطيات الشخصية في هذه المنصة لمقتضيات القانون رقم 18-07 المؤرخ في 10 يونيو 2018 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                تشفير أرقام التعريف الوطني والضمان الاجتماعي
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                سجل تدقيق أمني غير قابل للتعديل
              </li>
            </ul>
            <button
              onClick={onOpenPrivacyModal}
              className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline font-medium block"
            >
              قراءة الإشعار القانوني وسياسة الخصوصية
            </button>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              بيانات التواصل النقابي
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{config.address} ({config.headquartersWilaya})</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr">{config.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr">{config.email}</span>
              </li>
              <li className="text-[11px] text-slate-400 pt-1">
                مسؤول حماية البيانات (DPO): {config.dataProtectionOfficerContact}
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
          <div>
            © {new Date().getFullYear()} {config.unionName}. جميع الحقوق محفوظة وفق التشريعات الجزائرية.
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>بوابة موجهة لأساتذة وموظفي قطاع التربية الوطنية</span>
            <span>•</span>
            <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
