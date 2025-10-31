import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  fullscreen?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loader: React.FC<LoaderProps> = ({
  fullscreen = false,
  text = 'Loading...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-3">
          <Loader2 className={`${sizeClasses[size]} text-purple-600 animate-spin`} />
          <p className={`${textSizeClasses[size]} text-gray-700 font-medium`}>{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} text-purple-600 animate-spin`} />
      <span className={`${textSizeClasses[size]} text-gray-700`}>{text}</span>
    </div>
  );
};

export default Loader;
