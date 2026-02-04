/**
 * Travel Command Enterprise Types
 * Tipos completos para sistema de gestão de viagens corporativas
 */

// ========================================
// BOOKING ENGINE TYPES
// ========================================

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type TripType = 'oneway' | 'roundtrip' | 'multicity';
export type BookingStatus = 'draft' | 'pending_approval' | 'approved' | 'booked' | 'ticketed' | 'completed' | 'cancelled';
export type TransportType = 'flight' | 'hotel' | 'car' | 'train' | 'transfer';

export interface TravelSegment {
  id: string;
  type: TransportType;
  status: BookingStatus;
  origin: string;
  destination: string;
  departureDate: Date;
  arrivalDate: Date;
  price: number;
  currency: string;
  provider: string;
  bookingReference?: string;
  details: Record<string, unknown>;
}

export interface FlightSegment extends TravelSegment {
  type: 'flight';
  details: {
    airline: string;
    airlineCode: string;
    flightNumber: string;
    cabinClass: CabinClass;
    aircraft?: string;
    departureTerminal?: string;
    arrivalTerminal?: string;
    departureGate?: string;
    duration: number; // minutes
    stops: number;
    layovers?: {
      airport: string;
      duration: number;
    }[];
    baggage: {
      cabin: string;
      checked: string;
    };
    amenities: string[];
    fareRules: {
      refundable: boolean;
      changeable: boolean;
      changesFee?: number;
      cancellationFee?: number;
    };
    seat?: {
      number: string;
      type: 'window' | 'middle' | 'aisle';
    };
    loyaltyProgram?: {
      number: string;
      tier: string;
    };
  };
}

export interface HotelSegment extends TravelSegment {
  type: 'hotel';
  details: {
    hotelName: string;
    hotelChain?: string;
    starRating: number;
    address: string;
    coordinates: { lat: number; lng: number };
    roomType: string;
    bedType: string;
    nights: number;
    checkInTime: string;
    checkOutTime: string;
    amenities: string[];
    mealPlan: 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';
    cancellationPolicy: {
      type: 'free' | 'partial' | 'non_refundable';
      deadline?: Date;
      fee?: number;
    };
    specialRequests?: string[];
    photos: string[];
    rating: {
      score: number;
      count: number;
    };
  };
}

export interface CarRentalSegment extends TravelSegment {
  type: 'car';
  details: {
    provider: string;
    category: 'compact' | 'economy' | 'standard' | 'full_size' | 'suv' | 'luxury' | 'van';
    vehicleModel?: string;
    transmission: 'automatic' | 'manual';
    fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
    passengers: number;
    bags: number;
    pickupLocation: string;
    dropoffLocation: string;
    mileage: 'unlimited' | 'limited';
    mileageLimit?: number;
    insurance: {
      included: boolean;
      type: string[];
      coverage: number;
    };
    extras: string[]; // GPS, child seat, etc.
  };
}

export interface TransferSegment extends TravelSegment {
  type: 'transfer';
  details: {
    transferType: 'private' | 'shared' | 'shuttle' | 'rideshare';
    vehicleType: string;
    passengers: number;
    luggage: number;
    meetAndGreet: boolean;
    flightTracking: boolean;
    flightNumber?: string;
    driverDetails?: {
      name: string;
      phone: string;
      photo?: string;
    };
  };
}

// ========================================
// TRAVEL REQUEST & ITINERARY
// ========================================

export interface TravelRequest {
  id: string;
  requestNumber: string;
  organizationId: string;
  status: BookingStatus;
  purpose: string;
  tripType: 'mobilization' | 'demobilization' | 'training' | 'administrative' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Traveler Information
  traveler: {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    employeeId: string;
    vessel?: string;
  };
  
  // Requester Information
  requester: {
    id: string;
    name: string;
    department: string;
  };
  
  // Trip Details
  segments: TravelSegment[];
  
  // Cost Information
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  costCenter?: string;
  projectCode?: string;
  
