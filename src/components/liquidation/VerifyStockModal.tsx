/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useRef, useEffect } from 'react';
import { X, Building2, Hash, MapPin, ChevronDown, ChevronUp, Camera, Upload, FileText, CheckCircle, AlertTriangle, MailCheckIcon, MessageCircle, MessageCircleIcon, Eye, Download, Share2, Copy, Navigation } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { AddRetailerModal, NewRetailerData } from './AddRetailerModal';
import { ProofDocumentViewer } from './ProofDocumentViewer';
import { IRetailer, useLiquidation } from '../../contexts/LiquidationContext';
import LoadingSkeleton from '../LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import jsPDF from 'jspdf';
import { supabase } from '../../lib/supabase';

const InlineLoader: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);
interface SKU {
  productCode: string | null | undefined;
  skuCode: string;
  skuName: string;
  name?: string;
  unit: string;
  openingStock: number;
  currentStock: number;
  liquidated: number;
  unitPrice: number;
}

interface Product {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  skus: SKU[];
}

interface VerifyStockModalProps {
  distributorId: string;
  distributorName: string;
  distributorCode: string;
  salesStaffName?: string;
  onClose: () => void;
  productData: Product[];
  selectedMetric: string;
  distributorLatitude?: number | null;
  distributorLongitude?: number | null;
}

