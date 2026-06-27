import { useState } from 'react';
import { toast } from 'react-toastify';

const CONTACT_CARDS = [
  {
    icon: '📧',
    title: 'Email Us',
    desc: 'For general enquiries and partnerships',
    value: 'hello@mysalon.in',
    action: () => window.open('mailto:hello@mysalon.in'),
    cta: 'Send email',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: '💬',
    title: 'WhatsApp Support',
    desc: 'Quick help — we reply within 1 hour',
    value: '+91 9234093977',
    action: () => window.open('https://wa.me/919234093977'),
    cta: 'Chat on WhatsApp',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: '📞',
    title: 'Call Us',
    desc: 'Mon–Sat, 9 AM to 7 PM IST',
    value: '+91 98765 43210',
    action: () => window.open('tel:+919876543210'),
    cta: 'Call now',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: '✂️',
    title: 'Salon Owners',
    desc: 'Get help registering or managing your salon',
    value: 'salons@mysalon.in',
    action: () => window.open('mailto:salons@mysalon.in'),
    cta: 'Email support',
    color: 'bg-primary-50 text-primary',
  },
];

const FAQS = [
  {
    q: 'How does the live queue work?',
    a: 'When you book a salon, you join a real-time digital queue. You can see exactly how many customers are ahead of you and get an estimated wait time. The page updates every 15 seconds automatically.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes. You can cancel anytime before your service starts. If you cancel 2+ hours before, you get a 100% refund. Less than 2 hours — 50% refund. No refund once the service has started.',
  },
  {
    q: 'What is "Pay at Salon" (COD)?',
    a: 'COD lets you book your slot without paying online. You pay in cash directly at the salon counter after your service. Your queue spot is reserved immediately.',
  },
  {
    q: 'I\'m a salon owner — how do I register?',
    a: 'Sign up as a "Salon Owner", then click "Register Your Salon". It takes about 5 minutes. You\'ll add photos, services, and working hours. Your salon goes live immediately.',
  },
  {
    q: 'Where does my payment go?',
    a: 'Payments are processed by Razorpay. The salon receives the service amount within 2 business days. MYSALON only retains a small platform fee (₹10) to cover operations.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We use Firebase for authentication and industry-standard encryption. We never share your data with third parties or display ads.',
  },
];

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '', type: 'customer' });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields.'); return; }
    setLoading(true);
    // Simulate sending (replace with actual API call)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Message sent! We\'ll reply within 24 hours. 🙌');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-secondary text-white">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <span className="inline-block bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/20">
            We're here to help
          </span>
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-white/70 text-base max-w-md mx-auto">
            Have a question, feedback, or want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Contact cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {CONTACT_CARDS.map(({ icon, title, desc, value, action, cta, color }) => (
            <button key={title} onClick={action}
              className="card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>
                {icon}
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">{desc}</p>
              <p className="text-xs font-medium text-gray-600 mb-2">{value}</p>
              <span className="text-xs text-primary font-semibold group-hover:underline">{cta} →</span>
            </button>
          ))}
        </div>

        {/* ── Contact form + FAQ ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Contact form */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Send us a message</h2>
            <p className="text-sm text-gray-400 mb-5">We reply within 24 hours on business days.</p>

            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-semibold text-gray-900 mb-2">Message sent!</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Thanks {form.name.split(' ')[0]}! We'll get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name:'',email:'',subject:'',message:'',type:'customer' }); }}
                  className="btn-outline text-sm px-5 py-2">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  {[
                    { value: 'customer',     label: '👤 Customer'     },
                    { value: 'salon_owner',  label: '✂️ Salon Owner'  },
                    { value: 'business',     label: '🤝 Partnership'  },
                  ].map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                        form.type === opt.value
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="Rahul Kumar"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="you@email.com"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange}
                    placeholder="What's this about?"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5}
                    placeholder="Describe your question or issue in detail…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition" />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : 'Send Message 📨'}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Frequently asked questions</h2>
            <p className="text-sm text-gray-400 mb-5">Quick answers to common questions.</p>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left gap-3 hover:bg-gray-50 transition"
                  >
                    <p className={`text-sm font-medium leading-snug ${openFaq === i ? 'text-primary' : 'text-gray-800'}`}>
                      {faq.q}
                    </p>
                    <span className={`text-gray-400 flex-shrink-0 text-lg leading-none transition-transform duration-200 ${openFaq === i ? 'rotate-45 text-primary' : ''}`}>
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Office */}
            <div className="card p-4 mt-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🏢</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">Our Office</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  MYSALON Technologies Pvt. Ltd.<br />
                  91Springboard, Koramangala<br />
                  Bengaluru, Karnataka — 560034
                </p>
                <p className="text-xs text-gray-400 mt-1.5">
                  Mon–Fri: 9 AM – 6 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}