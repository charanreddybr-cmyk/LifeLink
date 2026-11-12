import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, Stethoscope, HeartHandshake } from 'lucide-react';

export const SafetyCharter: React.FC = () => {
  const principles = [
    {
      title: 'Mandatory Clinical Crossmatching',
      icon: <Stethoscope className="w-5 h-5 text-brand-600" />,
      desc: 'LifeLink provides preliminary group matching. Transfusions are strictly contingent upon hospital blood centre crossmatching, antibody screening, and clinical approval.'
    },
    {
      title: 'Digital Personal Data Protection (DPDP)',
      icon: <Lock className="w-5 h-5 text-emerald-600" />,
      desc: 'Donor phone numbers, residential addresses, and exact GPS coordinates are NEVER exposed publicly. Contact relay is authenticated and consent-governed.'
    },
    {
      title: 'Zero Commercialization',
      icon: <HeartHandshake className="w-5 h-5 text-blue-600" />,
      desc: 'In compliance with the Supreme Court of India ruling and Drugs & Cosmetics Act, buying or selling blood is strictly illegal. LifeLink supports 100% voluntary, unpaid donors.'
    },
    {
      title: 'Mandatory Serological Testing',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      desc: 'Every donated unit undergoes mandatory testing for HIV 1 & 2, Hepatitis B, Hepatitis C, Syphilis, and Malaria at the receiving licensed blood centre.'
    }
  ];

  return (
    <section id="safety" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Medical & Legal Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            LifeLink Safety Charter
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
            Our medical safety architecture is built in accordance with the National Blood Transfusion Council (NBTC) and Indian health regulations.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-soft-sm flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-soft-sm">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-charcoal-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prominent Warning Callout */}
        <div className="rounded-3xl bg-amber-50/80 border-2 border-amber-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900">
              Important Guidance for Patients & Families
            </h4>
            <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
              Never pay anyone claiming to be a donor or blood broker. If anyone demands monetary compensation for blood donation, report it immediately to the LifeLink Trust & Safety desk or the nearest police station. LifeLink accounts found demanding payments are permanently banned and reported to law enforcement.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
