import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { BENGALURU_MOCK_DONORS } from '../../data/mockDonors';
import type { BloodGroup, EmergencyPriority, RequestStatus } from '../../types/blood.types';

interface ModerationRequest {
  id: string;
  patientName: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  priority: EmergencyPriority;
  status: RequestStatus;
  contactPerson: string;
  contactPhone: string;
  requisitionSlipNumber?: string;
  isVerified: boolean;
  createdAt: string;
  suspicionScore: number;
}

interface AuditLogEntry {
  id: string;
  category: 'SECURITY' | 'MODERATION' | 'PRIVACY_DPDP' | 'DATA_ACCESS';
  action: string;
  actor: string;
  targetEntity: string;
  details: string;
  ipBlur: string;
  timestamp: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'donors' | 'audit' | 'notifications'>('overview');

  // Moderation Queue State
  const [moderationRequests, setModerationRequests] = useState<ModerationRequest[]>([
    {
      id: 'REQ-BLR-8421',
      patientName: 'Anand Kumar (ICU Bed 4)',
      hospitalName: 'Victoria Hospital (BMCRI)',
      bloodGroup: 'O+',
      unitsNeeded: 2,
      priority: 'CRITICAL',
      status: 'ACTIVE',
      contactPerson: 'Suresh Kumar',
      contactPhone: '9845012345',
      requisitionSlipNumber: 'BMCRI-ICU-8821',
      isVerified: true,
      createdAt: '45 mins ago',
      suspicionScore: 0,
    },
    {
      id: 'REQ-BLR-8422',
      patientName: 'Geetha Devi (Maternal Emergency)',
      hospitalName: 'Bowring and Lady Curzon Hospital',
      bloodGroup: 'B-',
      unitsNeeded: 3,
      priority: 'CRITICAL',
      status: 'ACTIVE',
      contactPerson: 'Kavitha R',
      contactPhone: '9845067890',
      requisitionSlipNumber: 'BLC-MAT-4412',
      isVerified: true,
      createdAt: '15 mins ago',
      suspicionScore: 5,
    },
    {
      id: 'REQ-BLR-8425',
      patientName: 'Pradeep Gowda',
      hospitalName: 'Private Nursing Clinic, Rajajinagar',
      bloodGroup: 'AB-',
      unitsNeeded: 4,
      priority: 'URGENT',
      status: 'PENDING_VERIFICATION',
      contactPerson: 'Ramesh V',
      contactPhone: '9845099881',
      requisitionSlipNumber: 'UNVERIFIED',
      isVerified: false,
      createdAt: '8 mins ago',
      suspicionScore: 45, // Needs verification
    },
  ]);

  // Donors Management State
  const [donorsList, setDonorsList] = useState(
    BENGALURU_MOCK_DONORS.map((d) => ({
      ...d,
      isSuspended: false,
    }))
  );

