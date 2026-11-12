import React, { useState, useRef, useEffect } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  UserCheck, 
  CheckCircle, 
} from 'lucide-react';
import { Badge } from './Badge';

export const NotificationsDrawer: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAllNotifications, 
    dismissNotification 
  } = useRealtime();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="relative p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100 transition-colors focus:outline-none"
        title="Emergency Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-soft-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-charcoal-900">Notifications</h3>
              {notifications.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-charcoal-700">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {notifications.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    title="Mark all read"
                    className="p-1 rounded text-charcoal-500 hover:text-charcoal-800 hover:bg-slate-100"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    title="Clear all"
                    className="p-1 rounded text-charcoal-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2 -mx-2 px-2">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const isEmergency = notif.type === 'EMERGENCY_REQUISITION';
                const isDonorAccepted = notif.type === 'DONOR_ACCEPTED';

                return (
                  <div
                    key={notif.id}
                    className={`py-3 flex items-start gap-3 transition-colors ${
                      !notif.read ? 'bg-slate-50/80 -mx-2 px-2 rounded-xl' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isEmergency ? (
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : isDonorAccepted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-charcoal-900 leading-tight">
                          {notif.title}
                        </span>
                        {notif.bloodGroup && <Badge bloodGroup={notif.bloodGroup} size="sm" />}
                      </div>

                      <p className="text-[11px] text-charcoal-600 leading-normal">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-charcoal-400">
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          type="button"
                          onClick={() => dismissNotification(notif.id)}
                          className="hover:text-charcoal-700"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-charcoal-500">
                <Bell className="w-6 h-6 text-charcoal-300 mx-auto mb-2" />
                <span>No new notifications</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
