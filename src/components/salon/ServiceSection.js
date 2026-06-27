import { CATEGORY_LABELS, CATEGORY_ICONS, formatPrice, formatDuration } from '../../utils/helpers';

/**
 * ServiceSection
 * Renders one category group of services on the salon detail page.
 * Looks exactly like a Zomato menu section — category title + list of items.
 *
 * Props:
 *   category   - e.g. "hair"
 *   services   - array of service objects in this category
 *   selected   - array of selected service IDs
 *   onToggle   - fn(serviceId) to add/remove from selection
 */
const ServiceSection = ({ category, services, selected = [], onToggle }) => {
  return (
    <div className="mb-6">
      {/* Category heading */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <span className="text-xl">{CATEGORY_ICONS[category] || '🛎️'}</span>
        <h3 className="font-semibold text-gray-800">
          {CATEGORY_LABELS[category] || category}
        </h3>
        <span className="text-xs text-gray-400 ml-auto">{services.length} service{services.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Service items */}
      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selected.includes(service._id);

          return (
            <div
              key={service._id}
              className={`flex gap-3 p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              {/* Service image (if any) */}
              {service.image?.url && (
                <img
                  src={service.image.url}
                  alt={service.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                    {service.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {service.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">⏱ {formatDuration(service.duration)}</p>
                  </div>

                  {/* Price + Add button */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm mb-1.5">
                      {formatPrice(service.price)}
                    </p>
                    {onToggle ? (
                      <button
                        onClick={() => onToggle(service._id)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-primary border-primary/40 hover:bg-primary-50'
                        }`}
                      >
                        {isSelected ? '✓ Added' : '+ Add'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceSection;