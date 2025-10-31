import React from 'react';
import Select from 'react-select';
import { Search, MapPin } from 'lucide-react';

interface ReportsFiltersProps {
  viewMode: 'mdo' | 'outlet' | 'product';
  userRole: string | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedZones: string[];
  setSelectedZones: (zones: string[]) => void;
  selectedStates: string[];
  setSelectedStates: (states: string[]) => void;
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
  selectedTerritories: string[];
  setSelectedTerritories: (territories: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedProducts: string[];
  setSelectedProducts: (products: string[]) => void;
  selectedOutlets: string[];
  setSelectedOutlets: (outlets: string[]) => void;
  selectedDistributors: string[];
  setSelectedDistributors: (distributors: string[]) => void;
  zoneOptions: Array<{ value: string; label: string }>;
  stateOptions: Array<{ value: string; label: string }>;
  regionOptions: Array<{ value: string; label: string }>;
  territoryOptions: Array<{ value: string; label: string }>;
  categoryOptions: Array<{ value: string; label: string }>;
  productOptions: Array<{ value: string; label: string }>;
  outletOptions: Array<{ value: string; label: string }>;
  distributorOptions: Array<{ value: string; label: string }>;
  uniqueTerritories: string[];
  uniqueRegions: string[];
  isRMMOrAbove: boolean;
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  viewMode,
  userRole,
  searchQuery,
  setSearchQuery,
  selectedZones,
  setSelectedZones,
  selectedStates,
  setSelectedStates,
  selectedRegions,
  setSelectedRegions,
  selectedTerritories,
  setSelectedTerritories,
  selectedCategories,
  setSelectedCategories,
  selectedProducts,
  setSelectedProducts,
  selectedOutlets,
  setSelectedOutlets,
  selectedDistributors,
  setSelectedDistributors,
  zoneOptions,
  stateOptions,
  regionOptions,
  territoryOptions,
  categoryOptions,
  productOptions,
  outletOptions,
  distributorOptions,
  uniqueTerritories,
  uniqueRegions,
  isRMMOrAbove
}) => {
  return (
    <>
      {(viewMode === 'mdo' || viewMode === 'outlet') && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {userRole === 'MDO' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by customer name..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {userRole === 'TSM' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by customer name..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {userRole === 'RMM' && (
              <>
                {uniqueTerritories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Territories</label>
                    <Select
                      isMulti
                      options={territoryOptions}
                      value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                      onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                      placeholder="Select territories..."
                      className="text-sm"
                      classNamePrefix="select"
                    />
                  </div>
                )}
                {uniqueRegions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
                    <Select
                      isMulti
                      options={regionOptions}
                      value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                      onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                      placeholder="Select regions..."
                      className="text-sm"
                      classNamePrefix="select"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distributors</label>
                  <Select
                    isMulti
                    options={distributorOptions}
                    value={distributorOptions.filter(opt => selectedDistributors.includes(opt.value))}
                    onChange={(selected) => setSelectedDistributors(selected?.map(s => s.value) || [])}
                    placeholder="Select distributors..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                {outletOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customers</label>
                    <Select
                      isMulti
                      options={outletOptions}
                      value={outletOptions.filter(opt => selectedOutlets.includes(opt.value))}
                      onChange={(selected) => setSelectedOutlets(selected?.map(s => s.value) || [])}
                      placeholder="Select customers..."
                      className="text-sm"
                      classNamePrefix="select"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by customer name..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {userRole === 'RBH' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <Select
                    isMulti
                    options={regionOptions}
                    value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                    onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                    placeholder="Select regions..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Select
                    isMulti
                    options={stateOptions}
                    value={stateOptions.filter(opt => selectedStates.includes(opt.value))}
                    onChange={(selected) => setSelectedStates(selected?.map(s => s.value) || [])}
                    placeholder="Select states..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by customer name..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {(userRole === 'ZBH' || (isRMMOrAbove && userRole !== 'RBH' && userRole !== 'RMM')) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                  <Select
                    isMulti
                    options={zoneOptions}
                    value={zoneOptions.filter(opt => selectedZones.includes(opt.value))}
                    onChange={(selected) => setSelectedZones(selected?.map(s => s.value) || [])}
                    placeholder="Select zones..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <Select
                    isMulti
                    options={regionOptions}
                    value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                    onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                    placeholder="Select regions..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Select
                    isMulti
                    options={stateOptions}
                    value={stateOptions.filter(opt => selectedStates.includes(opt.value))}
                    onChange={(selected) => setSelectedStates(selected?.map(s => s.value) || [])}
                    placeholder="Select states..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by customer name..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {viewMode === 'product' && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select
                isMulti
                options={categoryOptions}
                value={categoryOptions.filter(opt => selectedCategories.includes(opt.value))}
                onChange={(selected) => setSelectedCategories(selected?.map(s => s.value) || [])}
                placeholder="All categories..."
                className="text-sm"
                classNamePrefix="select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <Select
                isMulti
                options={productOptions}
                value={productOptions.filter(opt => selectedProducts.includes(opt.value))}
                onChange={(selected) => setSelectedProducts(selected?.map(s => s.value) || [])}
                placeholder="All products..."
                className="text-sm"
                classNamePrefix="select"
              />
            </div>

            {(userRole === 'MDO' || userRole === 'TSM') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                <Select
                  isMulti
                  options={territoryOptions}
                  value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                  onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                  placeholder="Select territories..."
                  className="text-sm"
                  classNamePrefix="select"
                />
              </div>
            )}

            {userRole === 'RMM' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <Select
                    isMulti
                    options={regionOptions}
                    value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                    onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                    placeholder="Select regions..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
              </>
            )}

            {userRole === 'RBH' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <Select
                    isMulti
                    options={regionOptions}
                    value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                    onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                    placeholder="Select regions..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Select
                    isMulti
                    options={stateOptions}
                    value={stateOptions.filter(opt => selectedStates.includes(opt.value))}
                    onChange={(selected) => setSelectedStates(selected?.map(s => s.value) || [])}
                    placeholder="Select states..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
              </>
            )}

            {(userRole === 'ZBH' || userRole === 'MH' || userRole === 'VP' || userRole === 'MD' || userRole === 'CFO' || userRole === 'CHRO' || userRole === 'ADMIN') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                  <Select
                    isMulti
                    options={zoneOptions}
                    value={zoneOptions.filter(opt => selectedZones.includes(opt.value))}
                    onChange={(selected) => setSelectedZones(selected?.map(s => s.value) || [])}
                    placeholder="Select zones..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <Select
                    isMulti
                    options={regionOptions}
                    value={regionOptions.filter(opt => selectedRegions.includes(opt.value))}
                    onChange={(selected) => setSelectedRegions(selected?.map(s => s.value) || [])}
                    placeholder="Select regions..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <Select
                    isMulti
                    options={stateOptions}
                    value={stateOptions.filter(opt => selectedStates.includes(opt.value))}
                    onChange={(selected) => setSelectedStates(selected?.map(s => s.value) || [])}
                    placeholder="Select states..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                  <Select
                    isMulti
                    options={territoryOptions}
                    value={territoryOptions.filter(opt => selectedTerritories.includes(opt.value))}
                    onChange={(selected) => setSelectedTerritories(selected?.map(s => s.value) || [])}
                    placeholder="Select territories..."
                    className="text-sm"
                    classNamePrefix="select"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
