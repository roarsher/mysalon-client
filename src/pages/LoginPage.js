//  import { useState }          from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast }             from 'react-toastify';
// import { useAuth }           from '../context/AuthContext';
// import { signInWithGoogle }  from '../services/firebase';
// import {
//   loginAPI,
//   registerAPI,
//   verifyEmailAPI,
//   resendOtpAPI,
//   googleSignInAPI,
//   completeProfileAPI,
// } from '../services/api';
// import { isValidEmail, isValidPhone, isValidPassword } from '../utils/validators';

// // ── Error extractor ───────────────────────────────────────────────────────────
// function extractErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
//   if (!err) return fallback;

//   const serverMsg =
//     err?.response?.data?.message ||
//     err?.response?.data?.error   ||
//     err?.response?.data?.msg;
//   if (serverMsg) return serverMsg;

//   const status = err?.response?.status;
//   if (status === 401) return 'Incorrect email or password.';
//   if (status === 403) return 'Account access denied. Contact support.';
//   if (status === 404) return 'No account found with this email.';
//   if (status === 409) return 'An account with this email already exists.';
//   if (status === 429) return 'Too many attempts. Please wait and try again.';
//   if (status === 422) return 'Please check your details and try again.';
//   if (status >= 500)  return 'Server error. Please try again later.';

//   if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK')
//     return 'No internet connection. Please check your network.';
//   if (err?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';

//   return err?.message || fallback;
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // SUB-COMPONENTS  — defined OUTSIDE main component to prevent remount bug
// // ══════════════════════════════════════════════════════════════════════════════

// function Field({ label, type = 'text', value, onChange, placeholder, required, rightElement }) {
//   return (
//     <div className="mb-4">
//       <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
//       <div className="relative">
//         <input
//           type={type}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//           required={required}
//           autoComplete="off"
//           className="w-full border border-gray-300 rounded-xl py-3 pl-4 pr-12 text-sm outline-none transition-all bg-white focus:border-primary focus:ring-2 focus:ring-primary/10"
//         />
//         {rightElement && (
//           <div className="absolute right-3 top-1/2 -translate-y-1/2">
//             {rightElement}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function GoogleBtn({ onClick, loading }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={loading}
//       className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
//     >
//       <svg width="18" height="18" viewBox="0 0 48 48">
//         <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6.1C12.4 13.2 17.7 9.5 24 9.5z"/>
//         <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
//         <path fill="#FBBC05" d="M10.5 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z"/>
//         <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.2-7.7 2.2-6.3 0-11.6-3.7-13.5-9l-7.9 6.2C6.7 42.6 14.7 48 24 48z"/>
//       </svg>
//       Continue with Google
//     </button>
//   );
// }

// function Divider() {
//   return (
//     <div className="flex items-center gap-3 my-5">
//       <div className="flex-1 h-px bg-gray-200" />
//       <span className="text-xs text-gray-400 font-medium">or</span>
//       <div className="flex-1 h-px bg-gray-200" />
//     </div>
//   );
// }

// function ErrorBanner({ message }) {
//   if (!message) return null;
//   return (
//     <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 mb-4 border border-red-100">
//       <span className="mt-0.5 flex-shrink-0">⚠️</span>
//       <p>{message}</p>
//     </div>
//   );
// }

// function InfoBanner({ message }) {
//   if (!message) return null;
//   return (
//     <p className="text-green-700 text-sm bg-green-50 rounded-xl px-4 py-3 mb-4 border border-green-100">
//       {message}
//     </p>
//   );
// }

// function SubmitBtn({ loading, label, loadingLabel }) {
//   return (
//     <button
//       type="submit"
//       disabled={loading}
//       className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-primary hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//     >
//       {loading ? (
//         <span className="flex items-center justify-center gap-2">
//           <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//           {loadingLabel}
//         </span>
//       ) : label}
//     </button>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ══════════════════════════════════════════════════════════════════════════════
// export default function LoginPage() {
//   const { setCredentials } = useAuth();
//   const navigate           = useNavigate();

