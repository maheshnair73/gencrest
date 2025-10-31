/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  X,
  Building,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useLiquidation } from "../../contexts/LiquidationContext";

interface DetailedMetricsModalProps {
  selectedMetric: string;
  selectedDistributorId: string | null;
  onClose: () => void;
  distributorMetrics: any[];
  userTerritory?: string;
}

export const DetailedMetricsModal: React.FC<DetailedMetricsModalProps> = ({
  selectedMetric,
  selectedDistributorId,
  onClose,
  distributorMetrics,
  userTerritory,
}) => {
  const {
    productData,
    fetchProductData,
    fetchProductTransactions,
  } = useLiquidation();

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [expandedSKUs, setExpandedSKUs] = useState<Set<string>>(new Set());
  const [skuTransactions, setSkuTransactions] = useState<Record<string, any[]>>(
    {}
  );
  const [loadingSKU, setLoadingSKU] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // ✅ Fetch Product Data
  useEffect(() => {
    if (!selectedDistributorId) return;
    setLoadingProducts(true);
    fetchProductData(selectedDistributorId)
      .finally(() => setLoadingProducts(false));
  }, [selectedDistributorId, fetchProductData]);

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) newExpanded.delete(productId);
    else newExpanded.add(productId);
    setExpandedProducts(newExpanded);
  };

  const handleFetchTransactions = async (skuCode: string) => {
    if (!selectedDistributorId || !selectedMetric) return;
    setLoadingSKU(skuCode);
    try {
      const data = await fetchProductTransactions(
        selectedDistributorId,
        skuCode,
        selectedMetric
      );
      setSkuTransactions((prev) => ({ ...prev, [skuCode]: data }));
    } finally {
      setLoadingSKU(null);
    }
  };

  const toggleSKU = (skuCode: string) => {
    const newExpanded = new Set(expandedSKUs);
    if (newExpanded.has(skuCode)) newExpanded.delete(skuCode);
    else {
      newExpanded.add(skuCode);
      if (!skuTransactions[skuCode]) handleFetchTransactions(skuCode);
    }
    setExpandedSKUs(newExpanded);
  };

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case "opening":
        return "Opening Stock Details";
      case "sales":
        return "YTD Net Sales Details";
      case "liquidation":
        return "Liquidation Details";
      case "balance":
        return "Balance Stock Details";
      default:
        return "Details";
    }
  };

  const getMetricSubtitle = () => {
    switch (selectedMetric) {
      case "opening":
        return "Distributor wise opening stock breakdown";
      case "sales":
        return "Distributor wise sales performance";
      case "liquidation":
        return "Distributor wise liquidation breakdown";
      case "balance":
        return "Distributor wise remaining stock";
      default:
        return "";
    }
  };

  const filteredData = selectedDistributorId
    ? distributorMetrics.filter((d) => d.id === selectedDistributorId)
    : distributorMetrics;

  const totalValue = filteredData.reduce((sum, dist) => {
    if (selectedMetric === "opening")
      return sum + dist.metrics.openingStock.value;
    if (selectedMetric === "sales") return sum + dist.metrics.ytdNetSales.value;
    if (selectedMetric === "liquidation")
      return sum + dist.metrics.liquidation.value;
    if (selectedMetric === "balance")
      return sum + dist.metrics.balanceStock.value;
    return sum;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-xl w-screen sm:w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* ===== HEADER ===== */}
        <div className="border-b border-gray-200">
          <div className="p-3 sm:p-6 pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      {getMetricTitle()}
                    </h2>
                    <p className="text-gray-600 mt-1 text-xs sm:text-base">
                      {getMetricSubtitle()}
                    </p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-400 rounded-xl px-3 sm:px-6 py-2 sm:py-3 text-center w-fit">
                    <div className="text-xl sm:text-3xl font-bold text-orange-900">
                      ₹{totalValue.toFixed(2)}L
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Total{" "}
                      {selectedMetric === "liquidation"
                        ? "Liquidation"
                        : selectedMetric === "openingStock"
                        ? "Opening Stock"
                        : selectedMetric === "ytdNetSales"
                        ? "Sales"
                        : "Balance"}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-2 sm:ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-hidden">
              <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              {selectedDistributorId ? (
                <>
                  {(() => {
                    const dist = distributorMetrics.find(
                      (d) => d.id === selectedDistributorId
                    );
                    return dist ? (
                      <>
                        <span className="font-semibold truncate capitalize">
                          {dist.distributorName}
                        </span>
                        <span className="hidden sm:inline flex-shrink-0">•</span>
                        <span className="flex-shrink-0">
                          Code: {dist.distributorCode}
                        </span>
                        <span className="hidden sm:inline flex-shrink-0">•</span>
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate capitalize">
                          {dist.territory}, {dist.state}
                        </span>
                        <span className="sm:hidden flex-shrink-0">
                          {dist.territory}
                        </span>
                      </>
                    ) : null;
                  })()}
                </>
              ) : (
                <>
                  <span className="font-semibold truncate">
                    All Distributors
                  </span>
                  <span className="hidden sm:inline flex-shrink-0">•</span>
                  <span className="flex-shrink-0">
                    Total: {distributorMetrics.length} distributor
                    {distributorMetrics.length !== 1 ? "s" : ""}
                  </span>
                  <span className="hidden sm:inline flex-shrink-0">•</span>
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">
                    Viewing: {userTerritory || "All Territories"}
                  </span>
                  <span className="sm:hidden flex-shrink-0">
                    {userTerritory || "All"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex border-b border-gray-200 px-3 sm:px-6 overflow-x-auto scrollbar-hide mt-4">
            <button className="flex-shrink-0 px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-colors relative whitespace-nowrap text-gray-900 border-b-2 border-orange-500">
              PRODUCT & SKU WISE BREAKDOWN
            </button>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {loadingProducts ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded-lg border border-gray-200"
                ></div>
              ))}
            </div>
          ) : (
            <>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Product & SKU Breakdown
              </h3>
              <div className="space-y-3">
                {(() => {
                  const hasData = productData?.some((p) =>
                    p?.skus?.some(
                      (s) =>
                        s.openingStock > 0 ||
                        s.ytdSales > 0 ||
                        s.liquidated > 0 ||
                        s.currentStock > 0
                    )
                  );

                  if (!hasData) {
                    return (
                      <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                        <div className="text-3xl mb-2">📦</div>
                        <p className="text-sm sm:text-base font-medium">
                          No data found
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                          There are no stock, sales, or liquidation records
                          available.
                        </p>
                      </div>
                    );
                  }

                  return productData?.map((product) => {
                    const getMetricSum = (metric: string) =>
                      product.skus.reduce((sum, sku) => {
                        if (metric === "opening") return sum + sku.openingStock;
                        if (metric === "sales") return sum + sku.ytdSales;
                        if (metric === "liquidation") return sum + sku.liquidated;
                        if (metric === "balance") return sum + sku.currentStock;
                        return sum;
                      }, 0);

                    const productTotal = getMetricSum(selectedMetric);
                    if (productTotal === 0) return null;

                    const productValue = product.skus.reduce((sum, sku) => {
                      let q = 0;
                      if (selectedMetric === "opening") q = sku.openingStock;
                      else if (selectedMetric === "sales") q = sku.ytdSales;
                      else if (selectedMetric === "liquidation")
                        q = sku.liquidated;
                      else if (selectedMetric === "balance")
                        q = sku.currentStock;
                      return sum + q * sku.unitPrice;
                    }, 0);

                    return (
                      <div
                        key={product.productId}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between bg-gradient-to-r from-orange-400 to-orange-500 p-3 sm:p-4 text-white cursor-pointer hover:from-orange-500 hover:to-orange-600 transition-all"
                          onClick={() => toggleProduct(product.productId)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm sm:text-base">
                              {product.productName}
                            </h4>
                            <p className="text-xs opacity-90 mt-0.5">
                              Code:{" "}
                              <span className="font-semibold uppercase">
                                {product.productCode}
                              </span>{" "}
                              • Category:{" "}
                              <span className="font-semibold">
                                {product.category}
                              </span>
                            </p>
                          </div>
                          <div className="text-right mr-3">
                            <div className="text-base sm:text-lg font-bold">
                              ₹{productValue.toLocaleString()}
                            </div>
                            <div className="text-xs opacity-90">
                              {productTotal.toLocaleString()} Kg/Ltr
                            </div>
                          </div>
                          {expandedProducts.has(product.productId) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>

                        {expandedProducts.has(product.productId) && (
                          <div className="bg-white">
                            {product.skus.map((sku) => {
                              let skuQty = 0;
                              if (selectedMetric === "opening")
                                skuQty = sku.openingStock;
                              else if (selectedMetric === "sales")
                                skuQty = sku.ytdSales;
                              else if (selectedMetric === "liquidation")
                                skuQty = sku.liquidated;
                              else if (selectedMetric === "balance")
                                skuQty = sku.currentStock;
                              const skuValue = skuQty * sku.unitPrice;

                              return (
                                <div
                                  key={sku.productCode}
                                  className="border-t border-gray-200"
                                >
                                  <div
                                    className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => toggleSKU(sku.productCode)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                          {sku.skuName}
                                        </h5>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                          SKU: {sku.skuCode} • Unit Price: ₹
                                          {sku.unitPrice}/{sku.unit}
                                        </p>
                                      </div>
                                      <div className="text-right ml-4 flex-shrink-0 flex items-center gap-2">
                                        <div>
                                          <div className="text-sm sm:text-base font-bold text-gray-900">
                                            ₹{skuValue.toLocaleString()}
                                          </div>
                                          <div className="text-xs sm:text-sm text-gray-600">
                                            {skuQty.toLocaleString()} {sku.unit}
                                          </div>
                                        </div>
                                        {expandedSKUs.has(sku.productCode) ? (
                                          <ChevronUp className="w-4 h-4 text-gray-500" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-gray-500" />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {expandedSKUs.has(sku.productCode) && (
                                    <div className="bg-gray-50 border-t border-gray-200">
                                      {loadingSKU === sku.productCode ? (
                                        <div className="flex justify-center py-6 text-gray-500">
                                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                          Loading transactions...
                                        </div>
                                      ) : skuTransactions[sku.productCode]
                                          ?.length > 0 ? (
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs sm:text-sm">
                                            <thead className="bg-gray-100">
                                              <tr>
                                                <th className="px-3 sm:px-4 py-2 text-left font-semibold text-gray-700">
                                                  Invoice Date
                                                </th>
                                                <th className="px-3 sm:px-4 py-2 text-center font-semibold text-gray-700">
                                                  Sale/Return
                                                </th>
                                                <th className="px-3 sm:px-4 py-2 text-right font-semibold text-gray-700">
                                                  Quantity
                                                </th>
                                                <th className="px-3 sm:px-4 py-2 text-right font-semibold text-gray-700">
                                                  Value
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                              {skuTransactions[
                                                sku.productCode
                                              ].map((txn, idx) => (
                                                <tr
                                                  key={idx}
                                                  className="hover:bg-gray-50"
                                                >
                                                  <td className="px-3 sm:px-4 py-2 text-left text-gray-900">
                                                    {txn.date}
                                                  </td>
                                                  <td className="px-3 sm:px-4 py-2 text-center">
                                                    <span
                                                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                        txn.type === "Sale"
                                                          ? "bg-green-100 text-green-700"
                                                          : "bg-red-100 text-red-700"
                                                      }`}
                                                    >
                                                      {txn.type}
                                                    </span>
                                                  </td>
                                                  <td className="px-3 sm:px-4 py-2 text-right text-gray-900">
                                                    {txn.quantity}
                                                  </td>
                                                  <td className="px-3 sm:px-4 py-2 text-right text-gray-900">
                                                    ₹{txn.value}L
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-gray-500">
                                          No transaction data available
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
