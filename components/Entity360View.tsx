import React, { useState } from 'react';
import { X, Building } from 'lucide-react';
import { ProfileTab } from './entity360/ProfileTab';
import { VisitsTab } from './entity360/VisitsTab';
import { OrdersTab } from './entity360/OrdersTab';
import { LiquidationTab } from './entity360/LiquidationTab';
import { ActivityTab } from './entity360/ActivityTab';
import { ProofModal } from './entity360/ProofModal';

interface Entity360ViewProps {
  entity: any;
  onClose: () => void;
}

const Entity360View: React.FC<Entity360ViewProps> = ({ entity, onClose }) => {
  const [mainTab, setMainTab] = useState<'profile' | 'visits' | 'orders' | 'liquidation' | 'activity'>('profile');
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState<any>(null);

  const entityName = entity.distributorName || entity.retailerName;
  const entityCode = entity.distributorCode || entity.retailerCode;

  const sampleData = {
    creditLimit: 7.5,
    totalPurchases: 3.0,
    balanceCredit: 7.0,
    totalPayments: 2.3,
    contactPerson: 'Rajesh Kumar',
    primaryPhone: '+91 98765 43210',
    email: 'rajesh@sriramaseedspesticides.com',
    address: 'Ashok Nagar, 48, Delhi NCR',
    gstNumber: '07AABCU9603R1ZX',
    panNumber: 'AABCU9603R',
    assignedMDO: 'Rajesh Kumar (MDO)',
    established: '2018',
    ageing: {
      days0_30: 0,
      days31_60: 0,
      days61_90: 0,
      days91Plus: 305000
    },
    liquidationProgress: 71,
    creditUtilization: 6.7
  };

  const handleViewProof = (liquidation: any) => {
    setSelectedProof(liquidation);
    setShowProofModal(true);
  };

  const handleCloseProofModal = () => {
    setShowProofModal(false);
    setSelectedProof(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-xl w-screen sm:w-full sm:max-w-7xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-2xl font-bold break-words">{entityName}</h2>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                  <span className="font-medium">Code: {entityCode}</span>
                  <span className="hidden sm:inline"> • Established: {sampleData.established}</span>
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-500 bg-opacity-30 rounded text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="flex space-x-1 border-b border-blue-500 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setMainTab('profile')}
              className={`flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                mainTab === 'profile'
                  ? 'text-white border-b-2 border-white'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Profile & Performance
            </button>
            <button
              onClick={() => setMainTab('visits')}
              className={`flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                mainTab === 'visits'
                  ? 'text-white border-b-2 border-white'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Visits
            </button>
            <button
              onClick={() => setMainTab('orders')}
              className={`flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                mainTab === 'orders'
                  ? 'text-white border-b-2 border-white'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setMainTab('liquidation')}
              className={`flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                mainTab === 'liquidation'
                  ? 'text-white border-b-2 border-white'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Liquidation
            </button>
            <button
              onClick={() => setMainTab('activity')}
              className={`flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                mainTab === 'activity'
                  ? 'text-white border-b-2 border-white'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              360° Activity
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mainTab === 'profile' && <ProfileTab entity={entity} sampleData={sampleData} />}
          {mainTab === 'visits' && <VisitsTab />}
          {mainTab === 'orders' && <OrdersTab />}
          {mainTab === 'liquidation' && <LiquidationTab onViewProof={handleViewProof} />}
          {mainTab === 'activity' && <ActivityTab />}
        </div>

        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showProofModal && selectedProof && (
        <ProofModal selectedProof={selectedProof} onClose={handleCloseProofModal} />
      )}
    </div>
  );
};

export default Entity360View;
