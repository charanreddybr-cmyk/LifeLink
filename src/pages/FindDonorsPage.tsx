import React, { useState, useMemo } from 'react';
import {
  MapPin,
  AlertCircle,
  Heart,
  PhoneOff,
  Map as MapIcon,
  Grid,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Navigation,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import {
  ALL_BLOOD_GROUPS,
  BLOOD_COMPONENTS,
} from '../types/blood.types';
import type { BloodGroup, BloodComponentType } from '../types/blood.types';
import {
  BENGALURU_LOCALITIES,
  BENGALURU_EMERGENCY_HOSPITALS,
} from '../data/bengaluruLocalities';
import { BENGALURU_MOCK_DONORS } from '../data/mockDonors';
import {
  runMatchingEngine,
} from '../utils/matchingEngine';
import type { MatchingCriteria } from '../utils/matchingEngine';
import { requestConsentedLocation } from '../utils/geoUtils';
import type { Coordinates } from '../utils/geoUtils';
import { ProximityMap } from '../components/map/ProximityMap';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface FindDonorsPageProps {
  onRequestEmergency: (bloodGroup?: BloodGroup, localityId?: string) => void;
  onRegisterDonor: () => void;
}

export const FindDonorsPage: React.FC<FindDonorsPageProps> = ({
  onRequestEmergency,
  onRegisterDonor,
}) => {
  // Matching criteria state
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O+');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponentType>('PRBC');
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(15);
  const [exactMatchOnly, setExactMatchOnly] = useState<boolean>(false);
  const [hideIneligible, setHideIneligible] = useState<boolean>(false);

  // Target Location state (Default to Manipal Hospital / Indiranagar central cluster)
  const [targetType, setTargetType] = useState<'hospital' | 'locality' | 'gps'>('hospital');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    BENGALURU_EMERGENCY_HOSPITALS[3]?.id || 'hosp-4' // Manipal Hospital
  );
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('loc-1'); // Indiranagar
  const [gpsCoords, setGpsCoords] = useState<Coordinates | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // View mode: Map vs Cards
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');

  // Broadcast feedback toast
  const [broadcastNotification, setBroadcastNotification] = useState<string | null>(null);

  // Compute active target coordinates & label
  const { activeCoords, activeTargetName } = useMemo(() => {
    if (targetType === 'gps' && gpsCoords) {
      return {
        activeCoords: gpsCoords,
        activeTargetName: 'Consented Device Location (~1.1 km coarse blur)',
      };
    }
    if (targetType === 'locality') {
      const loc = BENGALURU_LOCALITIES.find((l) => l.id === selectedLocalityId);
      if (loc) {
        return {
          activeCoords: loc.coordinates,
          activeTargetName: `${loc.name} (${loc.zone} Bengaluru)`,
        };
      }
    }
    // Default to Hospital
    const hosp = BENGALURU_EMERGENCY_HOSPITALS.find((h) => h.id === selectedHospitalId);
    if (hosp) {
      return {
        activeCoords: hosp.coordinates,
        activeTargetName: hosp.name,
      };
    }
    return {
      activeCoords: { lat: 12.9583, lng: 77.6489 },
      activeTargetName: 'Manipal Hospital Blood Centre',
    };
  }, [targetType, selectedHospitalId, selectedLocalityId, gpsCoords]);

  // Request GPS Location with privacy blur
  const handleRequestGps = async () => {
    setGpsLoading(true);
    setGpsError(null);
    const result = await requestConsentedLocation();
    setGpsLoading(false);
    if (result.success && result.coords) {
      setGpsCoords(result.coords);
      setTargetType('gps');
    } else {
      setGpsError(result.error || 'Failed to obtain device location');
    }
  };

  // Run the clinical proximity matching engine
  const matchingSummary = useMemo(() => {
    const criteria: MatchingCriteria = {
      bloodGroup: selectedGroup,
      component: selectedComponent,
      targetCoordinates: activeCoords,
      searchRadiusKm,
      exactMatchOnly,
      hospitalName: activeTargetName,
    };
    return runMatchingEngine(BENGALURU_MOCK_DONORS, criteria);
  }, [selectedGroup, selectedComponent, activeCoords, searchRadiusKm, exactMatchOnly, activeTargetName]);

  const displayedMatches = useMemo(() => {
    if (hideIneligible) {
      return matchingSummary.matches.filter((m) => m.isEligibleOverall);
    }
    return matchingSummary.matches;
  }, [matchingSummary.matches, hideIneligible]);

  const handleBroadcastAlert = (count: number) => {
    setBroadcastNotification(
      `Dispatched emergency alert notification to ${count} eligible donor(s) within ${searchRadiusKm} km.`
    );
    setTimeout(() => {
      setBroadcastNotification(null);
    }, 6000);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                Phase 5: Preliminary Proximity Matching Engine
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                DPDP Coarse Geofencing
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
              Verified Donor Proximity & Matching Engine
            </h1>
            <p className="text-sm text-charcoal-600 max-w-2xl">
              Real-time clinical compatibility and Haversine distance engine. Matches patients requiring blood or components with nearby eligible donors while protecting civic privacy.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="emergency"
              size="md"
              onClick={() => onRequestEmergency(selectedGroup, selectedLocalityId)}
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

        {/* DPDP Civic Privacy Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start sm:items-center gap-3 text-xs text-emerald-950 shadow-soft-sm">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5 sm:mt-0">
            <PhoneOff className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            <span className="font-black">Civic Privacy Guarantee (DPDP Act):</span>
            <p className="text-emerald-900 leading-relaxed">
              Donors' exact home GPS coordinates and telephone numbers are encrypted and suppressed. Matching is conducted using coarse (~1.1 km) geographic blur zones. Attendants only receive donor contact upon authenticated hospital verification and explicit donor acceptance.
            </p>
          </div>
        </div>

        {/* Broadcast Toast Notification */}
        {broadcastNotification && (
          <div className="p-4 rounded-2xl bg-brand-700 text-white flex items-center justify-between shadow-soft-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{broadcastNotification}</span>
            </div>
            <button
              onClick={() => setBroadcastNotification(null)}
              className="text-xs text-white/80 hover:text-white px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Interactive Query & Filtering Control Center */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-6">
          
          {/* Target Center Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-600" />
                Step 1: Set Hospital or Origin Center
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTargetType('hospital')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    targetType === 'hospital'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  Hospital Centers
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('locality')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    targetType === 'locality'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  Localities
                </button>
                <button
                  type="button"
                  onClick={handleRequestGps}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                    targetType === 'gps'
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>{gpsLoading ? 'Locating...' : 'Use Consented GPS'}</span>
                </button>
              </div>
            </div>

            {targetType === 'hospital' && (
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {BENGALURU_EMERGENCY_HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.locality} ({h.pincode})
                  </option>
                ))}
              </select>
            )}

            {targetType === 'locality' && (
              <select
                value={selectedLocalityId}
                onChange={(e) => setSelectedLocalityId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {BENGALURU_LOCALITIES.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} — {loc.zone} Bengaluru ({loc.pincode})
                  </option>
                ))}
              </select>
            )}

            {targetType === 'gps' && gpsCoords && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">Consented Privacy Blurred Coordinates:</span>{' '}
                  {gpsCoords.lat.toFixed(2)}°N, {gpsCoords.lng.toFixed(2)}°E (~1.1 km precision)
                </div>
                <button
                  type="button"
                  onClick={() => setTargetType('hospital')}
                  className="text-xs font-bold text-blue-700 underline"
                >
                  Change to Hospital
                </button>
              </div>
            )}

            {gpsError && (
              <p className="text-xs text-brand-600 mt-1 font-semibold">{gpsError}</p>
            )}
          </div>

          {/* Blood Group & Component Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 border-t border-slate-100">
            {/* Blood group */}
            <div className="md:col-span-7 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                Step 2: Patient Blood Group Needed
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {ALL_BLOOD_GROUPS.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-3.5 py-2 text-xs font-black rounded-xl border transition-all ${
                      selectedGroup === grp
                        ? 'bg-brand-700 text-white border-brand-800 shadow-soft scale-105'
                        : 'bg-white text-charcoal-700 border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Component */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                Required Blood Component
              </label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value as BloodComponentType)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {BLOOD_COMPONENTS.map((comp) => (
                  <option key={comp.type} value={comp.type}>
                    {comp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Proximity Radius & Strict Filter Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Search Radius:
                </label>
                <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                  {searchRadiusKm} km
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 25, 50].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setSearchRadiusKm(radius)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      searchRadiusKm === radius
                        ? 'bg-charcoal-900 text-white border-charcoal-900'
                        : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-charcoal-700 select-none">
                <input
                  type="checkbox"
                  checked={exactMatchOnly}
                  onChange={(e) => setExactMatchOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="font-semibold">Exact Blood Match Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-charcoal-700 select-none">
                <input
                  type="checkbox"
                  checked={hideIneligible}
                  onChange={(e) => setHideIneligible(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="font-semibold">Hide Cooldown & Ineligible</span>
              </label>
            </div>
          </div>
        </div>

        {/* Engine Match Summary Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
              Evaluated In Area
            </span>
            <div className="text-2xl font-black text-charcoal-900">
              {matchingSummary.totalCandidates}
            </div>
            <span className="text-[11px] text-charcoal-500">Registered donors</span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-soft-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Eligible For Dispatch
            </span>
            <div className="text-2xl font-black text-emerald-900">
              {matchingSummary.eligibleCount}
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold">
              {matchingSummary.exactMatchesCount} exact · {matchingSummary.compatibleMatchesCount} compatible
            </span>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-soft-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Within {searchRadiusKm} km
            </span>
            <div className="text-2xl font-black text-blue-900">
              {matchingSummary.totalCandidates - matchingSummary.ineligibleBreakdown.outsideRadius}
            </div>
            <span className="text-[11px] text-blue-800">Geographic proximity</span>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-soft-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Ineligible / Cooldown
            </span>
            <div className="text-2xl font-black text-amber-900">
              {matchingSummary.ineligibleCount}
            </div>
            <span className="text-[11px] text-amber-800">
              {matchingSummary.ineligibleBreakdown.cooldownActive} rest active
            </span>
          </div>
        </div>

        {/* View Switcher & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-600 mr-2">
              Display Mode:
            </span>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-soft'
                  : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Proximity Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-soft'
                  : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Donor Cards View ({displayedMatches.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="emergency"
              size="sm"
              disabled={matchingSummary.eligibleCount === 0}
              onClick={() => handleBroadcastAlert(matchingSummary.eligibleCount)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Broadcast Emergency Ping ({matchingSummary.eligibleCount} Eligible)
            </Button>
          </div>
        </div>

        {/* Dynamic View: Leaflet Map or Card List */}
        {viewMode === 'map' ? (
          <div className="space-y-4">
            <ProximityMap
              targetCoords={activeCoords}
              targetName={activeTargetName}
              searchRadiusKm={searchRadiusKm}
              targetBloodGroup={selectedGroup}
              targetComponent={selectedComponent}
              evaluatedMatches={displayedMatches}
              showIneligible={!hideIneligible}
              height="540px"
              onRequestAlert={() => handleBroadcastAlert(1)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedMatches.map((match) => {
              const donor = match.candidate;
              return (
                <Card
                  key={donor.id}
                  bordered
                  hoverable
                  padded
                  className={`flex flex-col justify-between space-y-4 ${
                    !match.isEligibleOverall ? 'opacity-80 bg-slate-50/70' : 'bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge bloodGroup={donor.bloodGroup} size="lg" />
                        {match.isExactMatch ? (
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Exact Match
                          </span>
                        ) : match.isCompatible ? (
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Compatible
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Incompatible
                          </span>
                        )}
                      </div>

                      {match.isEligibleOverall ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <XCircle className="w-3 h-3" />
                          Restricted
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-charcoal-900">{donor.maskedName}</h3>
                        <span className="text-xs font-black text-brand-700">
                          Score: {match.matchScore} pts
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        <span>
                          {donor.locality} ({donor.zone} BLR)
                        </span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-charcoal-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-charcoal-400">Distance from hospital:</span>
                        <span className="font-bold text-charcoal-800">
                          ~{match.distanceKm} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-400">Medical 90-Day Interval:</span>
                        <span
                          className={`font-semibold ${
                            match.isRestCleared ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {match.isRestCleared
                            ? `${match.daysSinceLastDonation} days cleared`
                            : `${match.daysUntilEligible} days cooldown left`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-400">Phone Verification:</span>
                        <span className="font-semibold text-charcoal-800">
                          {donor.phoneVerified ? 'Verified (OTP Active)' : 'Pending OTP'}
                        </span>
                      </div>
                    </div>

                    {/* Ineligibility alerts if any */}
                    {!match.isEligibleOverall && match.ineligibilityReasons.length > 0 && (
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                        <span className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-800">
                          <Clock className="w-3 h-3" />
                          Clinical Ineligibility:
                        </span>
                        {match.ineligibilityReasons.map((reason, i) => (
                          <p key={i} className="text-[10px] leading-tight">
                            • {reason}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant={match.isEligibleOverall ? 'outline' : 'outline'}
                    size="sm"
                    disabled={!match.isEligibleOverall}
                    onClick={() => handleBroadcastAlert(1)}
                    className="w-full text-xs font-bold justify-center"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {match.isEligibleOverall ? 'Send Emergency Ping' : 'Restricted Cooldown'}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
