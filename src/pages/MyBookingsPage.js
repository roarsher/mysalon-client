 

// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast }       from 'react-toastify';
// import { getMyBookings, cancelBooking, initiateRefund } from '../services/api';
// import { formatPrice, timeAgo } from '../utils/helpers';
// import Spinner from '../components/common/Spinner';

// // ── Tabs — each maps to exact bookingStatus values sent to backend ────────────
// const TABS = [
//   { label: 'All',       value: '',                                   statuses: null },
//   { label: 'Active',    value: 'active',                             statuses: ['pending','confirmed','in_progress'] },
//   { label: 'Pending',   value: 'pending',                            statuses: ['pending'] },
//   { label: 'Completed', value: 'completed',                          statuses: ['completed'] },
//   { label: 'Cancelled', value: 'cancelled',                          statuses: ['cancelled','no_show'] },
// ];

// // ── Safe status helpers ───────────────────────────────────────────────────────
// const getStatus = (b) => b?.bookingStatus || b?.status || 'unknown';

// const STATUS_CONFIG = {
//   pending:     { label: 'Pending',     dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
//   confirmed:   { label: 'Confirmed',   dot: 'bg-blue-400',   badge: 'bg-blue-100   text-blue-700',   icon: '✅' },
//   in_progress: { label: 'In Progress', dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', icon: '✂️' },
//   completed:   { label: 'Completed',   dot: 'bg-green-500',  badge: 'bg-green-100  text-green-700',  icon: '🎉' },
//   cancelled:   { label: 'Cancelled',   dot: 'bg-gray-300',   badge: 'bg-gray-100   text-gray-500',   icon: '❌' },
//   no_show:     { label: 'No Show',     dot: 'bg-red-400',    badge: 'bg-red-100    text-red-500',     icon: '🚫' },
//   unknown:     { label: 'Unknown',     dot: 'bg-gray-200',   badge: 'bg-gray-100   text-gray-400',   icon: '❓' },
// };

// const getStatusConfig = (b) => STATUS_CONFIG[getStatus(b)] || STATUS_CONFIG.unknown;

// const getPaymentBadge = (b) => {
//   if (b?.paymentMethod === 'cod') {
//     return b?.paymentStatus === 'collected'
//       ? { label: '💵 Cash Collected', cls: 'text-green-600'  }
//       : { label: '💵 Pay at Salon',   cls: 'text-yellow-600' };
//   }
//   const m = {
//     paid:               { label: '✅ Paid',           cls: 'text-green-600'  },
//     refunded:           { label: '↩ Refunded',        cls: 'text-blue-600'   },
//     partially_refunded: { label: '↩ Partial Refund',  cls: 'text-blue-500'   },
//     failed:             { label: '❌ Payment Failed',  cls: 'text-red-500'    },
//     pending:            { label: '⏳ Unpaid',          cls: 'text-yellow-600' },
//   };
//   return m[b?.paymentStatus] || m.pending;
// };

// const isActiveBooking = (b) =>
//   ['pending','confirmed','in_progress'].includes(getStatus(b));

// // ── Pricing breakdown sub-component ──────────────────────────────────────────
// function PricingBreakdown({ pricing }) {
//   if (!pricing?.subtotal) return null;
//   const rows = [
//     { label: 'Services',              amount: pricing.subtotal,       minus: false },
//     { label: `GST (${pricing.gstPercent || 18}%)`, amount: pricing.gstAmount, minus: false },
//     pricing.platformFee > 0
//       ? { label: 'Platform fee', amount: pricing.platformFee, minus: false }
//       : { label: 'Platform fee 🎁', amount: 0, note: 'Waived', minus: false },
//     pricing.discountAmount > 0
//       ? { label: pricing.discountLabel || '🎁 Discount', amount: pricing.discountAmount, minus: true }
//       : null,
//     { label: 'Total', amount: pricing.totalAmount, minus: false, bold: true },
//   ].filter(Boolean);

