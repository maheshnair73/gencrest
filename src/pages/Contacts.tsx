import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Phone, Mail, MapPin, Building, ArrowLeft, X, Tag, Navigation, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Entity360View from '../components/Entity360View';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  geo_saved_at: string | null;
  type: 'Retailer' | 'Distributor';
  status: 'Active' | 'Inactive';
  tags: string[];
  territory: string;
  region: string;
  zone?: string;
  state?: string;
  pincode?: string;
}

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTag, setSearchTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGeoPrompt, setShowGeoPrompt] = useState(false);
  const [selectedContactForGeo, setSelectedContactForGeo] = useState<Contact | null>(null);
  const [show360View, setShow360View] = useState(false);
  const [selectedContactFor360, setSelectedContactFor360] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGeo, setSavingGeo] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'distributors' | 'retailers'>('distributors');

  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    company: '',
    role: '',
    phone: '',
    email: '',
    location: '',
    type: 'Retailer',
    status: 'Active',
    tags: [],
    territory: '',
    region: '',
    zone: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedContacts: Contact[] = (data || []).map(contact => ({
        ...contact,
        tags: Array.isArray(contact.tags) ? contact.tags : []
      }));

      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags)));

  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchTag.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.territory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag => contact.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.company || !newContact.phone || !newContact.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          name: newContact.name,
          company: newContact.company,
          role: newContact.role,
          phone: newContact.phone,
          email: newContact.email,
          location: newContact.location,
          type: newContact.type,
          status: newContact.status,
          tags: newContact.tags,
          territory: newContact.territory,
          region: newContact.region,
          zone: newContact.zone,
          state: newContact.state,
          pincode: newContact.pincode
        }]);

      if (error) throw error;

      alert('Contact added successfully!');
      setShowAddModal(false);
      setNewContact({
        name: '',
        company: '',
        role: '',
        phone: '',
        email: '',
        location: '',
        type: 'Retailer',
        status: 'Active',
        tags: [],
        territory: '',
        region: '',
        zone: '',
        state: '',
        pincode: ''
      });
      loadContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    }
  };

  const handleViewDetails = (contact: Contact) => {
    if (!contact.latitude || !contact.longitude) {
      setSelectedContactForGeo(contact);
      setShowGeoPrompt(true);
    } else {
      setSelectedContactFor360(contact.company);
      setShow360View(true);
    }
  };

  const handleSaveGeolocation = async () => {
    if (!selectedContactForGeo) return;

    setSavingGeo(true);
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const { error } = await supabase
            .from('contacts')
            .update({
              latitude,
              longitude,
              geo_saved_at: new Date().toISOString()
            })
            .eq('id', selectedContactForGeo.id);

          if (error) throw error;

          alert('Location saved successfully!');
          setShowGeoPrompt(false);
          setSelectedContactForGeo(null);
          loadContacts();

          const updatedContact = {
            ...selectedContactForGeo,
            latitude,
            longitude
          };
          setSelectedContactFor360(updatedContact.company);
          setShow360View(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Failed to get location. Please enable location access in your browser.');
        }
      );
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location');
    } finally {
      setSavingGeo(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Distributor':
        return 'text-green-700 bg-green-100';
      case 'Retailer':
        return 'text-purple-700 bg-purple-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'text-green-600'
      : 'text-red-600';
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('High Priority')) return 'bg-red-100 text-red-800';
    if (tag.includes('Medium Priority')) return 'bg-yellow-100 text-yellow-800';
    if (tag.includes('Low Priority')) return 'bg-green-100 text-green-800';
    if (tag.includes('Premium')) return 'bg-purple-100 text-purple-800';
    if (tag.includes('New')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const toggleCardExpansion = (contactId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const distributors = filteredContacts.filter(c => c.type === 'Distributor');
  const retailers = filteredContacts.filter(c => c.type === 'Retailer');

  const activeContacts = activeTab === 'distributors' ? distributors : retailers;

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">Manage your distributor and retailer network</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Distributors</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.type === 'Distributor').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retailers</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.type === 'Retailer').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Geo-Tagged</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.latitude && c.longitude).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 sm:flex-[2]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contacts, territories, regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {selectedTags.length > 0 && (
              <button
                onClick={clearAllTags}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center whitespace-nowrap"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </button>
            )}
          </div>

          {searchTag && filteredTags.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Available Tags:</p>
              <div className="flex flex-wrap gap-2">
                {filteredTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTags.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('distributors')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base font-medium transition-all ${
                activeTab === 'distributors'
                  ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Distributors</span>
                <span className="sm:hidden">Dist.</span>
                <span className="ml-1 px-1.5 sm:px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                  {distributors.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('retailers')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-center text-sm sm:text-base font-medium transition-all ${
                activeTab === 'retailers'
                  ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Retailers</span>
                <span className="sm:hidden">Retail.</span>
                <span className="ml-1 px-1.5 sm:px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                  {retailers.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
            <span>
              Showing {activeContacts.length} {activeTab === 'distributors' ? 'distributor' : 'retailer'}{activeContacts.length !== 1 ? 's' : ''}
              {selectedTags.length > 0 && (
                <span className="ml-2">
                  (filtered by {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''})
                </span>
              )}
            </span>
            <span className="text-gray-500">
              {activeContacts.filter(c => c.latitude && c.longitude).length} geo-tagged
            </span>
          </div>

          {activeContacts.length > 0 ? (
            <div className="space-y-4">
              {activeContacts.map((contact) => {
          const isExpanded = expandedCards.has(contact.id);
          return (
            <div key={contact.id} className="bg-white rounded-xl card-shadow card-hover overflow-hidden">
              <div className="p-3 sm:p-6">
                <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-semibold text-base sm:text-lg">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{contact.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{contact.role} at {contact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {contact.latitude && contact.longitude && (
                      <span className="hidden sm:flex px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span className="hidden md:inline">Geo-Tagged</span>
                        <span className="md:hidden">Geo</span>
                      </span>
                    )}
                    <button
                      onClick={() => toggleCardExpansion(contact.id)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                    {contact.type}
                  </span>
                  {contact.latitude && contact.longitude && (
                    <span className="sm:hidden px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Geo
                    </span>
                  )}
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{contact.phone}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{contact.location}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-3 sm:p-6 bg-gray-50">
                  <div className="space-y-4">
                    {contact.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{contact.email}</span>
                      </div>
                    )}

                    {(contact.territory || contact.region || contact.zone || contact.state) && (
                      <div className="grid grid-cols-2 gap-3">
                        {contact.territory && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Territory</p>
                            <p className="text-sm font-medium text-gray-900">{contact.territory}</p>
                          </div>
                        )}
                        {contact.region && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Region</p>
                            <p className="text-sm font-medium text-gray-900">{contact.region}</p>
                          </div>
                        )}
                        {contact.zone && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Zone</p>
                            <p className="text-sm font-medium text-gray-900">{contact.zone}</p>
                          </div>
                        )}
                        {contact.state && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">State</p>
                            <p className="text-sm font-medium text-gray-900">{contact.state}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {contact.latitude && contact.longitude && (
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">GPS Coordinates</p>
                        <p className="text-sm font-mono text-gray-900">
                          {contact.latitude.toFixed(6)}, {contact.longitude.toFixed(6)}
                        </p>
                        {contact.geo_saved_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Saved: {new Date(contact.geo_saved_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })} {new Date(contact.geo_saved_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {contact.tags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => handleViewDetails(contact)}
                        className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
                      >
                        View 360° Details
                      </button>
                      {contact.type === 'Retailer' && (
                        <button
                          onClick={() => navigate(`/retailer-inventory?retailerId=${encodeURIComponent(contact.company)}&retailerName=${encodeURIComponent(contact.name)}`)}
                          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base flex-1 sm:flex-none"
                        >
                          <Building className="w-4 h-4" />
                          <span>View Inventory</span>
                        </button>
                      )}
                      <button className="border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base flex-1 sm:flex-none">
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No {activeTab === 'distributors' ? 'distributors' : 'retailers'} found</p>
            </div>
          )}
        </div>
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No contacts found</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New Contact</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Retailer', 'Distributor'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewContact({ ...newContact, type })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          newContact.type === type
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Enter contact name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Enter company/shop name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder="e.g., Owner, Manager, Proprietor"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={newContact.location}
                    onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                    placeholder="Enter shop/office address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
                    <input
                      type="text"
                      value={newContact.territory}
                      onChange={(e) => setNewContact({ ...newContact, territory: e.target.value })}
                      placeholder="e.g., North Delhi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <input
                      type="text"
                      value={newContact.region}
                      onChange={(e) => setNewContact({ ...newContact, region: e.target.value })}
                      placeholder="e.g., Delhi NCR"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Active', 'Inactive'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setNewContact({ ...newContact, status })}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          newContact.status === status
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGeoPrompt && selectedContactForGeo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Save Shop Location</h3>
              <p className="text-gray-600 mb-6">
                Location not saved for <strong>{selectedContactForGeo.company}</strong>.
                Would you like to save the current GPS coordinates for this shop?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-900 font-medium mb-2">Why save location?</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Track visit authenticity</li>
                  <li>• View on map</li>
                  <li>• Route optimization</li>
                  <li>• Verify field presence</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowGeoPrompt(false);
                    setSelectedContactForGeo(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={savingGeo}
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleSaveGeolocation}
                  disabled={savingGeo}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingGeo ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {show360View && selectedContactFor360 && (
        <Entity360View
          distributorCode={selectedContactFor360}
          onClose={() => {
            setShow360View(false);
            setSelectedContactFor360(null);
          }}
        />
      )}
    </div>
  );
};

export default Contacts;
