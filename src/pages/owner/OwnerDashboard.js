 import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast }       from 'react-toastify';
import {
  getMySalons, getSalonRevenue, getSalonCustomers, getCustomerHistory,
} from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function StatCard({ icon, label, value, sub, color = 'gray' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary',
    green:   'bg-green-50 text-green-600',
    purple:  'bg-purple-50 text-purple-600',
    orange:  'bg-orange-50 text-orange-600',
    gray:    'bg-gray-50 text-gray-500',
  };
  return (
    <div className="card p-4">
      <span className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${colors[color]}`}>{icon}</span>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function MiniBarChart({ data, valueKey = 'revenue' }) {
  if (!data?.length) return <p className="text-sm text-gray-400 text-center py-8">No data for this period</p>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.slice(-21).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-primary/80 hover:bg-primary rounded-t-sm transition-all cursor-pointer"
            style={{ height: `${Math.max(3, (d[valueKey] / max) * 80)}px` }}
          />
          <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {d._id}: {formatPrice(d[valueKey])} ({d.bookings} bookings)
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'salons',    label: '🏠 My Salons'   },
  { id: 'revenue',   label: '💰 Revenue'     },
  { id: 'customers', label: '👥 Customers'   },
];

// ══════════════════════════════════════════════════════════════════════════════
export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('salons');
  const [salons,  setSalons]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSalonId, setActiveSalonId] = useState(null);

  useEffect(() => {
    getMySalons()
      .then(res => {
        const data = res.data.data || [];
        setSalons(data);
        if (data.length > 0) setActiveSalonId(data[0]._id);
      })
      .catch(() => toast.error('Could not load your salons.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Owner Dashboard</h1>
        <button onClick={() => navigate('/owner/register-salon')} className="btn-primary text-sm py-2 px-4">
          + Add Salon
        </button>
      </div>

      {/* Salon selector (shown when revenue/customers tab active) */}
      {salons.length > 1 && tab !== 'salons' && (
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Viewing data for</label>
          <select
            value={activeSalonId}
            onChange={e => setActiveSalonId(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-full"
          >
            {salons.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-100 overflow-x-auto hide-scrollbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap ${
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MY SALONS TAB ──────────────────────────────────────────────── */}
      {tab === 'salons' && (
        salons.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-5xl mb-3">✂️</div>
            <h2 className="font-semibold text-gray-800 mb-1">No salons yet</h2>
            <p className="text-sm text-gray-400 mb-5">Register your first salon to start managing your queue digitally.</p>
            <button onClick={() => navigate('/owner/register-salon')} className="btn-primary">Register Your Salon →</button>
          </div>
        ) : (
          <div className="space-y-4">
            {salons.map(salon => (
              <div key={salon._id} className="card p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-primary-50">
                    {salon.coverImage?.url
                      ? <img src={salon.coverImage.url} alt={salon.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">✂️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="font-semibold text-gray-900">{salon.name}</h2>
                      <span className={`badge text-xs flex-shrink-0 ${salon.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {salon.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 capitalize">{salon.category} · {salon.address?.city}</p>
                    <div className="flex gap-4 text-xs text-gray-500 mb-3">
                      <span>⭐ {salon.rating?.toFixed(1) || '—'}</span>
                      <span>👥 {salon.queueCount || 0} in queue</span>
                      <span>🛎 {salon.services?.length || 0} services</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => navigate(`/owner/queue/${salon._id}`)} className="btn-primary text-xs py-1.5 px-3">Manage Queue</button>
                      <button onClick={() => navigate(`/owner/salon/${salon._id}`)} className="btn-outline text-xs py-1.5 px-3">Edit Salon</button>
                      <button onClick={() => { setActiveSalonId(salon._id); setTab('revenue'); }} className="btn-outline text-xs py-1.5 px-3">📊 Revenue</button>
                      <button onClick={() => navigate(`/salon/${salon._id}`)} className="text-xs text-gray-400 hover:text-primary transition">View →</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── REVENUE TAB ────────────────────────────────────────────────── */}
      {tab === 'revenue' && activeSalonId && (
        <RevenueTab salonId={activeSalonId} />
      )}

      {/* ── CUSTOMERS TAB ──────────────────────────────────────────────── */}
      {tab === 'customers' && activeSalonId && (
        <CustomersTab salonId={activeSalonId} />
      )}

      {!activeSalonId && tab !== 'salons' && (
        <div className="text-center py-16 text-gray-400">
          <p>Register a salon first to see analytics.</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REVENUE TAB
// ══════════════════════════════════════════════════════════════════════════════
function RevenueTab({ salonId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('daily');

  useEffect(() => {
    setLoading(true);
    getSalonRevenue(salonId, { period })
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Could not load revenue.'))
      .finally(() => setLoading(false));
  }, [salonId, period]);

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!data)   return null;

  const s = data.summary;

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex gap-2">
        {['daily','weekly','monthly'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${period === p ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="💰" label="Total Revenue"    value={formatPrice(s.totalRevenue)}           color="primary" />
        <StatCard icon="📋" label="Completed Bookings" value={s.totalBookings}                      color="green" />
        <StatCard icon="🎟" label="Avg Ticket Size"  value={formatPrice(Math.round(s.avgTicket || 0))} color="purple" />
        <StatCard icon="🎁" label="Discounts Given"  value={formatPrice(s.totalDiscount)}           color="orange" />
      </div>

      {/* Revenue breakdown */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-1 text-sm">Revenue Breakdown</h3>
        <div className="space-y-2 mt-3">
          {[
            { label: 'Gross Revenue',    value: s.totalRevenue,  color: 'text-gray-900' },
            { label: 'GST (collected)',  value: s.totalGst,      color: 'text-gray-500' },
            { label: 'Platform Fees',    value: s.totalFees,     color: 'text-gray-500' },
            { label: 'Discounts',        value: -s.totalDiscount,color: 'text-green-600' },
            { label: 'Net to Salon',     value: s.totalRevenue - s.totalGst - s.totalFees, color: 'text-primary font-bold' },
          ].map((row, i) => (
            <div key={i} className={`flex justify-between text-sm ${row.color}`}>
              <span>{row.label}</span>
              <span>{formatPrice(Math.abs(row.value))}{row.value < 0 ? ' saved' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Revenue Chart ({period})</h3>
        <MiniBarChart data={data.chart} valueKey="revenue" />
        {data.chart.length > 0 && (
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{data.chart[0]?._id}</span>
            <span>{data.chart[data.chart.length-1]?._id}</span>
          </div>
        )}
      </div>

      {/* By service */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Top Services by Revenue</h3>
        {data.byService.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No completed bookings yet</p>
        ) : (
          <div className="space-y-2.5">
            {data.byService.map((svc, i) => {
              const pct = data.byService[0]?.revenue > 0 ? Math.round((svc.revenue / data.byService[0].revenue) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{svc._id}</span>
                    <span className="text-gray-500">{formatPrice(svc.revenue)} · {svc.count}x</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* By payment method */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Revenue by Payment Method</h3>
        <div className="flex gap-4">
          {data.byPaymentMethod.map(pm => (
            <div key={pm._id} className="flex-1 text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl mb-1">{pm._id === 'cod' ? '💵' : '💳'}</p>
              <p className="text-sm font-bold text-gray-900">{formatPrice(pm.revenue)}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{pm._id === 'cod' ? 'Cash' : 'Online'} · {pm.count} bookings</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS TAB
// ══════════════════════════════════════════════════════════════════════════════
function CustomersTab({ salonId }) {
  const [customers,   setCustomers]   = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [type,        setType]        = useState('');   // '' | 'returning' | 'new'
  const [historyUser, setHistoryUser] = useState(null); // { user, bookings }
  const [histLoading, setHistLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalonCustomers(salonId, { search, type });
      setCustomers(res.data.data || []);
      setStats(res.data.stats);
    } catch { toast.error('Could not load customers.'); }
    finally { setLoading(false); }
  }, [salonId, search, type]);

  useEffect(() => { load(); }, [load]);

  const openHistory = async (userId) => {
    setHistLoading(true);
    try {
      const res = await getCustomerHistory(salonId, userId);
      setHistoryUser(res.data.data);
    } catch { toast.error('Could not load history.'); }
    finally { setHistLoading(false); }
  };

  const STATUS_COLOR = {
    completed:   'text-green-600', confirmed: 'text-blue-600',
    cancelled:   'text-gray-400',  pending:   'text-yellow-600',
    in_progress: 'text-orange-500',
  };

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{stats.uniqueCustomers}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Customers</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.returningCustomers}</p>
            <p className="text-xs text-gray-400 mt-0.5">Returning</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-primary">{stats.uniqueCustomers - stats.returningCustomers}</p>
            <p className="text-xs text-gray-400 mt-0.5">New</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-primary flex-1 min-w-[180px]" />
        <div className="flex gap-1">
          {[['', 'All'], ['returning', '🔄 Returning'], ['new', '🆕 New']].map(([val, lbl]) => (
            <button key={val} onClick={() => setType(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${type === val ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-gray-500 font-medium">No customers yet</p>
          <p className="text-gray-400 text-sm mt-1">Customers appear here after their first booking</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map(c => {
            const isReturning = c.totalVisits > 1;
            return (
              <div key={c._id} className="card p-4 flex items-center gap-3">
                {c.user?.photoURL
                  ? <img src={c.user.photoURL} alt={c.user.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {c.user?.name?.slice(0,2).toUpperCase() || 'U'}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{c.user?.name}</p>
                    {isReturning
                      ? <span className="badge text-xs bg-green-100 text-green-700">🔄 Returning</span>
                      : <span className="badge text-xs bg-blue-100 text-blue-700">🆕 New</span>
                    }
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.user?.email}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>✅ {c.totalVisits} visit{c.totalVisits !== 1 ? 's' : ''}</span>
                    <span>💰 {formatPrice(c.totalSpend)}</span>
                    <span>Last: {timeAgo(c.lastVisit)}</span>
                  </div>
                </div>
                <button
                  onClick={() => openHistory(c._id)}
                  className="text-xs text-primary border border-primary/20 px-2.5 py-1.5 rounded-xl hover:bg-primary-50 transition flex-shrink-0"
                >
                  History
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer history modal */}
      {(historyUser || histLoading) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900">{historyUser?.user?.name || 'Loading…'}</h3>
                <p className="text-xs text-gray-400">{historyUser?.user?.email}</p>
              </div>
              <button onClick={() => setHistoryUser(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">×</button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {histLoading ? (
                <div className="flex justify-center py-8"><span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
              ) : historyUser?.bookings?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No bookings found</p>
              ) : (
                <div className="space-y-3">
                  {historyUser?.bookings?.map(b => (
                    <div key={b._id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">#{b.tokenNumber}</span>
                        <span className={`text-xs font-semibold capitalize ${STATUS_COLOR[b.bookingStatus] || 'text-gray-500'}`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {(b.services || []).map(s => s.name).join(' · ')}
                      </p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{timeAgo(b.createdAt)}</span>
                        <span className="font-semibold text-gray-700">{formatPrice(b.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}