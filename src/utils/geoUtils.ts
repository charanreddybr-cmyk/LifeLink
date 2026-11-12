/**
 * Geolocation & Privacy-Preserving Distance Utilities
 * Calculates Haversine distances and blurs donor exact home coordinates
 * in alignment with Indian DPDP privacy guidelines.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula.
 * @returns distance in kilometers rounded to one decimal place.
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Privacy Masking: Truncates coordinates to 2 decimal places (~1.1 km precision)
 * so that donors' exact residential address or apartment unit is NEVER stored.
 */
export function blurCoordinatesForPrivacy(coord: Coordinates): Coordinates {
  return {
    lat: Math.round(coord.lat * 100) / 100,
    lng: Math.round(coord.lng * 100) / 100,
  };
}

/**
 * Request approximate current position via Browser Geolocation API with explicit consent.
 */
export function requestConsentedLocation(): Promise<{ success: boolean; coords?: Coordinates; error?: string }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // Apply privacy blur before resolving
        const masked = blurCoordinatesForPrivacy(rawCoords);
        resolve({
          success: true,
          coords: masked,
        });
      },
      (error) => {
        let errorMsg = 'Location permission was denied or unavailable.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location access was declined. You can manually select your Bengaluru locality instead.';
        }
        resolve({
          success: false,
          error: errorMsg,
        });
      },
      {
        enableHighAccuracy: false, // Low accuracy preferred for civic privacy
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}
