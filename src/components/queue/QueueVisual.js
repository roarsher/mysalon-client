import { formatWait } from '../../utils/helpers';

/**
 * QueueVisual
 * Shows a row of person bubbles representing people in the queue,
 * with "You" at the end. Like a visual token display board.
 */
const QueueVisual = ({ count = 0, wait = 0, isPaused = false }) => {
  const displayCount = Math.min(count, 7); // show max 7 bubbles

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-secondary animate-pulse'}`} />
          <span className="text-sm font-medium text-gray-900">
            {isPaused ? 'Queue Paused' : 'Live Queue'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {count === 0 ? 'No one waiting' : `${count} waiting`}
        </span>
      </div>

      {/* Bubble strip */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {/* Waiting customers */}
        {Array.from({ length: displayCount }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-primary-50 border-2 border-primary/30
                       flex items-center justify-center text-xs text-primary"
          >
            👤
          </div>
        ))}

        {/* "+N more" overflow */}
        {count > 7 && (
          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200
                          flex items-center justify-center text-xs text-gray-500 font-medium">
            +{count - 7}
          </div>
        )}

        {/* Arrow */}
        {count > 0 && <span className="text-gray-300 text-lg mx-1">›</span>}

        {/* Counter desk */}
        <div className="w-8 h-8 rounded-full bg-secondary-50 border-2 border-secondary/40
                        flex items-center justify-center text-xs text-secondary">
          ✂️
        </div>
      </div>

      {/* Text info */}
      <p className="text-sm text-gray-600">
        {isPaused ? (
          <span className="text-yellow-600 font-medium">Queue is temporarily paused by the salon</span>
        ) : count === 0 ? (
          <><span className="font-semibold text-secondary">No one waiting</span> — you'll be served right away!</>
        ) : (
          <>
            <span className="font-semibold text-gray-900">{count} customer{count > 1 ? 's' : ''}</span>
            {' '}currently ahead · estimated wait{' '}
            <span className="font-semibold text-primary">{formatWait(wait)}</span>
          </>
        )}
      </p>
    </div>
  );
};

export default QueueVisual;