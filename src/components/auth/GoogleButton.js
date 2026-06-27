import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithGoogle } from '../../services/firebase';
import { syncUser } from '../../services/api';
import { toast } from 'react-toastify';

const GoogleButton = ({ label = 'Continue with Google', role = 'user' }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const handleGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      await syncUser({ name: result.user.displayName, role });
      toast.success(`Welcome, ${result.user.displayName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      className="w-full flex items-center justify-center gap-3 border border-gray-300
                 rounded-xl py-2.5 text-sm font-medium text-gray-700
                 hover:bg-gray-50 transition active:scale-[0.98]"
    >
      {/* Official Google colour SVG */}
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 37.1 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6l6.2 5.2C40.6 36.1 44 30.5 44 24c0-1.3-.1-2.7-.4-4z"/>
      </svg>
      {label}
    </button>
  );
};

export default GoogleButton;