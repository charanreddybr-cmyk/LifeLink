import React from 'react';
import { AlertCircle, UserPlus, Shield, Clock, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

interface HeroSectionProps {
  onRequestEmergency: () => void;
  onRegisterDonor: () => void;
  onExploreLocalities: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRequestEmergency,
  onRegisterDonor,
  onExploreLocalities,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-slate-50 to-white pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-red-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -z-10 w-80 h-80 bg-slate-200/50 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-red-200 shadow-soft-sm text-xs font-semibold text-charcoal-800">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              <span className="text-brand-700 font-bold">Bengaluru Launch Edition</span>
              <span className="text-slate-300">|</span>
              <span className="text-charcoal-600">Real-Time Emergency Matching</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-charcoal-900 tracking-tight leading-[1.15]">
              Every Drop Counts. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-red-600">
                Be Someone's Lifeline.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              When seconds matter, LifeLink connects hospital patients with willing, nearby blood donors across Bengaluru in real-time. Transparent, secure, and privacy-first.
            </p>

            {/* Dual Primary Call-to-Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                variant="emergency"
                size="lg"
                onClick={onRequestEmergency}
                className="w-full sm:w-auto px-7 shadow-lg shadow-brand-700/20"
                leftIcon={<AlertCircle className="w-5 h-5 text-white" />}
              >
                Request Emergency Blood
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onRegisterDonor}
                className="w-full sm:w-auto px-7"
                leftIcon={<UserPlus className="w-5 h-5 text-brand-300" />}
              >
                Register as a Donor
              </Button>
            </div>

            {/* Trust and privacy badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-sm">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-charcoal-800">DPDP Data Privacy</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-sm">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="text-xs font-semibold text-charcoal-800">Instant Proximity Alert</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-sm col-span-2 sm:col-span-1">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-charcoal-800">Bengaluru Hub Coverage</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft-lg border border-slate-200/90 relative z-10 space-y-6">
                
                {/* Header status */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
                      <Activity className="w-5 h-5 text-brand-600 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-charcoal-900">LifeLink Live Registry</h3>
                      <p className="text-xs text-charcoal-500">Active Service in Bengaluru</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Operational
                  </span>
                </div>

                {/* Simulated Emergency Request Card Preview */}
                <div className="rounded-2xl bg-gradient-to-br from-red-50/60 to-white p-4 border border-red-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Priority: Urgent Need
                    </span>
                    <span className="text-xs font-semibold text-charcoal-500">Needed in 2 hrs</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-700 text-white font-black text-xl flex items-center justify-center shadow-soft">
                      O-
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal-900">2 Units (Packed Cells)</h4>
                      <p className="text-xs text-charcoal-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        Victoria Hospital, Bengaluru
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-charcoal-600 bg-white/80 rounded-lg p-2 border border-red-100">
                    <strong className="text-charcoal-900">Target Radius:</strong> Indiranagar, Jayanagar, Koramangala & KR Market area donors alerted.
                  </div>
                </div>

                {/* Micro Stats */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="block text-2xl font-black text-charcoal-900">18+</span>
                    <span className="text-xs text-charcoal-600 font-medium">Bengaluru Localities</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="block text-2xl font-black text-brand-700">6+</span>
                    <span className="text-xs text-charcoal-600 font-medium">Major Blood Centres</span>
                  </div>
                </div>

                {/* Quick button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExploreLocalities}
                  className="w-full text-xs font-semibold justify-center"
                >
                  Explore Coverage & Local Blood Banks
                </Button>

              </div>

              {/* Floating aesthetic badge */}
              <div className="absolute -bottom-4 -left-4 bg-charcoal-900 text-white rounded-2xl p-3 shadow-soft-lg z-20 flex items-center gap-3 border border-charcoal-700 hidden sm:flex">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Zero Commercialization</p>
                  <p className="text-[10px] text-slate-400">Voluntary, Non-Remunerated Donors Only</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
