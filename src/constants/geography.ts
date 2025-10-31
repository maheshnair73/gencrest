export const ZONES = {
  NORTH: 'North Zone',
  KARNATAKA: 'Karnataka Zone',
  ANDHRA_PRADESH: 'Andhra Pradesh',
  GUJARAT: 'Gujarat',
  MAHARASHTRA: 'Maharashtra',
  CHANDIGARH: 'Chandigarh',
  MADHYA_PRADESH: 'Madhya Pradesh',
  RAJASTHAN: 'Rajasthan',
  TELANGANA: 'Telangana'
} as const;

export const ZONE_LIST = [
  { value: 'North Zone', label: 'North Zone' },
  { value: 'Karnataka Zone', label: 'Karnataka Zone' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Telangana', label: 'Telangana' }
];

export const STATES = {
  PUNJAB: 'Punjab',
  HARYANA: 'Haryana',
  UP: 'UP',
  JK: 'J&K',
  HP: 'HP',
  KERALA: 'Kerala',
  TAMIL_NADU: 'Tamil Nadu',
  KARNATAKA: 'Karnataka',
  ANDHRA_PRADESH: 'Andhra Pradesh',
  GUJARAT: 'Gujarat',
  MAHARASHTRA: 'Maharashtra',
  CHANDIGARH: 'Chandigarh',
  MADHYA_PRADESH: 'Madhya Pradesh',
  RAJASTHAN: 'Rajasthan',
  TELANGANA: 'Telangana'
} as const;

export const STATE_LIST = [
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'UP', label: 'UP' },
  { value: 'J&K', label: 'J&K' },
  { value: 'HP', label: 'HP' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Telangana', label: 'Telangana' }
];

export const ZONE_STATE_MAPPING: Record<string, string[]> = {
  'North Zone': ['Punjab', 'Haryana', 'UP', 'J&K', 'HP'],
  'Karnataka Zone': ['Kerala', 'Tamil Nadu', 'Karnataka'],
  'Andhra Pradesh': ['Andhra Pradesh'],
  'Gujarat': ['Gujarat'],
  'Maharashtra': ['Maharashtra'],
  'Chandigarh': ['Chandigarh'],
  'Madhya Pradesh': ['Madhya Pradesh'],
  'Rajasthan': ['Rajasthan'],
  'Telangana': ['Telangana']
};

export const STATE_ZONE_MAPPING: Record<string, string> = {
  'Punjab': 'North Zone',
  'Haryana': 'North Zone',
  'UP': 'North Zone',
  'J&K': 'North Zone',
  'HP': 'North Zone',
  'Kerala': 'Karnataka Zone',
  'Tamil Nadu': 'Karnataka Zone',
  'Karnataka': 'Karnataka Zone',
  'Andhra Pradesh': 'Andhra Pradesh',
  'Gujarat': 'Gujarat',
  'Maharashtra': 'Maharashtra',
  'Chandigarh': 'Chandigarh',
  'Madhya Pradesh': 'Madhya Pradesh',
  'Rajasthan': 'Rajasthan',
  'Telangana': 'Telangana'
};

export const getStatesForZone = (zone: string): string[] => {
  return ZONE_STATE_MAPPING[zone] || [];
};

export const getZoneForState = (state: string): string => {
  return STATE_ZONE_MAPPING[state] || '';
};
