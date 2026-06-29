 import { useState }          from 'react';
import { Link, useNavigate , useSearchParams} from 'react-router-dom';
import { toast }             from 'react-toastify';
import { useAuth }           from '../context/AuthContext';
import { signInWithGoogle }  from '../services/firebase';
import {
  registerAPI,
  verifyEmailAPI,
  resendOtpAPI,
  googleSignInAPI,
  completeProfileAPI,
} from '../services/api';
import { isValidEmail, isValidPhone, isValidPassword } from '../utils/validators';

// ── Error extractor ───────────────────────────────────────────────────────────
const getErr = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || err?.message || fallback;

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS  (defined outside — prevents remount bug on re-render)
// ══════════════════════════════════════════════════════════════════════════════

function InputField({ label, name, type = 'text', value, onChange, placeholder, error, icon, rightElement }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete="off"
          className={[
            'w-full border rounded-xl py-3 text-sm outline-none transition-all bg-white',
            icon          ? 'pl-10' : 'pl-4',
            rightElement  ? 'pr-20' : 'pr-4',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/10',
          ].join(' ')}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

function StepDots({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`rounded-full transition-all duration-300 ${
          i === current ? 'w-6 h-2 bg-primary' : i < current ? 'w-2 h-2 bg-primary/50' : 'w-2 h-2 bg-gray-200'
        }`} />
      ))}
    </div>
  );
}

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
      <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm bg-primary hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : label}
    </button>
  );
}

