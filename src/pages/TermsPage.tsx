import React from 'react';
import { FileText, AlertTriangle, Scale, ShieldAlert } from 'lucide-react';
import { Card } from '../components/common/Card';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-charcoal-800 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            Terms of Use & Service Agreement
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Applicable to all Donors, Emergency Requesters, and Medical Coordinators on LifeLink.
          </p>
        </div>

        <Card bordered padded className="space-y-6 text-sm text-charcoal-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-700" />
              1. Platform Nature & Medical Disclaimer
            </h2>
            <p>
              LifeLink is a technological communications bridge. LifeLink is not a blood bank, medical clinic, hospital, or diagnostic laboratory. We do not collect, store, test, or transfuse human blood. <strong>All medical determinations, including blood group confirmation, donor hemoglobin testing, infectious disease serology, and crossmatch compatibility, are the sole legal responsibility of the licensed blood centre and attending physicians.</strong>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. Absolute Prohibition on Financial Compensation
            </h2>
            <p>
              Under the Drugs & Cosmetics Act, 1940 and Supreme Court of India directives, commercial trade in human blood is a non-bailable criminal offense. Any user requesting, offering, demanding, or receiving money or gifts in exchange for blood donation will face immediate termination of their account and formal referral to law enforcement agencies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-700" />
              3. Accuracy of Emergency Requisitions
            </h2>
            <p>
              Emergency requesters affirm that all requisition information (patient identity, hospital name, units required, priority) represents a bona fide medical need authorized by treating medical personnel. Submitting prank, fraudulent, or commercial requisition tickets is punishable under cybercrime laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-700" />
              4. Limitation of Liability
            </h2>
            <p>
              LifeLink shall not be held liable for delayed donor responses, donor non-attendance, adverse transfusion reactions, clinical malpractice, or hospital administrative outcomes. Donors participate on a voluntary, good-faith civic basis.
            </p>
          </section>
        </Card>

      </div>
    </div>
  );
};
