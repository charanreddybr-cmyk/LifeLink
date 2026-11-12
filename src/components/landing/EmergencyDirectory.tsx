import React, { useState } from 'react';
import { Phone, MapPin, Search, ShieldCheck } from 'lucide-react';
import { BENGALURU_EMERGENCY_HOSPITALS } from '../../data/bengaluruLocalities';

export const EmergencyDirectory: React.FC = () => {
  const [filterQuery, setFilterQuery] = useState('');

  const hospitals = BENGALURU_EMERGENCY_HOSPITALS.filter(h => 
    h.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.locality.toLowerCase().includes(filterQuery.toLowerCase()) ||
    h.pincode.includes(filterQuery)
  );

  return (
    <section id="hospitals" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Institutional Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            Bengaluru Licensed Blood Centres & Emergency Desks
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
            Direct access to government and major charitable blood transfusion facilities across Bengaluru.
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by hospital name, locality, or PIN code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Licensed Center
                  </span>
                  <span className="text-xs font-semibold text-charcoal-500">
                    PIN {hospital.pincode}
                  </span>
                </div>
                <h3 className="text-base font-bold text-charcoal-900 leading-snug">
                  {hospital.name}
                </h3>
                <p className="text-xs text-charcoal-600 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{hospital.address}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-charcoal-500 font-medium">Hospital Emergency:</span>
                  <a
                    href={`tel:${hospital.emergencyHelpline.replace(/[^0-9]/g, '')}`}
                    className="font-bold text-brand-700 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {hospital.emergencyHelpline}
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-charcoal-500 font-medium">Blood Centre Desk:</span>
                  <a
                    href={`tel:${hospital.bloodBankContact.replace(/[^0-9]/g, '')}`}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {hospital.bloodBankContact}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
