import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { isBloodCompatible } from '../../utils/matchingEngine';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Bell, 
  Hospital,
  User,
  Sliders,
  History,
  Navigation,
  Lock,
  Phone,
  Trash2,
  CalendarCheck,
  Award,
  Radio,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ALL_BLOOD_GROUPS } from '../../types/blood.types';
import type { BloodGroup, EmergencyPriority } from '../../types/blood.types';
import { BENGALURU_LOCALITIES } from '../../data/bengaluruLocalities';
import { requestConsentedLocation } from '../../utils/geoUtils';
import { PhoneVerificationModal } from '../../components/donor/PhoneVerificationModal';

export const DonorDashboardPage: React.FC = () => {
  const { profile, donorProfile, updateDonorAvailability } = useAuth();
  const { latestRequestEvent, broadcastDonorResponse, simulateIncomingEmergency } = useRealtime();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'settings' | 'requests' | 'history'>('overview');
  
  // Local editable profile state
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donorProfile?.blood_group || 'O+');
  const [locality, setLocality] = useState<string>(donorProfile?.locality || 'Indiranagar');
  const [pincode, setPincode] = useState<string>(donorProfile?.pincode || '560038');
  const [fullName, setFullName] = useState<string>(profile?.full_name || 'Volunteer Donor');
  const [phone, setPhone] = useState<string>(profile?.phone || '9845012345');
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(profile?.phone_verified || false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  
  // Settings state
  const [notificationRadius, setNotificationRadius] = useState<number>(donorProfile?.notification_radius_km || 10);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [phoneConsentOnlyOnAccept, setPhoneConsentOnlyOnAccept] = useState(true);
  
  // GPS State
  const [gpsStatus, setGpsStatus] = useState<string>('Approximate locality active');
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);

  // Availability State
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const isAvailable = donorProfile?.is_available ?? true;
  
  // Notice Banner
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // 90-Day Medical Rule Calculation
  const lastDonationDateString = donorProfile?.last_donation_date || '2026-08-15';
  const lastDonationDate = new Date(lastDonationDateString);
  const daysSinceLastDonation = Math.floor((Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemainingFor90 = Math.max(0, 90 - daysSinceLastDonation);
  const isEligibleToDonate = daysRemainingFor90 === 0;

  // Next eligible date
  const nextEligibleDate = new Date(lastDonationDate.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Simulated emergency requests
  const [incomingRequests, setIncomingRequests] = useState<Array<{
    id: string;
    patientName: string;
    hospital: string;
    locality: string;
    units: number;
    bloodGroup: BloodGroup;
    priority: EmergencyPriority;
    requiredBy: string;
    distanceKm: number;
    responded: boolean;
    responseType?: 'ACCEPTED' | 'DECLINED';
  }>>([
    {
      id: 'REQ-BLR-8421',
      patientName: 'Anand K. (Cardiac Emergency)',
      hospital: 'Victoria Hospital (BMCRI Blood Centre)',
      locality: 'Fort, KR Market',
      units: 2,
      bloodGroup: bloodGroup,
      priority: 'CRITICAL',
      requiredBy: 'Today by 11:30 PM',
      distanceKm: 3.2,
      responded: false,
    },
    {
      id: 'REQ-BLR-8422',
      patientName: 'Meera S. (Emergency Surgery)',
      hospital: 'Manipal Hospital, HAL Old Airport Rd',
      locality: 'Kodihalli / Indiranagar',
      units: 1,
      bloodGroup: bloodGroup,
      priority: 'URGENT',
      requiredBy: 'Within 3 hours',
      distanceKm: 1.8,
      responded: false,
    }
  ]);

  // Donation history records
  const donationHistory = [
    {
      id: 'HIST-101',
      date: '15 Aug 2026',
      centre: 'Victoria Hospital BMCRI Blood Centre',
      units: 1,
      type: 'Whole Blood (350ml)',
      certificateId: 'NBTC-KAR-2026-891',
    },
    {
      id: 'HIST-102',
      date: '10 May 2026',
      centre: 'Red Cross Society Karnataka, Race Course Rd',
      units: 1,
      type: 'Whole Blood (350ml)',
      certificateId: 'NBTC-KAR-2026-442',
    },
    {
      id: 'HIST-103',
      date: '02 Jan 2026',
      centre: 'NIMHANS Blood Centre, Hosur Rd',
      units: 1,
      type: 'Whole Blood (350ml)',
      certificateId: 'NBTC-KAR-2026-019',
    }
  ];

  const handleToggleAvailability = async () => {
    setIsUpdatingAvailability(true);
    await updateDonorAvailability(!isAvailable);
    setIsUpdatingAvailability(false);
    showNotice(`Availability status updated to: ${!isAvailable ? 'Active & Ready' : 'Paused (Standby)'}`);
  };

  const handleRequestGps = async () => {
    setIsAcquiringGps(true);
    const result = await requestConsentedLocation();
    setIsAcquiringGps(false);
    if (result.success && result.coords) {
      setGpsStatus(`Privacy-masked coordinates saved (${result.coords.lat}, ${result.coords.lng})`);
      showNotice('Approximate location updated with DPDP privacy masking (1 km blur).');
    } else {
      setGpsStatus(result.error || 'Location permission denied.');
    }
  };

  const handleRespond = (reqId: string, type: 'ACCEPTED' | 'DECLINED') => {
    setIncomingRequests(prev => prev.map(r => r.id === reqId ? { ...r, responded: true, responseType: type } : r));
    if (type === 'ACCEPTED') {
      broadcastDonorResponse(
        reqId,
        fullName || profile?.full_name || 'Community Donor',
        bloodGroup,
        phone || profile?.phone || '9845012345',
        locality,
        2.1
      );
      showNotice('Your willingness has been relayed in Realtime to the hospital attendant. Phone contact authorized.');
    } else {
      showNotice('Response noted. The request remains available for other local donors.');
    }
  };

  // Listen for realtime incoming emergency requests matching donor's blood group
  useEffect(() => {
    if (!latestRequestEvent) return;

    // Evaluate clinical compatibility with this donor's blood group
    const isCompat = isBloodCompatible(bloodGroup, latestRequestEvent.bloodGroup, latestRequestEvent.component);
    if (!isCompat) return;

    setIncomingRequests(prev => {
      if (prev.some(r => r.id === latestRequestEvent.id)) return prev;

      const newEntry = {
        id: latestRequestEvent.id,
        patientName: latestRequestEvent.patientName,
        hospital: latestRequestEvent.hospitalName,
        locality: latestRequestEvent.locality,
        units: latestRequestEvent.unitsNeeded,
        bloodGroup: latestRequestEvent.bloodGroup,
        priority: latestRequestEvent.priority,
        requiredBy: latestRequestEvent.requiredBy,
        distanceKm: 2.1,
        responded: false,
      };

      return [newEntry, ...prev];
    });

    showNotice(`Live Realtime Broadcast: ${latestRequestEvent.bloodGroup} urgently requested at ${latestRequestEvent.hospitalName}!`);
  }, [latestRequestEvent, bloodGroup]);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 5000);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900">
                Donor Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                Lifesaver Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Logged in as <strong className="text-charcoal-900">{fullName}</strong> • Group <strong className="text-brand-700 font-extrabold">{bloodGroup}</strong> • {locality}, Bengaluru
            </p>
          </div>

          {/* Availability Pill */}
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <span className="text-xs font-bold text-charcoal-700">Emergency Standby:</span>
            <button
              type="button"
              disabled={isUpdatingAvailability}
              onClick={handleToggleAvailability}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAvailable
                  ? 'bg-emerald-600 text-white shadow-soft'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span>{isAvailable ? 'Active (Eligible)' : 'Standby (Paused)'}</span>
            </button>
          </div>
        </div>

        {statusNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-medium">{statusNotice}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Matching Requests ({incomingRequests.filter(r => !r.responded).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Complete Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Availability & Radii</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Donation History</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card bordered padded className="space-y-1">
                <span className="text-xs font-bold text-charcoal-500 uppercase">Your Blood Group</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-3xl font-black text-brand-700">{bloodGroup}</span>
                  <Badge bloodGroup={bloodGroup} size="lg" />
                </div>
                <p className="text-[11px] text-charcoal-500">ABO & Rh Confirmed</p>
              </Card>

              <Card bordered padded className="space-y-1">
                <span className="text-xs font-bold text-charcoal-500 uppercase">90-Day Donation Rest</span>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xl font-black ${isEligibleToDonate ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isEligibleToDonate ? 'Eligible Now' : `${daysRemainingFor90} Days Left`}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${isEligibleToDonate ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                </div>
                <p className="text-[11px] text-charcoal-500">
                  {isEligibleToDonate ? `${daysSinceLastDonation} days since last donation` : `Next eligible on ${nextEligibleDate}`}
                </p>
              </Card>

              <Card bordered padded className="space-y-1">
                <span className="text-xs font-bold text-charcoal-500 uppercase">Active Radius</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-3xl font-black text-charcoal-900">{notificationRadius} km</span>
                  <MapPin className="w-6 h-6 text-brand-600" />
                </div>
                <p className="text-[11px] text-charcoal-500">Centered around {locality}</p>
              </Card>

              <Card bordered padded className="space-y-1">
                <span className="text-xs font-bold text-charcoal-500 uppercase">Privacy Protocol</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-emerald-700">DPDP Shield Active</span>
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-[11px] text-charcoal-500">Zero public phone scrapers</p>
              </Card>
            </div>

            {/* Quick Emergency Requisition Alert Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-brand-700" />
                  <h3 className="text-base font-bold text-charcoal-900">
                    Live Emergency Broadcasts in Your Radius
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={simulateIncomingEmergency}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-xl border border-brand-200 transition-colors"
                    title="Simulate an emergency requisition dispatch in real time"
                  >
                    <Radio className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                    <span>Simulate Realtime Ping</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-bold text-brand-700 hover:underline"
                  >
                    View All ({incomingRequests.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingRequests.slice(0, 2).map((req) => (
                  <div key={req.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge priority={req.priority} size="sm" />
                      <span className="text-xs font-bold text-charcoal-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {req.requiredBy}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-charcoal-900">{req.patientName}</h4>
                      <p className="text-xs text-charcoal-600 flex items-center gap-1 mt-0.5">
                        <Hospital className="w-3.5 h-3.5 text-brand-600" />
                        <span>{req.hospital}</span>
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
                      <span className="text-charcoal-500 font-medium">~{req.distanceKm} km from {locality}</span>
                      {req.responded ? (
                        <span className="font-bold text-emerald-700">Responded</span>
                      ) : (
                        <Button
                          variant="emergency"
                          size="sm"
                          onClick={() => handleRespond(req.id, 'ACCEPTED')}
                          className="px-3 py-1 text-xs"
                        >
                          I Can Help
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLETE DONOR PROFILE */}
        {activeTab === 'profile' && (
          <Card bordered padded className="max-w-3xl mx-auto space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-charcoal-900">Complete Donor Profile</h2>
              <p className="text-xs text-charcoal-500">
                Your medical identity is protected. Contact information is only shared with authorized requesters upon mutual consent.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); showNotice('Profile details saved successfully.'); }} className="space-y-4">
              
              {/* Blood group */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                  Confirmed Blood Group:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ALL_BLOOD_GROUPS.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setBloodGroup(grp)}
                      className={`py-2 rounded-xl font-black text-xs border transition-all ${
                        bloodGroup === grp
                          ? 'bg-brand-700 text-white border-brand-800 shadow-soft'
                          : 'bg-white text-charcoal-800 border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Legal Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                    Bengaluru Locality *
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => {
                      setLocality(e.target.value);
                      const loc = BENGALURU_LOCALITIES.find(l => l.name === e.target.value);
                      if (loc) setPincode(loc.pincode);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    {BENGALURU_LOCALITIES.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} (PIN {loc.pincode}, {loc.zone} Zone)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Postal PIN Code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                    Mobile Phone Verification
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      leftIcon={<Phone className="w-4 h-4" />}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={isPhoneVerified ? 'outline' : 'primary'}
                      size="md"
                      onClick={() => setIsPhoneModalOpen(true)}
                      className="shrink-0 text-xs"
                    >
                      {isPhoneVerified ? 'Verified ✓' : 'Verify OTP'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Consent-based approximate GPS */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-bold text-charcoal-900">Approximate Location Precision</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRequestGps}
                    isLoading={isAcquiringGps}
                    className="text-xs"
                  >
                    Update Coarse GPS
                  </Button>
                </div>
                <p className="text-[11px] text-charcoal-500 leading-relaxed">
                  Status: <strong className="text-charcoal-700">{gpsStatus}</strong>. We intentionally blur donor coordinates by ~1.1 km to ensure your home address cannot be identified.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="md" type="submit">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* TAB 3: SETTINGS & RADIUS */}
        {activeTab === 'settings' && (
          <Card bordered padded className="max-w-3xl mx-auto space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-charcoal-900">Availability & Notification Preferences</h2>
              <p className="text-xs text-charcoal-500">
                Control when you are notified, your maximum travel distance, and notification channels.
              </p>
            </div>

            {/* Notification radius */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex justify-between">
                <span>Maximum Emergency Travel Radius:</span>
                <span className="text-brand-700 font-extrabold text-sm">{notificationRadius} km</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 15, 25].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setNotificationRadius(km)}
                    className={`py-3 rounded-xl font-bold text-xs border transition-colors ${
                      notificationRadius === km
                        ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-soft'
                        : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {km} km Radius
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-charcoal-500">
                You will only receive emergency broadcasts from hospital blood centres within {notificationRadius} km of {locality}.
              </p>
            </div>

            {/* Channels checklist */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                Notification Channels:
              </span>
              <div className="space-y-2 text-xs text-charcoal-700">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold block text-charcoal-900">Browser Push Notifications (High Urgency)</span>
                    <span className="text-charcoal-500 text-[11px]">Instant audio alert on phone or desktop when an emergency match occurs.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold block text-charcoal-900">Transactional SMS Gateway (Critical Cases)</span>
                    <span className="text-charcoal-500 text-[11px]">Direct SMS dispatch with hospital location link for immediate trauma calls.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold block text-charcoal-900">Email Requisitions</span>
                    <span className="text-charcoal-500 text-[11px]">Standard priority summaries and scheduled donation reminders.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Privacy DPDP Toggle */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold">Privacy Consent Protocol</span>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-emerald-900">
                <input
                  type="checkbox"
                  checked={phoneConsentOnlyOnAccept}
                  onChange={(e) => setPhoneConsentOnlyOnAccept(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <strong>Strict Consent:</strong> Do not release my contact phone number until I explicitly click "I Can Donate" for a verified request.
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => showNotice('Notification preferences successfully saved.')}
              >
                Save Preferences
              </Button>
            </div>
          </Card>
        )}

        {/* TAB 4: INCOMING MATCHED REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">
                  Live Emergency Requisitions for Group {bloodGroup}
                </h2>
                <p className="text-xs text-charcoal-500">
                  Broadcasts within your {notificationRadius} km Bengaluru radius.
                </p>
              </div>
              <Badge bloodGroup={bloodGroup} size="lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
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
                        <span>{req.locality} (~{req.distanceKm} km away)</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                      <span className="text-charcoal-500">Target Demand:</span>
                      <strong className="text-charcoal-900">{req.units} Units of {req.bloodGroup}</strong>
                    </div>
                  </div>

                  {req.responded ? (
                    <div className={`p-3 rounded-xl text-center text-xs font-bold ${
                      req.responseType === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.responseType === 'ACCEPTED' 
                        ? '✓ Accepted — Contact details released to hospital attendant' 
                        : 'Declined for this request'}
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
        )}

        {/* TAB 5: DONATION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Your Donation Milestones</h2>
                <p className="text-xs text-charcoal-500">
                  Verified transfusion contributions logged by licensed Karnataka blood centres.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Gold Donor Status (3+ Donations)</span>
                </span>
              </div>
            </div>

            <Card bordered padded className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-charcoal-500 uppercase tracking-wider font-semibold">
                      <th className="pb-3">Donation Date</th>
                      <th className="pb-3">Receiving Blood Centre</th>
                      <th className="pb-3">Component Donated</th>
                      <th className="pb-3">Certificate / Registry ID</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donationHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-bold text-charcoal-900 flex items-center gap-1.5">
                          <CalendarCheck className="w-4 h-4 text-emerald-600" />
                          <span>{item.date}</span>
                        </td>
                        <td className="py-3.5 text-charcoal-800 font-medium">{item.centre}</td>
                        <td className="py-3.5 text-charcoal-600">{item.type}</td>
                        <td className="py-3.5 font-mono text-charcoal-500">{item.certificateId}</td>
                        <td className="py-3.5 text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Right to Erasure / DPDP Account Deletion */}
            <div className="rounded-2xl bg-white p-5 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Right to Erasure (Indian DPDP Act)</span>
                </span>
                <p className="text-xs text-charcoal-600">
                  Permanently delete your donor registry record, contact logs, and history. This action is irreversible.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs shrink-0"
                onClick={() => {
                  if (window.confirm('Are you sure you wish to exercise your DPDP Right to Erasure? Your donor record will be purged from active matching.')) {
                    showNotice('Erasure request submitted. Your profile will be deleted per DPDP timelines.');
                  }
                }}
              >
                Delete My Donor Account
              </Button>
            </div>
          </div>
        )}

        {/* Modal: Phone verification */}
        <PhoneVerificationModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          phone={phone}
          onVerified={() => {
            setIsPhoneVerified(true);
            showNotice('Mobile phone successfully verified with 2-Factor OTP.');
          }}
        />

      </div>
    </div>
  );
};
