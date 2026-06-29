 






 import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useUserLocation, searchPlaces } from '../../context/LocationContext';
import useNotifications from '../../hooks/useNotifications';

const PUBLIC_LINKS = [
  { to: '/',        label: 'Home'    },
  { to: '/about',   label: 'About'   },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { currentUser, isOwner, logout } = useAuth();
  const { userLocation, detecting, detectLocation, setLocation } = useUserLocation();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const dropRef      = useRef(null);
  const locDropRef    = useRef(null);
  const mobileRef     = useRef(null); // wraps the mobile menu PANEL
  const mobileBtnRef  = useRef(null); // wraps the hamburger BUTTON

  const [showDrop,    setShowDrop]    = useState(false);
  const [showLocDrop, setShowLocDrop] = useState(false);
  const [showMobile,  setShowMobile]  = useState(false);
  const [search,      setSearch]      = useState('');
  const [showSearch,  setShowSearch]  = useState(false);

  const [locSearch,    setLocSearch]    = useState('');
  const [locResults,   setLocResults]   = useState([]);
  const [locSearching, setLocSearching] = useState(false);
  const locSearchTimer = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = (e) => {
      if (dropRef.current    && !dropRef.current.contains(e.target))    setShowDrop(false);
      if (locDropRef.current && !locDropRef.current.contains(e.target)) { setShowLocDrop(false); setLocSearch(''); setLocResults([]); }

      // Mobile menu: "inside" means inside the panel OR inside the toggle button.
      // Checking only the button (old code) meant a mousedown on any link inside
      // the panel closed the menu before the click/navigation could fire.
      const clickedInsidePanel = mobileRef.current    && mobileRef.current.contains(e.target);
      const clickedOnButton    = mobileBtnRef.current && mobileBtnRef.current.contains(e.target);
      if (!clickedInsidePanel && !clickedOnButton) setShowMobile(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close on route change
  useEffect(() => {
    setShowDrop(false); setShowLocDrop(false);
    setShowMobile(false); setShowSearch(false);
    setSearch(''); setLocSearch(''); setLocResults([]);
  }, [pathname]);

  const handleLocSearch = (e) => {
    const q = e.target.value;
    setLocSearch(q);
    clearTimeout(locSearchTimer.current);
    if (q.length < 3) { setLocResults([]); return; }
    locSearchTimer.current = setTimeout(async () => {
      setLocSearching(true);
      const results = await searchPlaces(q);
      setLocResults(results);
      setLocSearching(false);
    }, 400);
  };

  const handleLocSelect = useCallback(async (place) => {
    await setLocation(place.lat, place.lng);
    setShowLocDrop(false);
    setLocSearch('');
    setLocResults([]);
    toast.success(`📍 Location set to ${place.short || place.label}`);
    window.location.reload();
  }, [setLocation]);

  const handleDetectGPS = async () => {
    const geo = await detectLocation();
    if (geo) {
      toast.success(`📍 Location detected: ${geo.label}`);
      setShowLocDrop(false);
      window.location.reload();
    } else {
      toast.error('Could not detect location. Please search manually.');
    }
  };

  const handleLogout = () => { logout(); toast.success('Logged out.'); navigate('/login'); };
  const handleSearch = (e) => { e.preventDefault(); if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`); };

  const isActive      = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);
  const initials      = currentUser?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const locationLabel = userLocation?.label || 'Set location';

  // ── Dropdown menu items based on role ────────────────────────────────────
  const dropdownLinks = [
    { to: '/profile',       icon: '👤', label: 'My Profile'  },
    { to: '/my-bookings',   icon: '📋', label: 'My Bookings' },
    { to: '/notifications', icon: '🔔', label: 'Notifications', badge: unreadCount },
    ...(currentUser?.role === 'admin'
      ? [{ to: '/admin', icon: '🔐', label: 'Admin Panel' }]
      : isOwner
      ? [
          { to: '/owner/dashboard',      icon: '📊', label: 'Dashboard' },
          { to: '/owner/register-salon', icon: '➕', label: 'Add Salon'  },
        ]
      : []
    ),
  ];

  // ── Mobile menu links ─────────────────────────────────────────────────────
  const mobileLinks = [
    { to: '/my-bookings',   label: 'My Bookings',   icon: '📋' },
    { to: '/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    { to: '/profile',       label: 'Profile',       icon: '👤' },
    ...(currentUser?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin Panel', icon: '🔐' }]
      : isOwner
      ? [{ to: '/owner/dashboard', label: 'Dashboard', icon: '📊' }]
      : []
    ),
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-14 flex items-center gap-3">

            {/* Logo */}
            <Link to="/" className="text-xl font-bold tracking-tight flex-shrink-0">
              <span className="text-primary">MY</span><span className="text-secondary">SALON</span>
            </Link>

            {/* ── Location picker ─────────────────────────────────────── */}
            <div ref={locDropRef} className="relative hidden md:block flex-shrink-0">
              <button
                onClick={() => setShowLocDrop((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-primary/40 transition max-w-[170px] group"
              >
                <span className="text-secondary text-sm flex-shrink-0">📍</span>
                <span className="truncate text-gray-700 font-medium text-xs">
                  {detecting ? 'Detecting…' : locationLabel}
                </span>
                <svg className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ${showLocDrop ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showLocDrop && (
                <div className="absolute left-0 top-11 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                      <input autoFocus value={locSearch} onChange={handleLocSearch}
                        placeholder="Search area, city, landmark…"
                        className="w-full bg-gray-100 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:bg-white border border-transparent focus:border-primary/30 transition" />
                      {locSearching && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
                        </span>
                      )}
                    </div>
                  </div>

                  {locResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      {locResults.map((place, i) => (
                        <button key={i} onClick={() => handleLocSelect(place)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0">
                          <span className="text-secondary mt-0.5 flex-shrink-0">📍</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{place.short}</p>
                            <p className="text-xs text-gray-400 truncate">{place.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {locSearch.length >= 3 && !locSearching && locResults.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">No places found</div>
                  )}

                  <div className="border-t border-gray-100">
                    <button onClick={handleDetectGPS} disabled={detecting}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition text-left disabled:opacity-50">
                      <span className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                        {detecting ? <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" /> : '📍'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-primary">Use current location</p>
                        <p className="text-xs text-gray-400">Detect via GPS</p>
                      </div>
                    </button>
                  </div>

                  {userLocation && (
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-400 mb-0.5">Currently set to</p>
                      <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <span className="text-secondary text-xs">✓</span> {userLocation.label}
                      </p>
                    </div>
                  )}

                  <div className="px-4 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">Popular cities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Pune','Motihari'].map((city) => (
                        <button key={city}
                          onClick={async () => {
                            const results = await searchPlaces(city + ', India');
                            if (results[0]) handleLocSelect(results[0]);
                          }}
                          className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-primary-50 hover:text-primary transition">
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search bar desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search salons, haircut, facial…"
                  className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30 transition" />
              </div>
            </form>

            <div className="flex-1" />

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {PUBLIC_LINKS.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(to) ? 'text-primary bg-primary-50' : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                  }`}>
                  {label}
                </Link>
              ))}

              {currentUser ? (
                <>
                  {isOwner && (
                    <Link to="/owner/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        isActive('/owner') ? 'text-primary bg-primary-50' : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                      }`}>
                      Dashboard
                    </Link>
                  )}
                  <Link to="/my-bookings"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/my-bookings') ? 'text-primary bg-primary-50' : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                    }`}>
                    Bookings
                  </Link>

                  {/* Bell */}
                  <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 transition" title="Notifications">
                    <span className="text-xl leading-none">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Avatar dropdown */}
                  <div ref={dropRef} className="relative ml-1">
                    <button onClick={() => setShowDrop((v) => !v)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-primary/40 transition">
                      {currentUser.photoURL
                        ? <img src={currentUser.photoURL} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                        : <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{initials}</div>
                      }
                      <span className="text-sm text-gray-700 font-medium max-w-[80px] truncate">
                        {currentUser.name?.split(' ')[0]}
                      </span>
                      <svg className={`w-3 h-3 text-gray-400 transition-transform ${showDrop ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showDrop && (
                      <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{currentUser.email}</p>
                          <span className={`badge text-xs mt-1.5 ${isOwner ? 'bg-primary-50 text-primary' : 'bg-secondary-50 text-secondary-dark'}`}>
                            {isOwner ? '✂️ Salon Owner' : currentUser.role === 'admin' ? '🔐 Admin' : '👤 Customer'}
                          </span>
                        </div>
                        {dropdownLinks.map(({ to, icon, label, badge }) => (
                          <Link key={to} to={to}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                            <span>{icon}</span>
                            <span className="flex-1">{label}</span>
                            {badge > 0 && (
                              <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                                {badge > 9 ? '9+' : badge}
                              </span>
                            )}
                          </Link>
                        ))}
                        <hr className="my-1 border-gray-100" />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                          <span>🚪</span> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 ml-1">
                  <Link to="/login" className="px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 font-medium transition">Login</Link>
                  <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile icons */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button onClick={() => setShowSearch((v) => !v)}
                className="p-2 text-gray-500 hover:text-primary transition rounded-lg hover:bg-gray-100">🔍</button>
              <div ref={mobileBtnRef} className="relative">
                <button onClick={() => setShowMobile((v) => !v)}
                  className="p-2 text-gray-500 hover:text-primary transition rounded-lg hover:bg-gray-100">
                  <div className="w-5 flex flex-col gap-1">
                    <span className={`block h-0.5 bg-current transition-all ${showMobile ? 'rotate-45 translate-y-1.5' : ''}`} />
                    <span className={`block h-0.5 bg-current transition-all ${showMobile ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 bg-current transition-all ${showMobile ? '-rotate-45 -translate-y-1.5' : ''}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          {showSearch && (
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search salons, haircut, facial…"
                    className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white border border-transparent focus:border-primary/30 transition" />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Mobile full menu */}
        {showMobile && (
          <div ref={mobileRef} className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            {/* Location row */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1.5">Your location</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📍</span>
                <input value={locSearch} onChange={handleLocSearch}
                  placeholder={detecting ? 'Detecting…' : locationLabel}
                  className="w-full bg-gray-100 rounded-xl pl-9 pr-20 py-2 text-sm focus:outline-none focus:bg-white border border-transparent focus:border-primary/30 transition" />
                <button onClick={handleDetectGPS} disabled={detecting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-semibold disabled:opacity-50">
                  {detecting ? '…' : 'GPS'}
                </button>
              </div>
              {locResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow">
                  {locResults.slice(0, 4).map((place, i) => (
                    <button key={i} onClick={() => handleLocSelect(place)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <span className="text-secondary text-xs flex-shrink-0">📍</span>
                      <p className="text-sm text-gray-700 truncate">{place.short}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="py-2">
              {/* Public links */}
              {PUBLIC_LINKS.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                    isActive(to) ? 'text-primary bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive(to) ? 'bg-primary' : 'bg-gray-200'}`} />
                  {label}
                </Link>
              ))}

              {currentUser ? (
                <>
                  <hr className="my-1 mx-4 border-gray-100" />
                  {mobileLinks.map(({ to, label, icon, badge }) => (
                    <Link key={to} to={to}
                      className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                        isActive(to) ? 'text-primary bg-primary-50 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      <span>{icon}</span>
                      <span className="flex-1">{label}</span>
                      {badge > 0 && (
                        <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </Link>
                  ))}
                  <hr className="my-1 mx-4 border-gray-100" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition">
                    <span>🚪</span> Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2 mx-4 border-gray-100" />
                  <div className="px-4 pb-3 flex gap-2">
                    <Link to="/login"  className="btn-outline flex-1 text-center py-2.5 text-sm">Login</Link>
                    <Link to="/signup" className="btn-primary flex-1 text-center py-2.5 text-sm">Sign Up</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex">
          {[
            { to: '/',              icon: '🏠', label: 'Home'     },
            { to: '/my-bookings',   icon: '📋', label: 'Bookings' },
            { to: '/notifications', icon: '🔔', label: 'Alerts', badge: unreadCount },
            { to: '/contact',       icon: '💬', label: 'Contact'  },
            currentUser
              ? isOwner
                ? { to: '/owner/dashboard', icon: '📊', label: 'Salon'   }
                : currentUser.role === 'admin'
                ? { to: '/admin',           icon: '🔐', label: 'Admin'   }
                : { to: '/profile',         icon: '👤', label: 'Profile' }
              : { to: '/login',             icon: '👤', label: 'Login'   },
          ].map(({ to, icon, label, badge }) => (
            <Link key={to} to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition relative ${
                isActive(to) ? 'text-primary' : 'text-gray-400'
              }`}>
              <span className="text-xl leading-none relative">
                {icon}
                {badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className="text-xs leading-none mt-0.5 font-medium">{label}</span>
              {isActive(to) && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}