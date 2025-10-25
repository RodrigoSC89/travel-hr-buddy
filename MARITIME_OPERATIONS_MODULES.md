# Maritime Operations Modules (Patches 103.0-105.0)

This document describes the three new maritime operations modules implemented for the Travel HR Buddy platform.

## Overview

Three interconnected modules for comprehensive maritime fleet management:

1. **PATCH 103.0**: Fleet Management - Real-time vessel tracking
2. **PATCH 104.0**: Route Optimizer - AI-powered route planning  
3. **PATCH 105.0**: Weather Station - Maritime weather monitoring

## Module Architecture

```
modules/
├── fleet-management/
│   ├── components/
│   │   ├── FleetMap.tsx           # Mapbox-based vessel tracking map
│   │   ├── VesselList.tsx         # Vessel list with filters
│   │   └── VesselDetailCard.tsx   # Detailed vessel information
│   ├── services/
│   │   └── vessel-service.ts      # Vessel data management
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── index.tsx                  # Main Fleet Management page
│
├── route-optimizer/
│   ├── components/
│   │   ├── RoutePlannerForm.tsx   # Route planning interface
│   │   ├── RouteList.tsx          # Route list with status
│   │   └── RouteDetail.tsx        # Route details with map
│   ├── services/
│   │   ├── route-service.ts       # Route CRUD operations
│   │   ├── weather-service.ts     # Weather data for routes
│   │   └── ai-service.ts          # AI recommendations
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── index.tsx                  # Main Route Optimizer page
│
└── weather-station/
    ├── components/
    │   ├── CurrentWeatherDashboard.tsx  # Current conditions
    │   ├── ForecastPanel.tsx            # 72-hour forecast
    │   └── WeatherAlertsList.tsx        # Alert management
    ├── services/
    │   └── weather-station-service.ts   # Weather data management
    ├── types/
    │   └── index.ts                     # TypeScript type definitions
    └── index.tsx                        # Main Weather Station page
```

## Database Schema

### Vessels Table (PATCH 103.0)

