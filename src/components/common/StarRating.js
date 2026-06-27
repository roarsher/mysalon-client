const StarRating = ({ rating = 0, count, size = 'sm' }) => {
  const s = size === 'lg' ? 'text-lg' : 'text-sm';
  return (
    <span className={`inline-flex items-center gap-1 ${s}`}>
      <span className="text-yellow-400">★</span>
      <span className="font-medium text-gray-800">{Number(rating).toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-gray-400 text-xs">({count})</span>
      )}
    </span>
  );
};

export default StarRating;