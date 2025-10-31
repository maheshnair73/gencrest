import React, { createContext, useContext, useState, useCallback } from 'react';
import Loader from '../components/ui/Loader';

interface LoaderContextType {
  showLoader: (text?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Loading...');

  const showLoader = useCallback((text: string = 'Loading...') => {
    setLoaderText(text);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}
      {isLoading && <Loader fullscreen text={loaderText} size="lg" />}
    </LoaderContext.Provider>
  );
};

export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
