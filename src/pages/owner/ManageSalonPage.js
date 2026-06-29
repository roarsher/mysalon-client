// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import {
//   getSalonById,
//   updateSalon,
//   getServices,
//   createService,
//   updateService,
//   deleteService,
//   toggleService,
//   deleteGalleryImage,
// } from '../../services/api';
// import { SALON_CATEGORIES, CATEGORY_LABELS, formatPrice, formatDuration } from '../../utils/helpers';
// import Spinner from '../../components/common/Spinner';

// const SERVICE_CATEGORIES = [
//   'hair','skin','beard','nail','bridal','spa','makeup','threading','waxing','massage','other'
// ];

// // ── Small reusable input ──────────────────────────────────────────────────────
// function Field({ label, name, value, onChange, type = 'text', placeholder, span, as, rows }) {
//   const cls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary';
//   return (
//     <div className={span === 2 ? 'col-span-2' : ''}>
//       <label className="block text-xs text-gray-500 mb-1">{label}</label>
//       {as === 'textarea'
//         ? <textarea name={name} value={value} onChange={onChange} rows={rows || 3} placeholder={placeholder} className={`${cls} resize-none`} />
//         : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
//       }
//     </div>
//   );
// }

// // ── Tabs ─────────────────────────────────────────────────────────────────────
// const TABS = ['Details', 'Services', 'Photos'];

// export default function ManageSalonPage() {
//   const { id }    = useParams();
//   const navigate  = useNavigate();

//   const [salon,    setSalon]    = useState(null);
//   const [services, setServices] = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [saving,   setSaving]   = useState(false);
//   const [tab,      setTab]      = useState('Details');

//   // ── Salon edit form state ─────────────────────────────────────────────────
//   const [form, setForm] = useState({
//     name: '', description: '', category: '', phone: '', email: '',
//     tags: '', isOpen: true,
//     street: '', area: '', city: '', state: '', pincode: '',
//   });
//   const [coverFile,   setCoverFile]   = useState(null);
//   const [coverPreview,setCoverPreview]= useState('');
//   const [galleryFiles,setGalleryFiles]= useState([]);

//   // ── Service modal state ───────────────────────────────────────────────────
//   const [showModal,   setShowModal]   = useState(false);
//   const [editingId,   setEditingId]   = useState(null); // null = create new
//   const [svcForm,     setSvcForm]     = useState({
//     name: '', category: 'hair', price: '', duration: '', description: '',
//   });
//   const [svcImage,    setSvcImage]    = useState(null);
//   const [svcSaving,   setSvcSaving]   = useState(false);

//   // ── Load data ─────────────────────────────────────────────────────────────
//   useEffect(() => {
//     Promise.all([getSalonById(id), getServices(id)])
//       .then(([sRes, svRes]) => {
//         const s = sRes.data.data;
//         setSalon(s);
//         setServices(svRes.data.data || []);
//         setForm({
//           name:        s.name         || '',
//           description: s.description  || '',
//           category:    s.category     || "men's",
//           phone:       s.phone        || '',
//           email:       s.email        || '',
//           tags:        (s.tags || []).join(', '),
//           isOpen:      s.isOpen       ?? true,
//           street:      s.address?.street  || '',
//           area:        s.address?.area    || '',
//           city:        s.address?.city    || '',
//           state:       s.address?.state   || '',
//           pincode:     s.address?.pincode || '',
//         });
//         if (s.coverImage?.url) setCoverPreview(s.coverImage.url);
//       })
//       .catch(() => toast.error('Could not load salon.'))
//       .finally(() => setLoading(false));
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
//   };

//   // ── Save salon details ────────────────────────────────────────────────────
//   const handleSaveDetails = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append('name',        form.name);
//       fd.append('description', form.description);
//       fd.append('category',    form.category);
//       fd.append('phone',       form.phone);
//       fd.append('email',       form.email);
//       fd.append('tags',        form.tags);
//       fd.append('isOpen',      form.isOpen);
//       fd.append('address', JSON.stringify({
//         street: form.street, area: form.area,
//         city:   form.city,   state: form.state, pincode: form.pincode,
//       }));
//       if (coverFile)          fd.append('coverImage', coverFile);
//       galleryFiles.forEach(f => fd.append('gallery', f));

//       const res = await updateSalon(id, fd);
//       setSalon(res.data.data);
//       toast.success('Salon details saved!');
//       setCoverFile(null);
//       setGalleryFiles([]);
//     } catch (err) {
//       toast.error(err.message || 'Save failed.');
//     } finally { setSaving(false); }
//   };

//   // ── Service modal helpers ─────────────────────────────────────────────────
//   const openCreateModal = () => {
//     setEditingId(null);
//     setSvcForm({ name: '', category: 'hair', price: '', duration: '', description: '' });
//     setSvcImage(null);
//     setShowModal(true);
//   };

//   const openEditModal = (svc) => {
//     setEditingId(svc._id);
//     setSvcForm({
//       name:        svc.name        || '',
//       category:    svc.category    || 'hair',
//       price:       String(svc.price    || ''),
//       duration:    String(svc.duration || ''),
//       description: svc.description || '',
//     });
//     setSvcImage(null);
//     setShowModal(true);
//   };

