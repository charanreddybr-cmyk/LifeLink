import React from 'react';
import { Shield, Lock, EyeOff, FileCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital Personal Data Protection (DPDP) Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            Privacy Policy & Data Protection Charter
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Last Updated: November 2026 | Effective for Bengaluru & Karnataka Service Area
          </p>
        </div>

        <Card bordered padded className="space-y-6 text-sm text-charcoal-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-700" />
              1. Our Foundational Privacy Commitment
            </h2>
            <p>
              LifeLink operates on the principle of <strong>Zero Public Exposure</strong>. We recognize that medical and contact details are sensitive personal data. We do not maintain a publicly scrapable directory of blood donors. At no point will your phone number, email address, or exact residential address be published on open web pages or indexed by search engine spiders.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-brand-700" />
              2. Data We Collect & Specific Purpose
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Contact Information:</strong> Legal name, mobile phone number, and email. Used solely to authenticate your account and transmit OTP notifications for verified blood emergencies.</li>
              <li><strong>Medical/Biological Data:</strong> Self-declared ABO and Rh blood group, date of last whole blood donation. Used exclusively by our proximity matching algorithm.</li>
              <li><strong>Geographic Coordinates:</strong> Locality, city, PIN code, and consented approximate coordinates. We store only coarse coordinates (radius privacy circles) to compute matching distance without disclosing your home address.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-700" />
              3. Rights Under the Digital Personal Data Protection Framework
            </h2>
            <p>
              In full alignment with applicable Indian laws, registered users hold the following rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-charcoal-900 block text-xs">Right to Withdraw Consent</span>
                <span className="text-xs text-charcoal-500">Toggle your availability to "Unavailable" at any time with one click.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-charcoal-900 block text-xs">Right to Erasure</span>
                <span className="text-xs text-charcoal-500">Request permanent deletion of your profile, contact logs, and history.</span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-700" />
              4. Third-Party Sharing & Commercialization Prohibition
            </h2>
            <p>
              LifeLink does not sell, lease, or monetize user data with advertisers, insurance brokers, or pharmaceutical marketers. Data is communicated exclusively through authorized communication relays (e.g. transactional SMS/Push gateways) to facilitate genuine blood donations.
            </p>
          </section>

          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-charcoal-600">
            For privacy inquiries, grievance redressal, or data erasure requests, please contact our Data Protection Officer at: <a href="mailto:privacy@lifelink.org.in" className="text-brand-700 font-semibold underline">privacy@lifelink.org.in</a>
          </div>
        </Card>

      </div>
    </div>
  );
};
