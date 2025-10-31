import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  text = 'Loading...',
  fullscreen = false
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeMap[size]} text-blue-600 animate-spin`} />
      {text && (
        <p className={`${textSizeMap[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