//   return (
//     <div className="bg-gray-50 rounded-xl p-3 mt-2 text-xs space-y-1.5 border border-gray-100">
//       {rows.map((r, i) => (
//         <div key={i} className={`flex justify-between ${r.bold ? 'font-semibold text-gray-900 pt-1.5 border-t border-gray-200 mt-1.5' : 'text-gray-500'}`}>
//           <span>{r.label}</span>
//           <span className={r.minus ? 'text-green-600 font-semibold' : ''}>
//             {r.note
//               ? <span className="text-gray-400 italic">{r.note}</span>
//               : r.minus
//                 ? `− ${formatPrice(r.amount)}`
//                 : formatPrice(r.amount)
//             }
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ── Booking card ──────────────────────────────────────────────────────────────
// function BookingCard({ b, onCancel, cancelling, onRefetch }) {
//   const navigate   = useNavigate();
//   const [expanded, setExpanded] = useState(false);
//   const cfg        = getStatusConfig(b);
//   const pay        = getPaymentBadge(b);
//   const active     = isActiveBooking(b);
//   const status     = getStatus(b);

//   return (
//     <div className={`card overflow-hidden transition-shadow hover:shadow-md ${active ? 'border-l-4 border-l-primary' : ''}`}>
//       <div className="p-4">

//         {/* ── Row 1: salon name + status badge ─────────────────────────── */}
//         <div className="flex items-start justify-between gap-2 mb-2">
//           <div className="flex-1 min-w-0">
//             <h3 className="font-semibold text-gray-900 text-sm truncate">
//               {b.salon?.name || 'Salon'}
//             </h3>
//             <p className="text-xs text-gray-400 mt-0.5">
//               {b.salon?.address?.city && `${b.salon.address.city} · `}
//               {timeAgo(b.createdAt)}
//             </p>
//           </div>
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
//             <span className={`badge text-xs ${cfg.badge}`}>
//               {cfg.icon} {cfg.label}
//             </span>
//           </div>
//         </div>

//         {/* ── Row 2: services ──────────────────────────────────────────── */}
//         <p className="text-xs text-gray-500 mb-2 leading-relaxed">
//           {(b.services || []).map((s) => s?.name).filter(Boolean).join(' · ') || '—'}
//         </p>

//         {/* ── Row 3: token + amount + payment ──────────────────────────── */}
//         <div className="flex flex-wrap items-center gap-2 mb-3">
//           <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
//             #{b.tokenNumber || '—'}
//           </span>
//           <span className="font-bold text-gray-900 text-sm">
//             {formatPrice(b.totalAmount || 0)}
//           </span>
//           <span className={`text-xs font-medium ${pay.cls}`}>{pay.label}</span>
//           <span className="text-xs text-gray-400">
//             {b.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
//           </span>
//         </div>

//         {/* ── Pricing breakdown toggle ──────────────────────────────────── */}
//         {b.pricing?.subtotal > 0 && (
//           <>
//             <button
//               onClick={() => setExpanded((v) => !v)}
//               className="text-xs text-primary hover:underline flex items-center gap-1 mb-1"
//             >
//               <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
//               {expanded ? 'Hide' : 'Show'} price breakdown
//             </button>
//             {expanded && <PricingBreakdown pricing={b.pricing} />}
//           </>
//         )}

//         {/* ── Actions ──────────────────────────────────────────────────── */}
//         <div className="flex flex-wrap gap-2 mt-3">
//           {/* View queue */}
//           {active && (
//             <button
//               onClick={() => navigate(`/queue/${b._id}`, { state: { salonName: b.salon?.name } })}
//               className="btn-secondary text-xs py-1.5 px-3"
//             >
//               📍 View Queue
//             </button>
//           )}

//           {/* Retry payment if online + unpaid */}
//           {b.paymentMethod === 'online' &&
//            ['pending','failed'].includes(b.paymentStatus) &&
//            status === 'pending' && (
//             <button
//               onClick={() => navigate(`/booking/${b.salon?._id}`, { state: { retryBookingId: b._id, salonName: b.salon?.name } })}
//               className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition"
//             >
//               💳 Retry Payment
//             </button>
//           )}

//           {/* Cancel */}
//           {active && (
//             <button
//               onClick={() => onCancel(b)}
//               disabled={cancelling === b._id}
//               className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
//             >
//               {cancelling === b._id
//                 ? <span className="flex items-center gap-1"><span className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin"/>Cancelling…</span>
//                 : '✕ Cancel'}
//             </button>
//           )}

//           {/* Rate */}
           
//           {status === 'completed' && !b.rating?.score && (
//   <button
//     onClick={() => navigate(`/booking/${b._id}/rate`, {
//       state: { booking: b, salonName: b.salon?.name }
//     })}
//     className="btn-outline text-xs py-1.5 px-3"
//   >
//     ⭐ Rate
//   </button>
// )}

