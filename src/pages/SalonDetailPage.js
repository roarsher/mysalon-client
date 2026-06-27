// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast }         from 'react-toastify';
// import { getSalonById }  from '../services/api';
// import { useAuth }       from '../context/AuthContext';
// import QueueVisual    from '../components/queue/QueueVisual';
// import ServiceSection from '../components/salon/ServiceSection';
// import StarRating     from '../components/common/StarRating';
// import Spinner        from '../components/common/Spinner';
// import { formatPrice, formatWait, CATEGORY_LABELS } from '../utils/helpers';

// export default function SalonDetailPage() {
//   const { id }      = useParams();
//   const navigate    = useNavigate();
//   const { currentUser } = useAuth();

//   const [salon,    setSalon]    = useState(null);
//   const [loading,  setLoading]  = useState(true);
//   const [selected, setSelected] = useState([]);   // selected service IDs
//   const [imgIdx,   setImgIdx]   = useState(0);    // gallery image index

//   useEffect(() => {
//     getSalonById(id)
//       .then((res) => setSalon(res.data.data))
//       .catch(() => toast.error('Could not load salon.'))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <Spinner size="lg" />;
//   if (!salon)  return (
//     <div className="text-center py-20 text-gray-400">
//       <div className="text-5xl mb-3">😕</div>
//       <p>Salon not found.</p>
//       <button onClick={() => navigate('/')} className="mt-4 text-primary text-sm hover:underline">← Back to home</button>
//     </div>
//   );

//   const {
//     name, description, category, coverImage, gallery = [],
//     address, phone, rating, totalReviews,
//     workingHours = [], tags = [],
//     priceRangeMin, priceRangeMax,
//     services = [], servicesByCategory = {},
//     queueCount = 0, estimatedWait = 0, isPaused,
//     isOpen, isCurrentlyOpen,
//   } = salon;

//   // Toggle service selection
//   const toggleService = (sid) => {
//     setSelected((prev) =>
//       prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
//     );
//   };

//   const totalAmount   = services.filter((s) => selected.includes(s._id)).reduce((a, s) => a + s.price, 0);
//   const totalDuration = services.filter((s) => selected.includes(s._id)).reduce((a, s) => a + s.duration, 0);

//   const handleBook = () => {
//     if (!currentUser) { navigate('/login', { state: { from: { pathname: `/salon/${id}` } } }); return; }
//     if (!selected.length) { toast.warning('Please select at least one service.'); return; }
//     navigate(`/booking/${id}`, {
//       state: { serviceIds: selected, salonName: name, total: totalAmount },
//     });
//   };

//   // All gallery images including cover
//   const allImages = [
//     ...(coverImage?.url ? [coverImage] : []),
//     ...gallery,
//   ];

//   // Today's working hours
//   const days    = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
//   const todayWH = workingHours.find((h) => h.day === days[new Date().getDay()]);

//   return (
//     <div className="max-w-2xl mx-auto bg-white min-h-screen pb-32">

//       {/* ── Image gallery ──────────────────────────────────────────────────── */}
//       <div className="relative h-56 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
//         {allImages.length > 0 ? (
//           <>
//             <img src={allImages[imgIdx]?.url} alt={name}
//               className="w-full h-full object-cover" />
//             {/* Image navigation */}
//             {allImages.length > 1 && (
//               <>
//                 <button onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50">‹</button>
//                 <button onClick={() => setImgIdx((i) => (i + 1) % allImages.length)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50">›</button>
//                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
//                   {allImages.map((_, i) => (
//                     <div key={i} onClick={() => setImgIdx(i)}
//                       className={`w-1.5 h-1.5 rounded-full cursor-pointer transition ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
//                   ))}
//                 </div>
//               </>
//             )}
//           </>
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-6xl">✂️</div>
//         )}

//         {/* Back button */}
//         <button onClick={() => navigate(-1)}
//           className="absolute top-3 left-3 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50 text-sm">
//           ←
//         </button>

//         {/* Open / Closed badge */}
//         <span className={`absolute top-3 right-3 badge text-xs ${isCurrentlyOpen || isOpen ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
//           {isCurrentlyOpen || isOpen ? 'Open Now' : 'Closed'}
//         </span>
//       </div>

