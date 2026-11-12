import React, { useState } from 'react';
import { ALL_BLOOD_GROUPS } from '../../types/blood.types';
import type { BloodGroup } from '../../types/blood.types';
import { BLOOD_COMPATIBILITY_GUIDE } from '../../data/bengaluruLocalities';
import { Info, Check, X, Stethoscope } from 'lucide-react';

export const BloodCompatibilityGuide: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<BloodGroup>('O-');

  const currentRule = BLOOD_COMPATIBILITY_GUIDE.find(r => r.group === activeGroup) || BLOOD_COMPATIBILITY_GUIDE[0];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Clinical Reference Guide
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            Preliminary Blood Group Compatibility
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
            Select a blood group to view general red blood cell compatibility. Note that whole blood, packed cells, platelets, and fresh frozen plasma follow distinct protocols.
          </p>
        </div>

        {/* Interactive Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {ALL_BLOOD_GROUPS.map((grp) => {
            const isSelected = activeGroup === grp;
            return (
              <button
                key={grp}
                type="button"
                onClick={() => setActiveGroup(grp)}
                className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all duration-150 border-2 ${
                  isSelected
                    ? 'bg-brand-700 text-white border-brand-800 shadow-soft scale-105'
                    : 'bg-white text-charcoal-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                {grp}
              </button>
            );
          })}
        </div>

        {/* Compatibility Matrix Visual Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white font-black text-2xl flex items-center justify-center shadow-soft">
                {activeGroup}
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal-900">Group {activeGroup} Analysis</h3>
                <p className="text-xs text-charcoal-500">Preliminary ABO & Rh Antigen Mapping</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-charcoal-600 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Hospital crossmatching is mandatory before transfusion.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Can give to */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                Can Give Red Cells To:
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_BLOOD_GROUPS.map((grp) => {
                  const compatible = currentRule.canGiveTo.includes(grp);
                  return (
                    <span
                      key={grp}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        compatible
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                      }`}
                    >
                      {compatible ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {grp}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Can receive from */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                Can Receive Red Cells From:
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_BLOOD_GROUPS.map((grp) => {
                  const compatible = currentRule.canReceiveFrom.includes(grp);
                  return (
                    <span
                      key={grp}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        compatible
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                      }`}
                    >
                      {compatible ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {grp}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Clinical Context:</strong> {currentRule.clinicalNote}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