  // Policy Compliance
  policyCompliance: {
    status: 'compliant' | 'warning' | 'violation';
    violations: PolicyViolation[];
  };
  
  // Approval Workflow
  approvalChain: ApprovalStep[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  bookedAt?: Date;
}

export interface PolicyViolation {
  id: string;
  type: 'cabin_class' | 'price_limit' | 'advance_booking' | 'preferred_supplier' | 'other';
  severity: 'warning' | 'violation';
  description: string;
  suggestedAlternative?: string;
  overrideJustification?: string;
  approvedOverride?: boolean;
}

export interface ApprovalStep {
  level: number;
  role: 'manager' | 'director' | 'vp' | 'cfo' | 'finance';
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped';
  decision?: 'approve' | 'reject' | 'request_changes';
  comments?: string;
  decidedAt?: Date;
  delegatedTo?: string;
}

// ========================================
// TRAVEL POLICIES
// ========================================

export interface TravelPolicy {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  
  // Flight Policies
  flightPolicies: {
    cabinClass: {
      domestic: Record<string, CabinClass>;
      international: Record<string, CabinClass>;
    };
    bookingWindow: {
      domestic: { minDays: number; maxDays: number };
      international: { minDays: number; maxDays: number };
    };
    priceLimit: {
      domestic: number;
      international: number;
      byRoute?: Record<string, number>;
    };
    preferredAirlines: string[];
    restrictedAirlines: string[];
    allowLowestLogicalFare: boolean;
    maxStops: number;
  };
  
  // Hotel Policies
  hotelPolicies: {
    starRating: { min: number; max: number; preferred: number };
    priceLimit: {
      tier1Cities: number;
      tier2Cities: number;
      tier3Cities: number;
      byCity?: Record<string, number>;
    };
    preferredChains: string[];
    requiredAmenities: string[];
    maxDistanceFromOffice: number; // km
  };
  
  // Car Rental Policies
  carRentalPolicies: {
    defaultCategory: string;
    categoryByPosition: Record<string, string>;
    maxDailyRate: number;
    preferredProviders: string[];
    insuranceRequired: boolean;
  };
  
  // Expense Policies
  expensePolicies: {
    meals: {
      breakfast: number;
      lunch: number;
      dinner: number;
      byCity?: Record<string, { breakfast: number; lunch: number; dinner: number }>;
    };
    miscellaneous: Record<string, number>;
    receiptThreshold: number;
  };
  
  // Approval Policies
  approvalPolicies: {
    autoApproveThreshold: number;
    levels: {
      role: string;
      maxAmount: number;
    }[];
    requiresApproval: {
      outOfPolicy: boolean;
      international: boolean;
      lastMinute: boolean;
      groupBooking: boolean;
    };
    escalationTimeout: number; // hours
  };
}

// ========================================
// EXPENSE MANAGEMENT
// ========================================

export type ExpenseCategory = 
  | 'airfare' | 'hotel' | 'car_rental' | 'fuel' | 'parking' | 'tolls'
  | 'meals_breakfast' | 'meals_lunch' | 'meals_dinner' | 'entertainment'
  | 'wifi' | 'laundry' | 'tips' | 'ground_transport' | 'other';

export type ExpenseStatus = 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'reimbursed';

export interface Expense {
  id: string;
  tripId?: string;
  userId: string;
  organizationId: string;
  
  // Expense Details
  category: ExpenseCategory;
  subcategory?: string;
  description: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  amountInBaseCurrency: number;
  
  // Date & Location
  date: Date;
  location?: string;
  merchant?: string;
  
  // Receipt
  receipt?: {
    url: string;
    fileName: string;
    ocrExtracted?: {
      merchant: string;
      amount: number;
      date: Date;
      items?: string[];
    };
  };
  
  // Payment Method
  paymentMethod: 'corporate_card' | 'personal_card' | 'cash' | 'other';
  cardLast4?: string;
  
  // Policy & Status
  status: ExpenseStatus;
  policyCompliance: {
    status: 'compliant' | 'warning' | 'violation';
    issues?: string[];
  };
  
