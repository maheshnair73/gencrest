/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { X, Building, CreditCard, ShoppingCart, Package, DollarSign, User, Phone, Mail, MapPin, FileText, Calendar, CheckCircle, Wallet, Eye, AlertTriangle, FileArchive, Navigation, RefreshCw, CreditCard as Edit2 } from 'lucide-react';
import { useLiquidation } from '../contexts/LiquidationContext';
import { LocationVerificationModal } from './LocationVerificationModal';
import LoadingSkeleton from './LoadingSkeleton';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Entity360ViewProps {
  distributorCode: string;
  onClose: () => void;
  userRole?: string;
}

const Entity360View: React.FC<Entity360ViewProps> = ({ distributorCode, onClose, userRole = 'MDO' }) => {

  const [mainTab, setMainTab] = useState<'profile' | 'visits' | 'orders' | 'liquidation' | 'activity'>('profile');
  const [profileSubTab, setProfileSubTab] = useState<'contact' | 'business' | 'retailers'>('contact');
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [proofModalTab, setProofModalTab] = useState<'proof' | 'details'>('proof');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationModalData, setLocationModalData] = useState<{
    distance: number;
    locationName: string;
  } | null>(null);
  const [showLocationMethodModal, setShowLocationMethodModal] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [foundAddress, setFoundAddress] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { distributorStats, fetchDistributorStats, loadingDistributorStats, error } = useLiquidation();
  const { user } = useAuth();

  // Roles that can bypass location restrictions (case-insensitive check)
  const canBypassLocation = ['ADMIN', 'RMM', 'RBH', 'ZBH', 'VP', 'CFO', 'CHRO', 'MH', 'MD'].includes(userRole.toUpperCase());

  // Function to save location to database
  const saveLocationToDatabase = async (lat: number, lng: number) => {
    try {
      const { error } = await supabase
        .from('distributors')
        .update({
          latitude: lat,
          longitude: lng,
          location_verified: true,
          location_verified_at: new Date().toISOString(),
          location_verified_by: user?.id || 'unknown'
        })
        .eq('code', distributorCode);

      if (error) {
        console.error('Error saving location:', error);
      } else {
        console.log('Location saved successfully');
      }
    } catch (err) {
      console.error('Failed to save location:', err);
    }
  };

  useEffect(() => {
    if (distributorCode) {
      fetchDistributorStats(distributorCode);
    }
  }, [distributorCode, fetchDistributorStats]);

  useEffect(() => {
    console.log('Entity360View: distributorStats changed:', distributorStats);
    console.log('Entity360View: loadingDistributorStats:', loadingDistributorStats);
    console.log('Entity360View: error:', error);
  }, [distributorStats, loadingDistributorStats, error]);

  useEffect(() => {
    // Simulate: Some dealers have location verified, some don't
    // For demo: GENCREST-HO, DIST001 and DIST002 have location, others don't
    if (distributorCode === 'GENCREST-HO' || distributorCode === 'DIST001' || distributorCode === 'DIST002') {
      // Gencrest HO: Mumbai coordinates
      if (distributorCode === 'GENCREST-HO') {
        setLocation({ lat: 19.0760, lng: 72.8777 }); // Mumbai
      } else {
        setLocation({ lat: 28.6139, lng: 77.2090 }); // Delhi
      }
      setShowLocationPopover(false); // Close popover if location exists
    } else {
      setLocation(null); // Location not verified
      setShowLocationPopover(true); // Auto-open popover to prompt verification
    }
  }, [distributorCode]);

  const hasLocation = location && location.lat && location.lng;

  // Handler for manual location submit
  const handleManualLocationSubmit = async () => {
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude values');
      return;
    }

    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180');
      return;
    }

    setLocation({ lat, lng });
    await saveLocationToDatabase(lat, lng);
    setShowLocationMethodModal(false);
    setManualLatitude('');
    setManualLongitude('');
  };

  // Handler for GPS location verification
  const handleVerifyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          setLocation({
            lat: userLat,
            lng: userLng
          });
          await saveLocationToDatabase(userLat, userLng);
          setShowLocationMethodModal(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your browser permissions or use manual entry.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please use manual entry.');
    }
  };

  // Handler for autocomplete address search
  const handleSearchAddressAutocomplete = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handler for selecting a suggestion
  const handleSelectSuggestion = (suggestion: any) => {
    setManualLatitude(suggestion.lat);
    setManualLongitude(suggestion.lon);
    setFoundAddress(suggestion.display_name);
    setSearchAddress(suggestion.display_name);
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  // Handler for address-based location search
  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      alert('Please enter an address to search');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setManualLatitude(result.lat);
        setManualLongitude(result.lon);
        setFoundAddress(result.display_name || searchAddress);
      } else {
        alert('Address not found. Please try a different address or enter coordinates manually.');
        setFoundAddress('');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Unable to search for address. Please enter coordinates manually.');
      setFoundAddress('');
    }
  };

  // --- Modal Layout Wrapper ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4 capitalize">
      <div className="bg-white rounded-none sm:rounded-xl w-screen sm:w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 sm:p-6 flex justify-between items-center relative">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-90" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">
                {distributorStats?.distributorName || 'Loading Distributor...'}
              </h2>
              {distributorStats?.distributorCode && (
                <p className="text-sm text-teal-50">Code: {distributorStats.distributorCode}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Location Indicator - Only show when data is loaded */}
            {!loadingDistributorStats && (
              <div className="relative">
                <button
                  onClick={() => setShowLocationPopover(!showLocationPopover)}
                  className={`relative px-3 py-2 rounded-lg transition-all shadow-lg flex items-center gap-2 ${
                    hasLocation
                      ? 'bg-white text-green-600 hover:bg-green-50'
                      : 'bg-white text-amber-600 hover:bg-amber-50 animate-pulse'
                  }`}
                  title={hasLocation ? 'Location Verified' : 'Verify Location Required'}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs font-semibold hidden sm:inline">
                    {hasLocation ? 'Verified' : 'Verify Location'}
                  </span>
                  {hasLocation ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                  )}
                </button>

                {/* Location Popover */}
                {showLocationPopover && (
                  <LocationPopover
                    hasLocation={hasLocation}
                    location={location}
                    setLocation={setLocation}
                    saveLocationToDatabase={saveLocationToDatabase}
                    onClose={() => setShowLocationPopover(false)}
                    distributorAddress={distributorStats?.contact?.address}
                    canBypassLocation={canBypassLocation}
                    setShowLocationModal={setShowLocationModal}
                    setLocationModalData={setLocationModalData}
                    setShowLocationMethodModal={setShowLocationMethodModal}
                  />
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-gray-50">
          {loadingDistributorStats && (
            <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[400px]">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-teal-600 mb-6"></div>
              <p className="text-gray-900 text-xl font-semibold">Loading Distributor Details...</p>
              <p className="text-gray-600 text-sm mt-2">Please wait while we fetch the data</p>
            </div>
          )}

          {!loadingDistributorStats && error && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 text-lg font-medium">Failed to Load Distributor</p>
              <p className="text-gray-500 text-sm mt-2">{error}</p>
              <button
                onClick={() => fetchDistributorStats(distributorCode)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loadingDistributorStats && !error && distributorStats && (
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="bg-blue-50 border-b border-blue-200 px-4 flex overflow-x-auto scrollbar-hide">
                {['profile', 'visits', 'orders', 'liquidation', 'activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMainTab(tab as any)}
                    className={`px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${mainTab === tab
                        ? 'text-blue-700 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-400'
                      }`}
                  >
                    {{
                      profile: 'Profile & Performance',
                      visits: 'Visits',
                      orders: 'Orders',
                      liquidation: 'Liquidation',
                      activity: '360° Activity'
                    }[tab]}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {mainTab === 'profile' && (
                  <ProfileTab
                    distributorStats={distributorStats}
                    location={location}
                    setLocation={setLocation}
                    hasLocation={hasLocation}
                    profileSubTab={profileSubTab}
                    setProfileSubTab={setProfileSubTab}
                  />
                )}
                {mainTab === 'visits' && <VisitsTab visits={distributorStats.visits || []} />}
                {mainTab === 'orders' && <OrdersTab orders={distributorStats.orders || []} />}
                {mainTab === 'liquidation' && (
                  <LiquidationTab
                    liquidations={distributorStats.liquidation || []}
                    setSelectedProof={setSelectedProof}
                    setShowProofModal={setShowProofModal}
                  />
                )}
                {mainTab === 'activity' && <ActivityTab activity={distributorStats.activityTimeline || []} />}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proof Modal */}
      {showProofModal && selectedProof && selectedProof.proofData && (
        <ProofModal proof={selectedProof.proofData} onClose={() => { setShowProofModal(false); setSelectedProof(null); }} />
      )}

      {/* Location Verification Modal */}
      <LocationVerificationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        distance={locationModalData?.distance || 0}
        locationName={locationModalData?.locationName || "the dealer's location"}
        requiredRadius={500}
      />

      {/* Location Method Selection Modal */}
      {showLocationMethodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col my-4">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Update Location</h3>
                </div>
                <button
                  onClick={() => {
                    setShowLocationMethodModal(false);
                    setManualLatitude('');
                    setManualLongitude('');
                    setSearchAddress('');
                    setFoundAddress('');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-teal-50 text-xs mt-1">Choose how you want to update the location</p>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {/* Current Address in Database */}
              {distributorStats?.contact?.address && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        Current Address in Database
                      </label>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        {distributorStats.contact.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Option 1: At the Store */}
              <button
                onClick={() => {
                  handleVerifyLocation();
                }}
                className="w-full p-3 border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-teal-100 p-3 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <Navigation className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">I'm at the Store</h4>
                    <p className="text-sm text-gray-600">
                      Use my current location to update the store's coordinates
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Manual Entry */}
              <div className="border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 p-2.5 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-0.5">Manual Entry</h4>
                    <p className="text-xs text-gray-600">
                      Search by address or enter coordinates directly
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Address Search with Autocomplete */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Search Address (Type building name or locality)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g., Ashok Nagar, Delhi or building name"
                        value={searchAddress}
                        onChange={(e) => {
                          setSearchAddress(e.target.value);
                          handleSearchAddressAutocomplete(e.target.value);
                        }}
                        onFocus={() => {
                          if (searchSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      />
                      {isSearching && (
                        <div className="absolute right-2 top-2">
                          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full px-2 py-2 text-left text-xs hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 line-clamp-2">{suggestion.display_name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Start typing to see suggestions (min 3 characters)</p>
                  </div>

                  {/* Display found address and Map Preview */}
                  {foundAddress && manualLatitude && manualLongitude && (
                    <div className="space-y-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <label className="block text-xs font-medium text-green-800 mb-1">
                          Found Address - Click To Select & Copy
                        </label>
                        <input
                          type="text"
                          value={foundAddress}
                          readOnly
                          className="w-full px-2 py-1.5 text-xs bg-white border border-green-300 rounded text-gray-700 cursor-pointer hover:bg-green-50"
                          onClick={(e) => {
                            e.currentTarget.select();
                            navigator.clipboard.writeText(foundAddress);
                          }}
                          title="Click to select and copy"
                        />
                      </div>

                      {/* Map Preview */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="180"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(manualLongitude) - 0.01},${parseFloat(manualLatitude) - 0.01},${parseFloat(manualLongitude) + 0.01},${parseFloat(manualLatitude) + 0.01}&layer=mapnik&marker=${manualLatitude},${manualLongitude}`}
                        />
                        <div className="bg-gray-100 px-2 py-1 text-center">
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${manualLatitude}&mlon=${manualLongitude}#map=16/${manualLatitude}/${manualLongitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Larger Map & Adjust Pin
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Manual Coordinates - Same Line */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g., 19.0760"
                        value={manualLatitude}
                        onChange={(e) => setManualLatitude(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-0.5">Range: -90 To 90</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g., 72.8777"
                        value={manualLongitude}
                        onChange={(e) => setManualLongitude(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-0.5">Range: -180 To 180</p>
                    </div>
                  </div>

                  <button
                    onClick={handleManualLocationSubmit}
                    disabled={!manualLatitude || !manualLongitude}
                    className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Coordinates
                  </button>
                </div>
              </div>

              {/* Helper Text */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-800 font-medium">Pro Tip:</p>
                    <p className="text-xs text-amber-700 mt-1">
                      You can search for an address above, or get coordinates from Google Maps by right-clicking on a location
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entity360View;

/* ------------------- HELPER SUBCOMPONENTS ------------------- */

const ProfileTab = ({ distributorStats, location, setLocation, hasLocation, profileSubTab, setProfileSubTab }: any) => {
  const { financials, contact, businessDetails, ageing, territory, status } = distributorStats || {};
  const [retailers, setRetailers] = React.useState<any[]>([]);
  const [loadingRetailers, setLoadingRetailers] = React.useState(true);

  React.useEffect(() => {
    const fetchRetailers = async () => {
      if (!distributorStats?.code) return;

      try {
        setLoadingRetailers(true);
        const { data, error } = await supabase
          .from('outlets')
          .select('*')
          .eq('distributor_code', distributorStats.code)
          .eq('status', 'Active');

        if (error) throw error;
        setRetailers(data || []);
      } catch (error) {
        console.error('Error fetching retailers:', error);
        setRetailers([]);
      } finally {
        setLoadingRetailers(false);
      }
    };

    fetchRetailers();
  }, [distributorStats?.code]);

  return (
    <div className="flex flex-col h-full">
      {/* Financial Metrics - Always visible */}
      <div className="p-4 sm:p-6 pb-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <MetricCard icon={<CreditCard />} label="Total Credit Limit" value={financials?.creditLimit} color="blue" />
          <MetricCard icon={<ShoppingCart />} label="Total Purchases" value={financials?.totalPurchases} color="green" />
          <MetricCard icon={<Package />} label="Balance Credit Limit" value={financials?.balanceCredit} color="purple" />
          <MetricCard icon={<DollarSign />} label="Total Payments" value={financials?.totalPayments} color="orange" />
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 px-4 sm:px-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setProfileSubTab('contact')}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              profileSubTab === 'contact'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Contact Info
            </div>
          </button>
          <button
            onClick={() => setProfileSubTab('business')}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              profileSubTab === 'business'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Business Details
            </div>
          </button>
          <button
            onClick={() => setProfileSubTab('retailers')}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              profileSubTab === 'retailers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Connected Retailers
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {retailers.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Sub-tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Contact Information Tab */}
        {profileSubTab === 'contact' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <InfoRow icon={<User />} label="Contact Person" value={contact?.person} />
              <InfoRow icon={<Phone />} label="Phone" value={contact?.phone} />
              <InfoRow icon={<Mail />} label="Email" value={contact?.email} />
              <InfoRow icon={<MapPin />} label="Address" value={contact?.address} />

              {/* Location Coordinates */}
              <div className="flex items-start py-3 border-t border-gray-100 mt-3">
                <Navigation className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Location</p>
                  {location && location.lat && location.lng ? (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Lat:</span> {location.lat.toFixed(6)}, <span className="font-medium">Lng:</span> {location.lng.toFixed(6)}
                      </p>
                      <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Not Verified
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    alert('Edit location feature coming soon!');
                  }}
                  className="ml-2 p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                  title="Edit Location"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ageing Analysis */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Ageing Analysis</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(ageing || {}).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <div className="text-2xl font-bold text-blue-700">₹{((v as number) / 1000).toFixed(1)}K</div>
                    <p className="text-xs text-gray-500">{k.replace('days', '').replace('Plus', '+')} Days</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Business Details Tab */}
        {profileSubTab === 'business' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-semibold mb-4">Business Details</h3>
              <DetailRow label="Territory" value={territory} />
              <DetailRow label="Status" value={status} chipColor="green" />
              <DetailRow label="GST Number" value={businessDetails?.gstNumber} />
              <DetailRow label="PAN Number" value={businessDetails?.panNumber} />
              {businessDetails?.assignedMDO?.name && <DetailRow
                label="Assigned MDO"
                value={`${businessDetails.assignedMDO.name} (${businessDetails.assignedMDO.designation})`}
              />}
              {businessDetails?.assignedTSM?.name && <DetailRow
                label="Assigned TSM"
                value={`${businessDetails.assignedTSM.name} (${businessDetails.assignedTSM.designation})`}
              />}
              {businessDetails?.assignedRBH?.name && <DetailRow
                label="Assigned RBH"
                value={`${businessDetails.assignedRBH.name} (${businessDetails.assignedRBH.designation})`}
              />}
              {businessDetails?.assignedZBH?.name && <DetailRow
                label="Assigned ZBH"
                value={`${businessDetails.assignedZBH.name} (${businessDetails.assignedZBH.designation})`}
              />}
            </div>
          </div>
        )}

        {/* Connected Retailers Tab */}
        {profileSubTab === 'retailers' && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Connected Retailers</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {retailers.length}
            </span>
          </div>
        </div>

        {loadingRetailers ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading retailers...</p>
          </div>
        ) : retailers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {retailers.map((retailer) => (
              <div key={retailer.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{retailer.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{retailer.code}</p>
                    {retailer.contact_person && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{retailer.contact_person}</span>
                      </div>
                    )}
                    {retailer.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{retailer.phone}</span>
                      </div>
                    )}
                    {retailer.address && (
                      <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{retailer.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {retailer.territory || 'N/A'}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {retailer.zone || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No retailers connected to this distributor</p>
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
};

const VisitsTab = ({ visits }: any) => (
  <div className="p-4 sm:p-6 space-y-3">
    <h3 className="text-lg font-semibold text-gray-900">Visit History</h3>
    {visits.length ? visits.map((v: any, i: number) => (
      <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold">{v.title}</h4>
          <p className="text-sm text-gray-600">{v.description}</p>
          <p className="text-xs text-gray-500">{v.date} • {v.time}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-3 ${v.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>{v.status}</span>
      </div>
    )) : <p className="text-gray-500 text-sm">No visits found.</p>}
  </div>
);

const OrdersTab = ({ orders }: any) => (
  <div className="p-4 sm:p-6 space-y-3">
    <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
    {orders.map((o: any) => (
      <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between">
        <div>
          <h4 className="font-semibold">{o.id}</h4>
          <p className="text-sm text-gray-600">{o.products}</p>
          <p className="text-xs text-gray-500">{o.date}</p>
        </div>
        <p className="font-semibold text-green-700">₹{(o.value / 1000).toFixed(1)}K</p>
      </div>
    ))}
  </div>
);

const LiquidationTab = ({ liquidations, setSelectedProof, setShowProofModal }: any) => (
  <div className="p-4 sm:p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Liquidation History</h3>
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SKU's Checked</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Done By</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {liquidations.length > 0 ? (
              liquidations.map((liq: any) => (
                <tr key={liq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {new Date(liq.data ? liq.data : '').toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{liq.products}</span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {liq.skuCount || 1} SKU{(liq.skuCount || 1) > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {liq.proofData?.gencrestStaffName || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {liq.proofData?.gencrestStaffDesignation || 'Staff'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedProof(liq);
                        setShowProofModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                  No liquidation history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ActivityTab = ({ activity }: any) => (
  <div className="p-4 sm:p-6 space-y-3">
    <h3 className="text-lg font-semibold text-gray-900">360° Activity</h3>
    {activity.map((a: any, i: number) => (
      <div key={i} className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900">{a.title}</h4>
        <p className="text-sm text-gray-600">{a.description}</p>
        <p className="text-xs text-gray-500 mt-1">{a.date} • {a.time}</p>
      </div>
    ))}
  </div>
);

const MetricCard = ({ icon, label, value, color }: any) => {
  // Format value in lakhs
  const valueInLakhs = value ? (value / 100000).toFixed(2) : '0.00';

  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3 sm:p-4`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <h4 className={`text-sm font-medium text-${color}-800`}>{label}</h4>
      <p className={`text-2xl font-bold text-${color}-900`}>₹{valueInLakhs}</p>
      <p className={`text-xs text-${color}-600 mt-1`}>Rs. Lakhs</p>
    </div>
  );
};

const InfoRow = ({ icon, label, value }: any) => (
  <div className="flex items-start space-x-3 mb-2">
    {icon}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 text-sm">{value}</p>
    </div>
  </div>
);

const LocationPopover = ({ hasLocation, location, setLocation, saveLocationToDatabase, onClose, distributorAddress, canBypassLocation, setShowLocationModal, setLocationModalData, setShowLocationMethodModal }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude values');
      return;
    }

    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180');
      return;
    }

    setLocation({ lat, lng });
    setShowLocationMethodModal(false);
    setShowLocationPopover(false);
    setManualLatitude('');
    setManualLongitude('');
  };

  const handleVerifyLocation = () => {
    setIsVerifying(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Admin roles and MDO/field roles can capture distributor location remotely
          // They don't need to be physically present at distributor's location
          // They're capturing WHERE THE DISTRIBUTOR IS, not verifying their own location

          // Only TSMs need to be physically at the location for field verification
          const requiresPhysicalPresence = userRole.toUpperCase() === 'TSM';

          // Admin roles always bypass
          if (canBypassLocation) {
            setLocation({
              lat: userLat,
              lng: userLng
            });
            await saveLocationToDatabase(userLat, userLng);
            setIsVerifying(false);
            setShowLocationMethodModal(false);
            setShowLocationPopover(false);
            return;
          }

          // For MDO and other field roles: Allow remote location capture
          // They're simply capturing/updating the distributor's coordinates
          if (!requiresPhysicalPresence) {
            setLocation({
              lat: userLat,
              lng: userLng
            });
            await saveLocationToDatabase(userLat, userLng);
            setIsVerifying(false);
            setShowLocationMethodModal(false);
            setShowLocationPopover(false);
            return;
          }

          // For TSM: Verify they are physically present at distributor location
          // In real implementation, get actual distributor coordinates from database/geocoding
          // For now, we'll allow it since we don't have actual distributor coordinates
          const dealerLat = 28.6139; // TODO: Replace with actual distributor lat from database
          const dealerLng = 77.2090; // TODO: Replace with actual distributor lng from database

          const distance = calculateDistance(userLat, userLng, dealerLat, dealerLng);
          const MAX_DISTANCE_KM = 0.5; // 500 meters

          if (distance > MAX_DISTANCE_KM) {
            setLocationModalData({
              distance: distance * 1000, // Convert to meters
              locationName: distributorAddress || "distributor's location"
            });
            setShowLocationModal(true);
            setIsVerifying(false);
            return;
          }

          // Location verified successfully
          setLocation({
            lat: userLat,
            lng: userLng
          });
          await saveLocationToDatabase(userLat, userLng);
          setIsVerifying(false);
          setShowLocationMethodModal(false);
          setShowLocationPopover(false);
        },
        (error) => {
          alert('Unable to get location: ' + error.message);
          setIsVerifying(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
      setIsVerifying(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      ></div>

      {/* Popover */}
      <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold text-sm">Location Status</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {!hasLocation ? (
            <>
              <div className="flex items-start gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Location Not Verified</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please verify the dealer's location to continue.
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowLocationMethodModal(true);
                  onClose();
                }}
                disabled={isVerifying}
                className="w-full py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium text-sm"
              >
                <Navigation className="w-4 h-4" />
                Update Location
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Location Verified</p>
                  <p className="text-xs text-green-700 mt-1">
                    This dealer's location has been captured.
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {location?.lat.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {location?.lng.toFixed(6)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLocationMethodModal(true);
                    onClose();
                  }}
                  disabled={isVerifying}
                  className="flex-1 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update
                </button>
                <a
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  View Map
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const LocationDetailsExpanded = ({ location, setLocation, distributorCode }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');

  const handleVerifyLocation = () => {
    setIsVerifying(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsVerifying(false);
        },
        (error) => {
          alert('Unable to get location: ' + error.message);
          setIsVerifying(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
      setIsVerifying(false);
    }
  };

  const handleSaveLocation = () => {
    const lat = parseFloat(editLat);
    const lng = parseFloat(editLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng });
      setIsEditing(false);
    } else {
      alert('Please enter valid coordinates');
    }
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {!isEditing ? (
        <>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Latitude:</span>
              <span className="font-mono font-semibold text-gray-900">
                {location?.lat.toFixed(6) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Longitude:</span>
              <span className="font-mono font-semibold text-gray-900">
                {location?.lng.toFixed(6) || 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleVerifyLocation}
              disabled={isVerifying}
              className="flex-1 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Update
                </>
              )}
            </button>
            <button
              onClick={() => {
                setEditLat(location?.lat.toString() || '');
                setEditLng(location?.lng.toString() || '');
                setIsEditing(true);
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {location && (
            <a
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-center text-xs text-teal-600 hover:text-teal-700 hover:underline"
            >
              View on Google Maps
            </a>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="text"
              value={editLat}
              onChange={(e) => setEditLat(e.target.value)}
              placeholder="28.6139"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="text"
              value={editLng}
              onChange={(e) => setEditLng(e.target.value)}
              placeholder="77.2090"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveLocation}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const LocationSection = ({ distributorCode, location, setLocation }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');

  const handleVerifyLocation = () => {
    setIsVerifying(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsVerifying(false);
        },
        (error) => {
          alert('Unable to get location: ' + error.message);
          setIsVerifying(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
      setIsVerifying(false);
    }
  };

  const handleSaveLocation = () => {
    const lat = parseFloat(editLat);
    const lng = parseFloat(editLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng });
      setIsEditing(false);
    } else {
      alert('Please enter valid coordinates');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Location</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditLat(location?.lat.toString() || '');
              setEditLng(location?.lng.toString() || '');
              setIsEditing(!isEditing);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit Location"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleVerifyLocation}
            disabled={isVerifying}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Location"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isVerifying ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">Coordinates</span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Latitude:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">
                {location?.lat.toFixed(6) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Longitude:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">
                {location?.lng.toFixed(6) || 'N/A'}
              </span>
            </div>
          </div>
          <button
            onClick={handleVerifyLocation}
            disabled={isVerifying}
            className="w-full py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Verify Location
              </>
            )}
          </button>
          {location && (
            <a
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-center text-sm text-teal-600 hover:text-teal-700 hover:underline"
            >
              View on Google Maps
            </a>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="text"
              value={editLat}
              onChange={(e) => setEditLat(e.target.value)}
              placeholder="28.6139"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="text"
              value={editLng}
              onChange={(e) => setEditLng(e.target.value)}
              placeholder="77.2090"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveLocation}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value, chipColor }: any) => (
  <div className="flex justify-between mb-2 capitalize">
    <span className="text-sm text-gray-600">{label}</span>
    {chipColor ? (
      <span className={`px-3 py-1 rounded bg-${chipColor}-100 text-${chipColor}-800 text-xs font-medium`}>{value}</span>
    ) : (
      <span className="font-semibold text-gray-900 text-sm">{value}</span>
    )}
  </div>
);

const ProofModal = ({ proof, onClose }: any) => {
  const [activeTab, setActiveTab] = useState<'signature' | 'documents'>('signature');
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  if (!proof) {
    return null;
  }

  const hasSignature = proof.type === 'esignature' || proof.type === 'photo_esignature';
  const hasPhotos = proof.photos && proof.photos.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Verification Proof</h3>
            <p className="text-sm text-blue-100 mt-1">{proof.signerName} • {proof.signerDesignation}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('signature')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'signature'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            E-Signature
          </button>
          {hasPhotos && (
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'documents'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Photos ({proof.photos?.length || 0})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'signature' && (
            <div className="space-y-6">
              {hasSignature ? (
                <>
                  <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-lg">
                    <img
                      src={proof.signatureImage}
                      alt="Signature"
                      className="max-w-full max-h-64 object-contain mx-auto"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Signature Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Signer Name:</span>
                        <span className="font-medium text-gray-900">{proof.signerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Designation:</span>
                        <span className="font-medium text-gray-900">{proof.signerDesignation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">{proof.signerLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="font-medium text-gray-900">{proof.timestamp}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Captured By:</span>
                          <span className="font-medium text-gray-900">{proof.gencrestStaffName} ({proof.gencrestStaffDesignation})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p>No signature available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && hasPhotos && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proof.photos.map((photoUrl: string, index: number) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <div
                      className="bg-white rounded-lg border-2 border-gray-300 p-2 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                      onClick={() => setSelectedDocUrl(photoUrl)}
                    >
                      <div className="aspect-video flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={photoUrl}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-center text-gray-600 font-medium">
                      Photo {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Full-screen Document Viewer */}
      {selectedDocUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[70] flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedDocUrl(null)}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedDocUrl}
            alt="Document"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Location Method Selection Modal */}
      {showLocationMethodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col my-4">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Update Location</h3>
                </div>
                <button
                  onClick={() => {
                    setShowLocationMethodModal(false);
                    setManualLatitude('');
                    setManualLongitude('');
                    setSearchAddress('');
                    setFoundAddress('');
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-teal-50 text-xs mt-1">Choose how you want to update the location</p>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {/* Current Address in Database */}
              {distributorStats?.contact?.address && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-blue-900 mb-1">
                        Current Address in Database
                      </label>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        {distributorStats.contact.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Option 1: At the Store */}
              <button
                onClick={() => {
                  handleVerifyLocation();
                }}
                className="w-full p-3 border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-teal-100 p-3 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <Navigation className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">I'm at the Store</h4>
                    <p className="text-sm text-gray-600">
                      Use my current location to update the store's coordinates
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Manual Entry */}
              <div className="border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Manual Entry</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Enter coordinates manually (from maps, GPS device, etc.)
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g., 19.0760"
                      value={manualLatitude}
                      onChange={(e) => setManualLatitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g., 72.8777"
                      value={manualLongitude}
                      onChange={(e) => setManualLongitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
                  </div>

                  <button
                    onClick={handleManualLocationSubmit}
                    disabled={!manualLatitude || !manualLongitude}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Coordinates
                  </button>
                </div>
              </div>

              {/* Helper Text */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-800 font-medium">Pro Tip:</p>
                    <p className="text-xs text-amber-700 mt-1">
                      To get coordinates from Google Maps: Right-click on the location → Click the coordinates to copy them
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
