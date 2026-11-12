import React from 'react';
import { Droplet, Shield, Phone, MapPin, AlertOctagon } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onRequestEmergency: () => void;
  onRegisterDonor: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onRequestEmergency,
  onRegisterDonor,
}) => {
  return (
    <footer className="bg-charcoal-900 text-slate-300 pt-16 pb-12 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-700 text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Life<span className="text-brand-500">Link</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every Drop Counts. Be Someone's Lifeline. LifeLink connects verified emergency blood requesters with nearby registered, willing donors across Bengaluru and Karnataka.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-lg p-2.5">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Aligned with Indian DPDP Act. No public exposure of donor phone numbers.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={onRequestEmergency}
                  className="hover:text-red-400 text-red-300 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Post Emergency Request</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onRegisterDonor}
                  className="hover:text-white transition-colors"
                >
                  Register as a Donor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('find-donors')}
                  className="hover:text-white transition-colors"
                >
                  Find Donors (Preview)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety')}
                  className="hover:text-white transition-colors"
                >
                  Medical Safety Charter
                </button>
              </li>
            </ul>
          </div>

          {/* Bengaluru Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400" />
              <span>Emergency Helplines</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="border-l-2 border-brand-500 pl-2.5 py-0.5">
                <span className="block font-semibold text-slate-200">Karnataka State Health:</span>
                <a href="tel:104" className="text-emerald-400 font-bold hover:underline">104 (Toll Free 24/7)</a>
              </div>
              <div className="border-l-2 border-brand-500 pl-2.5 py-0.5">
                <span className="block font-semibold text-slate-200">Victoria Hospital Blood Centre:</span>
                <a href="tel:08026700448" className="text-slate-300 hover:text-white">080-26700448</a>
              </div>
              <div className="border-l-2 border-brand-500 pl-2.5 py-0.5">
                <span className="block font-semibold text-slate-200">Red Cross Blood Bank Bengaluru:</span>
                <a href="tel:08022264205" className="text-slate-300 hover:text-white">080-22264205</a>
              </div>
              <div className="border-l-2 border-brand-500 pl-2.5 py-0.5">
                <span className="block font-semibold text-slate-200">NIMHANS Blood Centre:</span>
                <a href="tel:08026995280" className="text-slate-300 hover:text-white">080-26995280</a>
              </div>
            </div>
          </div>

          {/* Service Area & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Service Area</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Initial operations dedicated to Bengaluru Urban & Rural zones (East, West, North, South, Central). Expanding to Mysuru, Mangaluru, Hubballi-Dharwad, and pan-India.
            </p>
            <div className="pt-2 space-y-1.5 text-xs">
              <div>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Privacy Policy (DPDP Aligned)
                </button>
              </div>
              <div>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </button>
              </div>
              <div>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Medical & Legal Disclaimer Banner */}
        <div className="rounded-2xl bg-charcoal-950 p-4 border border-charcoal-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-red-950/80 text-brand-400 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="font-bold text-slate-200">Mandatory Medical Safety Disclaimer:</span>
            <p className="leading-relaxed">
              LifeLink is a technological communications platform connecting emergency requesters with willing donors. LifeLink does not independently certify donor medical eligibility or cross-match compatibility. All blood collections, serological screenings (HIV, HBV, HCV, Syphilis, Malaria), and transfusions must be executed exclusively by licensed blood centres and qualified medical practitioners in compliance with the Drugs and Cosmetics Act and National Blood Transfusion Council (NBTC) guidelines.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-charcoal-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LifeLink Community Health Platform. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineered with care for emergency patients in Karnataka.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
