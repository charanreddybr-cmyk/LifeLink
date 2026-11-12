import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Heart, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Bell, 
  AlertTriangle,
  Hospital
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const DonorDashboardPage: React.FC = () => {
  const { profile, donorProfile, updateDonorAvailability } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [responseNotice, setResponseNotice] = useState<string | null>(null);

  const bloodGroup = donorProfile?.blood_group || 'O+';
  const isAvailable = donorProfile?.is_available ?? true;
  const locality = donorProfile?.locality || 'Bengaluru';
  const totalDonations = donorProfile?.total_donations ?? 0;

  // Calculate 90-day rest rule
  const lastDonation = donorProfile?.last_donation_date ? new Date(donorProfile.last_donation_date) : null;
  const daysSinceDonation = lastDonation ? Math.floor((Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)) : 120;
  const isCleared90Days = daysSinceDonation >= 90;

  const handleToggleAvailability = async () => {
    setIsUpdating(true);
    await updateDonorAvailability(!isAvailable);
    setIsUpdating(false);
  };

  const [simulatedRequests, setSimulatedRequests] = useState([
    {
      id: 'req-1',
      patientName: 'Anand K.',
      hospital: 'Victoria Hospital, BMCRI Blood Centre',
      locality: 'Fort, KR Market',
      units: 2,
      bloodGroup: bloodGroup,
      priority: 'URGENT' as const,
      requiredBy: 'Today by 11:30 PM',
      responded: false,
    },
    {
      id: 'req-2',
      patientName: 'Meera S. (Emergency Surgery)',
      hospital: 'Manipal Hospital, HAL Old Airport Rd',
      locality: 'Kodihalli',
      units: 1,
      bloodGroup: bloodGroup,
      priority: 'CRITICAL' as const,
      requiredBy: 'Within 2 hours',
      responded: false,
    }
  ]);

  const handleRespond = (reqId: string, status: 'ACCEPTED' | 'DECLINED') => {
    setSimulatedRequests(prev => prev.map(r => r.id === reqId ? { ...r, responded: true } : r));
    if (status === 'ACCEPTED') {
      setResponseNotice(`Thank you! Your contact release authorization has been granted for request. The hospital blood coordinator will connect shortly.`);
    } else {
      setResponseNotice(`Response noted. The request will remain visible to other nearby donors.`);
    }
    setTimeout(() => setResponseNotice(null), 5000);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900">
                Welcome back, {profile?.full_name || 'Donor'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                Donor Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Registered with primary blood group <strong className="text-brand-700 font-extrabold">{bloodGroup}</strong> in {locality}, Bengaluru.
            </p>
          </div>

          {/* Quick Availability Toggle */}
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <span className="text-xs font-bold text-charcoal-700">Emergency Status:</span>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleToggleAvailability}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAvailable
                  ? 'bg-emerald-600 text-white shadow-soft'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span>{isAvailable ? 'Active & Ready' : 'Paused (Standby)'}</span>
            </button>
          </div>
        </div>

        {responseNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-medium">{responseNotice}</p>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Your Blood Group</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-3xl font-black text-brand-700">{bloodGroup}</span>
              <Badge bloodGroup={bloodGroup} size="lg" />
            </div>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Donation Rest Status</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xl font-black text-charcoal-900">
                {isCleared90Days ? 'Cleared (Eligible)' : 'Rest Required'}
              </span>
              <span className={`w-3 h-3 rounded-full ${isCleared90Days ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
            <p className="text-[11px] text-charcoal-500">
              {isCleared90Days ? `${daysSinceDonation} days since last donation` : `Mandatory 90-day rest rule`}
            </p>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Total Life Gifts</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-3xl font-black text-charcoal-900">{totalDonations}</span>
              <Heart className="w-6 h-6 text-brand-500 fill-brand-100" />
            </div>
            <p className="text-[11px] text-charcoal-500">Verified clinical donations logged</p>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Privacy Protocol</span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-emerald-700">DPDP Active</span>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-[11px] text-charcoal-500">Number only released after you accept</p>
          </Card>
        </div>

        {/* Incoming Emergency Requests Matching This Donor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-700" />
              <h2 className="text-lg font-bold text-charcoal-900">
                Matching Emergency Requests Near {locality}
              </h2>
            </div>
            <span className="text-xs font-semibold text-charcoal-500">
              Filtered for {bloodGroup} in your notification radius
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulatedRequests.map((req) => (
              <Card key={req.id} bordered padded className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge priority={req.priority} size="sm" />
                    <span className="text-xs font-bold text-charcoal-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {req.requiredBy}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-charcoal-900">{req.patientName}</h3>
                    <p className="text-xs text-charcoal-600 flex items-center gap-1 mt-0.5">
                      <Hospital className="w-3.5 h-3.5 text-brand-600" />
                      <span>{req.hospital}</span>
                    </p>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>{req.locality}, Bengaluru</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                    <span className="text-charcoal-500">Required:</span>
                    <strong className="text-charcoal-900">{req.units} Units of {req.bloodGroup}</strong>
                  </div>
                </div>

                {req.responded ? (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-center text-xs font-semibold text-charcoal-600">
                    Response Recorded
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="emergency"
                      size="sm"
                      onClick={() => handleRespond(req.id, 'ACCEPTED')}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      I Can Donate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRespond(req.id, 'DECLINED')}
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Cannot Donate
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Safety reminder */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Medical Safety Reminder:</span>
            <p className="leading-relaxed">
              When reporting to the hospital blood centre, carry your government photo ID (Aadhaar / Voter ID / Driving License). Ensure you are well hydrated, have eaten within the last 4 hours, and have not consumed alcohol in the last 24 hours. The blood bank doctor will perform final hemoglobin and viral screening.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
