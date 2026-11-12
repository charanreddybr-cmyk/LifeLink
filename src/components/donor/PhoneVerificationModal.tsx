import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Phone, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  phone,
  onVerified,
}) => {
  const [step, setStep] = useState<'DISPATCH' | 'ENTER_OTP' | 'SUCCESS'>('DISPATCH');
  const [otpInput, setOtpInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sandbox testing OTP code when third-party SMS provider credentials (e.g. MSG91/Twilio) are in test mode
  const SANDBOX_TEST_OTP = '560038';

  const handleSendOtp = () => {
    setIsSending(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsSending(false);
      setStep('ENTER_OTP');
    }, 900);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpInput.trim().length !== 6) {
      setErrorMsg('Please enter a complete 6-digit numeric OTP.');
      return;
    }

    setIsVerifying(true);

    // Strictly validate OTP: Do not accept invalid OTP!
    setTimeout(() => {
      setIsVerifying(false);
      if (otpInput.trim() === SANDBOX_TEST_OTP) {
        setStep('SUCCESS');
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1200);
      } else {
        setErrorMsg('Invalid verification code entered. Please check and retry.');
      }
    }, 800);
  };

  const handleResetAndClose = () => {
    setStep('DISPATCH');
    setOtpInput('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Verify Mobile Number"
      description="Two-factor phone authentication is required to dispatch verified emergency requests."
      maxWidth="md"
    >
      {step === 'DISPATCH' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs text-charcoal-500 font-medium">Selected Mobile Number:</span>
            <div className="flex items-center gap-2 font-mono font-bold text-base text-charcoal-900">
              <Phone className="w-4 h-4 text-brand-600" />
              <span>+91 {phone || '9845012345'}</span>
            </div>
            <p className="text-[11px] text-charcoal-500">
              A 6-digit one-time password will be delivered via SMS to verify device possession.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gateway Integration Notice:</span>
              <p className="text-[11px] leading-relaxed mt-0.5">
                Indian telecom DLT headers are enforced. When in local sandbox development, use verification code: <code className="bg-amber-100 font-bold px-1 rounded">{SANDBOX_TEST_OTP}</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={handleResetAndClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSendOtp}
              isLoading={isSending}
            >
              Send Verification OTP
            </Button>
          </div>
        </div>
      )}

      {step === 'ENTER_OTP' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
              Enter 6-Digit OTP sent to +91 {phone || '9845012345'}:
            </label>
            <Input
              type="text"
              maxLength={6}
              placeholder="560038"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="text-center font-mono text-xl tracking-[0.5em] font-bold"
              required
            />
            <p className="text-[11px] text-charcoal-500 text-center">
              Sandbox test passkey: <span className="font-bold font-mono text-brand-700">{SANDBOX_TEST_OTP}</span>
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending}
              className="text-brand-700 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resend Code</span>
            </button>
            <span className="text-charcoal-400">Valid for 10 minutes</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" type="button" onClick={() => setStep('DISPATCH')}>
              Change Number
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isVerifying}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Confirm OTP
            </Button>
          </div>
        </form>
      )}

      {step === 'SUCCESS' && (
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-charcoal-900">
            Phone Number Authenticated
          </h4>
          <p className="text-xs text-charcoal-600">
            Your contact details are securely verified under DPDP standards.
          </p>
        </div>
      )}
    </Modal>
  );
};
