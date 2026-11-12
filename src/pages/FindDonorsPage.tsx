import React, { useState } from 'react';
import { Search, MapPin, UserCheck, AlertCircle, Heart, PhoneOff } from 'lucide-react';
import { ALL_BLOOD_GROUPS } from '../types/blood.types';
import type { BloodGroup } from '../types/blood.types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface FindDonorsPageProps {
  onRequestEmergency: (bloodGroup?: BloodGroup, localityId?: string) => void;
  onRegisterDonor: () => void;
}

interface SimulatedDonor {
  id: string;
  maskedName: string;
  bloodGroup: BloodGroup;
  locality: string;
  zone: string;
  distanceKm: number;
  lastDonationDaysAgo: number;
  verifiedStatus: boolean;
  availableNow: boolean;
}

// Sample verified donor records for interactive demonstration of the matching engine UI
const SAMPLE_DONORS: SimulatedDonor[] = [
  { id: 'DNR-101', maskedName: 'Karthik R.', bloodGroup: 'O+', locality: 'Indiranagar', zone: 'East', distanceKm: 1.8, lastDonationDaysAgo: 120, verifiedStatus: true, availableNow: true },
  { id: 'DNR-102', maskedName: 'Sneha M.', bloodGroup: 'O-', locality: 'Koramangala', zone: 'South', distanceKm: 3.4, lastDonationDaysAgo: 180, verifiedStatus: true, availableNow: true },
  { id: 'DNR-103', maskedName: 'Arjun K.', bloodGroup: 'B+', locality: 'Whitefield', zone: 'East', distanceKm: 4.2, lastDonationDaysAgo: 95, verifiedStatus: true, availableNow: true },
  { id: 'DNR-104', maskedName: 'Divya P.', bloodGroup: 'A+', locality: 'Jayanagar', zone: 'South', distanceKm: 2.1, lastDonationDaysAgo: 210, verifiedStatus: true, availableNow: true },
  { id: 'DNR-105', maskedName: 'Manoj V.', bloodGroup: 'AB+', locality: 'HSR Layout', zone: 'South', distanceKm: 3.9, lastDonationDaysAgo: 140, verifiedStatus: true, availableNow: true },
  { id: 'DNR-106', maskedName: 'Pooja S.', bloodGroup: 'A-', locality: 'Malleshwaram', zone: 'North', distanceKm: 5.6, lastDonationDaysAgo: 300, verifiedStatus: true, availableNow: true },
  { id: 'DNR-107', maskedName: 'Rohan N.', bloodGroup: 'B-', locality: 'Rajajinagar', zone: 'West', distanceKm: 6.1, lastDonationDaysAgo: 160, verifiedStatus: true, availableNow: true },
  { id: 'DNR-108', maskedName: 'Farhan A.', bloodGroup: 'AB-', locality: 'Shivajinagar / Central', zone: 'Central', distanceKm: 2.7, lastDonationDaysAgo: 190, verifiedStatus: true, availableNow: true },
];

export const FindDonorsPage: React.FC<FindDonorsPageProps> = ({
  onRequestEmergency,
  onRegisterDonor,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDonors = SAMPLE_DONORS.filter((donor) => {
    const matchesGroup = selectedGroup === 'ALL' || donor.bloodGroup === selectedGroup;
    const matchesZone = selectedZone === 'ALL' || donor.zone === selectedZone;
    const matchesSearch = donor.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          donor.maskedName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesZone && matchesSearch;
  });

  return (
    <div className="py-12 bg-slate-50 min-h-screen space-y-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Bengaluru Donor Registry Preview
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
              Verified Blood Donors Network
            </h1>
            <p className="text-sm text-charcoal-600 max-w-2xl">
              Preview registered, active donors across Bengaluru. To protect civic privacy, personal phone numbers are withheld until an emergency request is officially verified.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="emergency"
              size="md"
              onClick={() => onRequestEmergency()}
              leftIcon={<AlertCircle className="w-4 h-4" />}
            >
              Post Emergency Request
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onRegisterDonor}
              leftIcon={<Heart className="w-4 h-4 text-brand-600" />}
            >
              Register as Donor
            </Button>
          </div>
        </div>

        {/* Privacy Shield Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <PhoneOff className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold">DPDP Privacy Protocol Active:</span>
            <p className="text-emerald-800 leading-relaxed">
              Donors cannot be cold-called. When you submit a verified hospital request, LifeLink automatically dispatches push & SMS alerts to these donors, and only donors who explicitly accept will connect with your verified patient attendant.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm space-y-4">
          {/* Blood group filters */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-600 block">
              Filter by Blood Group:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedGroup('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                  selectedGroup === 'ALL'
                    ? 'bg-charcoal-900 text-white border-charcoal-900'
                    : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                All Groups
              </button>
              {ALL_BLOOD_GROUPS.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3.5 py-1.5 text-xs font-black rounded-xl border transition-colors ${
                    selectedGroup === grp
                      ? 'bg-brand-700 text-white border-brand-800 shadow-soft'
                      : 'bg-white text-charcoal-700 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Zone & Search Input */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search by locality (e.g. Indiranagar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="ALL">All Bengaluru Zones</option>
                <option value="Central">Central Bengaluru</option>
                <option value="South">South Bengaluru</option>
                <option value="North">North Bengaluru</option>
                <option value="East">East Bengaluru</option>
                <option value="West">West Bengaluru</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex items-center justify-end">
              <span className="text-xs font-semibold text-charcoal-500">
                Found {filteredDonors.length} matching donors
              </span>
            </div>
          </div>
        </div>

        {/* Donors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDonors.map((donor) => (
            <Card key={donor.id} bordered hoverable padded className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge bloodGroup={donor.bloodGroup} size="lg" />
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <UserCheck className="w-3 h-3" />
                    Available
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-charcoal-900">{donor.maskedName}</h3>
                  <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-brand-600" />
                    <span>{donor.locality} ({donor.zone} BLR)</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-charcoal-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-charcoal-400">Proximity:</span>
                    <span className="font-semibold text-charcoal-800">~{donor.distanceKm} km away</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-400">Rest Interval:</span>
                    <span className="font-semibold text-emerald-700">{donor.lastDonationDaysAgo} days cleared</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onRequestEmergency(donor.bloodGroup)}
                className="w-full text-xs font-bold justify-center"
              >
                Send Request Alert
              </Button>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};
