 

// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast }       from 'react-toastify';
// import { createSalon, createService } from '../../services/api';
// import { SALON_CATEGORIES } from '../../utils/helpers';

// const SERVICE_CATEGORIES = [
//   'hair','skin','beard','nail','bridal','spa','makeup','threading','waxing','massage','other'
// ];
// const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
// const defaultHours = DAYS.map((day) => ({
//   day, isOpen: day !== 'sunday', openTime: '09:00', closeTime: '21:00',
// }));

// // ── Reverse geocode using Nominatim (free, no API key) ───────────────────────
// async function reverseGeocode(lat, lng) {
//   const res  = await fetch(
//     `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
//     { headers: { 'Accept-Language': 'en' } }
//   );
//   const data = await res.json();
//   const a    = data.address || {};
//   return {
//     street:  [a.road, a.house_number].filter(Boolean).join(' ') || '',
//     area:    a.suburb || a.neighbourhood || a.quarter || a.city_district || '',
//     city:    a.city   || a.town || a.village || a.county || '',
//     state:   a.state  || '',
//     pincode: a.postcode || '',
//     lat, lng,
//     display: data.display_name || '',
//   };
// }

// // ── Step indicator ────────────────────────────────────────────────────────────
// function StepIndicator({ current, total }) {
//   const labels = ['Salon Info', 'Services', 'Hours'];
//   return (
//     <div className="flex items-center justify-between mb-8">
//       {Array.from({ length: total }).map((_, i) => (
//         <div key={i} className="flex-1 flex flex-col items-center">
//           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
//             i + 1 < current  ? 'bg-secondary border-secondary text-white' :
//             i + 1 === current ? 'border-primary text-primary bg-primary-50' :
//                                 'border-gray-200 text-gray-300 bg-white'
//           }`}>
//             {i + 1 < current ? '✓' : i + 1}
//           </div>
//           <p className={`text-xs mt-1 font-medium ${i + 1 === current ? 'text-primary' : 'text-gray-400'}`}>
//             {labels[i]}
//           </p>
//           {i < total - 1 && (
//             <div className="absolute" style={{ display: 'none' }} />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// // ── Input field component ─────────────────────────────────────────────────────
// function Field({ label, name, value, onChange, type = 'text', placeholder, required, hint, children }) {
//   return (
//     <div>
//       <label className="block text-xs font-medium text-gray-600 mb-1">
//         {label}{required && <span className="text-red-400 ml-0.5">*</span>}
//       </label>
//       {children || (
//         <input type={type} name={name} value={value} onChange={onChange}
//           placeholder={placeholder}
//           className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white"
//         />
//       )}
//       {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
//     </div>
//   );
// }

// export default function RegisterSalonPage() {
//   const navigate = useNavigate();
//   const [step,    setStep]    = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [salonId, setSalonId] = useState(null);

//   // ── Location state ────────────────────────────────────────────────────────
//   const [locLoading, setLocLoading] = useState(false);
//   const [locDetected, setLocDetected] = useState(false);
//   const [coords, setCoords] = useState({ lat: null, lng: null });

//   // ── Step 1: salon form ────────────────────────────────────────────────────
//   const [form, setForm] = useState({
//     name: '', description: '', category: "men's",
//     phone: '', email: '', tags: '',
//     street: '', area: '', city: '', state: '', pincode: '',
//   });
//   const [coverImage,      setCoverImage]      = useState(null);
//   const [coverPreview,    setCoverPreview]    = useState('');
//   const [gallery,         setGallery]         = useState([]);
//   const [galleryPreviews, setGalleryPreviews] = useState([]);

//   // ── Step 2: services ──────────────────────────────────────────────────────
//   const [services, setServices] = useState([
//     { name: '', category: 'hair', price: '', duration: '30', description: '', image: null },
//   ]);

//   // ── Step 3: hours ─────────────────────────────────────────────────────────
//   const [hours, setHours] = useState(defaultHours);

