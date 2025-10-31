import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { MOCK_RETAILERS, type MockRetailer } from '../../data/mockData';

interface RetailerSelectorProps {
  onSelect: (retailer: { id: string; code: string; name: string; phone: string; address: string }) => void;
  onAddNew: () => void;
  selectedRetailerIds?: string[];
}

export const RetailerSelector: React.FC<RetailerSelectorProps> = ({
  onSelect,
  onAddNew,
  selectedRetailerIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRetailers, setFilteredRetailers] = useState<MockRetailer[]>(MOCK_RETAILERS);

  useEffect(() => {
    const filtered = MOCK_RETAILERS.filter(retailer =>
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.phone.includes(searchTerm) ||
      retailer.territory.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRetailers(filtered);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, phone, or territory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add New</span>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
        {filteredRetailers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No retailers found</p>
            <p className="text-sm mt-1">Try a different search term or add a new retailer</p>
          </div>
        ) : (
          filteredRetailers.map(retailer => {
            const isSelected = selectedRetailerIds.includes(retailer.id);
            return (
              <button
                key={retailer.id}
                onClick={() => !isSelected && onSelect({
                  id: retailer.id,
                  code: retailer.code,
                  name: retailer.name,
                  phone: retailer.phone,
                  address: retailer.address
                })}
                disabled={isSelected}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                    : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{retailer.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {retailer.code}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{retailer.territory}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{retailer.phone}</span>
                      </div>
                      {retailer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{retailer.email}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{retailer.address}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
