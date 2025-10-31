import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Square, MapPin, Clock, AlertTriangle, CheckCircle, Camera, Video, Mic, Upload, X, Navigation, Phone, User, Building, Target, FileText, Save, Shield, Eye, CreditCard as Edit, Map, Route, Timer, Fingerprint, UserPlus, Database, Truck, AlertCircle, ThumbsUp, MessageSquare, Calendar, Activity, Zap, Package } from 'lucide-react';
import { SignatureCapture } from './SignatureCapture';

interface VisitLocation {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  accuracy?: number;
}

interface VisitTarget {
  id: string;
  name: string;
  code: string;
  type: 'Distributor' | 'Retailer' | 'Farmer';
  phone: string;
  address: string;
  location: VisitLocation;
  assignedMDO: string;
  territory: string;
}

interface RoutePoint {
  id: string;
  location: VisitLocation;
  timestamp: string;
  activity: string;
  duration: number;
}

interface ActiveVisit {
  id: string;
  target: VisitTarget;
  startTime: Date;
  currentTime: Date;
  duration: number;
  status: 'active' | 'paused' | 'completed';
  locationVerified: boolean;
  deviation?: number;
  deviationApproved?: boolean;
  punchInLocation: VisitLocation;
  punchOutLocation?: VisitLocation;
  routePoints: RoutePoint[];
  totalDistance: number;
  tasks: VisitTask[];
  media: MediaItem[];
  notes: string;
  signature?: string;
  thumbImpression?: string;
  productInputs: ProductInput[];
  farmerDatabase?: FarmerData;
  retailerDatabase?: RetailerData;
  videoVerification?: VideoVerification;
  routeAlerts: RouteAlert[];
}

interface VisitTask {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  media?: string[];
  notes?: string;
}

interface MediaItem {
  id: string;
  type: 'photo' | 'video' | 'voice' | 'document';
  name: string;
  url: string;
  timestamp: Date;
  location: VisitLocation;
  size?: number;
  duration?: number;
  metadata: {
    capturedBy: string;
    deviceInfo: string;
    purpose: string;
    relatedTask?: string;
  };
}

interface ProductInput {
  id: string;
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  purpose: 'Demo' | 'Sample' | 'Gift' | 'Training';
  recipientType: 'Distributor' | 'Retailer' | 'Farmer';
  recipientName: string;
  timestamp: Date;
  location: VisitLocation;
  media: string[];
  signature: string;
}

interface FarmerData {
  id: string;
  name: string;
  phone: string;
  address: string;
  village: string;
  landSize: number;
  crops: string[];
  consent: boolean;
  signature: string;
  thumbImpression: string;
  capturedAt: Date;
  location: VisitLocation;
}

interface RetailerData {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  gstNumber?: string;
  businessType: string;
  consent: boolean;
  signature: string;
  thumbImpression: string;
  capturedAt: Date;
  location: VisitLocation;
}

interface VideoVerification {
  id: string;
  type: 'activity_proof' | 'stock_verification' | 'farmer_interaction' | 'product_demo';
  videoUrl: string;
  duration: number;
  timestamp: Date;
  location: VisitLocation;
  description: string;
  participants: string[];
}

interface RouteAlert {
  id: string;
  type: 'route_deviation' | 'working_hours' | 'distance_exceeded' | 'late_checkin';
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  timestamp: Date;
  location: VisitLocation;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approverRemarks?: string;
  data: any;
}

interface VisitManagerProps {
  target: VisitTarget;
  onVisitComplete: (visitData: any) => void;
  onVisitCancel: () => void;
}