export const VerifyStockModal: React.FC<VerifyStockModalProps> = ({
  distributorId,
  distributorName,
  distributorCode,
  salesStaffName = 'Sales Representative',
  selectedMetric,
  onClose,
  distributorLatitude,
  distributorLongitude
}) => {
  const userLocation = useGeolocation();
  const { productData, fetchProductData, retailers, createRetailer, fetchRetailers, uploadFile, submitLiquidation, loadingProducts } = useLiquidation();
  const [showLoader, setShowLoader] = useState(false);
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [generatedDocLink, setGeneratedDocLink] = useState<string | null>(null);
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 10000000) {
      return `${sign}₹${(absValue / 10000000).toFixed(2)}Cr`;
    } else if (absValue >= 100000) {
      return `${sign}₹${(absValue / 100000).toFixed(2)}L`;
    } else if (absValue >= 1000) {
      return `${sign}₹${(absValue / 1000).toFixed(2)}K`;
    }
    return `${sign}₹${absValue.toFixed(2)}`;
  };

  const { user } = useAuth()
  const { showError, showSuccess, showWarning } = useModal();
  const [modalTab, setModalTab] = useState<'details' | 'verify'>('details');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedSKUs, setExpandedSKUs] = useState<Set<string>>(new Set());
  const [verificationProductData, setVerificationProductData] = useState<Product[]>([]);
  const [currentDistributorId, setCurrentDistributorId] = useState<string | null>(null);

  useEffect(() => {
    if (distributorId !== currentDistributorId) {
      setVerificationProductData([]);
      setCurrentDistributorId(distributorId);
      fetchProductData(distributorId!);
    }
  }, [distributorId, fetchProductData, selectedMetric, currentDistributorId])
  const [stockInputs, setStockInputs] = useState<Map<string, string>>(new Map());
  const [allSKUsToProcess, setAllSKUsToProcess] = useState<Array<{ product: Product; sku: SKU; newStock: number }>>([]);
  const [showTransactionSplitModal, setShowTransactionSplitModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);

  useEffect(() => {
    fetchRetailers();
  }, [fetchRetailers])

  // Check location on modal open
  useEffect(() => {
    // Wait a moment for location to load
    const timer = setTimeout(() => {
      if (!userLocation.loading) {
        // Check user location
        if (userLocation.error || !userLocation.latitude || !userLocation.longitude) {
          showError('Please update your location details');
          // Don't close modal - let user close it manually after seeing error
          return;
        }

        // Check outlet location
        if (!distributorLatitude || !distributorLongitude) {
          showError('Please update your location details');
          // Don't close modal - let user close it manually after seeing error
          return;
        }
      }
    }, 1500); // Give 1.5 seconds for location to load

    return () => clearTimeout(timer);
  }, [userLocation.loading, userLocation.error, userLocation.latitude, userLocation.longitude, distributorLatitude, distributorLongitude, showError]);

  useEffect(() => {
    if (productData && productData.length > 0) {
      setVerificationProductData(productData);
    } else if (!loadingProducts) {
      // Show dummy data when no data from database
      const dummyData: Product[] = [
        {
          productId: 'P001',
          productCode: 'P001',
          productName: 'Herbicide Premium',
          category: 'Agrochemical',
          skus: [
            {
              productCode: 'P001',
              skuCode: 'SKU001',
              skuName: '500ml Bottle',
              unit: 'ml',
              openingStock: 150,
              ytdSales: 80,
              liquidated: 80,
              currentStock: 70,
              unitPrice: 450
            },
            {
              productCode: 'P001',
              skuCode: 'SKU002',
              skuName: '1L Bottle',
              unit: 'Ltr',
              openingStock: 200,
              ytdSales: 120,
              liquidated: 120,
              currentStock: 80,
              unitPrice: 850
            }
          ]
        },
        {
          productId: 'P002',
          productCode: 'P002',
          productName: 'Insecticide Pro',
          category: 'Agrochemical',
          skus: [
            {
              productCode: 'P002',
              skuCode: 'SKU003',
              skuName: '250ml Bottle',
              unit: 'ml',
              openingStock: 180,
              ytdSales: 95,
              liquidated: 95,
              currentStock: 85,
              unitPrice: 320
            },
            {
              productCode: 'P002',
              skuCode: 'SKU004',
              skuName: '500ml Bottle',
              unit: 'ml',
              openingStock: 160,
              ytdSales: 70,
              liquidated: 70,
              currentStock: 90,
              unitPrice: 580
            }
          ]
        },
        {
          productId: 'P003',
          productCode: 'P003',
          productName: 'Fungicide Advanced',
          category: 'Agrochemical',
          skus: [
            {
              productCode: 'P003',
              skuCode: 'SKU005',
              skuName: '1L Bottle',
              unit: 'Ltr',
              openingStock: 120,
              ytdSales: 60,
              liquidated: 60,
              currentStock: 60,
              unitPrice: 920
            }
          ]
        }
      ];
      setVerificationProductData(dummyData);
    }
  }, [productData, loadingProducts])
  // Per-SKU data storage: key = `${productCode}-${skuCode}`
  const [skuFarmerQuantities, setSkuFarmerQuantities] = useState<Map<string, string>>(new Map());
  const [skuRetailers, setSkuRetailers] = useState<Map<string, Array<{ id: string; code: string; name: string; phone: string; address: string; quantity: string }>>>(new Map());

  const [expandedSKUsInVerification, setExpandedSKUsInVerification] = useState<Set<string>>(new Set());

  const [uploadedProofs, setUploadedProofs] = useState<any[]>([]);
  const [selectedProofForViewing, setSelectedProofForViewing] = useState<any | null>(null);
  const [showAddRetailerModal, setShowAddRetailerModal] = useState(false);
  const [currentSKUKeyForRetailerSelection, setCurrentSKUKeyForRetailerSelection] = useState<string>('');
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedMetadata, setCapturedMetadata] = useState<{ user: string; timestamp: string; location: string } | null>(null);

  // Save verification progress to localStorage
  const saveVerificationProgress = () => {
    if (verificationStep > 1 && allSKUsToProcess.length > 0) {
      const progress = {
        distributorId,
        distributorCode,
        distributorName,
        verificationStep,
        allSKUsToProcess,
        skuFarmerQuantities: Array.from(skuFarmerQuantities.entries()),
        skuRetailers: Array.from(skuRetailers.entries()),
        signature,
        uploadedProofs,
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
      };
      localStorage.setItem(`verification_progress_${distributorId}`, JSON.stringify(progress));
    }
  };

  // Load verification progress from localStorage
  const loadVerificationProgress = () => {
    const savedProgress = localStorage.getItem(`verification_progress_${distributorId}`);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        const savedDate = new Date(progress.date).toDateString();
        const today = new Date().toDateString();

        if (savedDate === today && progress.distributorId === distributorId) {
          return progress;
        } else {
          // Clear old progress if it's not from today
          localStorage.removeItem(`verification_progress_${distributorId}`);
        }
      } catch (error) {
        console.error('Error loading verification progress:', error);
      }
    }
    return null;
  };

  // Clear verification progress from localStorage
  const clearVerificationProgress = () => {
    localStorage.removeItem(`verification_progress_${distributorId}`);
  };

  useEffect(() => {
    if (distributorId && distributorId !== currentDistributorId) {
      // Check for saved progress
      const savedProgress = loadVerificationProgress();

      if (savedProgress && savedProgress.verificationStep > 1) {
        // Ask user if they want to continue
        const continueProgress = window.confirm(
          `You have incomplete verification from today for ${savedProgress.distributorName}. Would you like to continue from where you left off (Step ${savedProgress.verificationStep})?`
        );

        if (continueProgress) {
          // Restore saved state
          setVerificationStep(savedProgress.verificationStep);
          setAllSKUsToProcess(savedProgress.allSKUsToProcess);
          setSkuFarmerQuantities(new Map(savedProgress.skuFarmerQuantities));
          setSkuRetailers(new Map(savedProgress.skuRetailers));
          setSignature(savedProgress.signature || '');
          setUploadedProofs(savedProgress.uploadedProofs || []);
          setShowTransactionSplitModal(true);
          setCurrentDistributorId(distributorId);
          fetchProductData(distributorId);
          return;
        } else {
          // Clear saved progress if user doesn't want to continue
          clearVerificationProgress();
        }
      }

      // 🧹 Clear old data to prevent flicker of old info
      setVerificationProductData([]);
      setStockInputs(new Map());
      setExpandedProducts(new Set());
      setExpandedSKUs(new Set());
      setAllSKUsToProcess([]);
      setSkuFarmerQuantities(new Map());
      setSkuRetailers(new Map());
      setUploadedProofs([]);
      setSignature('');
      setCapturedMetadata(null);
      setVerificationStep(1);
      setShowTransactionSplitModal(false);

      // Update distributor reference
      setCurrentDistributorId(distributorId);

      // 🕐 Now fetch fresh data
      fetchProductData(distributorId);
    }

  }, [distributorId, fetchProductData, currentDistributorId]);
  const [isDataReady, setIsDataReady] = useState(false);
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // When loading starts
    if (loadingProducts) {
      setShowLoader(true);
      setIsDataReady(false);
    }

    // When data finishes loading and product data arrives
    if (!loadingProducts && verificationProductData.length > 0) {
      // Keep loader visible slightly longer for smoothness
      timer = setTimeout(() => {
        const newTotal = verificationProductData.reduce(
          (sum, product) =>
            sum +
            product.skus.reduce(
              (skuSum, sku) => skuSum + sku.currentStock * sku.unitPrice,
              0
            ),
          0
        );
        setDisplayValue(newTotal);
        setIsDataReady(true);
        setShowLoader(false);
      }, 500); // 👈 adjust for smooth feel (1s)
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loadingProducts, verificationProductData]);



  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleSKU = (skuCode: string) => {
    const newExpanded = new Set(expandedSKUs);
    if (newExpanded.has(skuCode)) {
      newExpanded.delete(skuCode);
    } else {
      newExpanded.add(skuCode);
    }
    setExpandedSKUs(newExpanded);
  };

  const handleStockInput = (productCode: string, skuCode: string, value: string) => {
    const key = `${productCode}-${skuCode}`;
    const newMap = new Map(stockInputs);
    if (value) {
      newMap.set(key, value);
    } else {
      newMap.delete(key);
    }
    setStockInputs(newMap);
  };

  const handleProceedToVerification = () => {
    // Check user location
    if (userLocation.loading) {
      showError('Please wait, checking your location...');
      return;
    }

    if (userLocation.error || !userLocation.latitude || !userLocation.longitude) {
      showError('Please update your location details');
      return;
    }

    // Check outlet location
    if (!distributorLatitude || !distributorLongitude) {
      showError('Please update your location details');
      return;
    }

    if (stockInputs.size === 0) {
      showError('Please enter at least one stock value');
      return;
    }

    // VALIDATION: Collect all SKUs that have stock > 0
    const allActiveSKUs: Array<{ product: Product; sku: SKU; key: string }> = [];
    verificationProductData.forEach(product => {
      product.skus.forEach(sku => {
        if (sku.currentStock > 0) {
          const key = `${product.productCode}-${sku.skuCode}`;
          allActiveSKUs.push({ product, sku, key });
        }
      });
    });

    // Check which SKUs haven't been updated
    const missingUpdates: string[] = [];
    allActiveSKUs.forEach(({ product, sku, key }) => {
      const inputValue = stockInputs.get(key);
      if (!inputValue || inputValue.trim() === '') {
        missingUpdates.push(`${product.productName} - ${sku.skuName} (${sku.skuCode})`);
      }
    });

    // If any SKUs are missing updates, show detailed error
    if (missingUpdates.length > 0) {
      const message = `Please update stock for ALL products before proceeding:\n\n${missingUpdates.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
      showError(message);
      return;
    }

    // Collect SKUs that have actual changes
    const skusToProcess: Array<{ product: Product; sku: SKU; newStock: number }> = [];

    verificationProductData.forEach(product => {
      product.skus.forEach(sku => {
        const key = `${product.productCode}-${sku.skuCode}`;
        const inputValue = stockInputs.get(key);
        if (inputValue) {
          const newStock = parseInt(inputValue);
          if (!isNaN(newStock) && newStock !== sku.currentStock) {
            skusToProcess.push({ product, sku, newStock });
          }
        }
      });
    });

    if (skusToProcess.length === 0) {
      showWarning('No changes detected in stock values');
      return;
    }

    setAllSKUsToProcess(skusToProcess);

    // Initialize empty maps for each SKU
    const newFarmerQtyMap = new Map<string, string>();
    const newRetailersMap = new Map<string, Array<any>>();
    const newExpandedSet = new Set<string>();

    skusToProcess.forEach(item => {
      const key = `${item.product.productCode}-${item.sku.productCode}`;
      newFarmerQtyMap.set(key, '0');
      newRetailersMap.set(key, []);
      newExpandedSet.add(key);
    });

    setSkuFarmerQuantities(newFarmerQtyMap);
    setSkuRetailers(newRetailersMap);
    setExpandedSKUsInVerification(newExpandedSet);
    setVerificationStep(1);
    setShowTransactionSplitModal(true);
  };

  const handleConfirmSplit = async () => {
    try {
      // 1️⃣ Validate all SKUs have proper allocation
      let hasErrors = false;
      const errors: string[] = [];

      allSKUsToProcess.forEach(item => {
        const key = `${item.product.productCode}-${item.sku.skuCode}`;
        const difference = Math.abs(item.sku.currentStock - item.newStock);
        const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
        const retailers = skuRetailers.get(key) || [];
        const actualRetailers = retailers.filter(r => r.id && r.id !== 'manual-entry');
        const retailerTotal = actualRetailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
        const total = farmerQty + retailerTotal;
        console.log(skuRetailers)
        if (total !== difference) {
          hasErrors = true;
          errors.push(`${item.product.productName} - ${item.sku.skuCode}: Total ${total} doesn't match difference ${difference}`);
        }
      });

      if (hasErrors) {
        showError(`Please fix allocation errors:\n\n${errors.join('\n')}`);
        return;
      }

      if (!signature) {
        showError("E-signature is required to submit");
        return;
      }

      // 2️⃣ Upload signature if it’s a base64 data URL
      let signatureUrl = signature;
      if (signature.startsWith("data:image")) {
        const blob = await fetch(signature).then(res => res.blob());
        const file = new File([blob], `signature_${Date.now()}.png`, { type: "image/png" });
        const uploadRes = await uploadFile(file);
        if (uploadRes?.url) signatureUrl = uploadRes.url;
        else throw new Error("Failed to upload signature");
      }

      // 3️⃣ Collect all proof URLs
      const proofUrls = uploadedProofs.map(p => p.url).filter(Boolean);
      if (proofUrls.length === 0) return showError('Please upload at least one proof');

      // 4️⃣ Build API payload following `createLiquidationEntrySchema`
      // 4️⃣ Build API payload following `createLiquidationEntrySchema`
      const payload = {
        distributorCode,
        distributorName,
        productEntries: allSKUsToProcess.map(({ product, sku, newStock }) => {
          const key = `${product.productCode}-${sku.skuCode}`;
          const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
          const currentRetailers = skuRetailers.get(key) || [];

          // Filter out manual entry AND any rows where retailer wasn't selected or quantity is invalid
          const validRetailerAllocations = currentRetailers
            .filter(r => r.id && r.id !== 'manual-entry' && r.quantity && parseInt(r.quantity) > 0)
            .map(r => ({
              retailerId: r.id,
              quantity: parseInt(r.quantity),
            }));

          return {
            productCode: sku.productCode, // Make sure this is the correct code your API expects
            currentStock: newStock, // Send the new stock level
            farmerQuantity: farmerQty,
            retailerAllocations: validRetailerAllocations,
          };
        }),// Or determine based on stock increase/decrease if needed
        signatureUrl: signatureUrl, // No longer optional if validation passes
        // retailerId: retailers?.[0]?._id || undefined, // Remove this top-level retailerId unless specifically required
        proofUrls: proofUrls, // Send proofs
      };

      console.log('Final Payload:', JSON.stringify(payload, null, 2)); // Use stringify for better readability
      // 5️⃣ Submit to backend via context API
      const success = await submitLiquidation(payload);

      if (success) {
        showSuccess("✅ Liquidation entry submitted successfully!", "Stock Verification Complete");

        // Clear saved progress after successful submission
        clearVerificationProgress();

        // 6️⃣ Update local UI data
        let updatedData = [...verificationProductData];
        allSKUsToProcess.forEach(item => {
          updatedData = updatedData.map(product => {
            if (product.productCode === item.product.productCode) {
              return {
                ...product,
                skus: product.skus.map(sku =>
                  sku.skuCode === item.sku.skuCode
                    ? { ...sku, currentStock: item.newStock }
                    : sku
                ),
              };
            }
            return product;
          });
        });
        setVerificationProductData(updatedData);

        // 7️⃣ Reset modal state and mark verification as complete
        setShowTransactionSplitModal(false);
        setSkuFarmerQuantities(new Map());
        setSkuRetailers(new Map());
        setExpandedSKUsInVerification(new Set());
        setUploadedProofs([]);
        setSignature('');
        setCapturedMetadata(null);
        setVerificationStep(1);

        // Mark verification as complete and switch to Submit Proof tab
        setIsVerificationComplete(true);
        setModalTab('verify');
      } else {
        showError("❌ Failed to submit liquidation entry. Please try again.");
      }
    } catch (err: any) {
      console.error("Error confirming split:", err);
      showError(`Submission failed: ${err.message}`);
    }
  };


  const handleSelectRetailer = (skuKey: string, retailer: { id: string; code: string; name: string; phone: string; address: string }) => {
    const currentRetailers = skuRetailers.get(skuKey) || [];
    const newRetailersMap = new Map(skuRetailers);
    newRetailersMap.set(skuKey, [...currentRetailers, { ...retailer, quantity: '' }]);
    setSkuRetailers(newRetailersMap);
  };

  const handleAddNewRetailer = (skuKey: string) => {
    setCurrentSKUKeyForRetailerSelection(skuKey);
    setShowAddRetailerModal(true);
  };

  const loadRetailerOptions = (inputValue: string) =>
    new Promise<any[]>((resolve) => {
      // Filter retailers mapped to this distributor
      const filteredRetailers = retailers.filter(
        (r: any) => {
          // Filter by distributor if the retailer has distributor info
          const isForThisDistributor = r.distributorId === distributorId || r.distributorCode === distributorCode;

          // If no input, return retailers for this distributor
          if (!inputValue) {
            return isForThisDistributor;
          }

          // With input, search across name and code
          const matchesSearch = r.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            (r.code && r.code.toLowerCase().includes(inputValue.toLowerCase()));

          return matchesSearch;
        }
      );

      // Map to the format required by react-select
      resolve(
        filteredRetailers.map((r: any) => ({
          value: r._id,
          label: `${r.name}${r.code ? ` (${r.code})` : ''}`,
          data: r,
        }))
      );
    });

  const handleSaveNewRetailer = async (retailerData: NewRetailerData) => {
    const newRetailer: IRetailer | null = await createRetailer({
      ...retailerData,
      _id: '', // Will be provided by the backend
      state: retailerData.state || '',
      region: retailerData.region || '',
      territory: retailerData.territory || '',
      zone: retailerData.zone || '',
      pincode: retailerData.pincode || '',
      address: retailerData.address || ''
    });

    if (!newRetailer) {
      showError("Failed to create new retailer.");
      return;
    }

    // The context's createRetailer function already updated the global 'retailers' list.
    // Now, add this new retailer to the current SKU's list for allocation.

    if (currentSKUKeyForRetailerSelection) {
      const currentRetailers = skuRetailers.get(currentSKUKeyForRetailerSelection) || [];
      const newRetailersMap = new Map(skuRetailers);

      const formattedRetailer = {
        id: newRetailer._id, // API returns _id
        code: (newRetailer as any).code || retailerData.code || '', // Get code from response or form data
        name: newRetailer.name,
        phone: (newRetailer as any).phone || retailerData.phone || '', // Get phone from response or form data
        address: newRetailer.address,
        quantity: '' // Start with empty quantity
      };

      newRetailersMap.set(currentSKUKeyForRetailerSelection, [...currentRetailers, formattedRetailer]);
      setSkuRetailers(newRetailersMap);
    }

    setShowAddRetailerModal(false);
    setCurrentSKUKeyForRetailerSelection('');
  };

  const handleRemoveRetailer = (skuKey: string, index: number) => {
    const currentRetailers = skuRetailers.get(skuKey) || [];
    const newRetailersMap = new Map(skuRetailers);
    newRetailersMap.set(skuKey, currentRetailers.filter((_, i) => i !== index));
    setSkuRetailers(newRetailersMap);
  };

  const handleRetailerQuantityChange = (skuKey: string, index: number, quantity: string) => {
    const currentRetailers = skuRetailers.get(skuKey) || [];
    const newRetailersMap = new Map(skuRetailers);
    newRetailersMap.set(skuKey, currentRetailers.map((r, i) => i === index ? { ...r, quantity } : r));
    setSkuRetailers(newRetailersMap);
  };


  const handleClickPicture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const uploadRes = await uploadFile(file);
        if (uploadRes?.url) {
          const newProof = {
            id: `photo_${Date.now()}`,
            type: 'photo',
            name: file.name,
            url: uploadRes.url,
            timestamp: new Date().toISOString(),
            metadata: {
              capturedAt: new Date().toLocaleString('en-IN'),
              userName: user?.name,
              designation: user?.role
            }
          };
          setUploadedProofs(prev => [...prev, newProof]);
          showSuccess("✅ Photo uploaded successfully");
        } else {
          showError("❌ Upload failed. Try again.");
        }
      }
    };
    input.click();
  };


  const handleDownloadVerificationDoc = () => {
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Stock Verification Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #1f2937; border-bottom: 3px solid #f97316; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .header-info { margin: 20px 0; }
    .header-info p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
    th { background-color: #f3f4f6; font-weight: bold; }
    .outward { color: #16a34a; }
    .return { color: #2563eb; }
    .footer { margin-top: 40px; border-top: 2px solid #e5e7eb; padding-top: 20px; }
    .signature { margin-top: 60px; }
  </style>
</head>
<body>
  <h1>Stock Verification Report</h1>

  <div class="header-info">
    <p><strong>Distributor Name:</strong> ${distributorName}</p>
    <p><strong>Distributor Code:</strong> ${distributorCode}</p>
    <p><strong>Verification Date:</strong> ${currentDate}</p>
    <p><strong>Verified By:</strong> ${user?.name || 'N/A'}</p>
  </div>

  <h2>Verified Products</h2>
  <table>
    <thead>
      <tr>
        <th>S.No</th>
        <th>Product Name</th>
        <th>SKU Name</th>
        <th>SKU Code</th>
        <th>Previous Stock</th>
        <th>New Stock</th>
        <th>Difference</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>`;

    allSKUsToProcess.forEach((item, idx) => {
      const difference = Math.abs(item.sku.currentStock - item.newStock);
      const isDecrease = item.newStock < item.sku.currentStock;
      const type = isDecrease ? 'Outward' : 'Return';
      const typeClass = isDecrease ? 'outward' : 'return';

      htmlContent += `
      <tr>
        <td>${idx + 1}</td>
        <td style="text-transform: capitalize;">${item.product.productName}</td>
        <td>${item.sku.skuName}</td>
        <td>${item.sku.skuCode}</td>
        <td>${item.sku.currentStock} ${item.sku.unit}</td>
        <td>${item.newStock} ${item.sku.unit}</td>
        <td>${difference} ${item.sku.unit}</td>
        <td class="${typeClass}"><strong>${type}</strong></td>
      </tr>`;
    });

    htmlContent += `
    </tbody>
  </table>

  <div class="footer">
    <p><strong>Total Products Verified:</strong> ${allSKUsToProcess.length}</p>
    <p><strong>Report Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
  </div>

  <div class="signature">
    <p>_______________________</p>
    <p><strong>Authorized Signature</strong></p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stock_Verification_${distributorCode}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showSuccess('Verification report downloaded successfully!');
  };

  const handleSubmitProof = () => {
    if (uploadedProofs.length === 0) {
      showError('Please upload at least one proof');
      return;
    }
    showSuccess(`Verification submitted with ${uploadedProofs.length} proof(s)!`);
    onClose();
  };

  // const totalValue = verificationProductData.reduce((sum, product) => {
  //   return sum + product.skus.reduce((skuSum, sku) => skuSum + (sku.currentStock * sku.unitPrice), 0);
  // }, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
        <div className="bg-white w-full h-full sm:h-auto sm:rounded-xl sm:shadow-2xl sm:max-w-6xl sm:max-h-[95vh] overflow-hidden flex flex-col">
          <div className="flex-shrink-0 sticky top-0 z-10 bg-white shadow-sm">
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 bg-white">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Verify Stock</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Outlet details and transaction history</p>
              </div>
              <button
                onClick={() => {
                  saveVerificationProgress();
                  onClose();
                }}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="bg-orange-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-orange-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-xs sm:text-sm text-orange-900 flex-1 min-w-0">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate capitalize">{distributorName}</span>
                  <span className="sm:hidden flex-shrink-0">{distributorName.substring(0, 20)}</span>
                  <span className="hidden sm:inline flex-shrink-0">•</span>
                  <Hash className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="flex-shrink-0">Code: {distributorCode}</span>
                  <span className="hidden sm:inline flex-shrink-0">•</span>
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-900 transition-all duration-500 min-h-[2rem] flex items-center justify-end">
                    {!isDataReady ? (
                      <InlineLoader />
                    ) : (
                      <>{formatCurrency(displayValue)}</>
                    )}

                  </div>
                  <div className="text-xs text-orange-600 mt-1">Total Balance Stock</div>
                </div>
              </div>
            </div>

            <div className="flex border-b border-gray-200 px-3 sm:px-6 overflow-x-auto scrollbar-hide">
              <button
                className={`flex-shrink-0 px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-colors relative whitespace-nowrap ${modalTab === 'details'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setModalTab('details')}
              >
                SKU WISE VERIFY
              </button>
              <button
                className={`flex-shrink-0 px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm transition-colors relative whitespace-nowrap ${modalTab === 'verify'
                  ? 'text-gray-900 border-b-2 border-orange-500'
                  : isVerificationComplete
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                  }`}
                onClick={() => {
                  if (!isVerificationComplete) {
                    showWarning('Please complete stock verification first before submitting proof');
                    return;
                  }
                  setModalTab('verify');
                }}
                disabled={!isVerificationComplete}
              >
                Submit Proof {!isVerificationComplete && '🔒'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {modalTab === 'details' ? (
              <>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Product & SKU Breakdown</h3>

                {/* Flat Table View - All Products & SKUs */}
                <div className="overflow-x-auto -mx-4 sm:-mx-6">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                      {(() => {
                        // Show loading skeleton while fetching data
                        if (!isDataReady) {
                          return (
                            <div className="p-6 space-y-3 animate-fade-in">
                              <LoadingSkeleton type="card" />
                              <LoadingSkeleton type="card" />
                              <LoadingSkeleton type="card" />
                            </div>
                          );
                        }

                        // Check if there's any product with stock > 0
                        const hasData = verificationProductData?.some(product =>
                          product.skus.some(sku => sku.currentStock > 0)
                        );

                        // Show fallback if no valid stock data
                        if (!hasData) {
                          return (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                              <div className="text-3xl mb-2">📦</div>
                              <p className="text-sm sm:text-base font-medium">No data found</p>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                There are no product stock records available.
                              </p>
                            </div>
                          );
                        }

                        // Flatten all SKUs into a single array
                        const allSKUs: Array<{ product: Product; sku: SKU }> = [];
                        verificationProductData?.forEach((product) => {
                          product.skus.forEach((sku) => {
                            if (sku.currentStock > 0) {
                              allSKUs.push({ product, sku });
                            }
                          });
                        });

                        return (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                  Product
                                </th>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                  SKU
                                </th>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                  Current Stock
                                </th>
                                <th scope="col" className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                  Update Stock
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {allSKUs.map(({ product, sku }, index) => {
                                const skuValue = sku.currentStock * sku.unitPrice;
                                const key = `${product.productCode}-${sku.skuCode}`;

                                return (
                                  <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-3 sm:px-6 py-4 whitespace-normal">
                                      <div className="text-xs sm:text-sm font-medium text-gray-900">{product.productName}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">{product.productCode}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 whitespace-normal">
                                      <div className="text-xs sm:text-sm font-medium text-gray-900">{sku.skuName}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">{sku.skuCode} • {sku.unit}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-center">
                                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                                        {sku.currentStock.toLocaleString()} {sku.unit}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        Value: ₹{skuValue.toLocaleString()}
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                      <input
                                        type="number"
                                        placeholder="10"
                                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                                        onChange={(e) => handleStockInput(product.productCode, sku.skuCode, e.target.value)}
                                        value={stockInputs.get(key) || ''}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 text-xs text-gray-500 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <strong className="text-orange-900">{allSKUsToProcess.length > 0 ? allSKUsToProcess.length : stockInputs.size} SKU(s)</strong> ready for verification
                </div>

              </>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 flex items-center justify-between p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-900">Location Verified</div>
                        <div className="text-sm text-green-700">0m from outlet</div>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>

                  {isVerificationComplete && allSKUsToProcess.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-blue-900">Verified Products Summary</h3>
                        <button
                          onClick={handleDownloadVerificationDoc}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download DOC
                        </button>
                      </div>
                      <div className="space-y-3">
                        {allSKUsToProcess.map((item, idx) => {
                          const key = `${item.product.productCode}-${item.sku.skuCode}`;
                          const difference = Math.abs(item.sku.currentStock - item.newStock);
                          const isDecrease = item.newStock < item.sku.currentStock;
                          return (
                            <div key={idx} className="bg-white border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-sm text-gray-900 capitalize">{item.product.productName}</p>
                                  <p className="text-xs text-gray-600">{item.sku.skuName} ({item.sku.skuCode})</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <p className="text-gray-600">Previous</p>
                                  <p className="font-bold text-gray-900">{item.sku.currentStock}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">New</p>
                                  <p className="font-bold text-green-600">{item.newStock}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Difference</p>
                                  <p className="font-bold text-red-600">{difference}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-6 text-center">Submit Proof</h3>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
                      <button
                        onClick={handleClickPicture}
                        className="flex flex-col items-center justify-center w-full sm:w-36 h-36 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                        <span className="text-sm sm:text-base font-semibold text-gray-700">Click Pic</span>
                      </button>

                      <div className="text-xl sm:text-2xl text-gray-400 font-semibold">Or</div>

                      <button
                        onClick={handleClickPicture}
                        className="flex flex-col items-center justify-center w-full sm:w-36 h-36 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                        <span className="text-sm sm:text-base font-semibold text-gray-700 text-center px-2">Upload</span>
                      </button>

                      <div className="text-xl sm:text-2xl text-gray-400 font-semibold">Or</div>

                      <button
                        className="flex flex-col items-center justify-center w-full sm:w-36 h-36 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                        <span className="text-sm sm:text-base font-semibold text-gray-700">E-sign</span>
                      </button>
                    </div>

                    {uploadedProofs.length > 0 && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3">Uploaded Proofs ({uploadedProofs.length})</h4>
                        <div className="space-y-3">
                          {uploadedProofs.map((proof) => (
                            <div key={proof.id} className="bg-white border border-blue-200 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{proof.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Photo</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setSelectedProofForViewing(proof)}
                                    className="text-blue-600 hover:text-blue-700 transition-colors"
                                    title="View and Share"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => setUploadedProofs(prev => prev.filter(p => p.id !== proof.id))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {proof.url && (
                                <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-2 cursor-pointer" onClick={() => setSelectedProofForViewing(proof)}>
                                  <img src={proof.url} alt="Uploaded" className="max-h-40 mx-auto rounded" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6">
                      <button
                        onClick={() => setModalTab('details')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmitProof}
                        disabled={uploadedProofs.length === 0}
                        className={`px-6 py-2 rounded-lg transition-colors ${uploadedProofs.length > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        Submit Verification ({uploadedProofs.length} proof{uploadedProofs.length !== 1 ? 's' : ''})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {modalTab === 'details' && (
            <div className="flex-shrink-0 bg-white border-t-2 border-orange-500 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {stockInputs.size > 0 ? (
                    <span className="font-medium text-orange-600">
                      {stockInputs.size} SKU(s) ready for verification
                    </span>
                  ) : (
                    <span>Enter stock values above to proceed</span>
                  )}
                </div>
                <button
                  onClick={handleProceedToVerification}
                  disabled={stockInputs.size === 0}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${stockInputs.size > 0
                    ? 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                    }`}
                >
                  Proceed to Verification ({stockInputs.size})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTransactionSplitModal && allSKUsToProcess.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Verify Stock Changes</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {allSKUsToProcess.length > 1 ? (
                      <span>Verifying {allSKUsToProcess.length} SKUs</span>
                    ) : (
                      <span>Verifying 1 SKU</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTransactionSplitModal(false);
                    setAllSKUsToProcess([]);
                    setSkuFarmerQuantities(new Map());
                    setSkuRetailers(new Map());
                    setExpandedSKUsInVerification(new Set());
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${verificationStep === 1 ? 'bg-blue-600 text-white' : verificationStep > 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>1</div>
                  <span className={`text-xs ${verificationStep === 1 ? 'font-semibold text-gray-900' : verificationStep > 1 ? 'text-green-600' : 'text-gray-400'}`}>Verification</span>
                </div>
                <div className="h-px w-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${verificationStep === 2 ? 'bg-blue-600 text-white' : verificationStep > 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>2</div>
                  <span className={`text-xs ${verificationStep === 2 ? 'font-semibold text-gray-900' : verificationStep > 2 ? 'text-green-600' : 'text-gray-400'}`}>Stock Allocation</span>
                </div>
                <div className="h-px w-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${verificationStep === 3 ? 'bg-blue-600 text-white' : verificationStep > 3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>3</div>
                  <span className={`text-xs ${verificationStep === 3 ? 'font-semibold text-gray-900' : verificationStep > 3 ? 'text-green-600' : 'text-gray-400'}`}>E-Sign</span>
                </div>
                <div className="h-px w-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${verificationStep === 4 ? 'bg-blue-600 text-white' : verificationStep > 4 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>4</div>
                  <span className={`text-xs ${verificationStep === 4 ? 'font-semibold text-gray-900' : verificationStep > 4 ? 'text-green-600' : 'text-gray-400'}`}>Upload Doc</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {(() => {
                const item = allSKUsToProcess[0];
                if (!item) return null;

                const key = `${item.product.productCode}-${item.sku.skuCode}`;
                const farmerQuantity = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
                const retailers = skuRetailers.get(key) || [];
                const retailerTotal = retailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
                const selectedSKUForUpdate = {
                  productName: item.product.productName,
                  productCode: item.product.productCode,
                  sku: item.sku
                };
                const newStockValue = item.newStock;
                const stockDifference = item.sku.currentStock - item.newStock;

                return (
                  <>
                    {verificationStep === 1 && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Step 1: Verify Stock Changes</h4>
                          <p className="text-sm text-blue-800">
                            Review the stock changes below. Click Next to proceed with allocation.
                          </p>
                        </div>
                        {allSKUsToProcess.map((itemMap) => {
                          const keyMap = `${itemMap.product.productCode}-${itemMap.sku.skuCode}`;
                          const difference = Math.abs(itemMap.sku.currentStock - itemMap.newStock);
                          const isDecrease = itemMap.newStock < itemMap.sku.currentStock;

                          return (
                            <div key={keyMap} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-900 capitalize">{itemMap.product.productName}</h5>
                                  <p className="text-xs text-gray-600">{itemMap.sku.skuName} ({itemMap.sku.skuCode})</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-50 rounded p-2">
                                  <p className="text-xs text-gray-600">Last Balance Stock</p>
                                  <p className="text-lg font-bold text-gray-900">{itemMap.sku.currentStock}</p>
                                  <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                                </div>
                                <div className="bg-green-50 rounded p-2">
                                  <p className="text-xs text-gray-600">Current Stock</p>
                                  <p className="text-lg font-bold text-green-600">{itemMap.newStock}</p>
                                  <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                                </div>
                                <div className="bg-red-50 rounded p-2">
                                  <p className="text-xs text-gray-600">Sold/Liquidated</p>
                                  <p className="text-lg font-bold text-red-600">{difference}</p>
                                  <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {verificationStep === 2 && (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-900 mb-2">Step 2: Allocate Stock</h4>
                          <p className="text-sm text-yellow-800">
                            Specify where the stock difference went - to farmers or retailers.
                          </p>
                        </div>
                        {allSKUsToProcess.map((itemMap) => {
                          const keyMap = `${itemMap.product.productCode}-${itemMap.sku.skuCode}`;
                          const difference = Math.abs(itemMap.sku.currentStock - itemMap.newStock);
                          const isDecrease = itemMap.newStock < itemMap.sku.currentStock;
                          const farmerQty = parseInt(skuFarmerQuantities.get(keyMap) || '0') || 0;
                          const retailersMap = skuRetailers.get(keyMap) || [];
                          const hasActualRetailersCheck = retailersMap.some(r => r.id && r.id !== 'manual-entry' && r.id !== '');
                          const retailerTotalMap = hasActualRetailersCheck
                            ? retailersMap.filter(r => r.id && r.id !== 'manual-entry' && r.id !== '').reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0)
                            : retailersMap.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
                          const total = farmerQty + retailerTotalMap;

                          return (
                            <div key={keyMap} data-sku-key={keyMap} className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-900 capitalize">{itemMap.product.productName} ({itemMap.sku.skuCode})</h5>
                                  <p className="text-xs text-gray-600">{itemMap.sku.skuName}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                                <div>
                                  <p className="text-xs text-gray-600">Last Balance Stock</p>
                                  <p className="text-base font-bold text-gray-900">{itemMap.sku.currentStock}</p>
                                  <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Current Stock</p>
                                  <p className="text-base font-bold text-green-600">{itemMap.newStock}</p>
                                  <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Sold/Liquidated</p>
                                  <p className="text-base font-bold text-red-600">{difference}</p>
                                  <p className="text-xs text-gray-500">{itemMap.sku.unit}</p>
                                </div>
                              </div>

                              <div className="bg-white rounded p-2 mb-2 text-center border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-900">
                                  Where is the balance {difference}?
                                </p>
                              </div>

                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                      Quantity allocated to Farmer(s)
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      value={skuFarmerQuantities.get(keyMap) || ''}
                                      onChange={(e) => {
                                        const newMap = new Map(skuFarmerQuantities);
                                        newMap.set(keyMap, e.target.value);
                                        setSkuFarmerQuantities(newMap);
                                      }}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    {farmerQty > 0 && (
                                      <div className="mt-1.5 flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded p-1.5">
                                        <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs text-blue-700">
                                          {farmerQty} {itemMap.sku.unit} will be directly recorded as liquidation
                                        </span>
                                      </div>
                                    )}

                                    {total === difference && total > 0 && (
                                      <div className="mt-1.5 flex items-start gap-1.5 bg-green-50 border border-green-200 rounded p-1.5">
                                        <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs text-green-700 font-medium">
                                          Fully allocated! ({total} {itemMap.sku.unit})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                     Quantity allocated to Retailer(s)
                                    </label>
                                    {(() => {
                                      const hasActualRetailers = retailersMap.some(r => r.id && r.id !== 'manual-entry' && r.id !== '');
                                      const actualRetailersTotal = retailersMap
                                        .filter(r => r.id && r.id !== 'manual-entry' && r.id !== '')
                                        .reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);

                                      // Get the manual entry value if it exists
                                      const manualEntry = retailersMap.find(r => r.id === 'manual-entry');
                                      const manualEntryValue = manualEntry ? (parseInt(manualEntry.quantity) || 0) : 0;

                                      // Display value: show manual entry if it exists, otherwise show allocated retailers total
                                      const displayValue = manualEntryValue > 0 ? manualEntryValue : actualRetailersTotal;

                                      return (
                                        <>
                                          <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            defaultValue={""}
                                            readOnly={hasActualRetailers}
                                            onChange={(e) => {
                                              if (hasActualRetailers) return;

                                              const newValue = e.target.value;
                                              const currentRetailers = skuRetailers.get(keyMap) || [];
                                              const withoutManual = currentRetailers.filter(r => r.id !== 'manual-entry');

                                              if (newValue) {
                                                // Always keep manual-entry alongside any empty retailers
                                                const newRetailersMap = new Map(skuRetailers);
                                                newRetailersMap.set(keyMap, [
                                                  {
                                                    id: 'manual-entry',
                                                    code: 'MANUAL',
                                                    name: 'Manual Entry',
                                                    phone: '',
                                                    address: '',
                                                    quantity: newValue
                                                  },
                                                  ...withoutManual
                                                ]);
                                                setSkuRetailers(newRetailersMap);
                                              } else {
                                                // If cleared, keep other retailers but remove manual-entry
                                                const newRetailersMap = new Map(skuRetailers);
                                                newRetailersMap.set(keyMap, withoutManual);
                                                setSkuRetailers(newRetailersMap);
                                              }
                                            }}
                                            className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${hasActualRetailers ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                          />
                                          {hasActualRetailers && manualEntryValue > 0 && actualRetailersTotal !== manualEntryValue && (
                                            <div className={`mt-1 text-xs flex items-center gap-1 ${actualRetailersTotal < manualEntryValue ? 'text-orange-600' : 'text-red-600'}`}>
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                              </svg>
                                              Allocated: {actualRetailersTotal} / {manualEntryValue} {itemMap.sku.unit}
                                            </div>
                                          )}
                                          {hasActualRetailers && manualEntryValue > 0 && actualRetailersTotal === manualEntryValue && (
                                            <div className="mt-1 text-xs flex items-center gap-1 text-green-600">
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                              </svg>
                                              Fully allocated!
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {(retailerTotalMap > 0 || retailersMap.length > 0) && (
                                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="text-sm font-semibold text-gray-900">Select Retailers</h6>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleAddNewRetailer(keyMap)}
                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                                      >
                                        + Create New
                                      </button>
                                      <button
                                        onClick={() => {
                                          const currentRetailers = retailersMap;
                                          const newRetailersMap = new Map(skuRetailers);
                                          newRetailersMap.set(keyMap, [...currentRetailers, {
                                            id: '',
                                            code: '',
                                            name: '',
                                            phone: '',
                                            address: '',
                                            quantity: ''
                                          }]);
                                          setSkuRetailers(newRetailersMap);
                                        }}
                                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                      >
                                        + Add Retailer
                                      </button>
                                    </div>
                                  </div>

                                  {retailersMap.length === 0 || (retailersMap.length === 1 && retailersMap[0].id === 'manual-entry') ? (
                                    <div className="text-center py-4 text-sm text-gray-500">
                                      No retailers added yet. Click "+ Add Retailer" to start.
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {retailersMap.filter(r => r.id !== 'manual-entry').map((retailer, idx) => {
                                        const actualIndex = retailersMap.findIndex(r => r === retailer);
                                        return (
                                          <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded border border-gray-200 z-50">
                                            <div className="flex-1">
                                              <AsyncSelect
                                                cacheOptions
                                                defaultOptions
                                                // Set the currently selected value for this row
                                                value={
                                                  retailer.id
                                                    ? {
                                                      value: retailer.id,
                                                      label: `${retailer.name}${retailer.code ? ` (${retailer.code})` : ""
                                                        }`,
                                                    }
                                                    : null
                                                }
                                                loadOptions={loadRetailerOptions}
                                                onChange={(selectedOption: any) => {
                                                  if (!selectedOption) return;
                                                  const selectedRetailer = selectedOption.data;
                                                  const currentRetailers = skuRetailers.get(keyMap) || [];
                                                  const newRetailersMap = new Map(skuRetailers);
                                                  const updatedRetailers = currentRetailers.map((r, i) =>
                                                    i === actualIndex
                                                      ? {
                                                        id: selectedRetailer._id,
                                                        code: selectedRetailer.code || "",
                                                        name: selectedRetailer.name,
                                                        phone: selectedRetailer.phone || "",
                                                        address: selectedRetailer.address || "",
                                                        quantity: r.quantity, // Keep the quantity already entered
                                                      }
                                                      : r
                                                  );
                                                  newRetailersMap.set(keyMap, updatedRetailers);
                                                  setSkuRetailers(newRetailersMap);
                                                }}
                                                menuPortalTarget={document.body}
                                                placeholder="Type to search retailers..."
                                                noOptionsMessage={() => "Type to find retailers..."}
                                                styles={{
                                                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                  control: (base) => ({
                                                    ...base,
                                                    minHeight: "36px",
                                                    borderColor: "#d1d5db",
                                                    boxShadow: "none",
                                                    "&:hover": { borderColor: "#9ca3af" },
                                                  }),

                                                }}
                                              />

                                            </div>
                                            <input
                                              type="number"
                                              min="0"
                                              placeholder="Quantity"
                                              value={retailer.quantity}
                                              onChange={(e) => handleRetailerQuantityChange(keyMap, actualIndex, e.target.value)}
                                              className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                              onClick={() => handleRemoveRetailer(keyMap, actualIndex)}
                                              className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                              title="Remove"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {total !== difference && (
                                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded flex items-center gap-2">
                                  <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-orange-800 font-medium">
                                    Balance remaining: {difference - total} {itemMap.sku.unit} (Total allocated: {total}, Required: {difference})
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}



                    {verificationStep === 3 && (() => {
                      const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
                        const canvas = signatureCanvasRef.current;
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;

                        setIsDrawing(true);
                        ctx.beginPath();
                        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                      };

                      const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
                        if (!isDrawing) return;
                        const canvas = signatureCanvasRef.current;
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;

                        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                        ctx.stroke();
                      };

                      const stopDrawing = () => {
                        if (isDrawing) {
                          const canvas = signatureCanvasRef.current;
                          if (canvas) {
                            setSignature(canvas.toDataURL());

                            if (!capturedMetadata) {
                              const now = new Date();
                              setCapturedMetadata({
                                user: user?.name || 'Unknown User',
                                timestamp: now.toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                }),
                                location: '19.092350, 73.075933'
                              });
                            }
                          }
                        }
                        setIsDrawing(false);
                      };

                      const clearSignature = () => {
                        const canvas = signatureCanvasRef.current;
                        if (canvas) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            setSignature('');
                          }
                        }
                      };

                      const hasRetailers = retailerTotal > 0;

                      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        for (const file of Array.from(files)) {
                          const uploadRes = await uploadFile(file);
                          if (uploadRes?.url) {
                            setUploadedProofs(prev => [
                              ...prev,
                              {
                                id: `file_${Date.now()}`,
                                name: file.name,
                                type: file.type.startsWith("image") ? "photo" : "file",
                                url: uploadRes.url,
                                timestamp: new Date().toISOString(),
                              },
                            ]);
                            showSuccess(`${file.name} uploaded successfully`);
                          } else {
                            showError(`Failed to upload ${file.name}`);
                          }
                        }
                      };


                      const handleCapturePhoto = async () => {
                        try {
                          // Get current location
                          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, {
                              enableHighAccuracy: true,
                              timeout: 10000,
                              maximumAge: 0
                            });
                          });

                          const latitude = position.coords.latitude;
                          const longitude = position.coords.longitude;
                          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                          // Capture photo using device camera
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.capture = 'environment';

                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const timestamp = new Date();
                            const dateTimeString = timestamp.toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            });

                            // Upload the file
                            const uploadRes = await uploadFile(file);
                            if (uploadRes?.url) {
                              const photoData = {
                                id: `photo_${Date.now()}`,
                                name: file.name,
                                type: 'photo',
                                url: uploadRes.url,
                                timestamp: timestamp.toISOString(),
                                metadata: {
                                  employee: user?.name || 'Unknown',
                                  designation: user?.role || 'Unknown',
                                  location: locationString,
                                  dateTime: dateTimeString,
                                  latitude,
                                  longitude
                                }
                              };

                              setUploadedProofs([...uploadedProofs, photoData]);
                              showSuccess(`Photo captured with location and timestamp`);
                            } else {
                              showError('Failed to upload photo');
                            }
                          };

                          input.click();
                        } catch (error: any) {
                          if (error.code === 1) {
                            showError('Location permission denied. Please enable location access to capture photo.');
                          } else {
                            showError('Failed to get location. Please ensure location services are enabled.');
                          }
                        }
                      };

                      const generateDraftLetter = async () => {
                        const now = new Date();
                        const dateStr = now.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        const timeStr = now.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });

                        const doc = new Document({
                          sections: [
                            {
                              properties: {},
                              children: [
                                new Paragraph({
                                  text: "Stock Verification and Update Confirmation",
                                  heading: HeadingLevel.TITLE,
                                  alignment: "center",
                                }),
                                new Paragraph({
                                  text: `Date: ${dateStr}  |  Time: ${timeStr}`,
                                  spacing: { after: 300 },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({ text: `Distributor Name: ${distributorName}`, bold: true }),
                                    new TextRun({ text: `\nDistributor Code: ${distributorCode}` }),
                                    new TextRun({ text: `\nSales Representative: ${salesStaffName}` }),
                                    new TextRun({ text: `\nVerification Conducted On: ${dateStr} ${timeStr}` }),
                                  ],
                                  spacing: { after: 300 },
                                }),

                                new Paragraph({
                                  text: "The following products were verified and confirmed:",
                                  spacing: { after: 200 },
                                }),

                                // Loop through all SKUs and retailer allocations
                                ...allSKUsToProcess.flatMap(({ product, sku, newStock }) => {
                                  const key = `${product.productCode}-${sku.skuCode}`;
                                  const difference = Math.abs(sku.currentStock - newStock);
                                  const isDecrease = newStock < sku.currentStock ? "Outward" : "Return";
                                  const farmerQty = parseInt(skuFarmerQuantities.get(key) || "0") || 0;
                                  const retailers = skuRetailers.get(key) || [];

                                  const retailerDetails =
                                    retailers.length > 0
                                      ? retailers
                                        .filter((r) => r.id !== "manual-entry")
                                        .map(
                                          (r, idx) =>
                                            `${idx + 1}. ${r.name} (${r.code || "N/A"}) - ${r.quantity} ${sku.unit}`
                                        )
                                        .join("\n")
                                      : "No retailer allocations.";

                                  return [
                                    new Paragraph({
                                      text: `${product.productName} (${product.productCode})`,
                                      heading: HeadingLevel.HEADING_2,
                                    }),
                                    new Paragraph({
                                      children: [
                                        new TextRun(`SKU: ${sku.skuName} (${sku.skuCode})`),
                                        new TextRun(
                                          `\nPrevious Stock: ${sku.currentStock} ${sku.unit}`
                                        ),
                                        new TextRun(`\nNew Stock: ${newStock} ${sku.unit}`),
                                        new TextRun(`\nDifference: ${difference} ${sku.unit} (${isDecrease})`),
                                        new TextRun(`\nSold to Farmers: ${farmerQty} ${sku.unit}`),
                                        new TextRun(`\nRetailer Allocations:\n${retailerDetails}`),
                                      ],
                                      spacing: { after: 300 },
                                    }),
                                  ];
                                }),

                                new Paragraph({
                                  text: "Verification Summary",
                                  heading: HeadingLevel.HEADING_2,
                                }),
                                new Paragraph({
                                  text: `Verified By: ${user?.name || "N/A"}`,
                                }),
                                new Paragraph({
                                  text: `Location: ${capturedMetadata?.location || "Not captured"}`,
                                }),
                                new Paragraph({
                                  text: `Timestamp: ${capturedMetadata?.timestamp || new Date().toLocaleString("en-IN")}`,
                                }),
                                new Paragraph({
                                  text: "\n\nWe hereby confirm that the above information is true and accurate to the best of our knowledge.\n\n",
                                }),
                                new Paragraph({
                                  text: "Signature:",
                                }),
                                new Paragraph({
                                  text: "____________________________",
                                }),
                                new Paragraph({
                                  text: `${distributorName} (${distributorCode})`,
                                }),
                              ],
                            },
                          ],
                        });

                        const blob = await Packer.toBlob(doc);
                        const filename = `Stock_Verification_${distributorCode}_${new Date().toISOString().split("T")[0]}.docx`;
                        saveAs(blob, filename);

                        showSuccess("Draft Letter downloaded successfully!");

                        // Save a temporary blob URL for sharing
                        const fileURL = URL.createObjectURL(blob);
                        setGeneratedDocLink(fileURL);
                      };


                      return (
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Step 3: E-Sign</h4>
                            <p className="text-sm text-blue-800">
                              Provide your electronic signature to authenticate this stock verification.
                            </p>
                          </div>

                          <div className="max-w-2xl mx-auto">
                            <h4 className="font-semibold text-gray-900 mb-4">
                              E-Sign <span className="text-red-600">(required)</span>
                            </h4>

                            <div className="border-2 border-gray-300 rounded-lg bg-white">
                              <canvas
                                ref={signatureCanvasRef}
                                width={400}
                                height={200}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="w-full cursor-crosshair"
                                style={{ touchAction: 'none' }}
                              />
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-2">
                              Draw signature above, it will be auto-saved & uploaded.
                            </p>

                            <button
                              onClick={clearSignature}
                              className="w-full mt-3 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Clear
                            </button>

                            {capturedMetadata && (
                              <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs">
                                <p className="font-semibold text-gray-700 mb-2">Captured metadata:</p>
                                <p className="text-gray-600"><span className="font-medium">User:</span> {capturedMetadata.user}</p>
                                <p className="text-gray-600"><span className="font-medium">At:</span> {capturedMetadata.timestamp}</p>
                                <p className="text-gray-600"><span className="font-medium">Location:</span> {capturedMetadata.location}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {verificationStep === 4 && (() => {
                      const hasRetailers = retailerTotal > 0;

                      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        for (const file of Array.from(files)) {
                          const uploadRes = await uploadFile(file);
                          if (uploadRes?.url) {
                            setUploadedProofs(prev => [
                              ...prev,
                              {
                                id: `file_${Date.now()}`,
                                name: file.name,
                                type: file.type.startsWith("image") ? "photo" : "file",
                                url: uploadRes.url,
                                timestamp: new Date().toISOString(),
                              },
                            ]);
                            showSuccess(`${file.name} uploaded successfully`);
                          } else {
                            showError(`Failed to upload ${file.name}`);
                          }
                        }
                      };

                      const handleCapturePhoto = async () => {
                        try {
                          // Get current location
                          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, {
                              enableHighAccuracy: true,
                              timeout: 10000,
                              maximumAge: 0
                            });
                          });

                          const latitude = position.coords.latitude;
                          const longitude = position.coords.longitude;
                          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                          // Capture photo using device camera
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.capture = 'environment';

                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const timestamp = new Date();
                            const dateTimeString = timestamp.toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            });

                            // Upload the file
                            const uploadRes = await uploadFile(file);
                            if (uploadRes?.url) {
                              const photoData = {
                                id: `photo_${Date.now()}`,
                                name: file.name,
                                type: 'photo',
                                url: uploadRes.url,
                                timestamp: timestamp.toISOString(),
                                metadata: {
                                  employee: user?.name || 'Unknown',
                                  designation: user?.role || 'Unknown',
                                  location: locationString,
                                  dateTime: dateTimeString,
                                  latitude,
                                  longitude
                                }
                              };

                              setUploadedProofs([...uploadedProofs, photoData]);
                              showSuccess(`Photo captured with location and timestamp`);
                            } else {
                              showError('Failed to upload photo');
                            }
                          };

                          input.click();
                        } catch (error: any) {
                          if (error.code === 1) {
                            showError('Location permission denied. Please enable location access to capture photo.');
                          } else {
                            showError('Failed to get location. Please ensure location services are enabled.');
                          }
                        }
                      };

                      const generateDraftLetter = async () => {
                        const now = new Date();
                        const dateStr = now.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        const timeStr = now.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });

                        const doc = new Document({
                          sections: [
                            {
                              properties: {},
                              children: [
                                new Paragraph({
                                  text: "Stock Verification and Update Confirmation",
                                  heading: HeadingLevel.TITLE,
                                  alignment: "center",
                                }),
                                new Paragraph({
                                  text: `Date: ${dateStr}  |  Time: ${timeStr}`,
                                  spacing: { after: 300 },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({ text: `Distributor Name: ${distributorName}`, bold: true }),
                                    new TextRun({ text: `\nDistributor Code: ${distributorCode}` }),
                                    new TextRun({ text: `\nSales Representative: ${salesStaffName}` }),
                                    new TextRun({ text: `\nVerification Conducted On: ${dateStr} ${timeStr}` }),
                                  ],
                                  spacing: { after: 300 },
                                }),

                                new Paragraph({
                                  text: "The following products were verified and confirmed:",
                                  spacing: { after: 200 },
                                }),

                                ...allSKUsToProcess.flatMap(({ product, sku, newStock }) => {
                                  const key = `${product.productCode}-${sku.skuCode}`;
                                  const difference = Math.abs(sku.currentStock - newStock);
                                  const isDecrease = newStock < sku.currentStock ? "Outward" : "Return";
                                  const farmerQty = parseInt(skuFarmerQuantities.get(key) || "0") || 0;
                                  const retailers = skuRetailers.get(key) || [];

                                  const retailerDetails =
                                    retailers.length > 0
                                      ? retailers
                                        .filter((r) => r.id !== "manual-entry")
                                        .map(
                                          (r, idx) =>
                                            `${idx + 1}. ${r.name} (${r.code || "N/A"}) - ${r.quantity} ${sku.unit}`
                                        )
                                        .join("\n")
                                      : "No retailer allocations.";

                                  return [
                                    new Paragraph({
                                      text: `${product.productName} (${product.productCode})`,
                                      heading: HeadingLevel.HEADING_2,
                                    }),
                                    new Paragraph({
                                      children: [
                                        new TextRun(`SKU: ${sku.skuName} (${sku.skuCode})`),
                                        new TextRun(
                                          `\nPrevious Stock: ${sku.currentStock} ${sku.unit}`
                                        ),
                                        new TextRun(`\nNew Stock: ${newStock} ${sku.unit}`),
                                        new TextRun(`\nDifference: ${difference} ${sku.unit} (${isDecrease})`),
                                        new TextRun(`\nSold to Farmers: ${farmerQty} ${sku.unit}`),
                                        new TextRun(`\nRetailer Allocations:\n${retailerDetails}`),
                                      ],
                                      spacing: { after: 300 },
                                    }),
                                  ];
                                }),

                                new Paragraph({
                                  text: "Verification Summary",
                                  heading: HeadingLevel.HEADING_2,
                                }),
                                new Paragraph({
                                  text: `Verified By: ${user?.name || "N/A"}`,
                                }),
                                new Paragraph({
                                  text: `Location: ${capturedMetadata?.location || "Not captured"}`,
                                }),
                                new Paragraph({
                                  text: `Timestamp: ${capturedMetadata?.timestamp || new Date().toLocaleString("en-IN")}`,
                                }),
                                new Paragraph({
                                  text: "\n\nWe hereby confirm that the above information is true and accurate to the best of our knowledge.\n\n",
                                }),
                                new Paragraph({
                                  text: "Signature:",
                                }),
                                new Paragraph({
                                  text: "____________________________",
                                }),
                                new Paragraph({
                                  text: `${distributorName} (${distributorCode})`,
                                }),
                              ],
                            },
                          ],
                        });

                        const blob = await Packer.toBlob(doc);
                        const filename = `Stock_Verification_${distributorCode}_${new Date().toISOString().split("T")[0]}.docx`;
                        saveAs(blob, filename);

                        showSuccess("Draft Letter downloaded successfully!");

                        const fileURL = URL.createObjectURL(blob);
                        setGeneratedDocLink(fileURL);
                      };

                      return (
                        <div className="space-y-6">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-2">Step 4: Capture Proof Photo</h4>
                            <p className="text-sm text-yellow-800">
                              Capture a photo as proof of verification.
                              {hasRetailers && <span className="font-semibold"> Required for retailer movements.</span>}
                            </p>
                          </div>

                          <div className="max-w-2xl mx-auto">
                            <h4 className="font-semibold text-gray-900 mb-4">
                              Capture Proof Photo {hasRetailers && <span className="text-red-600">(Required for retailer movements)</span>}
                            </h4>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <p className="text-sm text-blue-900 mb-2">
                                <strong>Important Instructions:</strong>
                              </p>
                              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                                <li>Click a picture of the person who has e-signed the document</li>
                                <li>Try to capture the shop name/signboard in the photo if possible</li>
                              </ul>
                            </div>

                            <button
                              onClick={handleCapturePhoto}
                              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Camera className="w-5 h-5" />
                              <span>Click Picture</span>
                            </button>

                            {uploadedProofs.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {uploadedProofs.map((proof, index) => (
                                  <div key={index} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">{proof.name}</span>
                                      <button
                                        onClick={() => setUploadedProofs(uploadedProofs.filter((_, i) => i !== index))}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    {proof.metadata && (
                                      <div className="text-xs text-gray-600 space-y-1 mt-2 bg-white p-2 rounded border border-gray-200">
                                        <div><strong>Employee:</strong> {proof.metadata.employee}</div>
                                        <div><strong>Designation:</strong> {proof.metadata.designation}</div>
                                        <div><strong>Date & Time:</strong> {proof.metadata.dateTime}</div>
                                        <div><strong>Location:</strong> {proof.metadata.location}</div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {hasRetailers && uploadedProofs.length === 0 && (
                              <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start space-x-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800">
                                  For retailer movements, at least one proof is required.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  </>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-end space-x-3">
                {verificationStep > 1 && verificationStep < 5 && (
                  <button
                    onClick={() => setVerificationStep(verificationStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                )}
                {verificationStep === 1 && (
                  <button
                    onClick={() => {
                      clearVerificationProgress();
                      setShowTransactionSplitModal(false);
                      setAllSKUsToProcess([]);
                      setSkuFarmerQuantities(new Map());
                      setSkuRetailers(new Map());
                      setExpandedSKUsInVerification(new Set());
                      setVerificationStep(1);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
                {verificationStep < 4 ? (
                  <button
                    onClick={() => {
                      if (verificationStep === 1) {
                        // Step 1: Just move to allocation step, no validation needed
                        setVerificationStep(2);
                        return;
                      }

                      if (verificationStep === 2) {
                        // Step 2: Validate all SKUs have proper allocation
                        let hasErrors = false;
                        const errors: string[] = [];
                        let unallocatedCount = 0;
                        let firstErrorKey: string | null = null;

                        allSKUsToProcess.forEach(item => {
                          const key = `${item.product.productCode}-${item.sku.skuCode}`;
                          const difference = Math.abs(item.sku.currentStock - item.newStock);
                          const farmerQty = parseInt(skuFarmerQuantities.get(key) || '0') || 0;
                          const retailers = skuRetailers.get(key) || [];
                          // Exclude manual-entry from retailer total calculation
                          const actualRetailers = retailers.filter(r => r.id !== 'manual-entry');
                          const retailerTotal = actualRetailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
                          const total = farmerQty + retailerTotal;

                          if (total !== difference) {
                            if (!hasErrors) {
                              firstErrorKey = key;
                            }
                            hasErrors = true;
                            unallocatedCount++;
                            const remaining = difference - total;
                            if (remaining > 0) {
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Need ${remaining} ${item.sku.unit} more`);
                            } else {
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Over-allocated by ${Math.abs(remaining)} ${item.sku.unit}`);
                            }
                          }

                          // Validate retailer selections have quantities (exclude manual-entry)
                          actualRetailers.forEach((retailer, idx) => {
                            if (!retailer.id || retailer.id === '') {
                              if (!hasErrors) {
                                firstErrorKey = key;
                              }
                              hasErrors = true;
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Please select a retailer`);
                            } else if (!retailer.quantity || parseInt(retailer.quantity) <= 0) {
                              if (!hasErrors) {
                                firstErrorKey = key;
                              }
                              hasErrors = true;
                              errors.push(`${item.product.productName} (${item.sku.skuCode}): Retailer "${retailer.name}" needs a quantity`);
                            }
                          });
                        });

                        if (hasErrors) {
                          // Scroll to the first SKU with an error
                          if (firstErrorKey) {
                            setTimeout(() => {
                              const element = document.querySelector(`[data-sku-key="${firstErrorKey}"]`);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                // Add a brief highlight effect
                                element.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
                                setTimeout(() => {
                                  element.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
                                }, 2000);
                              }
                            }, 100);
                          }

                          const skuWord = unallocatedCount > 1 ? 'SKUs' : 'SKU';
                          const title = `Please Complete Allocation`;
                          const formattedErrors = errors.map((error, index) => `${index + 1}. ${error}`).join('\n\n');
                          const message = `${unallocatedCount} ${skuWord} need${unallocatedCount === 1 ? 's' : ''} attention:\n\n${formattedErrors}\n\nNote: Total allocated quantity must match the stock difference for each SKU.`;
                          showError(message, title);
                          return;
                        }
                      } else if (verificationStep === 3) {
                        // --- Step 3 Validation (E-Sign only) ---
                        if (!signature) {
                          showError('E-signature is required to proceed.');
                          return;
                        }
                      }

                      // If all validations pass, move to the next step and save progress
                      setVerificationStep(verificationStep + 1);
                      setTimeout(() => saveVerificationProgress(), 100);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // --- Step 4 Validation (Upload Doc/Proof) ---
                      // Check if proofs are required (if any retailer allocation exists)
                      let requiresProofs = false;
                      for (const item of allSKUsToProcess) {
                        const key = `${item.product.productCode}-${item.sku.skuCode}`;
                        const currentRetailers = skuRetailers.get(key) || [];
                        const actualRetailers = currentRetailers.filter(r => r.id && r.id !== 'manual-entry');
                        const retailerTotal = actualRetailers.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
                        if (retailerTotal > 0) {
                          requiresProofs = true;
                          break; // Found retailer allocation, no need to check further
                        }
                      }

                      // If proofs are required, check if at least one is uploaded
                      if (requiresProofs && uploadedProofs.length === 0) {
                        showError('At least one proof document/photo is required when allocating stock to retailers.');
                        return;
                      }

                      // If validation passes, proceed with confirmation
                      handleConfirmSplit();
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Confirm & Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddRetailerModal
        isOpen={showAddRetailerModal}
        onClose={() => setShowAddRetailerModal(false)}
        onSave={handleSaveNewRetailer}
        existingRetailers={retailers.map(r => ({
          name: r.name,
          phone: (r as any).phone || '',
          outletName: (r as any).outletName || '',
          code: (r as any).code || r._id
        }))}
      />

      {selectedProofForViewing && (
        <ProofDocumentViewer
          proof={selectedProofForViewing}
          onClose={() => setSelectedProofForViewing(null)}
        />
      )}
    </>
  );
};