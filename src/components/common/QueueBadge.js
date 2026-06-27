import { queueColor, formatWait } from '../../utils/helpers';

const QueueBadge = ({ count = 0, wait = 0 }) => {
  const color = queueColor(count);
  return (
    <span className={`badge ${color}`}>
      👥 {count === 0 ? 'No wait — walk in!' : `${count} ahead · ${formatWait(wait)}`}
    </span>
  );
};

export default QueueBadge;