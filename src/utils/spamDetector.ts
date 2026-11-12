/**
 * Anti-Spam, Rate Limiting & Duplicate Detection Engine
 * Enforces medical requisition validity and prevents duplicate emergency tickets.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate?: boolean;
  duplicateRequestId?: string;
}

export interface RequisitionSubmission {
  patientName: string;
  patientAge?: number;
  hospitalName: string;
  bloodGroup: string;
  unitsNeeded: number;
  contactPhone: string;
}

// Session store for active rate limiting
const RATE_LIMIT_KEY = 'lifelink_submission_rate_limiter';

/**
 * Creates a normalized fingerprint string from patient, hospital, and group
 */
export function generateRequisitionFingerprint(sub: RequisitionSubmission): string {
  const normPatient = sub.patientName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normHospital = sub.hospitalName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normGroup = sub.bloodGroup.replace(/[^a-z0-9+-]/gi, '').toUpperCase();
  return `${normPatient}_${normHospital}_${normGroup}`;
}

/**
 * Validates emergency blood requisition inputs and guards against spam & duplicates
 */
export function validateAndDetectDuplicates(
  submission: RequisitionSubmission,
  existingActiveRequests: Array<{ id: string; patientName: string; hospitalName: string; bloodGroup: string; createdAt: string }>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Patient Name Validation
  if (!submission.patientName || submission.patientName.trim().length < 3) {
    errors.push('Patient legal name or hospital case ID must be at least 3 characters.');
  }

  // 2. Patient Age Validation
  if (submission.patientAge !== undefined && (submission.patientAge < 0 || submission.patientAge > 120)) {
    errors.push('Patient age must be a realistic value between 0 and 120.');
  }

  // 3. Hospital Name Validation
  if (!submission.hospitalName || submission.hospitalName.trim().length < 4) {
    errors.push('Hospital or healthcare facility name must be clearly specified.');
  }

  // 4. Units Limit (Anti-Hoarding Safeguard per NBTC guidelines)
  if (!submission.unitsNeeded || submission.unitsNeeded < 1) {
    errors.push('At least 1 blood unit must be requested.');
  } else if (submission.unitsNeeded > 8) {
    warnings.push('Requests exceeding 8 units trigger high-volume blood centre escalation.');
  }

  // 5. Indian Phone Number Format Check
  const cleanedPhone = submission.contactPhone.replace(/[^0-9]/g, '');
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleanedPhone)) {
    errors.push('Contact number must be a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
  }

  // 6. Duplicate Detection (within 6 hours for identical patient + hospital + blood group)
  const currentFingerprint = generateRequisitionFingerprint(submission);
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

  const foundDuplicate = existingActiveRequests.find((existing) => {
    const existingFp = generateRequisitionFingerprint({
      patientName: existing.patientName,
      hospitalName: existing.hospitalName,
      bloodGroup: existing.bloodGroup,
      unitsNeeded: 1,
      contactPhone: '9845012345',
    });

    const isMatch = existingFp === currentFingerprint;
    const isRecent = new Date(existing.createdAt).getTime() > sixHoursAgo;
    return isMatch && isRecent;
  });

  if (foundDuplicate) {
    return {
      isValid: false,
      isDuplicate: true,
      duplicateRequestId: foundDuplicate.id,
      errors: [
        `An active emergency request (${foundDuplicate.id}) already exists for this patient at ${submission.hospitalName}. Please update the existing request instead of creating a duplicate.`
      ],
      warnings,
    };
  }

  // 7. Rate Limiter (Max 3 submissions per hour per browser session)
  try {
    const rateData = JSON.parse(sessionStorage.getItem(RATE_LIMIT_KEY) || '[]');
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentSubmissions = rateData.filter((ts: number) => ts > oneHourAgo);

    if (recentSubmissions.length >= 4) {
      errors.push('Rate limit exceeded: You have posted multiple emergency requests within the past hour. Please wait before creating another.');
    }
  } catch (e) {
    console.warn('Rate limiter error', e);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    isDuplicate: false,
  };
}

/**
 * Records a successful submission timestamp to enforce client-side rate limits
 */
export function recordSubmissionSuccess(): void {
  try {
    const rateData = JSON.parse(sessionStorage.getItem(RATE_LIMIT_KEY) || '[]');
    const now = Date.now();
    rateData.push(now);
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateData));
  } catch (e) {
    console.warn('Could not record submission timestamp', e);
  }
}
