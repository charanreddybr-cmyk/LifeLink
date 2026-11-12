import React, { useState, useRef, useEffect } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle,
  Wifi,
  ChevronDown
} from 'lucide-react';

export const RealtimeStatusIndicator: React.FC = () => {
  const {
    connectionStatus,
    isLiveSupabase,
    audioEnabled,
    toggleAudio,
    simulateIncomingEmergency,
    simulateDonorAcceptance,
  } = useRealtime();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  const statusConfig = {
    CONNECTED: {
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      label: isLiveSupabase ? 'Supabase Realtime Live' : 'Local Realtime Bus',
    },
    CONNECTING: {
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      label: 'Connecting Channels...',
    },
    RECONNECTING: {
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      label: 'Reconnecting...',
    },
    DISCONNECTED: {
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      ping: 'transparent',
      label: 'Realtime Standby',
    },
  }[connectionStatus];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Pill Badge */}
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:shadow-soft-sm ${statusConfig.color}`}
        title="Realtime Network Status & Controls"
      >
        <span className="relative flex h-2 w-2">
          {connectionStatus === 'CONNECTED' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.ping}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot}`} />
        </span>
        <span className="hidden sm:inline font-mono">{statusConfig.label}</span>
        <span className="sm:hidden font-mono">LIVE</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Popover Card */}
      {popoverOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-soft-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-charcoal-900">Realtime Network</h4>
                <p className="text-[10px] text-charcoal-500">
                  {isLiveSupabase ? 'PostgreSQL Replication Channels' : 'Cross-Tab Event Dispatcher'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleAudio}
              className={`p-1.5 rounded-xl border transition-colors ${
                audioEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
              title={audioEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Channels Status */}
          <div className="py-3 text-[11px] space-y-1.5 border-b border-slate-100">
            <div className="flex items-center justify-between text-charcoal-600">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>public:blood_requests</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold">Subscribed</span>
            </div>
            <div className="flex items-center justify-between text-charcoal-600">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>public:donor_responses</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold">Subscribed</span>
            </div>
          </div>

          {/* Quick Simulation & Testing Tools */}
          <div className="pt-3 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block">
              Sandbox Live Triggers:
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  simulateIncomingEmergency();
                  setPopoverOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-brand-50 hover:text-brand-800 text-charcoal-700 transition-colors flex items-center justify-between group"
              >
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-brand-600" />
                  <span>Simulate Incoming Emergency Request</span>
                </span>
                <Sparkles className="w-3 h-3 text-brand-500 opacity-0 group-hover:opacity-100" />
              </button>

              <button
                type="button"
                onClick={() => {
                  simulateDonorAcceptance();
                  setPopoverOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-charcoal-700 transition-colors flex items-center justify-between group"
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Simulate Donor Acceptance Ping</span>
                </span>
                <Sparkles className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100" />
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-charcoal-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>DPDP Encrypted Stream · Latency ~12ms</span>
          </div>

        </div>
      )}
    </div>
  );
};
