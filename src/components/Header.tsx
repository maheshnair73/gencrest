import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserSwitcher from './UserSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 py-2 sm:py-3 gap-2 sm:gap-4">
        {/* Left Section - Logo and Menu */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img
            src="/Gencrest logo copy copy.png"
            alt="Gencrest"
            className="h-8 sm:h-10 lg:h-12 w-auto"
          />
        </div>

        {/* Center Section - Search (Hidden on mobile) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Right Section - Search (mobile), Notifications and User */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Search"
            aria-label="Toggle search"
          >
            {showMobileSearch ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <UserSwitcher />
        </div>
      </div>

      {/* Mobile Search Bar - Toggleable */}
      {showMobileSearch && (
        <div className="md:hidden px-3 pb-2 animate-in slide-in-from-top duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;