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

export type BloodComponentType = 
  | 'WHOLE_BLOOD'
  | 'PRBC'
  | 'FFP'
  | 'PLATELETS'
  | 'CRYOPRECIPITATE';

export interface BloodComponentInfo {
  type: BloodComponentType;
  label: string;
  shelfLife: string;
  clinicalUse: string;
}

export const BLOOD_COMPONENTS: BloodComponentInfo[] = [
  {
    type: 'PRBC',
    label: 'Packed Red Blood Cells (PRBC)',
    shelfLife: '35–42 Days (at 2–6°C)',
    clinicalUse: 'Acute blood loss, severe anemia, trauma surgery',
  },
  {
    type: 'WHOLE_BLOOD',
    label: 'Whole Blood (Standard 350ml / 450ml)',
    shelfLife: '35 Days (at 2–6°C)',
    clinicalUse: 'Massive transfusion protocol, exchange transfusions',
  },
  {
    type: 'PLATELETS',
    label: 'Platelets (Single Donor / Random Donor)',
    shelfLife: '5 Days (at 20–24°C with agitation)',
    clinicalUse: 'Dengue shock syndrome, thrombocytopenia, chemotherapy',
  },
  {
    type: 'FFP',
    label: 'Fresh Frozen Plasma (FFP)',
    shelfLife: '1 Year (at -18°C or colder)',
    clinicalUse: 'Coagulopathy, liver disease, massive clotting factor loss',
  },
  {
    type: 'CRYOPRECIPITATE',
    label: 'Cryoprecipitate',
    shelfLife: '1 Year (frozen)',
    clinicalUse: 'Fibrinogen deficiency, hemophilia, von Willebrand disease',
  },
];

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

export interface DetailedBloodRequest {
  id: string;
  patientName: string;
  patientAge?: number;
  bloodGroup: BloodGroup;
  component: BloodComponentType;
  unitsNeeded: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  locality: string;
  city: string;
  pincode: string;
  wardRoom?: string;
  priority: EmergencyPriority;
  requiredBy: string;
  contactPerson: string;
  contactPhone: string;
  relationshipToPatient: string;
  requisitionSlipNumber?: string;
  additionalNotes?: string;
  isVerified: boolean;
  verificationSource?: 'HOSPITAL_COORDINATOR' | 'DOCTOR_PRESCRIPTION' | 'TELE_VERIFIED';
  status: RequestStatus;
  createdAt: string;
  responsesCount: number;
}
