import type { BloodGroup, BloodComponentType } from '../types/blood.types';
import { calculateDistanceKm, type Coordinates } from './geoUtils';

export interface DonorCandidate {
  id: string;
  maskedName: string;
  bloodGroup: BloodGroup;
  city: string;
  locality: string;
  zone: 'Central' | 'South' | 'North' | 'East' | 'West';
  coordinates: Coordinates;
  isAvailable: boolean;
  lastDonationDate: string | null;
  notificationRadiusKm: number;
  totalDonations: number;
  phoneVerified: boolean;
  maskedPhone?: string;
}

export interface MatchingCriteria {
  bloodGroup: BloodGroup;
  component: BloodComponentType;
  targetCoordinates: Coordinates;
  searchRadiusKm: number;
  hospitalName?: string;
  requireAvailableNow?: boolean;
  requireRestCleared?: boolean;
  exactMatchOnly?: boolean;
}

export interface EvaluatedDonorMatch {
  candidate: DonorCandidate;
  distanceKm: number;
  isCompatible: boolean;
  isExactMatch: boolean;
  isRestCleared: boolean;
  daysSinceLastDonation: number | null;
  daysUntilEligible: number;
  isWithinSearchRadius: boolean;
  isWithinDonorRadius: boolean;
  isEligibleOverall: boolean;
  ineligibilityReasons: string[];
  matchScore: number;
}

export interface MatchingEngineSummary {
  criteria: MatchingCriteria;
  totalCandidates: number;
  eligibleCount: number;
  exactMatchesCount: number;
  compatibleMatchesCount: number;
  ineligibleCount: number;
  ineligibleBreakdown: {
    cooldownActive: number;
    outsideRadius: number;
    incompatibleGroup: number;
    unavailableStatus: number;
  };
  matches: EvaluatedDonorMatch[];
}

/**
 * Medical Rest intervals by component according to DGHS & NACO Blood Transfusion guidelines
 */
export const REST_INTERVAL_DAYS: Record<BloodComponentType, number> = {
  WHOLE_BLOOD: 90, // Mandatory 3-month rest interval for whole blood
  PRBC: 90,        // Standard red cell donation interval
  PLATELETS: 14,   // Apheresis platelets rest interval (14 days, max 24x per year)
  FFP: 28,         // Plasmapheresis rest interval (28 days)
  CRYOPRECIPITATE: 90,
};

/**
 * Clinical compatibility evaluator supporting Red Cell, Plasma (FFP), and Platelet rules.
 */
export function isBloodCompatible(
  donorGroup: BloodGroup,
  recipientGroup: BloodGroup,
  component: BloodComponentType = 'PRBC'
): boolean {
  if (donorGroup === recipientGroup) return true;

  // Red Cell & Whole Blood rules (Antibodies in recipient serum attack donor antigens)
  if (component === 'PRBC' || component === 'WHOLE_BLOOD' || component === 'CRYOPRECIPITATE') {
    switch (recipientGroup) {
      case 'AB+':
        return true; // Universal red cell recipient
      case 'AB-':
        return ['AB-', 'A-', 'B-', 'O-'].includes(donorGroup);
      case 'A+':
        return ['A+', 'A-', 'O+', 'O-'].includes(donorGroup);
      case 'A-':
        return ['A-', 'O-'].includes(donorGroup);
      case 'B+':
        return ['B+', 'B-', 'O+', 'O-'].includes(donorGroup);
      case 'B-':
        return ['B-', 'O-'].includes(donorGroup);
      case 'O+':
        return ['O+', 'O-'].includes(donorGroup);
      case 'O-':
        return donorGroup === 'O-'; // Can only receive O-
      default:
        return false;
    }
  }

  // Fresh Frozen Plasma (FFP) rules - Reverse compatibility!
  // Donor plasma contains antibodies; AB has no antibodies (universal donor for plasma).
  if (component === 'FFP') {
    switch (recipientGroup) {
      case 'O+':
      case 'O-':
        return true; // O recipient can safely receive any plasma
      case 'A+':
      case 'A-':
        return donorGroup.startsWith('A') || donorGroup.startsWith('AB');
      case 'B+':
      case 'B-':
        return donorGroup.startsWith('B') || donorGroup.startsWith('AB');
      case 'AB+':
      case 'AB-':
        return donorGroup.startsWith('AB'); // AB recipient can only receive AB plasma
      default:
        return false;
    }
  }

  // Platelets (APHERESIS / RDP)
  if (component === 'PLATELETS') {
    // ABO-identical preferred; Rh-identical preferred; compatible ABO accepted
    if (recipientGroup === 'AB+' || recipientGroup === 'AB-') {
      return true;
    }
    if (recipientGroup.startsWith('A')) {
      return donorGroup.startsWith('A') || donorGroup.startsWith('O');
    }
    if (recipientGroup.startsWith('B')) {
      return donorGroup.startsWith('B') || donorGroup.startsWith('O');
    }
    if (recipientGroup.startsWith('O')) {
      return donorGroup.startsWith('O');
    }
  }

  return donorGroup === recipientGroup;
}

/**
 * Calculates days elapsed since a given ISO date string.
 */
export function calculateDaysSince(dateString: string | null): number | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/**
 * Checks whether the donor has cleared the required rest cooldown for the specified blood component.
 */
