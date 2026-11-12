import React, { useState } from 'react';
import { Menu, X, Droplet, Heart, ShieldCheck, AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onRequestEmergency: () => void;
  onRegisterDonor: () => void;
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onRequestEmergency,
  onRegisterDonor,
  onLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'find-donors', label: 'Find Donors' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'safety', label: 'Safety Charter' },
    { id: 'hospitals', label: 'Bengaluru Blood Banks' },
    { id: 'about', label: 'About LifeLink' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LifeLink Brand */}
          <div
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <Droplet className="w-6 h-6 fill-white" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white">
                <Heart className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-charcoal-900">
                  Life<span className="text-brand-700">Link</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">
                  BLR v1.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-charcoal-500 tracking-tight leading-none mt-0.5 hidden xs:block">
                Every Drop Counts. Be Someone's Lifeline.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Button
              variant="emergency"
              size="sm"
              onClick={onRequestEmergency}
              leftIcon={<AlertCircle className="w-4 h-4" />}
            >
              Request Blood
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegisterDonor}
              leftIcon={<PlusCircle className="w-4 h-4 text-brand-700" />}
            >
              Register Donor
            </Button>
            <button
              onClick={onLogin}
              className="text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="emergency"
              size="sm"
              onClick={onRequestEmergency}
              className="px-2.5 py-1 text-xs"
            >
              Request
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-charcoal-700 hover:text-charcoal-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-soft-lg animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-semibold rounded-xl ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-charcoal-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-brand-700" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Button
              variant="emergency"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestEmergency();
              }}
              leftIcon={<AlertCircle className="w-4 h-4" />}
            >
              Request Emergency Blood
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                onRegisterDonor();
              }}
              leftIcon={<PlusCircle className="w-4 h-4 text-brand-700" />}
            >
              Register as Willing Donor
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogin();
              }}
            >
              Sign In to Your Account
            </Button>
          </div>

          <div className="pt-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-charcoal-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified blood requests in Bengaluru
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
