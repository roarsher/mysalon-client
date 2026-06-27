//  import { useNavigate } from 'react-router-dom';
// import { useLocation, formatDistance, getDistanceKm } from '../../context/LocationContext';
// import QueueBadge   from '../common/QueueBadge';
// import StarRating   from '../common/StarRating';
// import { truncate } from '../../utils/helpers';

// const SalonCard = ({ salon }) => {
//   const navigate       = useNavigate();
//   const { userLocation } = useLocation();

//   const {
//     _id, name, category, coverImage, address,
//     rating, totalReviews, tags = [],
//     priceRangeMin, priceRangeMax,
//     queueCount = 0, estimatedWait = 0,
//     isOpen, location,
//   } = salon;

//   // Calculate distance from user
//   let distanceLabel = null;
//   let distanceKm    = null;
//   if (userLocation && location?.coordinates?.length === 2) {
//     const [lng, lat] = location.coordinates; // GeoJSON [lng, lat]
//     distanceKm    = getDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
//     distanceLabel = formatDistance(distanceKm);
//   }

//   const isNear = distanceKm !== null && distanceKm < 2;

//   return (
//     <div
//       onClick={() => navigate(`/salon/${_id}`)}
//       className="card cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden group"
//     >
//       {/* Cover image */}
//       <div className="relative h-36 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
//         {coverImage?.url ? (
//           <img src={coverImage.url} alt={name}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-4xl">✂️</div>
//         )}

//         {/* Open/Closed */}
//         <span className={`absolute top-2 left-2 badge text-xs ${isOpen ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
//           {isOpen ? '● Open' : '● Closed'}
//         </span>

//         {/* Distance badge — top right */}
//         {distanceLabel && (
//           <span className={`absolute top-2 right-2 badge text-xs backdrop-blur-sm ${
//             isNear ? 'bg-secondary text-white' : 'bg-black/50 text-white'
//           }`}>
//             📍 {distanceLabel}
//           </span>
//         )}
//       </div>

//       {/* Content */}
//       <div className="p-3">
//         <div className="flex items-start justify-between gap-1 mb-1">
//           <h3 className="font-semibold text-gray-900 text-sm leading-snug">{truncate(name, 28)}</h3>
//           <StarRating rating={rating} count={totalReviews} />
//         </div>

//         {/* Location + price */}
//         <p className="text-xs text-gray-500 mb-2">
//           {address?.area && `${address.area}, `}{address?.city}
//           {priceRangeMin > 0 && ` · ₹${priceRangeMin}–${priceRangeMax}`}
//         </p>

//         {/* Tags */}
//         {tags.length > 0 && (
//           <div className="flex flex-wrap gap-1 mb-2">
//             {tags.slice(0, 3).map((t) => (
//               <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{t}</span>
//             ))}
//           </div>
//         )}

//         {/* Queue badge */}
//         <QueueBadge count={queueCount} wait={estimatedWait} />

//         {/* Distance text below (if nearby, show a friendly label) */}
//         {distanceLabel && (
//           <p className={`text-xs mt-1.5 font-medium ${isNear ? 'text-secondary-dark' : 'text-gray-400'}`}>
//             {isNear ? `🚶 ${distanceLabel} away — very close!` : `🚗 ${distanceLabel} away`}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SalonCard;
import { useNavigate }   from 'react-router-dom';
import { useLocation as useUserLocation, formatDistance, getDistanceKm } from '../../context/LocationContext';
import QueueBadge  from '../common/QueueBadge';
import StarRating  from '../common/StarRating';
import { truncate } from '../../utils/helpers';

const SalonCard = ({ salon }) => {
  const navigate = useNavigate();
  const { userLocation } = useUserLocation();

  const {
    _id, name, category, coverImage, address,
    rating, totalReviews, tags = [],
    priceRangeMin, priceRangeMax,
    queueCount = 0, estimatedWait = 0,
    isOpen, location,
  } = salon;

  // ── Distance calculation ─────────────────────────────────────────────────
  let distanceLabel = null;
  let distanceKm    = null;

  if (userLocation?.lat && location?.coordinates) {
    const [lng, lat] = location.coordinates; // GeoJSON order: [lng, lat]
    // Only calculate if coordinates are real (not default [0,0])
    if (lat !== 0 || lng !== 0) {
      distanceKm    = getDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
      distanceLabel = formatDistance(distanceKm);
    }
  }

  const isNear = distanceKm !== null && distanceKm < 2;

  return (
    <div
      onClick={() => navigate(`/salon/${_id}`)}
      className="card cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {/* ── Cover image ──────────────────────────────────────────────── */}
      <div className="relative h-36 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        {coverImage?.url ? (
          <img
            src={coverImage.url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none">✂️</div>
        )}

        {/* Open / Closed */}
        <span className={`absolute top-2 left-2 badge text-xs ${isOpen ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
          {isOpen ? '● Open' : '● Closed'}
        </span>

        {/* Distance badge — top right */}
        {distanceLabel && (
          <span className={`absolute top-2 right-2 badge text-xs backdrop-blur-sm ${
            isNear ? 'bg-secondary text-white' : 'bg-black/55 text-white'
          }`}>
            📍 {distanceLabel}
          </span>
        )}
      </div>

      {/* ── Card body ────────────────────────────────────────────────── */}
      <div className="p-3">
        {/* Name + rating */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{truncate(name, 26)}</h3>
          <StarRating rating={rating} count={totalReviews} />
        </div>

        {/* City + price range */}
        <p className="text-xs text-gray-500 mb-2">
          {address?.area  ? `${address.area}, ` : ''}
          {address?.city  || ''}
          {priceRangeMin > 0 && ` · ₹${priceRangeMin}–${priceRangeMax}`}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{t}</span>
            ))}
          </div>
        )}

        {/* Queue badge */}
        <QueueBadge count={queueCount} wait={estimatedWait} />

        {/* Distance text — friendly label below queue badge */}
        {distanceLabel && (
          <p className={`text-xs mt-1.5 font-medium ${
            isNear ? 'text-secondary-dark' : 'text-gray-400'
          }`}>
            {isNear
              ? `🚶 ${distanceLabel} — very close!`
              : `🚗 ${distanceLabel} away`}
          </p>
        )}
      </div>
    </div>
  );
};

export default SalonCard;