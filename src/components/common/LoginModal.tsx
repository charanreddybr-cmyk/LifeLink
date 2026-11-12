import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterDonor: () => void;
  onRequestEmergency: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRegisterDonor,
  onRequestEmergency,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'DONOR' | 'REQUESTER' | 'ADMIN'>('DONOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 700);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title="Sign In to LifeLink"
      description="Access your donor availability, live requests, or administrative console."
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-charcoal-900">
              Authenticated Session Ready
            </h4>
            <p className="text-xs text-charcoal-600">
              Signed in as <strong className="text-charcoal-900">{email}</strong> ({selectedRole} Role).
            </p>
          </div>
          <p className="text-xs text-charcoal-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            Phase 2 Supabase Auth integration will automatically hydrate user JWT and role-based policies.
          </p>
          <Button variant="primary" size="sm" onClick={handleResetAndClose} className="w-full">
            Continue to Application
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
              Sign In As:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('DONOR')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                  selectedRole === 'DONOR'
                    ? 'bg-brand-700 text-white border-brand-800'
                    : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Donor
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('REQUESTER')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                  selectedRole === 'REQUESTER'
                    ? 'bg-charcoal-800 text-white border-charcoal-900'
                    : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Requester
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('ADMIN')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                  selectedRole === 'ADMIN'
                    ? 'bg-blue-700 text-white border-blue-800'
                    : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <Input
            label="Email Address *"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password *"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-charcoal-600">
              <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" defaultChecked />
              <span>Remember this device</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset will be available via Supabase Auth email recovery.'); }} className="text-brand-700 font-semibold hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>

          <div className="pt-2 text-center text-xs text-charcoal-500 space-y-1">
            <p>Don't have an account yet?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRegisterDonor();
                }}
                className="text-brand-700 font-bold hover:underline"
              >
                Register as Donor
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestEmergency();
                }}
                className="text-charcoal-800 font-bold hover:underline"
              >
                Post Emergency Request
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