//   // tab controls login vs signup form inside the same card
//   const [tab,  setTab]  = useState('login');   // 'login' | 'signup'
//   const [step, setStep] = useState('form');    // 'form'  | 'otp' | 'phone'

//   // Shared fields
//   const [name,     setName]     = useState('');
//   const [email,    setEmail]    = useState('');
//   const [phone,    setPhone]    = useState('');
//   const [password, setPassword] = useState('');
//   const [showPw,   setShowPw]   = useState(false);

//   // OTP flow
//   const [otp,       setOtp]       = useState('');
//   const [userId,    setUserId]    = useState(null);
//   const [resendSec, setResendSec] = useState(0);

//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState('');
//   const [info,    setInfo]    = useState('');

//   const clearMsgs = () => { setError(''); setInfo(''); };

//   // ── 60-second resend countdown ────────────────────────────────────────────
//   const startTimer = () => {
//     setResendSec(60);
//     const t = setInterval(() => {
//       setResendSec((prev) => {
//         if (prev <= 1) { clearInterval(t); return 0; }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   // ── Tab switch ────────────────────────────────────────────────────────────
//   const switchTab = (t) => {
//     setTab(t);
//     setStep('form');
//     clearMsgs();
//     setOtp('');
//     setUserId(null);
//   };

//   // ══════════════════════════════════════════════════════════════════════════
//   // LOGIN handler
//   // ══════════════════════════════════════════════════════════════════════════
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     clearMsgs();

//     if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
//     if (!password)             { setError('Password is required.');        return; }

//     setLoading(true);
//     try {
//       const { data } = await loginAPI({ email: email.trim().toLowerCase(), password });

//       // Backend says email not verified yet — send to OTP screen
//       if (data.requiresVerification) {
//         setUserId(data.userId);
//         setStep('otp');
//         startTimer();
//         setInfo('Please verify your email. A new OTP has been sent.');
//         return;
//       }

//       setCredentials({ user: data.user, token: data.token });
//       toast.success(`Welcome back, ${data.user.name}! 👋`);
//       navigate(data.user.role === 'salon_owner' ? '/owner/dashboard' : '/');
//     } catch (err) {
//       setError(extractErrorMessage(err, 'Login failed. Please check your credentials.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ══════════════════════════════════════════════════════════════════════════
//   // SIGNUP handler (quick version inside the login card)
//   // ══════════════════════════════════════════════════════════════════════════
//   const handleSignup = async (e) => {
//     e.preventDefault();
//     clearMsgs();

//     // Validate
//     if (!name.trim() || name.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
//     if (!isValidEmail(email))                    { setError('Enter a valid email address.');        return; }
//     if (!isValidPhone(phone))                    { setError('Enter a valid 10-digit mobile number.');return; }
//     if (!isValidPassword(password))              { setError('Password: min 6 characters including at least one number.'); return; }

//     setLoading(true);
//     try {
//       const { data } = await registerAPI({
//         name:     name.trim(),
//         email:    email.trim().toLowerCase(),
//         phone:    phone.trim(),
//         password,
//       });
//       setUserId(data.userId);
//       setStep('otp');
//       startTimer();
//       toast.success('OTP sent to your email!');
//     } catch (err) {
//       // Unverified account exists — take them to OTP
//       if (err?.response?.data?.userId) {
//         setUserId(err.response.data.userId);
//         setInfo('Account exists but not verified. Check your email for the OTP.');
//         setStep('otp');
//         startTimer();
//         return;
//       }
//       if (err?.response?.status === 409)
//         setError('An account with this email or phone already exists. Try logging in.');
//       else
//         setError(extractErrorMessage(err, 'Registration failed. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ══════════════════════════════════════════════════════════════════════════
//   // VERIFY OTP handler
//   // ══════════════════════════════════════════════════════════════════════════
//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     clearMsgs();
//     if (otp.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }

//     setLoading(true);
//     try {
//       const { data } = await verifyEmailAPI({ userId, otp });
//       setCredentials({ user: data.user, token: data.token });

//       // Google users who signed up but haven't added phone
//       if (data.requiresPhone) { setStep('phone'); return; }

