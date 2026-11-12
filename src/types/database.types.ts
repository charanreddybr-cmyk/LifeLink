export type UserRole = 'donor' | 'requester' | 'admin';
export type BloodGroupEnum = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type EmergencyPriorityEnum = 'CRITICAL' | 'URGENT' | 'STANDARD';
export type RequestStatusEnum = 
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'RESPONSES_RECEIVED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'EXPIRED';
export type DonorResponseStatusEnum = 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
export type VerificationStatusEnum = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface ProfileRecord {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonorProfileRecord {
  id: string;
  blood_group: BloodGroupEnum;
  city: string;
  locality: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  is_available: boolean;
  last_donation_date: string | null;
  total_donations: number;
  notification_radius_km: number;
  privacy_phone_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequesterProfileRecord {
  id: string;
  organization_name: string | null;
  hospital_affiliation: string | null;
  city: string;
  locality: string;
  verification_status: VerificationStatusEnum;
  created_at: string;
  updated_at: string;
}

export interface BloodRequestRecord {
  id: string;
  requester_id: string;
  patient_name: string;
  patient_age: number | null;
  blood_group: BloodGroupEnum;
  units_needed: number;
  units_fulfilled: number;
  hospital_name: string;
  hospital_address: string;
  locality: string;
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  priority: EmergencyPriorityEnum;
  required_by: string;
  contact_person: string;
  contact_phone: string;
  additional_notes: string | null;
  is_verified: boolean;
  status: RequestStatusEnum;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonorResponseRecord {
  id: string;
  request_id: string;
  donor_id: string;
  status: DonorResponseStatusEnum;
  response_notes: string | null;
  contact_released_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRecord;
        Insert: Partial<ProfileRecord> & { id: string; email: string; full_name: string };
        Update: Partial<ProfileRecord>;
      };
      donor_profiles: {
        Row: DonorProfileRecord;
        Insert: Partial<DonorProfileRecord> & { id: string; blood_group: BloodGroupEnum; locality: string; pincode: string };
        Update: Partial<DonorProfileRecord>;
      };
      requester_profiles: {
        Row: RequesterProfileRecord;
        Insert: Partial<RequesterProfileRecord> & { id: string; locality: string };
        Update: Partial<RequesterProfileRecord>;
      };
      blood_requests: {
        Row: BloodRequestRecord;
        Insert: Partial<BloodRequestRecord> & {
          requester_id: string;
          patient_name: string;
          blood_group: BloodGroupEnum;
          units_needed: number;
          hospital_name: string;
          hospital_address: string;
          locality: string;
          pincode: string;
          required_by: string;
          contact_person: string;
          contact_phone: string;
        };
        Update: Partial<BloodRequestRecord>;
      };
      donor_responses: {
        Row: DonorResponseRecord;
        Insert: Partial<DonorResponseRecord> & { request_id: string; donor_id: string };
        Update: Partial<DonorResponseRecord>;
      };
    };
  };
}
