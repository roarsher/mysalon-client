 import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast }  from 'react-toastify';
import { getServices, createBooking, getPricingPreview } from '../services/api';
import { initiateRazorpayPayment }  from '../services/payment';
import { formatPrice, formatDuration } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

const PAYMENT_METHODS = [
  { value: 'online', icon: '💳', label: 'Pay Online',     sub: 'UPI · Card · Netbanking · Wallet' },
  { value: 'cod',    icon: '💵', label: 'Pay at Salon',   sub: 'Cash on Delivery — pay when you arrive' },
];

export default function BookingPage() {
  const { salonId }  = useParams();
  const { state }    = useLocation();
  const navigate     = useNavigate();

  const [services,       setServices]       = useState([]);
  const [pricing,        setPricing]        = useState(null);
  const [isFirstBooking, setIsFirstBooking] = useState(false);
  const [notes,          setNotes]          = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState('online');
  const [loading,        setLoading]        = useState(true);
  const [confirming,     setConfirming]     = useState(false);
  const [step,           setStep]           = useState('idle'); // idle|booking|paying|verifying

  const serviceIds = state?.serviceIds || [];
  const salonName  = state?.salonName  || 'Salon';

  // ── Load services + pricing preview ──────────────────────────────────────
  useEffect(() => {
    if (!serviceIds.length) { toast.error('No services selected.'); navigate(-1); return; }

    const load = async () => {
      try {
        const [svRes, priceRes] = await Promise.all([
          getServices(salonId),
          getPricingPreview(salonId, serviceIds.join(',')),
        ]);
        const all      = svRes?.data?.data || [];
        const selected = all.filter((s) => serviceIds.includes(s._id));
        setServices(selected);

        const pd = priceRes?.data?.data;
        if (pd) { setPricing(pd.pricing); setIsFirstBooking(pd.isFirstBooking); }
      } catch { toast.error('Could not load booking details.'); }
      finally   { setLoading(false); }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalDuration = services.reduce((s, x) => s + (x.duration || 0), 0);

  // ── Confirm + Pay ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // Step 1 — create booking in DB
      setStep('booking');
      const res     = await createBooking({ salonId, serviceIds, notes: notes.trim(), paymentMethod });
      const booking = res.data.data;

      // Step 2 — COD: done, go to queue
      if (paymentMethod === 'cod') {
        toast.success('Booking confirmed! Pay at the salon when you arrive. 💵');
        navigate(`/queue/${booking._id}`, { state: { salonName, booking } });
        return;
      }

      // Step 3 — Online: open Razorpay
      setStep('paying');
      initiateRazorpayPayment(
        booking._id,
        // onSuccess
        (paymentData) => {
          setStep('verifying');
          toast.success('Payment successful! Booking confirmed 🎉');
          navigate(`/queue/${booking._id}`, { state: { salonName, booking, paymentData } });
        },
        // onFailure / modal closed
        (errorMsg) => {
          setStep('idle');
          setConfirming(false);
          // Booking exists but unpaid — let user retry from My Bookings
          toast.error(errorMsg || 'Payment cancelled.');
          navigate(`/queue/${booking._id}`, { state: { salonName, booking, paymentFailed: true } });
        }
      );
    } catch (err) {
      setStep('idle');
      setConfirming(false);
      toast.error(err?.response?.data?.message || err.message || 'Booking failed.');
    }
  };

  const stepMsg = { idle: null, booking: 'Creating booking…', paying: 'Opening payment…', verifying: 'Verifying payment…' }[step];

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-36">

      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary text-sm mb-5 hover:underline">
        ← Back
      </button>
      <h1 className="text-xl font-semibold text-gray-900 mb-0.5">Confirm Booking</h1>
      <p className="text-sm text-gray-400 mb-5">{salonName}</p>

      {/* ── First booking banner ─────────────────────────────────────────── */}
      {isFirstBooking && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary/20 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🎁</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Welcome! First booking discount applied</p>
            <p className="text-xs text-gray-500 mt-0.5">₹100 off + platform fee waived — just for you</p>
          </div>
        </div>
      )}

      {/* ── Services summary ─────────────────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Selected Services</h2>
        <div className="space-y-2.5">
          {services.map((s) => (
            <div key={s._id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-400">⏱ {formatDuration(s.duration)}</p>
              </div>
              <span className="font-semibold text-gray-900 text-sm">{formatPrice(s.price)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
          <span>Total duration</span>
          <span>{formatDuration(totalDuration)}</span>
        </div>
      </div>

      {/* ── Pricing breakdown ────────────────────────────────────────────── */}
      {pricing && <PricingCard pricing={pricing} />}

      {/* ── Special requests ─────────────────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Special Requests <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          rows={3} maxLength={300}
          placeholder="e.g. Preferred stylist, specific style, allergies to products…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition"
        />
        <p className="text-right text-xs text-gray-300 mt-1">{notes.length}/300</p>
      </div>

      {/* ── Payment method ───────────────────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Payment Method</h2>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((pm) => (
            <label key={pm.value}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                paymentMethod === pm.value
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}>
              <input type="radio" name="paymentMethod" value={pm.value} className="hidden"
                checked={paymentMethod === pm.value}
                onChange={() => setPaymentMethod(pm.value)} />
              <span className="text-2xl flex-shrink-0">{pm.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{pm.label}</p>
                <p className="text-xs text-gray-400">{pm.sub}</p>
              </div>
              {/* Radio dot */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                paymentMethod === pm.value ? 'border-primary' : 'border-gray-300'
              }`}>
                {paymentMethod === pm.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </label>
          ))}
        </div>

        {/* Online payment icons */}
        {paymentMethod === 'online' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {['UPI','Card','Netbanking','Wallet'].map((m) => (
              <span key={m} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{m}</span>
            ))}
            <span className="ml-auto text-xs text-gray-400">🔒 Razorpay</span>
          </div>
        )}

        {/* COD note */}
        {paymentMethod === 'cod' && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">⚠️</span>
            <span>You'll pay in cash when you arrive at the salon. Your slot is reserved immediately.</span>
          </div>
        )}
      </div>

      {/* ── Refund policy ───────────────────────────────────────────────── */}
      {paymentMethod === 'online' && (
        <div className="bg-secondary-50 border border-secondary/20 rounded-2xl p-4 mb-4 text-xs text-secondary-dark space-y-1.5">
          <p className="font-semibold mb-1">Refund Policy</p>
          <p>✅ 100% refund if cancelled 2+ hours before your slot</p>
          <p>⚡ 50% refund if cancelled less than 2 hours before</p>
          <p>❌ No refund once service has started</p>
        </div>
      )}

      {/* ── Where does money go ──────────────────────────────────────────── */}
      {paymentMethod === 'online' && (
        <div className="card p-4 mb-4 text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-gray-700">💰 Where does your payment go?</p>
          <p>Your payment is processed securely by <strong>Razorpay</strong> and settled to the salon's bank account within 2 business days. MYSALON retains only the platform fee (₹{pricing?.platformFee || 10}) to cover operations.</p>
          <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
            <div className="flex-1 text-center">
              <p className="font-semibold text-gray-800">{formatPrice((pricing?.totalAmount || 0) - (pricing?.gstAmount || 0) - (pricing?.platformFee || 0) + (pricing?.discountAmount || 0))}</p>
              <p className="text-gray-400 text-xs">To salon</p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-semibold text-gray-800">{formatPrice(pricing?.gstAmount || 0)}</p>
              <p className="text-gray-400 text-xs">GST (govt.)</p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-semibold text-gray-800">{formatPrice(pricing?.platformFee || 0)}</p>
              <p className="text-gray-400 text-xs">Platform fee</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed bottom bar ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40">
        <div className="max-w-lg mx-auto">
          {stepMsg && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary mb-3">
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              {stepMsg}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400">{services.length} service{services.length !== 1 ? 's' : ''}</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(pricing?.totalAmount || 0)}
              </p>
              {pricing?.discountAmount > 0 && (
                <p className="text-xs text-green-600">You save {formatPrice(pricing.discountAmount)}</p>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="bg-primary text-white px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98] whitespace-nowrap"
            >
              {confirming
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </span>
                : paymentMethod === 'cod'
                  ? `Confirm Booking`
                  : `Pay ${formatPrice(pricing?.totalAmount || 0)}`
              }
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            {paymentMethod === 'online'
              ? '🔒 Secured by Razorpay · UPI · Cards · Netbanking'
              : '💵 Pay in cash at the salon counter'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Pricing breakdown card ────────────────────────────────────────────────────
function PricingCard({ pricing }) {
  const [open, setOpen] = useState(true);

  const rows = [
    { label: 'Services subtotal',                       amount: pricing.subtotal,       sign: '+' },
    { label: `GST ${pricing.gstPercent || 18}% (CGST + SGST)`, amount: pricing.gstAmount, sign: '+' },
    pricing.platformFee > 0
      ? { label: 'Platform fee',   amount: pricing.platformFee,  sign: '+' }
      : { label: 'Platform fee 🎁 Waived', amount: 0,            sign: '+', note: true },
    pricing.discountAmount > 0
      ? { label: pricing.discountLabel || '🎁 Discount', amount: pricing.discountAmount, sign: '-', highlight: true }
      : null,
  ].filter(Boolean);

  return (
    <div className="card p-4 mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-0"
      >
        <span>Price Breakdown</span>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">{formatPrice(pricing.totalAmount)}</span>
          <span className={`text-gray-300 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className={`flex justify-between text-xs ${row.highlight ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
              <span>{row.label}</span>
              <span>
                {row.note
                  ? <span className="text-gray-400">—</span>
                  : row.sign === '-'
                    ? `− ${formatPrice(row.amount)}`
                    : formatPrice(row.amount)
                }
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
            <span>Total Payable</span>
            <span className="text-primary">{formatPrice(pricing.totalAmount)}</span>
          </div>
          {pricing.discountAmount > 0 && (
            <p className="text-xs text-green-600 text-center font-medium">
              🎉 You're saving {formatPrice(pricing.discountAmount)} on this booking!
            </p>
          )}
        </div>
      )}
    </div>
  );
}