//   // ── Auto-detect location on mount ─────────────────────────────────────────
//   const detectLocation = useCallback(async () => {
//     if (!navigator.geolocation) {
//       toast.info('Geolocation not supported. Please enter address manually.');
//       return;
//     }
//     setLocLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         try {
//           const { latitude, longitude } = pos.coords;
//           setCoords({ lat: latitude, lng: longitude });
//           const addr = await reverseGeocode(latitude, longitude);
//           setForm((f) => ({
//             ...f,
//             street:  addr.street  || f.street,
//             area:    addr.area    || f.area,
//             city:    addr.city    || f.city,
//             state:   addr.state   || f.state,
//             pincode: addr.pincode || f.pincode,
//           }));
//           setLocDetected(true);
//           toast.success('📍 Location detected! You can edit the fields if needed.');
//         } catch {
//           toast.error('Could not fetch address. Please enter manually.');
//         } finally {
//           setLocLoading(false);
//         }
//       },
//       (err) => {
//         setLocLoading(false);
//         if (err.code === 1) toast.warning('Location permission denied. Please enter address manually.');
//         else                toast.warning('Could not detect location. Please enter manually.');
//       },
//       { timeout: 10000, enableHighAccuracy: true }
//     );
//   }, []);

//   // Auto-trigger on mount
//   useEffect(() => { detectLocation(); }, [detectLocation]);

//   const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

//   // ── Step 1 submit ─────────────────────────────────────────────────────────
//   const handleSalonSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim())  { toast.error('Salon name is required.');  return; }
//     if (!form.phone.trim()) { toast.error('Phone number is required.'); return; }
//     if (!form.category)     { toast.error('Category is required.');     return; }

//     setLoading(true);
//     try {
//       const fd = new FormData();

//       // Text fields
//       fd.append('name',        form.name.trim());
//       fd.append('description', form.description.trim());
//       fd.append('category',    form.category);
//       fd.append('phone',       form.phone.trim());
//       fd.append('email',       form.email.trim());
//       fd.append('tags',        form.tags);

//       // Address as JSON string
//       fd.append('address', JSON.stringify({
//         street:  form.street.trim(),
//         area:    form.area.trim(),
//         city:    form.city.trim(),
//         state:   form.state.trim(),
//         pincode: form.pincode.trim(),
//       }));

//       // Coordinates
//       if (coords.lat) fd.append('latitude',  String(coords.lat));
//       if (coords.lng) fd.append('longitude', String(coords.lng));

//       // Working hours
//       fd.append('workingHours', JSON.stringify(hours));

//       // Images
//       if (coverImage)           fd.append('coverImage', coverImage);
//       gallery.forEach((f) =>   fd.append('gallery', f));

//       const res = await createSalon(fd);
//       setSalonId(res.data.data._id);
//       toast.success('✅ Salon registered! Now add your services.');
//       setStep(2);
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || 'Registration failed.';
//       toast.error(msg);
//       console.error('Salon register error:', err?.response?.data || err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Step 2 submit ─────────────────────────────────────────────────────────
//   const handleServicesSubmit = async (e) => {
//     e.preventDefault();
//     const valid = services.filter((s) => s.name.trim() && s.price && s.duration);
//     if (!valid.length) { toast.error('Add at least one complete service (name, price, duration).'); return; }
//     setLoading(true);
//     try {
//       await Promise.all(valid.map((s) => {
//         const fd = new FormData();
//         fd.append('name',        s.name.trim());
//         fd.append('category',    s.category);
//         fd.append('price',       String(s.price));
//         fd.append('duration',    String(s.duration));
//         fd.append('description', s.description || '');
//         if (s.image) fd.append('image', s.image);
//         return createService(salonId, fd);
//       }));
//       toast.success('✅ Services added!');
//       setStep(3);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || err.message || 'Could not save services.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Service row helpers ───────────────────────────────────────────────────
//   const addRow    = () => setServices((s) => [...s, { name: '', category: 'hair', price: '', duration: '30', description: '', image: null }]);
//   const removeRow = (i) => setServices((s) => s.filter((_, idx) => idx !== i));
//   const updateSvc = (i, k, v) => setServices((s) => s.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

//   const handleHourChange = (i, field, val) =>
//     setHours((h) => h.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

//   const handleFinish = () => {
//     toast.success('🎉 Your salon is live on MYSALON!');
//     navigate('/owner/dashboard');
//   };

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
//       <button onClick={() => navigate(-1)} className="text-primary text-sm mb-4 hover:underline flex items-center gap-1">
//         ← Back
//       </button>
//       <h1 className="text-xl font-bold text-gray-900 mb-1">Register Your Salon</h1>
//       <p className="text-sm text-gray-400 mb-6">Complete all steps to appear on MYSALON</p>