//       {/* ── Salon info header ─────────────────────────────────────────────── */}
//       <div className="px-4 pt-4 pb-3 border-b border-gray-100">
//         <div className="flex items-start justify-between gap-2 mb-1">
//           <h1 className="text-xl font-bold text-gray-900 leading-snug">{name}</h1>
//           <StarRating rating={rating} count={totalReviews} size="lg" />
//         </div>

//         <p className="text-sm text-gray-500 capitalize mb-2">
//           {CATEGORY_LABELS?.[category] || category} · {address?.area && `${address.area}, `}{address?.city}
//           {priceRangeMin > 0 && ` · ${formatPrice(priceRangeMin)}–${formatPrice(priceRangeMax)}`}
//         </p>

//         {description && (
//           <p className="text-sm text-gray-600 leading-relaxed mb-2">{description}</p>
//         )}

//         {/* Tags */}
//         {tags.length > 0 && (
//           <div className="flex flex-wrap gap-1.5 mb-3">
//             {tags.map((t) => (
//               <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{t}</span>
//             ))}
//           </div>
//         )}

//         {/* Quick info pills */}
//         <div className="flex flex-wrap gap-2 text-xs text-gray-500">
//           {phone && <span>📞 {phone}</span>}
//           {todayWH?.isOpen && (
//             <span>🕐 {todayWH.openTime} – {todayWH.closeTime}</span>
//           )}
//         </div>
//       </div>

//       {/* ── Live queue ────────────────────────────────────────────────────── */}
//       <div className="px-4 py-4 border-b border-gray-100">
//         <QueueVisual count={queueCount} wait={estimatedWait} isPaused={isPaused} />
//       </div>

//       {/* ── Services (Zomato-style menu) ──────────────────────────────────── */}
//       <div className="px-4 py-4">
//         <h2 className="section-title mb-4">Services</h2>

//         {Object.keys(servicesByCategory).length === 0 ? (
//           <p className="text-sm text-gray-400 text-center py-6">No services listed yet.</p>
//         ) : (
//           Object.entries(servicesByCategory).map(([cat, catServices]) => (
//             <ServiceSection
//               key={cat}
//               category={cat}
//               services={catServices}
//               selected={selected}
//               onToggle={toggleService}
//             />
//           ))
//         )}
//       </div>

//       {/* ── Fixed booking bar ─────────────────────────────────────────────── */}
//       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
//         <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
//           <div>
//             {selected.length === 0 ? (
//               <p className="text-sm text-gray-400">Select services to book</p>
//             ) : (
//               <>
//                 <p className="text-xs text-gray-400">{selected.length} service{selected.length !== 1 ? 's' : ''} · ~{Math.floor(totalDuration)} min</p>
//                 <p className="text-base font-bold text-gray-900">{formatPrice(totalAmount)}</p>
//               </>
//             )}
//           </div>
//           <button
//             onClick={handleBook}
//             disabled={!selected.length || (!isOpen && !isCurrentlyOpen)}
//             className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98] whitespace-nowrap"
//           >
//             {!isOpen ? 'Salon Closed' : selected.length === 0 ? 'Select Services' : 'Book & Pay'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast }         from 'react-toastify';
import { getSalonById }  from '../services/api';
import { useAuth }       from '../context/AuthContext';
import QueueVisual    from '../components/queue/QueueVisual';
import ServiceSection from '../components/salon/ServiceSection';
import SalonReviews   from '../components/salon/SalonReviews';
import StarRating     from '../components/common/StarRating';
import Spinner        from '../components/common/Spinner';
import { formatPrice, formatWait, CATEGORY_LABELS } from '../utils/helpers';

