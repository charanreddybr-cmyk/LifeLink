import React from 'react';
import { AlertTriangle, PhoneCall, ArrowRight } from 'lucide-react';

interface EmergencyAlertBannerProps {
  onRequestClick: () => void;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({ onRequestClick }) => {
  return (
    <div className="bg-charcoal-900 text-white text-xs sm:text-sm py-2 px-4 border-b border-charcoal-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-semibold text-red-300 uppercase tracking-wider text-[11px] sm:text-xs">
            24/7 Emergency Line
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-200">
            Need urgent blood units in Bengaluru? Verified donor matching in progress.
          </span>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:104"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-xs font-medium"
            title="Karnataka State Health Helpline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Govt Helpline: <strong className="text-white">104</strong></span>
          </a>
          <button
            onClick={onRequestClick}
            className="inline-flex items-center gap-1 bg-brand-700 hover:bg-brand-600 text-white font-bold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-amber-300" />
            <span>Emergency Request</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
