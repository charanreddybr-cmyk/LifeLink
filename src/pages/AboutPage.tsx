import React from 'react';
import { Droplet, Heart, Shield, Award, MapPin } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface AboutPageProps {
  onRegisterDonor: () => void;
  onRequestEmergency: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onRegisterDonor,
  onRequestEmergency,
}) => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-brand-600" />
            <span>Our Mission & Vision</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight">
            Building India's Most Trusted Emergency Blood Lifeline
          </h1>
          <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed">
            LifeLink was conceived to solve the critical gap between emergency blood requisitions and willing local donors. Starting in Bengaluru, Karnataka, our vision is a connected, responsive healthcare network where no patient suffers for lack of immediate blood units.
          </p>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card bordered hoverable padded>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 mb-4">
              <Droplet className="w-6 h-6 fill-brand-600 text-brand-600" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-2">Every Drop Counts</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              In trauma care, maternal emergencies, and cancer chemotherapy, timeliness is survival. LifeLink reduces mobilization time from anxious hours to responsive minutes.
            </p>
          </Card>

          <Card bordered hoverable padded>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-2">Uncompromising Privacy</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              We never expose donor phone numbers or exact home addresses to public crawlers. All data practices align with India's Digital Personal Data Protection (DPDP) Act.
            </p>
          </Card>

          <Card bordered hoverable padded>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-4">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-2">100% Non-Commercial</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Blood is a gift of life, not a commodity. We maintain strict zero-tolerance policies against blood trading, touting, or fraudulent monetization.
            </p>
          </Card>
        </div>

        {/* Expansion Roadmap */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft-sm space-y-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-brand-700" />
            <div>
              <h2 className="text-xl font-bold text-charcoal-900">Regional Expansion Strategy</h2>
              <p className="text-xs text-charcoal-500">Phased rollout across South India</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200">
              <span className="text-xs font-bold uppercase text-brand-700 block mb-1">Phase 1 (Active)</span>
              <h4 className="font-bold text-charcoal-900 text-base">Bengaluru Metropolitan</h4>
              <p className="text-xs text-charcoal-600 mt-1">18+ zones, major hospital centres, 24/7 emergency matching.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase text-charcoal-500 block mb-1">Phase 2</span>
              <h4 className="font-bold text-charcoal-900 text-base">Karnataka Tier-1 Hubs</h4>
              <p className="text-xs text-charcoal-600 mt-1">Mysuru, Mangaluru, Hubballi-Dharwad, Belagavi, and Kalaburagi.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold uppercase text-charcoal-500 block mb-1">Phase 3</span>
              <h4 className="font-bold text-charcoal-900 text-base">Pan-India Integration</h4>
              <p className="text-xs text-charcoal-600 mt-1">Inter-state rare blood groups registry (Bombay phenotype, Rh-null) and nationwide blood bank API bridges.</p>
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-3xl bg-charcoal-900 text-white p-8 sm:p-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to be Someone's Lifeline in Bengaluru?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Takes less than 60 seconds to register. You only get alerted when a patient within your locality urgently requires your blood group.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="emergency" size="lg" onClick={onRequestEmergency}>
              Request Emergency Blood
            </Button>
            <Button variant="outline" size="lg" onClick={onRegisterDonor} className="text-white border-slate-600 hover:bg-white/10 hover:border-white">
              Join as Volunteer Donor
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
