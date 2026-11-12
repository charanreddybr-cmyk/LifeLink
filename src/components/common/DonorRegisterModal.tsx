import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { ALL_BLOOD_GROUPS } from '../../types/blood.types';
import type { BloodGroup } from '../../types/blood.types';
import { BENGALURU_LOCALITIES } from '../../data/bengaluruLocalities';
import { User, Phone, Mail, Heart, CheckCircle2, AlertCircle } from 'lucide-react';

interface DonorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (donor: any) => void;
}

export const DonorRegisterModal: React.FC<DonorRegisterModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [localityId, setLocalityId] = useState<string>('loc-1');
  const [pincode, setPincode] = useState('560038');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [passed90Days, setPassed90Days] = useState(true);
  const [availableForEmergency, setAvailableForEmergency] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLocalityChange = (locId: string) => {
    setLocalityId(locId);
    const loc = BENGALURU_LOCALITIES.find(l => l.id === locId);
    if (loc) {
      setPincode(loc.pincode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number for OTP dispatch.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!passed90Days) {
      setErrorMsg('Medical rule: You must wait 90 days after whole blood donation before donating again.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSubmitSuccess) {
        onSubmitSuccess({
          fullName,
          bloodGroup,
          localityId,
          pincode,
          phone,
          email,
          availableForEmergency,
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
      title="Join the LifeLink Donor Registry"
      description="Help save lives in Bengaluru. Your phone number is strictly shielded from public display."
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-charcoal-900">
              Welcome to the LifeLink Donor Network!
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
              Thank you, <strong className="text-charcoal-900">{fullName}</strong>. Your profile for group <strong className="text-brand-700">{bloodGroup}</strong> in {BENGALURU_LOCALITIES.find(l => l.id === localityId)?.name} is registered.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-charcoal-600 max-w-sm mx-auto text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-charcoal-400">Donor Registry ID:</span>
              <span className="font-mono font-bold text-charcoal-800">DNR-BLR-{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-400">Privacy Status:</span>
              <span className="text-emerald-700 font-bold">DPDP Shield Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-400">Availability:</span>
              <span className="text-emerald-600 font-bold">On Standby for Emergencies</span>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleResetAndClose}
            className="w-full sm:w-auto px-8"
          >
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Blood group selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
              Your Blood Group *
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name *"
              placeholder="e.g. Priya Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Bengaluru Locality *
              </label>
              <select
                value={localityId}
                onChange={(e) => handleLocalityChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {BENGALURU_LOCALITIES.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.zone} Bengaluru)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mobile Number (for OTP Alerts) *"
              placeholder="e.g. 9845012345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Strictly private under Indian DPDP Act."
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          {/* Medical Pre-check Checklist */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-charcoal-700">
            <span className="font-bold text-charcoal-900 block">
              Donor Safety & Eligibility Self-Declaration:
            </span>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={passed90Days}
                onChange={(e) => setPassed90Days(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>I am at least 18 years old, weigh ≥ 45 kg, and it has been at least <strong>90 days</strong> since my last blood donation.</span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={availableForEmergency}
                onChange={(e) => setAvailableForEmergency(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Keep my status as <strong>Available</strong> for emergency broadcasts within my locality radius.</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="ghost" size="md" type="button" onClick={handleResetAndClose}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Heart className="w-4 h-4 text-brand-400" />}
            >
              Complete Registration
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