export default function SalonDetailPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { currentUser } = useAuth();

  const [salon,    setSalon]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState([]);   // selected service IDs
  const [imgIdx,   setImgIdx]   = useState(0);    // gallery image index

  useEffect(() => {
    getSalonById(id)
      .then((res) => setSalon(res.data.data))
      .catch(() => toast.error('Could not load salon.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!salon)  return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-5xl mb-3">😕</div>
      <p>Salon not found.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-primary text-sm hover:underline">← Back to home</button>
    </div>
  );

  const {
    name, description, category, coverImage, gallery = [],
    address, phone, rating, totalReviews,
    workingHours = [], tags = [],
    priceRangeMin, priceRangeMax,
    services = [], servicesByCategory = {},
    queueCount = 0, estimatedWait = 0, isPaused,
    isOpen, isCurrentlyOpen,
  } = salon;

  // Toggle service selection
  const toggleService = (sid) => {
    setSelected((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const totalAmount   = services.filter((s) => selected.includes(s._id)).reduce((a, s) => a + s.price, 0);
  const totalDuration = services.filter((s) => selected.includes(s._id)).reduce((a, s) => a + s.duration, 0);

  const handleBook = () => {
    if (!currentUser) { navigate('/login', { state: { from: { pathname: `/salon/${id}` } } }); return; }
    if (!selected.length) { toast.warning('Please select at least one service.'); return; }
    navigate(`/booking/${id}`, {
      state: { serviceIds: selected, salonName: name, total: totalAmount },
    });
  };

  // All gallery images including cover
  const allImages = [
    ...(coverImage?.url ? [coverImage] : []),
    ...gallery,
  ];

  // Today's working hours
  const days    = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const todayWH = workingHours.find((h) => h.day === days[new Date().getDay()]);

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen pb-32">

      {/* ── Image gallery ──────────────────────────────────────────────────── */}
      <div className="relative h-56 bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <img src={allImages[imgIdx]?.url} alt={name}
              className="w-full h-full object-cover" />
            {/* Image navigation */}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50">‹</button>
                <button onClick={() => setImgIdx((i) => (i + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50">›</button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {allImages.map((_, i) => (
                    <div key={i} onClick={() => setImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">✂️</div>
        )}

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-3 left-3 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50 text-sm">
          ←
        </button>

        {/* Open / Closed badge */}
        <span className={`absolute top-3 right-3 badge text-xs ${isCurrentlyOpen || isOpen ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
          {isCurrentlyOpen || isOpen ? 'Open Now' : 'Closed'}
        </span>
      </div>

      {/* ── Salon info header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{name}</h1>
          <StarRating rating={rating} count={totalReviews} size="lg" />
        </div>

        <p className="text-sm text-gray-500 capitalize mb-2">
          {CATEGORY_LABELS?.[category] || category} · {address?.area && `${address.area}, `}{address?.city}
          {priceRangeMin > 0 && ` · ${formatPrice(priceRangeMin)}–${formatPrice(priceRangeMax)}`}
        </p>

        {description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-2">{description}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
        )}

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {phone && <span>📞 {phone}</span>}
          {todayWH?.isOpen && (
            <span>🕐 {todayWH.openTime} – {todayWH.closeTime}</span>
          )}
        </div>
      </div>

      {/* ── Live queue ────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-gray-100">
        <QueueVisual count={queueCount} wait={estimatedWait} isPaused={isPaused} />
      </div>

      {/* ── Services (Zomato-style menu) ──────────────────────────────────── */}
      <div className="px-4 py-4 border-b border-gray-100">
        <h2 className="section-title mb-4">Services</h2>

        {Object.keys(servicesByCategory).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No services listed yet.</p>
        ) : (
          Object.entries(servicesByCategory).map(([cat, catServices]) => (
            <ServiceSection
              key={cat}
              category={cat}
              services={catServices}
              selected={selected}
              onToggle={toggleService}
            />
          ))
        )}
      </div>

      {/* ── Customer Reviews ──────────────────────────────────────────────── */}
      <div className="border-b border-gray-100">
        <SalonReviews
          salonId={id}
          avgRating={rating}
          totalReviews={totalReviews}
        />
      </div>

      {/* ── Fixed booking bar ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            {selected.length === 0 ? (
              <p className="text-sm text-gray-400">Select services to book</p>
            ) : (
              <>
                <p className="text-xs text-gray-400">{selected.length} service{selected.length !== 1 ? 's' : ''} · ~{Math.floor(totalDuration)} min</p>
                <p className="text-base font-bold text-gray-900">{formatPrice(totalAmount)}</p>
              </>
            )}
          </div>
          <button
            onClick={handleBook}
            disabled={!selected.length || (!isOpen && !isCurrentlyOpen)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98] whitespace-nowrap"
          >
            {!isOpen ? 'Salon Closed' : selected.length === 0 ? 'Select Services' : 'Book & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}