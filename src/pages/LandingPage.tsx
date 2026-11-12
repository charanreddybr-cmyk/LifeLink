import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { QuickSearch } from '../components/landing/QuickSearch';
import { HowItWorks } from '../components/landing/HowItWorks';
import { SafetyCharter } from '../components/landing/SafetyCharter';
import { BloodCompatibilityGuide } from '../components/landing/BloodCompatibilityGuide';
import { EmergencyDirectory } from '../components/landing/EmergencyDirectory';
import type { BloodGroup } from '../types/blood.types';

interface LandingPageProps {
  onRequestEmergency: (bloodGroup?: BloodGroup, localityId?: string) => void;
  onRegisterDonor: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRequestEmergency,
  onRegisterDonor,
}) => {
  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection
        onRequestEmergency={() => onRequestEmergency()}
        onRegisterDonor={onRegisterDonor}
        onExploreLocalities={() => handleScrollToSection('find-donors')}
      />

      {/* 2. Interactive Discovery & Quick Search */}
      <QuickSearch
        onInitiateRequestWithDetails={(grp, locId) => onRequestEmergency(grp, locId)}
      />

      {/* 3. How LifeLink Works */}
      <HowItWorks />

      {/* 4. Safety & DPDP Charter */}
      <SafetyCharter />

      {/* 5. Preliminary Blood Group Compatibility Guide */}
      <BloodCompatibilityGuide />

      {/* 6. Bengaluru Emergency Blood Banks Directory */}
      <EmergencyDirectory />
    </div>
  );
};
