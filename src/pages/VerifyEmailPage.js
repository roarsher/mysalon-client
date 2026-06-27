import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  checkEmailVerified,
  resendVerificationEmail,
  logout,
} from '../services/firebase';
import { toast } from 'react-toastify';

const VerifyEmailPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Email + role passed from SignupPage via navigate state
  const email = location.state?.email || 'your email';
  const role  = location.state?.role  || 'user';

  const [checking,    setChecking]    = useState(false);
  const [resending,   setResending]   = useState(false);
  const [countdown,   setCountdown]   = useState(0); // resend cooldown in seconds
  const [pollCount,   setPollCount]   = useState(0); // how many times we've auto-polled

  // ── Auto-poll every 5 seconds (up to 60 times = 5 minutes) ─────────────────
  useEffect(() => {
    if (pollCount >= 60) return; // stop after 5 minutes

    const timer = setTimeout(async () => {
      try {
        const verified = await checkEmailVerified();
        if (verified) {
          handleVerified();
        } else {
          setPollCount((c) => c + 1);
        }
      } catch {
        // silent — just keep polling
      }
    }, 5000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollCount]);

  // ── Countdown timer for resend button ────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Called when verification is confirmed ────────────────────────────────────
  const handleVerified = () => {
    toast.success('Email verified! Welcome to MYSALON 🎉');
    // Send salon owners to register their salon; customers to home
    if (role === 'salon_owner') {
      navigate('/owner/register-salon');
    } else {
      navigate('/');
    }
  };

  // ── Manual "I've clicked the link" check ─────────────────────────────────────
  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        handleVerified();
      } else {
        toast.warning(
          'Email not verified yet. Please click the link in your inbox.',
          { autoClose: 4000 }
        );
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChecking(false);
    }
  };

  // ── Resend verification email ─────────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent again. Check your inbox!');
      setCountdown(60); // 60-second cooldown before next resend
    } catch (err) {
      toast.error(err.message || 'Failed to resend. Try again shortly.');
    } finally {
      setResending(false);
    }
  };

  // ── Cancel — logout and go to login ──────────────────────────────────────────
  const handleCancel = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="card p-8 text-center">

          {/* Animated envelope icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center text-4xl animate-bounce">
              📧
            </div>
            {/* Spinning check ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verify your email address
          </h2>
          <p className="text-gray-500 text-sm mb-1">
            We've sent a verification link to:
          </p>
          <p className="font-semibold text-primary text-sm mb-4 break-all">
            {email}
          </p>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            {[
              'Open your email inbox',
              'Find the email from MYSALON',
              'Click the "Verify Email" link inside',
              'Come back here — we\'ll detect it automatically',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-primary-50 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>

          {/* Auto-checking indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Checking automatically every 5 seconds…
          </div>

          {/* Primary CTA — manual check */}
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="btn-primary w-full mb-3"
          >
            {checking ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking…
              </span>
            ) : (
              "✓ I've verified my email"
            )}
          </button>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="btn-outline w-full mb-3 disabled:opacity-50"
          >
            {resending
              ? 'Sending…'
              : countdown > 0
              ? `Resend in ${countdown}s`
              : 'Resend verification email'}
          </button>

          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Use a different account
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-gray-400 mt-4 px-4">
          Can't find the email? Check your spam/junk folder. The link expires in 1 hour.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;