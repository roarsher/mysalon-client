// import { useState, useEffect } from 'react';
// import { getSalonReviews }     from '../../services/api';

// // ── Star renderer ─────────────────────────────────────────────────────────────
// function Stars({ score, size = 'sm' }) {
//   const s = size === 'sm' ? 'text-sm' : 'text-base';
//   return (
//     <span className={s}>
//       {[1,2,3,4,5].map((i) => (
//         <span key={i} className={i <= score ? 'text-yellow-400' : 'text-gray-200'}>★</span>
//       ))}
//     </span>
//   );
// }

// // ── Avatar with initials fallback ─────────────────────────────────────────────
// function Avatar({ name, photoURL }) {
//   const initials = (name || 'U')
//     .split(' ')
//     .map((w) => w[0])
//     .slice(0, 2)
//     .join('')
//     .toUpperCase();

//   const colors = [
//     'bg-purple-100 text-purple-700',
//     'bg-blue-100 text-blue-700',
//     'bg-green-100 text-green-700',
//     'bg-pink-100 text-pink-700',
//     'bg-orange-100 text-orange-700',
//   ];
//   const color = colors[initials.charCodeAt(0) % colors.length];

//   if (photoURL) {
//     return (
//       <img
//         src={photoURL}
//         alt={name}
//         className="w-9 h-9 rounded-full object-cover flex-shrink-0"
//       />
//     );
//   }
//   return (
//     <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${color}`}>
//       {initials}
//     </div>
//   );
// }

// // ── Mask last name: "Rahul Kumar" → "Rahul K." ────────────────────────────────
// function maskName(name = '') {
//   const parts = name.trim().split(' ');
//   if (parts.length === 1) return parts[0];
//   return `${parts[0]} ${parts[parts.length - 1][0]}.`;
// }

// // ── Time ago ──────────────────────────────────────────────────────────────────
// function timeAgo(date) {
//   const diff = Date.now() - new Date(date).getTime();
//   const days = Math.floor(diff / 86400000);
//   if (days === 0) return 'Today';
//   if (days === 1) return 'Yesterday';
//   if (days < 30)  return `${days}d ago`;
//   if (days < 365) return `${Math.floor(days / 30)}mo ago`;
//   return `${Math.floor(days / 365)}y ago`;
// }

// // ── Rating summary bar ────────────────────────────────────────────────────────
// function RatingSummary({ reviews, avgRating, total }) {
//   const counts = [5,4,3,2,1].map((star) => ({
//     star,
//     count: reviews.filter((r) => Math.round(r.rating) === star).length,
//   }));

//   return (
//     <div className="flex gap-4 items-center mb-5 p-4 bg-gray-50 rounded-2xl">
//       {/* Big average */}
//       <div className="text-center flex-shrink-0">
//         <div className="text-4xl font-bold text-gray-900">{avgRating?.toFixed(1) || '—'}</div>
//         <Stars score={Math.round(avgRating || 0)} size="sm" />
//         <div className="text-xs text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</div>
//       </div>

//       {/* Bar breakdown */}
//       <div className="flex-1 space-y-1">
//         {counts.map(({ star, count }) => {
//           const pct = total > 0 ? Math.round((count / total) * 100) : 0;
//           return (
//             <div key={star} className="flex items-center gap-2">
//               <span className="text-xs text-gray-400 w-3">{star}</span>
//               <span className="text-yellow-400 text-xs">★</span>
//               <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-yellow-400 rounded-full transition-all duration-500"
//                   style={{ width: `${pct}%` }}
//                 />
//               </div>
//               <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ── Single review card ────────────────────────────────────────────────────────
// function ReviewCard({ review }) {
//   const [expanded, setExpanded] = useState(false);
//   const comment = review.comment || '';
//   const long    = comment.length > 120;

//   return (
//     <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
//       {/* Reviewer header */}
//       <div className="flex items-start gap-3 mb-3">
//         <Avatar name={review.user?.name} photoURL={review.user?.photoURL} />
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center justify-between gap-2">
//             <p className="text-sm font-semibold text-gray-900 truncate">
//               {maskName(review.user?.name || 'Customer')}
//             </p>
//             <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(review.createdAt)}</span>
//           </div>
//           <div className="flex items-center gap-2 mt-0.5">
//             <Stars score={review.rating} size="sm" />
//             <span className="text-xs text-gray-500">{review.rating}/5</span>
//           </div>
//         </div>
//       </div>

