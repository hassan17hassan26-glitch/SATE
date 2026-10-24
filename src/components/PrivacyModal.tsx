/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, Scale, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { UnionConfig } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UnionConfig;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, config }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">إشعار حماية البيانات الشخصية والامتثال القانوني</h2>
              <p className="text-xs text-emerald-200">وفقًا للقانون رقم 18-07 المؤرخ في 10 يونيو 2018</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed text-right">
          
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-bold">التزام النقابة بحماية المعطيات ذات الطابع الشخصي:</p>
              <p>
                تلتزم {config.unionName} ({config.shortName}) بالمعايير الصارمة المنصوص عليها في القانون الجزائري رقم 18-07 في جميع مراحل معالجة طلبات الانخراط وتدبير شكاوى موظفي قطاع التربية.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              1. الغرض من جمع البيانات (Finalité du traitement)
            </h3>
            <p className="text-xs text-slate-600">
              يتم جمع البيانات حصراً لغرضين محددين ومشروعين:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-600 pr-2">
              <li><strong>إدارة طلبات الانخراط:</strong> التحقق من الصفة المهنية كموظف في قطاع التربية الوطنية، وإصدار بطاقات الانخراط، والتواصل النقابي.</li>
              <li><strong>معالجة الشكاوى المهنية والإدارية:</strong> دراسة الانشغالات المهنية، التوسط لدى مديريات التربية والوزارة، ومتابعة القضايا في اللجان المتساوية الأعضاء.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-1.5">
              <Lock className="w-4 h-4 text-emerald-700" />
              2. حماية وتشفير البيانات الحساسة (NIN & NSS)
            </h3>
            <p className="text-xs text-slate-600">
              تخضع أرقام التعريف الوطني (18 رقماً) وأرقام الضمان الاجتماعي لحماية خاصة:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-600 pr-2">
              <li>يتم إخفاؤها افتراضياً في جميع الجداول والشاشات الإدارية (تظهر بصيغة 1985**********0123).</li>
              <li>لا يمكن كشف الرقم إلا بطلب إداري مبرر مع تسجيل اسم الفاعل والتوقيت في سجل التدقيق الأمني.</li>
              <li>لا يتم إدراج هذه الأرقام في روابط URL أو الإشعارات أو البريد الإلكتروني.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-1.5">
              <EyeOff className="w-4 h-4 text-emerald-700" />
              3. سرية الشكاوى ومبدأ «الحاجة إلى المعرفة»
            </h3>
            <p className="text-xs text-slate-600">
              عند اختيار خيار «طلب التعامل السري مع الشكوى»، يُحصر حق الاطلاع على محتوى الملف في المسؤول المباشر واللجنة المختصة. يُمنع مسؤولو الولايات أو الفروع الأخرى من تصفح أو تصدير تفاصيل الشكوى دون تفويض مكتوب ومسجل تقنياً.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              4. حقوق أصحاب البيانات (Droits des personnes)
            </h3>
            <p className="text-xs text-slate-600">
              يحق لكل موظف مسجل في المنصة:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-600 pr-2">
              <li><strong>حق الاطلاع والمتابعة:</strong> متابعة حالة ملفه عبر الرقم المرجعي والرمز السري.</li>
              <li><strong>حق التصحيح والتحيين:</strong> تعديل بياناته عند تلقي إشعار «بحاجة إلى تصحيح».</li>
              <li><strong>حق الحذف والأرشفة:</strong> طلب إغلاق أو أرشفة ملف الشكوى بعد انتهاء الغرض منها.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              5. مسؤول حماية البيانات والاتصال
            </h3>
            <p className="text-xs text-slate-600">
              لأي استفسار أو ممارسة لحقوقكم المكفولة قانوناً، يرجى مراسلة مسؤول حماية البيانات بالنقابة:
              <br />
              <span className="font-mono text-emerald-800 font-bold" dir="ltr">{config.dataProtectionOfficerContact}</span>
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            إغلاق الإشعار
          </button>
        </div>

      </div>
    </div>
  );
};