  // Approval
  approvalChain: ApprovalStep[];
  
  // Allocation
  allocation: {
    costCenter?: string;
    projectCode?: string;
    department?: string;
    client?: string;
    percentage: number;
  }[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  reimbursedAt?: Date;
  
  // Additional Info
  notes?: string;
  attendees?: string[];
  businessPurpose?: string;
}

export interface ExpenseReport {
  id: string;
  reportNumber: string;
  userId: string;
  organizationId: string;
  tripId?: string;
  
  // Report Details
  title: string;
  description?: string;
  status: ExpenseStatus;
  
  // Expenses
  expenses: Expense[];
  
  // Totals
  totalAmount: number;
  currency: string;
  reimbursableAmount: number;
  nonReimbursableAmount: number;
  
  // Approval
  approvalChain: ApprovalStep[];
  
  // Timestamps
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  reimbursedAt?: Date;
  
  // Reimbursement
  reimbursementMethod?: 'direct_deposit' | 'payroll' | 'check';
  reimbursementReference?: string;
}

// ========================================
// TRAVELER TRACKING (Duty of Care)
// ========================================

export interface TravelerLocation {
  id: string;
  visitorId: string;
  tripId: string;
  
  // Location
  coordinates: { lat: number; lng: number };
  address?: string;
  city?: string;
  country?: string;
  locationSource: 'gps' | 'checkin' | 'flight' | 'hotel' | 'manual';
  
  // Status
  status: 'in_transit' | 'at_destination' | 'delayed' | 'emergency' | 'offline';
  
  // Timestamps
  timestamp: Date;
  lastUpdate: Date;
}

export interface TravelAlert {
  id: string;
  tripId: string;
  travelerId: string;
  
  // Alert Details
  type: 'flight_delay' | 'flight_cancel' | 'gate_change' | 'weather' | 'security' | 'health' | 'emergency' | 'check_in_reminder';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  
  // Actions
  actions?: {
    label: string;
    action: string;
    url?: string;
  }[];
  
  // Status
  acknowledged: boolean;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  expiresAt?: Date;
}

// ========================================
// ANALYTICS & REPORTING
// ========================================

export interface TravelAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  
  // Trip Metrics
  tripMetrics: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byDestination: Record<string, number>;
  };
  
  // Cost Metrics
  costMetrics: {
    totalSpend: number;
    byCategory: Record<string, number>;
    byDepartment: Record<string, number>;
    byTraveler: Record<string, number>;
    averageTripCost: number;
    savingsFromPolicy: number;
    savingsFromNegotiatedRates: number;
  };
  
  // Compliance Metrics
  complianceMetrics: {
    complianceRate: number;
    violationsByType: Record<string, number>;
    outOfPolicySpend: number;
  };
  
  // Sustainability Metrics
  sustainabilityMetrics: {
    totalCO2: number;
    co2ByTransport: Record<string, number>;
    offsetAmount: number;
    sustainabilityScore: number;
  };
  
  // Performance Metrics
  performanceMetrics: {
    averageBookingLeadTime: number;
    averageApprovalTime: number;
    onTimeRate: number;
    travelerSatisfaction: number;
  };
}

// ========================================
// SUPPLIER & NEGOTIATED RATES
// ========================================

export interface NegotiatedRate {
  id: string;
  organizationId: string;
  supplierType: 'airline' | 'hotel' | 'car_rental';
  supplierCode: string;
  supplierName: string;
  
  // Rate Details
  rateCode: string;
  rateName: string;
  discountType: 'percentage' | 'fixed' | 'negotiated';
  discountValue: number;
  
  // Validity
  validFrom: Date;
  validTo: Date;
  
  // Conditions
  conditions: {
    minDays?: number;
    maxDays?: number;
    routes?: string[];
    properties?: string[];
    roomTypes?: string[];
    vehicleCategories?: string[];
  };
  
  // Contact
  accountManager?: {
    name: string;
    email: string;
    phone: string;
  };
}