//       <StepIndicator current={step} total={3} />

//       {/* ════════════════════════════════════════════════════════════════════
//           STEP 1 — Salon Details
//       ════════════════════════════════════════════════════════════════════ */}
//       {step === 1 && (
//         <form onSubmit={handleSalonSubmit} className="space-y-5">

//           {/* Basic info */}
//           <div className="card p-5 space-y-4">
//             <h2 className="font-semibold text-gray-800">Basic Information</h2>

//             <Field label="Salon Name" name="name" value={form.name} onChange={handleChange}
//               placeholder="e.g. StyleSpot Salon" required />

//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Category" required>
//                 <select name="category" value={form.category} onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition">
//                   {SALON_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
//                 </select>
//               </Field>
//               <Field label="Phone" name="phone" value={form.phone} onChange={handleChange}
//                 placeholder="9876543210" required type="tel" />
//             </div>

//             <Field label="Email" name="email" value={form.email} onChange={handleChange}
//               placeholder="salon@email.com" type="email" />

//             <Field label="Description" name="description">
//               <textarea name="description" value={form.description} onChange={handleChange} rows={3}
//                 placeholder="Tell customers what makes your salon special…"
//                 className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition" />
//             </Field>

//             <Field label="Service Tags" name="tags" value={form.tags} onChange={handleChange}
//               placeholder="Haircut, Bridal, Colour, Facial"
//               hint="Comma-separated keywords shown on your listing card" />
//           </div>

//           {/* Address with auto-detect */}
//           <div className="card p-5 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="font-semibold text-gray-800">Salon Address</h2>
//               <button type="button" onClick={detectLocation} disabled={locLoading}
//                 className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition disabled:opacity-50">
//                 {locLoading
//                   ? <><span className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" /> Detecting…</>
//                   : <><span>📍</span> {locDetected ? 'Re-detect' : 'Auto-detect'}</>
//                 }
//               </button>
//             </div>

//             {locDetected && (
//               <div className="bg-secondary-50 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs text-secondary-dark flex items-start gap-2">
//                 <span className="mt-0.5 flex-shrink-0">✓</span>
//                 <span>Address auto-filled from your GPS location. Review and edit any field if needed.</span>
//               </div>
//             )}

//             <Field label="Street / Building" name="street" value={form.street} onChange={handleChange}
//               placeholder="e.g. 12 MG Road, Opp. City Mall" />
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Area / Locality" name="area" value={form.area} onChange={handleChange}
//                 placeholder="e.g. Koramangala" />
//               <Field label="City" name="city" value={form.city} onChange={handleChange}
//                 placeholder="e.g. Bengaluru" required />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="State" name="state" value={form.state} onChange={handleChange}
//                 placeholder="e.g. Karnataka" />
//               <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange}
//                 placeholder="560001" type="text" />
//             </div>
//           </div>

//           {/* Photos */}
//           <div className="card p-5 space-y-4">
//             <h2 className="font-semibold text-gray-800">Salon Photos</h2>

//             {/* Cover photo */}
//             <div>
//               <p className="text-xs font-medium text-gray-600 mb-2">
//                 Cover Photo <span className="text-gray-400">(shown on listing card)</span>
//               </p>
//               {coverPreview ? (
//                 <div className="relative">
//                   <img src={coverPreview} alt="cover" className="w-full h-36 object-cover rounded-xl" />
//                   <button type="button" onClick={() => { setCoverImage(null); setCoverPreview(''); }}
//                     className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center shadow hover:bg-red-600">
//                     ×
//                   </button>
//                 </div>
//               ) : (
//                 <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 text-sm text-gray-400 cursor-pointer hover:border-primary/40 hover:bg-primary-50/30 transition">
//                   <span className="text-3xl">📷</span>
//                   <span>Upload cover photo</span>
//                   <span className="text-xs">JPG, PNG or WEBP · Max 5MB</span>
//                   <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
//                     const f = e.target.files?.[0];
//                     if (f) { setCoverImage(f); setCoverPreview(URL.createObjectURL(f)); }
//                   }} className="hidden" />
//                 </label>
//               )}
//             </div>

