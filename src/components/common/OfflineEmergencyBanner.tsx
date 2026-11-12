import React, { useState, useEffect } from 'react';
import { WifiOff, Phone } from 'lucide-react';
import { BENGALURU_EMERGENCY_HOSPITALS } from '../../data/bengaluruLocalities';

export const OfflineEmergencyBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-charcoal-950 text-white border-b-2 border-brand-600 px-4 py-3 sticky top-0 z-[3000] shadow-soft-xl animate-in slide-in-from-top duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-600/30 text-red-400">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span>Offline Standby Mode Active</span>
              <span className="text-[10px] bg-red-600 px-2 py-0.2 rounded-full uppercase">PWA Cached</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              No internet connection detected. LifeLink has loaded offline blood bank emergency hotlines for immediate phone contact.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* National Blood Helpline */}
          <a
            href="tel:104"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 104 (National Blood Helpline)</span>
          </a>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            {isExpanded ? 'Hide Hospitals' : 'View Blood Banks'}
          </button>
        </div>

      </div>

      {/* Expanded Blood Banks List */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in">
          {BENGALURU_EMERGENCY_HOSPITALS.map((hosp) => (
            <div key={hosp.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">{hosp.name}</span>
                <span className="text-[11px] text-slate-400">{hosp.locality}</span>
              </div>
              <a
                href={`tel:${hosp.emergencyHelpline}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>Call Bank</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
