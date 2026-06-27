 import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { toast }    from 'react-toastify';
import { forgotPasswordAPI } from '../services/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Email is required.'); return; }
    setLoading(true);
    try {
      await forgotPasswordAPI(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to send reset link.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
          </h1>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-lg font-semibold mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-1">We sent a password reset link to:</p>
              <p className="font-semibold text-primary text-sm mb-5">{email}</p>
              <p className="text-xs text-gray-400 mb-5">
                Click the link in the email to set a new password. The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
              <button onClick={() => setSent(false)} className="btn-outline w-full mb-3 py-2.5">
                Send again
              </button>
              <Link to="/login" className="text-sm text-primary hover:underline">← Back to login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Reset your password</h2>
              <p className="text-sm text-gray-500 mb-5">
                Enter your registered email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-5">
                Remember it?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}