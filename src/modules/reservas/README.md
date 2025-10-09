# Reservas Module

## Purpose / Description

The Reservas (Reservations) module is a **comprehensive booking and reservation system** that handles all aspects of booking management including flights, hotels, transportation, and meeting rooms.

**Key Use Cases:**

- Book flights, hotels, and rental cars
- Reserve meeting rooms and facilities
- Manage booking confirmations and vouchers
- Track reservation status and modifications
- Handle cancellations and refunds
- Group booking management
- Generate booking reports and analytics

## Folder Structure

```bash
src/modules/reservas/
├── components/      # Booking UI components (BookingCard, SearchForm, ConfirmationView)
├── pages/           # Reservation pages (Search, Booking, MyReservations)
├── hooks/           # Hooks for booking operations and search
├── services/        # Booking services and provider integrations
├── types/           # TypeScript types for bookings, reservations, confirmations
└── utils/           # Utilities for booking calculations and validations
```

## Main Components / Files

- **BookingCard.tsx** — Display booking summary and details
- **SearchForm.tsx** — Multi-criteria search interface
- **ConfirmationView.tsx** — Show booking confirmation details
- **ModificationForm.tsx** — Modify existing reservations
- **bookingService.ts** — API service for booking operations
- **providerIntegration.ts** — Integration with booking providers

## External Integrations

- **Amadeus API** — Flight and hotel booking
- **Supabase** — Reservation data storage
- **Payment Gateway** — Stripe (future integration)

## Status

🟢 **Functional** — Booking system operational

## TODOs / Improvements

- [ ] Add payment processing integration
- [ ] Implement booking approval workflow
- [ ] Add loyalty program integration
- [ ] Create booking policy enforcement
- [ ] Add split payment options
- [ ] Implement waitlist management
- [ ] Add booking analytics dashboard
