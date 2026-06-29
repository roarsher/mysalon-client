 



import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast }          from 'react-toastify';
import useQueue           from '../hooks/useQueue';
import { cancelBooking }  from '../services/api';
import { initiateRefund } from '../services/api';
import { useLocation as useUserLocation } from '../context/LocationContext';
import { formatPrice, formatWait, statusStyle } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

// Build Google Maps directions URL from user → salon
function buildMapsUrl(userLocation, salon) {
  const dest = salon?.address
    ? [salon.address.street, salon.address.area, salon.address.city].filter(Boolean).join(', ')
    : salon?.name || '';

  if (userLocation?.lat && userLocation?.lng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`;
}

export default function QueueStatusPage() {
  const { bookingId }    = useParams();
  const { state }        = useLocation();
  const navigate         = useNavigate();
  const { userLocation } = useUserLocation();

  const { queueData, loading, error, refresh } = useQueue(bookingId);

  const salonName    = state?.salonName    || 'Salon';
  const paymentFailed = state?.paymentFailed || false;

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking? A refund will be initiated if you already paid.')) return;
    try {
      try { await initiateRefund({ bookingId, reason: 'Customer cancelled' }); }
      catch { /* may not be paid */ }
      await cancelBooking(bookingId, { reason: 'Customer cancelled' });
      toast.success('Booking cancelled.');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.message || 'Could not cancel.');
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (error)   return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="mb-4">{error}</p>
      <button onClick={refresh} className="text-primary text-sm hover:underline">Try again</button>
    </div>
  );

  const {
    position = 0, waitingCount = 0,
    estimatedWait = 0, tokenNumber = '—',
    status = 'waiting', totalAmount = 0,
    services = [], isPaused, salon,
  } = queueData || {};

  const isCompleted  = status === 'completed';
  const isCancelled  = status === 'cancelled';
  const isInProgress = status === 'in_progress';
  const isYourTurn   = position === 0 && status === 'confirmed';
  const isAlmostTurn = position === 1;

  const progressPct = waitingCount > 0
    ? Math.max(10, 100 - (position / waitingCount) * 90)
    : 100;

  // Google Maps URL
  const mapsUrl = buildMapsUrl(
    userLocation,
    state?.booking?.salon || salon || { name: salonName }
  );

  return (
    <div className="max-w-sm mx-auto px-4 py-6 pb-24">

      {/* Payment failed warning */}
      {paymentFailed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-800">
          ⚠️ Payment was not completed. Please pay at the counter or retry from My Bookings.
        </div>
      )}

      {/* ── Status card ─────────────────────────────────────────────────── */}
      <div className="card p-6 text-center mb-4">

        {/* Status icon */}
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl ${
          isCompleted  ? 'bg-green-100' :
          isCancelled  ? 'bg-gray-100'  :
          isInProgress ? 'bg-yellow-100':
          isYourTurn   ? 'bg-primary-50 animate-pulse' :
          isAlmostTurn ? 'bg-orange-50 animate-pulse'  : 'bg-primary-50'
        }`}>
          {isCompleted ? '✅' : isCancelled ? '❌' : isInProgress ? '✂️' : isYourTurn ? '🔔' : isAlmostTurn ? '⚡' : '⏳'}
        </div>

        <h1 className="text-lg font-bold text-gray-900 mb-1">
          {isCompleted  ? 'Service Completed!'      :
           isCancelled  ? 'Booking Cancelled'       :
           isInProgress ? "You're being served! ✂️" :
           isYourTurn   ? "It's your turn! 🔔"      :
           isAlmostTurn ? 'Almost your turn! ⚡'     : "You're in the queue!"}
        </h1>

        <span className={`badge text-xs mb-4 ${statusStyle(status)}`}>
          {status.replace('_', ' ')}
        </span>

        {/* Live position counter */}
        {!isCompleted && !isCancelled && (
          <div className={`rounded-2xl p-5 mb-4 ${
            isYourTurn || isInProgress ? 'bg-secondary-50' :
            isAlmostTurn ? 'bg-orange-50' : 'bg-primary-50'
          }`}>
            <div className={`text-5xl font-bold mb-1 ${
              isYourTurn || isInProgress ? 'text-secondary' :
              isAlmostTurn ? 'text-orange-500' : 'text-primary'
            }`}>
              {isInProgress ? '✂️' : position}
            </div>
            <div className={`text-sm font-medium ${
              isYourTurn || isInProgress ? 'text-secondary-dark' :
              isAlmostTurn ? 'text-orange-600' : 'text-primary'
            }`}>
              {isInProgress ? 'Currently being served'
               : isYourTurn   ? 'Head to the counter now!'
               : isAlmostTurn ? '1 person ahead — start heading over!'
               : `customer${position !== 1 ? 's' : ''} ahead of you`}
            </div>

            <div className="w-full bg-white/60 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  isYourTurn || isInProgress ? 'bg-secondary' :
                  isAlmostTurn ? 'bg-orange-400' : 'bg-primary'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {!isInProgress && (
              <p className="text-xs text-gray-500 mt-2">
                Est. wait: <strong>{formatWait(estimatedWait)}</strong>
              </p>
            )}
          </div>
        )}

        {/* ── Google Maps direction link ─────────────────────────────── */}
        {/* Show when almost turn or it's their turn — time to head over */}
        {(isYourTurn || isAlmostTurn || isInProgress) && !isCancelled && !isCompleted && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition active:scale-[0.98] mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Get Directions to Salon
          </a>
        )}

        {/* Paused notice */}
        {isPaused && !isCompleted && !isCancelled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-700 mb-4">
            Queue is temporarily paused by the salon
          </div>
        )}

        {/* Token + booking info */}
        <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Token #</span>
            <strong className="font-mono text-gray-900">{tokenNumber}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Salon</span>
            <span className="text-gray-700 font-medium truncate max-w-[60%] text-right">{salonName}</span>
          </div>
          {services.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Services</span>
              <span className="text-gray-700 text-right max-w-[60%] truncate">
                {services.map((s) => s.name).join(', ')}
              </span>
            </div>
          )}
          {totalAmount > 0 && (
            <div className="flex justify-between font-semibold">
              <span className="text-gray-400">Amount</span>
              <span className="text-primary">{formatPrice(totalAmount)}</span>
            </div>
          )}
        </div>

        {/* ── Always-visible Google Maps link ─────────────────────────── */}
        {!isYourTurn && !isAlmostTurn && !isInProgress && !isCompleted && !isCancelled && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-blue-200 text-blue-600 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition mb-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            View Salon on Maps
          </a>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={refresh}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
            ↻ Refresh
          </button>
          {!isCompleted && !isCancelled && (
            <button onClick={handleCancel}
              className="flex-1 border border-red-200 rounded-xl py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
              ✕ Cancel
            </button>
          )}
          {isCompleted && (
            <button
              onClick={() => navigate(`/rate/${bookingId}`, {
                state: { salonName, salonId: state?.booking?.salon?._id }
              })}
              className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary-dark transition"
            >
              ⭐ Rate Experience
            </button>
          )}
        </div>
      </div>

      {/* How it works */}
      {!isCompleted && !isCancelled && (
        <div className="card p-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800 mb-1">How it works</p>
          <p>① This page auto-updates every 15 seconds</p>
          <p>② Head to the salon when 1–2 people are ahead</p>
          <p>③ Show token <strong className="font-mono">{tokenNumber}</strong> at the counter</p>
          <p>④ After your service, rate your experience</p>
        </div>
      )}

      <button onClick={() => navigate('/')}
        className="block text-center text-sm text-gray-400 hover:text-primary mt-5 mx-auto transition">
        ← Back to home
      </button>
    </div>
  );
}