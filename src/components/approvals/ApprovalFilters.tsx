import React from 'react';
import { Search, X } from 'lucide-react';

interface ApprovalFiltersProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  searchTerm,
  setSearchTerm,
  hasActiveFilters,
  onClearFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="All">All Types</option>
            <option value="monthly_plan">Monthly Plan</option>
            <option value="travel_claim">Travel Claim</option>
            <option value="activity_claim">Activity Claim</option>
            <option value="budget_approval">Budget Approval</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search approvals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Active Filters:</span>
            {selectedType !== 'All' && <span className="ml-2">Type: {selectedType}</span>}
            {selectedStatus !== 'All' && <span className="ml-2">Status: {selectedStatus}</span>}
            {searchTerm && <span className="ml-2">Search: "{searchTerm}"</span>}
          </div>
          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
