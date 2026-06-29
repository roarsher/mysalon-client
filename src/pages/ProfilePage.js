import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast }       from 'react-toastify';
import { useAuth }     from '../context/AuthContext';
import { updateProfile, updateProfilePhoto } from '../services/api';
import Spinner from '../components/common/Spinner';

export default function ProfilePage() {
  const { currentUser, setCredentials, logout } = useAuth();
  const navigate = useNavigate();

  const [editing,  setEditing]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form,     setForm]     = useState({
    name:  currentUser?.name  || '',
    phone: currentUser?.phone || '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setLoading(true);
    try {
      const res = await updateProfile(form);
      setCredentials({ user: res.data.data, token: localStorage.getItem('mysalon_token') });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB.'); return; }
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res = await updateProfilePhoto(fd);
      setCredentials({ user: res.data.data, token: localStorage.getItem('mysalon_token') });
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.message || 'Photo upload failed.');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/login');
  };

  if (!currentUser) return <Spinner />;

  const initials = currentUser.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h1>

      {/* Avatar */}
      <div className="card p-6 text-center mb-4">
        <div className="relative w-20 h-20 mx-auto mb-3">
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {initials}
            </div>
          )}
          {/* Change photo button */}
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer text-xs hover:bg-primary-dark transition shadow">
            📷
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

        <h2 className="font-semibold text-lg text-gray-900">{currentUser.name}</h2>
        <p className="text-sm text-gray-400">{currentUser.email}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`badge text-xs ${currentUser.role === 'salon_owner' ? 'bg-primary-50 text-primary' : 'bg-secondary-50 text-secondary-dark'}`}>
            {currentUser.role === 'salon_owner' ? '✂️ Salon Owner' : '👤 Customer'}
          </span>
          {currentUser.isEmailVerified && (
            <span className="badge text-xs bg-green-100 text-green-700">✓ Verified</span>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Personal Info</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">Edit</button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="10-digit mobile" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-2 text-sm">
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline flex-1 py-2 text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="font-medium text-gray-800">{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="font-medium text-gray-800">{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone</span>
              <span className="font-medium text-gray-800">{currentUser.phone || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="card divide-y divide-gray-100 mb-4">
        <button onClick={() => navigate('/my-bookings')}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
          <span>📋 My Bookings</span><span className="text-gray-300">›</span>
        </button>
        {currentUser.role === 'salon_owner' && (
          <button onClick={() => navigate('/owner/dashboard')}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
            <span>✂️ Owner Dashboard</span><span className="text-gray-300">›</span>
          </button>
        )}
         
        <button onClick={() => navigate('/forgot-password')}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
          <span>🔒 Change Password</span><span className="text-gray-300">›</span>
        </button>
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition">
        🚪 Logout
      </button>
    </div>
  );
}