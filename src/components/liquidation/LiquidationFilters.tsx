// gencrest_ui/src/components/liquidation/LiquidationFilters.tsx
import React, { useEffect, useState } from 'react';
import { Search, Building2 } from 'lucide-react'; // Using lucide-react for the icon
import { useLiquidation } from '../../contexts/LiquidationContext';
import { supabase } from '../../lib/supabase';

interface Distributor {
  id: string;
  code: string;
  name: string;
  territory: string;
  phone?: string;
}

const LiquidationFilters: React.FC<LiquidationFiltersProps> = ({ setSearchQuery }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<Distributor[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm === '') {
      setSearchQuery('');
      setSuggestions([]);
      setShowDropdown(false);
    } else {
      fetchSuggestions(searchTerm);
    }
  }, [searchTerm]);

  const fetchSuggestions = async (term: string) => {
    if (term.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('distributors')
        .select('id, code, name, territory, phone')
        .or(`name.ilike.%${term}%,code.ilike.%${term}%,phone.ilike.%${term}%,territory.ilike.%${term}%`)
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  function handleSubmit() {
    setSearchQuery(searchTerm);
  }

  useEffect(() => {
    //add event listenter for enter key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit])

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-grow relative">
          <label htmlFor="search-distributor" className="sr-only">
            Search Distributors
          </label>
          <div className="relative">
            <input
              type="text"
              id="search-distributor"
              placeholder="Search by name, code, phone, or location..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchTerm.trim().length >= 2 && suggestions.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowDropdown(false), 200);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="w-full pl-10 pr-24 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {/* Search Icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>

            {/* Search Button inside input */}
            <button
              onClick={handleSubmit}
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1.5 rounded-md font-semibold hover:bg-green-700 transition duration-200 text-sm"
            >
              Search
            </button>

            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {suggestions.map((distributor) => (
                  <div
                    key={distributor.id}
                    onClick={() => {
                      setSearchTerm(distributor.name);
                      setShowDropdown(false);
                      handleSubmit();
                    }}
                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{distributor.name}</p>
                        <p className="text-sm text-gray-600">{distributor.code}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">📍 {distributor.territory}</span>
                          {distributor.phone && (
                            <span className="text-xs text-gray-500">📞 {distributor.phone}</span>
                          )}
                        </div>
                      </div>
                      <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidationFilters;