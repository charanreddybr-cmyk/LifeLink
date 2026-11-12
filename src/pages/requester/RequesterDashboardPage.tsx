import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertCircle, 
  PlusCircle, 
  Hospital, 
  MapPin, 
  Users, 
  CheckCircle, 
  Clock, 
  Phone
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import type { BloodGroup, RequestStatus, EmergencyPriority } from '../../types/blood.types';

interface RequesterDashboardPageProps {
  onCreateRequest: () => void;
}

interface ActiveRequestItem {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  hospital: string;
  locality: string;
  status: RequestStatus;
  priority: EmergencyPriority;
  requiredBy: string;
  createdAgo: string;
  responses: Array<{
    donorName: string;
    bloodGroup: BloodGroup;
    phone: string;
    status: string;
    locality: string;
  }>;
}

export const RequesterDashboardPage: React.FC<RequesterDashboardPageProps> = ({
  onCreateRequest,
}) => {
  const { profile, requesterProfile } = useAuth();

  const [activeRequests, setActiveRequests] = useState<ActiveRequestItem[]>([
    {
      id: 'REQ-BLR-8421',
      patientName: 'Anand Kumar (ICU Bed 4)',
      bloodGroup: 'O+',
      unitsNeeded: 2,
      unitsFulfilled: 1,
      hospital: 'Victoria Hospital (BMCRI Blood Centre)',
      locality: 'KR Market, Bengaluru',
      status: 'RESPONSES_RECEIVED',
      priority: 'CRITICAL',
      requiredBy: 'Today by 11:30 PM',
      createdAgo: '45 mins ago',
      responses: [
        { donorName: 'Karthik R.', bloodGroup: 'O+', phone: '98450***** (Released)', status: 'ACCEPTED', locality: 'Indiranagar (1.8 km)' }
      ]
    }
  ]);

  const handleMarkFulfilled = (id: string) => {
    setActiveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'FULFILLED', unitsFulfilled: r.unitsNeeded } : r));
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900">
                Requester Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                Patient Attendant Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Logged in as <strong className="text-charcoal-800">{profile?.full_name || 'Requester'}</strong>. Affiliation: {requesterProfile?.hospital_affiliation || 'Bengaluru Emergency Services'}.
            </p>
          </div>

          <Button
            variant="emergency"
            size="md"
            onClick={onCreateRequest}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Post Emergency Request
          </Button>
        </div>

        {/* Requests Management Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-charcoal-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-brand-700" />
              <span>Your Active Requisitions ({activeRequests.length})</span>
            </h2>
            <span className="text-xs font-semibold text-charcoal-500">Real-time status updates enabled</span>
          </div>

          {activeRequests.map((req) => (
            <Card key={req.id} bordered padded className="space-y-6">
              
              {/* Request Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Badge bloodGroup={req.bloodGroup} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-charcoal-900">{req.patientName}</h3>
                      <span className="font-mono text-xs text-charcoal-400 font-semibold">{req.id}</span>
                    </div>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                      <Hospital className="w-3.5 h-3.5 text-brand-600" />
                      <span>{req.hospital} — {req.locality}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge priority={req.priority} size="sm" />
                  <Badge status={req.status} size="sm" />
                </div>
              </div>

              {/* Progress & Fulfill stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase text-charcoal-500 block">Units Progress</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-brand-700">{req.unitsFulfilled}</span>
                    <span className="text-sm font-semibold text-charcoal-500">/ {req.unitsNeeded} Units Fulfilled</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-charcoal-500 block">Required By</span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-charcoal-800">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>{req.requiredBy}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  {req.status !== 'FULFILLED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkFulfilled(req.id)}
                      leftIcon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
                    >
                      Mark as Fulfilled
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      Request Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Responding Donors */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-700" />
                  <span>Responding Donors Who Accepted ({req.responses.length})</span>
                </h4>

                <div className="space-y-2">
                  {req.responses.map((resp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Badge bloodGroup={resp.bloodGroup} size="sm" />
                        <div>
                          <span className="font-bold text-sm text-charcoal-900 block">{resp.donorName}</span>
                          <span className="text-xs text-charcoal-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {resp.locality}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {resp.phone}
                        </span>
                        <a
                          href="tel:9845012345"
                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Donor</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};
