# ASOG Review Module

## Purpose / Description

The ASOG Review (Activity Specific Operating Guidelines) module is responsible for auditing vessel operational conditions and verifying adherence to specific Dynamic Positioning (DP) operation guidelines.

**Key Use Cases:**
- Monitor environmental conditions (wind speed, sea state)
- Track thruster operational status
- Validate DP system alert levels
- Generate compliance reports
- Ensure operational safety within ASOG parameters

## Folder Structure

```bash
src/modules/asog-review/
├── types.ts           # TypeScript types for ASOG data structures
├── asogService.ts     # ASOG operations service
└── README.md          # Module documentation
```

## Main Components / Files

- **types.ts** — Type definitions for ASOG limits, operational status, and reports
- **asogService.ts** — Service for data collection, validation, and report generation
- **ASOGReview.tsx** — Main page component for ASOG Review interface

## ASOG Limits

Default operational limits:
- **Wind Speed**: Maximum 35 knots
- **Thruster Loss Tolerance**: Maximum 1 thruster inoperative
- **DP Alert Level**: Green status required

## External Integrations

- **Logger System** — Centralized logging for audit trail
- **DP Intelligence Module** — Integration with DP monitoring systems
- **Sistema Marítimo Module** — Maritime vessel management

## Status

🟢 **Functional** — ASOG Review system operational

## TODOs / Improvements

- [ ] Integrate with real-time vessel sensor data
- [ ] Add historical trend analysis
- [ ] Implement automated alerts for ASOG violations
- [ ] Add customizable ASOG limits per vessel/operation
- [ ] Create ASOG compliance dashboard
- [ ] Add PDF export for reports
- [ ] Implement multi-language support
