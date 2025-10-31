import React from 'react';
import { Home, Activity, Users, ShoppingCart, FileText, MoreHorizontal, Droplets, CheckSquare, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  userRole,
}) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'liquidation', icon: Droplets, label: 'Liquidation' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'more', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 z-10">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
