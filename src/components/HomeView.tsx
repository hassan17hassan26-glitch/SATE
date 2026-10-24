/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCheck, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  Building, 
  Lock, 
  Users, 
  Clock, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { UnionConfig, MembershipApplication, Complaint } from '../types';

interface HomeViewProps {
  config: UnionConfig;
  onNavigate: (tab: string) => void;
  memberships: MembershipApplication[];
  complaints: Complaint[];
  onOpenPrivacyModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  config,
  onNavigate,
  memberships,
  complaints,
  onOpenPrivacyModal
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const approvedMembersCount = memberships.filter(m => m.status === 'approved').length;
  const totalComplaintsCount = complaints.length;
  const respondedComplaintsCount = complaints.filter(c => c.status === 'responded' || c.status === 'closed').length;

  const faqs = [
    {
      q: 'هل يشترط الانخراط في النقابة لتقديم شكوى مهنية أو إدارية؟',
      a: config.requireMembershipForComplaint 
        ? 'وفق النظام الداخلي المعتمد حالياً، تُعطى الأولوية لأعضاء النقابة المنخرطين في متابعة القضايا الإدارية، مع إمكانية التكفل بالحالات الإنسانية المستعجلة.'
        : 'لا، فضاء الشكاوى مفتوح لجميع موظفي وأساتذة قطاع التربية الوطنية بالجزائر بغض النظر عن انخراطهم، بهدف رصد الانشغالات المهنية والدفاع عن الحقوق المشروعة للمربي.'
    },
    {
      q: 'كيف يتم حماية رقم التعريف الوطني (NIN) ورقم الضمان الاجتماعي (NSS)؟',
      a: 'تطبق المنصة المعايير الأمنية المعتمدة وفق القانون 18-07 لحماية البيانات الشخصية. تُخزن الأرقام بشكل محمي ومقنع (Masked) في جميع القوائم العامة، ولا يمكن كشفها إلا لمسؤول العضوية المخول قانوناً مع تسجيل كل عملية دخول في سجل التدقيق الأمني.'
    },
    {
      q: 'ماذا يعني «طلب التعامل السري مع الشكوى»؟',
      a: 'عند تفعيل خيار السرية، يتم حجب تفاصيل الشكوى عن القوائم العادية وحصرها في المسؤول المختص واللجنة الولائية أو الوطنية المحددة. لا تظهر الشكوى في الإحصائيات المكشوفة ويمنع تداول هوية المشتكي في أي مراسلة دون موافقته الصريحة.'
    },
    {
      q: 'كيف أتابع حالة طلبي أو شكواي بعد الإرسال؟',
      a: 'عند إرسال أي طلب، يمنحك النظام رقماً مرجعياً فريداً (مثل DZ-MEMB-2025-XXXX) ورمزاً سرياً آمناً (PIN). يمكنك الدخول في أي وقت إلى صفحة «متابعة الطلب» أو «متابعة الشكوى» للاطلاع على المستجدات والردود الرسمية.'
    },
    {
      q: 'هل يعتبر تقديم الشكوى عبر المنصة إيداعاً رسمياً لدى مديرية التربية أو المحكمة الإدارية؟',
      a: 'المنصة أداة نقابية داخلية للمرافقة والاستشارة والتوسط النقابي، ولا تحل محل الإيداع الرسمي لدى الإدارات العمومية أو الهيئات القضائية إلا في حدود المراسلات الرسمية التي توجهها أمانة المنازعات بالنقابة إلى الوصاية.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl border border-emerald-700/40">
        
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            المنصة الرقمية الموحدة لمستخدمي قطاع التربية والتعليم
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-snug">
            {config.unionName}
          </h1>

          <p className="text-base sm:text-xl text-emerald-100 font-light max-w-2xl mx-auto leading-relaxed">
            {config.slogan}
          </p>

          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-3xl mx-auto leading-relaxed">
            فضاء إلكتروني آمن يتيح لأساتذة وموظفي قطاع التربية الوطنية تسجيل الانخراطات النقابية، ومتابعة البطاقات، وتقديم الشكاوى والطعون الإدارية في كنف الشفافية والسرية التامة وفق مقتضيات القانون الجزائري 18-07.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('membership-new')}
              className="px-6 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-sm sm:text-base hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <span>تسجيل منخرط جديد</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('complaints-new')}
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-5 h-5 text-slate-900" />
              <span>تقديم شكوى أو طعن إداري</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-10 sm:pt-12 mt-8 sm:mt-12 border-t border-emerald-800/80 max-w-4xl mx-auto">
          <div className="bg-emerald-900/60 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/50 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{memberships.length}</div>
            <div className="text-xs text-emerald-200 mt-1">طلبات انخراط مسجلة</div>
          </div>
          <div className="bg-emerald-900/60 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/50 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{approvedMembersCount}</div>
            <div className="text-xs text-emerald-200 mt-1">منخرطين معتمدين</div>
          </div>
          <div className="bg-emerald-900/60 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/50 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalComplaintsCount}</div>
            <div className="text-xs text-emerald-200 mt-1">شكوى قيد المتابعة</div>
          </div>
          <div className="bg-emerald-900/60 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/50 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">{respondedComplaintsCount}</div>
            <div className="text-xs text-emerald-200 mt-1">رد رسمي معتمد</div>
          </div>
        </div>
      </section>

      {/* The 2 Primary Action Cards (CRITICAL REQUIREMENT) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            فضاءات المنصة الرئيسية
          </h2>
          <p className="text-sm text-slate-600">
            اختر الفضاء المناسب لاحتياجك المهني مع إمكانية المتابعة الفورية برقم الملف
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* CARD 1: الانخراط النقابي */}
          <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-slate-200/80 flex flex-col justify-between group">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <UserCheck className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  الفضاء الأول: العضوية
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  الانخراط النقابي
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  يتيح لموظفي وأساتذة قطاع التربية تقديم طلب انخراط جديد، تدقيق الملفات، إصدار بطاقة الانخراط، ومتابعة حالة الطلب إلكترونياً.
                </p>
              </div>

              {/* Highlights */}
              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>استمارة مخصصة لكافة الرتب (أساتذة، إداريون، مشرفون، مفتشون ومقتصدون).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تغطية لـ 58 ولاية جزائرية ومؤسسات التعليم الابتدائي والمتوسط والثانوي.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>حماية مشددة لرقم التعريف الوطني (NIN) ورقم الضمان الاجتماعي وفق القانون 18-07.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>طباعة وصل إيداع فوري وبطاقة انخراط رسمية للملفات المقبولة.</span>
                </li>
              </ul>

            </div>

            {/* Actions for Card 1 */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 mt-6">
              <button
                onClick={() => onNavigate('membership-new')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 text-white font-bold text-xs sm:text-sm hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>تقديم طلب انخراط جديد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('membership-track')}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>متابعة حالة الطلب</span>
              </button>
            </div>
          </div>

          {/* CARD 2: شكاوى الموظفين */}
          <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-slate-200/80 flex flex-col justify-between group">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                  الفضاء الثاني: التظلمات
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  شكاوى الموظفين
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  فضاء مخصص لرفع الانشغالات المهنية والإدارية، الترقية، الرواتب، النزاعات مع الإدارة، مع إرفاق الوثائق الداعمة ومتابعة المعالجة.
                </p>
              </div>

              {/* Highlights */}
              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>10 تصنيفات معتمدة تغطي كافة المسارات المهنية والمالية والاجتماعية.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>خيار السرية التامة لحماية هوية المشتكي من أي تضييق إداري.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>فحص أمني للمرفقات (PDF, صور) لمنع الملفات الضارة والتسريب.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>دورة معالجة دقيقة من 12 مرحلة مع الفصل بين الردود والملاحظات الداخلية.</span>
                </li>
              </ul>

            </div>

            {/* Actions for Card 2 */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 mt-6">
              <button
                onClick={() => onNavigate('complaints-new')}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 text-white font-bold text-xs sm:text-sm hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>تقديم شكوى أو طعن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('complaints-track')}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>متابعة شكوى سابقة</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* NEW FEATURE: 69 Wilayas Directory & National Bureau Showcase */}
      <section className="max-w-6xl mx-auto bg-gradient-to-l from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold border border-emerald-600/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>التقسيم الإداري الجديد: 69 ولاية مغطاة بالكامل</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              دليل المكاتب والمنسقين الولائيين والمكتب الوطني التنفيذي
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              تصلكم النقابة أينما كنتم عبر 69 مكتباً ولائياً ومنسقية في كل ولايات الوطن الـ 69، بما في ذلك الولايات الـ 11 المستحدثة (أفلو، بريكة، القنطرة، بئر العاتر، العريشة، قصر الشلالة، عين وسارة، مسعد، قصر البخاري، بوسعادة، والأبيض سيدي الشيخ)، مع أيام وساعات استقبال أسبوعية مخصصة.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('directory')}
              className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-900" />
              <span>تصفح دليل الـ 69 ولاية</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Algerian Law 18-07 Privacy Banner */}
      <section className="max-w-6xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center shrink-0 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold">
              حماية المعطيات الشخصية وسرية المراسلات النقابية
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              تضمن المنصة سرية بيانات الموظفين وفق مقتضيات القانون رقم 18-07. يتم تشفير الأرقام الثبوتية ولا يتم استغلال بياناتكم لأي أغراض أخرى غير النشاط النقابي والدفاع عن حقوقكم المشروعة.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenPrivacyModal}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer transition-colors"
        >
          الاطلاع على سياسة الخصوصية
        </button>
      </section>

      {/* FAQ Accordions */}
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>إرشادات وتوضيحات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            الأسئلة الشائعة
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            كل ما تحتاج لمعرفته حول التسجيل ومتابعة الشكاوى والضمانات القانونية
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-2xs"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full text-right px-6 py-4 flex items-center justify-between text-sm sm:text-base font-bold text-slate-800 hover:text-emerald-800 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-emerald-700' : ''}`} />
              </button>
              {openFaqIndex === idx && (
                <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
