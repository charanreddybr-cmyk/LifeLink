import React, { useState } from 'react';
import { 
  Building, 
  User, 
  Phone, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { ALL_BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../types/blood.types';
import type { 
  BloodGroup, 
  BloodComponentType, 
  EmergencyPriority, 
  DetailedBloodRequest 
} from '../../types/blood.types';
import { BENGALURU_LOCALITIES, BENGALURU_EMERGENCY_HOSPITALS } from '../../data/bengaluruLocalities';
import { validateAndDetectDuplicates, recordSubmissionSuccess } from '../../utils/spamDetector';
import { PhoneVerificationModal } from '../donor/PhoneVerificationModal';

interface CreateEmergencyRequestWizardProps {
  onSuccess: (newRequest: DetailedBloodRequest) => void;
  onCancel: () => void;
  existingRequests?: Array<{ id: string; patientName: string; hospitalName: string; bloodGroup: string; createdAt: string }>;
  initialBloodGroup?: BloodGroup;
  initialLocalityId?: string;
}

export const CreateEmergencyRequestWizard: React.FC<CreateEmergencyRequestWizardProps> = ({
  onSuccess,
  onCancel,
  existingRequests = [],
  initialBloodGroup = 'O+',
  initialLocalityId = 'loc-1',
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(35);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(initialBloodGroup);
  const [component, setComponent] = useState<BloodComponentType>('PRBC');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);

  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [locality, setLocality] = useState<string>(
    BENGALURU_LOCALITIES.find(l => l.id === initialLocalityId)?.name || 'Indiranagar'
  );
  const [pincode, setPincode] = useState('560038');
  const [wardRoom, setWardRoom] = useState('ICU / Emergency Ward');
  const [priority, setPriority] = useState<EmergencyPriority>('CRITICAL');
  const [requiredByHours, setRequiredByHours] = useState<number>(3);

  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('Family Attendant');
  const [requisitionSlip, setRequisitionSlip] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick auto-populate from hospital list
  const handleSelectPredefinedHospital = (hospId: string) => {
    const hosp = BENGALURU_EMERGENCY_HOSPITALS.find(h => h.id === hospId);
    if (hosp) {
      setHospitalName(hosp.name);
      setHospitalAddress(hosp.address);
      setLocality(hosp.locality.split(',')[0]);
      setPincode(hosp.pincode);
    }
  };

  const handleNextFromStep1 = () => {
    const errs: string[] = [];
    if (!patientName.trim()) errs.push('Please enter patient identification name or hospital bed label.');
    if (patientAge === '' || Number(patientAge) < 0 || Number(patientAge) > 120) {
      errs.push('Please enter a valid patient age.');
    }
    if (errs.length > 0) {
      setErrorMessages(errs);
      return;
    }
    setErrorMessages([]);
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    const errs: string[] = [];
    if (!hospitalName.trim()) errs.push('Hospital or medical centre name is required.');
    if (errs.length > 0) {
      setErrorMessages(errs);
      return;
    }
    setErrorMessages([]);
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    const errs: string[] = [];
    if (!contactPerson.trim()) errs.push('Authorized contact attendant name is required.');
    if (!contactPhone.trim() || contactPhone.replace(/[^0-9]/g, '').length < 10) {
      errs.push('Valid 10-digit Indian contact phone is required.');
    }
    if (errs.length > 0) {
      setErrorMessages(errs);
      return;
    }
    setErrorMessages([]);
    setCurrentStep(4);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);

    if (!pledgeAccepted) {
      setErrorMessages(['You must acknowledge the non-commercialization blood transfusion pledge.']);
      return;
    }

    // Run Spam & Duplicate Validation Engine
    const validation = validateAndDetectDuplicates(
      {
        patientName,
        patientAge: Number(patientAge),
        hospitalName,
        bloodGroup,
        unitsNeeded,
        contactPhone,
      },
      existingRequests
    );

    if (!validation.isValid) {
      setErrorMessages(validation.errors);
      return;
    }

    setIsSubmitting(true);

    const generatedId = `REQ-BLR-${Math.floor(1000 + Math.random() * 9000)}`;
    const requiredByTime = new Date(Date.now() + requiredByHours * 60 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRequest: DetailedBloodRequest = {
      id: generatedId,
      patientName,
      patientAge: Number(patientAge),
      bloodGroup,
      component,
      unitsNeeded,
      unitsFulfilled: 0,
      hospitalName,
      hospitalAddress: hospitalAddress || hospitalName,
      locality,
      city: 'Bengaluru',
      pincode,
      wardRoom,
      priority,
      requiredBy: `Today by ${requiredByTime}`,
      contactPerson,
      contactPhone,
      relationshipToPatient: relationship,
      requisitionSlipNumber: requisitionSlip || undefined,
      additionalNotes: additionalNotes || undefined,
      isVerified: isPhoneVerified || Boolean(requisitionSlip),
      verificationSource: requisitionSlip ? 'DOCTOR_PRESCRIPTION' : 'TELE_VERIFIED',
      status: isPhoneVerified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString(),
      responsesCount: 0,
    };

    recordSubmissionSuccess();

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(newRequest);
    }, 700);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-md max-w-4xl mx-auto space-y-6">
      
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Emergency Protocol • Step {currentStep} of 4
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 mt-1">
            {currentStep === 1 && '1. Clinical & Component Requisition'}
            {currentStep === 2 && '2. Hospital Location & Urgency'}
            {currentStep === 3 && '3. Attendant & Contact Verification'}
            {currentStep === 4 && '4. Anti-Spam Gate & Review'}
          </h2>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === s
                  ? 'bg-brand-700 text-white shadow-soft scale-105'
                  : currentStep > s
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {currentStep > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Error alert box */}
      {errorMessages.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Please resolve the following before proceeding:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* STEP 1: CLINICAL & COMPONENT */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Blood group selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
              Required Blood Group *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {ALL_BLOOD_GROUPS.map((grp) => (
                <button
                  type="button"
                  key={grp}
                  onClick={() => setBloodGroup(grp)}
                  className={`py-3 rounded-2xl font-black text-sm border-2 transition-all ${
                    bloodGroup === grp
                      ? 'bg-brand-700 text-white border-brand-800 shadow-soft scale-105'
                      : 'bg-white text-charcoal-800 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Component Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
              Specific Component Required *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {BLOOD_COMPONENTS.slice(0, 3).map((comp) => (
                <button
                  type="button"
                  key={comp.type}
                  onClick={() => setComponent(comp.type)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    component === comp.type
                      ? 'bg-red-50 border-brand-600 text-charcoal-900 shadow-soft'
                      : 'bg-white border-slate-200 text-charcoal-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs block">{comp.label}</span>
                  <span className="text-[10px] text-charcoal-500 block mt-0.5">{comp.clinicalUse}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Details & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Patient Name / Case ID *"
                placeholder="e.g. Ramesh Chandra (Trauma Bed 3)"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />
            </div>
            <div>
              <Input
                label="Patient Age *"
                type="number"
                min="0"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          {/* Units Required */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Units Required (Anti-Hoarding Protocol: Max 8)
              </label>
              <span className="text-brand-700 font-extrabold text-sm">{unitsNeeded} Units</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 6, 8].map((u) => (
                <button
                  type="button"
                  key={u}
                  onClick={() => setUnitsNeeded(u)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    unitsNeeded === u
                      ? 'bg-charcoal-900 text-white border-charcoal-900'
                      : 'bg-white text-charcoal-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {u} Unit{u > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="md" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNextFromStep1}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Hospital Location
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: HOSPITAL & LOGISTICS */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Quick Predefined Hospital Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
              Quick Pick: Major Bengaluru Blood Centres
            </label>
            <div className="flex flex-wrap gap-2">
              {BENGALURU_EMERGENCY_HOSPITALS.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => handleSelectPredefinedHospital(h.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-800 text-charcoal-700 border border-slate-200 transition-colors"
                >
                  {h.name.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hospital Name *"
              placeholder="e.g. Victoria Hospital BMCRI"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Bengaluru Locality *
              </label>
              <select
                value={locality}
                onChange={(e) => {
                  setLocality(e.target.value);
                  const loc = BENGALURU_LOCALITIES.find(l => l.name === e.target.value);
                  if (loc) setPincode(loc.pincode);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {BENGALURU_LOCALITIES.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} (PIN {loc.pincode}, {loc.zone} Zone)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ward / Room / Bed Number"
              placeholder="e.g. ICU Bed 4, Block B"
              value={wardRoom}
              onChange={(e) => setWardRoom(e.target.value)}
            />
            <Input
              label="Hospital Address / Landmark"
              placeholder="e.g. Fort Road, Near KR Market"
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
            />
          </div>

          {/* Urgency & Required-By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Emergency Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as EmergencyPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-charcoal-900 focus:ring-2 focus:ring-brand-600 focus:outline-none"
              >
                <option value="CRITICAL">Critical (Immediate Life-Threatening Transfusion)</option>
                <option value="URGENT">Urgent (Needed within hours for Scheduled Surgery/Trauma)</option>
                <option value="STANDARD">Standard (Within 24 Hours / Replacement Donor)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Units Required By *
              </label>
              <select
                value={requiredByHours}
                onChange={(e) => setRequiredByHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-charcoal-900 focus:ring-2 focus:ring-brand-600 focus:outline-none"
              >
                <option value="1">Within 1 Hour (Extreme Trauma / Code Red)</option>
                <option value="2">Within 2 Hours</option>
                <option value="4">Within 4 Hours</option>
                <option value="8">Within 8 Hours</option>
                <option value="24">Within 24 Hours</option>
              </select>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNextFromStep2}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Attendant Authorization
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: ATTENDANT & CONTACT */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-charcoal-600 space-y-1">
            <span className="font-bold text-charcoal-900 block">Contact Authorization Protocol:</span>
            <p>
              Your contact details are used to verify the genuine clinical nature of the requisition and connect with donors who explicitly accept your request.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person Legal Name *"
              placeholder="e.g. Dr. Rajesh Kumar / Attendant Anand"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Relationship to Patient *
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="Family Attendant">Family Attendant (Parent / Sibling / Spouse)</option>
                <option value="Attending Doctor / Resident">Attending Doctor / Resident</option>
                <option value="Hospital Blood Bank Coordinator">Hospital Blood Bank Coordinator</option>
                <option value="Medical Social Worker">Medical Social Worker</option>
                <option value="Colleague / Friend">Colleague / Friend</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Attendant Mobile Number *
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 9845012345"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant={isPhoneVerified ? 'outline' : 'primary'}
                  size="md"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="shrink-0 text-xs"
                >
                  {isPhoneVerified ? 'Verified ✓' : 'Verify OTP'}
                </Button>
              </div>
            </div>

            <Input
              label="Doctor Blood Requisition Slip No. (Optional)"
              placeholder="e.g. VMC-REQ-9921"
              value={requisitionSlip}
              onChange={(e) => setRequisitionSlip(e.target.value)}
              leftIcon={<FileText className="w-4 h-4" />}
              helperText="Enables instant verified requisition badge."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
              Special Clinical Instructions (e.g. Crossmatching details, specific entry gate)
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Please report directly to Victoria Hospital 2nd floor Blood Centre with photo ID."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNextFromStep3}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Review & Submit
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: ANTI-SPAM REVIEW & BROADCAST */}
      {currentStep === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Badge bloodGroup={bloodGroup} size="lg" />
                <div>
                  <h4 className="font-bold text-sm text-charcoal-900">
                    {unitsNeeded} Units of {bloodGroup} ({component})
                  </h4>
                  <p className="text-xs text-charcoal-500">
                    Patient: {patientName} ({patientAge} yrs)
                  </p>
                </div>
              </div>
              <Badge priority={priority} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-charcoal-400 block font-medium">Hospital Facility:</span>
                <span className="font-bold text-charcoal-800">{hospitalName}</span>
                <span className="text-charcoal-500 block">{wardRoom}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block font-medium">Target Service Zone:</span>
                <span className="font-bold text-charcoal-800">{locality}, Bengaluru</span>
                <span className="text-charcoal-500 block">PIN {pincode}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block font-medium">Contact Person:</span>
                <span className="font-bold text-charcoal-800">{contactPerson} ({relationship})</span>
                <span className="font-mono text-charcoal-500 block">+91 {contactPhone}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block font-medium">Verification Status:</span>
                <span className={`font-bold ${isPhoneVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isPhoneVerified ? '✓ OTP Verified Attendant' : 'Pending Verification Gate'}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Non-Commercialization Pledge */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900">
              <HeartHandshake className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold uppercase tracking-wider">Mandatory Legal Affirmation</span>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-amber-950 leading-relaxed">
              <input
                type="checkbox"
                checked={pledgeAccepted}
                onChange={(e) => setPledgeAccepted(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>
                I solemnly declare that this is a <strong>bona fide clinical requisition</strong> for a genuine patient. I agree that voluntary blood donation cannot be commercialized or purchased under Indian law. LifeLink acts solely as a communication tool; clinical crossmatching will occur at the hospital blood centre.
              </span>
            </label>
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              size="md"
              type="button"
              onClick={() => setCurrentStep(3)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="emergency"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Activity className="w-4 h-4" />}
            >
              Broadcast Emergency Requisition Now
            </Button>
          </div>
        </form>
      )}

      {/* Phone verification modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        phone={contactPhone}
        onVerified={() => setIsPhoneVerified(true)}
      />

    </div>
  );
};
