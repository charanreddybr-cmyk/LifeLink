export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'
];

export type EmergencyPriority = 'CRITICAL' | 'URGENT' | 'STANDARD';

export type RequestStatus = 
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'RESPONSES_RECEIVED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface LocalityRecord {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  zone: 'Central' | 'South' | 'North' | 'East' | 'West';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface HospitalDirectoryEntry {
  id: string;
  name: string;
  locality: string;
  pincode: string;
  address: string;
  emergencyHelpline: string;
  bloodBankContact: string;
  hasLicensedBloodBank: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BloodCompatibilityRule {
  group: BloodGroup;
  canGiveTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
  clinicalNote: string;
}