//       toast.success('Welcome to MYSALON! 🎉');
//       navigate(data.user.role === 'salon_owner' ? '/owner/register-salon' : '/');
//     } catch (err) {
//       setError(extractErrorMessage(err, 'Invalid or expired OTP. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ══════════════════════════════════════════════════════════════════════════
//   // RESEND OTP handler
//   // ══════════════════════════════════════════════════════════════════════════
//   const handleResend = async () => {
//     clearMsgs();
//     setLoading(true);
//     try {
//       const { data } = await resendOtpAPI(userId);
//       setInfo(data.message || 'New OTP sent to your email.');
//       startTimer();
//     } catch (err) {
//       setError(extractErrorMessage(err, 'Could not resend OTP. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ══════════════════════════════════════════════════════════════════════════
//   // GOOGLE handler
//   // ══════════════════════════════════════════════════════════════════════════
//   const handleGoogle = async () => {
//     clearMsgs();
//     setLoading(true);
//     try {
//       const { idToken }  = await signInWithGoogle();
//       const { data }     = await googleSignInAPI(idToken);
//       setCredentials({ user: data.user, token: data.token });

//       if (data.requiresPhone) { setStep('phone'); return; }

//       toast.success(data.isNewUser ? 'Account created! Welcome 🎉' : `Welcome back, ${data.user.name}!`);
//       navigate(data.user.role === 'salon_owner' ? '/owner/dashboard' : '/');
//     } catch (err) {
//       // User closed the popup — not an error
//       if (
//         err?.code === 'auth/popup-closed-by-user' ||
//         err?.code === 'auth/cancelled-popup-request'
//       ) {
//         setLoading(false);
//         return;
//       }
//       if (err?.code?.startsWith('auth/'))
//         setError('Google sign-in failed. Please check Firebase is configured.');
//       else
//         setError(extractErrorMessage(err, 'Google sign-in failed. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ══════════════════════════════════════════════════════════════════════════
//   // COMPLETE PROFILE handler (Google users — add phone number)
//   // ══════════════════════════════════════════════════════════════════════════
//   const handleCompleteProfile = async (e) => {
//     e.preventDefault();
//     clearMsgs();
//     if (!isValidPhone(phone)) {
//       setError('Enter a valid 10-digit Indian mobile number (starts with 6–9).');
//       return;
//     }
//     setLoading(true);
//     try {
//       await completeProfileAPI({ phone });
//       toast.success('Profile complete! Welcome to MYSALON 🎉');
//       navigate('/');
//     } catch (err) {
//       setError(extractErrorMessage(err, 'Failed to save phone number. Please try again.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ══════════════════════════════════════════════════════════════════════════
//   // RENDER — OTP screen
//   // ══════════════════════════════════════════════════════════════════════════
//   if (step === 'otp') return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
//       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm p-8">

//         {/* Logo */}
//         <h1 className="text-2xl font-bold text-center mb-1">
//           <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
//         </h1>
//         <p className="text-center text-sm text-gray-400 mb-6">Verify your email</p>

//         {/* Email icon */}
//         <div className="text-center mb-6">
//           <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-3">
//             📧
//           </div>
//           <p className="text-sm text-gray-600 leading-relaxed">
//             We sent a 6-digit OTP to<br />
//             <strong className="text-primary">{email}</strong>
//           </p>
//         </div>

//         <ErrorBanner message={error} />
//         <InfoBanner  message={info}  />

//         <form onSubmit={handleVerifyOtp} noValidate>
//           <label className="block text-xs font-medium text-gray-600 mb-1.5">
//             Enter OTP
//           </label>
//           <input
//             type="text"
//             inputMode="numeric"
//             maxLength={6}
//             value={otp}
//             onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); clearMsgs(); }}
//             placeholder="● ● ● ● ● ●"
//             className="w-full border-2 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-widest outline-none transition-all border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 mb-2"
//           />

//           {/* Progress bar — fills as digits are typed */}
//           <div className="flex gap-1.5 mb-5">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
//                   i < otp.length ? 'bg-primary' : 'bg-gray-200'
//                 }`}
//               />
//             ))}
//           </div>

//           <SubmitBtn
//             loading={loading}
//             label="Verify OTP"
//             loadingLabel="Verifying…"
//           />
//         </form>