export function evaluateRestInterval(
  lastDonationDate: string | null,
  component: BloodComponentType
): { isCleared: boolean; daysSince: number | null; daysRemaining: number } {
  const requiredDays = REST_INTERVAL_DAYS[component] || 90;

  if (!lastDonationDate) {
    return { isCleared: true, daysSince: null, daysRemaining: 0 };
  }

  const daysSince = calculateDaysSince(lastDonationDate);
  if (daysSince === null) {
    return { isCleared: true, daysSince: null, daysRemaining: 0 };
  }

  if (daysSince >= requiredDays) {
    return { isCleared: true, daysSince, daysRemaining: 0 };
  }

  return {
    isCleared: false,
    daysSince,
    daysRemaining: requiredDays - daysSince,
  };
}

/**
 * Evaluates an individual donor candidate against clinical and geographic criteria.
 */
export function evaluateDonorCandidate(
  candidate: DonorCandidate,
  criteria: MatchingCriteria
): EvaluatedDonorMatch {
  const isExactMatch = candidate.bloodGroup === criteria.bloodGroup;
  const isCompatible = isBloodCompatible(candidate.bloodGroup, criteria.bloodGroup, criteria.component);
  
  const distanceKm = calculateDistanceKm(candidate.coordinates, criteria.targetCoordinates);
  const isWithinSearchRadius = distanceKm <= criteria.searchRadiusKm;
  const isWithinDonorRadius = distanceKm <= candidate.notificationRadiusKm;

  const restEval = evaluateRestInterval(candidate.lastDonationDate, criteria.component);
  const ineligibilityReasons: string[] = [];

  // Group compatibility check
  if (criteria.exactMatchOnly && !isExactMatch) {
    ineligibilityReasons.push(`Not an exact blood match (${candidate.bloodGroup} ≠ ${criteria.bloodGroup})`);
  } else if (!isCompatible) {
    ineligibilityReasons.push(
      `Incompatible blood group: ${candidate.bloodGroup} cannot donate ${criteria.component} to ${criteria.bloodGroup}`
    );
  }

  // Radius check
  if (!isWithinSearchRadius) {
    ineligibilityReasons.push(
      `Outside search radius (${distanceKm} km > ${criteria.searchRadiusKm} km)`
    );
  }

  // Availability check
  if (!candidate.isAvailable) {
    ineligibilityReasons.push('Donor status currently marked as unavailable / on leave');
  }

  // Medical Rest interval check
  if (!restEval.isCleared) {
    ineligibilityReasons.push(
      `Medical Rest Active: ${restEval.daysRemaining} days remaining before next eligible donation`
    );
  }

  const isEligibleOverall = ineligibilityReasons.length === 0;

  // Calculate matching ranking score
  // Higher score = better candidate to alert first
  let matchScore = 0;
  if (isExactMatch) matchScore += 100;
  else if (isCompatible) matchScore += 60;

  if (candidate.isAvailable) matchScore += 30;
  if (restEval.isCleared) matchScore += 30;
  if (candidate.phoneVerified) matchScore += 15;

  // Distance penalty (the closer to 0 km, the higher the score bonus, up to +40 pts)
  const proximityBonus = Math.max(0, 40 - distanceKm * 1.5);
  matchScore += proximityBonus;

  // Experience bonus (up to +10 pts for proven repeat donors)
  matchScore += Math.min(10, candidate.totalDonations * 2);

  return {
    candidate,
    distanceKm,
    isCompatible,
    isExactMatch,
    isRestCleared: restEval.isCleared,
    daysSinceLastDonation: restEval.daysSince,
    daysUntilEligible: restEval.daysRemaining,
    isWithinSearchRadius,
    isWithinDonorRadius,
    isEligibleOverall,
    ineligibilityReasons,
    matchScore: Math.round(matchScore),
  };
}

/**
 * Runs the matching engine over a dataset of donor candidates and returns a ranked summary.
 */
export function runMatchingEngine(
  candidates: DonorCandidate[],
  criteria: MatchingCriteria
): MatchingEngineSummary {
  const evaluated = candidates.map((c) => evaluateDonorCandidate(c, criteria));

  // Sort: Eligible first, then highest score, then closest distance
  evaluated.sort((a, b) => {
    if (a.isEligibleOverall && !b.isEligibleOverall) return -1;
    if (!a.isEligibleOverall && b.isEligibleOverall) return 1;
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.distanceKm - b.distanceKm;
  });

  const eligible = evaluated.filter((m) => m.isEligibleOverall);
  const exact = eligible.filter((m) => m.isExactMatch);
  const compatible = eligible.filter((m) => !m.isExactMatch);
  const ineligible = evaluated.filter((m) => !m.isEligibleOverall);

  const breakdown = {
    cooldownActive: evaluated.filter((m) => !m.isRestCleared).length,
    outsideRadius: evaluated.filter((m) => !m.isWithinSearchRadius).length,
    incompatibleGroup: evaluated.filter((m) => !m.isCompatible).length,
    unavailableStatus: evaluated.filter((m) => !m.candidate.isAvailable).length,
  };

  return {
    criteria,
    totalCandidates: candidates.length,
    eligibleCount: eligible.length,
    exactMatchesCount: exact.length,
    compatibleMatchesCount: compatible.length,
    ineligibleCount: ineligible.length,
    ineligibleBreakdown: breakdown,
    matches: evaluated,
  };
}
