import React from 'react';
import { Search } from 'lucide-react';

interface LiquidationFiltersProps {
  searchType: 'distributor' | 'retailer';
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  onSearchTypeChange: (type: 'distributor' | 'retailer') => void;
  onSearchQueryChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onPriorityFilterChange: (priority: string) => void;
}

export const LiquidationFilters: React.FC<LiquidationFiltersProps> = ({
  searchType,
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchTypeChange,
  onSearchQueryChange,
  onStatusFilterChange,
  onPriorityFilterChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {searchType === 'distributor' ? 'Distributor' : 'Retailer'} Entries
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <select
            value={searchType}
            onChange={(e) => onSearchTypeChange(e.target.value as 'distributor' | 'retailer')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${searchType}s...`}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};
