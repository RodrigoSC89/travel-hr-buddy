/**
 * Mock Factories for Test Data
 * Generate consistent test data across all test suites
 */

// ==================== OPERATIONS ====================

export const mockCrew = (overrides = {}) => ({
  id: `crew-${Math.random().toString(36).substr(2, 9)}`,
  name: 'John Doe',
  rank: 'Captain',
  vessel_id: 'vessel-123',
  status: 'active',
  certifications: ['STCW', 'HUET'],
  join_date: '2025-01-01',
  experience_years: 10,
  ...overrides,
});

export const mockVessel = (overrides = {}) => ({
  id: `vessel-${Math.random().toString(36).substr(2, 9)}`,
  name: 'MV Nautilus One',
  type: 'Support Vessel',
  flag: 'BR',
  imo_number: 'IMO1234567',
  gross_tonnage: 5000,
  crew_capacity: 50,
  fuel_capacity: 1000,
  status: 'operational',
  ...overrides,
});

export const mockPerformanceMetric = (overrides = {}) => ({
  id: `metric-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  metric_type: 'fuel_efficiency',
  value: 85.5,
  unit: 'liters/hour',
  timestamp: new Date().toISOString(),
  ...overrides,
});

// ==================== CONTROL ====================

export const mockNavigationData = (overrides = {}) => ({
  id: `nav-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  latitude: -23.5505,
  longitude: -46.6333,
  heading: 180,
  speed: 12.5,
  depth: 50,
  timestamp: new Date().toISOString(),
  ...overrides,
});

export const mockWeatherForecast = (overrides = {}) => ({
  id: `weather-${Math.random().toString(36).substr(2, 9)}`,
  location: { lat: -23.5505, lng: -46.6333 },
  temperature: 25,
  wind_speed: 15,
  wind_direction: 180,
  wave_height: 2.5,
  visibility: 10,
  forecast_time: new Date().toISOString(),
  ...overrides,
});

// ==================== INTELLIGENCE ====================

export const mockDPAnalysis = (overrides = {}) => ({
  id: `dp-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  dp_class: 'DP2',
  reliability_score: 95.5,
  redundancy_status: 'optimal',
  thruster_status: 'all_operational',
  power_management: 'balanced',
  predicted_incidents: 0,
  confidence: 98.7,
  timestamp: new Date().toISOString(),
  ...overrides,
});

export const mockAIInsight = (overrides = {}) => ({
  id: `insight-${Math.random().toString(36).substr(2, 9)}`,
  category: 'performance',
  title: 'Fuel Efficiency Opportunity',
  description: 'Detected potential for 12% fuel savings',
  confidence: 92.5,
  priority: 'medium',
  actionable: true,
  estimated_impact: '12% cost reduction',
  timestamp: new Date().toISOString(),
  ...overrides,
});

// ==================== EMERGENCY ====================

export const mockIncident = (overrides = {}) => ({
  id: `incident-${Math.random().toString(36).substr(2, 9)}`,
  type: 'man_overboard',
  severity: 'critical',
  status: 'active',
  vessel_id: 'vessel-123',
  location: { lat: -23.5505, lng: -46.6333 },
  description: 'Man overboard incident',
  response_team: ['team-1', 'team-2'],
  started_at: new Date().toISOString(),
  ...overrides,
});

export const mockSAROperation = (overrides = {}) => ({
  id: `sar-${Math.random().toString(36).substr(2, 9)}`,
  incident_id: 'incident-123',
  status: 'in_progress',
  search_area: {
    center: { lat: -23.5505, lng: -46.6333 },
    radius: 5,
  },
  vessels_deployed: 3,
  aircraft_deployed: 1,
  estimated_completion: new Date(Date.now() + 3600000).toISOString(),
  ...overrides,
});

// ==================== PLANNING ====================

export const mockMaintenanceTask = (overrides = {}) => ({
  id: `maint-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  equipment: 'Main Engine',
  task_type: 'preventive',
  priority: 'high',
  status: 'scheduled',
  scheduled_date: new Date(Date.now() + 86400000).toISOString(),
  estimated_hours: 4,
  parts_required: ['filter-123', 'oil-456'],
  ...overrides,
});

