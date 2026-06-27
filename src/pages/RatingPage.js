// import { useState } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { createReview } from '../services/api';
// import { formatPrice, formatDuration } from '../utils/helpers';

// const ASPECTS = [
//   { key: 'cleanliness', label: 'Cleanliness',    icon: '🧹' },
//   { key: 'service',     label: 'Service Quality', icon: '✂️' },
//   { key: 'value',       label: 'Value for Money', icon: '💰' },
//   { key: 'ambience',    label: 'Ambience',        icon: '✨' },
// ];

// const QUICK_TAGS = [
//   'Professional stylist', 'Clean environment', 'On time', 'Great value',
//   'Friendly staff', 'Exactly as expected', 'Will visit again',
//   'Exceeded expectations',
// ];

// const STAR_LABELS = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

// function StarPicker({ value, onChange, size = 'lg' }) {
//   const [hovered, setHovered] = useState(0);
//   const s = size === 'lg' ? 'text-5xl' : 'text-2xl';
//   const active = hovered || value;

//   return (
//     <div className="flex gap-1">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <button
//           key={star}
//           type="button"
//           onClick={() => onChange(star)}
//           onMouseEnter={() => setHovered(star)}
//           onMouseLeave={() => setHovered(0)}
//           className={`${s} transition-transform duration-100 ${active >= star ? 'scale-110' : 'scale-100'} focus:outline-none`}
//           style={{ filter: active >= star ? 'none' : 'grayscale(1) opacity(0.3)' }}
//         >
//           ★
//         </button>
//       ))}
//     </div>
//   );
// }

// export default function RatingPage() {
//   const { bookingId } = useParams();
//   const navigate      = useNavigate();
//   const { state }     = useLocation();

//   // Booking data passed from MyBookingsPage
//   const booking   = state?.booking;
//   const salonName = booking?.salon?.name || state?.salonName || 'Salon';

//   const [rating,       setRating]      = useState(0);
//   const [comment,      setComment]     = useState('');
//   const [selectedTags, setSelectedTags]= useState([]);
//   const [aspects,      setAspects]     = useState({});
//   const [loading,      setLoading]     = useState(false);
//   const [submitted,    setSubmitted]   = useState(false);
//   const [photos,       setPhotos]      = useState([]); // preview URLs
//   const [photoFiles,   setPhotoFiles]  = useState([]);

//   const toggleTag = (tag) =>
//     setSelectedTags((prev) =>
//       prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
//     );

//   const handlePhotoAdd = (e) => {
//     const files = Array.from(e.target.files).slice(0, 3 - photoFiles.length);
//     setPhotoFiles((prev) => [...prev, ...files]);
//     setPhotos((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
//   };

//   const handleSubmit = async () => {
//     if (rating === 0) { toast.error('Please select a rating.'); return; }
//     setLoading(true);
//     try {
//       const fullComment = [
//         selectedTags.length ? selectedTags.join(', ') : '',
//         comment.trim(),
//       ].filter(Boolean).join(' · ');

//       await createReview({
//         bookingId,
//         salonId: booking?.salon?._id || state?.salonId,
//         rating,
//         comment: fullComment,
//       });
//       setSubmitted(true);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Could not submit review.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Success screen ──────────────────────────────────────────────────────────
//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pb-20">
//         <div className="w-full max-w-sm text-center">
//           <div className="card p-8">
//             <div className="text-6xl mb-4 animate-bounce">🎉</div>
//             <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you for your review!</h2>
//             <p className="text-gray-500 text-sm mb-2">
//               Your {rating}-star rating for <strong>{salonName}</strong> has been published.
//             </p>
//             <div className="flex justify-center gap-0.5 mb-6">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <span key={i} className={`text-3xl ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
//               ))}
//             </div>
//             <p className="text-xs text-gray-400 mb-6">
//               Reviews help other customers choose the right salon. Your feedback matters!
//             </p>
//             <div className="flex gap-2">
//               <button onClick={() => navigate('/')} className="btn-outline flex-1 py-2.5 text-sm">
//                 Browse Salons
//               </button>
//               <button onClick={() => navigate('/my-bookings')} className="btn-primary flex-1 py-2.5 text-sm">
//                 My Bookings
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-28">
//       <div className="max-w-lg mx-auto px-4 py-6">

