/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  Plus,
  Save,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Map,
  Sparkles
} from 'lucide-react';
import { UnionOfficial, User } from '../types';
import { ALGERIA_WILAYAS } from '../data/algeriaData';

interface EditOfficialModalProps {
  isOpen: boolean;
  onClose: () => void;
  official: UnionOfficial | null; // null for creating new
  currentUser?: User | null;
  onSave: (savedOfficial: UnionOfficial, isNew: boolean) => void;
  onDelete?: (officialId: string) => void;
}

export const EditOfficialModal: React.FC<EditOfficialModalProps> = ({
  isOpen,
  onClose,
  official,
  currentUser,
  onSave,
  onDelete
}) => {
  const isEditing = !!official;

  // Form State
  const [fullName, setFullName] = useState('');
  const [roleType, setRoleType] = useState<'national_bureau' | 'wilaya_president' | 'wilaya_coordinator'>('wilaya_president');
  const [roleTitle, setRoleTitle] = useState('');
  const [wilayaId, setWilayaId] = useState<number | undefined>(16);
  const [zone, setZone] = useState<'national' | 'center' | 'east' | 'west' | 'south' | 'high_plateaus'>('center');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [receptionDays, setReceptionDays] = useState('');
  const [isAvailableForAppointment, setIsAvailableForAppointment] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  // UI State
  const [validationError, setValidationError] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Sync form state when official changes or modal opens
  useEffect(() => {
    if (official) {
      setFullName(official.fullName || '');
      setRoleType(official.roleType || 'wilaya_president');
      setRoleTitle(official.roleTitle || '');
      setWilayaId(official.wilayaId);
      setZone(official.zone || 'center');
      setPhone(official.phone || '');
      setEmail(official.email || '');
      setOfficeAddress(official.officeAddress || '');
      setReceptionDays(official.receptionDays || 'الإثنين والأربعاء (09:00 - 15:00)');
      setIsAvailableForAppointment(official.isAvailableForAppointment ?? true);
      setIsActive(official.isActive ?? true);
      setNotes(official.notes || '');
    } else {
      // New official default
      setFullName('');
      setRoleType('wilaya_president');
      setRoleTitle('رئيس المكتب الولائي');
      setWilayaId(16);
      setZone('center');
      setPhone('0550 00 00 00');
      setEmail('bureau16@sate-dz.org');
      setOfficeAddress('مقر المكتب الولائي للنقابة');
      setReceptionDays('الإثنين والأربعاء (09:00 - 15:00)');
      setIsAvailableForAppointment(true);
      setIsActive(true);
      setNotes('');
    }
    setValidationError('');
    setIsConfirmingDelete(false);
  }, [official, isOpen]);

  // Handle wilaya selection change
  const handleWilayaChange = (id: number) => {
    setWilayaId(id);
    const selected = ALGERIA_WILAYAS.find(w => w.id === id);
    if (selected) {
      // Set default zone based on wilaya code/zone logic
      if (id >= 48 && id <= 58) {
        setZone('south');
      } else if (id >= 59) {
        setZone('high_plateaus');
      } else if ([16, 9, 35, 42, 26, 15, 10].includes(id)) {
        setZone('center');
      } else if ([31, 13, 27, 29, 22, 20].includes(id)) {
        setZone('west');
      } else if ([25, 23, 21, 4, 5, 6, 7, 12, 19, 41].includes(id)) {
        setZone('east');
      }
    }
  };

  const handleRoleTypeChange = (type: 'national_bureau' | 'wilaya_president' | 'wilaya_coordinator') => {
    setRoleType(type);
    if (type === 'national_bureau') {
      setWilayaId(undefined);
      setZone('national');
      if (roleTitle === 'رئيس المكتب الولائي' || roleTitle === 'المنسق الولائي') {
        setRoleTitle('عضو المكتب الوطني التنفيذي');
      }
    } else {
      if (!wilayaId) setWilayaId(16);
      if (zone === 'national') setZone('center');
      if (type === 'wilaya_president' && (roleTitle === 'عضو المكتب الوطني التنفيذي' || roleTitle === 'المنسق الولائي')) {
        setRoleTitle('رئيس المكتب الولائي');
      } else if (type === 'wilaya_coordinator' && (roleTitle === 'عضو المكتب الوطني التنفيذي' || roleTitle === 'رئيس المكتب الولائي')) {
        setRoleTitle('المنسق الولائي');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError('يرجى إدخال الاسم الكامل للمسؤول النقابي');
      return;
    }

    if (!roleTitle.trim()) {
      setValidationError('يرجى تحديد الصفة أو المنصب النقابي');
      return;
    }

    if (roleType !== 'national_bureau' && !wilayaId) {
      setValidationError('يرجى تحديد الولاية (من 1 إلى 69)');
      return;
    }

    if (!phone.trim()) {
      setValidationError('يرجى إدخال رقم الهاتف للتواصل النقابي');
      return;
    }

    let wilayaName = '';
    if (roleType !== 'national_bureau' && wilayaId) {
      const found = ALGERIA_WILAYAS.find(w => w.id === wilayaId);
      wilayaName = found ? found.nameAr : '';
    }

    const saved: UnionOfficial = {
      id: official ? official.id : `off_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fullName: fullName.trim(),
      roleType,
      roleTitle: roleTitle.trim(),
      wilayaId: roleType === 'national_bureau' ? undefined : wilayaId,
      wilayaName: roleType === 'national_bureau' ? undefined : wilayaName,
      zone,
      phone: phone.trim(),
      email: email.trim() || 'contact@sate-dz.org',
      officeAddress: officeAddress.trim() || 'المقر النقابي المعتمد',
      receptionDays: receptionDays.trim() || 'الإثنين والأربعاء (09:00 - 15:00)',
      isAvailableForAppointment,
      isActive,
      notes: notes.trim() || undefined
    };

    onSave(saved, !isEditing);
    onClose();
  };

  const handleDelete = () => {
    if (official && onDelete) {
      onDelete(official.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              {isEditing ? <Pencil className="w-5 h-5 text-emerald-700" /> : <Plus className="w-5 h-5 text-emerald-700" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {isEditing ? 'تعديل معلومات المسؤول والمكتب النقابي' : 'إضافة مسؤول نقابي / مكتب ولائي جديد'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                النقابة الجزائريّة لعمال التربية (SATE) — إدارة دليل الـ 69 ولاية والمكتب الوطني
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          
          {/* Role Structure Type Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">نوع الهيكل النقابي</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleTypeChange('wilaya_president')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  roleType === 'wilaya_president'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>رئيس مكتب ولائي</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTypeChange('wilaya_coordinator')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  roleType === 'wilaya_coordinator'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>منسق ولائي</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTypeChange('national_bureau')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  roleType === 'national_bureau'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>عضو المكتب الوطني</span>
              </button>
            </div>
          </div>

          {/* Full Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                الاسم واللقب الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="مثال: ذ. عبد الكريم بن علي"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                الصفة / المسمى النقابي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="مثال: رئيس المكتب الولائي، الأمين العام..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Quick Title Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-slate-400 font-medium">مقترحات شائعة:</span>
            {roleType === 'national_bureau' ? (
              ['الأمين العام الوطني', 'الأمين الوطني للتنظيم والتنسيق', 'الأمين الوطني للإعلام والاتصال', 'الأمين الوطني للمنازعات والشؤون القانونية'].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setRoleTitle(t)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer border border-slate-200"
                >
                  {t}
                </button>
              ))
            ) : (
              ['رئيس المكتب الولائي', 'المنسق الولائي', 'نائب رئيس المكتب الولائي', 'مسؤول التنظيم والمنازعات الولائي'].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setRoleTitle(t)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer border border-slate-200"
                >
                  {t}
                </button>
              ))
            )}
          </div>

          {/* Wilaya Selection (For Wilaya level) and Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roleType !== 'national_bureau' ? (
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  الولاية التابعة (التقسيم 69 ولاية) <span className="text-red-500">*</span>
                </label>
                <select
                  value={wilayaId || 16}
                  onChange={e => handleWilayaChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                >
                  {ALGERIA_WILAYAS.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.id.toString().padStart(2, '0')} - {w.nameAr} {w.id >= 59 ? '(مستحدثة)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">نطاق الاختصاص</label>
                <input
                  type="text"
                  disabled
                  value="المقر الوطني المركزي (الجزائر العاصمة)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm cursor-not-allowed"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">المنطقة الجغرافية للتنسيق</label>
              <select
                value={zone}
                onChange={e => setZone(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="national">مركزي (مستوى وطني)</option>
                <option value="center">منطقة الوسط</option>
                <option value="east">منطقة الشرق</option>
                <option value="west">منطقة الغرب</option>
                <option value="high_plateaus">الهضاب العليا والولايات الجديدة</option>
                <option value="south">منطقة الجنوب الكبير</option>
              </select>
            </div>
          </div>

          {/* Contact: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                رقم الهاتف المباشر <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0550 12 34 56"
                  className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">البريد الإلكتروني المعتمد</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="bureau@sate-dz.org"
                  className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Office Address */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">عنوان مقر المكتب النقابي</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              <input
                type="text"
                value={officeAddress}
                onChange={e => setOfficeAddress(e.target.value)}
                placeholder="مثال: دار النقابات، شارع 1 نوفمبر، عاصمة الولاية"
                className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Reception Days & Hours */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">أيام ومواقيت الاستقبال النقابي</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={receptionDays}
                onChange={e => setReceptionDays(e.target.value)}
                placeholder="مثال: الإثنين والأربعاء (09:00 - 15:00)"
                className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'الإثنين والأربعاء (09:00 - 15:00)',
                'الأحد والثلاثاء (09:00 - 14:00)',
                'السبت والأربعاء (10:00 - 16:00)',
                'كامل أيام الأسبوع عدا الجمعة والسبت'
              ].map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setReceptionDays(opt)}
                  className="px-2 py-0.5 text-[10px] sm:text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailableForAppointment}
                onChange={e => setIsAvailableForAppointment(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs">حجز المقابلات متاح</span>
                <span className="text-[11px] text-slate-500">تمكين المنخرطين من حجز موعد رقمي</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <div>
                <span className="font-bold text-slate-800 block text-xs">حالة النشاط: نشط</span>
                <span className="text-[11px] text-slate-500">يظهر رسمياً في الدليل الوطني</span>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">ملاحظات أو توجيهات خاصة (اختياري)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: يرجى التنسيق المسبق مع أمانة المكتب في حالة الملفات الجماعية..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
            />
          </div>

          {/* Law 18-07 Audit Banner */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">سجل التدقيق الإداري (القانون 18-07):</span> سيتم تسجيل هذه العملية باسم المستخدم الحالي{' '}
              <span className="font-mono font-bold text-amber-950">
                ({currentUser ? currentUser.fullName : 'مسؤول النظام'})
              </span>{' '}
              لضمان سلامة وموثوقية الدليل النقابي.
            </div>
          </div>

          {/* Danger Zone: Delete Option */}
          {isEditing && onDelete && (
            <div className="pt-3 border-t border-slate-100">
              {isConfirmingDelete ? (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>تأكيد الحذف: هل أنت متأكد من رغبتك في إزالة هذا المسؤول من الدليل؟</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      تراجع
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer shadow-xs"
                    >
                      نعم، تأكيد الحذف
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف هذا المسؤول من الدليل الرسمي</span>
                </button>
              )}
            </div>
          )}

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs sm:text-sm hover:bg-emerald-900 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة المسؤول الآن'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