//       {/* Comment */}
//       {comment && (
//         <div className="mb-2">
//           <p className="text-sm text-gray-700 leading-relaxed">
//             {long && !expanded ? `${comment.slice(0, 120)}…` : comment}
//           </p>
//           {long && (
//             <button
//               onClick={() => setExpanded((v) => !v)}
//               className="text-xs text-primary hover:underline mt-1"
//             >
//               {expanded ? 'Show less' : 'Read more'}
//             </button>
//           )}
//         </div>
//       )}

//       {/* Verified badge */}
//       <div className="flex items-center gap-1 mt-2">
//         <span className="text-xs text-green-600 font-medium">✔ Verified Visit</span>
//       </div>

//       {/* Owner reply */}
//       {review.ownerReply?.text && (
//         <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
//           <p className="text-xs font-semibold text-blue-700 mb-1">💬 Owner Reply</p>
//           <p className="text-xs text-gray-700 leading-relaxed">{review.ownerReply.text}</p>
//           {review.ownerReply.repliedAt && (
//             <p className="text-xs text-gray-400 mt-1">{timeAgo(review.ownerReply.repliedAt)}</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN EXPORT
// // ══════════════════════════════════════════════════════════════════════════════
// export default function SalonReviews({ salonId, avgRating, totalReviews }) {
//   const [reviews,  setReviews]  = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [page,     setPage]     = useState(1);
//   const [hasMore,  setHasMore]  = useState(false);
//   const LIMIT = 5;

//   useEffect(() => {
//     if (!salonId) return;
//     setLoading(true);
//     getSalonReviews(salonId, { page: 1, limit: LIMIT })
//       .then((res) => {
//         const data = res.data.data || [];
//         setReviews(data);
//         setHasMore(data.length === LIMIT);
//         setPage(1);
//       })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, [salonId]);

//   const loadMore = () => {
//     const next = page + 1;
//     getSalonReviews(salonId, { page: next, limit: LIMIT })
//       .then((res) => {
//         const data = res.data.data || [];
//         setReviews((prev) => [...prev, ...data]);
//         setHasMore(data.length === LIMIT);
//         setPage(next);
//       });
//   };

//   if (loading) {
//     return (
//       <div className="px-4 py-6">
//         <div className="h-4 bg-gray-100 rounded w-32 mb-4 animate-pulse" />
//         {[1,2].map((i) => (
//           <div key={i} className="border border-gray-100 rounded-2xl p-4 mb-3 animate-pulse">
//             <div className="flex gap-3 mb-3">
//               <div className="w-9 h-9 rounded-full bg-gray-100" />
//               <div className="flex-1 space-y-2">
//                 <div className="h-3 bg-gray-100 rounded w-24" />
//                 <div className="h-3 bg-gray-100 rounded w-16" />
//               </div>
//             </div>
//             <div className="space-y-1.5">
//               <div className="h-3 bg-gray-100 rounded w-full" />
//               <div className="h-3 bg-gray-100 rounded w-3/4" />
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 py-4">
//       <h2 className="section-title mb-4">
//         Customer Reviews
//         {totalReviews > 0 && (
//           <span className="text-sm font-normal text-gray-400 ml-2">({totalReviews})</span>
//         )}
//       </h2>

//       {/* Summary */}
//       {reviews.length > 0 && (
//         <RatingSummary reviews={reviews} avgRating={avgRating} total={totalReviews} />
//       )}

//       {/* Review cards */}
//       {reviews.length === 0 ? (
//         <div className="text-center py-10">
//           <div className="text-4xl mb-2">💬</div>
//           <p className="text-gray-500 font-medium">No reviews yet</p>
//           <p className="text-gray-400 text-sm mt-1">Be the first to review this salon</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {reviews.map((r) => (
//             <ReviewCard key={r._id} review={r} />
//           ))}

//           {hasMore && (
//             <button
//               onClick={loadMore}
//               className="w-full py-2.5 text-sm text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition font-medium"
//             >
//               Load more reviews
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }




import { useState, useEffect } from 'react';
import { getSalonReviews }     from '../../services/api';

function Stars({ score, size = 'sm' }) {
  const s = size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <span className={s}>
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={i <= score ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  );
}

