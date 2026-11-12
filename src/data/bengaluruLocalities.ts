import type { LocalityRecord, HospitalDirectoryEntry, BloodCompatibilityRule } from '../types/blood.types';

export const BENGALURU_LOCALITIES: LocalityRecord[] = [
  { id: 'loc-1', name: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', zone: 'East', coordinates: { lat: 12.9784, lng: 77.6408 } },
  { id: 'loc-2', name: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', zone: 'South', coordinates: { lat: 12.9352, lng: 77.6245 } },
  { id: 'loc-3', name: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', zone: 'East', coordinates: { lat: 12.9698, lng: 77.7500 } },
  { id: 'loc-4', name: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560041', zone: 'South', coordinates: { lat: 12.9308, lng: 77.5838 } },
  { id: 'loc-5', name: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', zone: 'South', coordinates: { lat: 12.9121, lng: 77.6446 } },
  { id: 'loc-6', name: 'Malleshwaram', city: 'Bengaluru', state: 'Karnataka', pincode: '560003', zone: 'North', coordinates: { lat: 13.0031, lng: 77.5643 } },
  { id: 'loc-7', name: 'Rajajinagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560010', zone: 'West', coordinates: { lat: 12.9982, lng: 77.5530 } },
  { id: 'loc-8', name: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', pincode: '560100', zone: 'South', coordinates: { lat: 12.8452, lng: 77.6602 } },
  { id: 'loc-9', name: 'BTM Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560076', zone: 'South', coordinates: { lat: 12.9166, lng: 77.6101 } },
  { id: 'loc-10', name: 'Hebbal', city: 'Bengaluru', state: 'Karnataka', pincode: '560024', zone: 'North', coordinates: { lat: 13.0358, lng: 77.5970 } },
  { id: 'loc-11', name: 'Yelahanka', city: 'Bengaluru', state: 'Karnataka', pincode: '560064', zone: 'North', coordinates: { lat: 13.1007, lng: 77.5963 } },
  { id: 'loc-12', name: 'Banashankari', city: 'Bengaluru', state: 'Karnataka', pincode: '560050', zone: 'South', coordinates: { lat: 12.9255, lng: 77.5468 } },
  { id: 'loc-13', name: 'Marathahalli', city: 'Bengaluru', state: 'Karnataka', pincode: '560037', zone: 'East', coordinates: { lat: 12.9591, lng: 77.6974 } },
  { id: 'loc-14', name: 'Basavanagudi', city: 'Bengaluru', state: 'Karnataka', pincode: '560004', zone: 'South', coordinates: { lat: 12.9416, lng: 77.5755 } },
  { id: 'loc-15', name: 'Shivajinagar / Central', city: 'Bengaluru', state: 'Karnataka', pincode: '560051', zone: 'Central', coordinates: { lat: 12.9857, lng: 77.6057 } },
  { id: 'loc-16', name: 'Kalyan Nagar / HRBR', city: 'Bengaluru', state: 'Karnataka', pincode: '560043', zone: 'East', coordinates: { lat: 13.0163, lng: 77.6432 } },
  { id: 'loc-17', name: 'Yeshwanthpur', city: 'Bengaluru', state: 'Karnataka', pincode: '560022', zone: 'North', coordinates: { lat: 13.0284, lng: 77.5407 } },
  { id: 'loc-18', name: 'Bellandur', city: 'Bengaluru', state: 'Karnataka', pincode: '560103', zone: 'East', coordinates: { lat: 12.9260, lng: 77.6762 } }
];

export const BENGALURU_EMERGENCY_HOSPITALS: HospitalDirectoryEntry[] = [
  {
    id: 'hosp-1',
    name: 'Victoria Hospital (BMCRI Blood Centre)',
    locality: 'Fort, KR Market',
    pincode: '560002',
    address: 'Near City Market, Fort Road, Kalasipalya, Bengaluru',
    emergencyHelpline: '080-26701150',
    bloodBankContact: '080-26700448',
    hasLicensedBloodBank: true,
    coordinates: { lat: 12.9629, lng: 77.5746 }
  },
  {
    id: 'hosp-2',
    name: 'Bowring and Lady Curzon Hospital',
    locality: 'Shivajinagar',
    pincode: '560001',
    address: 'Lady Curzon Road, Tasker Town, Shivajinagar, Bengaluru',
    emergencyHelpline: '080-25591325',
    bloodBankContact: '080-25591326',
    hasLicensedBloodBank: true,
    coordinates: { lat: 12.9822, lng: 77.6042 }
  },
  {
    id: 'hosp-3',
    name: 'NIMHANS Blood Bank',
    locality: 'Hosur Road, Wilson Garden',
    pincode: '560029',
    address: 'Hosur Road, Lakkasandra, Bengaluru',
    emergencyHelpline: '080-26995000',
    bloodBankContact: '080-26995280',
    hasLicensedBloodBank: true,
    coordinates: { lat: 12.9392, lng: 77.5960 }
  },
  {
    id: 'hosp-4',
    name: 'Manipal Hospital Blood Centre',
    locality: 'Old Airport Road, Kodihalli',
    pincode: '560017',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    emergencyHelpline: '080-25024444',
    bloodBankContact: '080-25023250',
    hasLicensedBloodBank: true,
    coordinates: { lat: 12.9583, lng: 77.6489 }
  },
  {
    id: 'hosp-5',
    name: 'Narayana Health City Blood Bank',
    locality: 'Electronic City / Bommasandra',
    pincode: '560099',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru',
    emergencyHelpline: '080-71222222',
    bloodBankContact: '080-71222123',
    hasLicensedBloodBank: true,
    coordinates: { lat: 12.8227, lng: 77.6896 }
  },
  {
    id: 'hosp-6',
    name: 'St. John’s Medical College Hospital',
    locality: 'Koramangala',
    pincode: '560034',
    address: 'Sarjapur Main Rd, John Nagar, Koramangala, Bengaluru',
    emergencyHelpline: '080-22065000',
    bloodBankContact: '080-22065253',
    hasLicensedBloodBank: true,
    coordinates: { lat: 12.9318, lng: 77.6206 }
  }
];

export const BLOOD_COMPATIBILITY_GUIDE: BloodCompatibilityRule[] = [
  {
    group: 'O-',
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    clinicalNote: 'Universal red blood cell donor in emergency protocol. Strict crossmatching still required prior to non-extreme trauma transfusion.'
  },
  {
    group: 'O+',
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    clinicalNote: 'High demand for Rh-positive recipients. Most prevalent blood group in India.'
  },
  {
    group: 'A-',
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    clinicalNote: 'Can receive only negative Rh group red cells.'
  },
  {
    group: 'A+',
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    clinicalNote: 'Commonly requested in elective and surgical procedures.'
  },
  {
    group: 'B-',
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    clinicalNote: 'Relatively rare in urban patient registries.'
  },
  {
    group: 'B+',
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    clinicalNote: 'Widely prevalent across Karnataka and South India.'
  },
  {
    group: 'AB-',
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    clinicalNote: 'Extremely rare red blood cell group; universal plasma donor type.'
  },
  {
    group: 'AB+',
    canGiveTo: ['AB+'],
    canReceiveFrom: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    clinicalNote: 'Universal red cell recipient for packed cells, pending clinical antibody screening.'
  }
];