//         {/* Resend */}
//         <div className="text-center mt-4 text-sm text-gray-500">
//           {resendSec > 0 ? (
//             <span>Resend in <strong className="text-primary">{resendSec}s</strong></span>
//           ) : (
//             <button
//               onClick={handleResend}
//               disabled={loading}
//               className="text-primary font-medium hover:underline disabled:opacity-50"
//             >
//               Resend OTP
//             </button>
//           )}
//         </div>

//         {/* Back */}
//         <button
//           onClick={() => { setStep('form'); setOtp(''); clearMsgs(); }}
//           className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 transition"
//         >
//           ← Back to {tab === 'signup' ? 'sign up' : 'login'}
//         </button>
//       </div>
//     </div>
//   );

//   // ══════════════════════════════════════════════════════════════════════════
//   // RENDER — Phone screen (Google users who haven't added phone)
//   // ══════════════════════════════════════════════════════════════════════════
//   if (step === 'phone') return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
//       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
//         <h1 className="text-2xl font-bold text-center mb-1">
//           <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
//         </h1>

//         <div className="text-center my-6">
//           <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-3">
//             📱
//           </div>
//           <h2 className="text-lg font-semibold mb-1">One Last Step</h2>
//           <p className="text-sm text-gray-500">Add your phone number to receive booking reminders.</p>
//         </div>

//         <ErrorBanner message={error} />

//         <form onSubmit={handleCompleteProfile} noValidate>
//           <Field
//             label="Phone Number"
//             type="tel"
//             value={phone}
//             onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearMsgs(); }}
//             placeholder="10-digit mobile number"
//             required
//           />
//           <p className="text-xs text-gray-400 mb-5 -mt-2">
//             Indian number starting with 6, 7, 8 or 9
//           </p>
//           <SubmitBtn loading={loading} label="Complete & Continue" loadingLabel="Saving…" />
//         </form>
//       </div>
//     </div>
//   );

//   // ══════════════════════════════════════════════════════════════════════════
//   // RENDER — Main login / signup card with tab switcher
//   // ══════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
//       <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm p-8">

//         {/* Logo */}
//         <h1 className="text-2xl font-bold text-center mb-6">
//           <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
//         </h1>

//         {/* ── Tab switcher — Login / Sign Up ─────────────────────────────── */}
//         <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
//           {['login', 'signup'].map((t) => (
//             <button
//               key={t}
//               type="button"
//               onClick={() => switchTab(t)}
//               className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
//                 tab === t
//                   ? 'bg-white text-primary shadow-sm'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               {t === 'login' ? 'Login' : 'Sign Up'}
//             </button>
//           ))}
//         </div>

//         <ErrorBanner message={error} />
//         <InfoBanner  message={info}  />

//         {/* Google button */}
//         <GoogleBtn onClick={handleGoogle} loading={loading} />

//         <Divider />

//         {/* ══════════════════════════════════════════════════════════════════
//             LOGIN FORM
//         ══════════════════════════════════════════════════════════════════ */}
//         {tab === 'login' && (
//           <form onSubmit={handleLogin} noValidate>
//             <Field
//               label="Email Address"
//               type="email"
//               value={email}
//               onChange={(e) => { setEmail(e.target.value); clearMsgs(); }}
//               placeholder="rahul@email.com"
//               required
//             />

//             <Field
//               label="Password"
//               type={showPw ? 'text' : 'password'}
//               value={password}
//               onChange={(e) => { setPassword(e.target.value); clearMsgs(); }}
//               placeholder="Your password"
//               required
//               rightElement={
//                 <button
//                   type="button"
//                   onClick={() => setShowPw((v) => !v)}
//                   className="text-xs text-gray-400 hover:text-gray-600 font-medium"
//                 >
//                   {showPw ? 'Hide' : 'Show'}
//                 </button>
//               }
//             />

//             {/* Forgot password link */}
//             <div className="text-right -mt-2 mb-5">
//               <Link
//                 to="/forgot-password"
//                 className="text-xs text-primary hover:underline font-medium"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             <SubmitBtn loading={loading} label="Login" loadingLabel="Logging in…" />
//           </form>
//         )}

