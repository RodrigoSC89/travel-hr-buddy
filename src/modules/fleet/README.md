# Fleet Management Module

## 📋 Overview

**Version**: 191.0  
**Category**: Operations  
**Route**: `/fleet`  
**Status**: Active (100%)

Unified fleet management system with vessel tracking, maintenance scheduling, crew assignments, and route management.

## 🎯 Objectives

- Track all vessels in real-time
- Schedule and monitor maintenance
- Manage crew assignments
- Optimize routes and fuel consumption
- Monitor vessel performance and compliance

## 🏗️ Architecture

Consolidated from operations/fleet and operations/maritime-system modules.

### Component Structure
```
fleet/
├── index.tsx               # Main fleet dashboard
├── components/            # Vessel management UI
├── services/              # Fleet operations
└── hooks/                 # Fleet data management
```

## 💾 Database Schema

### vessels
```sql
CREATE TABLE vessels (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  vessel_type VARCHAR(100),
  imo_number VARCHAR(20) UNIQUE,
  flag VARCHAR(100),
  capacity NUMERIC,
  status VARCHAR(20) DEFAULT 'active',
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### maintenance
```sql
CREATE TABLE maintenance (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  maintenance_type VARCHAR(100),
  scheduled_date DATE,
  completed_date DATE,
  status VARCHAR(20) DEFAULT 'scheduled',
  description TEXT,
  cost DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### routes
```sql
CREATE TABLE routes (
  id UUID PRIMARY KEY,
  vessel_id UUID REFERENCES vessels(id),
  origin VARCHAR(200),
  destination VARCHAR(200),
  departure_date TIMESTAMP,
  arrival_date TIMESTAMP,
  distance_nm NUMERIC,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 Key Features

- Real-time vessel tracking with GPS integration
- Predictive maintenance scheduling
- Crew assignment optimization
- Fuel efficiency monitoring
- Route optimization with weather data
- Compliance tracking (certifications, inspections)
- Performance analytics

## 🚀 Usage Examples

```typescript
import FleetManagement from '@/modules/fleet';

function App() {
  return <FleetManagement />;
}
```

## 🔗 Dependencies

- Supabase - Database integration
- Crew Management - For assignments
- Maintenance Planner - For scheduling
- Route Optimizer - For route planning

## 📚 Related Documentation

- [Maritime System README](../../pages/Maritime/README.md)
- [Crew Management README](./operations/crew/README.md)
- [Module Overview](/dev/docs/MODULES_OVERVIEW.md)

---

**Last Updated**: 2025-10-28  
**Version**: 191.0  
**Status**: Fully operational with Supabase integration
