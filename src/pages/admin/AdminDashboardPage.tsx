import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Activity
} from 'lucide-react';
import { Card } from '../../components/common/Card';

export const AdminDashboardPage: React.FC = () => {
  const { profile } = useAuth();

  const auditLogs = [
    { id: 'LOG-1', action: 'VERIFY_REQUEST', target: 'REQ-BLR-8421', details: 'Authorized Victoria Hospital requisition', ip: '49.207.201.44', time: '12 mins ago' },
    { id: 'LOG-2', action: 'DONOR_STATUS_TOGGLE', target: 'DNR-BLR-3819', details: 'Donor marked status: Available', ip: '106.51.78.12', time: '28 mins ago' },
    { id: 'LOG-3', action: 'BLOCKED_SELF_PROMOTION', target: 'USR-DEV-992', details: 'Trigger blocked unauthorized admin role injection attempt', ip: '157.49.12.89', time: '1 hour ago' },
    { id: 'LOG-4', action: 'AUDIT_LOCALITY_UPDATE', target: 'LOC-BLR-1', details: 'Updated Indiranagar notification radius ceiling to 25 km', ip: '49.207.201.44', time: '3 hours ago' },
  ];

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900">
                LifeLink Administrative Console
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Admin Clearance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
              Admin: <strong className="text-charcoal-800">{profile?.email || 'admin@lifelink.org.in'}</strong> | Role-Based Access Control Active.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              Realtime Database Guard Active
            </span>
          </div>
        </div>

        {/* High-level system statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Registered Donors</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-charcoal-900">4,820</span>
              <Users className="w-6 h-6 text-brand-600" />
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">+48 verified this week in Bengaluru</p>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Active Broadcasts</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-brand-700">14</span>
              <AlertTriangle className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-[11px] text-charcoal-500">6 Critical, 8 Urgent in target radii</p>
          </Card>

          <Card bordered padded className="space-y-1">
            <span className="text-xs font-bold text-charcoal-500 uppercase">Emergency Fulfill Rate</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-charcoal-900">92.4%</span>
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-[11px] text-charcoal-500">Avg match response time: 7.2 mins</p>
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

        {/* Security Audit Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-700" />
              <span>Security & Administrative Audit Logs (PostgreSQL RLS Protected)</span>
            </h2>
            <span className="text-xs font-semibold text-charcoal-500">
              Showing immutable system logs
            </span>
          </div>

          <Card bordered padded className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-charcoal-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Target Entity</th>
                    <th className="pb-3">Audit Details</th>
                    <th className="pb-3">Origin IP</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          log.action.includes('BLOCKED') 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-slate-100 text-charcoal-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-charcoal-700 font-semibold">{log.target}</td>
                      <td className="py-3 text-charcoal-700">{log.details}</td>
                      <td className="py-3 font-mono text-charcoal-500">{log.ip}</td>
                      <td className="py-3 text-right text-charcoal-400 font-medium">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
