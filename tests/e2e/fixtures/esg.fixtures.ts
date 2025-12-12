/**
 * ESG & Emissions Test Fixtures - FASE 3
 * Dados de teste para módulo ESG
 */

export const emissionTypes = [
  "CO2",
  "NOx",
  "SOx",
  "PM",
  "CH4"
];

export const emissionData = {
  valid: {
    type: "CO2",
    value: 1250.5,
    unit: "kg",
    date: "2025-12-11",
    source: "Main Engine",
    vessel: "MV Nautilus One",
    location: {
      lat: -23.5505,
      lng: -46.6333
    }
  },
  high: {
    type: "NOx",
    value: 5000.0,
    unit: "kg",
    date: "2025-12-11",
    source: "Auxiliary Engine",
    vessel: "MV Nautilus One",
    alert: true
  },
  invalid: {
    type: "",
    value: -100,
    unit: "",
    date: "",
    source: "",
    vessel: ""
  }
};

export const esgMetrics = {
  environmental: {
    co2Emissions: 125000,
    energyConsumption: 45000,
    wasteGenerated: 1200,
    recyclingRate: 75
  },
  social: {
    crewWellbeing: 85,
    trainingHours: 240,
    incidentRate: 2
  },
  governance: {
    complianceScore: 92,
    auditsPassed: 15,
    certificationsActive: 8
  }
};

export const eexi = {
  current: 4.2,
  target: 3.8,
  status: "warning",
  trend: "improving"
};

export const cii = {
  rating: "B",
  score: 2.85,
  target: 2.50,
  year: 2025
};
