import React, { useState } from 'react';
import { X, CheckCircle, FileText } from 'lucide-react';

interface ProofModalProps {
  selectedProof: any;
  onClose: () => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({ selectedProof, onClose }) => {
  const [proofModalTab, setProofModalTab] = useState<'proof' | 'details'>('proof');

  if (!selectedProof || !selectedProof.proofData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold">Liquidation Proof</h3>
            <p className="text-sm text-blue-100 mt-1">{selectedProof.id} - {selectedProof.proofType}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="border-b border-gray-200 px-4 sm:px-6">
          <div className="flex space-x-6">
            <button
              onClick={() => setProofModalTab('proof')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                proofModalTab === 'proof'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Proof Documents
            </button>
            <button
              onClick={() => setProofModalTab('details')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                proofModalTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Liquidation Details
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {proofModalTab === 'proof' && (
            <>
              {(selectedProof.proofData.type === 'esignature' || selectedProof.proofData.type === 'photo_esignature') && (
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">E-Signature</h4>
                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                    <div className="bg-white rounded-lg p-4 inline-block">
                      <img
                        src={selectedProof.proofData.signatureImage}
                        alt="E-Signature"
                        className="h-24 sm:h-32"
                      />
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Signed by:</span> {selectedProof.proofData.signerName}</p>
                      {selectedProof.proofData.signerDesignation && (
                        <p><span className="font-medium">Designation:</span> {selectedProof.proofData.signerDesignation}</p>
                      )}
                      {selectedProof.proofData.signerLocation && (
                        <p><span className="font-medium">Location:</span> {selectedProof.proofData.signerLocation}</p>
                      )}
                      <p><span className="font-medium">Timestamp:</span> {selectedProof.proofData.timestamp}</p>
                    </div>
                    {selectedProof.proofData.gencrestStaffName && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="text-xs font-semibold text-blue-900 mb-2">Gencrest Staff</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Name:</span> {selectedProof.proofData.gencrestStaffName}</p>
                          <p><span className="font-medium">Designation:</span> {selectedProof.proofData.gencrestStaffDesignation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedProof.proofData.type === 'photo_esignature' || selectedProof.proofData.type === 'photo_letterhead') && selectedProof.proofData.photos && (
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Photo Evidence</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedProof.proofData.photos.map((photo: string, index: number) => (
                      <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Proof ${index + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedProof.proofData.type === 'letterhead' || selectedProof.proofData.type === 'photo_letterhead') && selectedProof.proofData.documentUrl && (
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Letterhead Document</h4>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={selectedProof.proofData.documentUrl}
                      alt="Letterhead Document"
                      className="w-full h-auto"
                    />
                    <div className="bg-gray-50 p-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <FileText className="w-4 h-4" />
                        <span>{selectedProof.proofData.documentName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {proofModalTab === 'details' && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Liquidation Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Liquidation ID</p>
                  <p className="font-semibold text-gray-900">{selectedProof.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedProof.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Products</p>
                  <p className="font-semibold text-gray-900">{selectedProof.products}</p>
                </div>
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">{selectedProof.quantity} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Value</p>
                  <p className="font-semibold text-green-600">₹{(selectedProof.value / 1000).toFixed(1)}K</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                    <CheckCircle className="w-3 h-3" />
                    <span>{selectedProof.status}</span>
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-1">Liquidation Done By</p>
                  <p className="font-semibold text-gray-900">{selectedProof.liquidatedBy}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedProof.liquidatedAt}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-semibold mb-1">Verified By</p>
                  <p className="font-semibold text-gray-900">{selectedProof.verifiedBy} ({selectedProof.verifiedDesignation})</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedProof.verifiedAt}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