//   const handleSvcSubmit = async (e) => {
//     e.preventDefault();
//     if (!svcForm.name || !svcForm.price || !svcForm.duration) {
//       toast.error('Name, price and duration are required.'); return;
//     }
//     setSvcSaving(true);
//     try {
//       const fd = new FormData();
//       Object.entries(svcForm).forEach(([k, v]) => fd.append(k, v));
//       if (svcImage) fd.append('image', svcImage);

//       if (editingId) {
//         await updateService(id, editingId, fd);
//         toast.success('Service updated!');
//       } else {
//         await createService(id, fd);
//         toast.success('Service added!');
//       }

//       // Refresh services
//       const res = await getServices(id);
//       setServices(res.data.data || []);
//       setShowModal(false);
//     } catch (err) {
//       toast.error(err.message || 'Could not save service.');
//     } finally { setSvcSaving(false); }
//   };

//   const handleToggle = async (svcId) => {
//     try {
//       await toggleService(id, svcId);
//       setServices((prev) =>
//         prev.map((s) => s._id === svcId ? { ...s, isAvailable: !s.isAvailable } : s)
//       );
//     } catch { toast.error('Could not toggle service.'); }
//   };

//   const handleDeleteService = async (svcId) => {
//     if (!window.confirm('Delete this service?')) return;
//     try {
//       await deleteService(id, svcId);
//       setServices((prev) => prev.filter((s) => s._id !== svcId));
//       toast.success('Service deleted.');
//     } catch { toast.error('Could not delete service.'); }
//   };

//   const handleDeleteGalleryImg = async (public_id) => {
//     if (!window.confirm('Remove this photo?')) return;
//     try {
//       await deleteGalleryImage(id, { public_id });
//       setSalon((prev) => ({
//         ...prev,
//         gallery: prev.gallery.filter((g) => g.public_id !== public_id),
//       }));
//       toast.success('Photo removed.');
//     } catch { toast.error('Could not remove photo.'); }
//   };

//   // ── Group services by category for display ────────────────────────────────
//   const grouped = services.reduce((acc, s) => {
//     if (!acc[s.category]) acc[s.category] = [];
//     acc[s.category].push(s);
//     return acc;
//   }, {});

//   if (loading) return <Spinner size="lg" />;
//   if (!salon)  return (
//     <div className="text-center py-20 text-gray-400">
//       <p>Salon not found.</p>
//       <button onClick={() => navigate('/owner/dashboard')} className="mt-4 text-primary text-sm hover:underline">← Dashboard</button>
//     </div>
//   );

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-6">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6">
//         <button onClick={() => navigate('/owner/dashboard')} className="text-primary text-sm hover:underline">← Dashboard</button>
//         <span className="text-gray-300">›</span>
//         <h1 className="text-lg font-semibold text-gray-900 truncate">{salon.name}</h1>
//         <span className={`ml-auto badge text-xs ${salon.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
//           {salon.isOpen ? 'Open' : 'Closed'}
//         </span>
//       </div>

//       {/* Quick action buttons */}
//       <div className="flex gap-2 mb-6">
//         <button onClick={() => navigate(`/owner/queue/${id}`)} className="btn-primary text-sm py-2 px-4">
//           👥 Manage Queue
//         </button>
//         <button onClick={() => navigate(`/salon/${id}`)} className="btn-outline text-sm py-2 px-4">
//           👁 View Page
//         </button>
//       </div>

//       {/* Tabs */}
//       <div className="flex border-b border-gray-200 mb-6">
//         {TABS.map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
//               tab === t
//                 ? 'border-primary text-primary'
//                 : 'border-transparent text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             {t}
//           </button>
//         ))}
//       </div>

//       {/* ══════════════════════════════════════════════════════════════════════
//           TAB 1 — DETAILS
//       ══════════════════════════════════════════════════════════════════════ */}
//       {tab === 'Details' && (
//         <form onSubmit={handleSaveDetails} className="space-y-5">

//           {/* Basic info */}
//           <div className="card p-5">
//             <h2 className="font-semibold text-gray-800 mb-4">Basic Information</h2>
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Salon Name *"  name="name"        value={form.name}        onChange={handleChange} placeholder="StyleSpot Salon" span={2} />
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Category</label>
//                 <select name="category" value={form.category} onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
//                   {SALON_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Status</label>
//                 <label className="flex items-center gap-2 mt-2 cursor-pointer">
//                   <div
//                     onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))}
//                     className={`w-10 h-5 rounded-full transition-colors relative ${form.isOpen ? 'bg-secondary' : 'bg-gray-200'}`}
//                   >
//                     <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${form.isOpen ? 'left-5' : 'left-0.5'}`} />
//                   </div>
//                   <span className="text-sm text-gray-600">{form.isOpen ? 'Open' : 'Closed'}</span>
//                 </label>
//               </div>
//               <Field label="Phone *"      name="phone"       value={form.phone}       onChange={handleChange} placeholder="9876543210" />
//               <Field label="Email"        name="email"       value={form.email}       onChange={handleChange} placeholder="salon@email.com" type="email" />
//               <Field label="Description"  name="description" value={form.description} onChange={handleChange} placeholder="What makes your salon special…" as="textarea" span={2} />
//               <Field label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange} placeholder="Haircut, Bridal, Colour" span={2} />
//             </div>
//           </div>

