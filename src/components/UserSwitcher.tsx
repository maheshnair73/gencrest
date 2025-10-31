import React, { useState } from 'react';
import { Users, LogOut, ChevronDown, Shield, Crown, Award, Target, User as UserIcon, X, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleByCode } from '../types/hierarchy';
import { useNavigate } from 'react-router-dom';

const UserSwitcher: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  if (!user) return null;
console.log('user',user)
  const userRole = getRoleByCode(user.role);

  const getRoleColor = (roleCode: string) => {
    switch (roleCode) {
      case 'MDO': return 'bg-blue-100 text-blue-800';
      case 'TSM': return 'bg-green-100 text-green-800';
      case 'RBH': return 'bg-purple-100 text-purple-800';
      case 'RMM': return 'bg-orange-100 text-orange-800';
      case 'ZBH': return 'bg-indigo-100 text-indigo-800';
      case 'MH': return 'bg-pink-100 text-pink-800';
      case 'VP_SM': return 'bg-red-100 text-red-800';
      case 'MD': return 'bg-gray-900 text-white';
      case 'CHRO': return 'bg-teal-100 text-teal-800';
      case 'CFO': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 8) return <Crown className="w-4 h-4" />;
    if (level >= 6) return <Award className="w-4 h-4" />;
    if (level >= 3) return <Target className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 capitalize">{user.name}</p>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs uppercase font-medium ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
            <span className="text-xs text-gray-500 capitalize">{user.territory}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {showDropdown && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-full mt-2 sm:w-96 max-h-[85vh] overflow-y-auto overflow-x-hidden bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 capitalize truncate">{user.name}</h3>
                  <p className="text-sm text-gray-600 uppercase truncate">{user.employeeCode}</p>
                  <div className="flex items-center space-x-2 mt-1 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs uppercase font-medium whitespace-nowrap ${getRoleColor(user.role)}`}>
                      {userRole?.name}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                      {getLevelIcon(userRole?.level || 1)}
                      <span className="ml-1">Level {userRole?.level}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close profile"
              >
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          </div>

          <div className="p-4 overflow-hidden">
            <div className="space-y-2 text-sm overflow-hidden">
              <div className="flex justify-between items-start gap-2 overflow-hidden">
                <span className="text-gray-600 text-xs flex-shrink-0">Email:</span>
                <span className="font-medium text-gray-900 text-right break-all text-xs leading-relaxed">{user.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-start gap-2 overflow-hidden">
                <span className="text-gray-600 text-xs flex-shrink-0">Phone:</span>
                <span className="font-medium text-gray-900 text-right break-all text-xs leading-relaxed">{user.phone || 'N/A'}</span>
              </div>

              {/* Show first location field */}
              {user.role === 'MDO' && user.location && (
                <div className="flex justify-between items-start gap-2 overflow-hidden">
                  <span className="text-gray-600 text-xs flex-shrink-0">Location:</span>
                  <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.location}</span>
                </div>
              )}

              {(user.role === 'MDO' || user.role === 'TSM') && user.territory && (
                <div className="flex justify-between items-start gap-2 overflow-hidden">
                  <span className="text-gray-600 text-xs flex-shrink-0">Territory:</span>
                  <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.territory}</span>
                </div>
              )}

              {/* View More/Less Toggle */}
              {showMoreDetails ? (
                <>
                  {/* MDO: Show Region, State, Zone */}
                  {user.role === 'MDO' && (
                    <>
                      {user.region && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Region:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.region}</span>
                        </div>
                      )}
                      {user.state && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">State:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.state}</span>
                        </div>
                      )}
                      {user.zone && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Zone:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.zone}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* TSM: Show Region, State, Zone */}
                  {user.role === 'TSM' && (
                    <>
                      {user.region && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Region:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.region}</span>
                        </div>
                      )}
                      {user.state && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">State:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.state}</span>
                        </div>
                      )}
                      {user.zone && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Zone:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.zone}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* RBH/RMM: Show Region, State, Zone */}
                  {(user.role === 'RBH' || user.role === 'RMM') && (
                    <>
                      {user.region && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Region:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.region}</span>
                        </div>
                      )}
                      {user.state && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">State:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.state}</span>
                        </div>
                      )}
                      {user.zone && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Zone:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.zone}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* ZBH: Show Zone, States under zone */}
                  {user.role === 'ZBH' && (
                    <>
                      {user.zone && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Zone:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.zone}</span>
                        </div>
                      )}
                      {user.state && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">State:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.state}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* MH and above: Show their scope */}
                  {(user.role === 'MH' || user.role === 'VP_SM' || user.role === 'VP' || user.role === 'MD' || user.role === 'CHRO' || user.role === 'CFO') && (
                    <>
                      {user.zone && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Zone:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.zone}</span>
                        </div>
                      )}
                      {user.region && (
                        <div className="flex justify-between items-start gap-2 overflow-hidden">
                          <span className="text-gray-600 text-xs flex-shrink-0">Region:</span>
                          <span className="font-medium text-gray-900 text-right capitalize break-all text-xs leading-relaxed">{user.region}</span>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : null}

              {/* View More/Less Button */}
              <button
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm py-2 w-full border-t border-gray-200 mt-2 pt-3"
              >
                <span>{showMoreDetails ? 'View less' : 'View more'}</span>
                {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                navigate('/profile');
                setShowDropdown(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className='capitalize'>logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default UserSwitcher;