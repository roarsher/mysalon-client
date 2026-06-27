import { useState, useEffect, useRef, useCallback } from 'react';
import { reverseGeocode, searchPlaces } from '../../context/LocationContext';

/**
 * MapLocationPicker
 * -----------------
 * Blinkit / Swiggy style location picker:
 *   - Shows an interactive map (OpenStreetMap via Leaflet — free, no API key)
 *   - User can drag the pin to exact location
 *   - Address auto-fetches from pin position via Nominatim
 *   - User can also search by typing (forward geocode)
 *   - "Use my GPS" button snaps pin to current GPS
 *
 * Props:
 *   initialLat, initialLng  — starting pin position
 *   onConfirm(addressObj)   — called when user clicks "Confirm Location"
 *   onClose()               — called to close the modal
 */

// ── Load Leaflet dynamically (avoids SSR issues) ──────────────────────────────
let leafletLoaded = false;
const loadLeaflet = () => new Promise((resolve) => {
  if (window.L && leafletLoaded) { resolve(window.L); return; }

  // Load CSS
  if (!document.querySelector('#leaflet-css')) {
    const link = document.createElement('link');
    link.id    = 'leaflet-css';
    link.rel   = 'stylesheet';
    link.href  = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
  }

  // Load JS
  const script  = document.createElement('script');
  script.src    = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  script.onload = () => { leafletLoaded = true; resolve(window.L); };
  document.body.appendChild(script);
});

export default function MapLocationPicker({ initialLat, initialLng, onConfirm, onClose }) {
  const mapRef      = useRef(null);  // DOM element
  const leafletMap  = useRef(null);  // Leaflet map instance
  const markerRef   = useRef(null);  // Leaflet marker instance

  const [address,    setAddress]    = useState(null);
  const [loading,    setLoading]    = useState(false);  // geocoding in progress
  const [searching,  setSearching]  = useState(false);
  const [searchText, setSearchText] = useState('');
  const [suggestions,setSuggestions]= useState([]);
  const [showSuggest,setShowSuggest]= useState(false);
  const [detecting,  setDetecting]  = useState(false);
  const [manualStreet, setManualStreet] = useState('');
  const searchTimeout = useRef(null);

  // ── Fetch address for a given lat/lng ─────────────────────────────────────
  const fetchAddress = useCallback(async (lat, lng) => {
    setLoading(true);
    const geo = await reverseGeocode(lat, lng);
    setAddress(geo);
    setManualStreet(geo.street || '');
    setLoading(false);
  }, []);

  // ── Initialise Leaflet map ─────────────────────────────────────────────────
  useEffect(() => {
    let map, marker;
    const startLat = initialLat || 28.6139;   // Default: New Delhi
    const startLng = initialLng || 77.2090;

    loadLeaflet().then((L) => {
      if (!mapRef.current || leafletMap.current) return;

      map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([startLat, startLng], 16);

      // OpenStreetMap tiles — free, no API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pin icon (purple to match MYSALON brand)
      const pinIcon = L.divIcon({
        html: `
          <div style="position:relative;width:32px;height:40px;">
            <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
                fill="#534AB7" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          </div>`,
        iconSize:   [32, 40],
        iconAnchor: [16, 40],
        className:  '',
      });

      marker = L.marker([startLat, startLng], { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current = marker;
      leafletMap.current = map;

      // Fetch address for initial position
      fetchAddress(startLat, startLng);

      // When marker is dragged, reverse geocode new position
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        fetchAddress(lat, lng);
      });

      // Clicking map moves marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        fetchAddress(lat, lng);
      });
    });

    return () => {
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Move map to a new lat/lng ─────────────────────────────────────────────
  const flyTo = useCallback((lat, lng) => {
    if (!leafletMap.current || !markerRef.current) return;
    leafletMap.current.flyTo([lat, lng], 17, { duration: 0.8 });
    markerRef.current.setLatLng([lat, lng]);
    fetchAddress(lat, lng);
  }, [fetchAddress]);

  // ── Detect GPS ────────────────────────────────────────────────────────────
  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        flyTo(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // ── Search with debounce ──────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchText(q);
    clearTimeout(searchTimeout.current);
    if (q.length < 3) { setSuggestions([]); setShowSuggest(false); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchPlaces(q);
      setSuggestions(results);
      setShowSuggest(true);
      setSearching(false);
    }, 400);
  };

  const handleSuggestionClick = (place) => {
    setSearchText(place.short || place.label);
    setShowSuggest(false);
    setSuggestions([]);
    flyTo(place.lat, place.lng);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!address) return;
    onConfirm({
      ...address,
      street: manualStreet || address.street,  // user can override street
      lat:    markerRef.current?.getLatLng().lat || address.lat,
      lng:    markerRef.current?.getLatLng().lng || address.lng,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex flex-col">
      <div className="flex flex-col h-full max-w-2xl mx-auto w-full bg-white">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white z-10">
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
            ←
          </button>
          <h2 className="font-semibold text-gray-900">Set Salon Location</h2>
        </div>

        {/* ── Search bar ─────────────────────────────────────────────────── */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 relative z-20">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search area, street, landmark…"
              className="w-full bg-gray-100 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30 transition"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
              </span>
            )}
          </div>

          {/* Search suggestions dropdown */}
          {showSuggest && suggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSuggestionClick(s)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-0">
                  <span className="text-gray-400 mt-0.5 flex-shrink-0">📍</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.short}</p>
                    <p className="text-xs text-gray-400 truncate">{s.label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Map container ──────────────────────────────────────────────── */}
        <div className="relative flex-1 min-h-0">
          <div ref={mapRef} className="w-full h-full" />

          {/* GPS button — floats over map */}
          <button
            onClick={handleDetectGPS}
            disabled={detecting}
            className="absolute bottom-4 right-4 z-[500] bg-white shadow-lg border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-primary flex items-center gap-2 hover:bg-primary-50 transition disabled:opacity-50"
          >
            {detecting
              ? <><span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Detecting…</>
              : <><span>📍</span> Use my GPS</>
            }
          </button>

          {/* Hint text */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap backdrop-blur-sm">
            Drag the pin or tap map to set location
          </div>
        </div>

        {/* ── Address panel ──────────────────────────────────────────────── */}
        <div className="bg-white border-t border-gray-200 px-4 pt-4 pb-safe">
          {loading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Fetching address…
            </div>
          ) : address ? (
            <div className="mb-4">
              {/* Detected address */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-secondary text-xl mt-0.5">📍</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {address.area || address.city || 'Selected location'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {address.full ? address.full.split(',').slice(0, 4).join(',') : '—'}
                  </p>
                </div>
              </div>

              {/* Street / building input — user types this manually */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Flat / Building / Street <span className="text-gray-400">(help customers find you)</span>
                </label>
                <input
                  value={manualStreet}
                  onChange={(e) => setManualStreet(e.target.value)}
                  placeholder="e.g. Shop 12, Sunrise Complex, MG Road"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              {/* Auto-filled fields preview */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                  <p className="text-gray-400 mb-0.5">Area</p>
                  <p className="font-medium text-gray-700 truncate">{address.area || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                  <p className="text-gray-400 mb-0.5">City</p>
                  <p className="font-medium text-gray-700 truncate">{address.city || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                  <p className="text-gray-400 mb-0.5">Pincode</p>
                  <p className="font-medium text-gray-700">{address.pincode || '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3 text-sm text-gray-400 text-center">Move the pin to set your location</div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!address || loading}
            className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]"
          >
            Confirm Location
          </button>
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}