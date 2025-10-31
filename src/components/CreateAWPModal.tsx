import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, FileText, Target } from 'lucide-react';

interface CreateAWPModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  onSubmit: (data: AWPFormData) => void;
}

export interface AWPFormData {
  assignTo: 'self' | 'mdo';
  selectedMDOs: string[];
  category: string;
  activityHead: string;
  date: string;
  time: string;
  location: string;
  village: string;
  distributor: string;
  retailer: string;
  targetNumbers: string;
  outcomeExpected: string;
  notes: string;
}

const CreateAWPModal: React.FC<CreateAWPModalProps> = ({ isOpen, onClose, selectedDate, onSubmit }) => {
  const [formData, setFormData] = useState<AWPFormData>({
    assignTo: 'self',
    selectedMDOs: [],
    category: '',
    activityHead: '',
    date: selectedDate || '',
    time: '',
    location: '',
    village: '',
    distributor: '',
    retailer: '',
    targetNumbers: '',
    outcomeExpected: '',
    notes: ''
  });

  const categories = [
    { id: 'internal', name: 'Internal Meetings' },
    { id: 'farmer', name: 'Farmer BTL Engagement' },
    { id: 'channel', name: 'Channel BTL Engagement' }
  ];

  const activityHeads: Record<string, string[]> = {
    internal: [
      'Team Meetings',
      'Farmer Meets – Small',
      'Farmer Meets – Large',
      'Farm level demos',
      'Wall Paintings',
      'Jeep Campaigns'
    ],
    farmer: [
      'Field Days',
      'Distributor Day Training Program (25 dealers max)',
      'Retailer Day Training Program (50 retailers max)',
      'Distributor Connect Meeting (Overnight Stay)',
      'Dealer/Retailer Store Branding'
    ],
    channel: [
      'Trade Merchandise'
    ]
  };

  const mdoList = [
    { id: '1', name: 'John Doe', territory: 'North Zone' },
    { id: '2', name: 'Jane Smith', territory: 'South Zone' },
    { id: '3', name: 'Mike Johnson', territory: 'East Zone' },
    { id: '4', name: 'Sarah Williams', territory: 'West Zone' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (field: keyof AWPFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'category' && { activityHead: '' }),
      ...(field === 'assignTo' && value === 'self' && { selectedMDOs: [] })
    }));
  };

  const handleMDOToggle = (mdoId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMDOs: prev.selectedMDOs.includes(mdoId)
        ? prev.selectedMDOs.filter(id => id !== mdoId)
        : [...prev.selectedMDOs, mdoId]
    }));
  };

  const handleSelectAllMDOs = () => {
    if (formData.selectedMDOs.length === mdoList.length) {
      setFormData(prev => ({ ...prev, selectedMDOs: [] }));
    } else {
      setFormData(prev => ({ ...prev, selectedMDOs: mdoList.map(m => m.id) }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create AWP Activity</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create Work Plan For *
            </label>
            <div className="flex space-x-4 mb-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="assignTo"
                  value="self"
                  checked={formData.assignTo === 'self'}
                  onChange={(e) => handleChange('assignTo', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Self</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="assignTo"
                  value="mdo"
                  checked={formData.assignTo === 'mdo'}
                  onChange={(e) => handleChange('assignTo', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Select MDO(s)</span>
              </label>
            </div>

            {formData.assignTo === 'mdo' && (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Select MDOs</span>
                  <button
                    type="button"
                    onClick={handleSelectAllMDOs}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {formData.selectedMDOs.length === mdoList.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mdoList.map((mdo) => (
                    <label key={mdo.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedMDOs.includes(mdo.id)}
                        onChange={() => handleMDOToggle(mdo.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{mdo.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{mdo.territory}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {formData.selectedMDOs.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {formData.selectedMDOs.length} MDO(s) selected
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Head *
              </label>
              <select
                value={formData.activityHead}
                onChange={(e) => handleChange('activityHead', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!formData.category}
              >
                <option value="">Select Activity</option>
                {formData.category && activityHeads[formData.category]?.map((head) => (
                  <option key={head} value={head}>
                    {head}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Village
              </label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => handleChange('village', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter village name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distributor
              </label>
              <input
                type="text"
                value={formData.distributor}
                onChange={(e) => handleChange('distributor', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter distributor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retailer
              </label>
              <input
                type="text"
                value={formData.retailer}
                onChange={(e) => handleChange('retailer', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter retailer name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Target Numbers
            </label>
            <input
              type="text"
              value={formData.targetNumbers}
              onChange={(e) => handleChange('targetNumbers', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 25 dealers, 50 retailers, 100 farmers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Outcome Expected *
            </label>
            <textarea
              value={formData.outcomeExpected}
              onChange={(e) => handleChange('outcomeExpected', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the expected outcomes from this activity"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add any additional notes or instructions"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAWPModal;
