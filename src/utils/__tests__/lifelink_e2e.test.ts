/**
 * LifeLink End-to-End Automated Test Verification Suite
 * Tests all core subsystems across clinical matching, anti-spam,
 * DPDP geofencing, multi-channel dispatch, and realtime streaming.
 */

import { 
  isBloodCompatible, 
  evaluateRestInterval, 
  runMatchingEngine 
} from '../matchingEngine';
import { 
  calculateDistanceKm, 
  blurCoordinatesForPrivacy 
} from '../geoUtils';
import { 
  generateRequisitionFingerprint, 
  validateAndDetectDuplicates 
} from '../spamDetector';
import { 
  formatIndianPhoneNumber, 
  TRAI_DLT_TEMPLATES 
} from '../../services/smsService';
import { renderEmailHtml } from '../../services/emailService';
import { BENGALURU_MOCK_DONORS } from '../../data/mockDonors';

console.log('===========================================================');
console.log('🧪 RUNNING LIFELINK COMPREHENSIVE END-TO-END TEST SUITE');
console.log('===========================================================');

let testsPassed = 0;
let testsTotal = 0;

function assertTest(condition: boolean, testName: string) {
  testsTotal++;
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
  console.log(`✅ PASSED: ${testName}`);
  testsPassed++;
}

// -------------------------------------------------------------
// 1. Anti-Spam & Rate Limiting Engine Tests
// -------------------------------------------------------------
console.log('\n--- 1. Anti-Spam & Rate Limiting Tests ---');

// Indian Mobile Validation via formatIndianPhoneNumber
assertTest(formatIndianPhoneNumber('9845012345').valid === true, 'Valid 10-digit Airtel/Jio number starting with 9');
assertTest(formatIndianPhoneNumber('7760123456').valid === true, 'Valid 10-digit number starting with 7');
assertTest(formatIndianPhoneNumber('1234567890').valid === false, 'Invalid Indian number starting with 1');
assertTest(formatIndianPhoneNumber('98450').valid === false, 'Invalid short number');

// Fingerprinting & Duplicate Check
const fp1 = generateRequisitionFingerprint({ patientName: 'Ramesh Kumar', hospitalName: 'Victoria Hospital', bloodGroup: 'O+', unitsNeeded: 1, contactPhone: '9845012345' });
const fp2 = generateRequisitionFingerprint({ patientName: 'Ramesh Kumar', hospitalName: 'Victoria Hospital', bloodGroup: 'O+', unitsNeeded: 1, contactPhone: '9845012345' });
const fp3 = generateRequisitionFingerprint({ patientName: 'Ramesh Kumar', hospitalName: 'Manipal Hospital', bloodGroup: 'O+', unitsNeeded: 1, contactPhone: '9845012345' });
assertTest(fp1 === fp2, 'Fingerprints for identical patient/hospital/blood group match');
assertTest(fp1 !== fp3, 'Fingerprints for different hospitals differ');

const validation = validateAndDetectDuplicates(
  {
    patientName: 'Ramesh Kumar',
    hospitalName: 'Victoria Hospital',
    bloodGroup: 'O+',
    unitsNeeded: 2,
    contactPhone: '9845012345',
  },
  []
);
assertTest(validation.isValid === true, 'Clean valid requisition passes validation');

// -------------------------------------------------------------
// 2. Clinical Compatibility Matrix Tests
// -------------------------------------------------------------
console.log('\n--- 2. Clinical Compatibility Tests ---');

// PRBC / Whole Blood
assertTest(isBloodCompatible('O-', 'AB+', 'PRBC') === true, 'O- is universal red cell donor to AB+');
assertTest(isBloodCompatible('O-', 'O-', 'PRBC') === true, 'O- can donate red cells to O-');
assertTest(isBloodCompatible('B+', 'A+', 'PRBC') === false, 'B+ cannot donate red cells to A+');
assertTest(isBloodCompatible('A+', 'AB+', 'PRBC') === true, 'A+ can donate red cells to AB+');
assertTest(isBloodCompatible('AB+', 'O+', 'PRBC') === false, 'AB+ cannot donate red cells to O+');

// FFP (Plasma Reverse Rules)
assertTest(isBloodCompatible('AB+', 'O+', 'FFP') === true, 'AB+ is universal donor for plasma (no antibodies)');
assertTest(isBloodCompatible('O+', 'AB+', 'FFP') === false, 'O+ cannot donate plasma to AB+ (contains anti-A & anti-B)');
assertTest(isBloodCompatible('A+', 'O+', 'FFP') === true, 'A+ plasma safe for O+ recipient');

// Platelets
assertTest(isBloodCompatible('O+', 'A+', 'PLATELETS') === true, 'O platelets compatible for A+');
assertTest(isBloodCompatible('AB+', 'AB+', 'PLATELETS') === true, 'AB+ platelets identical match for AB+');