function GoogleBtn({ onClick, loading }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50">
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6.1C12.4 13.2 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
        <path fill="#FBBC05" d="M10.5 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.2-7.7 2.2-6.3 0-11.6-3.7-13.5-9l-7.9 6.2C6.7 42.6 14.7 48 24 48z"/>
      </svg>
      Sign up with Google
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// Left decorative panel — shown only on large screens
function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-dark via-primary to-secondary">
      {/* Decorative circles */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 bg-white" />

      <div className="relative z-10 text-center max-w-sm w-full">
        <h1 className="text-5xl font-bold text-white mb-1 tracking-tight">
          MY<span className="text-secondary-50">SALON</span>
        </h1>
        <p className="text-xs uppercase tracking-widest mb-10 text-white/50">
          Skip the queue. Book your chair.
        </p>

        <div className="space-y-5 text-left">
          {[
            { emoji: '✂️', title: 'Top Salons Nearby',   desc: 'Browse verified salons with live queue counts'  },
            { emoji: '📋', title: 'Real-time Queue',      desc: 'See exactly how many people are ahead of you'  },
            { emoji: '🔔', title: 'Get Notified',         desc: 'Alert when 1 person is ahead — walk in on time'},
            { emoji: '⭐', title: 'Rate Your Experience', desc: 'Leave reviews and help others choose'           },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-white/10">
                {emoji}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-xs mt-0.5 text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-10 p-4 rounded-2xl text-left bg-white/8 border border-white/10">
          <p className="text-sm italic leading-relaxed text-white/70">
            "No more waiting outside! I booked my slot, got notified, and walked in right on time."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold">R</div>
            <div>
              <p className="text-white text-xs font-medium">Rahul K.</p>
              <p className="text-xs text-white/40">Verified Customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ children }) {
  return (
    <div className="flex-1 flex items-start justify-center p-6 bg-gray-50 overflow-y-auto min-h-screen">
      <div className="w-full max-w-md py-8">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Skip the queue</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function SignupPage() {
  const { setCredentials } = useAuth();
  const navigate           = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState('details'); // 'details' | 'otp' | 'phone'

  //const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'user' });
  // After:
const [form, setForm] = useState({
  name: '', email: '', phone: '', password: '', confirm: '',
  role: searchParams.get('role') === 'salon_owner' ? 'salon_owner' : 'user',
});
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [otp,        setOtp]       = useState('');
  const [userId,     setUserId]    = useState(null);
  const [resendSec,  setResendSec] = useState(0);
  const [phoneInput, setPhoneInput]= useState('');

  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Countdown timer ───────────────────────────────────────────────────────
  const startTimer = () => {
    setResendSec(60);
    const t = setInterval(() => {
      setResendSec((prev) => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; });
    }, 1000);
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((f) => ({ ...f, [name]: '' }));
    setApiError('');
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errors.name = 'Name must be at least 2 characters.';
    if (!isValidEmail(form.email))
      errors.email = 'Enter a valid email address.';
    if (!isValidPhone(form.phone))
      errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!isValidPassword(form.password))
      errors.password = 'Minimum 6 characters including at least one number.';
    if (form.password !== form.confirm)
      errors.confirm = 'Passwords do not match.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── STEP 1: Register ──────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError('');
    try {
      const { data } = await registerAPI({
        name:     form.name.trim(),
        email:    form.email.toLowerCase().trim(),
        phone:    form.phone.trim(),
        password: form.password,
        role:     form.role,
      });
      setUserId(data.userId);
      setStep('otp');
      startTimer();
      toast.success('OTP sent to your email!');
    } catch (err) {
      // Unverified account exists — go to OTP anyway
      if (err?.response?.data?.userId) {
        setUserId(err.response.data.userId);
        setApiError('Account exists but not verified. Check your email for the OTP.');
        setStep('otp');
        startTimer();
        return;
      }
      if (err?.response?.status === 409)
        setApiError('An account with this email or phone already exists. Try logging in.');
      else
        setApiError(getErr(err));
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP ────────────────────────────────────────────────────
  // const handleVerifyOtp = async (e) => {
  //   e.preventDefault();
  //   if (otp.length !== 6) { setApiError('Please enter the complete 6-digit OTP.'); return; }
  //   setLoading(true); setApiError('');
  //   try {
  //     const { data } = await verifyEmailAPI({ userId, otp });
  //     setCredentials({ user: data.user, token: data.token });
  //     if (data.requiresPhone) { setStep('phone'); return; }
  //     toast.success('Account verified! Welcome to MYSALON 🎉');
  //     navigate(form.role === 'salon_owner' ? '/owner/register-salon' : '/');
  //   } catch (err) {
  //     setApiError(getErr(err, 'Invalid or expired OTP. Please try again.'));
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleVerifyOtp = async (e) => {
  e.preventDefault();
  if (otp.length !== 6) { setApiError('Please enter the complete 6-digit OTP.'); return; }
  setLoading(true); setApiError('');
  try {
    const { data } = await verifyEmailAPI({ userId, otp });
    setCredentials({ user: data.user, token: data.token });
    if (data.requiresPhone) { setStep('phone'); return; }
    toast.success('Account verified! Welcome to MYSALON 🎉');
    // Add a short delay so toast is visible before navigation
    setTimeout(() => {
      navigate(form.role === 'salon_owner' ? '/owner/register-salon' : '/');
    }, 500);
  } catch (err) {
    setApiError(getErr(err, 'Invalid or expired OTP. Please try again.'));
  } finally {
    setLoading(false);
  }
};

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendSec > 0 || loading) return;
    setLoading(true); setApiError('');
    try {
      await resendOtpAPI(userId);
      startTimer();
      toast.success('New OTP sent to your email!');
    } catch (err) {
      setApiError(getErr(err, 'Could not resend OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign up ────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true); setApiError('');
    try {
      const { idToken } = await signInWithGoogle();
      const { data }    = await googleSignInAPI(idToken);
      setCredentials({ user: data.user, token: data.token });
      if (data.requiresPhone) { setStep('phone'); return; }
      toast.success(data.isNewUser ? 'Account created! Welcome 🎉' : 'Welcome back!');
      navigate(data.user?.role === 'salon_owner' ? '/owner/register-salon' : '/');
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setLoading(false); return;
      }
      if (err?.code?.startsWith('auth/'))
        setApiError('Google sign-in failed. Please check Firebase is configured correctly.');
      else
        setApiError(getErr(err, 'Google sign-up failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: Complete profile (Google users — add phone) ───────────────────
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!isValidPhone(phoneInput)) {
      setApiError('Enter a valid 10-digit Indian mobile number (starts with 6–9).');
      return;
    }
    setLoading(true); setApiError('');
    try {
      await completeProfileAPI({ phone: phoneInput });
      toast.success('Profile complete! Welcome to MYSALON 🎉');
      navigate('/');
    } catch (err) {
      setApiError(getErr(err, 'Failed to save phone number. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const checks = [
    form.password.length >= 6,
    /\d/.test(form.password),
    /[A-Z]/.test(form.password),
    form.password.length >= 10,
  ];
  const metCount      = checks.filter(Boolean).length;
  const strengthLabel = !form.password ? '' : ['Weak','Fair','Good','Strong ✓'][Math.min(metCount-1,3)];
  const strengthColor = !form.password ? '' : metCount<=1 ? 'text-red-500' : metCount===2 ? 'text-yellow-600' : metCount===3 ? 'text-blue-500' : 'text-green-600';
  const barColor = (met) => !met ? 'bg-gray-200' : metCount<=1 ? 'bg-red-400' : metCount===2 ? 'bg-yellow-400' : metCount===3 ? 'bg-blue-400' : 'bg-green-400';

  // ══════════════════════════════════════════════════════════════════════════
  // OTP SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'otp') return (
    <div className="min-h-screen flex">
      <LeftPanel />
      <RightPanel>
        <StepDots current={1} total={3} />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-4">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a 6-digit OTP to<br />
              <strong className="text-primary">{form.email}</strong>
            </p>
          </div>

          <ErrorAlert message={apiError} />

          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter verification code
              </label>
              <input
                type="text" inputMode="numeric" maxLength={6} value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setApiError(''); }}
                placeholder="● ● ● ● ● ●"
                className="w-full border-2 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-widest outline-none transition-all border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* OTP fill progress */}
            {otp.length > 0 && (
              <div className="flex gap-1.5 mb-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < otp.length ? 'bg-primary' : 'bg-gray-200'}`} />
                ))}
              </div>
            )}

            <SubmitBtn loading={loading} label="Verify & Create Account" loadingLabel="Verifying…" />
          </form>

          <div className="text-center mt-5">
            {resendSec > 0 ? (
              <p className="text-sm text-gray-400">Resend in <span className="font-semibold text-primary">{resendSec}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={loading}
                className="text-sm text-primary font-medium hover:underline disabled:opacity-50">
                Didn't receive it? Resend OTP
              </button>
            )}
          </div>
          <div className="text-center mt-3">
            <button onClick={() => { setStep('details'); setOtp(''); setApiError(''); }}
              className="text-sm text-gray-400 hover:text-gray-600">
              ← Back to registration
            </button>
          </div>
        </div>
      </RightPanel>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PHONE SCREEN (Google users)
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'phone') return (
    <div className="min-h-screen flex">
      <LeftPanel />
      <RightPanel>
        <StepDots current={2} total={3} />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">One last step</h2>
            <p className="text-sm text-gray-500">Add your phone number for booking reminders.</p>
          </div>
          <ErrorAlert message={apiError} />
          <form onSubmit={handleCompleteProfile} noValidate>
            <InputField
              label="Phone Number" name="phoneInput" type="tel"
              value={phoneInput}
              onChange={(e) => { setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10)); setApiError(''); }}
              placeholder="9876543210" icon="📞"
            />
            <p className="text-xs text-gray-400 mb-5 -mt-2">Indian number starting with 6, 7, 8 or 9</p>
            <SubmitBtn loading={loading} label="Complete Registration" loadingLabel="Saving…" />
          </form>
        </div>
      </RightPanel>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN DETAILS FORM (Step 1)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex">
      <LeftPanel />
      <RightPanel>
        <StepDots current={0} total={3} />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-sm text-gray-500">
              Already have one?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Account type toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {[
              { value: 'user',        label: '👤 Customer' },
              { value: 'salon_owner', label: '✂️ Salon Owner' },
            ].map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
                  form.role === opt.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          <ErrorAlert message={apiError} />
          <GoogleBtn onClick={handleGoogle} loading={loading} />
          <Divider />

          <form onSubmit={handleRegister} noValidate>
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange}
              placeholder="Rahul Kumar" icon="👤" error={fieldErrors.name} />

            <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="rahul@email.com" icon="✉️" error={fieldErrors.email} />

            <InputField label="Phone Number" name="phone" type="tel"
              value={form.phone}
              onChange={(e) => handleChange({ target: { name: 'phone', value: e.target.value.replace(/\D/g,'').slice(0,10) } })}
              placeholder="9876543210" icon="📞" error={fieldErrors.phone} />

            <InputField label="Password" name="password"
              type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
              placeholder="Min 6 chars + one number" icon="🔒" error={fieldErrors.password}
              rightElement={
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              }
            />

            {/* Strength bar */}
            {form.password && (
              <div className="mb-4 -mt-2">
                <div className="flex gap-1 mb-1">
                  {checks.map((met, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${barColor(met)}`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strengthColor}`}>{strengthLabel}</p>
              </div>
            )}

            <InputField label="Confirm Password" name="confirm"
              type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={handleChange}
              placeholder="Repeat your password" icon="🔐" error={fieldErrors.confirm}
              rightElement={
                <div className="flex items-center gap-2">
                  {form.confirm && (
                    <span className={form.password === form.confirm ? 'text-green-500 font-bold' : 'text-red-400 font-bold'}>
                      {form.password === form.confirm ? '✓' : '✗'}
                    </span>
                  )}
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="text-xs text-gray-400 hover:text-gray-600 font-medium">
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              }
            />

            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              By registering you agree to our{' '}
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <SubmitBtn loading={loading} label="Create Account →" loadingLabel="Creating Account…" />
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in here</Link>
        </p>
      </RightPanel>
    </div>
  );
}