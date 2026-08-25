import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    primary: 'border-blue-900 border-t-transparent',
    amber: 'border-amber-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    red: 'border-red-600 border-t-transparent',
  };

  return (
    <div className={`inline-block rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
