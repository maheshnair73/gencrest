import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { LoaderProvider } from './contexts/LoaderContext';
import App from './App.tsx';
import './index.css';

console.log('=== GENCREST APP STARTING ===');
console.log('Environment:', import.meta.env);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('FATAL: Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; background: white; color: red; font-size: 24px;">ERROR: Root element not found</div>';
  throw new Error('Root element not found');
}

console.log('Root element found, initializing React...');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <LoaderProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </LoaderProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  if (rootElement) {
    rootElement.innerHTML = `<div style="padding: 40px; background: white; color: red; font-size: 18px; font-family: monospace;">
      <h1 style="color: #dc2626;">Error Loading Gencrest App</h1>
      <p style="margin: 20px 0; font-size: 16px;">The application failed to initialize. Check console for details.</p>
      <pre style="background: #fee; padding: 15px; border-radius: 5px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>`;
  }
}