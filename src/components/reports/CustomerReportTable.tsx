import React, { useState } from 'react';
import { Download, Share2, ChevronDown, ChevronRight, Edit3 } from 'lucide-react';
import { StockRectificationModal, RectificationSubmission } from './StockRectificationModal';

interface ProductSKUData {
  product_code: string;
  product_name: string;
  category?: string;
  sku_code: string;
  sku_name: string;
  opening_stock: number;
  opening_stock_units: number;
  ytd_sales: number;
  ytd_sales_units: number;
  balance_stock: number;
  balance_stock_units: number;
  unit: string;
  zone?: string;
  region?: string;
  state?: string;
  territory?: string;
  customer_code?: string;
  customer_name?: string;
  customer_type?: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface CustomerReportTableProps {
  productData: ProductSKUData[];
  onDownloadExcel: () => void;
  onShareWhatsApp: () => void;
  columns: ColumnConfig[];
}

export const CustomerReportTable: React.FC<CustomerReportTableProps> = ({
  productData,
  onDownloadExcel,
  onShareWhatsApp,
  columns
}) => {
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [rectificationModalOpen, setRectificationModalOpen] = useState(false);
  const [selectedStockData, setSelectedStockData] = useState<any>(null);

  const isColumnVisible = (key: string) => {
    const column = columns.find(col => col.key === key);
    return column ? column.visible : true;
  };

  const handleRectifyStock = (stockData: any) => {
    console.log('[CustomerReportTable] handleRectifyStock called with:', stockData);
    setSelectedStockData(stockData);
    setRectificationModalOpen(true);
    console.log('[CustomerReportTable] Modal should now be open');
  };

  const handleRectificationSubmit = (data: RectificationSubmission) => {
    console.log('Stock Rectification Submitted:', {
      ...data,
      customer: selectedStockData.customer_name,
      product: selectedStockData.product_name,
      timestamp: new Date().toISOString()
    });

    alert(`Stock rectification submitted for approval!\n\nAdjustment: ${data.adjustment_type === 'increase' ? '+' : '-'}${data.adjustment_units} units\nReason: ${data.reason}\n${data.adjustment_type === 'increase' ? 'Source' : 'Destination'}: ${data.source_destination}\n\nThis will be sent to RMM/RBH/ZBH for approval.`);
  };

  const extractSKU = (skuName: string): string => {
    const match = skuName.match(/(\d+\.?\d*\s*(?:Ltr|ml|Kg|L|kg|g|GM))/i);
    return match ? match[1] : skuName;
  };

  const toggleCustomer = (customerKey: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerKey)) {
      newExpanded.delete(customerKey);
    } else {
      newExpanded.add(customerKey);
    }
    setExpandedCustomers(newExpanded);
  };

  const customerMap = new Map<string, {
    customer_name: string;
    customer_code: string;
    customer_type: string;
    zone: string;
    region: string;
    state: string;
    territory: string;
    products: Map<string, {
      product_code: string;
      product_name: string;
      category: string;
      skus: Array<{
        sku_code: string;
        sku_name: string;
        unit: string;
        opening_stock: number;
        opening_stock_units: number;
        ytd_sales: number;
        ytd_sales_units: number;
        balance_stock: number;
        balance_stock_units: number;
      }>;
    }>;
  }>();

  productData.forEach(item => {
    if (!item.customer_code) return;

    const customerKey = item.customer_code;

    if (!customerMap.has(customerKey)) {
      customerMap.set(customerKey, {
        customer_name: item.customer_name || '',
        customer_code: item.customer_code,
        customer_type: item.customer_type || 'Retailer',
        zone: item.zone || '',
        region: item.region || '',
        state: item.state || '',
        territory: item.territory || '',
        products: new Map()
      });
    }

    const customer = customerMap.get(customerKey)!;

    if (!customer.products.has(item.product_code)) {
      customer.products.set(item.product_code, {
        product_code: item.product_code,
        product_name: item.product_name,
        category: item.category || '',
        skus: []
      });
    }

    const product = customer.products.get(item.product_code)!;
    product.skus.push({
      sku_code: item.sku_code,
      sku_name: item.sku_name,
      unit: item.unit,
      opening_stock: item.opening_stock,
      opening_stock_units: item.opening_stock_units,
      ytd_sales: item.ytd_sales,
      ytd_sales_units: item.ytd_sales_units,
      balance_stock: item.balance_stock,
      balance_stock_units: item.balance_stock_units
    });
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Customer-wise Liquidation Report (Product Details)</h3>
        <div className="flex gap-2">
          <button
            onClick={onDownloadExcel}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download Excel"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onShareWhatsApp}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Share on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-8"></th>
              {isColumnVisible('name') && (
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                  Customer / Product / SKU
                </th>
              )}
              {isColumnVisible('type') && (
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Type</th>
              )}
              {isColumnVisible('zone') && (
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Zone</th>
              )}
              {isColumnVisible('region') && (
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Region</th>
              )}
              {isColumnVisible('territory') && (
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">State / Territory</th>
              )}
              {(isColumnVisible('openingStockValue') || isColumnVisible('openingStockUnits')) && (
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700"
                  colSpan={
                    (isColumnVisible('openingStockValue') ? 1 : 0) +
                    (isColumnVisible('openingStockUnits') ? 1 : 0)
                  }
                >
                  Opening Stock
                </th>
              )}
              {(isColumnVisible('ytdSalesValue') || isColumnVisible('ytdSalesUnits')) && (
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700"
                  colSpan={
                    (isColumnVisible('ytdSalesValue') ? 1 : 0) +
                    (isColumnVisible('ytdSalesUnits') ? 1 : 0)
                  }
                >
                  YTD Sales
                </th>
              )}
              {(isColumnVisible('liquidationValue') || isColumnVisible('liquidationUnits') || isColumnVisible('liquidationPercent')) && (
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700"
                  colSpan={
                    (isColumnVisible('liquidationValue') ? 1 : 0) +
                    (isColumnVisible('liquidationUnits') ? 1 : 0) +
                    (isColumnVisible('liquidationPercent') ? 1 : 0)
                  }
                >
                  Liquidation
                </th>
              )}
              {(isColumnVisible('balanceStockValue') || isColumnVisible('balanceStockUnits')) && (
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700"
                  colSpan={
                    (isColumnVisible('balanceStockValue') ? 1 : 0) +
                    (isColumnVisible('balanceStockUnits') ? 1 : 0)
                  }
                >
                  Balance Stock
                </th>
              )}
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border-r border-gray-200"></th>
              {isColumnVisible('name') && (
                <th className="border-r border-gray-200"></th>
              )}
              {isColumnVisible('type') && (
                <th></th>
              )}
              {isColumnVisible('zone') && <th></th>}
              {isColumnVisible('region') && <th></th>}
              {isColumnVisible('territory') && <th></th>}
              {isColumnVisible('openingStockValue') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Value (Rs. L)</th>
              )}
              {isColumnVisible('openingStockUnits') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Volume (Kg/Ltr)</th>
              )}
              {isColumnVisible('ytdSalesValue') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Value (Rs. L)</th>
              )}
              {isColumnVisible('ytdSalesUnits') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Volume (Kg/Ltr)</th>
              )}
              {isColumnVisible('liquidationValue') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Value (Rs. L)</th>
              )}
              {isColumnVisible('liquidationUnits') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Volume (Kg/Ltr)</th>
              )}
              {isColumnVisible('liquidationPercent') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">%</th>
              )}
              {isColumnVisible('balanceStockValue') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Value (Rs. L)</th>
              )}
              {isColumnVisible('balanceStockUnits') && (
                <th className="px-3 py-1 text-right text-xs font-medium text-gray-600">Volume (Kg/Ltr)</th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from(customerMap.entries()).map(([customerKey, customer]) => {
              const isCustomerExpanded = expandedCustomers.has(customerKey);

              const customerTotals = {
                opening_stock: 0,
                opening_stock_units: 0,
                ytd_sales: 0,
                ytd_sales_units: 0,
                balance_stock: 0,
                balance_stock_units: 0
              };

              Array.from(customer.products.values()).forEach(product => {
                product.skus.forEach(sku => {
                  customerTotals.opening_stock += sku.opening_stock;
                  customerTotals.opening_stock_units += sku.opening_stock_units;
                  customerTotals.ytd_sales += sku.ytd_sales;
                  customerTotals.ytd_sales_units += sku.ytd_sales_units;
                  customerTotals.balance_stock += sku.balance_stock;
                  customerTotals.balance_stock_units += sku.balance_stock_units;
                });
              });

              const custLiqPct = customerTotals.opening_stock > 0
                ? ((customerTotals.ytd_sales / customerTotals.opening_stock) * 100).toFixed(2)
                : '0.00';

              return (
                <React.Fragment key={customerKey}>
                  <tr className="bg-blue-50 hover:bg-blue-100 cursor-pointer font-semibold" onClick={() => toggleCustomer(customerKey)}>
                    <td className="px-3 py-2 text-center">
                      {isCustomerExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    {isColumnVisible('name') && (
                      <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200">
                        {customer.customer_name}
                        <div className="text-xs text-gray-500">{customer.customer_code}</div>
                      </td>
                    )}
                    {isColumnVisible('type') && (
                      <td className="px-3 py-2 text-xs">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{customer.customer_type}</span>
                      </td>
                    )}
                    {isColumnVisible('zone') && (
                      <td className="px-3 py-2 text-xs text-gray-700">{customer.zone}</td>
                    )}
                    {isColumnVisible('region') && (
                      <td className="px-3 py-2 text-xs text-gray-700">{customer.region}</td>
                    )}
                    {isColumnVisible('territory') && (
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {customer.state} / {customer.territory}
                      </td>
                    )}
                    {isColumnVisible('openingStockValue') && (
                      <td className="px-3 py-2 text-sm text-right text-orange-600 font-semibold">
                        ₹{(customerTotals.opening_stock / 100000).toFixed(2)}L
                      </td>
                    )}
                    {isColumnVisible('openingStockUnits') && (
                      <td className="px-3 py-2 text-sm text-right text-gray-700 font-semibold">
                        {customerTotals.opening_stock_units.toFixed(2)}
                      </td>
                    )}
                    {isColumnVisible('ytdSalesValue') && (
                      <td className="px-3 py-2 text-sm text-right text-blue-600 font-semibold">
                        ₹{(customerTotals.ytd_sales / 100000).toFixed(2)}L
                      </td>
                    )}
                    {isColumnVisible('ytdSalesUnits') && (
                      <td className="px-3 py-2 text-sm text-right text-gray-700 font-semibold">
                        {customerTotals.ytd_sales_units.toFixed(2)}
                      </td>
                    )}
                    {isColumnVisible('liquidationValue') && (
                      <td className="px-3 py-2 text-sm text-right text-purple-600 font-semibold">
                        ₹{(customerTotals.ytd_sales / 100000).toFixed(2)}L
                      </td>
                    )}
                    {isColumnVisible('liquidationUnits') && (
                      <td className="px-3 py-2 text-sm text-right text-gray-700 font-semibold">
                        {customerTotals.ytd_sales_units.toFixed(2)}
                      </td>
                    )}
                    {isColumnVisible('liquidationPercent') && (
                      <td className="px-3 py-2 text-sm text-right text-purple-600 font-bold">
                        {custLiqPct}%
                      </td>
                    )}
                    {isColumnVisible('balanceStockValue') && (
                      <td className="px-3 py-2 text-sm text-right text-green-600 font-semibold">
                        ₹{(customerTotals.balance_stock / 100000).toFixed(2)}L
                      </td>
                    )}
                    {isColumnVisible('balanceStockUnits') && (
                      <td className="px-3 py-2 text-sm text-right text-gray-700 font-semibold">
                        {customerTotals.balance_stock_units.toFixed(2)}
                      </td>
                    )}
                    <td></td>
                  </tr>

                  {isCustomerExpanded && Array.from(customer.products.entries()).map(([productCode, product]) => {
                    return product.skus.map((sku, idx) => {
                      const skuLiqPct = sku.opening_stock > 0
                        ? ((sku.ytd_sales / sku.opening_stock) * 100).toFixed(2)
                        : '0.00';

                      return (
                        <tr key={`${productCode}-${sku.sku_code}-${idx}`} className="hover:bg-gray-50">
                          <td></td>
                          {isColumnVisible('name') && (
                            <td className="px-3 py-2 text-xs text-gray-700 pl-8 border-r border-gray-200">
                              {product.product_name} - {extractSKU(sku.sku_name)}
                              <div className="text-xs text-gray-400">{productCode}</div>
                            </td>
                          )}
                          {isColumnVisible('type') && (
                            <td className="px-3 py-2 text-xs text-gray-600">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{product.category}</span>
                            </td>
                          )}
                          {isColumnVisible('zone') && <td></td>}
                          {isColumnVisible('region') && <td></td>}
                          {isColumnVisible('territory') && <td></td>}
                          {isColumnVisible('openingStockValue') && (
                            <td className="px-3 py-2 text-xs text-right text-orange-600">
                              ₹{(sku.opening_stock / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('openingStockUnits') && (
                            <td className="px-3 py-2 text-xs text-right text-gray-600">
                              {sku.opening_stock_units.toFixed(2)}
                            </td>
                          )}
                          {isColumnVisible('ytdSalesValue') && (
                            <td className="px-3 py-2 text-xs text-right text-blue-600">
                              ₹{(sku.ytd_sales / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('ytdSalesUnits') && (
                            <td className="px-3 py-2 text-xs text-right text-gray-600">
                              {sku.ytd_sales_units.toFixed(2)}
                            </td>
                          )}
                          {isColumnVisible('liquidationValue') && (
                            <td className="px-3 py-2 text-xs text-right text-purple-600">
                              ₹{(sku.ytd_sales / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('liquidationUnits') && (
                            <td className="px-3 py-2 text-xs text-right text-gray-600">
                              {sku.ytd_sales_units.toFixed(2)}
                            </td>
                          )}
                          {isColumnVisible('liquidationPercent') && (
                            <td className="px-3 py-2 text-xs text-right text-purple-600 font-medium">
                              {skuLiqPct}%
                            </td>
                          )}
                          {isColumnVisible('balanceStockValue') && (
                            <td className="px-3 py-2 text-xs text-right text-green-600">
                              ₹{(sku.balance_stock / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('balanceStockUnits') && (
                            <td className="px-3 py-2 text-xs text-right text-gray-600">
                              {sku.balance_stock_units.toFixed(2)}
                            </td>
                          )}
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRectifyStock({
                                  customer_name: customer.customer_name,
                                  customer_code: customer.customer_code,
                                  product_name: product.product_name,
                                  sku_name: sku.sku_name,
                                  current_balance: sku.balance_stock,
                                  current_balance_units: sku.balance_stock_units,
                                  unit: sku.unit
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                              title="Rectify Stock"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Rectify</span>
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <StockRectificationModal
        isOpen={rectificationModalOpen}
        onClose={() => setRectificationModalOpen(false)}
        stockData={selectedStockData}
        onSubmit={handleRectificationSubmit}
      />
    </div>
  );
};
