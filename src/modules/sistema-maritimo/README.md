# Sistema Marítimo Module

## Purpose / Description

The Sistema Marítimo (Maritime System) module manages **fleet operations and vessel management**. It provides comprehensive tools for tracking vessels, managing maritime checklists, monitoring IoT sensors, and ensuring operational excellence at sea.

**Key Use Cases:**
- Track vessel locations and status in real-time
- Manage maritime safety checklists (SGSO)
- Monitor IoT sensors on vessels
- Coordinate fleet operations and schedules
- Maintain vessel documentation and certifications
- Track crew assignments and vessel capacity

## Folder Structure

```bash
src/modules/sistema-maritimo/
├── components/      # Maritime UI components (VesselCard, FleetMap, ChecklistViewer)
├── pages/           # Vessel management pages and fleet overview
├── hooks/           # Hooks for vessel data, location tracking, sensor monitoring
├── services/        # Maritime data services and IoT integration
├── types/           # TypeScript types for vessels, checklists, sensors
└── utils/           # Utilities for maritime calculations and data processing
```

## Main Components / Files

- **VesselCard.tsx** — Display vessel information and status
- **FleetMap.tsx** — Interactive map showing all vessel locations
- **ChecklistViewer.tsx** — View and complete maritime checklists
- **SensorDashboard.tsx** — Monitor IoT sensor data from vessels
- **vesselService.ts** — API service for vessel management
- **iotService.ts** — Integration with IoT sensors and real-time data

## External Integrations

- **Supabase** — Vessel data storage and real-time synchronization
- **Mapbox** — Interactive maps for fleet tracking
- **IoT Sensors** — Real-time sensor data from vessels
- **OpenWeather** — Maritime weather conditions

## Status

🟢 **Functional** — Fleet management and tracking operational

## TODOs / Improvements

- [ ] Implement predictive maintenance based on sensor data
- [ ] Add route optimization for fleet management
- [ ] Integrate maritime traffic data (AIS)
- [ ] Add offline mode for vessel operations
- [ ] Implement vessel performance analytics
- [ ] Add crew scheduling and rotation management