//         {/* Header */}
//         <button onClick={() => navigate(-1)} className="text-primary text-sm mb-4 hover:underline flex items-center gap-1">
//           ← Back
//         </button>

//         {/* Salon info */}
//         <div className="card p-4 mb-5 flex items-center gap-3">
//           <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
//             {booking?.salon?.coverImage?.url
//               ? <img src={booking.salon.coverImage.url} alt={salonName} className="w-14 h-14 rounded-xl object-cover" />
//               : '✂️'}
//           </div>
//           <div>
//             <p className="font-bold text-gray-900">{salonName}</p>
//             <p className="text-xs text-gray-400 mt-0.5">
//               {(booking?.services || []).map((s) => s.name).join(' · ')}
//             </p>
//             {booking?.totalAmount > 0 && (
//               <p className="text-xs text-primary font-medium mt-0.5">
//                 Paid {formatPrice(booking.totalAmount)}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* ── Overall star rating ─────────────────────────────────────── */}
//         <div className="card p-5 mb-4 text-center">
//           <h2 className="text-base font-bold text-gray-900 mb-1">How was your experience?</h2>
//           <p className="text-sm text-gray-400 mb-5">Tap a star to rate</p>

//           <div className="flex justify-center mb-2">
//             <StarPicker value={rating} onChange={setRating} size="lg" />
//           </div>

//           {rating > 0 && (
//             <p className={`text-base font-bold mt-2 transition-all ${
//               rating >= 4 ? 'text-green-600' : rating === 3 ? 'text-yellow-600' : 'text-red-500'
//             }`}>
//               {STAR_LABELS[rating]}
//             </p>
//           )}
//         </div>

