import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  AlertCircle, 
  UserCheck, 
  CheckCircle, 
  X, 
  Phone,
  ExternalLink 
} from 'lucide-react';
import { Badge } from './Badge';

interface RealtimeToastContainerProps {
  onOpenRequest?: (requestId: string) => void;
}

export const RealtimeToastContainer: React.FC<RealtimeToastContainerProps> = ({ onOpenRequest }) => {
  const { notifications, dismissNotification } = useRealtime();

  // Show top 3 unread/recent notifications as floating toasts
  const activeToasts = notifications.slice(0, 3);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[2000] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => {
        const isEmergency = toast.type === 'EMERGENCY_REQUISITION';
        const isDonorAccepted = toast.type === 'DONOR_ACCEPTED';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-soft-xl transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${
              isEmergency
                ? 'bg-white border-red-300 ring-2 ring-red-100 text-charcoal-900'
                : isDonorAccepted
                ? 'bg-white border-emerald-300 ring-2 ring-emerald-100 text-charcoal-900'
                : 'bg-white border-slate-200 text-charcoal-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {isEmergency ? (
                  <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white shrink-0">
                    <span className="absolute w-full h-full rounded-full bg-red-500 animate-ping opacity-60" />
                    <AlertCircle className="w-4 h-4 relative" />
                  </div>
                ) : isDonorAccepted ? (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                      LIVE REALTIME
                    </span>
                    {toast.bloodGroup && <Badge bloodGroup={toast.bloodGroup} size="sm" />}
                  </div>
                  <h4 className="font-bold text-xs text-charcoal-900 leading-tight mt-0.5">
                    {toast.title}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissNotification(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
              {toast.message}
            </p>

            {/* Contextual actions */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-charcoal-400">
                {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div className="flex items-center gap-2">
                {isDonorAccepted && toast.donorPhone && (
                  <a
                    href={`tel:${toast.donorPhone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Donor</span>
                  </a>
                )}

                {isEmergency && toast.requestId && onOpenRequest && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenRequest(toast.requestId!);
                      dismissNotification(toast.id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-[11px] shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Requisition</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