//           {/* View salon */}
//           {b.salon?._id && (
//             <button
//               onClick={() => navigate(`/salon/${b.salon._id}`)}
//               className="text-xs text-gray-400 hover:text-primary transition ml-auto"
//             >
//               View salon →
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN PAGE
// // ══════════════════════════════════════════════════════════════════════════════
// export default function MyBookingsPage() {
//   const [bookings,   setBookings]   = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [tab,        setTab]        = useState(TABS[0]);
//   const [cancelling, setCancelling] = useState(null);
//   const [counts,     setCounts]     = useState({}); // per-tab count

//   // ── Fetch with correct status filter ─────────────────────────────────────
//   const fetchBookings = useCallback(async (selectedTab) => {
//     setLoading(true);
//     try {
//       // Backend: if statuses = ['pending','confirmed','in_progress'] we call multiple
//       // or pass a comma-separated list. Simplest: fetch all then filter client-side
//       // for multi-status tabs, single status for single-status tabs.
//       let res;
//       if (!selectedTab.statuses || selectedTab.statuses.length === 0) {
//         // All tab — no filter
//         res = await getMyBookings({ limit: 50 });
//       } else if (selectedTab.statuses.length === 1) {
//         // Single status — pass directly to backend
//         res = await getMyBookings({ status: selectedTab.statuses[0], limit: 50 });
//       } else {
//         // Multiple statuses (Active tab) — fetch all and filter client-side
//         res = await getMyBookings({ limit: 50 });
//       }

//       let data = res.data.data || [];

//       // Client-side filter for multi-status tabs
//       if (selectedTab.statuses && selectedTab.statuses.length > 1) {
//         data = data.filter((b) => selectedTab.statuses.includes(getStatus(b)));
//       }

//       setBookings(data);

//       // Calculate counts for each tab from the full list
//       if (!selectedTab.statuses || selectedTab.statuses.length === 0) {
//         const c = {};
//         TABS.forEach((t) => {
//           if (!t.statuses) { c[t.value] = data.length; return; }
//           c[t.value] = data.filter((b) => t.statuses.includes(getStatus(b))).length;
//         });
//         setCounts(c);
//       }
//     } catch { toast.error('Could not load bookings.'); }
//     finally   { setLoading(false); }
//   }, []);

//   useEffect(() => { fetchBookings(tab); }, [tab, fetchBookings]);

//   // ── Cancel handler ────────────────────────────────────────────────────────
//   const handleCancel = async (b) => {
//     if (!window.confirm('Cancel this booking? A refund will be initiated if applicable.')) return;
//     setCancelling(b._id);
//     try {
//       if (b.paymentMethod === 'online' && b.paymentStatus === 'paid') {
//         try {
//           await initiateRefund({ bookingId: b._id, reason: 'Customer cancelled' });
//           toast.info('Refund initiated — reflects in 5–7 business days.');
//         } catch { toast.warning('Refund could not be auto-initiated. Contact support.'); }
//       }
//       await cancelBooking(b._id, { reason: 'Customer cancelled' });
//       toast.success('Booking cancelled.');
//       fetchBookings(tab);
//     } catch (err) {
//       toast.error(err.message || 'Could not cancel.');
//     } finally { setCancelling(null); }
//   };

//   // ── Empty state messages ──────────────────────────────────────────────────
//   const emptyMessages = {
//     '':          { icon: '📋', text: 'No bookings yet', sub: 'Book a salon to see your history here' },
//     active:      { icon: '⏳', text: 'No active bookings', sub: 'Your current queue bookings appear here' },
//     pending:     { icon: '💳', text: 'No pending bookings', sub: 'Bookings awaiting payment appear here' },
//     completed:   { icon: '🎉', text: 'No completed bookings yet', sub: 'Completed services will appear here' },
//     cancelled:   { icon: '❌', text: 'No cancelled bookings', sub: 'Cancelled bookings appear here' },
//   };
//   const empty = emptyMessages[tab.value] || emptyMessages[''];

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-5">
//         <div>
//           <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
//           <p className="text-xs text-gray-400 mt-0.5">
//             {bookings.length} booking{bookings.length !== 1 ? 's' : ''} shown
//           </p>
//         </div>
//         <button onClick={() => fetchBookings(tab)}
//           className="text-primary text-sm hover:underline flex items-center gap-1">
//           ↻ Refresh
//         </button>
//       </div>

