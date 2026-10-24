/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search, ShieldCheck, FileText, UserCheck } from 'lucide-react';
import { UnionConfig } from '../types';

interface FaqViewProps {
  config: UnionConfig;
  onNavigate: (tab: string) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ config, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      cat: 'العضوية والانخراط',
      q: 'ما هي الوثائق المطلوبة لإتمام الانخراط النقابي؟',
      a: 'استمارة الانخراط الرقمية عبر المنصة تتطلب إدخال رقم التعريف الوطني البيومتري (NIN) ورقم الضمان الاجتماعي (NSS) وتحديد المؤسسة الأصلية. بعد مراجعة أمانة العضوية بالمكتب الولائي، يتم اعتماد العضوية وإصدار وصل إلكتروني وبطاقة انخراط رسمية.'
    },
    {
      cat: 'العضوية والانخراط',
      q: 'كيف أعرف إن كان طلبي قد قُبل أو يحتاج إلى تصحيح؟',
      a: 'بواسطة الرقم المرجعي (مثل DZ-MEMB-2025-XXXX) والرمز السري (PIN) المسجل في وصل إيداعك، يمكنك الدخول إلى شاشة «متابعة طلب الانخراط». في حال طلبت الإدارة تصحيحاً، سيظهر لك زر لتعديل البيانات وتحديث الملف فورياً.'
    },
    {
      cat: 'الشكاوى والنزاعات',
      q: 'هل يمكنني تقديم شكوى دون الكشف عن هويتي لزملائي أو الإدارة المباشرة؟',
      a: 'نعم، يتضمن نموذج تقديم الشكوى خياراً صريحاً بعنوان «طلب التعامل السري مع الشكوى». عند تفعيله، يتم تقييد الاطلاع بالمسؤول المخول أو لجنة النزاعات، ولا تظهر بياناتك الشخصية في أي تقرير أو لوحة عامة.'
    },
    {
      cat: 'الشكاوى والنزاعات',
      q: 'ما هي المدة التقديرية لدراسة الشكوى والرد عليها؟',
      a: 'تخضع الشكاوى لدورة فرز خلال 48 ساعة، ويتم إحالتها إلى المكتب الولائي أو المصلحة المختصة. يتم إشعاركم بأي رد رسمي أو طلب توضيحات عبر صفحة المتابعة.'
    },
    {
      cat: 'الأمان والخصوصية',
      q: 'كيف تضمن النقابة الامتثال للقانون الجزائري 18-07؟',
      a: 'تخضع المنصة لنظام تشفير وحماية صارم. لا تُعرض أرقام التعريف الوطني أو الضمان الاجتماعي كنصوص مكشوفة في الجداول، ويتم تسجيل أي وصول إداري إليها في سجل تدقيق غير قابل للتلاعب (Audit Trail).'
    },
    {
      cat: 'المؤسسات والرتب',
      q: 'ماذا أفعل إذا كانت مدرستي أو متوسطتي أو ثانويتي غير موجودة في القائمة؟',
      a: 'توفر الاستمارة خياراً فورياً بعنوان «لم تجد مؤسستك؟ اقترح إضافتها»، حيث يمكنك كتابة اسم المؤسسة ونوعها (ابتدائي، متوسط، ثانوي)، وسيتم إدراجها في طلبك وإحالتها للمشرف لتوثيقها في قاعدة البيانات.'
    }
  ];

  const filtered = faqItems.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || 
    f.a.toLowerCase().includes(search.toLowerCase()) ||
    f.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
          <HelpCircle className="w-4 h-4" />
          <span>مركز المساعدة والتوجيه</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          دليل المستخدم والأسئلة الشائعة
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          إجابات وافية وشاملة عن مسار الانخراط النقابي، تقديم الشكاوى، وضمانات الخصوصية والأمان.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث في الأسئلة الشائعة (الانخراط، الشكاوى، السرية...)"
          className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filtered.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-right p-5 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                  {faq.cat}
                </span>
                <div>{faq.q}</div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openIndex === idx ? 'rotate-180 text-emerald-700' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                {faq.a}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center p-8 bg-white rounded-3xl border text-xs text-slate-500">
            لم نجد نتائج مطابقة لبحثك. تواصل مع أمانة النقابة للحصول على مساعدة مباشرة.
          </div>
        )}
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="p-6 rounded-3xl bg-emerald-900 text-white flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">تريد الانخراط في النقابة؟</h4>
            <p className="text-xs text-emerald-200 mt-1">سجل استمارتك الإلكترونية خلال 3 دقائق</p>
          </div>
          <button
            onClick={() => onNavigate('membership-new')}
            className="px-4 py-2 bg-white text-emerald-950 rounded-xl text-xs font-bold hover:bg-emerald-50"
          >
            تسجيل جديد
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-amber-600 text-white flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">لديك انشغال أو تظلم مهني؟</h4>
            <p className="text-xs text-amber-100 mt-1">ارفع شكواك بسرية تامة لمصالح النزاعات</p>
          </div>
          <button
            onClick={() => onNavigate('complaints-new')}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
          >
            تقديم شكوى
          </button>
        </div>
      </div>
    </div>
  );
};
