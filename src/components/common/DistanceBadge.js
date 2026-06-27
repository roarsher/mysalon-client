import { useLocation, formatDistance } from '../../context/LocationContext';

/**
 * DistanceBadge
 * Shows "1.2 km away" on salon cards.
 * Returns null silently if user hasn't shared location.
 */
const DistanceBadge = ({ salonCoordinates }) => {
  const { distanceTo } = useLocation();

  if (!salonCoordinates?.coordinates?.length) return null;
  const [lng, lat] = salonCoordinates.coordinates; // GeoJSON is [lng, lat]
  const km = distanceTo(lat, lng);
  if (km === null) return null;

  const label  = formatDistance(km);
  const isNear = km < 2;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
      isNear ? 'text-secondary-dark' : 'text-gray-500'
    }`}>
      <span>📍</span>
      {label}
    </span>
  );
};

export default DistanceBadge;