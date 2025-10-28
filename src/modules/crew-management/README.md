# Crew Management Module - PATCH 406

## 📋 Overview

**Category**: Operations / HR  
**Route**: `/crew-management`  
**Status**: Active - Consolidated Module  
**Version**: 406.0  
**Last Updated**: 2025-10-28

This module consolidates the functionality from `crew/` and `operations/crew/` into a single unified crew management system.

## 🎯 Objectives

- Unified crew member management (CRUD operations)
- Complete profile management with certifications
- Rotation scheduling and planning
- Performance tracking and analytics
- Mobile-compatible responsive design
- Real-time certification alerts
- Compliance tracking

## 🏗️ Architecture

### Component Structure
```
crew-management/
├── index.tsx                    # Main module entry with tabs
├── README.md                    # This file
├── components/                  # UI components
│   ├── CrewList.tsx            # Crew member list
│   ├── CrewProfile.tsx         # Individual profile view
│   ├── CertificationTracker.tsx # Certification management
│   └── RotationScheduler.tsx   # Rotation planning
├── hooks/                       # Custom hooks
│   ├── useCrewData.ts          # Crew data management
│   └── useCertifications.ts    # Certification tracking
└── services/                    # Business logic
    ├── crew.service.ts         # Crew CRUD operations
    └── certification.service.ts # Certification management
```

## 💾 Database Schema

### crew_members
```sql
CREATE TABLE crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  certifications TEXT[],
  hire_date DATE,
  mobile_accessible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### crew_certifications
```sql
CREATE TABLE crew_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  certification_type VARCHAR(100) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_authority VARCHAR(200),
  document_url TEXT,
  status VARCHAR(20) DEFAULT 'valid',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### crew_rotations
```sql
CREATE TABLE crew_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  vessel_id UUID,
  start_date DATE NOT NULL,
  end_date DATE,
  rotation_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔗 Dependencies

- `@/components/ui/*` - Shadcn UI components
- `@/components/ui/tabs` - Tab navigation
- `lucide-react` - Icons
- React Router - Navigation

## 🚀 Features

### 1. Crew Profiles
- Complete member information
- Contact details
- Qualification history
- Performance records

### 2. Certification Tracking
- Automated expiry alerts
- Document management
- Compliance monitoring
- Renewal workflows

### 3. Rotation Planning
- Smart scheduling
- Conflict detection
- Availability management
- Vessel assignments

### 4. Mobile Compatibility
- Responsive design
- Touch-friendly interface
- Offline capability (future)
- Progressive web app support

## 📱 Mobile Features

The module is designed with mobile-first principles:
- Responsive grid layouts
- Touch-optimized controls
- Collapsible sections
- Optimized for small screens

## 🔄 Integration Points

- **Fleet Management**: Vessel assignments
- **Compliance Hub**: Certification requirements
- **Training Academy**: Training records
- **HR Portal**: Employee information

## 📚 Usage Examples

```typescript
import CrewManagement from '@/modules/crew-management';

function App() {
  return <CrewManagement />;
}
```

## 🧪 Testing

Run tests with:
```bash
npm run test -- crew-management
```

## 📝 Migration Notes

This module consolidates:
- `src/modules/crew/` - Existing crew module
- `src/modules/operations/crew/` - Operations crew module
- Unified route: `/crew-management`

## 🔐 Security

- Row-level security (RLS) enabled
- Role-based access control
- Audit logging for all changes
- Data encryption at rest

## 📖 Related Documentation

- [Operations Dashboard README](../operations/README.md)
- [Fleet Management README](../fleet/README.md)
- [HR Portal README](../hr/employee-portal/README.md)
- [Module Registry](../../modules-registry.json)

---

**Last Updated**: 2025-10-28  
**Patch**: PATCH 406  
**Status**: ✅ Active - Consolidated Module