```sql
vessels
├── id (uuid, primary key)
├── name (text)
├── imo_code (text, unique)
├── status (text) - active|maintenance|inactive|critical
├── last_known_position (jsonb) - {lat, lng, course, speed}
├── vessel_type (text)
├── flag (text)
├── built_year (integer)
├── gross_tonnage (numeric)
├── maintenance_status (text) - ok|scheduled|urgent|critical
├── maintenance_notes (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Routes Table (PATCH 104.0)

```sql
routes
├── id (uuid, primary key)
├── vessel_id (uuid, foreign key → vessels.id)
├── origin (text)
├── origin_coordinates (jsonb)
├── destination (text)
├── destination_coordinates (jsonb)
├── planned_departure (timestamptz)
├── estimated_arrival (timestamptz)
├── actual_arrival (timestamptz)
├── status (text) - planned|active|completed|cancelled|delayed
├── distance_nm (numeric)
├── fuel_estimate (numeric)
├── fuel_actual (numeric)
├── weather_forecast (jsonb)
├── route_geometry (jsonb) - GeoJSON LineString
├── ai_recommendation (text)
├── ai_metadata (jsonb)
├── notes (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Weather Data Tables (PATCH 105.0)

```sql
weather_data
├── id (uuid, primary key)
├── timestamp (timestamptz)
├── vessel_id (uuid, foreign key → vessels.id)
├── location (jsonb) - {lat, lng}
├── location_name (text)
├── forecast (jsonb)
├── current_conditions (jsonb)
├── alerts (jsonb)
├── severity (text) - none|low|moderate|high|severe
├── alert_sent (boolean)
└── created_at (timestamptz)

weather_alerts
├── id (uuid, primary key)
├── vessel_id (uuid, foreign key → vessels.id)
├── alert_type (text)
├── severity (text)
├── title (text)
├── description (text)
├── location (jsonb)
├── start_time (timestamptz)
├── end_time (timestamptz)
├── acknowledged (boolean)
├── acknowledged_at (timestamptz)
├── acknowledged_by (text)
└── created_at (timestamptz)
```

## Features

### PATCH 103.0: Fleet Management

**Key Features:**
- Real-time vessel tracking on interactive Mapbox map
- Vessel list with advanced filtering (status, maintenance, search)
- Detailed vessel information cards
- Maintenance status tracking
- Live updates via Supabase real-time subscriptions
- Color-coded vessel markers based on status

**Routes:**
- `/fleet-management` - Main fleet dashboard

**Statistics:**
- Total vessels count
- Active vessels
- Vessels in maintenance
- Critical alerts

### PATCH 104.0: Route Optimizer

**Key Features:**
- AI-powered route recommendations using OpenAI GPT-4
- Route planning with origin/destination selection
- Interactive map visualization with Mapbox
- Weather forecast integration along route
- Fuel consumption estimation (Haversine formula)
- ETA calculation based on vessel speed
- Route optimization scoring (fuel, safety, time efficiency)

**Routes:**
- `/route-optimizer` - Route planning dashboard

**AI Integration:**
- GPT-4 analysis of weather conditions
- Fuel efficiency recommendations
- Safety assessments
- Optimal speed suggestions

**Calculations:**
- Distance: Haversine formula for great circle distance
- Fuel: ~0.055 tons per nautical mile at 15 knots
- ETA: Distance / Speed with weather adjustments

### PATCH 105.0: Weather Station

**Key Features:**
- Current weather conditions display
- 72-hour forecast with 3-hour intervals
- Weather alert system with severity levels
- Integration with OpenWeather API
- Alert acknowledgment and tracking
- Vessel-based or custom location monitoring

**Routes:**
- `/weather-station` - Weather monitoring dashboard

**Weather Metrics:**
- Temperature (°C)
- Wind speed and direction
- Humidity (%)
- Visibility (km)
- Atmospheric pressure (hPa)
- Weather conditions description

**Alert Severities:**
- None - Normal conditions
- Low - Minor weather events
- Moderate - Conditions requiring monitoring
- High - Adverse conditions affecting operations
- Severe - Critical weather events requiring immediate action

## API Integration

### Required Environment Variables

```bash
# Mapbox (for all modules)
# Use either VITE_MAPBOX_ACCESS_TOKEN or VITE_MAPBOX_TOKEN (both work)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# OpenWeather API (for route-optimizer and weather-station)
VITE_OPENWEATHER_API_KEY=your_api_key
OPENWEATHER_API_KEY=your_api_key

# OpenAI API (for route-optimizer AI recommendations)
VITE_OPENAI_API_KEY=sk-proj-...

# Supabase (required for all modules)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAi...
```

### External APIs Used

1. **Mapbox GL JS v3.15.0**
   - Interactive maps
   - Vessel and route visualization
   - Geocoding services

2. **OpenWeather API**
   - Current weather data
   - 72-hour forecasts
   - Weather alerts

3. **OpenAI GPT-4**
   - Route analysis
   - AI-powered recommendations
   - Safety assessments

## Usage Examples

### Fleet Management

```typescript
// Fetch all active vessels
const vessels = await fetchVessels({ 
  status: ['active'],
  maintenanceStatus: ['ok', 'scheduled']
});

// Update vessel position
await updateVesselPosition(vesselId, {
  lat: -22.9068,
  lng: -43.1729,
  course: 180,
  speed: 12.5
});

// Subscribe to real-time updates
const subscription = subscribeToVesselUpdates((payload) => {
  console.log('Vessel updated:', payload.new);
});
```

### Route Optimizer

```typescript
// Optimize a new route
const route = await optimizeRoute({
  vessel_id: vesselId,
  origin: "Port of Santos",
  destination: "Port of Rotterdam",
  departure_date: "2025-11-01T08:00:00Z",
  preferred_speed: 15
});

// Get AI recommendation
const recommendation = await generateAIRouteRecommendation({
  origin: "Santos",
  destination: "Rotterdam",
  distance: 5800,
  weatherForecast: forecasts,
  fuelEstimate: 320,
  estimatedDuration: 386
});
```

### Weather Station

```typescript
// Fetch current weather
const weather = await fetchCurrentWeather({
  lat: -22.9068,
  lng: -43.1729
});

// Get 72-hour forecast
const forecast = await fetch72HourForecast({
  lat: -22.9068,
  lng: -43.1729
});

// Acknowledge alert
await acknowledgeWeatherAlert(alertId, "Captain Smith");
```

## Security Features

- Row Level Security (RLS) enabled on all tables
- Authenticated user policies for CRUD operations
- Input validation on all forms
- API key security (environment variables only)
- No sensitive data in client-side code

## Performance Considerations

- Lazy loading for all modules (React.lazy)
- Efficient Supabase queries with indexes
- Real-time subscriptions instead of polling
- Map marker clustering for large fleets
- Weather data caching to reduce API calls

## Testing

Sample data is included in migrations for immediate testing:
- 3 sample vessels with different statuses
- 1 sample route
- Sample weather data and alerts

## Future Enhancements

Potential improvements for future patches:
- AIS (Automatic Identification System) integration
- Historical route analysis and optimization
- Advanced weather forecasting models
- Multi-route comparison
- Automated alert notifications (email, SMS)
- Integration with vessel maintenance systems
- Crew management integration
- Port information and schedules

## Troubleshooting

### Maps Not Loading
- Verify `VITE_MAPBOX_ACCESS_TOKEN` is set
- Check browser console for API errors
- Ensure Mapbox token has proper permissions

### Weather Data Not Updating
- Verify `OPENWEATHER_API_KEY` is configured
- Check API rate limits (free tier: 60 calls/minute)
- Verify coordinates are valid

### AI Recommendations Not Working
- Verify `VITE_OPENAI_API_KEY` is configured
- Check OpenAI API quota and billing
- Fallback recommendations will be used if AI fails

### Database Connection Issues
- Verify Supabase credentials
- Check Row Level Security policies
- Ensure database migrations have run

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review environment variable configuration
3. Check browser console for errors
4. Verify API key validity and quotas

## License

Part of the Travel HR Buddy platform.
