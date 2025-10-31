import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Phone, Mail, MapPin, Building, ArrowLeft, X, Tag } from 'lucide-react';
import Entity360View from '../components/Entity360View';

interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  type: 'Retailer' | 'Distributor';
  status: 'Active' | 'Inactive';
  tags: string[];
  territory: string;
  region: string;
}

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTag, setSearchTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [show360View, setShow360View] = useState(false);
  const [selected360Entity, setSelected360Entity] = useState<any>(null);
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
    region: ''
  });

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Ram Kumar',
      company: 'Ram Kumar Distributors',
      role: 'Owner',
      phone: '+91 98765 43210',
      email: 'ram@example.com',
      location: 'Green Valley, Sector 12',
      type: 'Distributor',
      status: 'Active',
      tags: ['High Priority', 'North Delhi', 'Premium Customer', 'Fertilizers'],
      territory: 'North Delhi',
      region: 'Delhi NCR'
    },
    {
      id: '2',
      name: 'Suresh Sharma',
      company: 'Suresh Traders',
      role: 'Manager',
      phone: '+91 87654 32109',
      email: 'suresh@example.com',
      location: 'Market Area, Sector 8',
      type: 'Distributor',
      status: 'Active',
      tags: ['Medium Priority', 'Sector 8', 'Seeds', 'Regular Customer'],
      territory: 'Sector 8',
      region: 'Delhi NCR'
    },
    {
      id: '3',
      name: 'Amit Patel',
      company: 'Amit Agro Solutions',
      role: 'Director',
      phone: '+91 76543 21098',
      email: 'amit@example.com',
      location: 'Industrial Area',
      type: 'Retailer',
      status: 'Active',
      tags: ['Medium Priority', 'Industrial Area', 'Pesticides', 'Regular Customer'],
      territory: 'Industrial Area',
      region: 'Delhi NCR'
    },
    {
      id: '4',
      name: 'Priya Singh',
      company: 'SRI RAMA SEEDS AND PESTICIDES',
      role: 'Proprietor',
      phone: '+91 98234 56789',
      email: 'priya.singh@srirama.com',
      location: 'Rajendra Nagar, Hyderabad',
      type: 'Distributor',
      status: 'Active',
      tags: ['High Priority', 'Hyderabad', 'Premium Customer', 'Seeds', 'Pesticides'],
      territory: 'Hyderabad',
      region: 'Telangana'
    },
    {
      id: '5',
      name: 'Rajesh Kumar',
      company: 'Green Fields Retail',
      role: 'Owner',
      phone: '+91 97123 45678',
      email: 'rajesh@greenfields.com',
      location: 'Ameerpet, Hyderabad',
      type: 'Retailer',
      status: 'Active',
      tags: ['High Priority', 'Hyderabad', 'Fertilizers', 'Premium Customer'],
      territory: 'Ameerpet',
      region: 'Telangana'
    },
    {
      id: '6',
      name: 'Vikram Reddy',
      company: 'Agro World Distributors',
      role: 'Managing Director',
      phone: '+91 96456 78901',
      email: 'vikram@agroworld.com',
      location: 'Secunderabad',
      type: 'Distributor',
      status: 'Active',
      tags: ['High Priority', 'Secunderabad', 'All Products', 'Premium Customer'],
      territory: 'Secunderabad',
      region: 'Telangana'
    },
    {
      id: '7',
      name: 'Lakshmi Devi',
      company: 'Lakshmi Agro Retail',
      role: 'Proprietor',
      phone: '+91 95678 90123',
      email: 'lakshmi@agro.com',
      location: 'Kukatpally, Hyderabad',
      type: 'Retailer',
      status: 'Active',
      tags: ['Medium Priority', 'Kukatpally', 'Seeds', 'Regular Customer'],
      territory: 'Kukatpally',
      region: 'Telangana'
    },
    {
      id: '8',
      name: 'Mohan Das',
      company: 'Krishna Traders',
      role: 'Manager',
      phone: '+91 94890 12345',
      email: 'mohan@krishna.com',
      location: 'LB Nagar, Hyderabad',
      type: 'Retailer',
      status: 'Active',
      tags: ['Medium Priority', 'LB Nagar', 'Fertilizers', 'Regular Customer'],
      territory: 'LB Nagar',
      region: 'Telangana'
    },
  ];

  // Get all unique tags from contacts
  const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags)));
  
  // Filter tags based on search
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

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Summary Cards */}
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
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.status === 'Active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex-1">
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
          
          {/* Tag Search and Selection */}
          <div className="flex flex-col sm:flex-row gap-4">
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
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </button>
            )}
          </div>
          
          {/* Available Tags */}
          {searchTag && (
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
          
          {/* Selected Tags */}
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

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredContacts.length} of {contacts.length} contacts
          {selectedTags.length > 0 && (
            <span className="ml-2">
              (filtered by {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''})
            </span>
          )}
        </span>
        <div className="flex items-center space-x-4">
          <span>Distributors: {filteredContacts.filter(c => c.type === 'Distributor').length}</span>
          <span>Retailers: {filteredContacts.filter(c => c.type === 'Retailer').length}</span>
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded-xl p-6 card-shadow card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-lg">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.role} at {contact.company}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                  {contact.type}
                </span>
                <span className={`text-sm font-medium ${getStatusColor(contact.status)}`}>
                  {contact.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {contact.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {contact.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {contact.location}
              </div>
            </div>

            {/* Contact Tags */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {contact.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
                {contact.tags.length > 3 && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{contact.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelected360Entity({
                    distributorName: contact.type === 'Distributor' ? contact.company : undefined,
                    retailerName: contact.type === 'Retailer' ? contact.name : undefined,
                    distributorCode: contact.type === 'Distributor' ? contact.id : undefined,
                    retailerCode: contact.type === 'Retailer' ? contact.id : undefined,
                    territory: contact.territory
                  });
                  setShow360View(true);
                }}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
              >
                View 360° Profile
              </button>
              {contact.type === 'Retailer' && (
                <button
                  onClick={() => navigate(`/retailer-inventory?retailerId=${encodeURIComponent(contact.company)}&retailerName=${encodeURIComponent(contact.name)}`)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                >
                  <Building className="w-4 h-4" />
                  <span>View Inventory</span>
                </button>
              )}
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Edit
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Call
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No contacts found</p>
        </div>
      )}

      {/* Add Contact Modal */}
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
                {/* Contact Type */}
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

                {/* Name */}
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

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder="e.g., Owner, Manager, Proprietor"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Phone & Email */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={newContact.location}
                    onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                    placeholder="Enter location"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Territory & Region */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Territory *</label>
                    <input
                      type="text"
                      value={newContact.territory}
                      onChange={(e) => setNewContact({ ...newContact, territory: e.target.value })}
                      placeholder="e.g., North Delhi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                    <input
                      type="text"
                      value={newContact.region}
                      onChange={(e) => setNewContact({ ...newContact, region: e.target.value })}
                      placeholder="e.g., Delhi NCR"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status */}
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

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newContact.name || !newContact.company || !newContact.phone || !newContact.email) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    alert(`Contact "${newContact.name}" from "${newContact.company}" added successfully!\n\nThis is demo mode. In production, this will save to the database.`);
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
                      region: ''
                    });
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {show360View && selected360Entity && (
        <Entity360View
          entity={selected360Entity}
          onClose={() => {
            setShow360View(false);
            setSelected360Entity(null);
          }}
        />
      )}
    </div>
  );
};

export default Contacts;