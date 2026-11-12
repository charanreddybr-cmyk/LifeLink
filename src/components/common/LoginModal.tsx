import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/database.types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterDonor: () => void;
  onRequestEmergency: () => void;
  onLoginSuccess?: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRegisterDonor,
  onRequestEmergency,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn, isSupabaseLive } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password, selectedRole);
    setIsSubmitting(false);

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      }
      onClose();
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleResetAndClose = () => {
    setErrorMessage(null);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Supabase status indicator */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-charcoal-500 font-medium">Authentication Backend:</span>
          <span className={`inline-flex items-center gap-1 font-bold ${
            isSupabaseLive ? 'text-emerald-700' : 'text-blue-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            {isSupabaseLive ? 'Supabase Cloud Auth' : 'Local Developer Auth'}
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Role selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
            Target Role:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('donor')}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                selectedRole === 'donor'
                  ? 'bg-brand-700 text-white border-brand-800'
                  : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('requester')}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                selectedRole === 'requester'
                  ? 'bg-charcoal-800 text-white border-charcoal-900'
                  : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Requester
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                selectedRole === 'admin'
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
          <span className="text-charcoal-400 text-[11px]">
            Role-Based Access Guard Active
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In to Dashboard
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
    </Modal>
  );
};
