import React from 'react';

const orders = [
  {
    id: 'ORD-2024-001',
    date: '2024-09-15',
    products: 'Pesticide Mix, Seed Pack A',
    quantity: 500,
    value: 45000,
    status: 'Delivered'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-08-22',
    products: 'Fertilizer Premium, Seed Pack B',
    quantity: 750,
    value: 68000,
    status: 'Delivered'
  },
  {
    id: 'ORD-2024-003',
    date: '2024-07-10',
    products: 'Pesticide Standard, Growth Booster',
    quantity: 300,
    value: 32000,
    status: 'Delivered'
  },
  {
    id: 'ORD-2024-004',
    date: '2024-06-05',
    products: 'DAP Fertilizer, Urea Mix',
    quantity: 450,
    value: 52000,
    status: 'Delivered'
  }
];

export const OrdersTab: React.FC = () => {
  return (
    <div className="p-3 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order History</h3>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{order.id}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{order.products}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Date: {new Date(order.date).toLocaleDateString('en-IN')}</span>
                  <span>Qty: {order.quantity} units</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Order Value</p>
                <p className="text-lg font-bold text-gray-900">₹{(order.value / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
