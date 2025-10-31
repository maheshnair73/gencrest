import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LiquidationSimple: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Liquidation Module</h1>
          <p className="text-gray-600 mb-4">
            The Liquidation page is being optimized. The previous version was too large (5700+ lines)
            and was causing browser performance issues.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Note:</h3>
            <p className="text-yellow-800 text-sm">
              This is a temporary simplified version. The full Liquidation module needs to be
              refactored into smaller, manageable components following best practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidationSimple;
