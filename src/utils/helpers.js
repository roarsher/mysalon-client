// Format price in Indian Rupees
export const formatPrice = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`;

// Format duration from minutes to readable string
export const formatDuration = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
};

// Format wait time
export const formatWait = (minutes) => {
  if (!minutes || minutes === 0) return 'No wait';
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
};

// Get queue badge colour class based on count
export const queueColor = (count) => {
  if (count === 0) return 'bg-secondary-50 text-secondary-dark';
  if (count <= 3)  return 'bg-green-100 text-green-800';
  if (count <= 6)  return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Status badge style
export const statusStyle = (status) => ({
  waiting:     'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
  no_show:     'bg-red-100 text-red-600',
}[status] || 'bg-gray-100 text-gray-500');

// Category display names
export const CATEGORY_LABELS = {
  hair:       'Hair',
  skin:       'Skin & Face',
  beard:      'Beard',
  nail:       'Nails',
  bridal:     'Bridal',
  spa:        'Spa',
  makeup:     'Makeup',
  threading:  'Threading',
  waxing:     'Waxing',
  massage:    'Massage',
  other:      'Other',
};

// Category emoji icons for service sections (like Zomato's menu icons)
export const CATEGORY_ICONS = {
  hair:      '✂️',
  skin:      '✨',
  beard:     '🪒',
  nail:      '💅',
  bridal:    '👰',
  spa:       '🧖',
  makeup:    '💄',
  threading: '🧵',
  waxing:    '🕯️',
  massage:   '💆',
  other:     '🛎️',
};

// Salon category options for forms
export const SALON_CATEGORIES = [
  { value: "men's",   label: "Men's Salon" },
  { value: "women's", label: "Women's Salon" },
  { value: 'unisex',  label: 'Unisex Salon' },
  { value: 'bridal',  label: 'Bridal Studio' },
  { value: 'spa',     label: 'Spa & Wellness' },
  { value: 'kids',    label: "Kids' Salon" },
];

// Truncate long text
export const truncate = (text, max = 80) =>
  text?.length > max ? `${text.slice(0, max)}…` : text;

// Time ago string
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};