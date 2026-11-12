import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, Hospital } from 'lucide-react';
import { ALL_BLOOD_GROUPS } from '../../types/blood.types';
import type { BloodGroup } from '../../types/blood.types';
import { BENGALURU_LOCALITIES, BENGALURU_EMERGENCY_HOSPITALS } from '../../data/bengaluruLocalities';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface QuickSearchProps {
  onInitiateRequestWithDetails: (bloodGroup: BloodGroup, localityId: string) => void;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  onInitiateRequestWithDetails,
}) => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O+');
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('loc-1');
  const [selectedRadius, setSelectedRadius] = useState<number>(10);

  const currentLocality = BENGALURU_LOCALITIES.find(l => l.id === selectedLocalityId) || BENGALURU_LOCALITIES[0];

  return (
    <section id="find-donors" className="py-16 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            <span>Interactive Donor Discovery & Blood Bank Finder</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            Find Blood Donors by Locality & Group
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
            Select your patient's required blood group and locality in Bengaluru. LifeLink locates registered donors within your search radius and alerts them when an emergency request is officially posted.
          </p>
        </div>

        {/* Discovery Filter Box */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm space-y-6">
          
          {/* 1. Blood Group Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center justify-between">
              <span>Step 1: Select Required Blood Group</span>
              <span className="text-brand-700 font-semibold text-xs normal-case">
                Selected: <strong className="text-brand-800 font-black">{selectedBloodGroup}</strong>
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {ALL_BLOOD_GROUPS.map((group) => {
                const isSelected = selectedBloodGroup === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedBloodGroup(group)}
                    className={`py-3 px-2 rounded-2xl font-black text-base transition-all duration-150 flex flex-col items-center justify-center border-2 ${
                      isSelected
                        ? 'bg-brand-700 text-white border-brand-800 shadow-soft scale-105'
                        : 'bg-white text-charcoal-800 border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
                    }`}
                  >
                    <span>{group}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Locality and Radius Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Locality Selector (7 cols) */}
            <div className="md:col-span-7 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                Step 2: Select Bengaluru Locality or PIN Code
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 pointer-events-none" />
                <select
                  value={selectedLocalityId}
                  onChange={(e) => setSelectedLocalityId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                >
                  {BENGALURU_LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} — PIN {loc.pincode} ({loc.zone} Zone, Bengaluru)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Radius Selector (5 cols) */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center justify-between">
                <span>Step 3: Notification Radius</span>
                <span className="text-brand-700 font-bold">{selectedRadius} km</span>
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 25].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setSelectedRadius(km)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-colors ${
                      selectedRadius === km
                        ? 'bg-charcoal-800 text-white border-charcoal-900'
                        : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Result Summary Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Badge bloodGroup={selectedBloodGroup} size="lg" />
                <span className="text-sm font-bold text-charcoal-900">
                  Target Zone: {currentLocality.name} (PIN {currentLocality.pincode})
                </span>
              </div>
              <p className="text-xs text-charcoal-500">
                Active radius covers {selectedRadius} km across {currentLocality.zone} Bengaluru.
              </p>
            </div>

            <Button
              variant="emergency"
              size="md"
              onClick={() => onInitiateRequestWithDetails(selectedBloodGroup, selectedLocalityId)}
              className="w-full sm:w-auto shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Post Emergency Request for {selectedBloodGroup}
            </Button>
          </div>

        </div>

        {/* Nearby Blood Centres in Bengaluru */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hospital className="w-5 h-5 text-brand-700" />
              <h3 className="text-base font-bold text-charcoal-900">
                Verified Blood Centres Near {currentLocality.name}
              </h3>
            </div>
            <span className="text-xs text-charcoal-500 font-medium">
              Call hospital desks directly for instant cross-matching inventory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BENGALURU_EMERGENCY_HOSPITALS.slice(0, 3).map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm hover:border-brand-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Licensed Blood Centre
                    </span>
                    <span className="text-xs font-semibold text-charcoal-500">{hospital.locality}</span>
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-900 pt-1">{hospital.name}</h4>
                  <p className="text-xs text-charcoal-600 line-clamp-2">{hospital.address}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-semibold text-charcoal-400 uppercase">Emergency Desk</span>
                    <a
                      href={`tel:${hospital.emergencyHelpline.replace(/[^0-9]/g, '')}`}
                      className="text-xs font-bold text-brand-700 hover:underline"
                    >
                      {hospital.emergencyHelpline}
                    </a>
                  </div>
                  <a
                    href={`tel:${hospital.bloodBankContact.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                  >
                    <span>Blood Desk</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
