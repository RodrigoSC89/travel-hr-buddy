# Automated Tests Documentation

## Overview

This project now includes automated tests for the three most important modules:
- **Dashboard** - KPI widgets and data visualization
- **Reservas** - Reservation management system
- **Viagens** - Travel booking system

## Test Framework

- **Vitest** - Fast unit test framework for Vite projects
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM implementation for Node.js

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Coverage

### Dashboard Module (`src/components/dashboard/__tests__/`)

**dashboard-widgets.test.tsx** - Tests for Dashboard KPI Widget Component
- ✓ Renders without crashing
- ✓ Displays correct KPI values
- ✓ Shows priority badges
- ✓ Formats different unit types (%, BRL, days, hours)
- ✓ Displays trend indicators
- ✓ Shows progress bars when targets are set
- ✓ Handles string and numeric values
- ✓ Supports export callbacks

### Reservas Module (`src/components/reservations/__tests__/`)

**reservation-card.test.tsx** - Tests for Reservation Card Component
- ✓ Renders without crashing
- ✓ Displays reservation type (hotel, flight, transport, embarkation)
- ✓ Shows status badges (confirmed, pending, cancelled, completed)
- ✓ Displays location and crew member information
- ✓ Shows conflict warnings when detected
- ✓ Renders action buttons (edit, delete)
- ✓ Displays appropriate icons for each reservation type

**reservation-stats.test.tsx** - Tests for Reservation Statistics Component
- ✓ Calculates total reservations
- ✓ Counts confirmed/pending/cancelled reservations
- ✓ Calculates total amount (excluding cancelled)
- ✓ Shows upcoming reservations
- ✓ Counts unique crew members
- ✓ Handles empty data gracefully
- ✓ Renders stat cards with icons

### Viagens Module (`src/components/travel/__tests__/`)

**travel-booking-system.test.tsx** - Tests for Travel Booking System
- ✓ Renders without crashing
- ✓ Displays booking interface
- ✓ Shows interactive elements (forms, buttons, selects)
- ✓ Renders booking form structure
- ✓ Displays tabs/navigation
- ✓ Handles user interactions
- ✓ Manages multiple form controls

### UI Components (`src/components/ui/__tests__/`)

**InfoCard.test.tsx** - Tests for InfoCard Component
- ✓ Renders with title and description
- ✓ Supports children content
- ✓ Shows status badges
- ✓ Applies variant styling (success, warning, error, info)
- ✓ Supports custom className

## Test Structure

Tests follow this pattern:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from '../component';

describe('Component', () => {
  it('renders without crashing', () => {
    render(<Component prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Mocked Dependencies

The following are mocked globally in `src/test/setup.ts`:
- **Supabase client** - Database operations
- **useToast hook** - Toast notifications
- **useAuth context** - Authentication state
- **window.matchMedia** - Media query matching

## Adding New Tests

1. Create a `__tests__` directory in the component folder
2. Create a test file: `ComponentName.test.tsx`
3. Import testing utilities and the component
4. Write describe/it blocks with assertions
5. Run tests to verify

## Best Practices

- Keep tests focused and isolated
- Mock external dependencies (API calls, auth, etc.)
- Test user-visible behavior, not implementation details
- Use descriptive test names
- Test edge cases and error states
- Maintain test independence (tests shouldn't depend on each other)

## Test Statistics

- **Total Test Files**: 5
- **Total Tests**: 50
- **Pass Rate**: 100%

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Tests
  run: npm run test:run
```

## Future Improvements

- Add integration tests for multi-component workflows
- Increase code coverage to 80%+
- Add E2E tests with Playwright
- Add performance benchmarks
- Test accessibility (a11y) compliance