//         {/* ── Aspect ratings (like Zomato/Flipkart sub-ratings) ──────── */}
//         {rating > 0 && (
//           <div className="card p-5 mb-4">
//             <h3 className="text-sm font-bold text-gray-800 mb-4">Rate specific aspects</h3>
//             <div className="space-y-4">
//               {ASPECTS.map(({ key, label, icon }) => (
//                 <div key={key} className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">{icon}</span>
//                     <span className="text-sm text-gray-700">{label}</span>
//                   </div>
//                   <div className="flex gap-0.5">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <button
//                         key={star}
//                         type="button"
//                         onClick={() => setAspects((a) => ({ ...a, [key]: star }))}
//                         className={`text-xl transition-all ${
//                           (aspects[key] || 0) >= star ? 'text-yellow-400' : 'text-gray-200'
//                         }`}
//                       >
//                         ★
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ── Quick tags (like Flipkart's tag pills) ─────────────────── */}
//         {rating > 0 && (
//           <div className="card p-5 mb-4">
//             <h3 className="text-sm font-bold text-gray-800 mb-3">What did you like?</h3>
//             <div className="flex flex-wrap gap-2">
//               {QUICK_TAGS.map((tag) => {
//                 const selected = selectedTags.includes(tag);
//                 return (
//                   <button
//                     key={tag}
//                     type="button"
//                     onClick={() => toggleTag(tag)}
//                     className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
//                       selected
//                         ? 'bg-primary text-white border-primary'
//                         : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
//                     }`}
//                   >
//                     {selected ? '✓ ' : ''}{tag}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ── Written review ──────────────────────────────────────────── */}
//         {rating > 0 && (
//           <div className="card p-5 mb-4">
//             <h3 className="text-sm font-bold text-gray-800 mb-2">Write a review <span className="text-gray-400 font-normal">(optional)</span></h3>
//             <textarea
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               rows={4}
//               maxLength={500}
//               placeholder="Share details about your experience — the haircut, the stylist, the ambience…"
//               className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition"
//             />
//             <div className="flex justify-between text-xs text-gray-300 mt-1">
//               <span>Min 10 characters for a helpful review</span>
//               <span>{comment.length}/500</span>
//             </div>

//             {/* Photo upload */}
//             <div className="mt-3">
//               <p className="text-xs font-medium text-gray-600 mb-2">Add photos <span className="text-gray-400 font-normal">(up to 3)</span></p>
//               <div className="flex gap-2 flex-wrap">
//                 {photos.map((src, i) => (
//                   <div key={i} className="relative">
//                     <img src={src} alt="review" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setPhotos((p) => p.filter((_, idx) => idx !== i));
//                         setPhotoFiles((p) => p.filter((_, idx) => idx !== i));
//                       }}
//                       className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow"
//                     >×</button>
//                   </div>
//                 ))}
//                 {photos.length < 3 && (
//                   <label className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition">
//                     <span className="text-xl text-gray-300">📷</span>
//                     <input type="file" accept="image/*" multiple onChange={handlePhotoAdd} className="hidden" />
//                   </label>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Fixed submit bar ────────────────────────────────────────── */}
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40">
//           <div className="max-w-lg mx-auto flex items-center gap-3">
//             <div className="flex gap-0.5">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
//               ))}
//             </div>
//             <button
//               onClick={handleSubmit}
//               disabled={rating === 0 || loading}
//               className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Submitting…
//                 </span>
//               ) : rating === 0 ? 'Select a rating first'
//                 : `Submit ${rating}-Star Review`}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/helpers';
 // Add this import instead (if not already there):
import { createReview } from '../services/api';

const ASPECTS = [
  { key: 'cleanliness', label: 'Cleanliness',    icon: '🧹' },
  { key: 'service',     label: 'Service Quality', icon: '✂️' },
  { key: 'value',       label: 'Value for Money', icon: '💰' },
  { key: 'ambience',    label: 'Ambience',        icon: '✨' },
];

const QUICK_TAGS = [
  'Professional stylist', 'Clean environment', 'On time', 'Great value',
  'Friendly staff', 'Exactly as expected', 'Will visit again',
  'Exceeded expectations',
];

const STAR_LABELS = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

function StarPicker({ value, onChange, size = 'lg' }) {
  const [hovered, setHovered] = useState(0);
  const s = size === 'lg' ? 'text-5xl' : 'text-2xl';
  const active = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`${s} transition-transform duration-100 ${active >= star ? 'scale-110' : 'scale-100'} focus:outline-none`}
          style={{ filter: active >= star ? 'none' : 'grayscale(1) opacity(0.3)' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function RatingPage() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const { state }     = useLocation();

  const booking   = state?.booking;
  const salonName = booking?.salon?.name || state?.salonName || 'Salon';

  const [rating,       setRating]      = useState(0);
  const [comment,      setComment]     = useState('');
  const [selectedTags, setSelectedTags]= useState([]);
  const [aspects,      setAspects]     = useState({});
  const [loading,      setLoading]     = useState(false);
  const [submitted,    setSubmitted]   = useState(false);
  const [photos,       setPhotos]      = useState([]);   // preview URLs
  const [photoFiles,   setPhotoFiles]  = useState([]);   // File objects

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - photoFiles.length);
    setPhotoFiles((prev) => [...prev, ...files]);
    setPhotos((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = ''; // reset input so same file can be re-added
  };

  const removePhoto = (i) => {
    URL.revokeObjectURL(photos[i]);
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPhotoFiles((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating.'); return; }
    setLoading(true);
    try {
      const fullComment = [
        selectedTags.length ? selectedTags.join(', ') : '',
        comment.trim(),
      ].filter(Boolean).join(' · ');

      // ── Build FormData so photos go as multipart ──────────────────────
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('salonId',   booking?.salon?._id || state?.salonId);
      formData.append('rating',    rating);
      formData.append('comment',   fullComment);
      photoFiles.forEach((file) => formData.append('photos', file));

      // Add before await createReview(formData):
console.log('Submitting review with:');
console.log('bookingId:', bookingId);
console.log('salonId:', booking?.salon?._id || state?.salonId);
console.log('rating:', rating);
console.log('photos:', photoFiles.length);

      await createReview(formData);

      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit review.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm text-center">
          <div className="card p-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you for your review!</h2>
            <p className="text-gray-500 text-sm mb-2">
              Your {rating}-star rating for <strong>{salonName}</strong> has been published.
            </p>
            <div className="flex justify-center gap-0.5 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-3xl ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Reviews help other customers choose the right salon. Your feedback matters!
            </p>
            <div className="flex gap-2">
              <button onClick={() => navigate('/')} className="btn-outline flex-1 py-2.5 text-sm">
                Browse Salons
              </button>
              <button onClick={() => navigate('/my-bookings')} className="btn-primary flex-1 py-2.5 text-sm">
                My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <button onClick={() => navigate(-1)} className="text-primary text-sm mb-4 hover:underline flex items-center gap-1">
          ← Back
        </button>

        {/* Salon info */}
        <div className="card p-4 mb-5 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
            {booking?.salon?.coverImage?.url
              ? <img src={booking.salon.coverImage.url} alt={salonName} className="w-14 h-14 rounded-xl object-cover" />
              : '✂️'}
          </div>
          <div>
            <p className="font-bold text-gray-900">{salonName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {(booking?.services || []).map((s) => s.name).join(' · ')}
            </p>
            {booking?.totalAmount > 0 && (
              <p className="text-xs text-primary font-medium mt-0.5">
                Paid {formatPrice(booking.totalAmount)}
              </p>
            )}
          </div>
        </div>

        {/* ── Overall star rating ─────────────────────────────────────── */}
        <div className="card p-5 mb-4 text-center">
          <h2 className="text-base font-bold text-gray-900 mb-1">How was your experience?</h2>
          <p className="text-sm text-gray-400 mb-5">Tap a star to rate</p>
          <div className="flex justify-center mb-2">
            <StarPicker value={rating} onChange={setRating} size="lg" />
          </div>
          {rating > 0 && (
            <p className={`text-base font-bold mt-2 transition-all ${
              rating >= 4 ? 'text-green-600' : rating === 3 ? 'text-yellow-600' : 'text-red-500'
            }`}>
              {STAR_LABELS[rating]}
            </p>
          )}
        </div>

        {/* ── Aspect ratings ──────────────────────────────────────────── */}
        {rating > 0 && (
          <div className="card p-5 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Rate specific aspects</h3>
            <div className="space-y-4">
              {ASPECTS.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAspects((a) => ({ ...a, [key]: star }))}
                        className={`text-xl transition-all ${
                          (aspects[key] || 0) >= star ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick tags ──────────────────────────────────────────────── */}
        {rating > 0 && (
          <div className="card p-5 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">What did you like?</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => {
                const sel = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      sel
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    {sel ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Written review + photos ─────────────────────────────────── */}
        {rating > 0 && (
          <div className="card p-5 mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              Write a review <span className="text-gray-400 font-normal">(optional)</span>
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Share details about your experience — the haircut, the stylist, the ambience…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1 mb-4">
              <span>Min 10 characters for a helpful review</span>
              <span>{comment.length}/500</span>
            </div>

            {/* ── Photo upload ───────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Add photos
                <span className="text-gray-400 font-normal ml-1">(optional · up to 3)</span>
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Photos help other customers see the real results
              </p>

              <div className="flex gap-2 flex-wrap">
                {/* Preview thumbnails */}
                {photos.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`review-photo-${i}`}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add photo button */}
                {photos.length < 3 && (
                  <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition group">
                    <span className="text-2xl text-gray-300 group-hover:text-primary/50 transition">📷</span>
                    <span className="text-xs text-gray-300 mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoAdd}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {photos.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {photos.length}/3 photo{photos.length !== 1 ? 's' : ''} added
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Fixed submit bar ────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {photoFiles.length > 0 ? 'Uploading photos…' : 'Submitting…'}
                </span>
              ) : rating === 0 ? 'Select a rating first'
                : `Submit ${rating}-Star Review`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}