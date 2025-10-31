import React from 'react';
import { CheckCircle, FileText, User, Eye } from 'lucide-react';

interface LiquidationEntry {
  id: string;
  date: string;
  products: string;
  quantity: number;
  value: number;
  proofType: string;
  liquidatedBy: string;
  liquidatedAt: string;
  verifiedBy: string;
  verifiedDesignation: string;
  verifiedAt: string;
  status: string;
  proofData: any;
}

interface LiquidationTabProps {
  onViewProof: (liquidation: LiquidationEntry) => void;
}

const liquidations: LiquidationEntry[] = [
  {
    id: 'LIQ-2024-001',
    date: '2024-10-05',
    products: 'Pesticide Mix',
    quantity: 250,
    value: 22500,
    proofType: 'E-Signature',
    liquidatedBy: 'Rajesh Kumar (MDO)',
    liquidatedAt: '2024-10-05 14:30:00',
    verifiedBy: 'Priya Sharma',
    verifiedDesignation: 'TSM',
    verifiedAt: '2024-10-05 16:45:00',
    status: 'Verified',
    proofData: {
      type: 'esignature',
      signatureImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMTAwIFE1MCA1MCAxMDAgMTAwIFQgMTgwIDEwMCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
      signerName: 'Venkat Reddy',
      signerDesignation: 'Proprietor',
      signerLocation: 'Hyderabad, Telangana',
      timestamp: '2024-10-05 14:30:00',
      gencrestStaffName: 'Rajesh Kumar',
      gencrestStaffDesignation: 'MDO'
    }
  },
  {
    id: 'LIQ-2024-002',
    date: '2024-09-28',
    products: 'Seed Pack A, Fertilizer',
    quantity: 400,
    value: 38000,
    proofType: 'Photo + E-Signature',
    liquidatedBy: 'Rajesh Kumar (MDO)',
    liquidatedAt: '2024-09-28 11:20:00',
    verifiedBy: 'Priya Sharma',
    verifiedDesignation: 'TSM',
    verifiedAt: '2024-09-28 15:30:00',
    status: 'Verified',
    proofData: {
      type: 'photo_esignature',
      photos: ['https://images.pexels.com/photos/7489063/pexels-photo-7489063.jpeg?auto=compress&cs=tinysrgb&w=800'],
      signatureImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMTAwIFE1MCA1MCAxMDAgMTAwIFQgMTgwIDEwMCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz48L3N2Zz4=',
      signerName: 'Venkat Reddy',
      signerDesignation: 'Proprietor',
      signerLocation: 'Hyderabad, Telangana',
      timestamp: '2024-09-28 11:20:00',
      gencrestStaffName: 'Rajesh Kumar',
      gencrestStaffDesignation: 'MDO'
    }
  },
  {
    id: 'LIQ-2024-003',
    date: '2024-09-15',
    products: 'Growth Booster',
    quantity: 150,
    value: 15000,
    proofType: 'Letterhead',
    liquidatedBy: 'Suresh Verma (MDO)',
    liquidatedAt: '2024-09-15 10:15:00',
    verifiedBy: 'Priya Sharma',
    verifiedDesignation: 'TSM',
    verifiedAt: '2024-09-15 14:20:00',
    status: 'Verified',
    proofData: {
      type: 'letterhead',
      documentUrl: 'https://images.pexels.com/photos/6647035/pexels-photo-6647035.jpeg?auto=compress&cs=tinysrgb&w=800',
      documentName: 'Liquidation_Confirmation_LIQ-2024-003.pdf',
      gencrestStaffName: 'Suresh Verma',
      gencrestStaffDesignation: 'MDO'
    }
  },
  {
    id: 'LIQ-2024-004',
    date: '2024-08-20',
    products: 'DAP Fertilizer',
    quantity: 300,
    value: 28000,
    proofType: 'Photo + Letterhead',
    liquidatedBy: 'Rajesh Kumar (MDO)',
    liquidatedAt: '2024-08-20 09:45:00',
    verifiedBy: 'Priya Sharma',
    verifiedDesignation: 'TSM',
    verifiedAt: '2024-08-20 17:30:00',
    status: 'Verified',
    proofData: {
      type: 'photo_letterhead',
      photos: ['https://images.pexels.com/photos/7989022/pexels-photo-7989022.jpeg?auto=compress&cs=tinysrgb&w=800'],
      documentUrl: 'https://images.pexels.com/photos/6647035/pexels-photo-6647035.jpeg?auto=compress&cs=tinysrgb&w=800',
      documentName: 'Liquidation_Letter_LIQ-2024-004.pdf',
      gencrestStaffName: 'Rajesh Kumar',
      gencrestStaffDesignation: 'MDO'
    }
  }
];

export const LiquidationTab: React.FC<LiquidationTabProps> = ({ onViewProof }) => {
  return (
    <div className="p-3 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Liquidation History with Proofs</h3>
      <div className="space-y-4">
        {liquidations.map((liquidation) => (
          <div key={liquidation.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{liquidation.id}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{liquidation.status}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{liquidation.products}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Date: {new Date(liquidation.date).toLocaleDateString('en-IN')}</span>
                  <span>Qty: {liquidation.quantity} units</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Liquidation Value</p>
                <p className="text-lg font-bold text-green-600">₹{(liquidation.value / 1000).toFixed(1)}K</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Proof: {liquidation.proofType}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Verified by: {liquidation.verifiedBy}</span>
                  </div>
                </div>
                <button
                  onClick={() => onViewProof(liquidation)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium w-full sm:w-auto justify-center"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Proof</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
