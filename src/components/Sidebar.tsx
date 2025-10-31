import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoleBasedAccess from './RoleBasedAccess';
import {
  Home,
  MapPin,
  ShoppingCart,
  Droplets,
  Users,
  User,
  Calendar,
  CreditCard,
  TrendingUp,
  X,
  Smartphone,
  Shield,
  UserCheck,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
  LineChart,
  MessageSquare,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const MDOModuleNav: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { user } = useAuth();

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  // Only show for MDO role
  if (user?.role !== 'MDO') return null;

  return (
    <div>
      <NavLink
        to="/mdo-module"
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive
              ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Calendar className="mr-3 h-5 w-5" />
          MDO Module
        </div>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-800" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-800" />
          )}
        </div>
      </NavLink>

      {isExpanded && (
        <div className="ml-8 mt-2 space-y-1">
          <NavLink
            to="/field-visits"
            onClick={handleClick}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <MapPin className="mr-3 h-4 w-4" />
            Field Visits
          </NavLink>
        </div>
      )}
    </div>
  );
};

const ActivityTrackerNav: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { user } = useAuth();

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  // Only show for MDO, TSM, and RMM roles
  if (user?.role !== 'MDO' && user?.role !== 'TSM' && user?.role !== 'RMM') return null;

  // Different submenu for TSM/RMM vs MDO
  const isTSM = user?.role === 'TSM';
  const isRMM = user?.role === 'RMM';

  return (
    <div>
      <div
        className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <CheckSquare className="mr-3 h-5 w-5" />
          Activity Tracker
        </div>
        <div className="p-1 hover:bg-gray-200 rounded">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-800" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-800" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="ml-8 mt-2 space-y-1">
          {(isTSM || isRMM) ? (
            <>
              <NavLink
                to="/activity-tracker/my-activity"
                onClick={handleClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xs">My Activity</span>
              </NavLink>
              <NavLink
                to="/activity-tracker/team-activity"
                onClick={handleClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xs">Team Activity</span>
              </NavLink>
              <NavLink
                to="/activity-tracker/work-plans"
                onClick={handleClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xs">Work Plans</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/activity-tracker/work-plans"
                onClick={handleClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xs">My Work Plans</span>
              </NavLink>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const LiquidationNav: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div>
      <NavLink
        to="/liquidation"
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive
              ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`
        }
        onClick={(e) => {
          handleClick();
        }}
      >
        <div className="flex items-center">
          <Droplets className="mr-3 h-5 w-5" />
          Liquidation
        </div>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-800" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-800" />
          )}
        </div>
      </NavLink>

      {isExpanded && (
        <div className="ml-8 mt-2 space-y-1">
          <NavLink
            to="/reports"
            onClick={handleClick}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            Reports
          </NavLink>
          <NavLink
            to="/retailer-stock-verification"
            onClick={handleClick}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <ShoppingCart className="mr-3 h-4 w-4" />
            Retailer Stock
          </NavLink>
        </div>
      )}
    </div>
  );
};
const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'MDO Module', href: '/mdo-module', icon: Calendar, allowedRoles: ['MDO'], isSubmenu: true },
  { name: 'Activity Tracker', href: '/activity-tracker', icon: CheckSquare, allowedRoles: ['MDO', 'SO', 'TSM', 'RBH', 'ZBH', 'RMM', 'MH', 'VP', 'MD', 'sfaadmin'], isSubmenu: true },
  { name: 'User Management', href: '/user-management', icon: Shield, allowedRoles: ['MD', 'CHRO', 'VP_SM', 'ZBH', 'MH', 'sfaadmin'] },
  { name: 'Field Visits', href: '/field-visits', icon: MapPin, allowedRoles: ['TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM'] },
  { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
  { name: 'Liquidation', href: '/liquidation', icon: Droplets, isSubmenu: true },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Approvals', href: '/approvals', icon: UserCheck, allowedRoles: ['TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM'] },
  { name: 'Mobile App Design', href: '/mobile-design', icon: Smartphone, allowedRoles: ['MD', 'VP_SM', 'MH'] },
  { name: 'Mobile App', href: '/mobile', icon: Smartphone },
];

const documentationNavigation = [
  { name: 'Business Logic', href: '/business-logic', icon: FileText, allowedRoles: ['ADMIN'] },
  { name: 'Technical Documentation', href: '/tech-docs', icon: FileText, allowedRoles: ['ADMIN'] },
];

const planningNavigation = [
  { name: 'My Work Plan', href: '/work-plan', icon: Calendar, allowedRoles: ['MDO', 'TSM', 'RBH', 'RMM'] },
  { name: 'Manage Work Plans', href: '/work-plan-management', icon: Users, allowedRoles: ['TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM'] },
];

const financialNavigation = [
  { name: 'Travel Reimbursement', href: '/travel', icon: CreditCard, allowedRoles: ['TSM', 'RBH', 'RMM', 'ZBH', 'MH', 'VP_SM', 'MD', 'CFO', 'CHRO'] },
  { name: 'Activity Reimbursement', href: '/activity-reimbursement', icon: FileText },
  { name: 'Performance & Incentives', href: '/performance', icon: TrendingUp },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const limitedNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Activity Tracker', href: '/activity-tracker', icon: CheckSquare, allowedRoles: ['MDO', 'SO', 'TSM', 'RBH', 'ZBH', 'RMM', 'MH', 'VP', 'MD', 'sfaadmin'], isSubmenu: true },
    { name: 'Liquidation', href: '/liquidation', icon: Droplets, isSubmenu: true },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Approvals', href: '/approvals', icon: UserCheck },
  ];

  const navToShow = isAdmin ? navigation : limitedNavigation;

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6  border-gray-200">
       
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-6">
        <div>
          <ul className="space-y-2">
            {navToShow.map((item) => (
              <RoleBasedAccess
                key={item.name}
                allowedRoles={item.allowedRoles}
              >
                {item.name === 'MDO Module' ? (
                  <li>
                    <MDOModuleNav onItemClick={handleNavClick} />
                  </li>
                ) : item.name === 'Activity Tracker' ? (
                  <li>
                    <ActivityTrackerNav onItemClick={handleNavClick} />
                  </li>
                ) : item.name === 'Liquidation' ? (
                  <li>
                    <LiquidationNav onItemClick={handleNavClick} />
                  </li>
                ) : item.name === 'Field Visits' && user?.role === 'MDO' ? (
                  null
                ) : (
                  <li>
                    <NavLink
                      to={item.href}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  </li>
                )}
              </RoleBasedAccess>
            ))}
          </ul>
        </div>


        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Financial Management
          </h3>
          <ul className="mt-2 space-y-2">
            {financialNavigation.map((item) => (
              <RoleBasedAccess
                key={item.name}
                allowedRoles={item.allowedRoles}
              >
                <li>
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              </RoleBasedAccess>
            ))}
          </ul>
        </div>

        {/* Analytics Section */}
        <RoleBasedAccess allowedRoles={['RBH', 'ZBH', 'RMM', 'MH', 'VP_SM', 'VP', 'MD', 'CHRO', 'CFO']}>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Analytics
            </h3>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/analytics"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <LineChart className="mr-3 h-5 w-5" />
                  Analytics
                </NavLink>
              </li>
            </ul>
          </div>
        </RoleBasedAccess>

        {/* Support Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Support
          </h3>
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/support-tickets"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                Support Tickets
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <User className="mr-3 h-5 w-5" />
                My Profile
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Documentation Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Documentation
          </h3>
          <ul className="space-y-2">
            {documentationNavigation.map((item) => (
              <RoleBasedAccess
                key={item.name}
                allowedRoles={item.allowedRoles}
              >
                <li>
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              </RoleBasedAccess>
            ))}
          </ul>
        </div>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'GC'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;