//             {/* Gallery */}
//             <div>
//               <p className="text-xs font-medium text-gray-600 mb-2">
//                 Gallery <span className="text-gray-400">(up to 10 photos — shown in slideshow)</span>
//               </p>
//               {galleryPreviews.length > 0 && (
//                 <div className="grid grid-cols-4 gap-2 mb-2">
//                   {galleryPreviews.map((src, i) => (
//                     <div key={i} className="relative">
//                       <img src={src} alt={`g${i}`} className="w-full h-16 object-cover rounded-lg" />
//                       <button type="button"
//                         onClick={() => {
//                           setGallery((g) => g.filter((_, idx) => idx !== i));
//                           setGalleryPreviews((p) => p.filter((_, idx) => idx !== i));
//                         }}
//                         className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow">
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {gallery.length < 10 && (
//                 <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 cursor-pointer hover:border-primary/40 hover:bg-primary-50/30 transition">
//                   <span>🖼</span> Add gallery photos ({gallery.length}/10)
//                   <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => {
//                     const files = Array.from(e.target.files).slice(0, 10 - gallery.length);
//                     setGallery((g) => [...g, ...files]);
//                     setGalleryPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
//                   }} className="hidden" />
//                 </label>
//               )}
//             </div>
//           </div>

//           <button type="submit" disabled={loading}
//             className="btn-primary w-full py-3.5 text-base">
//             {loading ? (
//               <span className="flex items-center justify-center gap-2">
//                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 Registering salon…
//               </span>
//             ) : 'Save & Continue →'}
//           </button>
//         </form>
//       )}

//       {/* ════════════════════════════════════════════════════════════════════
//           STEP 2 — Services
//       ════════════════════════════════════════════════════════════════════ */}
//       {step === 2 && (
//         <form onSubmit={handleServicesSubmit} className="space-y-5">
//           <div className="card p-5">
//             <h2 className="font-semibold text-gray-800 mb-1">Your Services</h2>
//             <p className="text-xs text-gray-400 mb-5">
//               These show on your salon page like a menu — customers pick and book.
//             </p>

//             <div className="space-y-4">
//               {services.map((svc, i) => (
//                 <div key={i} className="border border-gray-100 rounded-xl p-4 relative bg-gray-50/50">
//                   {services.length > 1 && (
//                     <button type="button" onClick={() => removeRow(i)}
//                       className="absolute top-3 right-3 w-6 h-6 text-gray-300 hover:text-red-400 text-xl font-light flex items-center justify-center transition">
//                       ×
//                     </button>
//                   )}

//                   <div className="grid grid-cols-2 gap-3">
//                     {/* Name */}
//                     <div className="col-span-2">
//                       <label className="block text-xs text-gray-500 mb-1">Service Name *</label>
//                       <input value={svc.name} onChange={(e) => updateSvc(i, 'name', e.target.value)}
//                         placeholder="e.g. Haircut (Men), Facial, Beard Trim"
//                         className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
//                     </div>
//                     {/* Category */}
//                     <div>
//                       <label className="block text-xs text-gray-500 mb-1">Category *</label>
//                       <select value={svc.category} onChange={(e) => updateSvc(i, 'category', e.target.value)}
//                         className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white capitalize">
//                         {SERVICE_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
//                       </select>
//                     </div>
//                     {/* Price */}
//                     <div>
//                       <label className="block text-xs text-gray-500 mb-1">Price (₹) *</label>
//                       <input type="number" min="0" value={svc.price}
//                         onChange={(e) => updateSvc(i, 'price', e.target.value)}
//                         placeholder="200"
//                         className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
//                     </div>
//                     {/* Duration */}
//                     <div>
//                       <label className="block text-xs text-gray-500 mb-1">Duration (min) *</label>
//                       <input type="number" min="5" value={svc.duration}
//                         onChange={(e) => updateSvc(i, 'duration', e.target.value)}
//                         placeholder="30"
//                         className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
//                     </div>
//                     {/* Description */}
//                     <div>
//                       <label className="block text-xs text-gray-500 mb-1">Description</label>
//                       <input value={svc.description} onChange={(e) => updateSvc(i, 'description', e.target.value)}
//                         placeholder="Brief description"
//                         className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
//                     </div>
//                     {/* Image */}
//                     <div>
//                       <label className="block text-xs text-gray-500 mb-1">Photo</label>
//                       <label className="flex items-center gap-1.5 border border-dashed border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-400 cursor-pointer hover:border-primary/40 bg-white">
//                         📷 {svc.image ? svc.image.name : 'Upload photo'}
//                         <input type="file" accept="image/*" onChange={(e) => updateSvc(i, 'image', e.target.files?.[0])} className="hidden" />
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button type="button" onClick={addRow}
//               className="w-full mt-4 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-primary/40 hover:text-primary transition flex items-center justify-center gap-2">
//               <span className="text-lg">+</span> Add Another Service
//             </button>
//           </div>

//           <div className="flex gap-3">
//             <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Back</button>
//             <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Saving services…
//                 </span>
//               ) : 'Save & Continue →'}
//             </button>
//           </div>
//         </form>
//       )}

//       {/* ════════════════════════════════════════════════════════════════════
//           STEP 3 — Working Hours
//       ════════════════════════════════════════════════════════════════════ */}
//       {step === 3 && (
//         <div className="space-y-5">
//           <div className="card p-5">
//             <h2 className="font-semibold text-gray-800 mb-1">Working Hours</h2>
//             <p className="text-xs text-gray-400 mb-5">
//               Set the days and hours your salon is open. Customers see this on your page.
//             </p>

//             <div className="space-y-3">
//               {hours.map((h, i) => (
//                 <div key={h.day} className="flex items-center gap-3">
//                   {/* Day name */}
//                   <div className="w-8 text-xs font-semibold text-gray-500 uppercase">
//                     {h.day.slice(0, 3)}
//                   </div>

//                   {/* Toggle */}
//                   <button type="button" onClick={() => handleHourChange(i, 'isOpen', !h.isOpen)}
//                     className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${h.isOpen ? 'bg-secondary' : 'bg-gray-200'}`}>
//                     <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${h.isOpen ? 'left-5' : 'left-0.5'}`} />
//                   </button>

//                   {h.isOpen ? (
//                     <div className="flex items-center gap-2 flex-1">
//                       <input type="time" value={h.openTime}
//                         onChange={(e) => handleHourChange(i, 'openTime', e.target.value)}
//                         className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary bg-white flex-1" />
//                       <span className="text-gray-300 text-xs font-medium">to</span>
//                       <input type="time" value={h.closeTime}
//                         onChange={(e) => handleHourChange(i, 'closeTime', e.target.value)}
//                         className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary bg-white flex-1" />
//                     </div>
//                   ) : (
//                     <span className="text-xs text-gray-300 flex-1 font-medium">Closed</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Success preview */}
//           <div className="card p-5 border-secondary/20 bg-secondary-50">
//             <div className="flex gap-3 items-start">
//               <span className="text-3xl mt-0.5">🎉</span>
//               <div>
//                 <p className="font-semibold text-gray-800 mb-1">Almost there!</p>
//                 <p className="text-sm text-gray-600">
//                   Your salon will go live immediately on MYSALON. Customers can browse and book right away.
//                 </p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   You can edit all details later from your Owner Dashboard.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">← Back</button>
//             <button onClick={handleFinish} className="btn-primary flex-1 py-3 text-base">
//               Go Live 🚀
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast }       from 'react-toastify';
import { createSalon, createService } from '../../services/api';
import { SALON_CATEGORIES } from '../../utils/helpers';
import { reverseGeocode }  from '../../context/LocationContext';
import MapLocationPicker   from '../../components/map/MapLocationPicker';

const SERVICE_CATEGORIES = [
  'hair','skin','beard','nail','bridal','spa','makeup','threading','waxing','massage','other'
];
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const defaultHours = DAYS.map((d) => ({
  day: d, isOpen: d !== 'sunday', openTime: '09:00', closeTime: '21:00',
}));

function StepIndicator({ current }) {
  const labels = ['Salon Info','Services','Hours'];
  return (
    <div className="flex items-center justify-between mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex-1 flex flex-col items-center relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
            i + 1 < current  ? 'bg-secondary border-secondary text-white' :
            i + 1 === current ? 'border-primary text-primary bg-primary-50' :
                                'border-gray-200 text-gray-300 bg-white'
          }`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <p className={`text-xs mt-1 font-medium ${i + 1 === current ? 'text-primary' : 'text-gray-400'}`}>
            {label}
          </p>
          {i < 2 && (
            <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${i + 1 < current ? 'bg-secondary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children || (
        <input type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white" />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function RegisterSalonPage() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [salonId,     setSalonId]     = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Coordinates
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [locDetected, setLocDetected] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', category: "men's",
    phone: '', email: '', tags: '',
    street: '', area: '', city: '', state: '', pincode: '',
  });
  const [coverImage,      setCoverImage]      = useState(null);
  const [coverPreview,    setCoverPreview]    = useState('');
  const [gallery,         setGallery]         = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [services, setServices] = useState([
    { name: '', category: 'hair', price: '', duration: '30', description: '', image: null },
  ]);
  const [hours, setHours] = useState(defaultHours);

  // ── Auto-detect GPS on mount ─────────────────────────────────────────────
  const detectGPS = useCallback(async (silent = false) => {
    if (!navigator.geolocation) { if (!silent) toast.info('Enter address manually.'); return; }
    if (!silent) toast.info('Detecting your location…', { autoClose: 2000 });
    return new Promise((res) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: c }) => {
          const geo = await reverseGeocode(c.latitude, c.longitude);
          setCoords({ lat: c.latitude, lng: c.longitude });
          setForm((f) => ({
            ...f,
            street:  geo.street  || f.street,
            area:    geo.area    || f.area,
            city:    geo.city    || f.city,
            state:   geo.state   || f.state,
            pincode: geo.pincode || f.pincode,
          }));
          setLocDetected(true);
          if (!silent) toast.success('📍 Location detected! Edit fields if needed.');
          res(geo);
        },
        () => { if (!silent) toast.warning('Could not detect. Enter manually.'); res(null); },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, []);

  useEffect(() => { detectGPS(true); }, [detectGPS]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Map picker confirmed ──────────────────────────────────────────────────
  const handleMapConfirm = (addressObj) => {
    setCoords({ lat: addressObj.lat, lng: addressObj.lng });
    setForm((f) => ({
      ...f,
      street:  addressObj.street  || f.street,
      area:    addressObj.area    || f.area,
      city:    addressObj.city    || f.city,
      state:   addressObj.state   || f.state,
      pincode: addressObj.pincode || f.pincode,
    }));
    setLocDetected(true);
    setShowMapPicker(false);
    toast.success('📍 Location pinned successfully!');
  };

  // ── Step 1 submit ─────────────────────────────────────────────────────────
  const handleSalonSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())  { toast.error('Salon name is required.');  return; }
    if (!form.phone.trim()) { toast.error('Phone number is required.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('category',    form.category);
      fd.append('phone',       form.phone.trim());
      fd.append('email',       form.email.trim());
      fd.append('tags',        form.tags);
      fd.append('address', JSON.stringify({
        street: form.street.trim(), area: form.area.trim(),
        city:   form.city.trim(),   state: form.state.trim(), pincode: form.pincode.trim(),
      }));
      if (coords.lat) { fd.append('latitude',  String(coords.lat)); fd.append('longitude', String(coords.lng)); }
      fd.append('workingHours', JSON.stringify(hours));
      if (coverImage) fd.append('coverImage', coverImage);
      gallery.forEach((f) => fd.append('gallery', f));

      const res = await createSalon(fd);
      setSalonId(res.data.data._id);
      toast.success('✅ Salon registered! Add your services.');
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  // ── Step 2 submit ─────────────────────────────────────────────────────────
  const handleServicesSubmit = async (e) => {
    e.preventDefault();
    const valid = services.filter((s) => s.name.trim() && s.price && s.duration);
    if (!valid.length) { toast.error('Add at least one service with name, price and duration.'); return; }
    setLoading(true);
    try {
      await Promise.all(valid.map((s) => {
        const fd = new FormData();
        fd.append('name', s.name.trim()); fd.append('category', s.category);
        fd.append('price', String(s.price)); fd.append('duration', String(s.duration));
        fd.append('description', s.description || '');
        if (s.image) fd.append('image', s.image);
        return createService(salonId, fd);
      }));
      toast.success('✅ Services saved!');
      setStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Could not save services.');
    } finally { setLoading(false); }
  };

  const addRow    = () => setServices((s) => [...s, { name:'', category:'hair', price:'', duration:'30', description:'', image:null }]);
  const removeRow = (i) => setServices((s) => s.filter((_,idx) => idx!==i));
  const updateSvc = (i,k,v) => setServices((s) => s.map((item,idx) => idx===i ? {...item,[k]:v} : item));
  const updateHour = (i,k,v) => setHours((h) => h.map((item,idx) => idx===i ? {...item,[k]:v} : item));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      {showMapPicker && (
        <MapLocationPicker
          initialLat={coords.lat || 28.6139}
          initialLng={coords.lng || 77.2090}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      <button onClick={() => navigate(-1)} className="text-primary text-sm mb-4 hover:underline">← Back</button>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Register Your Salon</h1>
      <p className="text-sm text-gray-400 mb-6">Complete all 3 steps to go live on MYSALON</p>

      <StepIndicator current={step} />

      {/* ════════════════ STEP 1 ════════════════ */}
      {step === 1 && (
        <form onSubmit={handleSalonSubmit} className="space-y-5">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Basic Information</h2>
            <Field label="Salon Name" name="name" value={form.name} onChange={handleChange} placeholder="StyleSpot Salon" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" required>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition">
                  {SALON_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required type="tel" />
            </div>
            <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="salon@email.com" type="email" />
            <Field label="Description" name="description">
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="What makes your salon special…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition" />
            </Field>
            <Field label="Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange}
              placeholder="Haircut, Bridal, Colour" hint="Shown as chips on your listing card" />
          </div>

          {/* Address with Map Picker */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Salon Location</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => detectGPS(false)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-primary/40 hover:text-primary transition">
                  📍 GPS
                </button>
                <button type="button" onClick={() => setShowMapPicker(true)}
                  className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition font-medium">
                  🗺 Pin on Map
                </button>
              </div>
            </div>

            {locDetected && (
              <div className="bg-secondary-50 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs text-secondary-dark flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>
                  Location pinned at {coords.lat?.toFixed(5)}, {coords.lng?.toFixed(5)}.
                  You can <button type="button" className="underline" onClick={() => setShowMapPicker(true)}>repin on map</button> or edit fields below.
                </span>
              </div>
            )}

            {/* Map thumbnail if location set */}
            {coords.lat && (
              <button type="button" onClick={() => setShowMapPicker(true)}
                className="w-full relative rounded-xl overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary transition group">
                <img
                  src={`https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lng}&zoom=15&size=600x120&markers=${coords.lat},${coords.lng},red`}
                  alt="map preview"
                  className="w-full h-24 object-cover"
                  onError={(e) => { e.target.style.display='none'; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                  <span className="bg-white/90 text-xs font-medium text-primary px-3 py-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition">
                    🗺 Edit on Map
                  </span>
                </div>
              </button>
            )}

            {!coords.lat && (
              <button type="button" onClick={() => setShowMapPicker(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-primary/40 hover:text-primary transition">
                <span className="text-3xl">🗺</span>
                <span className="text-sm font-medium">Open Map to Pin Location</span>
                <span className="text-xs">Drag pin to exact salon location</span>
              </button>
            )}

            <Field label="Street / Building" name="street" value={form.street} onChange={handleChange}
              placeholder="e.g. Shop 12, Sunrise Complex, MG Road" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Area" name="area" value={form.area} onChange={handleChange} placeholder="Koramangala" />
              <Field label="City *" name="city" value={form.city} onChange={handleChange} placeholder="Bengaluru" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State" name="state" value={form.state} onChange={handleChange} placeholder="Karnataka" />
              <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="560001" />
            </div>
          </div>

          {/* Photos */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Salon Photos</h2>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Cover Photo <span className="text-gray-400">(main listing image)</span></p>
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="cover" className="w-full h-36 object-cover rounded-xl" />
                  <button type="button" onClick={() => { setCoverImage(null); setCoverPreview(''); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center shadow">×</button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 text-sm text-gray-400 cursor-pointer hover:border-primary/40 hover:bg-primary-50/30 transition">
                  <span className="text-3xl">📷</span><span>Upload cover photo</span><span className="text-xs">JPG, PNG · Max 5MB</span>
                  <input type="file" accept="image/*" onChange={(e) => { const f=e.target.files?.[0]; if(f){setCoverImage(f);setCoverPreview(URL.createObjectURL(f));} }} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Gallery <span className="text-gray-400">(up to 10)</span></p>
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {galleryPreviews.map((src,i) => (
                    <div key={i} className="relative">
                      <img src={src} alt={`g${i}`} className="w-full h-16 object-cover rounded-lg" />
                      <button type="button" onClick={() => { setGallery(g=>g.filter((_,idx)=>idx!==i)); setGalleryPreviews(p=>p.filter((_,idx)=>idx!==i)); }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow">×</button>
                    </div>
                  ))}
                </div>
              )}
              {gallery.length < 10 && (
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 cursor-pointer hover:border-primary/40 transition">
                  🖼 Add photos ({gallery.length}/10)
                  <input type="file" accept="image/*" multiple onChange={(e) => { const files=Array.from(e.target.files).slice(0,10-gallery.length); setGallery(g=>[...g,...files]); setGalleryPreviews(p=>[...p,...files.map(f=>URL.createObjectURL(f))]); }} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Registering…</span> : 'Save & Continue →'}
          </button>
        </form>
      )}

      {/* ════════════════ STEP 2 — Services ════════════════ */}
      {step === 2 && (
        <form onSubmit={handleServicesSubmit} className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Your Services</h2>
            <p className="text-xs text-gray-400 mb-5">These show like a menu — customers select and book.</p>
            <div className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 relative bg-gray-50/50">
                  {services.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-xl transition">×</button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Service Name *</label>
                      <input value={svc.name} onChange={(e)=>updateSvc(i,'name',e.target.value)} placeholder="e.g. Haircut (Men)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category *</label>
                      <select value={svc.category} onChange={(e)=>updateSvc(i,'category',e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white capitalize">
                        {SERVICE_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Price (₹) *</label>
                      <input type="number" min="0" value={svc.price} onChange={(e)=>updateSvc(i,'price',e.target.value)} placeholder="200" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration (min) *</label>
                      <input type="number" min="5" value={svc.duration} onChange={(e)=>updateSvc(i,'duration',e.target.value)} placeholder="30" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input value={svc.description} onChange={(e)=>updateSvc(i,'description',e.target.value)} placeholder="Brief description" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Photo</label>
                      <label className="flex items-center gap-1.5 border border-dashed border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-400 cursor-pointer hover:border-primary/40 bg-white">
                        📷 {svc.image ? svc.image.name : 'Upload'}
                        <input type="file" accept="image/*" onChange={(e)=>updateSvc(i,'image',e.target.files?.[0])} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="w-full mt-4 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-primary/40 hover:text-primary transition flex items-center justify-center gap-2">
              <span className="text-lg">+</span> Add Another Service
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Back</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving…</span> : 'Save & Continue →'}
            </button>
          </div>
        </form>
      )}

      {/* ════════════════ STEP 3 — Hours ════════════════ */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Working Hours</h2>
            <p className="text-xs text-gray-400 mb-5">Customers see this on your salon page.</p>
            <div className="space-y-3">
              {hours.map((h, i) => (
                <div key={h.day} className="flex items-center gap-3">
                  <div className="w-8 text-xs font-semibold text-gray-500 uppercase">{h.day.slice(0,3)}</div>
                  <button type="button" onClick={() => updateHour(i,'isOpen',!h.isOpen)}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${h.isOpen ? 'bg-secondary' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${h.isOpen ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  {h.isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={h.openTime} onChange={(e)=>updateHour(i,'openTime',e.target.value)} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary bg-white flex-1" />
                      <span className="text-gray-300 text-xs">to</span>
                      <input type="time" value={h.closeTime} onChange={(e)=>updateHour(i,'closeTime',e.target.value)} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary bg-white flex-1" />
                    </div>
                  ) : <span className="text-xs text-gray-300 flex-1 font-medium">Closed</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5 border-secondary/20 bg-secondary-50">
            <div className="flex gap-3 items-start">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Almost there!</p>
                <p className="text-sm text-gray-500">Your salon goes live immediately. Customers nearby can find and book you right away.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">← Back</button>
            <button onClick={() => { toast.success('🎉 Your salon is live!'); navigate('/owner/dashboard'); }} className="btn-primary flex-1 py-3">Go Live 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}