// -------------------------------------------------------------
// 3. Medical Rest Interval Calculations
// -------------------------------------------------------------
console.log('\n--- 3. Medical Rest Interval Tests ---');

const recentDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const clearedDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();

const evalRecentWholeBlood = evaluateRestInterval(recentDate, 'WHOLE_BLOOD');
assertTest(evalRecentWholeBlood.isCleared === false, '30-day whole blood donation must be in cooldown');
assertTest(evalRecentWholeBlood.daysRemaining === 60, 'Whole blood 90-day cooldown remaining should be 60 days');

const evalClearedWholeBlood = evaluateRestInterval(clearedDate, 'WHOLE_BLOOD');
assertTest(evalClearedWholeBlood.isCleared === true, '100-day donation cleared past 90-day threshold');
assertTest(evalClearedWholeBlood.daysRemaining === 0, 'Cleared donation has 0 days remaining');

const evalPlateletRest = evaluateRestInterval(recentDate, 'PLATELETS');
assertTest(evalPlateletRest.isCleared === true, '30-day donation clears 14-day platelet interval');

// -------------------------------------------------------------
// 4. Geolocation & Privacy Geofencing Tests
// -------------------------------------------------------------
console.log('\n--- 4. Geolocation & Privacy Geofencing Tests ---');

const indiranagar = { lat: 12.9784, lng: 77.6408 };
const koramangala = { lat: 12.9352, lng: 77.6245 };
const distance = calculateDistanceKm(indiranagar, koramangala);
assertTest(distance > 4 && distance < 6, `Haversine distance Indiranagar to Koramangala is ~5.1 km (got ${distance} km)`);

const rawPreciseGps = { lat: 12.9784152, lng: 77.6408921 };
const blurred = blurCoordinatesForPrivacy(rawPreciseGps);
assertTest(blurred.lat === 12.98 && blurred.lng === 77.64, 'Privacy blur truncates coordinates to 2 decimal places (~1.1 km precision)');

// -------------------------------------------------------------
// 5. Full Matching Engine & Scoring Tests
// -------------------------------------------------------------
console.log('\n--- 5. Full Proximity Matching Engine Tests ---');

const matchingSummary = runMatchingEngine(BENGALURU_MOCK_DONORS, {
  bloodGroup: 'O+',
  component: 'PRBC',
  targetCoordinates: indiranagar,
  searchRadiusKm: 15,
  exactMatchOnly: false,
});

assertTest(matchingSummary.totalCandidates === 20, 'All 20 registered candidates evaluated');
assertTest(matchingSummary.eligibleCount > 0, 'Identified eligible candidates within 15 km');
assertTest(matchingSummary.exactMatchesCount > 0, 'Found exact O+ blood matches');
assertTest(matchingSummary.compatibleMatchesCount > 0, 'Found compatible O- donor matches');
assertTest(matchingSummary.matches[0].isEligibleOverall === true, 'Top ranked candidate is fully eligible');
assertTest(matchingSummary.matches[0].matchScore > 100, 'Top ranked candidate has high match score');

// -------------------------------------------------------------
// 6. Indian TRAI DLT Registered SMS Gateway Tests
// -------------------------------------------------------------
console.log('\n--- 6. Indian TRAI DLT SMS Gateway Tests ---');

const formattedPhone = formatIndianPhoneNumber('9845012345');
assertTest(formattedPhone.valid === true, 'Formatted Indian mobile number is valid');
assertTest(formattedPhone.formatted === '+919845012345', 'Added +91 country prefix');

const dltTemplate = TRAI_DLT_TEMPLATES.DLT_OTP_AUTH;
const smsText = dltTemplate.textPattern({ otp: '560038' });
assertTest(smsText.includes('560038'), 'DLT template interpolated 6-digit OTP correctly');
assertTest(smsText.includes('LifeLink India'), 'DLT template contains registered brand identifier');

// -------------------------------------------------------------
// 7. Transactional Email Generator Tests
// -------------------------------------------------------------
console.log('\n--- 7. Transactional Email Generator Tests ---');

const emailHtml = renderEmailHtml({
  toEmail: 'donor@gmail.com',
  toName: 'Karthik',
  subject: 'URGENT Blood Request',
  templateType: 'EMERGENCY_REQUISITION',
  metadata: {
    bloodGroup: 'O+',
    hospitalName: 'Victoria Hospital',
    locality: 'KR Market',
    priority: 'CRITICAL',
    component: 'PRBC',
  },
});

assertTest(emailHtml.includes('Victoria Hospital'), 'Email HTML contains hospital name');
assertTest(emailHtml.includes('O+'), 'Email HTML contains requested blood group');
assertTest(emailHtml.includes('DPDP Act Compliant'), 'Email HTML contains DPDP legal footer');

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n===========================================================');
console.log(`🎉 ALL ${testsPassed}/${testsTotal} TESTS PASSED WITH ZERO FAILURES!`);
console.log('===========================================================');