const VisitManager: React.FC<VisitManagerProps> = ({
  target,
  onVisitComplete,
  onVisitCancel
}) => {
  const { user } = useAuth();
  const { latitude, longitude, error: locationError } = useGeolocation();
  
  const [visit, setVisit] = useState<ActiveVisit | null>(null);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [deviation, setDeviation] = useState<number>(0);
  const [deviationReason, setDeviationReason] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureType, setCaptureType] = useState<'photo' | 'video' | 'voice' | ''>('');
  const [visitNotes, setVisitNotes] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [showThumbImpression, setShowThumbImpression] = useState(false);
  const [showProductInput, setShowProductInput] = useState(false);
  const [showFarmerCapture, setShowFarmerCapture] = useState(false);
  const [showRetailerCapture, setShowRetailerCapture] = useState(false);
  const [showVideoVerification, setShowVideoVerification] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [currentProductInput, setCurrentProductInput] = useState<Partial<ProductInput>>({});
  const [currentFarmerData, setCurrentFarmerData] = useState<Partial<FarmerData>>({});
  const [currentRetailerData, setCurrentRetailerData] = useState<Partial<RetailerData>>({});

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Start visit with comprehensive tracking
  const startVisit = () => {
    if (!latitude || !longitude) {
      alert('GPS location required to start visit');
      return;
    }

    // Calculate deviation from planned location
    const calculatedDeviation = calculateDistance(
      latitude,
      longitude,
      target.location.latitude,
      target.location.longitude
    );

    setDeviation(calculatedDeviation);

    // Check if deviation exceeds 5km threshold
    if (calculatedDeviation > 5) {
      setShowLocationAlert(true);
      return;
    }

    // Start visit if location is within tolerance
    proceedWithVisit(calculatedDeviation);
  };

  const proceedWithVisit = (locationDeviation: number) => {
    const punchInLocation: VisitLocation = {
      latitude: latitude!,
      longitude: longitude!,
      address: 'Current Location',
      timestamp: new Date().toISOString(),
      accuracy: 5
    };

    const newVisit: ActiveVisit = {
      id: `visit_${Date.now()}`,
      target,
      startTime: new Date(),
      currentTime: new Date(),
      duration: 0,
      status: 'active',
      locationVerified: locationDeviation <= 5,
      deviation: locationDeviation,
      deviationApproved: locationDeviation <= 5,
      punchInLocation,
      routePoints: [{
        id: 'route_start',
        location: punchInLocation,
        timestamp: new Date().toISOString(),
        activity: 'Visit Started',
        duration: 0
      }],
      totalDistance: 0,
      tasks: [
        { id: 'task1', description: 'Punch-in with GPS verification', completed: true, completedAt: new Date() },
        { id: 'task2', description: 'Product demonstration with media capture', completed: false },
        { id: 'task3', description: 'Record product inputs given to distributor/retailer', completed: false },
        { id: 'task4', description: 'Stock verification and liquidation review', completed: false },
        { id: 'task5', description: 'Capture farmer/retailer database with consent', completed: false },
        { id: 'task6', description: 'Video verification of activities', completed: false },
        { id: 'task7', description: 'Customer signature and thumb impression', completed: false },
        { id: 'task8', description: 'Visit notes and next follow-up planning', completed: false }
      ],
      media: [],
      notes: '',
      productInputs: [],
      routeAlerts: []
    };

    setVisit(newVisit);
    setShowLocationAlert(false);
  };

  // Handle location deviation approval request
  const requestDeviationApproval = () => {
    if (!deviationReason.trim()) {
      alert('Please provide reason for location deviation');
      return;
    }

    // Create route alert for deviation
    const routeAlert: RouteAlert = {
      id: `alert_${Date.now()}`,
      type: 'route_deviation',
      severity: deviation > 10 ? 'High' : 'Medium',
      message: `Route deviation of ${deviation.toFixed(1)}km detected`,
      timestamp: new Date(),
      location: {
        latitude: latitude!,
        longitude: longitude!,
        address: 'Current Location',
        timestamp: new Date().toISOString()
      },
      status: 'pending',
      data: {
        plannedLocation: target.location,
        actualLocation: { latitude, longitude },
        deviation,
        reason: deviationReason,
        mdoName: user?.name,
        targetName: target.name
      }
    };

    console.log('Route deviation alert created:', routeAlert);
    alert(`Route deviation (${deviation.toFixed(1)}km) submitted for approval.\n\nReason: ${deviationReason}\n\nAlert sent to TSM/RBH/RMM for approval.`);
    
    // For demo, auto-approve after 2 seconds
    setTimeout(() => {
      proceedWithVisit(deviation);
      alert('Deviation approved by TSM. Visit can proceed.');
    }, 2000);
  };

  // Update visit timer and check for alerts
  useEffect(() => {
    if (visit && visit.status === 'active') {
      const timer = setInterval(() => {
        setVisit(prev => {
          if (!prev) return null;
          const now = new Date();
          const duration = Math.floor((now.getTime() - prev.startTime.getTime()) / (1000 * 60));
          
          // Check for working hours alert (less than 9 hours)
          const workingHours = duration / 60;
          if (workingHours > 8.5 && workingHours < 9) {
            // Trigger working hours alert
            const alert: RouteAlert = {
              id: `alert_hours_${Date.now()}`,
              type: 'working_hours',
              severity: 'Medium',
              message: 'Approaching minimum 9-hour working requirement',
              timestamp: now,
              location: {
                latitude: latitude || 0,
                longitude: longitude || 0,
                address: 'Current Location',
                timestamp: now.toISOString()
              },
              status: 'pending',
              data: { currentHours: workingHours, minimumRequired: 9 }
            };
            
            if (!prev.routeAlerts.find(a => a.type === 'working_hours')) {
              prev.routeAlerts.push(alert);
            }
          }

          return {
            ...prev,
            currentTime: now,
            duration
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visit?.status, latitude, longitude]);

  // Capture media with comprehensive metadata
  const captureMedia = async (type: 'photo' | 'video' | 'voice', purpose: string = 'General documentation') => {
    if (!latitude || !longitude) {
      alert('GPS location required for media capture');
      return;
    }

    setIsCapturing(true);
    setCaptureType(type);

    try {
      // Simulate media capture with realistic timing
      const captureTime = type === 'photo' ? 1000 : type === 'video' ? 3000 : 2000;
      await new Promise(resolve => setTimeout(resolve, captureTime));

      const mediaItem: MediaItem = {
        id: `media_${Date.now()}`,
        type,
        name: `${type}_${Date.now()}.${type === 'photo' ? 'jpg' : type === 'video' ? 'mp4' : 'wav'}`,
        url: `/placeholder-${type}.${type === 'photo' ? 'jpg' : type === 'video' ? 'mp4' : 'wav'}`,
        timestamp: new Date(),
        location: {
          latitude,
          longitude,
          address: 'Current Location',
          timestamp: new Date().toISOString(),
          accuracy: 5
        },
        size: type === 'photo' ? 2.5 : type === 'video' ? 15.8 : 1.2,
        duration: type === 'video' ? 30 : type === 'voice' ? 45 : undefined,
        metadata: {
          capturedBy: user?.name || 'MDO',
          deviceInfo: navigator.userAgent.substring(0, 50),
          purpose,
          relatedTask: 'current_activity'
        }
      };

      setVisit(prev => {
        if (!prev) return null;
        return {
          ...prev,
          media: [...prev.media, mediaItem]
        };
      });

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} captured successfully!\n\nLocation: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\nTimestamp: ${new Date().toLocaleString('en-IN')}\nPurpose: ${purpose}`);
    } catch (error) {
      alert(`Failed to capture ${type}. Please try again.`);
    } finally {
      setIsCapturing(false);
      setCaptureType('');
    }
  };

  // Record product inputs
  const recordProductInput = () => {
    if (!currentProductInput.productName || !currentProductInput.quantity) {
      alert('Please fill all required fields');
      return;
    }

    const productInput: ProductInput = {
      id: `product_${Date.now()}`,
      productName: currentProductInput.productName!,
      productCode: currentProductInput.productCode || '',
      quantity: currentProductInput.quantity!,
      unit: currentProductInput.unit || 'Kg',
      purpose: currentProductInput.purpose || 'Demo',
      recipientType: currentProductInput.recipientType || 'Distributor',
      recipientName: target.name,
      timestamp: new Date(),
      location: {
        latitude: latitude!,
        longitude: longitude!,
        address: 'Current Location',
        timestamp: new Date().toISOString()
      },
      media: [],
      signature: ''
    };

    setVisit(prev => {
      if (!prev) return null;
      return {
        ...prev,
        productInputs: [...prev.productInputs, productInput]
      };
    });

    setCurrentProductInput({});
    setShowProductInput(false);
    alert('Product input recorded successfully!');
  };

  // Capture farmer database
  const captureFarmerDatabase = () => {
    if (!currentFarmerData.name || !currentFarmerData.phone || !currentFarmerData.consent) {
      alert('Please fill all required fields and obtain consent');
      return;
    }

    const farmerData: FarmerData = {
      id: `farmer_${Date.now()}`,
      name: currentFarmerData.name!,
      phone: currentFarmerData.phone!,
      address: currentFarmerData.address || '',
      village: currentFarmerData.village || '',
      landSize: currentFarmerData.landSize || 0,
      crops: currentFarmerData.crops || [],
      consent: true,
      signature: currentFarmerData.signature || '',
      thumbImpression: currentFarmerData.thumbImpression || '',
      capturedAt: new Date(),
      location: {
        latitude: latitude!,
        longitude: longitude!,
        address: 'Current Location',
        timestamp: new Date().toISOString()
      }
    };

    setVisit(prev => {
      if (!prev) return null;
      return {
        ...prev,
        farmerDatabase: farmerData
      };
    });

    setCurrentFarmerData({});
    setShowFarmerCapture(false);
    alert('Farmer database captured successfully with consent!');
  };

  // Capture retailer database
  const captureRetailerDatabase = () => {
    if (!currentRetailerData.name || !currentRetailerData.phone || !currentRetailerData.consent) {
      alert('Please fill all required fields and obtain consent');
      return;
    }

    const retailerData: RetailerData = {
      id: `retailer_${Date.now()}`,
      name: currentRetailerData.name!,
      shopName: currentRetailerData.shopName || '',
      phone: currentRetailerData.phone!,
      address: currentRetailerData.address || '',
      gstNumber: currentRetailerData.gstNumber,
      businessType: currentRetailerData.businessType || 'Retail',
      consent: true,
      signature: currentRetailerData.signature || '',
      thumbImpression: currentRetailerData.thumbImpression || '',
      capturedAt: new Date(),
      location: {
        latitude: latitude!,
        longitude: longitude!,
        address: 'Current Location',
        timestamp: new Date().toISOString()
      }
    };

    setVisit(prev => {
      if (!prev) return null;
      return {
        ...prev,
        retailerDatabase: retailerData
      };
    });

    setCurrentRetailerData({});
    setShowRetailerCapture(false);
    alert('Retailer database captured successfully with consent!');
  };

  // Record video verification
  const recordVideoVerification = async (type: VideoVerification['type'], description: string) => {
    setIsCapturing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const videoVerification: VideoVerification = {
        id: `video_${Date.now()}`,
        type,
        videoUrl: `/verification-video-${Date.now()}.mp4`,
        duration: 60,
        timestamp: new Date(),
        location: {
          latitude: latitude!,
          longitude: longitude!,
          address: 'Current Location',
          timestamp: new Date().toISOString()
        },
        description,
        participants: [user?.name || 'MDO', target.name]
      };

      setVisit(prev => {
        if (!prev) return null;
        return {
          ...prev,
          videoVerification
        };
      });

      alert(`Video verification recorded!\n\nType: ${type}\nDuration: 60 seconds\nLocation: GPS captured\nParticipants: ${videoVerification.participants.join(', ')}`);
    } catch (error) {
      alert('Failed to record video verification');
    } finally {
      setIsCapturing(false);
    }
  };

  // Check for route alerts
  const checkRouteAlerts = () => {
    if (!visit) return;

    const alerts: RouteAlert[] = [];
    const workingHours = visit.duration / 60;

    // Working hours check
    if (workingHours < 9 && visit.duration > 480) { // After 8 hours, warn about 9-hour requirement
      alerts.push({
        id: `alert_hours_${Date.now()}`,
        type: 'working_hours',
        severity: 'Medium',
        message: `Working hours (${workingHours.toFixed(1)}h) below 9-hour requirement`,
        timestamp: new Date(),
        location: {
          latitude: latitude!,
          longitude: longitude!,
          address: 'Current Location',
          timestamp: new Date().toISOString()
        },
        status: 'pending',
        data: { currentHours: workingHours, required: 9 }
      });
    }

    // Distance check (if total distance > 110km)
    if (visit.totalDistance > 110) {
      alerts.push({
        id: `alert_distance_${Date.now()}`,
        type: 'distance_exceeded',
        severity: 'High',
        message: `Daily travel distance (${visit.totalDistance.toFixed(1)}km) exceeds 110km limit`,
        timestamp: new Date(),
        location: {
          latitude: latitude!,
          longitude: longitude!,
          address: 'Current Location',
          timestamp: new Date().toISOString()
        },
        status: 'pending',
        data: { currentDistance: visit.totalDistance, limit: 110 }
      });
    }

    return alerts;
  };

  // Complete task with media
  const completeTask = (taskId: string) => {
    setVisit(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId
            ? { ...task, completed: true, completedAt: new Date() }
            : task
        )
      };
    });
  };

  // End visit with comprehensive validation
  const endVisit = () => {
    if (!visit) return;

    // Validate minimum visit duration (30 minutes)
    if (visit.duration < 30) {
      const proceed = confirm(`Visit duration (${visit.duration} min) is less than minimum 30 minutes. Do you want to proceed?`);
      if (!proceed) return;
    }

    // Check route alerts
    const alerts = checkRouteAlerts();
    if (alerts && alerts.length > 0) {
      const alertMessages = alerts.map(a => `• ${a.message}`).join('\n');
      const proceed = confirm(`Route Alerts Detected:\n\n${alertMessages}\n\nAlerts will be sent to TSM/RBH/RMM for approval. Continue?`);
      if (!proceed) return;
    }

    // Punch out location
    const punchOutLocation: VisitLocation = {
      latitude: latitude!,
      longitude: longitude!,
      address: 'Current Location',
      timestamp: new Date().toISOString(),
      accuracy: 5
    };

    // Complete visit with all data
    const visitData = {
      ...visit,
      status: 'completed',
      endTime: new Date(),
      punchOutLocation,
      notes: visitNotes,
      routeAlerts: alerts || [],
      completionData: {
        totalDuration: visit.duration,
        tasksCompleted: visit.tasks.filter(t => t.completed).length,
        totalTasks: visit.tasks.length,
        mediaCount: visit.media.length,
        hasSignature: !!visit.signature,
        hasThumbImpression: !!visit.thumbImpression,
        locationVerified: visit.locationVerified,
        deviation: visit.deviation,
        productInputsRecorded: visit.productInputs.length,
        databaseCaptured: !!(visit.farmerDatabase || visit.retailerDatabase),
        videoVerificationDone: !!visit.videoVerification,
        totalDistance: visit.totalDistance,
        workingHours: visit.duration / 60
      }
    };

    onVisitComplete(visitData);
    setVisit(null);
  };

  // Pause/Resume visit
  const toggleVisitStatus = () => {
    setVisit(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: prev.status === 'active' ? 'paused' : 'active'
      };
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // If no visit is active, show start button
  if (!visit) {
    return (
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{target.name}</h3>
          <p className="text-gray-600 mb-4">{target.code} • {target.type}</p>
          <p className="text-sm text-gray-500 mb-6">{target.address}</p>
          
          <div className="space-y-3">
            <button
              onClick={startVisit}
              disabled={!latitude || !longitude}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Punch In & Start Visit
            </button>
            
            <button
              onClick={() => setShowRouteMap(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Map className="w-5 h-5 mr-2" />
              View Route Map
            </button>
          </div>
          
          {(!latitude || !longitude) && (
            <p className="text-red-600 text-sm mt-2">GPS location required to start visit</p>
          )}
        </div>

        {/* Route Map Modal */}
        {showRouteMap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Route Map</h3>
                <button
                  onClick={() => setShowRouteMap(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Interactive Route Map</p>
                    <p className="text-sm text-gray-500">Click on locations to navigate</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Current Location</h4>
                    <p className="text-sm text-blue-700">
                      {latitude && longitude 
                        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        : 'Location not available'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Target Location</h4>
                    <p className="text-sm text-green-700">
                      {target.location.latitude.toFixed(4)}, {target.location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Location deviation alert modal
  if (showLocationAlert) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Deviation Detected</h3>
              <p className="text-gray-600 mb-4">
                You are {deviation.toFixed(1)}km away from the planned visit location.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for deviation *
                </label>
                <textarea
                  value={deviationReason}
                  onChange={(e) => setDeviationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Please explain why you are at a different location..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={requestDeviationApproval}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Request Approval
                </button>
                <button
                  onClick={() => setShowLocationAlert(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active visit interface
  return (
    <div className="space-y-6">
      {/* Visit Header */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{target.name}</h3>
            <p className="text-gray-600">{target.code} • {target.type}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-600 mb-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-mono text-lg">{formatDuration(visit.duration)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span>GPS Verified</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={toggleVisitStatus}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
              visit.status === 'active'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {visit.status === 'active' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Visit
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume Visit
              </>
            )}
          </button>
          
          <button
            onClick={endVisit}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <Square className="w-4 h-4 mr-2" />
            End Visit
          </button>
        </div>
      </div>

      {/* Visit Tasks */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Visit Tasks</h4>
        <div className="space-y-3">
          {visit.tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                task.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center">
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3" />
                )}
                <span className={task.completed ? 'text-green-800' : 'text-gray-700'}>
                  {task.description}
                </span>
              </div>
              {!task.completed && (
                <button
                  onClick={() => completeTask(task.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Mark Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Media Capture */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Media Capture</h4>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => captureMedia('photo', 'Visit documentation')}
            disabled={isCapturing}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Camera className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm text-gray-700">Photo</span>
          </button>
          
          <button
            onClick={() => captureMedia('video', 'Activity proof')}
            disabled={isCapturing}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Video className="w-6 h-6 text-red-600 mb-2" />
            <span className="text-sm text-gray-700">Video</span>
          </button>
          
          <button
            onClick={() => captureMedia('voice', 'Voice note')}
            disabled={isCapturing}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Mic className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm text-gray-700">Voice</span>
          </button>
        </div>
        
        {isCapturing && (
          <div className="text-center py-4">
            <div className="inline-flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Capturing {captureType}...
            </div>
          </div>
        )}
        
        {visit.media.length > 0 && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-900 mb-2">Captured Media ({visit.media.length})</h5>
            <div className="space-y-2">
              {visit.media.slice(-3).map((media) => (
                <div key={media.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getMediaIcon(media.type)}
                    <span className="ml-2 text-sm text-gray-700">{media.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {media.timestamp.toLocaleTimeString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Input Recording */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Product Inputs</h4>
          <button
            onClick={() => setShowProductInput(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Record Input
          </button>
        </div>
        
        {visit.productInputs.length > 0 ? (
          <div className="space-y-3">
            {visit.productInputs.map((input) => (
              <div key={input.id} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-blue-900">{input.productName}</h5>
                    <p className="text-sm text-blue-700">
                      {input.quantity} {input.unit} • {input.purpose} • {input.recipientType}
                    </p>
                  </div>
                  <span className="text-xs text-blue-600">
                    {input.timestamp.toLocaleTimeString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No product inputs recorded yet</p>
        )}
      </div>

      {/* Database Capture */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Database Capture</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowFarmerCapture(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm text-gray-700">Farmer Data</span>
            {visit.farmerDatabase && (
              <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
            )}
          </button>
          
          <button
            onClick={() => setShowRetailerCapture(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm text-gray-700">Retailer Data</span>
            {visit.retailerDatabase && (
              <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
            )}
          </button>
        </div>
      </div>

      {/* Video Verification */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Video Verification</h4>
          <button
            onClick={() => setShowVideoVerification(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Video className="w-4 h-4 mr-2" />
            Record Video
          </button>
        </div>
        
        {visit.videoVerification ? (
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-red-900">{visit.videoVerification.type.replace('_', ' ')}</h5>
                <p className="text-sm text-red-700">{visit.videoVerification.description}</p>
                <p className="text-xs text-red-600 mt-1">
                  Duration: {visit.videoVerification.duration}s • Participants: {visit.videoVerification.participants.join(', ')}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No video verification recorded yet</p>
        )}
      </div>

      {/* Signature & Thumb Impression */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Verification</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowSignature(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm text-gray-700">Signature</span>
            {visit.signature && (
              <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
            )}
          </button>
          
          <button
            onClick={() => setShowThumbImpression(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Fingerprint className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm text-gray-700">Thumb Print</span>
            {visit.thumbImpression && (
              <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
            )}
          </button>
        </div>
      </div>

      {/* Visit Notes */}
      <div className="bg-white rounded-xl p-6 card-shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Visit Notes</h4>
        <textarea
          value={visitNotes}
          onChange={(e) => setVisitNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Add visit notes, observations, next follow-up plans..."
        />
      </div>

      {/* Route Alerts */}
      {visit.routeAlerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 card-shadow">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Route Alerts</h4>
          <div className="space-y-3">
            {visit.routeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'High'
                    ? 'bg-red-50 border-red-200'
                    : alert.severity === 'Medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className={`font-medium ${
                      alert.severity === 'High'
                        ? 'text-red-900'
                        : alert.severity === 'Medium'
                        ? 'text-yellow-900'
                        : 'text-blue-900'
                    }`}>
                      {alert.message}
                    </h5>
                    <p className={`text-sm ${
                      alert.severity === 'High'
                        ? 'text-red-700'
                        : alert.severity === 'Medium'
                        ? 'text-yellow-700'
                        : 'text-blue-700'
                    }`}>
                      {alert.timestamp.toLocaleString('en-IN')} • Status: {alert.status}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === 'High'
                      ? 'bg-red-100 text-red-800'
                      : alert.severity === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Input Modal */}
      {showProductInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Record Product Input</h3>
              <button
                onClick={() => setShowProductInput(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={currentProductInput.productName || ''}
                  onChange={(e) => setCurrentProductInput(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Code</label>
                <input
                  type="text"
                  value={currentProductInput.productCode || ''}
                  onChange={(e) => setCurrentProductInput(prev => ({ ...prev, productCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product code"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={currentProductInput.quantity || ''}
                    onChange={(e) => setCurrentProductInput(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={currentProductInput.unit || 'Kg'}
                    onChange={(e) => setCurrentProductInput(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                <select
                  value={currentProductInput.purpose || 'Demo'}
                  onChange={(e) => setCurrentProductInput(prev => ({ ...prev, purpose: e.target.value as ProductInput['purpose'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Demo">Demo</option>
                  <option value="Sample">Sample</option>
                  <option value="Gift">Gift</option>
                  <option value="Training">Training</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
                <select
                  value={currentProductInput.recipientType || 'Distributor'}
                  onChange={(e) => setCurrentProductInput(prev => ({ ...prev, recipientType: e.target.value as ProductInput['recipientType'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Distributor">Distributor</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Farmer">Farmer</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={recordProductInput}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Record Input
                </button>
                <button
                  onClick={() => setShowProductInput(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Database Modal */}
      {showFarmerCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Capture Farmer Database</h3>
              <button
                onClick={() => setShowFarmerCapture(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Name *</label>
                <input
                  type="text"
                  value={currentFarmerData.name || ''}
                  onChange={(e) => setCurrentFarmerData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter farmer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={currentFarmerData.phone || ''}
                  onChange={(e) => setCurrentFarmerData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={currentFarmerData.address || ''}
                  onChange={(e) => setCurrentFarmerData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                <input
                  type="text"
                  value={currentFarmerData.village || ''}
                  onChange={(e) => setCurrentFarmerData(prev => ({ ...prev, village: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter village name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Land Size (acres)</label>
                <input
                  type="number"
                  value={currentFarmerData.landSize || ''}
                  onChange={(e) => setCurrentFarmerData(prev => ({ ...prev, landSize: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crops Grown</label>
                <input
                  type="text"
                  value={currentFarmerData.crops?.join(', ') || ''}
                  onChange={(e) => setCurrentFarmerData(prev => ({ ...prev, crops: e.target.value.split(', ').filter(c => c.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rice, Wheat, Cotton (comma separated)"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="farmerConsent"
                  checked={currentFarmerData.consent || false}
                  onChange={(e) => setCurrentFarmerData(prev => ({ ...prev, consent: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="farmerConsent" className="ml-2 block text-sm text-gray-700">
                  Farmer has given consent for data collection *
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={captureFarmerDatabase}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Capture Data
                </button>
                <button
                  onClick={() => setShowFarmerCapture(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retailer Database Modal */}
      {showRetailerCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Capture Retailer Database</h3>
              <button
                onClick={() => setShowRetailerCapture(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                <input
                  type="text"
                  value={currentRetailerData.name || ''}
                  onChange={(e) => setCurrentRetailerData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter owner name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                <input
                  type="text"
                  value={currentRetailerData.shopName || ''}
                  onChange={(e) => setCurrentRetailerData(prev => ({ ...prev, shopName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter shop name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={currentRetailerData.phone || ''}
                  onChange={(e) => setCurrentRetailerData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={currentRetailerData.address || ''}
                  onChange={(e) => setCurrentRetailerData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                <input
                  type="text"
                  value={currentRetailerData.gstNumber || ''}
                  onChange={(e) => setCurrentRetailerData(prev => ({ ...prev, gstNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter GST number (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <select
                  value={currentRetailerData.businessType || 'Retail'}
                  onChange={(e) => setCurrentRetailerData(prev => ({ ...prev, businessType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Agri Input">Agri Input</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="retailerConsent"
                  checked={currentRetailerData.consent || false}
                  onChange={(e) => setCurrentRetailerData(prev => ({ ...prev, consent: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="retailerConsent" className="ml-2 block text-sm text-gray-700">
                  Retailer has given consent for data collection *
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={captureRetailerDatabase}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Capture Data
                </button>
                <button
                  onClick={() => setShowRetailerCapture(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Verification Modal */}
      {showVideoVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Video Verification</h3>
              <button
                onClick={() => setShowVideoVerification(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600 mb-4">Select the type of video verification to record:</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    recordVideoVerification('activity_proof', 'Proof of visit activities and interactions');
                    setShowVideoVerification(false);
                  }}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Activity Proof</h4>
                  <p className="text-sm text-gray-600">Record proof of visit activities</p>
                </button>
                
                <button
                  onClick={() => {
                    recordVideoVerification('stock_verification', 'Stock verification and inventory check');
                    setShowVideoVerification(false);
                  }}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Stock Verification</h4>
                  <p className="text-sm text-gray-600">Verify stock levels and inventory</p>
                </button>
                
                <button
                  onClick={() => {
                    recordVideoVerification('farmer_interaction', 'Interaction with farmers and training session');
                    setShowVideoVerification(false);
                  }}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Farmer Interaction</h4>
                  <p className="text-sm text-gray-600">Record farmer interactions and training</p>
                </button>
                
                <button
                  onClick={() => {
                    recordVideoVerification('product_demo', 'Product demonstration and usage training');
                    setShowVideoVerification(false);
                  }}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">Product Demo</h4>
                  <p className="text-sm text-gray-600">Demonstrate product usage and benefits</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Customer Signature</h3>
              <button
                onClick={() => setShowSignature(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <SignatureCapture
                onSave={(signature) => {
                  setVisit(prev => prev ? { ...prev, signature } : null);
                  setShowSignature(false);
                  alert('Customer signature captured successfully!');
                }}
                onCancel={() => setShowSignature(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Thumb Impression Modal */}
      {showThumbImpression && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Thumb Impression</h3>
              <button
                onClick={() => setShowThumbImpression(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                <Fingerprint className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-6">
                Ask the customer to place their thumb on the scanner or capture thumb impression using camera
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Simulate thumb impression capture
                    setTimeout(() => {
                      setVisit(prev => prev ? { ...prev, thumbImpression: 'thumb_impression_data' } : null);
                      setShowThumbImpression(false);
                      alert('Thumb impression captured successfully!');
                    }, 2000);
                  }}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Capture Thumb Impression
                </button>
                
                <button
                  onClick={() => setShowThumbImpression(false)}
                  className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitManager;