/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { MembershipForm } from './components/MembershipForm';
import { MembershipTracking } from './components/MembershipTracking';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTracking } from './components/ComplaintTracking';
import { FaqView } from './components/FaqView';
import { PrivacyView } from './components/PrivacyView';
import { PrivacyModal } from './components/PrivacyModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { CustomizableDashboard } from './components/admin/CustomizableDashboard';
import { MembershipAdmin } from './components/admin/MembershipAdmin';
import { ComplaintsAdmin } from './components/admin/ComplaintsAdmin';
import { SettingsAdmin } from './components/admin/SettingsAdmin';
import { AuditLogAdmin } from './components/admin/AuditLogAdmin';
import { UnionDirectoryView } from './components/UnionDirectoryView';

import { 
  UnionConfig, 
  ProfessionalRank, 
  ComplaintCategory, 
  EducationalInstitution, 
  MembershipApplication, 
  Complaint, 
  AuditLog, 
  User,
  UnionOfficial
} from './types';
import { ALGERIA_WILAYAS } from './data/algeriaData';
import { AppStorage, SYSTEM_USERS } from './utils/storage';

export default function App() {
  // Navigation tabs: home, membership-new, membership-track, complaints-new, complaints-track, directory, faq, privacy, admin
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && !tabParam.startsWith('admin')) {
        return tabParam;
      }
      if (tabParam?.startsWith('admin')) {
        return 'admin';
      }
    }
    return 'home';
  });
  const [currentAdminTab, setCurrentAdminTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && tabParam.startsWith('admin') && tabParam !== 'admin') {
        return tabParam;
      }
    }
    return 'admin-dashboard';
  });

  // App Data
  const [config, setConfig] = useState<UnionConfig>(AppStorage.getConfig());
  const [ranks, setRanks] = useState<ProfessionalRank[]>(AppStorage.getRanks());
  const [categories, setCategories] = useState<ComplaintCategory[]>(AppStorage.getCategories());
  const [institutions, setInstitutions] = useState<EducationalInstitution[]>(AppStorage.getInstitutions());
  const [memberships, setMemberships] = useState<MembershipApplication[]>(AppStorage.getMemberships());
  const [complaints, setComplaints] = useState<Complaint[]>(AppStorage.getComplaints());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(AppStorage.getAuditLogs());
  const [currentUser, setCurrentUser] = useState<User | null>(AppStorage.getCurrentUser());
  const [officials, setOfficials] = useState<UnionOfficial[]>(AppStorage.getOfficials());

  // Modals
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);

  // Check query params on mount (e.g. ?tab=admin or ?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      if (tabParam.startsWith('admin')) {
        // If user not logged in, auto log in as default admin for convenience if requested
        if (!currentUser) {
          AppStorage.setCurrentUser(SYSTEM_USERS[0]);
          setCurrentUser(SYSTEM_USERS[0]);
        }
        setCurrentTab('admin');
        if (tabParam !== 'admin') {
          setCurrentAdminTab(tabParam);
        }
      } else {
        setCurrentTab(tabParam);
      }
    }
  }, []);

  const refreshAllData = () => {
    setConfig(AppStorage.getConfig());
    setRanks(AppStorage.getRanks());
    setCategories(AppStorage.getCategories());
    setInstitutions(AppStorage.getInstitutions());
    setMemberships(AppStorage.getMemberships());
    setComplaints(AppStorage.getComplaints());
    setAuditLogs(AppStorage.getAuditLogs());
    setOfficials(AppStorage.getOfficials());
  };

  const handleSelectTab = (tab: string) => {
    if (tab.startsWith('admin')) {
      if (!currentUser) {
        setAdminLoginModalOpen(true);
        return;
      }
      setCurrentTab('admin');
      if (tab !== 'admin') {
        setCurrentAdminTab(tab);
      }
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CSV Export functions respecting Algerian Law 18-07 data minimization
  const handleExportMembershipsCSV = () => {
    const headers = ['الرقم المرجعي', 'الاسم', 'اللقب', 'الرتبة', 'المؤسسة', 'الولاية', 'البلدية', 'رقم NIN (مقنع)', 'رقم الضمان (مقنع)', 'الحالة', 'تاريخ الإيداع'];
    const rows = memberships.map(m => [
      m.referenceNumber,
      m.firstName,
      m.lastName,
      m.rankTitle,
      `"${m.institutionName.replace(/"/g, '""')}"`,
      m.wilayaName,
      m.communeName,
      m.maskedNin,
      m.maskedNss,
      m.status,
      new Date(m.submissionDate).toLocaleDateString('ar-DZ')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `memberships_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    AppStorage.logAudit({
      actorName: currentUser ? currentUser.fullName : 'مسؤول النظام',
      actorRole: currentUser ? currentUser.role : 'مفوض التصدير',
      action: 'تصدير بيانات المنخرطين (CSV)',
      entityType: 'export',
      entityId: 'MEMB-EXPORT',
      details: `تم تصدير ${memberships.length} سجلاً بصيغة CSV مقنعة للبيانات الحساسة`,
      severity: 'warning'
    });
    refreshAllData();
  };

  const handleExportComplaintsCSV = () => {
    const headers = ['الرقم المرجعي', 'التصنيف', 'الموضوع', 'الولاية', 'المؤسسة', 'السرية', 'الحالة', 'تاريخ الإيداع', 'عدد الردود الرسمية'];
    const rows = complaints.map(c => [
      c.referenceNumber,
      `"${c.categoryTitle.replace(/"/g, '""')}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      c.wilayaName,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      c.isConfidential ? 'نعم (سري)' : 'عادي',
      c.status,
      new Date(c.submissionDate).toLocaleDateString('ar-DZ'),
      c.officialResponses?.length || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    AppStorage.logAudit({
      actorName: currentUser ? currentUser.fullName : 'مسؤول النظام',
      actorRole: currentUser ? currentUser.role : 'مفوض التصدير',
      action: 'تصدير إحصائيات الشكاوى (CSV)',
      entityType: 'export',
      entityId: 'COMP-EXPORT',
      details: `تم تصدير ${complaints.length} شكوى بصيغة إحصائية مجهلة`,
      severity: 'info'
    });
    refreshAllData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Universal Institutional Navigation */}
      <Navbar
        config={config}
        currentTab={currentTab === 'admin' ? currentAdminTab : currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* VIEW 1: HOME */}
        {currentTab === 'home' && (
          <HomeView
            config={config}
            onNavigate={handleSelectTab}
            memberships={memberships}
            complaints={complaints}
            onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
          />
        )}

        {/* VIEW 2: MEMBERSHIP APPLICATION FORM */}
        {currentTab === 'membership-new' && (
          <MembershipForm
            ranks={ranks}
            institutions={institutions}
            wilayas={ALGERIA_WILAYAS}
            config={config}
            onSuccess={() => refreshAllData()}
            onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
          />
        )}

        {/* VIEW 3: MEMBERSHIP TRACKING */}
        {currentTab === 'membership-track' && (
          <MembershipTracking
            config={config}
            onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
          />
        )}

        {/* VIEW 4: COMPLAINT SUBMISSION FORM */}
        {currentTab === 'complaints-new' && (
          <ComplaintForm
            categories={categories}
            ranks={ranks}
            wilayas={ALGERIA_WILAYAS}
            config={config}
            onSuccess={() => refreshAllData()}
            onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
          />
        )}

        {/* VIEW 5: COMPLAINT TRACKING */}
        {currentTab === 'complaints-track' && (
          <ComplaintTracking
            config={config}
            onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
          />
        )}

        {/* VIEW 6: FAQ & USER GUIDELINES */}
        {currentTab === 'faq' && (
          <FaqView
            config={config}
            onNavigate={handleSelectTab}
          />
        )}

        {/* VIEW 7: UNION OFFICIALS & 69 WILAYAS DIRECTORY */}
        {currentTab === 'directory' && (
          <UnionDirectoryView
            officials={officials}
            config={config}
            onNavigate={handleSelectTab}
          />
        )}

        {/* VIEW 8: PRIVACY LAW 18-07 */}
        {currentTab === 'privacy' && (
          <PrivacyView config={config} />
        )}

        {/* VIEW 8: ADMIN & STAFF WORKSPACE */}
        {currentTab === 'admin' && currentUser && (
          <AdminLayout
            currentUser={currentUser}
            config={config}
            currentAdminTab={currentAdminTab}
            onSelectAdminTab={setCurrentAdminTab}
            onSwitchUser={user => {
              AppStorage.setCurrentUser(user);
              setCurrentUser(user);
            }}
            onLogout={() => {
              AppStorage.setCurrentUser(null);
              setCurrentUser(null);
              setCurrentTab('home');
            }}
          >
            {/* Admin Tab 1: Customizable Dashboard (Mandatory User Feature) */}
            {currentAdminTab === 'admin-dashboard' && (
              <CustomizableDashboard
                currentUser={currentUser}
                config={config}
                memberships={memberships}
                complaints={complaints}
                auditLogs={auditLogs}
                onNavigateToTab={tab => setCurrentAdminTab(tab)}
                onExportMembershipsCSV={handleExportMembershipsCSV}
                onExportComplaintsCSV={handleExportComplaintsCSV}
              />
            )}

            {/* Admin Tab 2: Membership Applications Management */}
            {currentAdminTab === 'admin-memberships' && (
              <MembershipAdmin
                currentUser={currentUser}
                memberships={memberships}
                wilayas={ALGERIA_WILAYAS}
                ranks={ranks}
                onRefreshData={refreshAllData}
                onExportCSV={handleExportMembershipsCSV}
              />
            )}

            {/* Admin Tab 3: Complaints Management */}
            {currentAdminTab === 'admin-complaints' && (
              <ComplaintsAdmin
                currentUser={currentUser}
                complaints={complaints}
                categories={categories}
                wilayas={ALGERIA_WILAYAS}
                onRefreshData={refreshAllData}
                onExportCSV={handleExportComplaintsCSV}
              />
            )}

            {/* Admin Tab 4: Union Settings & Configuration */}
            {currentAdminTab === 'admin-settings' && (
              <SettingsAdmin
                currentUser={currentUser}
                config={config}
                ranks={ranks}
                categories={categories}
                institutions={institutions}
                memberships={memberships}
                complaints={complaints}
                auditLogs={auditLogs}
                onRefreshData={refreshAllData}
              />
            )}

            {/* Admin Tab 5: Security & Audit Logs (Law 18-07) */}
            {currentAdminTab === 'admin-audit' && (
              <AuditLogAdmin auditLogs={auditLogs} />
            )}
          </AdminLayout>
        )}

      </div>

      {/* Universal Footer */}
      <Footer
        config={config}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        onSelectTab={handleSelectTab}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        config={config}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLoginSuccess={user => {
          setCurrentUser(user);
          setCurrentTab('admin');
          setCurrentAdminTab('admin-dashboard');
        }}
        config={config}
      />

    </div>
  );
}
