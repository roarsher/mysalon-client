 import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext(null);
export const useLocation = () => useContext(LocationContext);

const STORAGE_KEY = 'mysalon_user_location';

// ── Haversine — distance in km ────────────────────────────────────────────────
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  // Return null if either point is at default 0,0
  if ((lat2 === 0 && lng2 === 0) || (lat1 === 0 && lng1 === 0)) return null;
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Format distance ───────────────────────────────────────────────────────────
export function formatDistance(km) {
  if (km === null || km === undefined) return null;
  if (km < 1)  return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// ── Reverse geocode (Nominatim) ───────────────────────────────────────────────
export async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a    = data.address || {};
    return {
      lat, lng,
      label:   a.suburb || a.neighbourhood || a.quarter || a.city_district || a.town || a.city || 'Your location',
      street:  [a.road, a.house_number].filter(Boolean).join(' ') || '',
      area:    a.suburb || a.neighbourhood || a.quarter || a.city_district || '',
      city:    a.city   || a.town || a.village || a.county || '',
      state:   a.state  || '',
      pincode: a.postcode || '',
      full:    data.display_name || '',
    };
  } catch {
    return { lat, lng, label: 'Your location', street: '', area: '', city: '', state: '', pincode: '', full: '' };
  }
}

// ── Forward geocode ───────────────────────────────────────────────────────────
export async function searchPlaces(query) {
  if (!query || query.length < 3) return [];
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.map((item) => ({
      lat:   parseFloat(item.lat),
      lng:   parseFloat(item.lon),
      label: item.display_name,
      short: item.address?.suburb || item.address?.city_district || item.address?.city || item.display_name,
      type:  item.type,
    }));
  } catch { return []; }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [detecting, setDetecting] = useState(false);
  const [error,     setError]     = useState(null);

  // Persist to localStorage
  useEffect(() => {
    if (userLocation) localStorage.setItem(STORAGE_KEY, JSON.stringify(userLocation));
  }, [userLocation]);

  // ── Auto-detect GPS on first visit (if nothing saved yet) ─────────────────
  useEffect(() => {
    // Already have a saved location — use it, don't re-detect
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (!navigator.geolocation) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const geo = await reverseGeocode(coords.latitude, coords.longitude);
          setUserLocation(geo);
        } catch {
          // silent fail — user can detect manually from Navbar
        } finally {
          setDetecting(false);
        }
      },
      () => { setDetecting(false); }, // permission denied — silent
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []); // run once on mount

  // ── detectLocation — triggered by Navbar "Use my GPS" button ──────────────
  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return null; }
    setDetecting(true);
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const geo = await reverseGeocode(coords.latitude, coords.longitude);
          setUserLocation(geo);
          setDetecting(false);
          resolve(geo);
        },
        (err) => {
          setError(err.code === 1 ? 'Location permission denied.' : 'Could not detect location.');
          setDetecting(false);
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, []);

  // ── setLocation — from map picker ─────────────────────────────────────────
  const setLocation = useCallback(async (lat, lng) => {
    const geo = await reverseGeocode(lat, lng);
    setUserLocation(geo);
    return geo;
  }, []);

  // ── distanceTo — used by SalonCard ────────────────────────────────────────
  const distanceTo = useCallback((salonLat, salonLng) => {
    if (!userLocation?.lat || !userLocation?.lng) return null;
    return getDistanceKm(userLocation.lat, userLocation.lng, salonLat, salonLng);
  }, [userLocation]);

  return (
    <LocationContext.Provider value={{
      userLocation, detecting, error,
      detectLocation, setLocation, distanceTo,
    }}>
      {children}
    </LocationContext.Provider>
  );
};