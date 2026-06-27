 import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSalons } from '../services/api';
import SalonCard from '../components/salon/SalonCard';
import Spinner   from '../components/common/Spinner';

const CATEGORIES = [
  { value: '',         label: '🏠 All'       },
  { value: "men's",   label: "✂️ Men's"     },
  { value: "women's", label: "💄 Women's"   },
  { value: 'unisex',  label: "🌟 Unisex"    },
  { value: 'bridal',  label: "👰 Bridal"    },
  { value: 'spa',     label: "🧖 Spa"       },
  { value: 'kids',    label: "🧒 Kids"      },
];

const SORT_OPTIONS = [
  { value: 'rating',  label: '⭐ Top Rated' },
  { value: 'newest',  label: '🆕 Newest'    },
  { value: 'name',    label: '🔤 A–Z'       },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read search/city from URL (set by Navbar)
  const urlSearch = searchParams.get('search') || '';
  const urlCity   = searchParams.get('city')   || '';

  const [salons,   setSalons]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState(urlSearch);
  const [category, setCategory] = useState('');
  const [sortBy,   setSortBy]   = useState('rating');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 12;

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, page, limit: LIMIT };
      if (search)   params.search   = search;
      if (category) params.category = category;
      if (urlCity)  params.city     = urlCity;
      const res = await getSalons(params);
      setSalons(res.data.data   || []);
      setTotal(res.data.total   || 0);
    } catch { /* silent */ }
    finally   { setLoading(false); }
  }, [search, category, sortBy, page, urlCity]);

  useEffect(() => {
    const t = setTimeout(fetchSalons, 300);
    return () => clearTimeout(t);
  }, [fetchSalons]);

  // Sync URL search param to state
  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);

  const handleCat = (v) => { setCategory(v); setPage(1); };

  const storedLocation = localStorage.getItem('mysalon_location');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary text-white px-4 py-10">
        <div className="max-w-2xl mx-auto text-center">
          {storedLocation && (
            <p className="text-white/60 text-xs mb-2 flex items-center justify-center gap-1">
              <span>📍</span> Showing salons near <strong className="text-white/80">{storedLocation}</strong>
            </p>
          )}
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            Skip the wait. Book your chair.
          </h2>
          <p className="text-white/70 text-sm mb-6">
            See live queues at top salons near you — walk in right on time.
          </p>

          {/* Search bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`); }}
            className="max-w-md mx-auto"
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search salons, haircut, facial…"
                className="w-full bg-white text-gray-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                  ×
                </button>
              )}
            </div>
          </form>

          {/* Quick stats */}
          <div className="flex justify-center gap-8 mt-7 text-sm">
            {[
              { n: total || '—', l: 'Salons'       },
              { n: '4.8★',       l: 'Avg. Rating'  },
              { n: '< 5 min',    l: 'Avg. Wait'    },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-xl font-bold">{n}</div>
                <div className="text-white/50 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* ── Category filter chips ────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => handleCat(c.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition flex-shrink-0 ${
                category === c.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {c.label}
            </button>
          ))}
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="ml-auto text-xs border border-gray-200 rounded-full px-3 py-2 bg-white text-gray-600 focus:outline-none focus:border-primary flex-shrink-0 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Active filter tags */}
        {(search || urlCity || category) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <span className="flex items-center gap-1.5 bg-primary-50 text-primary text-xs px-3 py-1 rounded-full">
                🔍 "{search}"
                <button onClick={() => { setSearch(''); navigate('/'); }} className="hover:text-primary-dark">×</button>
              </span>
            )}
            {urlCity && (
              <span className="flex items-center gap-1.5 bg-secondary-50 text-secondary-dark text-xs px-3 py-1 rounded-full">
                📍 {urlCity}
                <button onClick={() => navigate('/')} className="hover:text-secondary-dark">×</button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full capitalize">
                {category}
                <button onClick={() => setCategory('')} className="hover:text-gray-800">×</button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading salons…' : `${total} salon${total !== 1 ? 's' : ''} found`}
          {urlCity && ` in ${urlCity}`}
        </p>

        {/* ── Salon grid ───────────────────────────────────────────────────── */}
        {loading ? (
          <Spinner size="lg" />
        ) : salons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✂️</div>
            <p className="text-gray-500 font-semibold text-lg">No salons found</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              Try a different search term, category, or location
            </p>
            <button
              onClick={() => { setSearch(''); setCategory(''); navigate('/'); }}
              className="btn-primary px-6 py-2.5"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {salons.map((s) => <SalonCard key={s._id} salon={s} />)}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage((p) => p - 1); window.scrollTo(0, 0); }}
                  className="btn-outline py-2 px-4 disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {Math.ceil(total / LIMIT)}
                </span>
                <button
                  disabled={page >= Math.ceil(total / LIMIT)}
                  onClick={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
                  className="btn-outline py-2 px-4 disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Owner CTA banner ─────────────────────────────────────────────── */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-primary/10">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 sm:flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg mb-1">Own a salon? 💈</h3>
              <p className="text-sm text-gray-500">
                Join MYSALON, manage your queue digitally and never let customers wait in the dark again.
              </p>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary mt-4 sm:mt-0 whitespace-nowrap px-6 py-3 flex-shrink-0"
            >
              Register Your Salon →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}