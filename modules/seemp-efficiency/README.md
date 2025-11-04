# SEEMP Efficiency Module

**PATCH 647** - Ship Energy Efficiency Management Plan (IMO SEEMP)

## Overview

The SEEMP Efficiency module monitors and optimizes fuel consumption and emissions in accordance with IMO's Ship Energy Efficiency Management Plan (SEEMP) regulations.

## Features

### 📊 Real-time Monitoring
- Track fuel consumption by fuel type (HFO, MDO, LNG, MGO, VLSFO)
- Monitor CO₂, NOx, and SOx emissions
- Calculate efficiency metrics per nautical mile
- Track performance across different vessel operating modes

### 🤖 AI-Powered Analytics
- Automated efficiency trend analysis
- AI-generated optimization recommendations
- Predictive fuel consumption modeling
- Weather-based efficiency adjustments

### 💡 Energy Simulations
- Simulate optimization scenarios
- Calculate potential fuel savings
- Compare baseline vs. optimized performance
- ROI estimation for efficiency improvements

### 📈 Efficiency Actions
- Plan and track fuel-saving initiatives
- Monitor implementation status
- Measure actual vs. expected savings
- Document best practices

## IMO SEEMP Compliance

This module helps vessels comply with:
- IMO MEPC.282(70) - 2016 SEEMP Guidelines
- IMO MEPC.203(62) - Energy Efficiency Design Index (EEDI)
- IMO MEPC.212(63) - Energy Efficiency Operational Indicator (EEOI)

## Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Services**: Efficiency calculations, AI recommendations
- **Database**: Supabase (fuel_logs, energy_simulations tables)
- **AI Integration**: LLM for recommendation generation

## Usage

```typescript
import SEEMPEfficiency from "@/modules/seemp-efficiency";

// In your route configuration
<Route path="/seemp/dashboard" element={<SEEMPEfficiency />} />
```

## Database Schema

### fuel_logs
- id, vessel_id, timestamp
- fuel_type, consumption, distance_traveled
- operating_hours, vessel_mode
- weather_conditions, created_by

### energy_simulations
- id, vessel_id, simulation_name
- baseline_consumption, optimized_consumption
- estimated_savings, optimization_actions
- ai_recommendations, created_at

## Future Enhancements

- [ ] Real-time vessel sensor integration
- [ ] Automated weather routing optimization
- [ ] Carbon credit tracking
- [ ] IMO DCS (Data Collection System) export
- [ ] Benchmarking against industry standards
