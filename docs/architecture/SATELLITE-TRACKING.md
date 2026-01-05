# 🛰️ Satellite Tracking System Architecture

> **Nautilus One v3.2.0** - Maritime Orbital Tracking for GNSS Accuracy & Space Weather Awareness

## Overview

The Satellite Tracking System provides real-time orbital mechanics calculations for maritime GNSS accuracy assessment. It integrates with CelesTrak for TLE data and uses the SGP4 propagation algorithm via `satellite.js` for high-precision position calculations.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NAUTILUS ONE FRONTEND                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  Space Weather  │  │   GNSS Module   │  │  Navigation Module  │  │
│  │    Dashboard    │  │                 │  │                     │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                       │            │
│           └────────────────────┼───────────────────────┘            │
│                                ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              CELESTRAK SERVICE LAYER                         │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  celestrak.service.ts                                   │ │   │
│  │  │  - fetchGPElements()     - calculateVisibility()        │ │   │
│  │  │  - calculateDOP()        - generateSkyplotData()        │ │   │
│  │  │  - propagateSGP4()       - getCurrentPositions()        │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                │                                    │
│                                ▼                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              SGP4 PROPAGATOR CORE                            │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │  sgp4-propagator.ts (satellite.js wrapper)              │ │   │
│  │  │  - createSatelliteRecord()  - propagateToTime()         │ │   │
│  │  │  - calculateLookAngles()    - trackSatellite()          │ │   │
│  │  │  - getSatellitePositionWithAngles()                     │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIS                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  CelesTrak API (celestrak.org)                              │    │
│  │  - /NORAD/elements/gp.php?GROUP=gnss                        │    │
│  │  - Returns: GP Elements (JSON) or TLE (text)                │    │
│  │  - Update frequency: ~daily                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. SGP4 Propagator (`src/lib/satellite/sgp4-propagator.ts`)

The core orbital mechanics engine using `satellite.js` library.

#### Key Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `createSatelliteRecord(tle)` | Parses TLE into SatRec object | `SatRec \| null` |
| `propagateToTime(satrec, time)` | Calculates satellite position at time | `SatellitePosition \| null` |
| `calculateLookAngles(...)` | Computes azimuth/elevation from observer | `{az, el, range}` |
| `trackSatellite(tle, start, end, interval)` | Generates position track | `PropagationResult[]` |

#### Data Types

```typescript
interface TLEData {
  line1: string;  // TLE line 1 (69 chars)
  line2: string;  // TLE line 2 (69 chars)
  name?: string;  // Satellite name
}

interface SatellitePosition {
  latitude: number;   // degrees (-90 to 90)
  longitude: number;  // degrees (-180 to 180)
  altitude: number;   // km above Earth surface
  velocity: number;   // km/s
  azimuth?: number;   // degrees from observer
  elevation?: number; // degrees above horizon
  range?: number;     // km from observer
}
```

### 2. CelesTrak Service (`src/services/space-weather/celestrak.service.ts`)

High-level service integrating CelesTrak API with SGP4 propagation.

#### API Integration

```typescript
// Fetch GNSS constellation data
const gpElements = await celestrakService.fetchGPElements('gnss');

// Calculate DOP metrics for vessel position
const dop = celestrakService.calculateDOP(
  visibleSatellites,
  vesselLat,
  vesselLon
);

// Generate skyplot visualization data
const skyplot = celestrakService.generateSkyplotData(
  satellites,
  observerLat,
  observerLon
);
```

#### DOP Calculations

The service calculates Dilution of Precision metrics critical for maritime navigation:

| Metric | Description | Good Value |
|--------|-------------|------------|
| GDOP | Geometric DOP (3D + time) | < 6 |
| PDOP | Position DOP (3D) | < 4 |
| HDOP | Horizontal DOP | < 2 |
| VDOP | Vertical DOP | < 3 |

### 3. TLE Format