//           {/* Address */}
//           <div className="card p-5">
//             <h2 className="font-semibold text-gray-800 mb-4">Address</h2>
//             <div className="grid grid-cols-2 gap-3">
//               <Field label="Street"   name="street"  value={form.street}  onChange={handleChange} span={2} />
//               <Field label="Area"     name="area"    value={form.area}    onChange={handleChange} />
//               <Field label="City"     name="city"    value={form.city}    onChange={handleChange} />
//               <Field label="State"    name="state"   value={form.state}   onChange={handleChange} />
//               <Field label="Pincode"  name="pincode" value={form.pincode} onChange={handleChange} />
//             </div>
//           </div>

//           {/* Cover image update */}
//           <div className="card p-5">
//             <h2 className="font-semibold text-gray-800 mb-3">Update Cover Photo</h2>
//             {coverPreview && (
//               <img src={coverPreview} alt="cover" className="w-full h-40 object-cover rounded-xl mb-3" />
//             )}
//             <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 cursor-pointer hover:border-primary/40 transition">
//               📷 {coverFile ? coverFile.name : 'Upload new cover photo'}
//               <input type="file" accept="image/*" onChange={(e) => {
//                 const f = e.target.files?.[0];
//                 if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
//               }} className="hidden" />
//             </label>
//           </div>

//           <button type="submit" disabled={saving} className="btn-primary w-full py-3">
//             {saving ? (
//               <span className="flex items-center justify-center gap-2">
//                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 Saving…
//               </span>
//             ) : 'Save Changes'}
//           </button>
//         </form>
//       )}

//       {/* ══════════════════════════════════════════════════════════════════════
//           TAB 2 — SERVICES
//       ══════════════════════════════════════════════════════════════════════ */}
//       {tab === 'Services' && (
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <p className="text-sm text-gray-500">{services.length} service{services.length !== 1 ? 's' : ''} listed</p>
//             <button onClick={openCreateModal} className="btn-primary text-sm py-2 px-4">
//               + Add Service
//             </button>
//           </div>

//           {services.length === 0 ? (
//             <div className="card p-10 text-center">
//               <div className="text-4xl mb-3">🛎</div>
//               <p className="text-gray-500 text-sm mb-4">No services yet. Add your first service so customers can book.</p>
//               <button onClick={openCreateModal} className="btn-primary text-sm px-5 py-2">Add Service</button>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {Object.entries(grouped).map(([cat, list]) => (
//                 <div key={cat}>
//                   {/* Category header */}
//                   <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
//                     <h3 className="font-semibold text-gray-700 text-sm capitalize">
//                       {CATEGORY_LABELS[cat] || cat}
//                     </h3>
//                     <span className="text-xs text-gray-400">({list.length})</span>
//                   </div>

//                   <div className="space-y-2">
//                     {list.map((svc) => (
//                       <div
//                         key={svc._id}
//                         className={`flex items-center gap-3 p-3 rounded-xl border transition ${
//                           svc.isAvailable ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
//                         }`}
//                       >
//                         {/* Service image */}
//                         {svc.image?.url ? (
//                           <img src={svc.image.url} alt={svc.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
//                         ) : (
//                           <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-lg flex-shrink-0">✂️</div>
//                         )}

//                         {/* Info */}
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium text-gray-900 text-sm truncate">{svc.name}</p>
//                           <p className="text-xs text-gray-400">{formatDuration(svc.duration)} · {formatPrice(svc.price)}</p>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-2 flex-shrink-0">
//                           {/* Available toggle */}
//                           <div
//                             onClick={() => handleToggle(svc._id)}
//                             className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative ${svc.isAvailable ? 'bg-secondary' : 'bg-gray-200'}`}
//                           >
//                             <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${svc.isAvailable ? 'left-4' : 'left-0.5'}`} />
//                           </div>
//                           <button onClick={() => openEditModal(svc)}
//                             className="text-xs text-primary border border-primary/20 px-2 py-1 rounded-lg hover:bg-primary-50 transition">
//                             Edit
//                           </button>
//                           <button onClick={() => handleDeleteService(svc._id)}
//                             className="text-xs text-red-400 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-50 transition">
//                             Del
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ══════════════════════════════════════════════════════════════════════
//           TAB 3 — PHOTOS
//       ══════════════════════════════════════════════════════════════════════ */}
//       {tab === 'Photos' && (
//         <div className="space-y-5">
//           {/* Cover photo */}
//           <div className="card p-5">
//             <h2 className="font-semibold text-gray-800 mb-3">Cover Photo</h2>
//             {salon.coverImage?.url ? (
//               <img src={salon.coverImage.url} alt="cover" className="w-full h-44 object-cover rounded-xl mb-3" />
//             ) : (
//               <div className="w-full h-44 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 mb-3 text-5xl">✂️</div>
//             )}
//             <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 cursor-pointer hover:border-primary/40 transition">
//               📷 Replace cover photo
//               <input type="file" accept="image/*" onChange={(e) => {
//                 const f = e.target.files?.[0];
//                 if (f) {
//                   setCoverFile(f);
//                   // Save immediately
//                   const fd = new FormData();
//                   fd.append('coverImage', f);
//                   updateSalon(id, fd)
//                     .then((res) => { setSalon(res.data.data); toast.success('Cover photo updated!'); })
//                     .catch(() => toast.error('Upload failed.'));
//                 }
//               }} className="hidden" />
//             </label>
//           </div>

