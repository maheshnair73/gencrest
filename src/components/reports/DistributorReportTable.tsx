import React from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';

interface OutletTransaction {
  id: string;
  outlet_name: string;
  owner_name: string;
  opening_stock: number;
  sales: number;
  liquidation: number;
  balance_stock: number;
}

interface MDOSummary {
  mdo_id: string;
  mdo_name: string;
  zone: string;
  region: string;
  territory: string;
  opening_stock: number;
  ytd_sales: number;
  liquidation: number;
  balance_stock: number;
  outlet_count: number;
  outlets: OutletTransaction[];
}

interface DistributorReportTableProps {
  mdoData: MDOSummary[];
  expandedMDOs: Set<string>;
  onToggleZone: (zone: string) => void;
  onToggleTSM: (zone: string, tsmId: string) => void;
  onToggleMDO: (mdoId: string) => void;
  userRole: string | undefined;
  hierarchicalData?: Map<string, Map<string, { tsmName: string; mdos: MDOSummary[] }>>;
  groupedData?: Map<string, MDOSummary[]>;
}

export const DistributorReportTable: React.FC<DistributorReportTableProps> = ({
  mdoData,
  expandedMDOs,
  onToggleZone,
  onToggleTSM,
  onToggleMDO,
  userRole,
  hierarchicalData,
  groupedData
}) => {
  const isHierarchicalView = userRole === 'RBH' || userRole === 'ZBH';

  if (isHierarchicalView && hierarchicalData) {
    return (
      <div className="space-y-4">
        {Array.from(hierarchicalData.entries()).map(([zone, tsmMap]) => {
          const isZoneExpanded = expandedMDOs.has(zone);
          const allMdos = Array.from(tsmMap.values()).flatMap(tsm => tsm.mdos);
          const zoneTotals = allMdos.reduce((acc, mdo) => ({
            openingStock: acc.openingStock + mdo.opening_stock,
            ytdSales: acc.ytdSales + mdo.ytd_sales,
            liquidation: acc.liquidation + mdo.liquidation,
            balanceStock: acc.balanceStock + mdo.balance_stock
          }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });

          return (
            <div key={zone} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => onToggleZone(zone)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isZoneExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{zone}</h3>
                    <p className="text-sm text-gray-600">{tsmMap.size} TSMs • {allMdos.length} MDOs</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Opening Stock</p>
                    <p className="font-semibold text-orange-600">₹{(zoneTotals.openingStock / 100000).toFixed(2)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">YTD Sales</p>
                    <p className="font-semibold text-blue-600">₹{(zoneTotals.ytdSales / 100000).toFixed(2)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Liquidation</p>
                    <p className="font-semibold text-purple-600">₹{(zoneTotals.liquidation / 100000).toFixed(2)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="font-semibold text-green-600">₹{(zoneTotals.balanceStock / 100000).toFixed(2)}L</p>
                  </div>
                </div>
              </button>

              {isZoneExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  {Array.from(tsmMap.entries()).map(([tsmId, tsmData]) => {
                    const isTsmExpanded = expandedMDOs.has(`tsm_${zone}_${tsmId}`);
                    const tsmTotals = tsmData.mdos.reduce((acc, mdo) => ({
                      openingStock: acc.openingStock + mdo.opening_stock,
                      ytdSales: acc.ytdSales + mdo.ytd_sales,
                      liquidation: acc.liquidation + mdo.liquidation,
                      balanceStock: acc.balanceStock + mdo.balance_stock
                    }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });

                    return (
                      <div key={tsmId} className="border-b border-gray-200 last:border-b-0">
                        <button
                          onClick={() => onToggleTSM(zone, tsmId)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isTsmExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                            <User className="w-5 h-5 text-blue-600" />
                            <div className="text-left">
                              <h4 className="font-medium text-gray-900">{tsmData.tsmName}</h4>
                              <p className="text-xs text-gray-500">TSM • {tsmData.mdos.length} MDOs</p>
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div className="text-right">
                              <p className="text-gray-500">Opening</p>
                              <p className="font-medium text-orange-600">₹{(tsmTotals.openingStock / 100000).toFixed(2)}L</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500">Sales</p>
                              <p className="font-medium text-blue-600">₹{(tsmTotals.ytdSales / 100000).toFixed(2)}L</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500">Liquidation</p>
                              <p className="font-medium text-purple-600">₹{(tsmTotals.liquidation / 100000).toFixed(2)}L</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500">Balance</p>
                              <p className="font-medium text-green-600">₹{(tsmTotals.balanceStock / 100000).toFixed(2)}L</p>
                            </div>
                          </div>
                        </button>

                        {isTsmExpanded && (
                          <div className="bg-white border-t border-gray-200">
                            {tsmData.mdos.map((mdo) => {
                              const isMDOExpanded = expandedMDOs.has(`mdo_${mdo.mdo_id}`);
                              return (
                                <div key={mdo.mdo_id} className="border-b border-gray-100 last:border-b-0">
                                  <button
                                    onClick={() => onToggleMDO(mdo.mdo_id)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {isMDOExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                      <div className="text-left">
                                        <p className="font-medium text-gray-900 text-sm">{mdo.mdo_name}</p>
                                        <p className="text-xs text-gray-500">{mdo.outlet_count} customers • {mdo.territory}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-3 text-xs">
                                      <div className="text-right">
                                        <p className="font-medium text-orange-600">₹{(mdo.opening_stock / 100000).toFixed(2)}L</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-blue-600">₹{(mdo.ytd_sales / 100000).toFixed(2)}L</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-purple-600">₹{(mdo.liquidation / 100000).toFixed(2)}L</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium text-green-600">₹{(mdo.balance_stock / 100000).toFixed(2)}L</p>
                                      </div>
                                    </div>
                                  </button>

                                  {isMDOExpanded && mdo.outlets.length > 0 && (
                                    <div className="bg-gray-50 px-4 pb-4">
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-100">
                                            <tr>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Customer</th>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Owner</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Opening</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Sales</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Liquidation</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Liq %</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Balance</th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                            {mdo.outlets.map((outlet) => {
                                              const liqPct = outlet.opening_stock > 0 ? ((outlet.liquidation / outlet.opening_stock) * 100).toFixed(1) : '0.0';
                                              return (
                                                <tr key={outlet.id} className="hover:bg-gray-50">
                                                  <td className="px-3 py-2 text-gray-900">{outlet.outlet_name}</td>
                                                  <td className="px-3 py-2 text-gray-700">{outlet.owner_name}</td>
                                                  <td className="px-3 py-2 text-right text-orange-600">₹{(outlet.opening_stock / 100000).toFixed(2)}L</td>
                                                  <td className="px-3 py-2 text-right text-blue-600">₹{(outlet.sales / 100000).toFixed(2)}L</td>
                                                  <td className="px-3 py-2 text-right text-purple-600">₹{(outlet.liquidation / 100000).toFixed(2)}L</td>
                                                  <td className="px-3 py-2 text-right font-medium text-gray-900">{liqPct}%</td>
                                                  <td className="px-3 py-2 text-right text-green-600">₹{(outlet.balance_stock / 100000).toFixed(2)}L</td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (groupedData) {
    return (
      <div className="space-y-4">
        {Array.from(groupedData.entries()).map(([zone, mdos]) => {
          const isZoneExpanded = expandedMDOs.has(zone);
          const zoneTotals = mdos.reduce((acc, mdo) => ({
            openingStock: acc.openingStock + mdo.opening_stock,
            ytdSales: acc.ytdSales + mdo.ytd_sales,
            liquidation: acc.liquidation + mdo.liquidation,
            balanceStock: acc.balanceStock + mdo.balance_stock
          }), { openingStock: 0, ytdSales: 0, liquidation: 0, balanceStock: 0 });

          return (
            <div key={zone} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => onToggleZone(zone)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isZoneExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{zone}</h3>
                    <p className="text-sm text-gray-600">{mdos.length} MDOs</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Opening Stock</p>
                    <p className="font-semibold text-orange-600">₹{(zoneTotals.openingStock / 100000).toFixed(2)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">YTD Sales</p>
                    <p className="font-semibold text-blue-600">₹{(zoneTotals.ytdSales / 100000).toFixed(2)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Liquidation</p>
                    <p className="font-semibold text-purple-600">₹{(zoneTotals.liquidation / 100000).toFixed(2)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="font-semibold text-green-600">₹{(zoneTotals.balanceStock / 100000).toFixed(2)}L</p>
                  </div>
                </div>
              </button>

              {isZoneExpanded && (
                <div className="border-t border-gray-200">
                  {mdos.map((mdo) => {
                    const isMDOExpanded = expandedMDOs.has(`mdo_${mdo.mdo_id}`);
                    return (
                      <div key={mdo.mdo_id} className="border-b border-gray-100 last:border-b-0">
                        <button
                          onClick={() => onToggleMDO(mdo.mdo_id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isMDOExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{mdo.mdo_name}</p>
                              <p className="text-xs text-gray-500">{mdo.outlet_count} customers | {mdo.territory}</p>
                            </div>
                          </div>
                          <div className="flex gap-3 text-sm">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Opening</p>
                              <p className="font-medium text-orange-600">₹{(mdo.opening_stock / 100000).toFixed(2)}L</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Sales</p>
                              <p className="font-medium text-blue-600">₹{(mdo.ytd_sales / 100000).toFixed(2)}L</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Liquidation</p>
                              <p className="font-medium text-purple-600">₹{(mdo.liquidation / 100000).toFixed(2)}L</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Balance</p>
                              <p className="font-medium text-green-600">₹{(mdo.balance_stock / 100000).toFixed(2)}L</p>
                            </div>
                          </div>
                        </button>

                        {isMDOExpanded && mdo.outlets.length > 0 && (
                          <div className="bg-gray-50 px-4 pb-4">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Customer</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Owner</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Opening</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Sales</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Liquidation</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Liq %</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Balance</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {mdo.outlets.map((outlet) => {
                                    const liqPct = outlet.opening_stock > 0 ? ((outlet.liquidation / outlet.opening_stock) * 100).toFixed(1) : '0.0';
                                    return (
                                      <tr key={outlet.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-gray-900">{outlet.outlet_name}</td>
                                        <td className="px-3 py-2 text-gray-700">{outlet.owner_name}</td>
                                        <td className="px-3 py-2 text-right text-orange-600">₹{(outlet.opening_stock / 100000).toFixed(2)}L</td>
                                        <td className="px-3 py-2 text-right text-blue-600">₹{(outlet.sales / 100000).toFixed(2)}L</td>
                                        <td className="px-3 py-2 text-right text-purple-600">₹{(outlet.liquidation / 100000).toFixed(2)}L</td>
                                        <td className="px-3 py-2 text-right font-medium text-gray-900">{liqPct}%</td>
                                        <td className="px-3 py-2 text-right text-green-600">₹{(outlet.balance_stock / 100000).toFixed(2)}L</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                Distributor/MDO
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                Territory
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                Region
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">
                Zone
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
                Customers
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                Opening Stock
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                YTD Sales
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                Liquidation
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                Liq %
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">
                Balance Stock
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mdoData.map((mdo) => {
              const isMDOExpanded = expandedMDOs.has(mdo.mdo_id);
              const liqPct = mdo.opening_stock > 0 ? ((mdo.liquidation / mdo.opening_stock) * 100).toFixed(1) : '0.0';

              return (
                <React.Fragment key={mdo.mdo_id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onToggleMDO(mdo.mdo_id)}
                        className="flex items-center gap-2 text-left"
                      >
                        {isMDOExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        <span className="text-sm font-medium text-gray-900">{mdo.mdo_name}</span>
                      </button>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">{mdo.territory}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{mdo.region}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{mdo.zone}</td>
                    <td className="px-3 py-2 text-sm text-center text-gray-700">{mdo.outlet_count}</td>
                    <td className="px-3 py-2 text-sm text-right text-orange-600">
                      ₹{(mdo.opening_stock / 100000).toFixed(2)}L
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-blue-600">
                      ₹{(mdo.ytd_sales / 100000).toFixed(2)}L
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-purple-600">
                      ₹{(mdo.liquidation / 100000).toFixed(2)}L
                    </td>
                    <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                      {liqPct}%
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-green-600">
                      ₹{(mdo.balance_stock / 100000).toFixed(2)}L
                    </td>
                  </tr>

                  {isMDOExpanded && mdo.outlets.length > 0 && (
                    <tr>
                      <td colSpan={10} className="p-0">
                        <div className="bg-gray-50 px-8 py-4">
                          <table className="w-full">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Customer Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Owner</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Opening Stock</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Sales</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Liquidation</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Liq %</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Balance Stock</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {mdo.outlets.map((outlet) => {
                                const outletLiqPct = outlet.opening_stock > 0
                                  ? ((outlet.liquidation / outlet.opening_stock) * 100).toFixed(1)
                                  : '0.0';
                                return (
                                  <tr key={outlet.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm text-gray-900">{outlet.outlet_name}</td>
                                    <td className="px-3 py-2 text-sm text-gray-700">{outlet.owner_name}</td>
                                    <td className="px-3 py-2 text-sm text-right text-orange-600">
                                      ₹{(outlet.opening_stock / 100000).toFixed(2)}L
                                    </td>
                                    <td className="px-3 py-2 text-sm text-right text-blue-600">
                                      ₹{(outlet.sales / 100000).toFixed(2)}L
                                    </td>
                                    <td className="px-3 py-2 text-sm text-right text-purple-600">
                                      ₹{(outlet.liquidation / 100000).toFixed(2)}L
                                    </td>
                                    <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                                      {outletLiqPct}%
                                    </td>
                                    <td className="px-3 py-2 text-sm text-right text-green-600">
                                      ₹{(outlet.balance_stock / 100000).toFixed(2)}L
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {mdoData.length === 0 && (
        <div className="p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No distributor data available</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters or date range</p>
        </div>
      )}
    </div>
  );
};