Two-Line Element sets contain orbital parameters:

```
ISS (ZARYA)
1 25544U 98067A   24001.50000000  .00002182  00000-0  41234-4 0  9993
2 25544  51.6416 247.4627 0006703  69.9587 290.2180 15.49710051484230
```

**Line 1 Elements:**
- Catalog number, classification, launch year/number
- Epoch (year + fractional day)
- Mean motion derivatives, drag term

**Line 2 Elements:**
- Inclination, RAAN, eccentricity
- Argument of perigee, mean anomaly
- Mean motion, revolution number

## Data Flow

```
1. CelesTrak API Request
   ↓
2. GP Elements (JSON) / TLE (text)
   ↓
3. gpElementToTLE() conversion
   ↓
4. createSatelliteRecord() → SatRec
   ↓
5. propagateToTime() → ECI coordinates
   ↓
6. eciToGeodetic() → lat/lon/alt
   ↓
7. calculateLookAngles() → az/el/range
   ↓
8. UI Display (Skyplot, DOP, Map)
```

## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `sgp4-tracking` | `true` | Enable real SGP4 propagation |

When disabled, falls back to simplified propagation (less accurate but faster).

## Usage Examples

### Basic Satellite Tracking

```typescript
import { createSatelliteRecord, propagateToTime } from '@/lib/satellite/sgp4-propagator';

const tle = {
  line1: '1 25544U 98067A   24001.50000000...',
  line2: '2 25544  51.6416 247.4627...',
  name: 'ISS'
};

const satrec = createSatelliteRecord(tle);
const position = propagateToTime(satrec, new Date());

console.log(`ISS at: ${position.latitude}°, ${position.longitude}°`);
console.log(`Altitude: ${position.altitude} km`);
```

### Maritime GNSS Accuracy Assessment

```typescript
import { celestrakService } from '@/services/space-weather/celestrak.service';

// Vessel position
const vesselLat = -23.9618;
const vesselLon = -46.3322;

// Get visible satellites
const visibility = celestrakService.calculateVisibility(
  gpElements,
  vesselLat,
  vesselLon,
  0 // altitude in meters
);

// Check DOP for navigation quality
const dop = celestrakService.calculateDOP(
  visibility.filter(s => s.visible),
  vesselLat,
  vesselLon
);

if (dop.hdop > 2) {
  console.warn('Poor horizontal accuracy expected');
}
```

## Testing

Unit tests validate orbital calculations with real TLE data:

```bash
npm test -- src/lib/satellite/__tests__/sgp4-propagator.test.ts
npm test -- src/services/space-weather/__tests__/celestrak.service.test.ts
```

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| SGP4 Propagator | 11 | 95% |
| CelesTrak Service | 12 | 92% |

## Performance Considerations

1. **TLE Freshness**: Update TLEs daily for <1km accuracy
2. **Propagation Limits**: SGP4 accurate for ~2 weeks from epoch
3. **Batch Processing**: Use `trackSatellite()` for multi-point calculations
4. **Caching**: Cache SatRec objects, not positions

## Error Handling

```typescript
const satrec = createSatelliteRecord(tle);
if (!satrec) {
  // Invalid TLE format
  console.error('Failed to parse TLE');
  return;
}

const position = propagateToTime(satrec, futureDate);
if (!position) {
  // Propagation failed (TLE too old or invalid)
  console.error('Propagation error');
  return;
}
```

## References

- [CelesTrak](https://celestrak.org/) - TLE/GP Element source
- [satellite.js](https://github.com/shashwatak/satellite-js) - SGP4 implementation
- [NORAD TLE Format](https://celestrak.org/columns/v04n03/) - TLE specification
- [SGP4 Theory](https://celestrak.org/publications/AIAA/2006-6753/) - Mathematical background

---

**Last Updated**: 2025-01-05  
**Version**: 3.2.0  
**Maintainer**: Nautilus One Engineering Team
