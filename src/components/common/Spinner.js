const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-3', lg: 'h-12 w-12 border-4' }[size];
  return (
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <div className={`${s} border-primary-50 border-t-primary rounded-full animate-spin`} />
    </div>
  );
};

export default Spinner;