export const mockVoyagePlan = (overrides = {}) => ({
  id: `voyage-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  departure_port: 'Santos',
  arrival_port: 'Rio de Janeiro',
  departure_time: new Date(Date.now() + 86400000).toISOString(),
  estimated_arrival: new Date(Date.now() + 259200000).toISOString(),
  distance: 450,
  route_points: [
    { lat: -23.5505, lng: -46.6333 },
    { lat: -22.9068, lng: -43.1729 },
  ],
  fuel_estimate: 350,
  ...overrides,
});

// ==================== COMPLIANCE ====================

export const mockAudit = (overrides = {}) => ({
  id: `audit-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  audit_type: 'SIRE',
  status: 'in_progress',
  auditor: 'auditor-123',
  scheduled_date: new Date().toISOString(),
  checklist_id: 'checklist-123',
  findings: [],
  score: null,
  ...overrides,
});

export const mockChecklist = (overrides = {}) => ({
  id: `checklist-${Math.random().toString(36).substr(2, 9)}`,
  name: 'SIRE 2.0 Inspection',
  category: 'inspection',
  items: [
    { id: '1', description: 'Check fire extinguishers', status: 'pending' },
    { id: '2', description: 'Verify emergency stops', status: 'pending' },
  ],
  required_frequency: 'quarterly',
  ...overrides,
});

export const mockSGSORecord = (overrides = {}) => ({
  id: `sgso-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  document_type: 'safety_manual',
  title: 'Safety Management System Manual',
  version: '2.1',
  status: 'active',
  last_review: new Date().toISOString(),
  next_review: new Date(Date.now() + 31536000000).toISOString(),
  ...overrides,
});

// ==================== LOGISTICS ====================

export const mockSupplyOrder = (overrides = {}) => ({
  id: `supply-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  items: [
    { name: 'Engine Oil', quantity: 100, unit: 'liters' },
    { name: 'Filters', quantity: 10, unit: 'units' },
  ],
  status: 'pending',
  priority: 'normal',
  requested_date: new Date().toISOString(),
  delivery_port: 'Santos',
  ...overrides,
});

export const mockFuelConsumption = (overrides = {}) => ({
  id: `fuel-${Math.random().toString(36).substr(2, 9)}`,
  vessel_id: 'vessel-123',
  date: new Date().toISOString(),
  consumed: 50,
  unit: 'tons',
  efficiency_rating: 85,
  operating_hours: 24,
  ...overrides,
});

// ==================== HR ====================

export const mockTrainingCourse = (overrides = {}) => ({
  id: `course-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Advanced Fire Fighting',
  category: 'safety',
  duration_days: 3,
  certification: 'STCW A-VI/3',
  validity_years: 5,
  required_for_ranks: ['officer', 'captain'],
  ...overrides,
});

export const mockTrainingRecord = (overrides = {}) => ({
  id: `training-${Math.random().toString(36).substr(2, 9)}`,
  crew_id: 'crew-123',
  course_id: 'course-123',
  completion_date: new Date().toISOString(),
  expiry_date: new Date(Date.now() + 157680000000).toISOString(), // 5 years
  score: 92,
  certificate_number: 'CERT-2025-001',
  ...overrides,
});

// ==================== CONNECTIVITY ====================

export const mockAPIRequest = (overrides = {}) => ({
  id: `api-${Math.random().toString(36).substr(2, 9)}`,
  endpoint: '/api/v1/vessels',
  method: 'GET',
  status: 200,
  response_time: 150,
  timestamp: new Date().toISOString(),
  user_id: 'user-123',
  ...overrides,
});

export const mockNotification = (overrides = {}) => ({
  id: `notif-${Math.random().toString(36).substr(2, 9)}`,
  user_id: 'user-123',
  type: 'alert',
  title: 'Critical Alert',
  message: 'Immediate attention required',
  priority: 'high',
  read: false,
  created_at: new Date().toISOString(),
  ...overrides,
});

// ==================== UTILITIES ====================

/**
 * Create multiple instances of a mock
 */
export const createMany = <T>(factory: (overrides?: any) => T, count: number, overrides = {}): T[] => {
  return Array.from({ length: count }, () => factory(overrides));
};

/**
 * Create a sequence of mocks with incremental IDs
 */
export const createSequence = <T>(
  factory: (overrides?: any) => T,
  count: number,
  customizer: (index: number) => any = () => ({})
): T[] => {
  return Array.from({ length: count }, (_, index) => 
    factory({ ...customizer(index), id: `${index + 1}` })
  );
};
