 

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getQueueBySalon, serveNext, completeCurrentBooking,
  toggleQueuePause, ownerCancelBooking,
  getSalonBookings, getServices, getSalonReviews,
} from '../../services/api';
import { formatPrice, formatDuration,   timeAgo } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';

const TABS = ['Live Queue', 'All Bookings', 'Services', 'Reviews'];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: 'Pending',     badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  confirmed:   { label: 'Confirmed',   badge: 'bg-blue-100   text-blue-700',   dot: 'bg-blue-400'   },
  in_progress: { label: 'In Progress', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  completed:   { label: 'Completed',   badge: 'bg-green-100  text-green-700',  dot: 'bg-green-500'  },
  cancelled:   { label: 'Cancelled',   badge: 'bg-gray-100   text-gray-500',   dot: 'bg-gray-300'   },
};
const getStatusCfg = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

// ── Customer avatar ───────────────────────────────────────────────────────────
function CustomerAvatar({ user, size = 'md' }) {
  const s   = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-10 h-10 text-sm';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  return user?.photoURL ? (
    <img src={user.photoURL} alt={user.name} className={`${s} rounded-full object-cover flex-shrink-0`} />
  ) : (
    <div className={`${s} rounded-full bg-primary-50 border border-primary/20 flex items-center justify-center font-semibold text-primary flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Booking detail modal ──────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null;
  const cfg    = getStatusCfg(booking.bookingStatus);
  const isPaid = booking.paymentStatus === 'paid' || booking.paymentStatus === 'collected';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-900">Booking Details</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">#{booking.tokenNumber}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition text-lg">
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <CustomerAvatar user={booking.user} size="lg" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{booking.user?.name || 'Customer'}</p>
              <p className="text-xs text-gray-400">{booking.user?.email || ''}</p>
              {booking.user?.phone && (
                <a href={`tel:${booking.user.phone}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                  📞 {booking.user.phone}
                </a>
              )}
            </div>
            <span className={`badge text-xs ${cfg.badge}`}>{cfg.label}</span>
          </div>

          {/* Services ordered by this customer */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Services Ordered
            </h3>
            <div className="space-y-2">
              {(booking.services || []).map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{s.category} · ⏱ {formatDuration(s.duration)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(s.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment breakdown */}
          {booking.pricing?.subtotal > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Payment Breakdown
              </h3>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{formatPrice(booking.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST ({booking.pricing.gstPercent}%)</span>
                  <span>{formatPrice(booking.pricing.gstAmount)}</span>
                </div>
                {booking.pricing.platformFee > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Platform fee</span><span>{formatPrice(booking.pricing.platformFee)}</span>
                  </div>
                )}
                {booking.pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>{booking.pricing.discountLabel || 'Discount'}</span>
                    <span>− {formatPrice(booking.pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200 mt-1.5 text-sm">
                  <span>Total</span><span>{formatPrice(booking.totalAmount)}</span>
                </div>
                <div className={`flex justify-between text-xs font-semibold ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  <span>Payment</span>
                  <span>
                    {booking.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'} ·{' '}
                    {booking.paymentStatus === 'collected' ? 'Collected' : booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer Notes</h3>
              <p className="text-sm text-gray-600 bg-yellow-50 rounded-xl px-3 py-2.5 border border-yellow-100">
                "{booking.notes}"
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>📅 Booked: {new Date(booking.createdAt).toLocaleString('en-IN')}</p>
            {booking.startedAt   && <p>▶ Started:   {new Date(booking.startedAt).toLocaleString('en-IN')}</p>}
            {booking.completedAt && <p>✅ Completed: {new Date(booking.completedAt).toLocaleString('en-IN')}</p>}
          </div>

          {/* Rating left by customer */}
          {booking.rating?.score && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Review</h3>
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < booking.rating.score ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{booking.rating.score}/5</span>
                </div>
                {booking.rating.comment && (
                  <p className="text-sm text-gray-600 italic">"{booking.rating.comment}"</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function QueueManagerPage() {
  const { salonId } = useParams();
  const navigate    = useNavigate();

  const [queue,           setQueue]           = useState(null);
  const [bookings,        setBookings]        = useState([]);
  const [services,        setServices]        = useState([]);
  const [reviews,         setReviews]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [serving,         setServing]         = useState(false);
  const [pausing,         setPausing]         = useState(false);
  const [pauseReason,     setPauseReason]     = useState('');
  const [showPauseBox,    setShowPauseBox]    = useState(false);
  const [tab,             setTab]             = useState('Live Queue');
  const [cancelModal,     setCancelModal]     = useState(null);
  const [cancelReason,    setCancelReason]    = useState('');
  const [cancellingId,    setCancellingId]    = useState(null);
  const [detailBooking,   setDetailBooking]   = useState(null);
  const [bookingFilter,   setBookingFilter]   = useState('');

  // ── Fetch functions ────────────────────────────────────────────────────────
  const fetchQueue = useCallback(async () => {
    try {
      const res = await getQueueBySalon(salonId);
      setQueue(res.data.data);
    } catch { toast.error('Could not load queue.'); }
    finally   { setLoading(false); }
  }, [salonId]);

  const fetchBookings = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res   = await getSalonBookings(salonId, { date: today, limit: 100 });
      setBookings(res.data.data || []);
    } catch { /* silent */ }
  }, [salonId]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await getServices(salonId);
      setServices(res.data.data || []);
    } catch { /* silent */ }
  }, [salonId]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await getSalonReviews(salonId, { limit: 50 });
      setReviews(res.data.data || []);
    } catch { /* silent */ }
  }, [salonId]);

  // Auto-refresh queue every 15s
  useEffect(() => {
    fetchQueue(); fetchBookings(); fetchServices(); fetchReviews();
    const iv = setInterval(() => { fetchQueue(); fetchBookings(); }, 15000);
    return () => clearInterval(iv);
  }, [fetchQueue, fetchBookings, fetchServices, fetchReviews]);

  // ── Serve next ─────────────────────────────────────────────────────────────
  const handleServeNext = async () => {
    setServing(true);
    try {
      const res = await serveNext(salonId);
      toast.success(res.data.message);
      await fetchQueue(); await fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not serve next.'); }
    finally { setServing(false); }
  };

  // ── Complete current ───────────────────────────────────────────────────────
  const handleComplete = async () => {
    try {
      await completeCurrentBooking(salonId);
      toast.success('Service completed!');
      await fetchQueue(); await fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not complete.'); }
  };

  // ── Pause / resume ─────────────────────────────────────────────────────────
  const handlePauseToggle = async () => {
    if (!queue?.isPaused && !pauseReason.trim()) { setShowPauseBox(true); return; }
    setPausing(true);
    try {
      const res = await toggleQueuePause(salonId, { isPaused: !queue.isPaused, reason: pauseReason });
      setQueue((q) => ({ ...q, isPaused: res.data.data.isPaused, pauseReason: res.data.data.pauseReason }));
      setPauseReason(''); setShowPauseBox(false);
      toast.success(res.data.message);
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not toggle pause.'); }
    finally { setPausing(false); }
  };

  // ── Cancel booking ─────────────────────────────────────────────────────────
  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await ownerCancelBooking(bookingId, { reason: cancelReason || 'Cancelled by salon' });
      toast.success('Booking cancelled.');
      setCancelModal(null); setCancelReason('');
      await fetchQueue(); await fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Could not cancel.'); }
    finally { setCancellingId(null); }
  };

  if (loading) return <Spinner size="lg" />;

  const {
    waitingCount = 0 ,  
    isPaused = false, pauseReason: activePauseReason = '',
    totalServedToday = 0, activeBookings = [],
  } = queue || {};

  const inProgressBooking = bookings.find((b) => b.bookingStatus === 'in_progress');
  //const waitingBookings   = bookings.filter((b) => ['waiting','confirmed','pending'].includes(b.bookingStatus));
  const completedToday    = bookings.filter((b) => b.bookingStatus === 'completed').length;
  const cancelledToday    = bookings.filter((b) => b.bookingStatus === 'cancelled').length;

  // Filtered bookings for "All Bookings" tab
  const filteredBookings  = bookingFilter
    ? bookings.filter((b) => b.bookingStatus === bookingFilter)
    : bookings;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">

      {/* Modals */}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Cancel Booking</h3>
            <p className="text-sm text-gray-400 mb-4">Removes customer from the queue.</p>
            <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" />
            <div className="flex gap-2">
              <button onClick={() => { setCancelModal(null); setCancelReason(''); }} className="btn-outline flex-1 py-2.5">Keep</button>
              <button onClick={() => handleCancelBooking(cancelModal)}
                disabled={cancellingId === cancelModal}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition">
                {cancellingId === cancelModal ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/owner/dashboard')} className="text-primary text-sm hover:underline">← Dashboard</button>
        <span className="text-gray-300">›</span>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Queue Manager</h1>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-secondary animate-pulse'}`} />
          <span className="text-xs text-gray-500">{isPaused ? 'Paused' : 'Live'}</span>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Waiting',    value: waitingCount,     color: 'text-primary'        },
          { label: 'Served',     value: totalServedToday, color: 'text-secondary-dark' },
          { label: 'Completed',  value: completedToday,   color: 'text-green-600'      },
          { label: 'Cancelled',  value: cancelledToday,   color: 'text-red-400'        },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Control panel ─────────────────────────────────────────────────── */}
      <div className="card p-4 mb-5">
        {/* Currently serving */}
        {inProgressBooking && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CustomerAvatar user={inProgressBooking.user} />
                <div>
                  <p className="text-xs text-orange-600 font-semibold">✂️ Currently serving</p>
                  <p className="font-bold text-gray-900">{inProgressBooking.user?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    Token #{inProgressBooking.tokenNumber} ·{' '}
                    {(inProgressBooking.services || []).map((s) => s.name).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={handleComplete}
                  className="bg-green-500 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-600 transition font-semibold">
                  Done ✓
                </button>
                <button onClick={() => setDetailBooking(inProgressBooking)}
                  className="text-xs text-gray-400 hover:text-primary transition text-center">
                  View detail
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={handleServeNext}
            disabled={serving || isPaused || waitingCount === 0}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.98]">
            {serving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calling…
              </span>
            ) : waitingCount === 0 ? 'Queue Empty'
              : `Call Next (${waitingCount} waiting)`}
          </button>
          <button onClick={() => isPaused ? handlePauseToggle() : setShowPauseBox((v) => !v)}
            disabled={pausing}
            className={`px-4 py-3 rounded-xl font-semibold text-sm transition ${
              isPaused
                ? 'bg-secondary text-white hover:bg-secondary-dark'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
            }`}>
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>

        {/* Pause reason box */}
        {showPauseBox && !isPaused && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700 mb-2">Reason for pausing</p>
            <input value={pauseReason} onChange={(e) => setPauseReason(e.target.value)}
              placeholder="e.g. Lunch break, Staff unavailable…"
              className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm bg-white mb-2 focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={handlePauseToggle} disabled={pausing}
                className="flex-1 bg-yellow-500 text-white text-sm py-2 rounded-lg hover:bg-yellow-600 transition font-medium">
                Confirm Pause
              </button>
              <button onClick={() => { setShowPauseBox(false); setPauseReason(''); }}
                className="flex-1 border border-yellow-200 text-yellow-600 text-sm py-2 rounded-lg transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {isPaused && (
          <p className="text-xs text-yellow-600 mt-2 text-center">
            ⏸ Queue paused: <em>{activePauseReason}</em>
          </p>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 mb-5 overflow-x-auto hide-scrollbar">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition whitespace-nowrap ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}>
            {t}
            {t === 'Live Queue'   && waitingCount > 0   && <span className="ml-1.5 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{waitingCount}</span>}
            {t === 'Reviews'      && reviews.length > 0  && <span className="ml-1.5 text-xs text-gray-400">({avgRating}★)</span>}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: LIVE QUEUE
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'Live Queue' && (
        <div>
          {activeBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-gray-500 font-semibold">Queue is empty!</p>
              <p className="text-gray-400 text-sm mt-1">No customers waiting right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeBookings.map((b, idx) => (
                <div key={b._id}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition cursor-pointer hover:shadow-sm ${
                    idx === 0 ? 'border-primary/30 bg-primary-50' : 'border-gray-100 bg-white'
                  }`}
                  onClick={() => setDetailBooking(b)}
                >
                  {/* Position number */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Customer avatar */}
                  <CustomerAvatar user={b.user} size="sm" />

                  {/* Customer + booking info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{b.user?.name || 'Customer'}</p>
                      {idx === 0 && <span className="badge bg-primary text-white text-xs">Next up</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {(b.services || []).map((s) => s.name).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="font-mono">#{b.tokenNumber}</span>
                      {' · '}{formatPrice(b.totalAmount)}
                      {' · '}{timeAgo(b.createdAt)}
                      {b.paymentMethod === 'cod' && <span className="ml-1 text-yellow-600">💵 COD</span>}
                      {b.paymentStatus === 'paid' && <span className="ml-1 text-green-600">✅ Paid</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {b.user?.phone && (
                      <a href={`tel:${b.user.phone}`}
                        className="text-xs text-primary border border-primary/20 px-2.5 py-1 rounded-lg hover:bg-primary-50 transition text-center">
                        📞
                      </a>
                    )}
                    <button onClick={() => setCancelModal(b._id)}
                      className="text-xs text-red-400 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: ALL BOOKINGS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'All Bookings' && (
        <div>
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-4">
            {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => {
              const cfg   = s ? getStatusCfg(s) : null;
              const count = s ? bookings.filter((b) => b.bookingStatus === s).length : bookings.length;
              return (
                <button key={s} onClick={() => setBookingFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition flex-shrink-0 ${
                    bookingFilter === s
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40'
                  }`}>
                  {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                  {s ? cfg.label : 'All'}
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>No bookings{bookingFilter ? ` with status "${bookingFilter}"` : ''} today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBookings.map((b) => {
                const cfg = getStatusCfg(b.bookingStatus);
                return (
                  <div key={b._id}
                    className="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition"
                    onClick={() => setDetailBooking(b)}
                  >
                    <CustomerAvatar user={b.user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-semibold text-sm text-gray-900">{b.user?.name || 'Customer'}</p>
                        <span className={`badge text-xs ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot} inline-block`} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {(b.services || []).map((s) => s.name).join(' · ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="font-mono">#{b.tokenNumber}</span>
                        {' · '}{formatPrice(b.totalAmount)}
                        {' · '}{timeAgo(b.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {b.user?.phone && (
                        <a href={`tel:${b.user.phone}`} onClick={(e) => e.stopPropagation()}
                          className="block text-xs text-primary hover:underline mb-1">📞 Call</a>
                      )}
                      <span className={`text-xs font-medium ${b.paymentStatus === 'paid' || b.paymentStatus === 'collected' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {b.paymentMethod === 'cod' ? '💵' : '💳'} {b.paymentStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: SERVICES  (services the salon offers)
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'Services' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{services.length} service{services.length !== 1 ? 's' : ''} offered</p>
            <button onClick={() => navigate(`/owner/salon/${salonId}`)}
              className="btn-primary text-xs py-1.5 px-3">
              + Manage Services
            </button>
          </div>

          {services.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🛎</div>
              <p className="text-gray-500 font-medium mb-3">No services listed yet.</p>
              <button onClick={() => navigate(`/owner/salon/${salonId}`)} className="btn-primary text-sm px-5 py-2">
                Add Services
              </button>
            </div>
          ) : (
            (() => {
              const grouped = services.reduce((acc, s) => {
                if (!acc[s.category]) acc[s.category] = [];
                acc[s.category].push(s);
                return acc;
              }, {});
              return (
                <div className="space-y-5">
                  {Object.entries(grouped).map(([cat, list]) => (
                    <div key={cat}>
                       <h3 className="text-xs font-bold text-gray-400 capitalize tracking-wide mb-2">
                         {cat}
                         </h3>
                      <div className="space-y-2">
                        {list.map((s) => (
                          <div key={s._id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                            s.isAvailable ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'
                          }`}>
                            {s.image?.url
                              ? <img src={s.image.url} alt={s.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                              : <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">✂️</div>
                            }
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900">{s.name}</p>
                              <p className="text-xs text-gray-400">{formatDuration(s.duration)} · {s.description || ''}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-gray-900">{formatPrice(s.price)}</p>
                              <span className={`text-xs font-medium ${s.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                                {s.isAvailable ? '● Active' : '● Off'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: REVIEWS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'Reviews' && (
        <div>
          {/* Rating summary */}
          <div className="card p-5 mb-4 flex items-center gap-5">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{avgRating}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={parseFloat(avgRating) >= i + 1 ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-4 text-right">{star}</span>
                    <span className="text-yellow-400">★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-5 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">⭐</div>
              <p>No reviews yet. Complete services to receive ratings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CustomerAvatar user={r.user} size="sm" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{r.user?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-400">{timeAgo(r.createdAt)}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5 italic">
                      "{r.comment}"
                    </p>
                  )}
                  {r.ownerReply?.text && (
                    <div className="mt-2 ml-4 bg-primary-50 rounded-xl px-3 py-2 border-l-2 border-primary">
                      <p className="text-xs text-primary font-semibold mb-0.5">Your reply</p>
                      <p className="text-xs text-gray-600">"{r.ownerReply.text}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}