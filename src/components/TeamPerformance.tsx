import React, { useState, useMemo } from 'react';
import { Users, Award, TrendingUp, MapPin, Filter, X, ChevronDown } from 'lucide-react';

interface TopPerformer {
  name: string;
  performance: number;
  zone: string;
  region: string;
  state: string;
  territory?: string;
  employeeCode: string;
}

interface TeamData {
  role: 'ZBH' | 'RBH' | 'TSM' | 'MDO';
  count: number;
  avgPerformance: number;
  topPerformers: TopPerformer[];
}

const MOCK_TEAM_DATA: TeamData[] = [
  {
    role: 'ZBH',
    count: 5,
    avgPerformance: 82,
    topPerformers: [
      { name: 'Suresh Iyer', performance: 92, zone: 'South', region: 'Karnataka', state: 'Karnataka', employeeCode: 'ZBH001' },
      { name: 'Rajesh Gupta', performance: 88, zone: 'North', region: 'Uttar Pradesh', state: 'Uttar Pradesh', employeeCode: 'ZBH002' },
      { name: 'Vijay Sharma', performance: 86, zone: 'West', region: 'Maharashtra', state: 'Maharashtra', employeeCode: 'ZBH003' },
    ]
  },
  {
    role: 'RBH',
    count: 15,
    avgPerformance: 78,
    topPerformers: [
      { name: 'Amit Patel', performance: 89, zone: 'West', region: 'Gujarat', state: 'Gujarat', employeeCode: 'RBH001' },
      { name: 'Priya Singh', performance: 87, zone: 'North', region: 'Punjab', state: 'Punjab', employeeCode: 'RBH002' },
      { name: 'Ramesh Kumar', performance: 85, zone: 'South', region: 'Tamil Nadu', state: 'Tamil Nadu', employeeCode: 'RBH003' },
    ]
  },
  {
    role: 'TSM',
    count: 45,
    avgPerformance: 75,
    topPerformers: [
      { name: 'Rajesh Kumar', performance: 88, zone: 'North', region: 'Haryana', state: 'Haryana', territory: 'Gurgaon', employeeCode: 'TSM001' },
      { name: 'Sneha Reddy', performance: 86, zone: 'South', region: 'Telangana', state: 'Telangana', territory: 'Hyderabad', employeeCode: 'TSM002' },
      { name: 'Anil Desai', performance: 84, zone: 'West', region: 'Maharashtra', state: 'Maharashtra', territory: 'Pune', employeeCode: 'TSM003' },
    ]
  },
  {
    role: 'MDO',
    count: 180,
    avgPerformance: 72,
    topPerformers: [
      { name: 'Vikram Singh', performance: 91, zone: 'North', region: 'Punjab', state: 'Punjab', territory: 'Ludhiana', employeeCode: 'MDO001' },
      { name: 'Deepak Verma', performance: 89, zone: 'South', region: 'Karnataka', state: 'Karnataka', territory: 'Bangalore', employeeCode: 'MDO002' },
      { name: 'Sanjay Mehta', performance: 87, zone: 'West', region: 'Gujarat', state: 'Gujarat', territory: 'Ahmedabad', employeeCode: 'MDO003' },
    ]
  }
];

const ZONES = ['All', 'North', 'South', 'East', 'West'];
const REGIONS = ['All', 'Karnataka', 'Uttar Pradesh', 'Maharashtra', 'Gujarat', 'Punjab', 'Haryana', 'Tamil Nadu', 'Telangana'];
const STATES = ['All', 'Karnataka', 'Uttar Pradesh', 'Maharashtra', 'Gujarat', 'Punjab', 'Haryana', 'Tamil Nadu', 'Telangana'];
const TERRITORIES = ['All', 'Gurgaon', 'Hyderabad', 'Pune', 'Ludhiana', 'Bangalore', 'Ahmedabad'];

export const TeamPerformance: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const filteredTeamData = useMemo(() => {
    return MOCK_TEAM_DATA.map(team => {
      let filteredPerformers = [...team.topPerformers];

      if (selectedZone !== 'All') {
        filteredPerformers = filteredPerformers.filter(p => p.zone === selectedZone);
      }
      if (selectedRegion !== 'All') {
        filteredPerformers = filteredPerformers.filter(p => p.region === selectedRegion);
      }
      if (selectedState !== 'All') {
        filteredPerformers = filteredPerformers.filter(p => p.state === selectedState);
      }
      if (selectedTerritory !== 'All' && team.role === 'TSM' || team.role === 'MDO') {
        filteredPerformers = filteredPerformers.filter(p => p.territory === selectedTerritory);
      }

      return {
        ...team,
        topPerformers: filteredPerformers,
        displayCount: filteredPerformers.length
      };
    });
  }, [selectedZone, selectedRegion, selectedState, selectedTerritory]);

  const hasActiveFilters = selectedZone !== 'All' || selectedRegion !== 'All' ||
                          selectedState !== 'All' || selectedTerritory !== 'All';

  const clearFilters = () => {
    setSelectedZone('All');
    setSelectedRegion('All');
    setSelectedState('All');
    setSelectedTerritory('All');
  };

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Team Structure & Performance
          </h3>
          <p className="text-sm text-gray-600 mt-1">Top performers across all levels</p>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ZONES.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Territory</label>
              <select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TERRITORIES.map(territory => (
                  <option key={territory} value={territory}>{territory}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTeamData.map((team) => (
          <div key={team.role} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{team.role}</h4>
                <p className="text-2xl font-bold text-blue-600">{team.count}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Average Performance</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${team.avgPerformance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{team.avgPerformance}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <p className="text-xs text-gray-600 font-medium">Top Performers</p>
                  </div>
                  {team.topPerformers.length > 1 && (
                    <button
                      onClick={() => setExpandedRole(expandedRole === team.role ? null : team.role)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedRole === team.role ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {team.topPerformers.length > 0 ? (
                  <div className="space-y-2">
                    {team.topPerformers.slice(0, expandedRole === team.role ? undefined : 1).map((performer, idx) => (
                      <div
                        key={performer.employeeCode}
                        className={`p-2 rounded-lg ${idx === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{performer.name}</p>
                            <p className="text-xs text-gray-500">{performer.employeeCode}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{performer.zone}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {performer.state}
                              {performer.territory && ` • ${performer.territory}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-bold text-green-600">{performer.performance}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No data for selected filters</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Active Filters:</strong>{' '}
            {selectedZone !== 'All' && `Zone: ${selectedZone}`}
            {selectedRegion !== 'All' && `, Region: ${selectedRegion}`}
            {selectedState !== 'All' && `, State: ${selectedState}`}
            {selectedTerritory !== 'All' && `, Territory: ${selectedTerritory}`}
          </p>
        </div>
      )}
    </div>
  );
};
