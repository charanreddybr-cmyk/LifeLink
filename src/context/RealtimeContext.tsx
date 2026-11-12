import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { RealtimeConnectionStatus, RealtimeNotification, RealtimeBroadcastPayload } from '../types/realtime.types';
import type { BloodGroup, DetailedBloodRequest } from '../types/blood.types';
import { soundFx } from '../utils/audioChime';

interface RealtimeContextType {
  connectionStatus: RealtimeConnectionStatus;
  isLiveSupabase: boolean;
  notifications: RealtimeNotification[];
  unreadCount: number;
  audioEnabled: boolean;
  toggleAudio: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAllAsRead: () => void;
  broadcastNewRequest: (req: DetailedBloodRequest) => void;
  broadcastDonorResponse: (
    requestId: string,
    donorName: string,
    bloodGroup: BloodGroup,
    phone: string,
    locality: string,
    distanceKm?: number
  ) => void;
  simulateIncomingEmergency: () => void;
  simulateDonorAcceptance: (targetRequestId?: string) => void;
  latestRequestEvent: DetailedBloodRequest | null;
  latestResponseEvent: {
    requestId: string;
    donorName: string;
    bloodGroup: BloodGroup;
    phone: string;
    locality: string;
    distanceKm: number;
  } | null;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = 'lifelink_realtime_bus';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('CONNECTING');
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    return localStorage.getItem('lifelink_audio_enabled') !== 'false';
  });

  const [latestRequestEvent, setLatestRequestEvent] = useState<DetailedBloodRequest | null>(null);
  const [latestResponseEvent, setLatestResponseEvent] = useState<{
    requestId: string;
    donorName: string;
    bloodGroup: BloodGroup;
    phone: string;
    locality: string;
    distanceKm: number;
  } | null>(null);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Toggle Audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('lifelink_audio_enabled', String(next));
      if (next) soundFx.playSuccessChime();
      return next;
    });
  }, []);

  // Push new notification
  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) => {
    const newEntry: RealtimeNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newEntry, ...prev.slice(0, 19)]); // Keep last 20
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark all read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Dispatch incoming request event locally and play sound
  const handleIncomingRequest = useCallback(
    (request: DetailedBloodRequest) => {
      setLatestRequestEvent(request);
      addNotification({
        type: 'EMERGENCY_REQUISITION',
        title: `CRITICAL: ${request.bloodGroup} Needed at ${request.hospitalName}`,
        message: `${request.unitsNeeded} unit(s) of ${request.component} urgently needed for ${request.patientName} (${request.locality}).`,
        bloodGroup: request.bloodGroup,
        component: request.component,
        hospitalName: request.hospitalName,
        locality: request.locality,
        requestId: request.id,
        priority: request.priority,
      });

      if (audioEnabled) {
        soundFx.playEmergencyChime();
      }
    },
    [addNotification, audioEnabled]
  );

  // Dispatch incoming donor response event locally and play sound
  const handleIncomingResponse = useCallback(
    (payload: {
      requestId: string;
      donorName: string;
      bloodGroup: BloodGroup;
      phone: string;
      locality: string;
      distanceKm: number;
    }) => {
      setLatestResponseEvent(payload);
      addNotification({
        type: 'DONOR_ACCEPTED',
        title: `Donor Accepted: ${payload.donorName} (${payload.bloodGroup})`,
        message: `Registered donor in ${payload.locality} (~${payload.distanceKm} km away) agreed to donate for requisition ${payload.requestId}. Phone contact authorized.`,
        bloodGroup: payload.bloodGroup,
        requestId: payload.requestId,
        donorName: payload.donorName,
        donorPhone: payload.phone,
        distanceKm: payload.distanceKm,
        locality: payload.locality,
      });

      if (audioEnabled) {
        soundFx.playSuccessChime();
      }
    },
    [addNotification, audioEnabled]
  );

  // Setup Supabase Realtime Channel & BroadcastChannel
  useEffect(() => {
    let isMounted = true;

    // 1. Initialize BroadcastChannel for cross-tab & local simulation sync
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = bc;

        bc.onmessage = (event: MessageEvent<RealtimeBroadcastPayload>) => {
          if (!isMounted) return;
          const { eventType, data } = event.data;
          if (eventType === 'NEW_REQUEST') {
            handleIncomingRequest(data);
          } else if (eventType === 'DONOR_RESPONSE') {
            handleIncomingResponse(data);
          }
        };
      }
    } catch {
      // BroadcastChannel unsupported or blocked
    }

    // 2. Setup Supabase Realtime Channels
    if (isSupabaseConfigured) {
      setConnectionStatus('CONNECTING');

      const channel = supabase
        .channel('lifelink_realtime_feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'blood_requests' },
          (payload) => {
            if (!isMounted) return;
            const newRow = payload.new as any;
            if (newRow) {
              const req: DetailedBloodRequest = {
                id: newRow.id,
                patientName: newRow.patient_name,
                patientAge: newRow.patient_age,
                bloodGroup: newRow.blood_group,
                component: (newRow.component as any) || 'PRBC',
                unitsNeeded: newRow.units_needed,
                unitsFulfilled: newRow.units_fulfilled || 0,
                hospitalName: newRow.hospital_name,
                hospitalAddress: newRow.hospital_address || '',
                locality: newRow.locality,
                city: newRow.city || 'Bengaluru',
                pincode: newRow.pincode,
                priority: newRow.priority,
                requiredBy: newRow.required_by,
                contactPerson: newRow.contact_person,
                contactPhone: newRow.contact_phone,
                relationshipToPatient: 'Attendant',
                isVerified: newRow.is_verified,
                status: newRow.status,
                createdAt: newRow.created_at,
                responsesCount: 0,
              };
              handleIncomingRequest(req);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'donor_responses' },
          (payload) => {
            if (!isMounted) return;
            const newRow = payload.new as any;
            if (newRow) {
              handleIncomingResponse({
                requestId: newRow.request_id,
                donorName: 'Verified Community Donor',
                bloodGroup: 'O+',
                phone: '9845012345',
                locality: 'Indiranagar',
                distanceKm: 2.3,
              });
            }
          }
        )
        .subscribe((status) => {
          if (!isMounted) return;
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('CONNECTED');
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            setConnectionStatus('RECONNECTING');
          } else if (status === 'CLOSED') {
            setConnectionStatus('DISCONNECTED');
          }
        });

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.close();
        }
      };
    } else {
      // Developer / Sandbox mode: connected to local real-time sync bus
      const timer = setTimeout(() => {
        if (isMounted) {
          setConnectionStatus('CONNECTED');
        }
      }, 500);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.close();
        }
      };
    }
  }, [handleIncomingRequest, handleIncomingResponse]);

  // Broadcast new request across channels
  const broadcastNewRequest = useCallback(
    (req: DetailedBloodRequest) => {
      // 1. Process locally in current tab
      handleIncomingRequest(req);

      // 2. Broadcast across tabs via BroadcastChannel
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          eventId: `evt-${Date.now()}`,
          eventType: 'NEW_REQUEST',
          data: req,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [handleIncomingRequest]
  );

  // Broadcast donor response across channels
  const broadcastDonorResponse = useCallback(
    (
      requestId: string,
      donorName: string,
      bloodGroup: BloodGroup,
      phone: string,
      locality: string,
      distanceKm: number = 2.4
    ) => {
      const payload = {
        requestId,
        donorName,
        bloodGroup,
        phone,
        locality,
        distanceKm,
      };

      // 1. Process locally in current tab
      handleIncomingResponse(payload);

      // 2. Broadcast across tabs
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          eventId: `evt-${Date.now()}`,
          eventType: 'DONOR_RESPONSE',
          data: payload,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [handleIncomingResponse]
  );

  // Developer simulation helper: generate mock emergency requisition
  const simulateIncomingEmergency = useCallback(() => {
    const mockHospitals = [
      { name: 'Victoria Hospital (BMCRI)', locality: 'Fort / KR Market', bloodGroup: 'O-' as BloodGroup, component: 'PRBC' as const },
      { name: 'Bowring and Lady Curzon Hospital', locality: 'Shivajinagar', bloodGroup: 'B-' as BloodGroup, component: 'WHOLE_BLOOD' as const },
      { name: 'Manipal Hospital Blood Centre', locality: 'Old Airport Road', bloodGroup: 'O+' as BloodGroup, component: 'PLATELETS' as const },
      { name: 'NIMHANS Neuro-trauma Centre', locality: 'Wilson Garden', bloodGroup: 'A-' as BloodGroup, component: 'PRBC' as const },
    ];
    const pick = mockHospitals[Math.floor(Math.random() * mockHospitals.length)];
    const mockReqId = `REQ-BLR-${Math.floor(1000 + Math.random() * 9000)}`;

    const simulatedReq: DetailedBloodRequest = {
      id: mockReqId,
      patientName: `Emergency Patient #${Math.floor(100 + Math.random() * 900)}`,
      patientAge: Math.floor(20 + Math.random() * 50),
      bloodGroup: pick.bloodGroup,
      component: pick.component,
      unitsNeeded: Math.floor(1 + Math.random() * 3),
      unitsFulfilled: 0,
      hospitalName: pick.name,
      hospitalAddress: `${pick.locality}, Bengaluru`,
      locality: pick.locality,
      city: 'Bengaluru',
      pincode: '560002',
      priority: 'CRITICAL',
      requiredBy: 'Immediate / Within 1 hour',
      contactPerson: 'Emergency Duty Officer',
      contactPhone: '9845099999',
      relationshipToPatient: 'Hospital Staff',
      isVerified: true,
      verificationSource: 'HOSPITAL_COORDINATOR',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      responsesCount: 0,
    };

    broadcastNewRequest(simulatedReq);
  }, [broadcastNewRequest]);

  // Developer simulation helper: generate mock donor acceptance
  const simulateDonorAcceptance = useCallback(
    (targetRequestId: string = 'REQ-BLR-8421') => {
      const mockDonors = [
        { name: 'Karthik R.', bloodGroup: 'O+' as BloodGroup, locality: 'Indiranagar', phone: '9845012345', distance: 2.1 },
        { name: 'Sneha M.', bloodGroup: 'O-' as BloodGroup, locality: 'Koramangala', phone: '9900198765', distance: 3.4 },
        { name: 'Arjun K.', bloodGroup: 'B+' as BloodGroup, locality: 'Whitefield', phone: '9742054321', distance: 4.8 },
      ];
      const donor = mockDonors[Math.floor(Math.random() * mockDonors.length)];
      broadcastDonorResponse(
        targetRequestId,
        donor.name,
        donor.bloodGroup,
        donor.phone,
        donor.locality,
        donor.distance
      );
    },
    [broadcastDonorResponse]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <RealtimeContext.Provider
      value={{
        connectionStatus,
        isLiveSupabase: isSupabaseConfigured,
        notifications,
        unreadCount,
        audioEnabled,
        toggleAudio,
        dismissNotification,
        clearAllNotifications,
        markAllAsRead,
        broadcastNewRequest,
        broadcastDonorResponse,
        simulateIncomingEmergency,
        simulateDonorAcceptance,
        latestRequestEvent,
        latestResponseEvent,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
