// Geofence configuration for company HQ
// Default coordinates (latitude, longitude) - replace if needed
const DEFAULT = {
  HQ_LAT: -7.1605,
  HQ_LNG: 112.6296,
  RADIUS_METERS: 75
};

// Returns effective geofence, allowing runtime override via localStorage
export default function getGeofence() {
  try {
    const raw = localStorage.getItem('geofence.override');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return {
          HQ_LAT: parsed.lat,
          HQ_LNG: parsed.lng,
          RADIUS_METERS: typeof parsed.radius === 'number' ? parsed.radius : DEFAULT.RADIUS_METERS
        };
      }
    }
  } catch (e) {
    // ignore parse errors
  }
  return DEFAULT;
}

