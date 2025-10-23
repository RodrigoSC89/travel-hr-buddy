# Viagens Module

## Purpose / Description

The Viagens (Travel) module is the **comprehensive travel management system** for planning, booking, and tracking business trips. It streamlines the entire travel lifecycle from request to reconciliation.

**Key Use Cases:**
- Plan and request business travel
- Search and book flights, hotels, and transportation
- Track travel itineraries and schedules
- Monitor travel expenses and budgets
- Ensure policy compliance for corporate travel
- Access travel documents and confirmations
- Coordinate group travel and events

## Folder Structure

```bash
src/modules/viagens/
├── components/      # Travel UI components (TripCard, BookingForm, ItineraryView)
├── pages/           # Travel pages (Search, Booking, MyTrips, Approvals)
├── hooks/           # Hooks for travel data, search, and booking
├── services/        # Travel services and API integrations
├── types/           # TypeScript types for trips, bookings, itineraries
└── utils/           # Travel-specific utilities (date calculations, pricing)
```

## Main Components / Files

- **TripCard.tsx** — Display trip summary and status
- **FlightSearch.tsx** — Search and compare flight options
- **BookingForm.tsx** — Complete travel bookings
- **ItineraryView.tsx** — View detailed trip itinerary
- **ExpenseTracker.tsx** — Track travel-related expenses
- **travelService.ts** — API service for travel operations
- **bookingService.ts** — Integration with booking platforms

## External Integrations

- **Amadeus API** — Flight and hotel search/booking
- **Mapbox** — Interactive maps for destination exploration
- **Supabase** — Travel data storage and synchronization

## Status

🟢 **Functional** — Travel booking and management operational

## TODOs / Improvements

- [ ] Add real-time flight tracking and alerts
- [ ] Implement travel approval workflow
- [ ] Add carbon footprint calculation for trips
- [ ] Integrate with expense management system
- [ ] Add traveler safety tracking and alerts
- [ ] Implement preferred vendor management
- [ ] Add multi-currency support for international travel
