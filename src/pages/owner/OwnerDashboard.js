 
import { useEffect, useState } from 'react';
import { useNavigate }  from 'react-router-dom';
import { toast }        from 'react-toastify';
import { getMySalons }  from '../../services/api';
import { formatPrice }  from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';

export default function OwnerDashboard() {
  const navigate      = useNavigate();
  const [salons, setSalons]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySalons()
      .then((res) => setSalons(res.data.data || []))
      .catch(() => toast.error('Could not load your salons.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My Salons</h1>
        <button onClick={() => navigate('/owner/register-salon')} className="btn-primary text-sm py-2 px-4">
          + Add Salon
        </button>
      </div>

      {salons.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">✂️</div>
          <h2 className="font-semibold text-gray-800 mb-1">No salons yet</h2>
          <p className="text-sm text-gray-400 mb-5">Register your first salon to start managing your queue digitally.</p>
          <button onClick={() => navigate('/owner/register-salon')} className="btn-primary">
            Register Your Salon →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {salons.map((salon) => (
            <div key={salon._id} className="card p-4">
              <div className="flex gap-4">
                {/* Cover image */}
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

                  {/* Stats row */}
                  <div className="flex gap-4 text-xs text-gray-500 mb-3">
                    <span>⭐ {salon.rating?.toFixed(1) || '—'}</span>
                    <span>👥 {salon.queueCount || 0} in queue</span>
                    <span>🛎 {salon.services?.length || 0} services</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => navigate(`/owner/queue/${salon._id}`)}
                      className="btn-primary text-xs py-1.5 px-3">
                      Manage Queue
                    </button>
                    <button onClick={() => navigate(`/owner/salon/${salon._id}`)}
                      className="btn-outline text-xs py-1.5 px-3">
                      Edit Salon
                    </button>
                    <button onClick={() => navigate(`/salon/${salon._id}`)}
                      className="btn-outline text-xs py-1.5 px-3">
                      View Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}