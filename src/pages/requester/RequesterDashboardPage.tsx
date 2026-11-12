import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, 
  Hospital, 
  MapPin, 
  Users, 
  CheckCircle, 
  Phone,
  ShieldCheck,
  XCircle,
  ArrowRight,
  Map as MapIcon,
  Send,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ProximityMap } from '../../components/map/ProximityMap';
import { runMatchingEngine } from '../../utils/matchingEngine';
import { BENGALURU_MOCK_DONORS } from '../../data/mockDonors';
import { BENGALURU_EMERGENCY_HOSPITALS, BENGALURU_LOCALITIES } from '../../data/bengaluruLocalities';
import type { Coordinates } from '../../utils/geoUtils';
import type { 
  BloodGroup, 
  DetailedBloodRequest 
} from '../../types/blood.types';
import { CreateEmergencyRequestWizard } from '../../components/emergency/CreateEmergencyRequestWizard';

interface RequesterDashboardPageProps {
  onCreateRequest: () => void;
}

export const RequesterDashboardPage: React.FC<RequesterDashboardPageProps> = () => {
  const { profile, requesterProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'create' | 'fulfilled'>('requests');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('REQ-BLR-8421');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Proximity Map Modal State
  const [mapModalRequest, setMapModalRequest] = useState<DetailedBloodRequest | null>(null);
  const [modalRadiusKm, setModalRadiusKm] = useState<number>(15);
  const [modalExactOnly, setModalExactOnly] = useState<boolean>(false);
  const [modalAlertSuccess, setModalAlertSuccess] = useState<string | null>(null);

  const getRequisitionCoordinates = (req: DetailedBloodRequest): Coordinates => {
    const hosp = BENGALURU_EMERGENCY_HOSPITALS.find(
      (h) =>
        h.name.toLowerCase().includes(req.hospitalName.toLowerCase()) ||
        req.hospitalName.toLowerCase().includes(h.name.toLowerCase())
    );
    if (hosp) return hosp.coordinates;
    const loc = BENGALURU_LOCALITIES.find(
      (l) =>
        l.name.toLowerCase().includes(req.locality.toLowerCase()) ||
        req.locality.toLowerCase().includes(l.name.toLowerCase())
    );
    if (loc) return loc.coordinates;
    return { lat: 12.9629, lng: 77.5746 };
  };

  // List of requests
  const [requestsList, setRequestsList] = useState<DetailedBloodRequest[]>([
    {
      id: 'REQ-BLR-8421',
      patientName: 'Anand Kumar (ICU Bed 4)',
      patientAge: 42,
      bloodGroup: 'O+',
      component: 'PRBC',
      unitsNeeded: 2,
      unitsFulfilled: 1,
      hospitalName: 'Victoria Hospital (BMCRI Blood Centre)',
      hospitalAddress: 'Near City Market, Fort Road, Bengaluru',
      locality: 'Fort, KR Market',
      city: 'Bengaluru',
      pincode: '560002',
      wardRoom: 'ICU Bed 4, Block B',
      priority: 'CRITICAL',
      requiredBy: 'Today by 11:30 PM',
      contactPerson: 'Suresh Kumar',
      contactPhone: '9845012345',
      relationshipToPatient: 'Brother',
      requisitionSlipNumber: 'BMCRI-ICU-8821',
      isVerified: true,
      verificationSource: 'DOCTOR_PRESCRIPTION',
      status: 'RESPONSES_RECEIVED',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      responsesCount: 2,
    },
    {
      id: 'REQ-BLR-8422',
      patientName: 'Geetha Devi (Maternal Emergency)',
      patientAge: 29,
      bloodGroup: 'B-',
      component: 'WHOLE_BLOOD',
      unitsNeeded: 3,
      unitsFulfilled: 0,
      hospitalName: 'Bowring and Lady Curzon Hospital',
      hospitalAddress: 'Lady Curzon Road, Tasker Town, Shivajinagar, Bengaluru',
      locality: 'Shivajinagar',
      city: 'Bengaluru',
      pincode: '560001',
      wardRoom: 'Labour Ward 2',
      priority: 'CRITICAL',
      requiredBy: 'Within 2 hours',
      contactPerson: 'Kavitha R',
      contactPhone: '9845067890',
      relationshipToPatient: 'Sister',
      isVerified: true,
      verificationSource: 'TELE_VERIFIED',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      responsesCount: 0,
    }
  ]);

  // Simulated donor responses mapped to requests
  const [donorResponses] = useState<Record<string, Array<{
    donorId: string;
    donorName: string;
    bloodGroup: BloodGroup;
    locality: string;
    distanceKm: number;
    phone: string;
    status: 'ACCEPTED' | 'COMPLETED';
    respondedAgo: string;
  }>>>({
    'REQ-BLR-8421': [
      {
        donorId: 'DNR-101',
        donorName: 'Karthik R.',
        bloodGroup: 'O+',
        locality: 'Indiranagar',
        distanceKm: 2.1,
        phone: '9845012345',
        status: 'ACCEPTED',
        respondedAgo: '20 mins ago',
      },
      {
        donorId: 'DNR-102',
        donorName: 'Sneha M.',
        bloodGroup: 'O+',
        locality: 'Koramangala',
        distanceKm: 3.4,
        phone: '9845098765',
        status: 'ACCEPTED',
        respondedAgo: '12 mins ago',
      }
    ]
  });

  const selectedRequest = requestsList.find(r => r.id === selectedRequestId) || requestsList[0];
  const activeRequests = requestsList.filter(r => r.status !== 'FULFILLED' && r.status !== 'CANCELLED');
  const fulfilledRequests = requestsList.filter(r => r.status === 'FULFILLED' || r.status === 'CANCELLED');

  const handleMarkFulfilled = (id: string) => {
    setRequestsList(prev => prev.map(r => r.id === id ? { 
      ...r, 
      status: 'FULFILLED', 
      unitsFulfilled: r.unitsNeeded 
    } : r));
    showNotice(`Request ${id} has been marked as Fulfilled. Transfusion units successfully logged.`);
  };

  const handleCancelRequest = (id: string) => {
    if (window.confirm('Are you sure you wish to cancel this emergency requisition? Nearby donors will be notified.')) {
      setRequestsList(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
      showNotice(`Request ${id} has been cancelled.`);
    }
  };

  const handleCreatedSuccess = (newReq: DetailedBloodRequest) => {
    setRequestsList(prev => [newReq, ...prev]);
    setSelectedRequestId(newReq.id);
    setActiveTab('requests');
    showNotice(`Emergency request ${newReq.id} broadcast successfully across ${newReq.locality} radius!`);
  };

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
                Patient Attendant Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                Requester Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Logged in as <strong className="text-charcoal-900">{profile?.full_name || 'Emergency Attendant'}</strong> • {requesterProfile?.hospital_affiliation || 'Bengaluru Emergency Network'}
            </p>
          </div>

          <Button
            variant="emergency"
            size="md"
            onClick={() => setActiveTab('create')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Emergency Requisition
          </Button>
        </div>

        {statusNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-medium">{statusNotice}</p>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'requests'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            Active Requisitions ({activeRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Requisition Wizard</span>
          </button>
          <button
            onClick={() => setActiveTab('fulfilled')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'fulfilled'
                ? 'bg-brand-700 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            Fulfilled & Closed ({fulfilledRequests.length})
          </button>
        </div>

        {/* VIEW 1: ACTIVE REQUESTS & RESPONSES */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Requests List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-base font-bold text-charcoal-900 flex items-center justify-between">
                <span>Active Broadcasts</span>
                <span className="text-xs font-normal text-charcoal-500">Select to view donor responses</span>
              </h2>

              <div className="space-y-3">
                {activeRequests.map((req) => {
                  const isSelected = selectedRequestId === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-brand-600 shadow-soft-md ring-2 ring-brand-100'
                          : 'bg-white border-slate-200/90 shadow-soft-sm hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Badge bloodGroup={req.bloodGroup} size="sm" />
                          <span className="font-mono text-xs font-bold text-charcoal-800">{req.id}</span>
                        </div>
                        <Badge priority={req.priority} size="sm" />
                      </div>

                      <div className="pt-2 space-y-1">
                        <h4 className="font-bold text-sm text-charcoal-900">{req.patientName}</h4>
                        <p className="text-xs text-charcoal-600 flex items-center gap-1">
                          <Hospital className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="truncate">{req.hospitalName}</span>
                        </p>
                      </div>

                      <div className="pt-3 flex items-center justify-between text-xs">
                        <span className="text-charcoal-500">
                          Progress: <strong className="text-charcoal-800">{req.unitsFulfilled}/{req.unitsNeeded} Units</strong>
                        </span>
                        <span className="font-bold text-brand-700 flex items-center gap-1">
                          <span>Responses: {donorResponses[req.id]?.length || 0}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Request Detailed Inspector (7 cols) */}
            <div className="lg:col-span-7">
              {selectedRequest ? (
                <Card bordered padded className="space-y-6">
                  
                  {/* Detailed Request Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white font-black text-2xl flex items-center justify-center shadow-soft shrink-0">
                        {selectedRequest.bloodGroup}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-charcoal-900">{selectedRequest.patientName}</h3>
                          <span className="font-mono text-xs text-charcoal-400 font-semibold">{selectedRequest.id}</span>
                        </div>
                        <p className="text-xs text-charcoal-600 flex items-center gap-1">
                          <Hospital className="w-3.5 h-3.5 text-brand-600" />
                          <span>{selectedRequest.hospitalName} ({selectedRequest.wardRoom})</span>
                        </p>
                        <p className="text-xs text-charcoal-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                          <span>{selectedRequest.locality}, Bengaluru (PIN {selectedRequest.pincode})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge priority={selectedRequest.priority} size="sm" />
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedRequest.isVerified
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <ShieldCheck className="w-3 h-3" />
                        {selectedRequest.isVerified ? 'Verified Requisition' : 'Verification Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Units Progress Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-charcoal-700">
                      <span>Transfusion Units Fulfilled:</span>
                      <span className="text-brand-700 text-sm">
                        {selectedRequest.unitsFulfilled} of {selectedRequest.unitsNeeded} Units
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (selectedRequest.unitsFulfilled / selectedRequest.unitsNeeded) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1">
                      <span>Component: <strong>{selectedRequest.component}</strong></span>
                      <span>Target: {selectedRequest.requiredBy}</span>
                    </div>
                  </div>

                  {/* Responding Donors Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-brand-700" />
                        <span>Responding Donors Who Accepted ({donorResponses[selectedRequest.id]?.length || 0})</span>
                      </h4>
                      <span className="text-xs text-charcoal-500">Contact details authorized by donor</span>
                    </div>

                    {donorResponses[selectedRequest.id]?.length ? (
                      <div className="space-y-3">
                        {donorResponses[selectedRequest.id].map((resp) => (
                          <div
                            key={resp.donorId}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <Badge bloodGroup={resp.bloodGroup} size="sm" />
                              <div>
                                <span className="font-bold text-sm text-charcoal-900 block">{resp.donorName}</span>
                                <span className="text-xs text-charcoal-500 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{resp.locality} (~{resp.distanceKm} km away) • {resp.respondedAgo}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                +91 {resp.phone}
                              </span>
                              <a
                                href={`tel:${resp.phone}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                        <Users className="w-8 h-8 text-charcoal-400 mx-auto" />
                        <p className="text-xs text-charcoal-600 font-medium">
                          Alert broadcast is active across {selectedRequest.locality} radius. Responding donors will appear here immediately upon accepting.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelRequest(selectedRequest.id)}
                        className="text-red-600 hover:bg-red-50 text-xs flex-1 sm:flex-none"
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Cancel Requisition
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setModalAlertSuccess(null);
                          setMapModalRequest(selectedRequest);
                        }}
                        className="text-xs font-bold text-brand-700 border-brand-200 hover:bg-brand-50 flex-1 sm:flex-none"
                        leftIcon={<MapIcon className="w-4 h-4 text-brand-600" />}
                      >
                        Live Proximity Map
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarkFulfilled(selectedRequest.id)}
                      className="w-full sm:w-auto text-xs"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      Mark Requisition as Fulfilled
                    </Button>
                  </div>

                </Card>
              ) : null}
            </div>

          </div>
        )}

        {/* VIEW 2: CREATE WIZARD */}
        {activeTab === 'create' && (
          <CreateEmergencyRequestWizard
            onSuccess={handleCreatedSuccess}
            onCancel={() => setActiveTab('requests')}
            existingRequests={requestsList}
          />
        )}

        {/* VIEW 3: FULFILLED & CLOSED */}
        {activeTab === 'fulfilled' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-charcoal-900">
              Fulfilled & Closed Requisitions Archive
            </h2>

            {fulfilledRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fulfilledRequests.map((req) => (
                  <Card key={req.id} bordered padded className="space-y-3 opacity-90">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge bloodGroup={req.bloodGroup} size="sm" />
                        <span className="font-mono text-xs text-charcoal-600 font-bold">{req.id}</span>
                      </div>
                      <Badge status={req.status} size="sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-charcoal-900">{req.patientName}</h4>
                      <p className="text-xs text-charcoal-500">{req.hospitalName}</p>
                    </div>
                    <div className="text-xs text-charcoal-600 pt-1 border-t border-slate-100 flex justify-between">
                      <span>Fulfilled: {req.unitsFulfilled}/{req.unitsNeeded} Units</span>
                      <span>Closed</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card bordered padded className="text-center py-8 text-xs text-charcoal-500">
                No past closed requisitions yet.
              </Card>
            )}
          </div>
        )}

        {/* Proximity Map & Matching Donors Modal */}
        {mapModalRequest && (() => {
          const coords = getRequisitionCoordinates(mapModalRequest);
          const summary = runMatchingEngine(BENGALURU_MOCK_DONORS, {
            bloodGroup: mapModalRequest.bloodGroup,
            component: mapModalRequest.component,
            targetCoordinates: coords,
            searchRadiusKm: modalRadiusKm,
            exactMatchOnly: modalExactOnly,
            hospitalName: mapModalRequest.hospitalName,
          });

          return (
            <Modal
              isOpen={!!mapModalRequest}
              onClose={() => {
                setMapModalRequest(null);
                setModalAlertSuccess(null);
              }}
              title={`Live Proximity Map — ${mapModalRequest.patientName}`}
              description={`Hospital: ${mapModalRequest.hospitalName} • Requested: ${mapModalRequest.unitsNeeded} Units ${mapModalRequest.bloodGroup} (${mapModalRequest.component})`}
              maxWidth="2xl"
            >
              <div className="space-y-4">
                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-700">Search Radius:</span>
                    <div className="flex items-center gap-1">
                      {[5, 10, 15, 25].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setModalRadiusKm(r)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                            modalRadiusKm === r
                              ? 'bg-brand-700 text-white'
                              : 'bg-white border border-slate-200 text-charcoal-700 hover:border-slate-300'
                          }`}
                        >
                          {r} km
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-charcoal-700">
                      <input
                        type="checkbox"
                        checked={modalExactOnly}
                        onChange={(e) => setModalExactOnly(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                      />
                      <span>Exact Match Only</span>
                    </label>
                  </div>
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800 block text-lg font-black">{summary.eligibleCount}</span>
                    <span className="text-emerald-700 text-[11px]">Eligible in Radius</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="font-bold text-blue-800 block text-lg font-black">{summary.exactMatchesCount}</span>
                    <span className="text-blue-700 text-[11px]">Exact Blood Match</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800 block text-lg font-black">{summary.ineligibleBreakdown.cooldownActive}</span>
                    <span className="text-slate-600 text-[11px]">In Cooldown (Rest)</span>
                  </div>
                </div>

                {modalAlertSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                    <span>{modalAlertSuccess}</span>
                  </div>
                )}

                {/* Embedded Leaflet Proximity Map */}
                <ProximityMap
                  targetCoords={coords}
                  targetName={mapModalRequest.hospitalName}
                  searchRadiusKm={modalRadiusKm}
                  targetBloodGroup={mapModalRequest.bloodGroup}
                  targetComponent={mapModalRequest.component}
                  evaluatedMatches={summary.matches}
                  height="360px"
                  onRequestAlert={() => {
                    setModalAlertSuccess('Dispatched emergency alert ping to donor!');
                  }}
                />

                {/* Broadcast Trigger */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-charcoal-500">
                    DPDP Act: Donor home GPS coordinates are obscured by ~1.1 km coarse blur.
                  </span>
                  <Button
                    variant="emergency"
                    size="sm"
                    disabled={summary.eligibleCount === 0}
                    onClick={() => {
                      setModalAlertSuccess(
                        `Successfully broadcast emergency requisition to ${summary.eligibleCount} eligible donor(s) within ${modalRadiusKm} km!`
                      );
                    }}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Broadcast Ping to All ({summary.eligibleCount})
                  </Button>
                </div>
              </div>
            </Modal>
          );
        })()}

      </div>
    </div>
  );
};
