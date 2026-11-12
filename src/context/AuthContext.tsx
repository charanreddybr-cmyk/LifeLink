import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { 
  UserRole, 
  ProfileRecord, 
  DonorProfileRecord, 
  RequesterProfileRecord,
  BloodGroupEnum
} from '../types/database.types';

export interface SignUpDonorParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  bloodGroup: BloodGroupEnum;
  locality: string;
  pincode: string;
  isAvailable?: boolean;
}

export interface SignUpRequesterParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  locality: string;
  hospitalAffiliation?: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileRecord | null;
  donorProfile: DonorProfileRecord | null;
  requesterProfile: RequesterProfileRecord | null;
  role: UserRole | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
  sessionError: string | null;
  signIn: (email: string, password: string, simulatedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUpDonor: (params: SignUpDonorParams) => Promise<{ success: boolean; error?: string }>;
  signUpRequester: (params: SignUpRequesterParams) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateDonorAvailability: (isAvailable: boolean) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [donorProfile, setDonorProfile] = useState<DonorProfileRecord | null>(null);
  const [requesterProfile, setRequesterProfile] = useState<RequesterProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Fallback local session storage key for developer mode without cloud credentials
  const LOCAL_STORAGE_SESSION_KEY = 'lifelink_dev_session';

  const fetchProfileDetails = async (userId: string, role: UserRole) => {
    try {
      if (!isSupabaseConfigured) return;

      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (pData) setProfile(pData as unknown as ProfileRecord);

      if (role === 'donor') {
        const { data: dData } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (dData) setDonorProfile(dData as unknown as DonorProfileRecord);
      } else if (role === 'requester') {
        const { data: rData } = await supabase
          .from('requester_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (rData) setRequesterProfile(rData as unknown as RequesterProfileRecord);
      }
    } catch (err: any) {
      console.warn('Could not fetch profiles from Supabase:', err.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (isSupabaseConfigured) {
      // 1. Live Supabase Auth Session listener
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          const userRole = (session.user.user_metadata?.role as UserRole) || 'donor';
          fetchProfileDetails(session.user.id, userRole).finally(() => {
            if (mounted) setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session: Session | null) => {
          if (!mounted) return;
          if (session?.user) {
            setUser(session.user);
            const userRole = (session.user.user_metadata?.role as UserRole) || 'donor';
            await fetchProfileDetails(session.user.id, userRole);
          } else {
            setUser(null);
            setProfile(null);
            setDonorProfile(null);
            setRequesterProfile(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // 2. Dev mode: Check localStorage session
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed.user);
          setProfile(parsed.profile);
          setDonorProfile(parsed.donorProfile || null);
          setRequesterProfile(parsed.requesterProfile || null);
        }
      } catch (e) {
        console.warn('Failed restoring local dev session', e);
      }
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string, simulatedRole: UserRole = 'donor') => {
    setIsLoading(true);
    setSessionError(null);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          setSessionError(error.message);
          return { success: false, error: error.message };
        }
        if (data.user) {
          setUser(data.user);
          const userRole = (data.user.user_metadata?.role as UserRole) || simulatedRole;
          await fetchProfileDetails(data.user.id, userRole);
        }
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        setSessionError(err.message);
        return { success: false, error: err.message };
      }
    } else {
      // Developer / Demo session when Supabase project is not yet connected
      const mockId = 'dev-usr-' + Math.random().toString(36).substring(2, 9);
      const mockUser = {
        id: mockId,
        email,
        app_metadata: {},
        user_metadata: { role: simulatedRole, full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;

      const mockProfile: ProfileRecord = {
        id: mockId,
        email,
        role: simulatedRole,
        full_name: email.split('@')[0].toUpperCase(),
        phone: '9845012345',
        phone_verified: true,
        email_verified: true,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let mockDonor: DonorProfileRecord | null = null;
      let mockRequester: RequesterProfileRecord | null = null;

      if (simulatedRole === 'donor') {
        mockDonor = {
          id: mockId,
          blood_group: 'O+',
          city: 'Bengaluru',
          locality: 'Indiranagar',
          pincode: '560038',
          latitude: 12.9784,
          longitude: 77.6408,
          is_available: true,
          last_donation_date: '2026-08-01',
          total_donations: 4,
          notification_radius_km: 10,
          privacy_phone_consent: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (simulatedRole === 'requester') {
        mockRequester = {
          id: mockId,
          organization_name: 'Manipal Hospital Care Team',
          hospital_affiliation: 'Manipal Hospital, HAL Old Airport Rd',
          city: 'Bengaluru',
          locality: 'Old Airport Road',
          verification_status: 'VERIFIED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setUser(mockUser);
      setProfile(mockProfile);
      setDonorProfile(mockDonor);
      setRequesterProfile(mockRequester);

      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({
        user: mockUser,
        profile: mockProfile,
        donorProfile: mockDonor,
        requesterProfile: mockRequester,
      }));

      setIsLoading(false);
      return { success: true };
    }
  };

  const signUpDonor = async (params: SignUpDonorParams) => {
    setIsLoading(true);
    setSessionError(null);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              role: 'donor',
              full_name: params.fullName,
              phone: params.phone,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Insert donor_profiles details
          await (supabase as any).from('donor_profiles').insert({
            id: data.user.id,
            blood_group: params.bloodGroup,
            city: 'Bengaluru',
            locality: params.locality,
            pincode: params.pincode,
            is_available: params.isAvailable !== false,
          });
        }

        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    } else {
      return signIn(params.email, params.password, 'donor');
    }
  };

  const signUpRequester = async (params: SignUpRequesterParams) => {
    setIsLoading(true);
    setSessionError(null);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              role: 'requester',
              full_name: params.fullName,
              phone: params.phone,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          await (supabase as any).from('requester_profiles').insert({
            id: data.user.id,
            hospital_affiliation: params.hospitalAffiliation || null,
            city: 'Bengaluru',
            locality: params.locality,
          });
        }

        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    } else {
      return signIn(params.email, params.password, 'requester');
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    setUser(null);
    setProfile(null);
    setDonorProfile(null);
    setRequesterProfile(null);
    setIsLoading(false);
  };

  const updateDonorAvailability = async (isAvailable: boolean): Promise<boolean> => {
    if (!profile || profile.role !== 'donor') return false;

    if (isSupabaseConfigured) {
      const { error } = await (supabase as any)
        .from('donor_profiles')
        .update({ is_available: isAvailable })
        .eq('id', profile.id);

      if (!error) {
        setDonorProfile(prev => prev ? { ...prev, is_available: isAvailable } : null);
        return true;
      }
      return false;
    } else {
      setDonorProfile(prev => prev ? { ...prev, is_available: isAvailable } : null);
      return true;
    }
  };

  const refreshProfile = async () => {
    if (user && profile) {
      await fetchProfileDetails(user.id, profile.role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        donorProfile,
        requesterProfile,
        role: profile?.role || null,
        isLoading,
        isSupabaseLive: isSupabaseConfigured,
        sessionError,
        signIn,
        signUpDonor,
        signUpRequester,
        signOut,
        updateDonorAvailability,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
