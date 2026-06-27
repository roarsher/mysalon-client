import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAllNotificationsRead, markNotificationRead, deleteNotification } from '../services/api';

const TYPE_CONFIG = {
  booking_confirmed: { icon: '✅', color: 'bg-green-100 text-green-600',  dot: 'bg-green-500'  },
  booking_cancelled: { icon: '❌', color: 'bg-red-100 text-red-500',      dot: 'bg-red-500'    },
  queue_update:      { icon: '✂️', color: 'bg-blue-100 text-blue-600',    dot: 'bg-blue-500'   },
  service_completed: { icon: '🎉', color: 'bg-purple-100 text-purple-600',dot: 'bg-purple-500' },
  new_booking:       { icon: '📋', color: 'bg-orange-100 text-orange-600',dot: 'bg-orange-500' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('all'); // all | unread

  const fetch = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRead = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      setNotifications((prev) => prev.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
    }
    // Navigate to relevant page
    if (n.data?.bookingId) {
      if (n.type === 'new_booking') navigate(`/owner/queue/${n.data?.salonId}`);
      else navigate('/my-bookings');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((x) => x._id !== id));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
  };

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-primary hover:underline font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40'
            }`}
          >
            {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-2 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-gray-600 font-semibold">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'unread' ? 'No unread notifications' : 'Notifications will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.booking_confirmed;
            return (
              <div
                key={n._id}
                onClick={() => handleRead(n)}
                className={`card p-4 flex gap-3 cursor-pointer hover:shadow-md transition-shadow ${
                  !n.isRead ? 'border-l-4 border-l-primary bg-primary-50/30' : ''
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${cfg.color}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold text-gray-900 ${!n.isRead ? 'font-bold' : ''}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />}
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-300 mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}