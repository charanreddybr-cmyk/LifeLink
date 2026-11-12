import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { ALL_BLOOD_GROUPS } from '../../types/blood.types';
import type { BloodGroup, EmergencyPriority } from '../../types/blood.types';
import { BENGALURU_LOCALITIES, BENGALURU_EMERGENCY_HOSPITALS } from '../../data/bengaluruLocalities';
import { AlertTriangle, Building, User, Phone, CheckCircle2 } from 'lucide-react';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBloodGroup?: BloodGroup;
  initialLocalityId?: string;
  onSubmitSuccess?: (details: any) => void;
}

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
  initialBloodGroup = 'O+',
  initialLocalityId = 'loc-1',
  onSubmitSuccess,
}) => {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(initialBloodGroup);
  const [localityId, setLocalityId] = useState<string>(initialLocalityId);
  const [hospitalName, setHospitalName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [units, setUnits] = useState<number>(2);
  const [priority, setPriority] = useState<EmergencyPriority>('URGENT');
  const [requiredByHours, setRequiredByHours] = useState<number>(3);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialBloodGroup) setBloodGroup(initialBloodGroup);
    if (initialLocalityId) setLocalityId(initialLocalityId);
  }, [initialBloodGroup, initialLocalityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim()) {
      setErrorMsg('Please enter patient or case identification name.');
      return;
    }
    if (!hospitalName.trim()) {
      setErrorMsg('Please specify hospital name and admission department.');
      return;
    }
    if (!contactPhone.trim() || contactPhone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please provide a valid 10-digit Indian contact phone number.');
      return;
    }

    setIsSubmitting(true);

    // Phase 1 interactive submission flow
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSubmitSuccess) {
        onSubmitSuccess({
          bloodGroup,
          localityId,
          hospitalName,
          patientName,
          units,
          priority,
          contactPhone,
        });
      }
    }, 800);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Create Emergency Blood Request"
      description="LifeLink notifies matching donors across Bengaluru once verified."
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-charcoal-900">
              Emergency Request Logged for Verification
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
              Your request for <strong className="text-brand-700">{units} units of {bloodGroup}</strong> at {hospitalName} has been recorded.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-charcoal-600 max-w-sm mx-auto text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-charcoal-400">Request ID:</span>
              <span className="font-mono font-bold text-charcoal-800">REQ-BLR-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-400">Verification Gate:</span>
              <span className="text-amber-700 font-bold">Standard OTP Dispatch</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-400">Target Locality:</span>
              <span className="font-semibold text-charcoal-800">
                {BENGALURU_LOCALITIES.find(l => l.id === localityId)?.name || 'Bengaluru'}
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleResetAndClose}
            className="w-full sm:w-auto px-8"
          >
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Blood group selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
              Required Blood Group *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {ALL_BLOOD_GROUPS.map((grp) => (
                <button
                  type="button"
                  key={grp}
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

          {/* Patient and Hospital Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Patient Name / Case ID *"
              placeholder="e.g. Anand Kumar (ICU-3)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Bengaluru Locality *
              </label>
              <select
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {BENGALURU_LOCALITIES.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} (PIN {loc.pincode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospital Name with quick select */}
          <div className="space-y-1.5">
            <Input
              label="Hospital Name & Address *"
              placeholder="e.g. Manipal Hospital, HAL Old Airport Rd"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
            />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-[10px] text-charcoal-500 font-medium">Quick select:</span>
              {BENGALURU_EMERGENCY_HOSPITALS.slice(0, 3).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHospitalName(`${h.name}, ${h.locality}`)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-charcoal-700 px-2 py-0.5 rounded transition-colors"
                >
                  {h.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Units, Priority, Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Units Required
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:ring-2 focus:ring-brand-600 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EmergencyPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:ring-2 focus:ring-brand-600 focus:outline-none"
              >
                <option value="CRITICAL">Critical (Immediate)</option>
                <option value="URGENT">Urgent (Within hours)</option>
                <option value="STANDARD">Standard (Within 24h)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Required By
              </label>
              <select
                value={requiredByHours}
                onChange={(e) => setRequiredByHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:ring-2 focus:ring-brand-600 focus:outline-none"
              >
                <option value="1">Within 1 hour</option>
                <option value="2">Within 2 hours</option>
                <option value="4">Within 4 hours</option>
                <option value="8">Within 8 hours</option>
                <option value="24">Within 24 hours</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Attendant / Contact Person"
              placeholder="e.g. Ramesh K (Brother)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Verified Phone Number *"
              placeholder="e.g. 9876543210"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Protected by DPDP. Never made public."
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-charcoal-600 leading-relaxed">
            <strong>Medical Notice:</strong> LifeLink alerts potential donors based on preliminary group and location. Hospital crossmatching and clinical suitability verification are conducted by the attending blood centre.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="ghost" size="md" type="button" onClick={handleResetAndClose}>
              Cancel
            </Button>
            <Button
              variant="emergency"
              size="md"
              type="submit"
              isLoading={isSubmitting}
            >
              Broadcast Emergency Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
