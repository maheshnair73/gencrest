import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top */}
      <div className='fixed top-0 right-0 left-0 w-full z-50'>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />
      </div>

      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-40 pt-16">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 sm:w-72 flex-col">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content - Adjusts for sidebar on desktop */}
      <main className="pt-14 sm:pt-16 lg:pl-64 min-h-screen">
        <div className="px-0 sm:px-4 lg:px-8 py-0 sm:py-4 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;