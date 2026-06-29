 import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  getAdminSalons, verifySalon,
  getAdminUsers, updateUserStatus, updateUserRole,
  getAdminRevenue, getAdminBookings, flagBooking,
  refundOverride, updateBookingStatus,
} from '../../services/api';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}


const ROLE_BADGE = {
  user:        'bg-gray-100 text-gray-600',
  salon_owner: 'bg-blue-100 text-blue-700',
  admin:       'bg-purple-100 text-purple-700',
};

const STATUS_BADGE = {
  pending:     'bg-yellow-100 text-yellow-700',
  confirmed:   'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
  no_show:     'bg-red-100 text-red-500',
};

function StatCard({ icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary',
    green:   'bg-green-50 text-green-600',
    orange:  'bg-orange-50 text-orange-600',
    red:     'bg-red-50 text-red-600',
    purple:  'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniChart({ data, valueKey = 'count' }) {
  if (!data?.length) return <p className="text-sm text-gray-400 text-center py-6">No data yet</p>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1 h-20 mt-2">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-primary rounded-sm transition-all"
            style={{ height: `${Math.max(4, (d[valueKey] / max) * 64)}px` }}
            title={`${d._id}: ${d[valueKey]}`}
          />
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'overview',  label: '📊 Overview'  },
  { id: 'salons',    label: '✂️ Salons'    },
  { id: 'users',     label: '👥 Users'     },
  { id: 'revenue',   label: '💰 Revenue'   },
  { id: 'disputes',  label: '🚨 Disputes'  },
];

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
//   const navigate = useNavigate();
  const [tab,     setTab]     = useState('overview');
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (currentUser && currentUser.role !== 'admin') {
    navigate('/');
  }
}, [currentUser, navigate]);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Could not load stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-0.5">MySalon control centre</p>
        </div>
        <span className="badge bg-purple-100 text-purple-700 text-xs px-3 py-1">🔐 Admin</span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-2 mb-6 border-b border-gray-100">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        loading
          ? <div className="text-center py-20 text-gray-400">Loading…</div>
          : !stats
          ? <div className="text-center py-20 text-gray-400">No data available</div>
          : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon="👥" label="Total Users"    value={stats.users.total}                          color="primary" />
                <StatCard icon="✂️" label="Total Salons"   value={stats.salons.total}                         sub={`${stats.salons.pending} pending`} color="orange" />
                <StatCard icon="📋" label="Total Bookings" value={stats.bookings.total}                       sub={`${stats.bookings.completed} completed`} color="green" />
                <StatCard icon="💰" label="Platform Fees"  value={formatPrice(stats.revenue.platformFees)}    color="purple" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">GMV</h3>
                  <p className="text-3xl font-bold text-primary">{formatPrice(stats.revenue.gmv)}</p>
                  <p className="text-xs text-gray-400 mt-1">From completed bookings</p>
                </div>
                <div className="card p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">GST Collected</h3>
                  <p className="text-3xl font-bold text-green-600">{formatPrice(stats.revenue.gstCollected)}</p>
                  <p className="text-xs text-gray-400 mt-1">Total tax collected</p>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-semibold text-gray-800 mb-1">Bookings — Last 7 Days</h3>
                <MiniChart data={stats.trend} valueKey="count" />
              </div>

              {stats.salons.pending > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="font-semibold text-orange-800">{stats.salons.pending} salon{stats.salons.pending !== 1 ? 's' : ''} awaiting verification</p>
                      <p className="text-xs text-orange-600">Review and approve or reject</p>
                    </div>
                  </div>
                  <button onClick={() => setTab('salons')} className="text-sm bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition">
                    Review →
                  </button>
                </div>
              )}
            </div>
          )
      )}

      {tab === 'salons'   && <SalonVerificationTab />}
      {tab === 'users'    && <UserManagementTab />}
      {tab === 'revenue'  && <RevenueTab />}
      {tab === 'disputes' && <DisputesTab />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SALON VERIFICATION
// ══════════════════════════════════════════════════════════════════════════════
function SalonVerificationTab() {
  const [salons,       setSalons]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('pending');
  const [search,       setSearch]       = useState('');
  const [acting,       setActing]       = useState(null);
  const [rejectModal,  setRejectModal]  = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSalons({ status: filter, search });
      setSalons(res.data.data || []);
    } catch { toast.error('Could not load salons.'); }
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (salon, action, reason = '') => {
    setActing(salon._id);
    try {
      await verifySalon(salon._id, { action, reason });
      toast.success(action === 'approve' ? `${salon.name} approved!` : `${salon.name} rejected.`);
      load();
    } catch { toast.error('Action failed.'); }
    finally { setActing(null); setRejectModal(null); setRejectReason(''); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {['pending','verified','all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40'}`}>
            {f}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search salons…"
          className="ml-auto border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary" />
      </div>

      {loading
        ? <div className="text-center py-16 text-gray-400">Loading…</div>
        : salons.length === 0
        ? <div className="text-center py-16"><div className="text-4xl mb-2">✂️</div><p className="text-gray-400">No salons found</p></div>
        : (
          <div className="space-y-3">
            {salons.map(salon => (
              <div key={salon._id} className="card p-4">
                <div className="flex gap-3">
                  {salon.coverImage?.url
                    ? <img src={salon.coverImage.url} alt={salon.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">✂️</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{salon.name}</p>
                        <p className="text-xs text-gray-400">{salon.address?.city} · {salon.category}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Owner: {salon.owner?.name} · {salon.owner?.email}</p>
                        <p className="text-xs text-gray-400">Registered {timeAgo(salon.createdAt)}</p>
                      </div>
                      <span className={`badge text-xs flex-shrink-0 ${salon.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {salon.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>

                    {salon.verificationReason && (
                      <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded-lg">❌ {salon.verificationReason}</p>
                    )}

                    {!salon.isVerified ? (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleVerify(salon, 'approve')} disabled={acting === salon._id}
                          className="flex-1 bg-green-500 text-white text-xs py-2 rounded-xl hover:bg-green-600 disabled:opacity-50 transition font-semibold">
                          {acting === salon._id ? '…' : '✅ Approve'}
                        </button>
                        <button onClick={() => { setRejectModal(salon); setRejectReason(''); }} disabled={acting === salon._id}
                          className="flex-1 border border-red-200 text-red-500 text-xs py-2 rounded-xl hover:bg-red-50 disabled:opacity-50 transition font-semibold">
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setRejectModal(salon)} className="mt-2 text-xs text-red-400 hover:underline">
                        Revoke verification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">Reject: {rejectModal.name}</h3>
            <p className="text-xs text-gray-400 mb-4">Provide a reason so the owner knows what to fix.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              rows={3} placeholder="e.g. Incomplete address, blurry photos…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setRejectModal(null)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={() => handleVerify(rejectModal, 'reject', rejectReason)}
                disabled={!rejectReason.trim() || acting === rejectModal._id}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition">
                {acting === rejectModal._id ? '…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
function UserManagementTab() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [acting,  setActing]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ search, role });
      setUsers(res.data.data || []);
    } catch { toast.error('Could not load users.'); }
    finally { setLoading(false); }
  }, [search, role]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (user, action) => {
    setActing(user._id);
    try {
      await updateUserStatus(user._id, { action });
      toast.success(`User ${action}ed.`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: action === 'unblock' } : u));
    } catch { toast.error('Action failed.'); }
    finally { setActing(null); }
  };

  const handleRole = async (user, newRole) => {
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    setActing(user._id);
    try {
      await updateUserRole(user._id, { role: newRole });
      toast.success(`Role updated to ${newRole}.`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
    } catch { toast.error('Action failed.'); }
    finally { setActing(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…"
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary flex-1 min-w-[200px]" />
        <select value={role} onChange={e => setRole(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary">
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="salon_owner">Owners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading
        ? <div className="text-center py-16 text-gray-400">Loading…</div>
        : users.length === 0
        ? <div className="text-center py-16 text-gray-400">No users found</div>
        : (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user._id} className={`card p-4 flex items-center gap-3 ${!user.isActive ? 'opacity-60' : ''}`}>
                {user.photoURL
                  ? <img src={user.photoURL} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {user.name?.slice(0,2).toUpperCase()}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <span className={`badge text-xs ${ROLE_BADGE[user.role]}`}>{user.role}</span>
                    {!user.isActive && <span className="badge text-xs bg-red-100 text-red-500">Blocked</span>}
                    {!user.isEmailVerified && <span className="badge text-xs bg-yellow-100 text-yellow-600">Unverified</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400">Joined {timeAgo(user.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => handleStatus(user, user.isActive ? 'block' : 'unblock')}
                    disabled={acting === user._id}
                    className={`text-xs px-3 py-1 rounded-lg border transition font-medium disabled:opacity-50 ${
                      user.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                    }`}>
                    {acting === user._id ? '…' : user.isActive ? 'Block' : 'Unblock'}
                  </button>
                  <select value={user.role} onChange={e => handleRole(user, e.target.value)}
                    disabled={acting === user._id}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none disabled:opacity-50">
                    <option value="user">User</option>
                    <option value="salon_owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REVENUE
// ══════════════════════════════════════════════════════════════════════════════
function RevenueTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('daily');

  useEffect(() => {
    setLoading(true);
    getAdminRevenue({ period })
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Could not load revenue.'))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {['daily','weekly','monthly'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${period === p ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40'}`}>
            {p}
          </button>
        ))}
      </div>

      {loading
        ? <div className="text-center py-16 text-gray-400">Loading…</div>
        : !data ? null
        : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4">
                <p className="text-xs text-gray-400 mb-1">GMV (period)</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(data.chart.reduce((s,d) => s + d.gmv, 0))}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-400 mb-1">Platform Fees</p>
                <p className="text-2xl font-bold text-purple-600">{formatPrice(data.chart.reduce((s,d) => s + d.platformFees, 0))}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-400 mb-1">Online Payments</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(data.payments.total)}</p>
                <p className="text-xs text-gray-400">{data.payments.count} transactions</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-400 mb-1">Refunds Issued</p>
                <p className="text-2xl font-bold text-red-500">{formatPrice(data.payments.refunded)}</p>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Bookings Trend</h3>
              <MiniChart data={data.chart} valueKey="count" />
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Top Earning Salons</h3>
              {data.topSalons.length === 0
                ? <p className="text-sm text-gray-400">No data yet</p>
                : (
                  <div className="space-y-2">
                    {data.topSalons.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary-50 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{s.salon?.name}</p>
                            <p className="text-xs text-gray-400">{s.bookings} bookings</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{formatPrice(s.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Top Services</h3>
              {data.topServices.length === 0
                ? <p className="text-sm text-gray-400">No data yet</p>
                : (
                  <div className="space-y-2">
                    {data.topServices.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-4">{i+1}.</span>
                          <p className="text-sm text-gray-700">{s._id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">{s.count}x</p>
                          <p className="text-xs text-gray-400">{formatPrice(s.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </>
        )
      }
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DISPUTES
// ══════════════════════════════════════════════════════════════════════════════
function DisputesTab() {
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [status,       setStatus]       = useState('');
  const [flagged,      setFlagged]      = useState(false);
  const [acting,       setActing]       = useState(null);
  const [refundModal,  setRefundModal]  = useState(null);
  const [refundAmt,    setRefundAmt]    = useState('');
  const [refundReason, setRefundReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminBookings({ search, status, flagged: flagged ? 'true' : '' });
      setBookings(res.data.data || []);
    } catch { toast.error('Could not load bookings.'); }
    finally { setLoading(false); }
  }, [search, status, flagged]);

  useEffect(() => { load(); }, [load]);

  const handleFlag = async (booking) => {
    const reason = window.prompt('Flag reason:', 'Customer dispute');
    if (!reason) return;
    setActing(booking._id);
    try {
      await flagBooking(booking._id, { reason });
      toast.success('Booking flagged.');
      load();
    } catch { toast.error('Failed.'); }
    finally { setActing(null); }
  };

  const handleRefundOverride = async () => {
    if (!refundAmt || !refundReason) { toast.error('Amount and reason required.'); return; }
    setActing(refundModal._id);
    try {
      await refundOverride(refundModal._id, { amount: Number(refundAmt), reason: refundReason });
      toast.success('Refund override recorded.');
      setRefundModal(null); setRefundAmt(''); setRefundReason('');
      load();
    } catch { toast.error('Failed.'); }
    finally { setActing(null); }
  };

  const handleStatusChange = async (booking, newStatus) => {
    if (!window.confirm(`Change to ${newStatus}?`)) return;
    setActing(booking._id);
    try {
      await updateBookingStatus(booking._id, { bookingStatus: newStatus });
      toast.success('Status updated.');
      load();
    } catch { toast.error('Failed.'); }
    finally { setActing(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token, customer…"
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary flex-1 min-w-[180px]" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary">
          <option value="">All status</option>
          {['pending','confirmed','in_progress','completed','cancelled','no_show'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button onClick={() => setFlagged(f => !f)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${flagged ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200 hover:border-red-300'}`}>
          🚨 {flagged ? 'Showing flagged' : 'Show flagged'}
        </button>
      </div>

      {loading
        ? <div className="text-center py-16 text-gray-400">Loading…</div>
        : bookings.length === 0
        ? <div className="text-center py-16 text-gray-400">No bookings found</div>
        : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b._id} className={`card p-4 ${b.isFlagged ? 'border-l-4 border-l-red-400' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{b.tokenNumber}</span>
                      <span className={`badge text-xs ${STATUS_BADGE[b.bookingStatus] || 'bg-gray-100 text-gray-500'}`}>{b.bookingStatus}</span>
                      {b.isFlagged && <span className="badge text-xs bg-red-100 text-red-600">🚨 Flagged</span>}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{b.user?.name} → {b.salon?.name}</p>
                    <p className="text-xs text-gray-400">{b.user?.email} · {timeAgo(b.createdAt)}</p>
                    {b.flagReason && <p className="text-xs text-red-500 mt-1">Flag: {b.flagReason}</p>}
                    {b.adminNote  && <p className="text-xs text-blue-500 mt-1">Note: {b.adminNote}</p>}
                  </div>
                  <p className="font-bold text-gray-900 text-sm flex-shrink-0">{formatPrice(b.totalAmount)}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {!b.isFlagged && (
                    <button onClick={() => handleFlag(b)} disabled={acting === b._id}
                      className="text-xs border border-red-200 text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-50 transition disabled:opacity-50">
                      🚨 Flag
                    </button>
                  )}
                  <button onClick={() => { setRefundModal(b); setRefundAmt(String(b.totalAmount)); setRefundReason(''); }}
                    className="text-xs border border-blue-200 text-blue-600 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition">
                    ↩ Refund Override
                  </button>
                  <select value={b.bookingStatus} onChange={e => handleStatusChange(b, e.target.value)}
                    disabled={acting === b._id}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none disabled:opacity-50">
                    {['pending','confirmed','in_progress','completed','cancelled','no_show'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {refundModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">Refund Override</h3>
            <p className="text-xs text-gray-400 mb-4">#{refundModal.tokenNumber} · Total: {formatPrice(refundModal.totalAmount)}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Refund Amount (₹)</label>
                <input type="number" value={refundAmt} onChange={e => setRefundAmt(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Reason</label>
                <textarea value={refundReason} onChange={e => setRefundReason(e.target.value)}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRefundModal(null)} className="btn-outline flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={handleRefundOverride} disabled={acting === refundModal._id}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {acting === refundModal._id ? '…' : 'Record Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}