//         {/* ══════════════════════════════════════════════════════════════════
//             SIGNUP FORM (quick inside the login card)
//             For full split-screen experience → /signup page
//         ══════════════════════════════════════════════════════════════════ */}
//         {tab === 'signup' && (
//           <form onSubmit={handleSignup} noValidate>
//             <Field
//               label="Full Name"
//               value={name}
//               onChange={(e) => { setName(e.target.value); clearMsgs(); }}
//               placeholder="Rahul Kumar"
//               required
//             />

//             <Field
//               label="Email Address"
//               type="email"
//               value={email}
//               onChange={(e) => { setEmail(e.target.value); clearMsgs(); }}
//               placeholder="rahul@email.com"
//               required
//             />

//             <Field
//               label="Phone Number"
//               type="tel"
//               value={phone}
//               onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearMsgs(); }}
//               placeholder="10-digit mobile number"
//               required
//             />

//             <Field
//               label="Password"
//               type={showPw ? 'text' : 'password'}
//               value={password}
//               onChange={(e) => { setPassword(e.target.value); clearMsgs(); }}
//               placeholder="Min 6 chars + one number"
//               required
//               rightElement={
//                 <button
//                   type="button"
//                   onClick={() => setShowPw((v) => !v)}
//                   className="text-xs text-gray-400 hover:text-gray-600 font-medium"
//                 >
//                   {showPw ? 'Hide' : 'Show'}
//                 </button>
//               }
//             />

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-primary hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-1"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Creating Account…
//                 </span>
//               ) : 'Create Account'}
//             </button>

//             {/* Link to full registration page */}
//             <p className="text-center text-xs text-gray-400 mt-3">
//               Want more options?{' '}
//               <Link to="/signup" className="text-primary font-medium hover:underline">
//                 Full sign up →
//               </Link>
//             </p>
//           </form>
//         )}

//         {/* Bottom switch link */}
//         <p className="text-center text-xs text-gray-400 mt-5">
//           {tab === 'login'
//             ? "Don't have an account? "
//             : 'Already have an account? '}
//           <button
//             type="button"
//             onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
//             className="text-primary font-medium hover:underline"
//           >
//             {tab === 'login' ? 'Sign up' : 'Login'}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }

import { useState }          from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast }             from 'react-toastify';
import { useAuth }           from '../context/AuthContext';
import { signInWithGoogle }  from '../services/firebase';
import {
  loginAPI,
  verifyEmailAPI,
  resendOtpAPI,
  googleSignInAPI,
  completeProfileAPI,
} from '../services/api';
import { isValidEmail, isValidPhone } from '../utils/validators';

