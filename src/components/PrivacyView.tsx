/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Scale, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { UnionConfig } from '../types';

interface PrivacyViewProps {
  config: UnionConfig;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ config }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
          <Scale className="w-4 h-4" />
          <span>الامتثال للتشريع الجزائري</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          سياسة حماية البيانات الشخصية والخصوصية
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          وفقاً لمقتضيات القانون رقم 18-07 المؤرخ في 10 يونيو 2018 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed text-right">
        
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2">
          <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>التزام صريح بالشرعية والشفافية:</span>
          </h3>
          <p className="text-xs text-emerald-900 leading-relaxed">
            تعلن {config.unionName} أن كافة عمليات الجمع والمعالجة الإلكترونية للمعطيات عبر هذه المنصة تتم في إطار ممارسة الحق النقابي المكفول دستورياً، ووفقاً للضوابط الأمنية والإجرائية المحددة في القانون 18-07 لتفادي أي استخدام غير مصرح به أو مساس بالحياة الخاصة للموظفين.
          </p>
        </div>

        <section className="space-y-3">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            المادة 1: طبيعة المعطيات المجمعة
          </h4>
          <p className="text-slate-600">
            تقتصر البيانات المجمعة على ما هو ضروري حصراً لتسيير الملف النقابي:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pr-3">
            <li>الاسم واللقب والرتبة المهنية والمؤسسة التربوية ومقر العمل.</li>
            <li>رقم الهاتف والبريد الإلكتروني للإشعارات ومتابعة الملفات.</li>
            <li>رقم التعريف الوطني (NIN) ورقم الضمان الاجتماعي (NSS) للتحقق الحصري من الصفة الوظيفية.</li>
            <li>الوثائق المرفقة المتعلقة بالمسار المهني والشكاوى الإدارية.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-700" />
            المادة 2: معايير التشفير والإخفاء (Masking)
          </h4>
          <p className="text-slate-600">
            تطبيقاً لمبدأ تقليل البيانات (Data Minimization):
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pr-3">
            <li>تُخفى الأرقام الوطنية الحساسة افتراضياً في جميع الجداول الإدارية وتظهر مقنعة (1985**********0123).</li>
            <li>يُحظر كشف الرقم الكامل إلا عند وجود مبرر وظيفي مسجل في سجل التدقيق الأمني (Audit Log).</li>
            <li>يُمنع تضمين أرقام الهوية في روابط URL أو الرسائل النصية العامة أو الإشعارات البريدية.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-emerald-700" />
            المادة 3: نظام سرية الشكاوى والملاحظات الداخلية
          </h4>
          <p className="text-slate-600">
            تلتزم النقابة بالفصل التقني الكامل بين:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">الردود الرسمية المعتمدة:</span>
              <p className="text-xs text-slate-600">تُنشر لصاحب الشكوى وتتضمن الموقف النقابي أو التوجيه الإداري الموجه إليه.</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="font-bold text-purple-900 block mb-1">الملاحظات والتحقيقات الداخلية:</span>
              <p className="text-xs text-purple-800">محصورة بالمسؤولين واللجان المختصة، ولا يمكن لصاحب الشكوى أو أي طرف ثالث الاطلاع عليها.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            المادة 4: حقوق أصحاب المعطيات ومسؤول الحماية
          </h4>
          <p className="text-slate-600 leading-relaxed">
            يضمن القانون 18-07 للموظف الحق في الولوج إلى معطياته، تصحيحها، أو الاعتراض على معالجتها. لممارسة هذه الحقوق أو تقديم استفسار، يرجى مراسلة مفوض حماية المعطيات بالنقابة:
          </p>
          <div className="p-3 rounded-xl bg-slate-100 font-mono text-emerald-900 font-bold" dir="ltr">
            {config.dataProtectionOfficerContact}
          </div>
        </section>

      </div>

    </div>
  );
};