function Avatar({ name, photoURL }) {
  const initials = (name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = [
    'bg-purple-100 text-purple-700','bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700','bg-pink-100 text-pink-700','bg-orange-100 text-orange-700',
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  if (photoURL) return <img src={photoURL} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />;
  return <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${color}`}>{initials}</div>;
}

function maskName(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// ── Photo lightbox ────────────────────────────────────────────────────────────
function PhotoLightbox({ photos, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center"
        onClick={onClose}
      >×</button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + photos.length) % photos.length); }}
            className="absolute left-4 text-white text-3xl w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
          >‹</button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % photos.length); }}
            className="absolute right-4 text-white text-3xl w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
          >›</button>
        </>
      )}

      <img
        src={photos[idx]?.url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
      />

      {photos.length > 1 && (
        <div className="absolute bottom-4 flex gap-1.5">
          {photos.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Rating summary bars ───────────────────────────────────────────────────────
function RatingSummary({ reviews, avgRating, total }) {
  const counts = [5,4,3,2,1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  return (
    <div className="flex gap-4 items-center mb-5 p-4 bg-gray-50 rounded-2xl">
      <div className="text-center flex-shrink-0">
        <div className="text-4xl font-bold text-gray-900">{avgRating?.toFixed(1) || '—'}</div>
        <Stars score={Math.round(avgRating || 0)} size="sm" />
        <div className="text-xs text-gray-400 mt-1">{total} review{total !== 1 ? 's' : ''}</div>
      </div>
      <div className="flex-1 space-y-1">
        {counts.map(({ star, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-3">{star}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const [expanded,   setExpanded]   = useState(false);
  const [lightbox,   setLightbox]   = useState(null); // index or null
  const comment  = review.comment || '';
  const long     = comment.length > 120;
  const hasPhotos = review.photos && review.photos.length > 0;

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">

      {/* Reviewer header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={review.user?.name} photoURL={review.user?.photoURL} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {maskName(review.user?.name || 'Customer')}
            </p>
            <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars score={review.rating} size="sm" />
            <span className="text-xs text-gray-500">{review.rating}/5</span>
          </div>
        </div>
      </div>

      {/* Comment */}
      {comment && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            {long && !expanded ? `${comment.slice(0, 120)}…` : comment}
          </p>
          {long && (
            <button onClick={() => setExpanded((v) => !v)} className="text-xs text-primary hover:underline mt-1">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* ── Photos grid (only if photos exist) ─────────────────────── */}
      {hasPhotos && (
        <div className="mb-3">
          <div className={`grid gap-1.5 ${review.photos.length === 1 ? 'grid-cols-1' : review.photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {review.photos.map((photo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(i)}
                className="relative overflow-hidden rounded-xl aspect-square group"
              >
                <img
                  src={photo.url}
                  alt={`review-photo-${i}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Show +N overlay on last photo if more than 3 (future-proof) */}
                {i === 2 && review.photos.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                    +{review.photos.length - 3}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            📷 {review.photos.length} photo{review.photos.length !== 1 ? 's' : ''} by customer
          </p>
        </div>
      )}

      {/* Verified badge */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-green-600 font-medium">✔ Verified Visit</span>
      </div>

      {/* Owner reply */}
      {review.ownerReply?.text && (
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">💬 Owner Reply</p>
          <p className="text-xs text-gray-700 leading-relaxed">{review.ownerReply.text}</p>
          {review.ownerReply.repliedAt && (
            <p className="text-xs text-gray-400 mt-1">{timeAgo(review.ownerReply.repliedAt)}</p>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <PhotoLightbox
          photos={review.photos}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export default function SalonReviews({ salonId, avgRating, totalReviews }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 5;

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    getSalonReviews(salonId, { page: 1, limit: LIMIT })
      .then((res) => {
        const data = res.data.data || [];
        setReviews(data);
        setHasMore(data.length === LIMIT);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [salonId]);

  const loadMore = () => {
    const next = page + 1;
    getSalonReviews(salonId, { page: next, limit: LIMIT })
      .then((res) => {
        const data = res.data.data || [];
        setReviews((prev) => [...prev, ...data]);
        setHasMore(data.length === LIMIT);
        setPage(next);
      });
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="h-4 bg-gray-100 rounded w-32 mb-4 animate-pulse" />
        {[1,2].map((i) => (
          <div key={i} className="border border-gray-100 rounded-2xl p-4 mb-3 animate-pulse">
            <div className="flex gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h2 className="section-title mb-4">
        Customer Reviews
        {totalReviews > 0 && <span className="text-sm font-normal text-gray-400 ml-2">({totalReviews})</span>}
      </h2>

      {reviews.length > 0 && (
        <RatingSummary reviews={reviews} avgRating={avgRating} total={totalReviews} />
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to review this salon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => <ReviewCard key={r._id} review={r} />)}
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-2.5 text-sm text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition font-medium"
            >
              Load more reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
}