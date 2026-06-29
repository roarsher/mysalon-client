import { useNavigate } from 'react-router-dom';

const STATS = [
  { value: '500+', label: 'Salons Listed'     },
  { value: '50K+', label: 'Happy Customers'   },
  { value: '10+',  label: 'Cities Covered'    },
  { value: '4.8★', label: 'Average Rating'    },
];

const TEAM = [
  { name: 'Rohit Kumar ',   role: 'Co-Founder & CEO',     emoji: '👨‍💼', desc: 'Ex-Swiggy. Passionate about solving real-world wait-time problems.' },
  { name: 'Sonu Kumar ',  role: 'Co-Founder & CTO',     emoji: '👩‍💻', desc: 'Full-stack engineer. Built scalable systems at Razorpay.' },
  { name: 'Mohit Kumar',     role: 'Head of Growth',       emoji: '🚀', desc: 'Previously at Zomato. Grew 200+ restaurant partnerships.' },
  { name: 'Sneha Kumari',    role: 'Head of Design',       emoji: '🎨', desc: 'UX lead focused on seamless mobile-first experiences.' },
];

const VALUES = [
  { icon: '⏱', title: 'Respect your time',    desc: 'No one should waste 45 minutes in a waiting room. We built MYSALON so you can walk in right on time.' },
  { icon: '🤝', title: 'Fair for salons',       desc: 'We charge only a small platform fee so salons of all sizes can afford to join and grow digitally.' },
  { icon: '🔒', title: 'Secure & transparent', desc: 'Payments through Razorpay. Full pricing breakdown before you pay. No hidden charges ever.' },
  { icon: '📍', title: 'Hyperlocal first',     desc: 'We show you real salons near you — not paid listings. Nearest open salon with shortest queue, first.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/20">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            We're fixing the way<br />India books salons
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
            MYSALON started with one simple frustration — waiting 40 minutes at a salon with no idea how long it would take.
          </p>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ value, label }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
            🎯
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              To eliminate unnecessary waiting at salons across India by giving every customer live visibility into queue lengths and letting them join the line before they arrive.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We also help salon owners go digital — manage their queue, track bookings, and grow their business — all from a single dashboard, without any expensive hardware.
            </p>
          </div>
        </div>
      </div>

      {/* ── Our values ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">What we stand for</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {VALUES.map(({ icon, title, desc }) => (
            <div key={title} className="card p-5 flex gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1 text-sm">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
 

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Meet the team</h2>
        <p className="text-center text-gray-400 text-sm mb-8">The people building MYSALON</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map(({ name, role, emoji, desc }) => (
            <div key={name} className="card p-5 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                {emoji}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-primary font-medium mt-0.5 mb-2">{role}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Ready to skip the queue?</h2>
          <p className="text-white/70 text-sm mb-6">Join 50,000+ customers who never wait at salons anymore.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/')}
              className="bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition text-sm">
              Browse Salons →
            </button>
            <button onClick={() => navigate('/signup')}
              className="bg-white/10 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition text-sm backdrop-blur-sm">
              Register Your Salon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}