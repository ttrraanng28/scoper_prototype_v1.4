import React from 'react';

const LoadingIndicator = ({ visible, message = "Processing..." }) => {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-center p-3 sm:p-4">
      <div className="flex items-center space-x-3 text-gray-600 bg-white rounded-lg shadow-sm border px-4 py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;