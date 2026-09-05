/**
 * Reverse-geocodes the browser's location to a "City, State" string.
 * Ported from `detectUserLocation` (med.js:1564-1592).
 *
 * Note: Nominatim's usage policy caps requests at 1/second and asks for an
 * identifying User-Agent, which a browser cannot set. This is fine for
 * interactive, user-initiated use — it is deliberately not called automatically.
 */
export class GeolocationError extends Error {}

interface NominatimResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

export function detectUserLocation(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { Accept: 'application/json' } },
          );
          if (!response.ok) {
            resolve(fallback);
            return;
          }
          const json = (await response.json()) as NominatimResponse;
          const address = json.address ?? {};
          const city = address.city ?? address.town ?? address.village;
          const parts = [city, address.state, address.postcode].filter(Boolean);
          resolve(parts.length > 0 ? parts.join(', ') : fallback);
        } catch {
          // Network or CORS failure still yields a usable location.
          resolve(fallback);
        }
      },
      (err) => {
        reject(
          new GeolocationError(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission was denied. Enter your city manually.'
              : 'Could not determine your location. Enter your city manually.',
          ),
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}
