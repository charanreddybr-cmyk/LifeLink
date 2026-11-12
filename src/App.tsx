import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmergencyAlertBanner } from './components/layout/EmergencyAlertBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { FindDonorsPage } from './pages/FindDonorsPage';
import { SafetyCharter } from './components/landing/SafetyCharter';
import { HowItWorks } from './components/landing/HowItWorks';
import { EmergencyDirectory } from './components/landing/EmergencyDirectory';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { DonorDashboardPage } from './pages/donor/DonorDashboardPage';
import { RequesterDashboardPage } from './pages/requester/RequesterDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { EmergencyRequestModal } from './components/common/EmergencyRequestModal';
import { DonorRegisterModal } from './components/common/DonorRegisterModal';
import { LoginModal } from './components/common/LoginModal';
import type { BloodGroup } from './types/blood.types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [prefillBloodGroup, setPrefillBloodGroup] = useState<BloodGroup | undefined>(undefined);
  const [prefillLocalityId, setPrefillLocalityId] = useState<string | undefined>(undefined);

  const { role, user } = useAuth();

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEmergencyModal = (bloodGroup?: BloodGroup, localityId?: string) => {
    setPrefillBloodGroup(bloodGroup);
    setPrefillLocalityId(localityId);
    setIsEmergencyModalOpen(true);
  };

  const handleOpenDonorModal = () => {
    setIsDonorModalOpen(true);
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    handleNavigate('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-charcoal-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      
      {/* 1. 24/7 Top Emergency Bar */}
      <EmergencyAlertBanner
        onRequestClick={() => handleOpenEmergencyModal()}
      />

      {/* 2. Global Responsive Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onRequestEmergency={() => handleOpenEmergencyModal()}
        onRegisterDonor={handleOpenDonorModal}
        onLogin={handleOpenLoginModal}
      />

      {/* 3. Main Dynamic Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <LandingPage
            onRequestEmergency={handleOpenEmergencyModal}
            onRegisterDonor={handleOpenDonorModal}
          />
        )}

        {currentPage === 'find-donors' && (
          <FindDonorsPage
            onRequestEmergency={handleOpenEmergencyModal}
            onRegisterDonor={handleOpenDonorModal}
          />
        )}

        {currentPage === 'how-it-works' && (
          <div className="py-8 bg-slate-50 min-h-[70vh]">
            <HowItWorks />
          </div>
        )}

        {currentPage === 'safety' && (
          <div className="py-8 bg-white min-h-[70vh]">
            <SafetyCharter />
          </div>
        )}

        {currentPage === 'hospitals' && (
          <div className="py-8 bg-white min-h-[70vh]">
            <EmergencyDirectory />
          </div>
        )}

        {currentPage === 'about' && (
          <AboutPage
            onRequestEmergency={() => handleOpenEmergencyModal()}
            onRegisterDonor={handleOpenDonorModal}
          />
        )}

        {currentPage === 'privacy' && <PrivacyPolicyPage />}
        {currentPage === 'terms' && <TermsPage />}
        {currentPage === 'contact' && <ContactPage />}

        {/* Role-based Dashboard */}
        {currentPage === 'dashboard' && (
          <>
            {(!user || role === 'donor') && <DonorDashboardPage />}
            {user && role === 'requester' && (
              <RequesterDashboardPage onCreateRequest={() => handleOpenEmergencyModal()} />
            )}
            {user && role === 'admin' && <AdminDashboardPage />}
          </>
        )}
      </main>

      {/* 4. Global Responsive Footer */}
      <Footer
        onNavigate={handleNavigate}
        onRequestEmergency={() => handleOpenEmergencyModal()}
        onRegisterDonor={handleOpenDonorModal}
      />

      {/* 5. Modals & Dialogs */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        initialBloodGroup={prefillBloodGroup}
        initialLocalityId={prefillLocalityId}
      />

      <DonorRegisterModal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        onSubmitSuccess={() => handleNavigate('dashboard')}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterDonor={handleOpenDonorModal}
        onRequestEmergency={() => handleOpenEmergencyModal()}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
