import React from 'react';
import { FileEdit, ShieldAlert, Radio, HeartHandshake, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Emergency Request Created',
      icon: <FileEdit className="w-6 h-6 text-brand-700" />,
      description: 'The patient attendant or hospital contact enters the required blood group, units, hospital location, and deadline.',
      badge: 'Input & Details'
    },
    {
      step: '02',
      title: 'Verification & Anti-Spam',
      icon: <ShieldAlert className="w-6 h-6 text-amber-600" />,
      description: 'System validates against duplicate submissions and ensures genuine contact authorization before broad donor broadcast.',
      badge: 'Security Gate'
    },
    {
      step: '03',
      title: 'Proximity Match Broadcast',
      icon: <Radio className="w-6 h-6 text-blue-600" />,
      description: 'The backend engine filters willing donors in the target Bengaluru locality radius who have not donated in the past 90 days.',
      badge: 'Real-Time Alert'
    },
    {
      step: '04',
      title: 'Hospital Transfusion Relay',
      icon: <HeartHandshake className="w-6 h-6 text-emerald-600" />,
      description: 'Responding donors report directly to the hospital blood bank. The licensed blood centre carries out official crossmatching.',
      badge: 'Life Saved'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Transparent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            How LifeLink Mobilizes Blood in Minutes
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
            Designed for high-pressure emergency situations, every step is automated, authenticated, and privacy-shielded.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between relative group"
            >
              {/* Step indicator top */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-2xl font-black text-slate-200 group-hover:text-brand-300 transition-colors">
                  {item.step}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-charcoal-600">
                  {item.badge}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-charcoal-900">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Progress arrow */}
              <div className="pt-2 text-[11px] font-semibold text-charcoal-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Standardized Protocol</span>
              </div>
            </div>
          ))}
        </div>

        {/* Medical and Legal Rule Notice */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-base font-bold text-charcoal-900">
              Strict Adherence to National Blood Transfusion Standards
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-3xl leading-relaxed">
              Donors must be aged 18–65, weight ≥ 45 kg, haemoglobin ≥ 12.5 g/dL, and have completed at least 90 days since their last whole blood donation. LifeLink prompts donors with safety pre-checks before they arrive at the hospital blood centre.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
              90 Days Interval Rule
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              100% Voluntary
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