  // Security Audit Trail
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-901',
      category: 'MODERATION',
      action: 'APPROVE_REQUISITION',
      actor: 'admin@lifelink.org.in',
      targetEntity: 'REQ-BLR-8421',
      details: 'Prescription verified with BMCRI ICU on-call officer',
      ipBlur: '49.207.201.XX',
      timestamp: '12 mins ago',
    },
    {
      id: 'LOG-902',
      category: 'PRIVACY_DPDP',
      action: 'AUTHORIZE_CONTACT_RELEASE',
      actor: 'donor:Sneha M.',
      targetEntity: 'REQ-BLR-8421',
      details: 'Donor explicitly consented to release phone to attendant Suresh Kumar',
      ipBlur: '106.51.78.XX',
      timestamp: '25 mins ago',
    },
    {
      id: 'LOG-903',
      category: 'SECURITY',
      action: 'BLOCKED_SELF_PROMOTION',
      actor: 'system:trigger',
      targetEntity: 'profile:usr-dev-992',
      details: 'Trigger prevent_self_admin_escalation() rejected unauthorized role escalation attempt',
      ipBlur: '157.49.12.XX',
      timestamp: '1 hour ago',
    },
    {
      id: 'LOG-904',
      category: 'DATA_ACCESS',
      action: 'COARSE_GEO_QUERY',
      actor: 'attendant:REQ-BLR-8422',
      targetEntity: 'locality:Indiranagar',
      details: 'Haversine distance query executed with 1.1 km privacy blur applied',
      ipBlur: '49.207.201.XX',
      timestamp: '2 hours ago',
    },
    {
      id: 'LOG-905',
      category: 'PRIVACY_DPDP',
      action: 'RIGHT_TO_ERASURE_PROCESSED',
      actor: 'system:gdpr_worker',
      targetEntity: 'donor:DNR-BLR-EXPIRED',
      details: 'Completed cryptographic erasure of inactive profile record and anonymized audit trail',
      ipBlur: '127.0.0.1',
      timestamp: '5 hours ago',
    },
  ]);

  const [auditFilter, setAuditFilter] = useState<string>('ALL');
  const [donorSearch, setDonorSearch] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Actions
  const handleVerifyRequest = (id: string) => {
    setModerationRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isVerified: true, status: 'ACTIVE' } : r))
    );
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      category: 'MODERATION',
      action: 'APPROVE_REQUISITION',
      actor: profile?.email || 'admin@lifelink.org.in',
      targetEntity: id,
      details: 'Manually verified and authorized emergency broadcast across Bengaluru network',
      ipBlur: '49.207.201.XX',
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showNotice(`Requisition ${id} authorized and broadcasted to donors!`);
  };

  const handleFlagSuspicious = (id: string) => {
    setModerationRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
    );
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      category: 'SECURITY',
      action: 'FLAG_SPAM_REQUISITION',
      actor: profile?.email || 'admin@lifelink.org.in',
      targetEntity: id,
      details: 'Flagged as suspicious requisition. Broadcast suppressed.',
      ipBlur: '49.207.201.XX',
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showNotice(`Requisition ${id} flagged as suspicious and broadcast suppressed.`);
  };

  const handleToggleDonorSuspension = (id: string) => {
    setDonorsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isSuspended: !d.isSuspended } : d))
    );
    showNotice(`Updated donor account standing for ${id}.`);
  };

  const filteredLogs = auditLogs.filter(
    (l) => auditFilter === 'ALL' || l.category === auditFilter
  );

  const filteredDonors = donorsList.filter(
    (d) =>
      d.maskedName.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.locality.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(donorSearch.toLowerCase())
  );

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900">
                LifeLink Administrative Operations Console
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Admin Clearance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Admin: <strong className="text-charcoal-800">{profile?.email || 'admin@lifelink.org.in'}</strong> • Role-Based Access Control & DPDP Audit Guards Active.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Realtime Security Guard Active</span>
            </span>
          </div>
        </div>

        {/* Global Feedback Notice */}
        {notice && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-soft animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{notice}</span>
          </div>
        )}

        {/* High-level system statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Verified Donors</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-charcoal-900">{donorsList.length}</span>
              <Users className="w-6 h-6 text-brand-600" />
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">Active in Bengaluru Registry</p>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Active Requisitions</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-brand-700">
                {moderationRequests.filter((r) => r.status === 'ACTIVE').length}
              </span>
              <AlertTriangle className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-[11px] text-charcoal-500">Live emergency broadcasts</p>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Pending Review</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-amber-600">
                {moderationRequests.filter((r) => !r.isVerified).length}
              </span>
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-[11px] text-charcoal-500">Requisitions awaiting approval</p>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Security Integrity</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-base font-bold text-emerald-700">DPDP Compliant</span>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-[11px] text-charcoal-500">Row Level Security enforced on all tables</p>
          </Card>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-charcoal-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            Operational Overview
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'moderation'
                ? 'bg-charcoal-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            <span>Requisition Moderation</span>
            {moderationRequests.filter((r) => !r.isVerified).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {moderationRequests.filter((r) => !r.isVerified).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'donors'
                ? 'bg-charcoal-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            Donor Registry Oversight
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'audit'
                ? 'bg-charcoal-900 text-white shadow-soft'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Blood group inventory pool */}
            <div className="lg:col-span-7 space-y-4">
              <Card bordered padded className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-charcoal-900">
                    Registered Donors Blood Group Distribution
                  </h3>
                  <span className="text-xs text-charcoal-500">Bengaluru Urban Pool</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map((grp) => {
                    const count = donorsList.filter((d) => d.bloodGroup === grp).length;
                    return (
                      <div key={grp} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                        <Badge bloodGroup={grp} size="sm" />
                        <span className="block text-xl font-black text-charcoal-900">{count}</span>
                        <span className="text-[10px] text-charcoal-400 font-semibold">donors</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Hospital Coordination Centres */}
              <Card bordered padded className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    <span>Bengaluru Hospital Blood Centre Nodes</span>
                  </h3>
                  <span className="text-xs text-emerald-700 font-bold">All 6 Nodes Active</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal-900 block">Victoria Hospital (BMCRI Blood Centre)</span>
                      <span className="text-charcoal-500">Fort, KR Market • 24/7 Transfusion Node</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Licensed
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal-900 block">Bowring and Lady Curzon Hospital</span>
                      <span className="text-charcoal-500">Shivajinagar • Maternal & Pediatric Node</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Licensed
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal-900 block">NIMHANS Neuro-trauma Blood Centre</span>
                      <span className="text-charcoal-500">Hosur Road • Trauma Apheresis Unit</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Licensed
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Audit Summary */}
            <div className="lg:col-span-5 space-y-4">
              <Card bordered padded className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Recent Security Actions</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs font-bold text-brand-700 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] text-charcoal-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-charcoal-400">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-charcoal-600">{log.details}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-charcoal-900">Emergency Requisition Moderation</h2>
                <p className="text-xs text-charcoal-500">
                  Verify prescription slips, authorize broadcast alerts, or suppress suspicious requisitions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {moderationRequests.map((req) => (
                <Card key={req.id} bordered padded className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge bloodGroup={req.bloodGroup} size="sm" />
                      <span className="font-mono font-bold text-xs text-charcoal-800">{req.id}</span>
                      <Badge priority={req.priority} size="sm" />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.isVerified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.isVerified ? 'Verified Hospital Prescription' : 'Pending Verification'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-charcoal-900">{req.patientName}</h4>
                      <p className="text-xs text-charcoal-600">
                        {req.hospitalName} • Attendant: {req.contactPerson} (+91 {req.contactPhone})
                      </p>
                      <p className="text-[11px] text-charcoal-400 mt-0.5">
                        Slip Number: <strong className="font-mono text-charcoal-700">{req.requisitionSlipNumber || 'None'}</strong> • Posted: {req.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!req.isVerified && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerifyRequest(req.id)}
                        className="text-xs"
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      >
                        Authorize Broadcast
                      </Button>
                    )}
                    {req.status !== 'CANCELLED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFlagSuspicious(req.id)}
                        className="text-xs text-red-600 hover:bg-red-50"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Flag Suspicious
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DONOR REGISTRY OVERSIGHT */}
        {activeTab === 'donors' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  placeholder="Search by name, blood group, locality..."
                  value={donorSearch}
                  onChange={(e) => setDonorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <span className="text-xs text-charcoal-500 font-semibold">
                Showing {filteredDonors.length} of {donorsList.length} donors
              </span>
            </div>

            <Card bordered padded className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-charcoal-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3">Donor ID & Name</th>
                    <th className="pb-3">Blood Group</th>
                    <th className="pb-3">Bengaluru Locality</th>
                    <th className="pb-3">Phone Verification</th>
                    <th className="pb-3">Standing Status</th>
                    <th className="pb-3 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-charcoal-900 block">{donor.maskedName}</span>
                        <span className="font-mono text-[10px] text-charcoal-400">{donor.id}</span>
                      </td>
                      <td className="py-3">
                        <Badge bloodGroup={donor.bloodGroup} size="sm" />
                      </td>
                      <td className="py-3 text-charcoal-700">
                        {donor.locality} ({donor.zone} BLR)
                      </td>
                      <td className="py-3">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>OTP Verified</span>
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            donor.isSuspended
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {donor.isSuspended ? 'Suspended' : 'Good Standing'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleDonorSuspension(donor.id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                            donor.isSuspended
                              ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                              : 'text-red-600 border-red-200 hover:bg-red-50'
                          }`}
                        >
                          {donor.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 4: IMMUTABLE DPDP AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Immutable DPDP Compliance & Security Audit Logs</span>
                </h2>
                <p className="text-xs text-charcoal-500">
                  Cryptographically timestamped audit log of all system actions, contact releases, and security triggers.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                {['ALL', 'SECURITY', 'PRIVACY_DPDP', 'MODERATION', 'DATA_ACCESS'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAuditFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                      auditFilter === cat
                        ? 'bg-charcoal-900 text-white border-charcoal-900'
                        : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Card bordered padded className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-charcoal-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3">Action & Category</th>
                    <th className="pb-3">Actor</th>
                    <th className="pb-3">Target Entity</th>
                    <th className="pb-3">Audit Details</th>
                    <th className="pb-3">Origin IP Blur</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <span
                          className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            log.category === 'SECURITY'
                              ? 'bg-red-100 text-red-800'
                              : log.category === 'PRIVACY_DPDP'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-charcoal-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-charcoal-600">{log.actor}</td>
                      <td className="py-3 font-mono font-semibold text-charcoal-900">{log.targetEntity}</td>
                      <td className="py-3 text-charcoal-700 max-w-xs">{log.details}</td>
                      <td className="py-3 font-mono text-charcoal-400">{log.ipBlur}</td>
                      <td className="py-3 text-right text-charcoal-400 font-medium">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};
