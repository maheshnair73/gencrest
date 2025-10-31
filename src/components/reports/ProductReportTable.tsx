import React, { useState } from 'react';
import { Download, Share2, ChevronDown, ChevronRight } from 'lucide-react';

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

interface ProductReportTableProps {
  productData: ProductSKUData[];
  onDownloadExcel: () => void;
  onShareWhatsApp: () => void;
  columns: ColumnConfig[];
}

export const ProductReportTable: React.FC<ProductReportTableProps> = ({
  productData,
  onDownloadExcel,
  onShareWhatsApp,
  columns
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedSKUs, setExpandedSKUs] = useState<Set<string>>(new Set());

  const isColumnVisible = (key: string) => {
    const column = columns.find(col => col.key === key);
    return column ? column.visible : true;
  };

  const extractSKU = (skuName: string): string => {
    const match = skuName.match(/(\d+\.?\d*\s*(?:Ltr|ml|Kg|L|kg|g|GM))/i);
    return match ? match[1] : skuName;
  };

  const toggleProduct = (productCode: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productCode)) {
      newExpanded.delete(productCode);
    } else {
      newExpanded.add(productCode);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleSKU = (key: string) => {
    const newExpanded = new Set(expandedSKUs);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSKUs(newExpanded);
  };

  const productMap = new Map<string, {
    product_name: string;
    category?: string;
    skus: Map<string, {
      sku_code: string;
      sku_name: string;
      unit: string;
      total_opening_stock: number;
      total_opening_stock_units: number;
      total_ytd_sales: number;
      total_ytd_sales_units: number;
      total_balance_stock: number;
      total_balance_stock_units: number;
      customers: Array<{
        customer_code: string;
        customer_name: string;
        customer_type: string;
        zone: string;
        region: string;
        state: string;
        territory: string;
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
    if (!productMap.has(item.product_code)) {
      productMap.set(item.product_code, {
        product_name: item.product_name,
        category: item.category,
        skus: new Map()
      });
    }

    const product = productMap.get(item.product_code)!;

    if (!product.skus.has(item.sku_code)) {
      product.skus.set(item.sku_code, {
        sku_code: item.sku_code,
        sku_name: item.sku_name,
        unit: item.unit,
        total_opening_stock: 0,
        total_opening_stock_units: 0,
        total_ytd_sales: 0,
        total_ytd_sales_units: 0,
        total_balance_stock: 0,
        total_balance_stock_units: 0,
        customers: []
      });
    }

    const sku = product.skus.get(item.sku_code)!;
    sku.total_opening_stock += item.opening_stock;
    sku.total_opening_stock_units += item.opening_stock_units;
    sku.total_ytd_sales += item.ytd_sales;
    sku.total_ytd_sales_units += item.ytd_sales_units;
    sku.total_balance_stock += item.balance_stock;
    sku.total_balance_stock_units += item.balance_stock_units;

    if (item.customer_code) {
      sku.customers.push({
        customer_code: item.customer_code,
        customer_name: item.customer_name || '',
        customer_type: item.customer_type || 'Retailer',
        zone: item.zone || '',
        region: item.region || '',
        state: item.state || '',
        territory: item.territory || '',
        opening_stock: item.opening_stock,
        opening_stock_units: item.opening_stock_units,
        ytd_sales: item.ytd_sales,
        ytd_sales_units: item.ytd_sales_units,
        balance_stock: item.balance_stock,
        balance_stock_units: item.balance_stock_units
      });
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Product-wise Liquidation Report (Customer Details)</h3>
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
                <>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                    Product / SKU / Customer
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
                </>
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
            </tr>
            <tr className="bg-gray-50">
              <th className="border-r border-gray-200"></th>
              {isColumnVisible('name') && (
                <>
                  <th className="border-r border-gray-200"></th>
                  <th></th>
                </>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from(productMap.entries()).map(([productCode, product]) => {
              const isProductExpanded = expandedProducts.has(productCode);

              return (
                <React.Fragment key={productCode}>
                  <tr className="bg-blue-50 hover:bg-blue-100 cursor-pointer font-semibold" onClick={() => toggleProduct(productCode)}>
                    <td className="px-3 py-2 text-center">
                      {isProductExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200" colSpan={2}>
                      {product.product_name} ({product.skus.size} SKUs)
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{product.category || '-'}</td>
                    {isColumnVisible('zone') && <td></td>}
                    {isColumnVisible('region') && <td></td>}
                    {isColumnVisible('territory') && <td></td>}
                    <td colSpan={10}></td>
                  </tr>

                  {isProductExpanded && Array.from(product.skus.entries()).map(([skuCode, sku]) => {
                    const skuKey = `${productCode}-${skuCode}`;
                    const isSKUExpanded = expandedSKUs.has(skuKey);
                    const liquidationPct = sku.total_opening_stock > 0
                      ? ((sku.total_ytd_sales / sku.total_opening_stock) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <React.Fragment key={skuKey}>
                        <tr className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleSKU(skuKey)}>
                          <td className="px-3 py-2 text-center pl-8">
                            {isSKUExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-800 pl-8 border-r border-gray-200" colSpan={2}>
                            {extractSKU(sku.sku_name)} ({sku.customers.length} customers)
                          </td>
                          <td></td>
                          {isColumnVisible('zone') && <td></td>}
                          {isColumnVisible('region') && <td></td>}
                          {isColumnVisible('territory') && <td></td>}
                          {isColumnVisible('openingStockValue') && (
                            <td className="px-3 py-2 text-sm text-right text-orange-600 font-semibold">
                              ₹{(sku.total_opening_stock / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('openingStockUnits') && (
                            <td className="px-3 py-2 text-sm text-right text-gray-600">
                              {sku.total_opening_stock_units.toFixed(2)}
                            </td>
                          )}
                          {isColumnVisible('ytdSalesValue') && (
                            <td className="px-3 py-2 text-sm text-right text-blue-600 font-semibold">
                              ₹{(sku.total_ytd_sales / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('ytdSalesUnits') && (
                            <td className="px-3 py-2 text-sm text-right text-gray-600">
                              {sku.total_ytd_sales_units.toFixed(2)}
                            </td>
                          )}
                          {isColumnVisible('liquidationValue') && (
                            <td className="px-3 py-2 text-sm text-right text-purple-600 font-semibold">
                              ₹{(sku.total_ytd_sales / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('liquidationUnits') && (
                            <td className="px-3 py-2 text-sm text-right text-gray-600">
                              {sku.total_ytd_sales_units.toFixed(2)}
                            </td>
                          )}
                          {isColumnVisible('liquidationPercent') && (
                            <td className="px-3 py-2 text-sm text-right text-purple-600 font-bold">
                              {liquidationPct}%
                            </td>
                          )}
                          {isColumnVisible('balanceStockValue') && (
                            <td className="px-3 py-2 text-sm text-right text-green-600 font-semibold">
                              ₹{(sku.total_balance_stock / 100000).toFixed(2)}L
                            </td>
                          )}
                          {isColumnVisible('balanceStockUnits') && (
                            <td className="px-3 py-2 text-sm text-right text-gray-600">
                              {sku.total_balance_stock_units.toFixed(2)}
                            </td>
                          )}
                        </tr>

                        {isSKUExpanded && sku.customers.map((customer, idx) => {
                          const custLiqPct = customer.opening_stock > 0
                            ? ((customer.ytd_sales / customer.opening_stock) * 100).toFixed(1)
                            : '0.0';

                          return (
                            <tr key={`${skuKey}-${idx}`} className="hover:bg-blue-50">
                              <td></td>
                              <td className="px-3 py-2 text-xs text-gray-700 pl-16 border-r border-gray-200">
                                {customer.customer_name}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-600">
                                <span className="px-2 py-0.5 bg-gray-100 rounded">{customer.customer_type}</span>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-700">{customer.customer_code}</td>
                              {isColumnVisible('zone') && (
                                <td className="px-3 py-2 text-xs text-gray-700">{customer.zone || '-'}</td>
                              )}
                              {isColumnVisible('region') && (
                                <td className="px-3 py-2 text-xs text-gray-700">{customer.region || '-'}</td>
                              )}
                              {isColumnVisible('territory') && (
                                <td className="px-3 py-2 text-xs text-gray-700">
                                  {customer.state || '-'} / {customer.territory || '-'}
                                </td>
                              )}
                              {isColumnVisible('openingStockValue') && (
                                <td className="px-3 py-2 text-xs text-right text-orange-600">
                                  ₹{(customer.opening_stock / 100000).toFixed(2)}L
                                </td>
                              )}
                              {isColumnVisible('openingStockUnits') && (
                                <td className="px-3 py-2 text-xs text-right text-gray-600">
                                  {customer.opening_stock_units.toFixed(2)}
                                </td>
                              )}
                              {isColumnVisible('ytdSalesValue') && (
                                <td className="px-3 py-2 text-xs text-right text-blue-600">
                                  ₹{(customer.ytd_sales / 100000).toFixed(2)}L
                                </td>
                              )}
                              {isColumnVisible('ytdSalesUnits') && (
                                <td className="px-3 py-2 text-xs text-right text-gray-600">
                                  {customer.ytd_sales_units.toFixed(2)}
                                </td>
                              )}
                              {isColumnVisible('liquidationValue') && (
                                <td className="px-3 py-2 text-xs text-right text-purple-600">
                                  ₹{(customer.ytd_sales / 100000).toFixed(2)}L
                                </td>
                              )}
                              {isColumnVisible('liquidationUnits') && (
                                <td className="px-3 py-2 text-xs text-right text-gray-600">
                                  {customer.ytd_sales_units.toFixed(2)}
                                </td>
                              )}
                              {isColumnVisible('liquidationPercent') && (
                                <td className="px-3 py-2 text-xs text-right text-purple-600 font-medium">
                                  {custLiqPct}%
                                </td>
                              )}
                              {isColumnVisible('balanceStockValue') && (
                                <td className="px-3 py-2 text-xs text-right text-green-600">
                                  ₹{(customer.balance_stock / 100000).toFixed(2)}L
                                </td>
                              )}
                              {isColumnVisible('balanceStockUnits') && (
                                <td className="px-3 py-2 text-xs text-right text-gray-600">
                                  {customer.balance_stock_units.toFixed(2)}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