//       {/* ── Tabs ─────────────────────────────────────────────────────────── */}
//       <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-5">
//         {TABS.map((t) => {
//           const count = counts[t.value];
//           const isSelected = tab.value === t.value;
//           return (
//             <button
//               key={t.value}
//               onClick={() => setTab(t)}
//               className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition flex-shrink-0 ${
//                 isSelected
//                   ? 'bg-primary text-white border-primary shadow-sm'
//                   : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40 hover:text-primary'
//               }`}
//             >
//               {t.label}
//               {/* Count badge */}
//               {count > 0 && (
//                 <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
//                   isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
//                 }`}>
//                   {count}
//                 </span>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Content ──────────────────────────────────────────────────────── */}
//       {loading ? (
//         <Spinner />
//       ) : bookings.length === 0 ? (
//         <div className="text-center py-20">
//           <div className="text-6xl mb-4">{empty.icon}</div>
//           <p className="text-gray-600 font-semibold text-lg">{empty.text}</p>
//           <p className="text-gray-400 text-sm mt-1 mb-6">{empty.sub}</p>
//           {tab.value === '' && (
//             <button onClick={() => window.location.href = '/'} className="btn-primary px-6 py-2.5">
//               Browse Salons
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {bookings.map((b) => (
//             <BookingCard
//               key={b._id}
//               b={b}
//               onCancel={handleCancel}
//               cancelling={cancelling}
//               onRefetch={() => fetchBookings(tab)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast }       from 'react-toastify';
import { getMyBookings, cancelBooking, initiateRefund } from '../services/api';
import { formatPrice, timeAgo } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

// ── Tabs — each maps to exact bookingStatus values sent to backend ────────────
const TABS = [
  { label: 'All',       value: '',                                   statuses: null },
  { label: 'Active',    value: 'active',                             statuses: ['pending','confirmed','in_progress'] },
  { label: 'Pending',   value: 'pending',                            statuses: ['pending'] },
  { label: 'Completed', value: 'completed',                          statuses: ['completed'] },
  { label: 'Cancelled', value: 'cancelled',                          statuses: ['cancelled','no_show'] },
];

// ── Safe status helpers ───────────────────────────────────────────────────────
const getStatus = (b) => b?.bookingStatus || b?.status || 'unknown';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  confirmed:   { label: 'Confirmed',   dot: 'bg-blue-400',   badge: 'bg-blue-100   text-blue-700',   icon: '✅' },
  in_progress: { label: 'In Progress', dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', icon: '✂️' },
  completed:   { label: 'Completed',   dot: 'bg-green-500',  badge: 'bg-green-100  text-green-700',  icon: '🎉' },
  cancelled:   { label: 'Cancelled',   dot: 'bg-gray-300',   badge: 'bg-gray-100   text-gray-500',   icon: '❌' },
  no_show:     { label: 'No Show',     dot: 'bg-red-400',    badge: 'bg-red-100    text-red-500',     icon: '🚫' },
  unknown:     { label: 'Unknown',     dot: 'bg-gray-200',   badge: 'bg-gray-100   text-gray-400',   icon: '❓' },
};

const getStatusConfig = (b) => STATUS_CONFIG[getStatus(b)] || STATUS_CONFIG.unknown;

const getPaymentBadge = (b) => {
  if (b?.paymentMethod === 'cod') {
    return b?.paymentStatus === 'collected'
      ? { label: '💵 Cash Collected', cls: 'text-green-600'  }
      : { label: '💵 Pay at Salon',   cls: 'text-yellow-600' };
  }
  const m = {
    paid:               { label: '✅ Paid',           cls: 'text-green-600'  },
    refunded:           { label: '↩ Refunded',        cls: 'text-blue-600'   },
    partially_refunded: { label: '↩ Partial Refund',  cls: 'text-blue-500'   },
    failed:             { label: '❌ Payment Failed',  cls: 'text-red-500'    },
    pending:            { label: '⏳ Unpaid',          cls: 'text-yellow-600' },
  };
  return m[b?.paymentStatus] || m.pending;
};

const isActiveBooking = (b) =>
  ['pending','confirmed','in_progress'].includes(getStatus(b));

// ── Pricing breakdown sub-component ──────────────────────────────────────────
function PricingBreakdown({ pricing }) {
  if (!pricing?.subtotal) return null;
  const rows = [
    { label: 'Services',              amount: pricing.subtotal,       minus: false },
    { label: `GST (${pricing.gstPercent || 18}%)`, amount: pricing.gstAmount, minus: false },
    pricing.platformFee > 0
      ? { label: 'Platform fee', amount: pricing.platformFee, minus: false }
      : { label: 'Platform fee 🎁', amount: 0, note: 'Waived', minus: false },
    pricing.discountAmount > 0
      ? { label: pricing.discountLabel || '🎁 Discount', amount: pricing.discountAmount, minus: true }
      : null,
    { label: 'Total', amount: pricing.totalAmount, minus: false, bold: true },
  ].filter(Boolean);

  return (
    <div className="bg-gray-50 rounded-xl p-3 mt-2 text-xs space-y-1.5 border border-gray-100">
      {rows.map((r, i) => (
        <div key={i} className={`flex justify-between ${r.bold ? 'font-semibold text-gray-900 pt-1.5 border-t border-gray-200 mt-1.5' : 'text-gray-500'}`}>
          <span>{r.label}</span>
          <span className={r.minus ? 'text-green-600 font-semibold' : ''}>
            {r.note
              ? <span className="text-gray-400 italic">{r.note}</span>
              : r.minus
                ? `− ${formatPrice(r.amount)}`
                : formatPrice(r.amount)
            }
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Booking card ──────────────────────────────────────────────────────────────
function BookingCard({ b, onCancel, cancelling, onRefetch }) {
  const navigate   = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const cfg        = getStatusConfig(b);
  const pay        = getPaymentBadge(b);
  const active     = isActiveBooking(b);
  const status     = getStatus(b);

  return (
    <div className={`card overflow-hidden transition-shadow hover:shadow-md ${active ? 'border-l-4 border-l-primary' : ''}`}>
      <div className="p-4">

        {/* ── Row 1: salon name + status badge ─────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {b.salon?.name || 'Salon'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {b.salon?.address?.city && `${b.salon.address.city} · `}
              {timeAgo(b.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <span className={`badge text-xs ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
        </div>

        {/* ── Row 2: services ──────────────────────────────────────────── */}
        <p className="text-xs text-gray-500 mb-2 leading-relaxed">
          {(b.services || []).map((s) => s?.name).filter(Boolean).join(' · ') || '—'}
        </p>

        {/* ── Row 3: token + amount + payment ──────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
            #{b.tokenNumber || '—'}
          </span>
          <span className="font-bold text-gray-900 text-sm">
            {formatPrice(b.totalAmount || 0)}
          </span>
          <span className={`text-xs font-medium ${pay.cls}`}>{pay.label}</span>
          <span className="text-xs text-gray-400">
            {b.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
          </span>
        </div>

        {/* ── Pricing breakdown toggle ──────────────────────────────────── */}
        {b.pricing?.subtotal > 0 && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-primary hover:underline flex items-center gap-1 mb-1"
            >
              <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
              {expanded ? 'Hide' : 'Show'} price breakdown
            </button>
            {expanded && <PricingBreakdown pricing={b.pricing} />}
          </>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mt-3">
          {/* View queue */}
          {active && (
            <button
              onClick={() => navigate(`/queue/${b._id}`, { state: { salonName: b.salon?.name } })}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              📍 View Queue
            </button>
          )}

          {/* Retry payment if online + unpaid */}
          {b.paymentMethod === 'online' &&
           ['pending','failed'].includes(b.paymentStatus) &&
           status === 'pending' && (
            <button
              onClick={() => navigate(`/booking/${b.salon?._id}`, { state: { retryBookingId: b._id, salonName: b.salon?.name } })}
              className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition"
            >
              💳 Retry Payment
            </button>
          )}

          {/* Cancel */}
          {active && (
            <button
              onClick={() => onCancel(b)}
              disabled={cancelling === b._id}
              className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
            >
              {cancelling === b._id
                ? <span className="flex items-center gap-1"><span className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin"/>Cancelling…</span>
                : '✕ Cancel'}
            </button>
          )}

          {/* Rate */}
          {status === 'completed' && !b.rating?.score && (
            <button
              onClick={() => navigate(`/rate/${b._id}`, {
                state: { booking: b, salonName: b.salon?.name, salonId: b.salon?._id }
              })}
              className="btn-primary text-xs py-1.5 px-3 active:scale-95"
            >
              ⭐ Rate Now
            </button>
          )}
          {status === 'completed' && b.rating?.score && (
            <div className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
              {'★'.repeat(b.rating.score)}{'☆'.repeat(5 - b.rating.score)}
              <span className="text-gray-400 ml-1">Rated</span>
            </div>
          )}

          {/* View salon */}
          {b.salon?._id && (
            <button
              onClick={() => navigate(`/salon/${b.salon._id}`)}
              className="text-xs text-gray-400 hover:text-primary transition ml-auto"
            >
              View salon →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function MyBookingsPage() {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState(TABS[0]);
  const [cancelling, setCancelling] = useState(null);
  const [counts,     setCounts]     = useState({}); // per-tab count

  // ── Fetch with correct status filter ─────────────────────────────────────
  const fetchBookings = useCallback(async (selectedTab) => {
    setLoading(true);
    try {
      let res;
      if (!selectedTab.statuses || selectedTab.statuses.length === 0) {
        res = await getMyBookings({ limit: 50 });
      } else if (selectedTab.statuses.length === 1) {
        res = await getMyBookings({ status: selectedTab.statuses[0], limit: 50 });
      } else {
        res = await getMyBookings({ limit: 50 });
      }

      let data = res.data.data || [];

      if (selectedTab.statuses && selectedTab.statuses.length > 1) {
        data = data.filter((b) => selectedTab.statuses.includes(getStatus(b)));
      }

      setBookings(data);

      if (!selectedTab.statuses || selectedTab.statuses.length === 0) {
        const c = {};
        TABS.forEach((t) => {
          if (!t.statuses) { c[t.value] = data.length; return; }
          c[t.value] = data.filter((b) => t.statuses.includes(getStatus(b))).length;
        });
        setCounts(c);
      }
    } catch { toast.error('Could not load bookings.'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(tab); }, [tab, fetchBookings]);

  // ── Cancel handler ────────────────────────────────────────────────────────
  const handleCancel = async (b) => {
    if (!window.confirm('Cancel this booking? A refund will be initiated if applicable.')) return;
    setCancelling(b._id);
    try {
      if (b.paymentMethod === 'online' && b.paymentStatus === 'paid') {
        try {
          await initiateRefund({ bookingId: b._id, reason: 'Customer cancelled' });
          toast.info('Refund initiated — reflects in 5–7 business days.');
        } catch { toast.warning('Refund could not be auto-initiated. Contact support.'); }
      }
      await cancelBooking(b._id, { reason: 'Customer cancelled' });
      toast.success('Booking cancelled.');
      fetchBookings(tab);
    } catch (err) {
      toast.error(err.message || 'Could not cancel.');
    } finally { setCancelling(null); }
  };

  // ── Empty state messages ──────────────────────────────────────────────────
  const emptyMessages = {
    '':          { icon: '📋', text: 'No bookings yet', sub: 'Book a salon to see your history here' },
    active:      { icon: '⏳', text: 'No active bookings', sub: 'Your current queue bookings appear here' },
    pending:     { icon: '💳', text: 'No pending bookings', sub: 'Bookings awaiting payment appear here' },
    completed:   { icon: '🎉', text: 'No completed bookings yet', sub: 'Completed services will appear here' },
    cancelled:   { icon: '❌', text: 'No cancelled bookings', sub: 'Cancelled bookings appear here' },
  };
  const empty = emptyMessages[tab.value] || emptyMessages[''];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <button onClick={() => fetchBookings(tab)}
          className="text-primary text-sm hover:underline flex items-center gap-1">
          ↻ Refresh
        </button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-5">
        {TABS.map((t) => {
          const count = counts[t.value];
          const isSelected = tab.value === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition flex-shrink-0 ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">{empty.icon}</div>
          <p className="text-gray-600 font-semibold text-lg">{empty.text}</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">{empty.sub}</p>
          {tab.value === '' && (
            <button onClick={() => window.location.href = '/'} className="btn-primary px-6 py-2.5">
              Browse Salons
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard
              key={b._id}
              b={b}
              onCancel={handleCancel}
              cancelling={cancelling}
              onRefetch={() => fetchBookings(tab)}
            />
          ))}
        </div>
      )}
    </div>
  );
}