// ── Error extractor ───────────────────────────────────────────────────────────
function extractErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  const serverMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error   ||
    err?.response?.data?.msg;
  if (serverMsg) return serverMsg;
  const status = err?.response?.status;
  if (status === 401) return 'Incorrect email or password.';
  if (status === 403) return 'Account access denied. Contact support.';
  if (status === 404) return 'No account found with this email.';
  if (status === 409) return 'An account with this email already exists.';
  if (status === 429) return 'Too many attempts. Please wait and try again.';
  if (status === 422) return 'Please check your details and try again.';
  if (status >= 500)  return 'Server error. Please try again later.';
  if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK')
    return 'No internet connection. Please check your network.';
  if (err?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return err?.message || fallback;
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS — defined OUTSIDE to prevent remount bug
// ══════════════════════════════════════════════════════════════════════════════

function Field({ label, type = 'text', value, onChange, placeholder, required, rightElement }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full border border-gray-300 rounded-xl py-3 pl-4 pr-12 text-sm outline-none transition-all bg-white focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleBtn({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6.1C12.4 13.2 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
        <path fill="#FBBC05" d="M10.5 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.7 2.2-7.7 2.2-6.3 0-11.6-3.7-13.5-9l-7.9 6.2C6.7 42.6 14.7 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function Divider({ text = 'or' }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">{text}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 mb-4 border border-red-100">
      <span className="mt-0.5 flex-shrink-0">⚠️</span>
      <p>{message}</p>
    </div>
  );
}

function InfoBanner({ message }) {
  if (!message) return null;
  return (
    <p className="text-green-700 text-sm bg-green-50 rounded-xl px-4 py-3 mb-4 border border-green-100">
      {message}
    </p>
  );
}

function SubmitBtn({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-primary hover:bg-primary-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const { setCredentials } = useAuth();
  const navigate           = useNavigate();

  // 'login' tab only — Sign Up tab just shows a redirect card
  const [tab,  setTab]  = useState('login');
  const [step, setStep] = useState('form');   // 'form' | 'otp' | 'phone'

  // Login fields
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);

  // OTP / phone fields
  const [otp,       setOtp]       = useState('');
  const [userId,    setUserId]    = useState(null);
  const [resendSec, setResendSec] = useState(0);
  const [phone,     setPhone]     = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [info,    setInfo]    = useState('');

  const clearMsgs = () => { setError(''); setInfo(''); };

  // 60-second resend countdown
  const startTimer = () => {
    setResendSec(60);
    const t = setInterval(() => {
      setResendSec((prev) => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const switchTab = (t) => {
    setTab(t);
    setStep('form');
    clearMsgs();
    setOtp('');
    setUserId(null);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN
  // ══════════════════════════════════════════════════════════════════════════
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMsgs();
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!password)             { setError('Password is required.');        return; }

    setLoading(true);
    try {
      const { data } = await loginAPI({ email: email.trim().toLowerCase(), password });

      if (data.requiresVerification) {
        setUserId(data.userId);
        setStep('otp');
        startTimer();
        setInfo('Please verify your email. A new OTP has been sent.');
        return;
      }

      setCredentials({ user: data.user, token: data.token });
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate(data.user.role === 'salon_owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // GOOGLE
  // ══════════════════════════════════════════════════════════════════════════
  const handleGoogle = async () => {
    clearMsgs();
    setLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      const { data }    = await googleSignInAPI(idToken);
      setCredentials({ user: data.user, token: data.token });

      if (data.requiresPhone) { setStep('phone'); return; }

      toast.success(data.isNewUser ? 'Account created! Welcome 🎉' : `Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'salon_owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setLoading(false); return;
      }
      if (err?.code?.startsWith('auth/'))
        setError('Google sign-in failed. Please check Firebase is configured.');
      else
        setError(extractErrorMessage(err, 'Google sign-in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VERIFY OTP
  // ══════════════════════════════════════════════════════════════════════════
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMsgs();
    if (otp.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const { data } = await verifyEmailAPI({ userId, otp });
      setCredentials({ user: data.user, token: data.token });
      if (data.requiresPhone) { setStep('phone'); return; }
      toast.success('Email verified! Welcome to MYSALON 🎉');
      navigate(data.user.role === 'salon_owner' ? '/owner/register-salon' : '/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid or expired OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RESEND OTP
  // ══════════════════════════════════════════════════════════════════════════
  const handleResend = async () => {
    clearMsgs();
    setLoading(true);
    try {
      const { data } = await resendOtpAPI(userId);
      setInfo(data.message || 'New OTP sent to your email.');
      startTimer();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not resend OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // COMPLETE PROFILE (Google — add phone)
  // ══════════════════════════════════════════════════════════════════════════
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    clearMsgs();
    if (!isValidPhone(phone)) {
      setError('Enter a valid 10-digit Indian mobile number (starts with 6–9).');
      return;
    }
    setLoading(true);
    try {
      await completeProfileAPI({ phone });
      toast.success('Profile complete! Welcome to MYSALON 🎉');
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save phone number. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — OTP screen
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'otp') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-1">
          <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">Verify your email</p>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-3">
            📧
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            We sent a 6-digit OTP to<br />
            <strong className="text-primary">{email}</strong>
          </p>
        </div>

        <ErrorBanner message={error} />
        <InfoBanner  message={info}  />

        <form onSubmit={handleVerifyOtp} noValidate>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Enter OTP</label>
          <input
            type="text" inputMode="numeric" maxLength={6} value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); clearMsgs(); }}
            placeholder="● ● ● ● ● ●"
            className="w-full border-2 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-widest outline-none transition-all border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 mb-2"
          />
          {/* OTP fill progress */}
          <div className="flex gap-1.5 mb-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i < otp.length ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
          <SubmitBtn loading={loading} label="Verify OTP" loadingLabel="Verifying…" />
        </form>

        <div className="text-center mt-4 text-sm text-gray-500">
          {resendSec > 0 ? (
            <span>Resend in <strong className="text-primary">{resendSec}s</strong></span>
          ) : (
            <button onClick={handleResend} disabled={loading}
              className="text-primary font-medium hover:underline disabled:opacity-50">
              Resend OTP
            </button>
          )}
        </div>
        <button onClick={() => { setStep('form'); setOtp(''); clearMsgs(); }}
          className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 transition">
          ← Back to login
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — Phone screen (Google users)
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'phone') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-1">
          <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
        </h1>
        <div className="text-center my-6">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-3">📱</div>
          <h2 className="text-lg font-semibold mb-1">One Last Step</h2>
          <p className="text-sm text-gray-500">Add your phone number to receive booking reminders.</p>
        </div>
        <ErrorBanner message={error} />
        <form onSubmit={handleCompleteProfile} noValidate>
          <Field label="Phone Number" type="tel" value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearMsgs(); }}
            placeholder="10-digit mobile number" required />
          <p className="text-xs text-gray-400 mb-5 -mt-2">Indian number starting with 6, 7, 8 or 9</p>
          <SubmitBtn loading={loading} label="Complete & Continue" loadingLabel="Saving…" />
        </form>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — Main card
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm p-8">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-center mb-6">
          <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
        </h1>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {['login', 'signup'].map((t) => (
            <button key={t} type="button" onClick={() => switchTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* ── LOGIN TAB ──────────────────────────────────────────────────────── */}
        {tab === 'login' && (
          <>
            <ErrorBanner message={error} />
            <InfoBanner  message={info}  />

            <GoogleBtn onClick={handleGoogle} loading={loading} />
            <Divider />

            <form onSubmit={handleLogin} noValidate>
              <Field label="Email Address" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); clearMsgs(); }}
                placeholder="rahul@email.com" required />

              <Field label="Password"
                type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); clearMsgs(); }}
                placeholder="Your password" required
                rightElement={
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="text-xs text-gray-400 hover:text-gray-600 font-medium">
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                }
              />

              <div className="text-right -mt-2 mb-5">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <SubmitBtn loading={loading} label="Login" loadingLabel="Logging in…" />
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              Don't have an account?{' '}
              <button type="button" onClick={() => switchTab('signup')}
                className="text-primary font-medium hover:underline">
                Sign up
              </button>
            </p>
          </>
        )}

        {/* ── SIGN UP TAB — redirect to full SignupPage ──────────────────────── */}
        {tab === 'signup' && (
          <div className="text-center py-2">
            {/* Google sign up */}
            <ErrorBanner message={error} />
            <GoogleBtn onClick={handleGoogle} loading={loading} />

            <Divider text="or create account with email" />

            {/* Prompt to go to full signup page */}
            <div className="bg-primary-50 border border-primary/20 rounded-2xl p-5 mb-4">
              <div className="text-3xl mb-2">✂️</div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Create your MYSALON account
              </p>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Sign up as a <strong>Customer</strong> to book salons, or as a{' '}
                <strong>Salon Owner</strong> to list your salon and manage your queue.
              </p>

              {/* Two clear CTA buttons */}
              <div className="flex flex-col gap-2">
                <Link
                  to="/signup"
                  className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-dark transition active:scale-[0.98] text-center block"
                >
                  👤 Sign Up as Customer
                </Link>
                <Link
                  to="/signup?role=salon_owner"
                  className="w-full bg-secondary-50 text-secondary-dark border border-secondary/30 py-3 rounded-xl text-sm font-bold hover:bg-secondary/10 transition active:scale-[0.98] text-center block"
                >
                  ✂️ Register Your Salon
                </Link>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <button type="button" onClick={() => switchTab('login')}
                className="text-primary font-medium hover:underline">
                Login here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}