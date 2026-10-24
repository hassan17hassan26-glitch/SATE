/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  FileText, 
  ChevronLeft, 
  X, 
  ArrowRight,
  Filter,
  Sparkles,
  Map,
  Pencil,
  Plus,
  RotateCcw,
  Check
} from 'lucide-react';
import { UnionOfficial, UnionConfig, User } from '../types';
import { ALGERIA_WILAYAS } from '../data/algeriaData';
import { EditOfficialModal } from './EditOfficialModal';
import { AppStorage } from '../utils/storage';

interface UnionDirectoryViewProps {
  officials: UnionOfficial[];
  config: UnionConfig;
  onNavigate: (tab: string, state?: any) => void;
  currentUser?: User | null;
  onRefreshData?: () => void;
}

export const UnionDirectoryView: React.FC<UnionDirectoryViewProps> = ({
  officials,
  config,
  onNavigate,
  currentUser,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'national' | 'wilayas'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedOfficialForAppointment, setSelectedOfficialForAppointment] = useState<UnionOfficial | null>(null);

  // Edit / Add Official Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfficialForEdit, setSelectedOfficialForEdit] = useState<UnionOfficial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  
  // Appointment Form state
  const [appointmentName, setAppointmentName] = useState('');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [appointmentRank, setAppointmentRank] = useState('');
  const [appointmentSubject, setAppointmentSubject] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Statistics
  const nationalCount = useMemo(() => officials.filter(o => o.roleType === 'national_bureau').length, [officials]);
  const wilayaCount = useMemo(() => officials.filter(o => o.roleType !== 'national_bureau').length, [officials]);

  // Filtering
  const filteredOfficials = useMemo(() => {
    return officials.filter(item => {
      // Tab filter
      if (activeTab === 'national' && item.roleType !== 'national_bureau') return false;
      if (activeTab === 'wilayas' && item.roleType === 'national_bureau') return false;

      // Zone filter
      if (selectedZone !== 'all') {
        if (selectedZone === 'high_plateaus' && item.zone !== 'high_plateaus') return false;
        if (selectedZone === 'center' && item.zone !== 'center') return false;
        if (selectedZone === 'east' && item.zone !== 'east') return false;
        if (selectedZone === 'west' && item.zone !== 'west') return false;
        if (selectedZone === 'south' && item.zone !== 'south') return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.fullName.toLowerCase().includes(q);
        const roleMatch = item.roleTitle.toLowerCase().includes(q);
        const wilayaMatch = item.wilayaName ? item.wilayaName.toLowerCase().includes(q) : false;
        const wilayaIdMatch = item.wilayaId ? item.wilayaId.toString() === q : false;
        const addressMatch = item.officeAddress.toLowerCase().includes(q);
        return nameMatch || roleMatch || wilayaMatch || wilayaIdMatch || addressMatch;
      }

      return true;
    });
  }, [officials, activeTab, selectedZone, searchQuery]);

  const handleOpenAppointment = (official: UnionOfficial) => {
    setSelectedOfficialForAppointment(official);
    setAppointmentSuccess(false);
    setAppointmentSubject('');
    setAppointmentDate('');
  };

  const handleSubmitAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentName || !appointmentPhone || !appointmentSubject) return;
    setAppointmentSuccess(true);
  };

  const handleOpenEdit = (official: UnionOfficial) => {
    setSelectedOfficialForEdit(official);
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedOfficialForEdit(null);
    setIsEditModalOpen(true);
  };

  const handleSaveOfficial = (saved: UnionOfficial, isNew: boolean) => {
    if (isNew) {
      AppStorage.addOfficial(saved, currentUser ? currentUser.fullName : 'مسؤول النظام', currentUser ? currentUser.role : 'super_admin');
      setToastMessage(`تمت إضافة ${saved.roleTitle} (${saved.fullName}) بنجاح إلى الدليل الرسمي`);
    } else {
      AppStorage.updateOfficial(saved, currentUser ? currentUser.fullName : 'مسؤول النظام', currentUser ? currentUser.role : 'super_admin');
      setToastMessage(`تم تحديث معلومات ${saved.roleTitle} (${saved.fullName}) بنجاح وحفظها في النظام`);
    }
    if (onRefreshData) onRefreshData();
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDeleteOfficial = (officialId: string) => {
    AppStorage.deleteOfficial(officialId, currentUser ? currentUser.fullName : 'مسؤول النظام', currentUser ? currentUser.role : 'super_admin');
    setToastMessage('تم حذف المسؤول من الدليل الرسمي وتسجيل العملية في سجل التدقيق بنجاح');
    if (onRefreshData) onRefreshData();
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetDefaults = () => {
    AppStorage.resetOfficialsToDefault(currentUser ? currentUser.fullName : 'مسؤول النظام', currentUser ? currentUser.role : 'super_admin');
    setIsResetConfirming(false);
    setToastMessage('تمت استعادة كافة المكاتب والمسؤولين الافتراضيين (79 مسؤولاً للـ 69 ولاية والمكتب الوطني) بنجاح');
    if (onRefreshData) onRefreshData();
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-linear-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm font-medium">
            <Building2 className="w-4 h-4 text-emerald-300" />
            <span>التنظيم الهيكلي والإقليمي للنقابة الجزائريّة لعمال التربية (SATE)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            دليل رؤساء المكاتب الولائية والمنسقين وأعضاء المكتب الوطني
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-3xl">
            تغطي النقابة كافة التراب الوطني عبر <strong className="text-amber-300 font-bold">69 ولاية كاملة</strong> وفق التقسيم الإداري الجديد للجمهورية، إلى جانب المكتب الوطني التنفيذي، لضمان القرب الدائم من موظفي وأساتذة التربية والاستماع لانشغالاتهم.
          </p>

          {/* Quick Counter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-emerald-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">69</div>
              <div className="text-xs text-emerald-200 mt-1">ولاية مغطاة 100%</div>
            </div>
            <div className="bg-emerald-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{nationalCount}</div>
              <div className="text-xs text-emerald-200 mt-1">أعضاء المكتب الوطني</div>
            </div>
            <div className="bg-emerald-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{wilayaCount}</div>
              <div className="text-xs text-emerald-200 mt-1">مكتب ومنسقية ولائية</div>
            </div>
            <div className="bg-emerald-950/50 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-700/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">11</div>
              <div className="text-xs text-emerald-200 mt-1">ولاية جديدة مستحدثة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Action Buttons & Filters Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Top Action Bar: Add Official & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              title="إضافة رئيس مكتب أو منسق ولائي أو عضو مكتب وطني"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مسؤول / مكتب جديد</span>
            </button>

            {isResetConfirming ? (
              <div className="inline-flex items-center gap-2 bg-amber-50 p-1.5 rounded-xl border border-amber-300">
                <span className="text-[11px] font-bold text-amber-900">تأكيد استعادة الدليل الأصلي؟</span>
                <button
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  نعم، استعد
                </button>
                <button
                  onClick={() => setIsResetConfirming(false)}
                  className="px-2 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsResetConfirming(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="استعادة القائمة الرسمية الأصلية (79 مسؤولاً للـ 69 ولاية)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>استعادة البيانات الافتراضية</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>يمكن تعديل أي مسؤول عبر النقر على زر <strong>«تعديل»</strong> على بطاقته</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الولاية (مثال: بريكة، أفلو، وهران، 69)، أو اسم المسؤول، أو الصفة..."
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({officials.length})
            </button>
            <button
              onClick={() => setActiveTab('national')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'national'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المكتب الوطني ({nationalCount})
            </button>
            <button
              onClick={() => setActiveTab('wilayas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'wilayas'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الولايات الـ 69 ({wilayaCount})
            </button>
          </div>
        </div>

        {/* Region / Zone Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> تصفية بالمناطق:
          </span>
          {[
            { id: 'all', label: 'كافة المناطق' },
            { id: 'high_plateaus', label: 'الهضاب العليا والولايات الجديدة (11)' },
            { id: 'center', label: 'ولايات الوسط' },
            { id: 'east', label: 'ولايات الشرق' },
            { id: 'west', label: 'ولايات الغرب' },
            { id: 'south', label: 'ولايات الجنوب الكبير' }
          ].map(zone => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedZone === zone.id
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
          <span>
            عرض <strong className="text-slate-900 font-bold">{filteredOfficials.length}</strong> مسؤولاً ونقابياً
          </span>
          {searchQuery && (
            <span>
              نتائج البحث عن: «<strong className="text-emerald-700">{searchQuery}</strong>»
            </span>
          )}
        </div>

        {filteredOfficials.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              تأكد من كتابة اسم الولاية أو اسم المسؤول بشكل صحيح، أو أعد ضبط الفلاتر لعرض كافة الولايات الـ 69.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedZone('all');
                setActiveTab('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOfficials.map(official => {
              const isNational = official.roleType === 'national_bureau';
              const isNewWilaya = official.wilayaId && official.wilayaId >= 59;

              return (
                <div
                  key={official.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between p-5 relative overflow-hidden group ${
                    isNational
                      ? 'border-emerald-300/80 ring-1 ring-emerald-100'
                      : isNewWilaya
                      ? 'border-amber-300/80 ring-1 ring-amber-100'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Top Badge Banner */}
                  <div className="flex items-center justify-between mb-4">
                    {isNational ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        المكتب الوطني التنفيذي
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                          {official.wilayaId?.toString().padStart(2, '0')}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          ولاية {official.wilayaName}
                        </span>
                        {isNewWilaya && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            مستحدثة
                          </span>
                        )}
                      </div>
                    )}

                    {/* Zone Badge */}
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      {official.zone === 'national' && 'مركزي'}
                      {official.zone === 'center' && 'الوسط'}
                      {official.zone === 'east' && 'الشرق'}
                      {official.zone === 'west' && 'الغرب'}
                      {official.zone === 'south' && 'الجنوب'}
                      {official.zone === 'high_plateaus' && 'الهضاب العليا'}
                    </span>
                  </div>

                  {/* Main Details */}
                  <div className="space-y-3 mb-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {official.fullName}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                        {official.roleTitle}
                      </p>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{official.officeAddress}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-700 font-medium">{official.receptionDays}</span>
                      </div>

                      {official.notes && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                          {official.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${official.phone.replace(/[^0-9]/g, '')}`}
                        className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                        title="اتصال مباشر"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-mono">{official.phone.split('/')[0].trim()}</span>
                      </a>

                      <a
                        href={`mailto:${official.email}?subject=استفسار نقابي - ${encodeURIComponent(official.roleTitle)}`}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                        title="مراسلة بريدية"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-600" />
                        <span>مراسلة</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAppointment(official)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>طلب مقابلة نقابية</span>
                      </button>

                      {official.wilayaId && (
                        <button
                          onClick={() => onNavigate('complaints-new', { wilayaId: official.wilayaId })}
                          className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title="تقديم شكوى إدارية لهذا المكتب الولائي"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          <span>شكوى</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Request Modal */}
      {selectedOfficialForAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-800">
                <Calendar className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  طلب موعد مقابلة نقابية
                </h3>
              </div>
              <button
                onClick={() => setSelectedOfficialForAppointment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Official Banner */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {selectedOfficialForAppointment.wilayaId ? selectedOfficialForAppointment.wilayaId : 'SATE'}
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedOfficialForAppointment.fullName}
                </div>
                <div className="text-emerald-800 font-semibold">
                  {selectedOfficialForAppointment.roleTitle}
                </div>
                <div className="text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-700" />
                  <span>الاستقبال: {selectedOfficialForAppointment.receptionDays}</span>
                </div>
              </div>
            </div>

            {appointmentSuccess ? (
              <div className="bg-emerald-50 rounded-2xl p-6 text-center space-y-3 border border-emerald-300">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-950">
                  تم تسجيل طلب الموعد بنجاح!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                  تم إرسال إشعار لمكتب <strong>{selectedOfficialForAppointment.roleTitle}</strong>، وسيتم التواصل معك هاتفياً على الرقم ({appointmentPhone}) لتأكيد موعد الاستقبال في مقر المكتب النقابي.
                </p>
                <button
                  onClick={() => setSelectedOfficialForAppointment(null)}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAppointment} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    الاسم واللقب للموظف <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={appointmentName}
                    onChange={(e) => setAppointmentName(e.target.value)}
                    placeholder="مثال: أحمد بن علي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      رقم الهاتف للتواصل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={appointmentPhone}
                      onChange={(e) => setAppointmentPhone(e.target.value)}
                      placeholder="05 / 06 / 07..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      الرتبة المهنية الحالية
                    </label>
                    <input
                      type="text"
                      value={appointmentRank}
                      onChange={(e) => setAppointmentRank(e.target.value)}
                      placeholder="مثال: أستاذ التعليم المتوسط"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    التاريخ المقترح للاستقبال
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    موضوع المقابلة أو الاستشارة النقابية <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={appointmentSubject}
                    onChange={(e) => setAppointmentSubject(e.target.value)}
                    placeholder="بيان موجز للموضوع (استفسار ترقية، نزاع إداري، سكن وظيفي، حركة تنقل...)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    تلتزم النقابة بالسرية التامة لجميع البيانات وفق القانون 18-07 لحماية المعطيات الشخصية. المقابلات تتم داخل المقرات الرسمية للنقابة.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOfficialForAppointment(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    تأكيد إرسال الطلب
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
