import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'table';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  type = 'card'
}) => {
  const renderCardSkeleton = () => (
    <div className="border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-5 gap-4 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 mb-3 py-4 border-t border-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return renderListSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'card':
      default:
        return renderCardSkeleton();
    }
  };

  if (type === 'table') {
    return renderSkeleton();
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={index < count - 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
