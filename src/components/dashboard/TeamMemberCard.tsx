import React from 'react';

interface TeamMemberCardProps {
  name: string;
  role: string;
  liquidationPercentage: number;
  visitsCompleted: number;
  visitsTarget: number;
  avatar?: string;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  role,
  liquidationPercentage,
  visitsCompleted,
  visitsTarget,
  avatar
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getColorByRole = (role: string) => {
    const colors: { [key: string]: string } = {
      'TSM': 'bg-purple-600',
      'MDO': 'bg-blue-600',
      'ZBH': 'bg-green-600',
      'RBH': 'bg-orange-600',
      'MH': 'bg-pink-600'
    };
    return colors[role] || 'bg-gray-600';
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow card-hover">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getColorByRole(role)} rounded-full flex items-center justify-center flex-shrink-0`}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white font-semibold text-sm sm:text-base">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{name}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{role}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
            <span className="text-gray-600">Liq %:</span>
            <span className="font-semibold text-gray-900">{liquidationPercentage}%</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
            <span className="text-gray-600">Visits:</span>
            <span className="font-semibold text-gray-900">
              {visitsCompleted}/{visitsTarget}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