//           {/* Gallery */}
//           <div className="card p-5">
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="font-semibold text-gray-800">Gallery ({salon.gallery?.length || 0}/10)</h2>
//               <label className="text-xs text-primary cursor-pointer hover:underline">
//                 + Add photos
//                 <input type="file" accept="image/*" multiple
//                   onChange={(e) => {
//                     const files = Array.from(e.target.files).slice(0, 10 - (salon.gallery?.length || 0));
//                     if (!files.length) { toast.error('Gallery limit reached (max 10).'); return; }
//                     const fd = new FormData();
//                     files.forEach((f) => fd.append('gallery', f));
//                     updateSalon(id, fd)
//                       .then((res) => { setSalon(res.data.data); toast.success('Photos added!'); })
//                       .catch(() => toast.error('Upload failed.'));
//                   }} className="hidden" />
//               </label>
//             </div>

//             {!salon.gallery?.length ? (
//               <p className="text-sm text-gray-400 text-center py-6">No gallery photos yet.</p>
//             ) : (
//               <div className="grid grid-cols-3 gap-2">
//                 {salon.gallery.map((img) => (
//                   <div key={img.public_id} className="relative group">
//                     <img src={img.url} alt="gallery" className="w-full h-24 object-cover rounded-xl" />
//                     <button
//                       onClick={() => handleDeleteGalleryImg(img.public_id)}
//                       className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* ══════════════════════════════════════════════════════════════════════
//           SERVICE MODAL
//       ══════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-5 border-b border-gray-100">
//               <h2 className="font-semibold text-gray-900">
//                 {editingId ? 'Edit Service' : 'Add New Service'}
//               </h2>
//               <button onClick={() => setShowModal(false)}
//                 className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
//                 ×
//               </button>
//             </div>

//             <form onSubmit={handleSvcSubmit} className="p-5 space-y-4">
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Service Name *</label>
//                 <input
//                   value={svcForm.name}
//                   onChange={(e) => setSvcForm((f) => ({ ...f, name: e.target.value }))}
//                   placeholder="e.g. Haircut (Men)"
//                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Category *</label>
//                 <select
//                   value={svcForm.category}
//                   onChange={(e) => setSvcForm((f) => ({ ...f, category: e.target.value }))}
//                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary capitalize"
//                 >
//                   {SERVICE_CATEGORIES.map((c) => (
//                     <option key={c} value={c} className="capitalize">{CATEGORY_LABELS[c] || c}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs text-gray-500 mb-1">Price (₹) *</label>
//                   <input
//                     type="number" min="0" value={svcForm.price}
//                     onChange={(e) => setSvcForm((f) => ({ ...f, price: e.target.value }))}
//                     placeholder="200"
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs text-gray-500 mb-1">Duration (min) *</label>
//                   <input
//                     type="number" min="5" value={svcForm.duration}
//                     onChange={(e) => setSvcForm((f) => ({ ...f, duration: e.target.value }))}
//                     placeholder="30"
//                     className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Description</label>
//                 <textarea
//                   value={svcForm.description}
//                   onChange={(e) => setSvcForm((f) => ({ ...f, description: e.target.value }))}
//                   rows={2} placeholder="Brief description…"
//                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Photo (optional)</label>
//                 <label className="flex items-center gap-2 border border-dashed border-gray-200 rounded-xl py-2.5 px-3 text-xs text-gray-400 cursor-pointer hover:border-primary/40 transition">
//                   📷 {svcImage ? svcImage.name : 'Upload service photo'}
//                   <input type="file" accept="image/*" onChange={(e) => setSvcImage(e.target.files?.[0])} className="hidden" />
//                 </label>
//               </div>

//               <div className="flex gap-2 pt-2">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 py-2.5">
//                   Cancel
//                 </button>
//                 <button type="submit" disabled={svcSaving} className="btn-primary flex-1 py-2.5">
//                   {svcSaving ? 'Saving…' : editingId ? 'Update Service' : 'Add Service'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }











import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getSalonById, updateSalon,
  getServices, createService, updateService, deleteService, toggleService, deleteGalleryImage,
  getSalonStylists, createStylist, updateStylist, deleteStylist, toggleStylist,
} from '../../services/api';
import { SALON_CATEGORIES, CATEGORY_LABELS, formatPrice, formatDuration } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';

const SERVICE_CATEGORIES = [
  'hair','skin','beard','nail','bridal','spa','makeup','threading','waxing','massage','other'
];

const SPECIALITIES = ['Haircut','Hair Colour','Highlights','Keratin','Bridal','Facial','Beard','Waxing','Makeup','Nail Art','Massage','Threading'];

function Field({ label, name, value, onChange, type = 'text', placeholder, span, as, rows }) {
  const cls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary';
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {as === 'textarea'
        ? <textarea name={name} value={value} onChange={onChange} rows={rows || 3} placeholder={placeholder} className={`${cls} resize-none`} />
        : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

const TABS = ['Details', 'Services', 'Stylists', 'Photos'];

export default function ManageSalonPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [salon,    setSalon]    = useState(null);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState('Details');

  const [form, setForm] = useState({
    name: '', description: '', category: '', phone: '', email: '',
    tags: '', isOpen: true,
    street: '', area: '', city: '', state: '', pincode: '',
  });
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Service modal
  const [showSvcModal, setShowSvcModal] = useState(false);
  const [editingSvcId, setEditingSvcId] = useState(null);
  const [svcForm,      setSvcForm]      = useState({ name: '', category: 'hair', price: '', duration: '', description: '' });
  const [svcImage,     setSvcImage]     = useState(null);
  const [svcSaving,    setSvcSaving]    = useState(false);

  // Stylist modal
  const [showStyModal,  setShowStyModal]  = useState(false);
  const [editingStyId,  setEditingStyId]  = useState(null);
  const [styForm,       setStyForm]       = useState({ name: '', experience: '', bio: '', speciality: [] });
  const [styPhoto,      setStyPhoto]      = useState(null);
  const [styPhotoPreview, setStyPhotoPreview] = useState('');
  const [stySaving,     setStySaving]     = useState(false);

  useEffect(() => {
    Promise.all([getSalonById(id), getServices(id), getSalonStylists(id)])
      .then(([sRes, svRes, stRes]) => {
        const s = sRes.data.data;
        setSalon(s);
        setServices(svRes.data.data || []);
        setStylists(stRes.data.data || []);
        setForm({
          name: s.name || '', description: s.description || '',
          category: s.category || "men's", phone: s.phone || '', email: s.email || '',
          tags: (s.tags || []).join(', '), isOpen: s.isOpen ?? true,
          street: s.address?.street || '', area: s.address?.area || '',
          city: s.address?.city || '', state: s.address?.state || '', pincode: s.address?.pincode || '',
        });
        if (s.coverImage?.url) setCoverPreview(s.coverImage.url);
      })
      .catch(() => toast.error('Could not load salon.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('description', form.description);
      fd.append('category', form.category); fd.append('phone', form.phone);
      fd.append('email', form.email); fd.append('tags', form.tags);
      fd.append('isOpen', form.isOpen);
      fd.append('address', JSON.stringify({ street: form.street, area: form.area, city: form.city, state: form.state, pincode: form.pincode }));
      if (coverFile) fd.append('coverImage', coverFile);
      galleryFiles.forEach(f => fd.append('gallery', f));
      const res = await updateSalon(id, fd);
      setSalon(res.data.data);
      toast.success('Salon details saved!');
      setCoverFile(null); setGalleryFiles([]);
    } catch (err) { toast.error(err.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  // ── Service handlers ──────────────────────────────────────────────────────
  const openCreateSvc = () => {
    setEditingSvcId(null);
    setSvcForm({ name: '', category: 'hair', price: '', duration: '', description: '' });
    setSvcImage(null); setShowSvcModal(true);
  };
  const openEditSvc = (svc) => {
    setEditingSvcId(svc._id);
    setSvcForm({ name: svc.name || '', category: svc.category || 'hair', price: String(svc.price || ''), duration: String(svc.duration || ''), description: svc.description || '' });
    setSvcImage(null); setShowSvcModal(true);
  };
  const handleSvcSubmit = async (e) => {
    e.preventDefault();
    if (!svcForm.name || !svcForm.price || !svcForm.duration) { toast.error('Name, price and duration are required.'); return; }
    setSvcSaving(true);
    try {
      const fd = new FormData();
      Object.entries(svcForm).forEach(([k, v]) => fd.append(k, v));
      if (svcImage) fd.append('image', svcImage);
      if (editingSvcId) { await updateService(id, editingSvcId, fd); toast.success('Service updated!'); }
      else              { await createService(id, fd); toast.success('Service added!'); }
      const res = await getServices(id);
      setServices(res.data.data || []);
      setShowSvcModal(false);
    } catch (err) { toast.error(err.message || 'Could not save service.'); }
    finally { setSvcSaving(false); }
  };
  const handleToggleSvc = async (svcId) => {
    try { await toggleService(id, svcId); setServices((prev) => prev.map((s) => s._id === svcId ? { ...s, isAvailable: !s.isAvailable } : s)); }
    catch { toast.error('Could not toggle service.'); }
  };
  const handleDeleteSvc = async (svcId) => {
    if (!window.confirm('Delete this service?')) return;
    try { await deleteService(id, svcId); setServices((prev) => prev.filter((s) => s._id !== svcId)); toast.success('Service deleted.'); }
    catch { toast.error('Could not delete service.'); }
  };

  // ── Stylist handlers ──────────────────────────────────────────────────────
  const openCreateSty = () => {
    setEditingStyId(null);
    setStyForm({ name: '', experience: '', bio: '', speciality: [] });
    setStyPhoto(null); setStyPhotoPreview('');
    setShowStyModal(true);
  };
  const openEditSty = (sty) => {
    setEditingStyId(sty._id);
    setStyForm({ name: sty.name || '', experience: String(sty.experience || ''), bio: sty.bio || '', speciality: sty.speciality || [] });
    setStyPhoto(null); setStyPhotoPreview(sty.photo?.url || '');
    setShowStyModal(true);
  };
  const toggleSpeciality = (sp) => {
    setStyForm((f) => ({
      ...f,
      speciality: f.speciality.includes(sp) ? f.speciality.filter(x => x !== sp) : [...f.speciality, sp],
    }));
  };
  const handleStySubmit = async (e) => {
    e.preventDefault();
    if (!styForm.name) { toast.error('Stylist name is required.'); return; }
    setStySaving(true);
    try {
      const fd = new FormData();
      fd.append('name', styForm.name);
      fd.append('experience', styForm.experience || 0);
      fd.append('bio', styForm.bio);
      styForm.speciality.forEach(sp => fd.append('speciality', sp));
      if (styPhoto) fd.append('photo', styPhoto);

      if (editingStyId) { await updateStylist(id, editingStyId, fd); toast.success('Stylist updated!'); }
      else              { await createStylist(id, fd); toast.success('Stylist added!'); }

      const res = await getSalonStylists(id);
      setStylists(res.data.data || []);
      setShowStyModal(false);
    } catch (err) { toast.error(err.message || 'Could not save stylist.'); }
    finally { setStySaving(false); }
  };
  const handleToggleSty = async (styId) => {
    try {
      await toggleStylist(id, styId);
      setStylists((prev) => prev.map((s) => s._id === styId ? { ...s, isActive: !s.isActive } : s));
    } catch { toast.error('Could not toggle stylist.'); }
  };
  const handleDeleteSty = async (styId) => {
    if (!window.confirm('Remove this stylist?')) return;
    try { await deleteStylist(id, styId); setStylists((prev) => prev.filter((s) => s._id !== styId)); toast.success('Stylist removed.'); }
    catch { toast.error('Could not remove stylist.'); }
  };

  const handleDeleteGalleryImg = async (public_id) => {
    if (!window.confirm('Remove this photo?')) return;
    try {
      await deleteGalleryImage(id, { public_id });
      setSalon((prev) => ({ ...prev, gallery: prev.gallery.filter((g) => g.public_id !== public_id) }));
      toast.success('Photo removed.');
    } catch { toast.error('Could not remove photo.'); }
  };

  const grouped = services.reduce((acc, s) => { if (!acc[s.category]) acc[s.category] = []; acc[s.category].push(s); return acc; }, {});

  if (loading) return <Spinner size="lg" />;
  if (!salon)  return <div className="text-center py-20 text-gray-400"><p>Salon not found.</p><button onClick={() => navigate('/owner/dashboard')} className="mt-4 text-primary text-sm hover:underline">← Dashboard</button></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/owner/dashboard')} className="text-primary text-sm hover:underline">← Dashboard</button>
        <span className="text-gray-300">›</span>
        <h1 className="text-lg font-semibold text-gray-900 truncate">{salon.name}</h1>
        <span className={`ml-auto badge text-xs ${salon.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{salon.isOpen ? 'Open' : 'Closed'}</span>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => navigate(`/owner/queue/${id}`)} className="btn-primary text-sm py-2 px-4">👥 Manage Queue</button>
        <button onClick={() => navigate(`/salon/${id}`)} className="btn-outline text-sm py-2 px-4">👁 View Page</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
            {t === 'Stylists' && stylists.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{stylists.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── DETAILS TAB ──────────────────────────────────────────────────────── */}
      {tab === 'Details' && (
        <form onSubmit={handleSaveDetails} className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Salon Name *" name="name" value={form.name} onChange={handleChange} placeholder="StyleSpot Salon" span={2} />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  {SALON_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <div onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))} className={`w-10 h-5 rounded-full transition-colors relative ${form.isOpen ? 'bg-secondary' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${form.isOpen ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-600">{form.isOpen ? 'Open' : 'Closed'}</span>
                </label>
              </div>
              <Field label="Phone *" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
              <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="salon@email.com" type="email" />
              <Field label="Description" name="description" value={form.description} onChange={handleChange} placeholder="What makes your salon special…" as="textarea" span={2} />
              <Field label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange} placeholder="Haircut, Bridal, Colour" span={2} />
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Address</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Street" name="street" value={form.street} onChange={handleChange} span={2} />
              <Field label="Area"   name="area"   value={form.area}   onChange={handleChange} />
              <Field label="City"   name="city"   value={form.city}   onChange={handleChange} />
              <Field label="State"  name="state"  value={form.state}  onChange={handleChange} />
              <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Update Cover Photo</h2>
            {coverPreview && <img src={coverPreview} alt="cover" className="w-full h-40 object-cover rounded-xl mb-3" />}
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 cursor-pointer hover:border-primary/40 transition">
              📷 {coverFile ? coverFile.name : 'Upload new cover photo'}
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} className="hidden" />
            </label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span> : 'Save Changes'}
          </button>
        </form>
      )}

      {/* ── SERVICES TAB ─────────────────────────────────────────────────────── */}
      {tab === 'Services' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{services.length} service{services.length !== 1 ? 's' : ''}</p>
            <button onClick={openCreateSvc} className="btn-primary text-sm py-2 px-4">+ Add Service</button>
          </div>
          {services.length === 0 ? (
            <div className="card p-10 text-center"><div className="text-4xl mb-3">🛎</div><p className="text-gray-500 text-sm mb-4">No services yet.</p><button onClick={openCreateSvc} className="btn-primary text-sm px-5 py-2">Add Service</button></div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, list]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700 text-sm capitalize">{CATEGORY_LABELS[cat] || cat}</h3>
                    <span className="text-xs text-gray-400">({list.length})</span>
                  </div>
                  <div className="space-y-2">
                    {list.map((svc) => (
                      <div key={svc._id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${svc.isAvailable ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                        {svc.image?.url
                          ? <img src={svc.image.url} alt={svc.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          : <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center text-lg flex-shrink-0">✂️</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{svc.name}</p>
                          <p className="text-xs text-gray-400">{formatDuration(svc.duration)} · {formatPrice(svc.price)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div onClick={() => handleToggleSvc(svc._id)} className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative ${svc.isAvailable ? 'bg-secondary' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${svc.isAvailable ? 'left-4' : 'left-0.5'}`} />
                          </div>
                          <button onClick={() => openEditSvc(svc)} className="text-xs text-primary border border-primary/20 px-2 py-1 rounded-lg hover:bg-primary-50 transition">Edit</button>
                          <button onClick={() => handleDeleteSvc(svc._id)} className="text-xs text-red-400 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-50 transition">Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STYLISTS TAB ─────────────────────────────────────────────────────── */}
      {tab === 'Stylists' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{stylists.length} stylist{stylists.length !== 1 ? 's' : ''}</p>
            <button onClick={openCreateSty} className="btn-primary text-sm py-2 px-4">+ Add Stylist</button>
          </div>

          {stylists.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">💈</div>
              <p className="text-gray-500 font-medium">No stylists added yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">Add your staff so customers can pick their preferred stylist</p>
              <button onClick={openCreateSty} className="btn-primary text-sm px-5 py-2">Add First Stylist</button>
            </div>
          ) : (
            <div className="space-y-3">
              {stylists.map((sty) => (
                <div key={sty._id} className={`card p-4 flex items-center gap-4 ${!sty.isActive ? 'opacity-60' : ''}`}>
                  {/* Photo / initials */}
                  {sty.photo?.url
                    ? <img src={sty.photo.url} alt={sty.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">💈</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{sty.name}</p>
                      {sty.experience > 0 && <span className="text-xs text-gray-400">{sty.experience}yr exp</span>}
                    </div>
                    {sty.speciality?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sty.speciality.slice(0, 3).map((sp) => (
                          <span key={sp} className="text-xs bg-primary-50 text-primary px-2 py-0.5 rounded-full">{sp}</span>
                        ))}
                        {sty.speciality.length > 3 && <span className="text-xs text-gray-400">+{sty.speciality.length - 3}</span>}
                      </div>
                    )}
                    {sty.bio && <p className="text-xs text-gray-400 mt-1 truncate">{sty.bio}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div onClick={() => handleToggleSty(sty._id)} className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative ${sty.isActive ? 'bg-secondary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${sty.isActive ? 'left-4' : 'left-0.5'}`} />
                    </div>
                    <button onClick={() => openEditSty(sty)} className="text-xs text-primary border border-primary/20 px-2 py-1 rounded-lg hover:bg-primary-50 transition">Edit</button>
                    <button onClick={() => handleDeleteSty(sty._id)} className="text-xs text-red-400 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-50 transition">Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PHOTOS TAB ───────────────────────────────────────────────────────── */}
      {tab === 'Photos' && (
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Cover Photo</h2>
            {salon.coverImage?.url
              ? <img src={salon.coverImage.url} alt="cover" className="w-full h-44 object-cover rounded-xl mb-3" />
              : <div className="w-full h-44 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 mb-3 text-5xl">✂️</div>
            }
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 cursor-pointer hover:border-primary/40 transition">
              📷 Replace cover photo
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); const fd = new FormData(); fd.append('coverImage', f); updateSalon(id, fd).then((res) => { setSalon(res.data.data); toast.success('Cover updated!'); }).catch(() => toast.error('Upload failed.')); } }} className="hidden" />
            </label>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Gallery ({salon.gallery?.length || 0}/10)</h2>
              <label className="text-xs text-primary cursor-pointer hover:underline">+ Add photos
                <input type="file" accept="image/*" multiple onChange={(e) => { const files = Array.from(e.target.files).slice(0, 10 - (salon.gallery?.length || 0)); if (!files.length) { toast.error('Gallery limit reached.'); return; } const fd = new FormData(); files.forEach((f) => fd.append('gallery', f)); updateSalon(id, fd).then((res) => { setSalon(res.data.data); toast.success('Photos added!'); }).catch(() => toast.error('Upload failed.')); }} className="hidden" />
              </label>
            </div>
            {!salon.gallery?.length
              ? <p className="text-sm text-gray-400 text-center py-6">No gallery photos yet.</p>
              : <div className="grid grid-cols-3 gap-2">
                  {salon.gallery.map((img) => (
                    <div key={img.public_id} className="relative group">
                      <img src={img.url} alt="gallery" className="w-full h-24 object-cover rounded-xl" />
                      <button onClick={() => handleDeleteGalleryImg(img.public_id)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow">×</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}

      {/* ── SERVICE MODAL ─────────────────────────────────────────────────────── */}
      {showSvcModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editingSvcId ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowSvcModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">×</button>
            </div>
            <form onSubmit={handleSvcSubmit} className="p-5 space-y-4">
              <div><label className="block text-xs text-gray-500 mb-1">Service Name *</label><input value={svcForm.name} onChange={(e) => setSvcForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Haircut (Men)" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Category *</label><select value={svcForm.category} onChange={(e) => setSvcForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary capitalize">{SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">Price (₹) *</label><input type="number" min="0" value={svcForm.price} onChange={(e) => setSvcForm((f) => ({ ...f, price: e.target.value }))} placeholder="200" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Duration (min) *</label><input type="number" min="5" value={svcForm.duration} onChange={(e) => setSvcForm((f) => ({ ...f, duration: e.target.value }))} placeholder="30" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              </div>
              <div><label className="block text-xs text-gray-500 mb-1">Description</label><textarea value={svcForm.description} onChange={(e) => setSvcForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Photo (optional)</label><label className="flex items-center gap-2 border border-dashed border-gray-200 rounded-xl py-2.5 px-3 text-xs text-gray-400 cursor-pointer hover:border-primary/40 transition">📷 {svcImage ? svcImage.name : 'Upload service photo'}<input type="file" accept="image/*" onChange={(e) => setSvcImage(e.target.files?.[0])} className="hidden" /></label></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowSvcModal(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={svcSaving} className="btn-primary flex-1 py-2.5">{svcSaving ? 'Saving…' : editingSvcId ? 'Update' : 'Add Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STYLIST MODAL ─────────────────────────────────────────────────────── */}
      {showStyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editingStyId ? 'Edit Stylist' : 'Add Stylist'}</h2>
              <button onClick={() => setShowStyModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">×</button>
            </div>
            <form onSubmit={handleStySubmit} className="p-5 space-y-4">

              {/* Photo upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {styPhotoPreview
                    ? <img src={styPhotoPreview} alt="stylist" className="w-full h-full object-cover" />
                    : <span className="text-2xl">💈</span>
                  }
                </div>
                <label className="flex-1 border border-dashed border-gray-200 rounded-xl py-2.5 px-3 text-xs text-gray-400 cursor-pointer hover:border-primary/40 transition text-center">
                  📷 {styPhoto ? styPhoto.name : 'Upload photo'}
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setStyPhoto(f); setStyPhotoPreview(URL.createObjectURL(f)); } }} className="hidden" />
                </label>
              </div>

              <div><label className="block text-xs text-gray-500 mb-1">Name *</label><input value={styForm.name} onChange={(e) => setStyForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Rahul Kumar" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>

              <div><label className="block text-xs text-gray-500 mb-1">Experience (years)</label><input type="number" min="0" max="50" value={styForm.experience} onChange={(e) => setStyForm((f) => ({ ...f, experience: e.target.value }))} placeholder="3" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>

              <div><label className="block text-xs text-gray-500 mb-1">Bio</label><textarea value={styForm.bio} onChange={(e) => setStyForm((f) => ({ ...f, bio: e.target.value }))} rows={2} placeholder="Brief intro about this stylist…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary" /></div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Specialities</label>
                <div className="flex flex-wrap gap-1.5">
                  {SPECIALITIES.map((sp) => {
                    const sel = styForm.speciality.includes(sp);
                    return (
                      <button key={sp} type="button" onClick={() => toggleSpeciality(sp)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition ${sel ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'}`}>
                        {sel ? '✓ ' : ''}{sp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowStyModal(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={stySaving} className="btn-primary flex-1 py-2.5">{stySaving ? 'Saving…' : editingStyId ? 'Update' : 'Add Stylist'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}