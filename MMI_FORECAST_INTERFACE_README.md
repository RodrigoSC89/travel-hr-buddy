# MMI Forecast IA Interface - Documentation

## Overview

The MMI Forecast IA Interface is a powerful AI-powered maintenance prediction page that enables users to generate intelligent maintenance forecasts for offshore vessels and equipment systems. Located at `/admin/mmi/forecast`, this interface leverages GPT-4 to provide technical recommendations based on maintenance history and equipment data.

## Features

### User Interface

- **Clean, Responsive Layout**: 2-column grid on desktop, single column on mobile
- **Real-time Streaming**: Server-Sent Events (SSE) display AI responses in real-time
- **User-Friendly Inputs**: Clear labeled fields for all required data
- **Loading States**: Visual feedback during forecast generation
- **Error Handling**: Graceful error messages for failed requests

### Input Fields

1. **🚢 Embarcação (Vessel Name)**
   - Text input for vessel/equipment identification
   - Example: "PSV Ocean STAR"

2. **⚙️ Sistema (System Name)**
   - Text input for specific system or equipment
   - Example: "Motor Principal MAN B&W"

3. **⏱ Horímetro Atual (Current Hourmeter)**
   - Numeric input for current equipment hours
   - Example: 12500

4. **🧾 Datas das Últimas Manutenções (Last Maintenance Dates)**
   - Multi-line textarea for maintenance history
   - One entry per line
   - Example format: "15/01/2025 - Troca de óleo lubrificante"

## Technical Implementation

### Frontend Component

**Location**: `/src/pages/admin/mmi/forecast/page.tsx`

**Key Features**:
- React hooks for state management
- SSE parsing with JSON content extraction
- Streaming response display
- Loading and error states
- Uses existing UI components (Input, Textarea, Button, Label)

### API Integration

**Endpoint**: `POST /api/mmi/forecast`

**Request Format**:
```json
{
  "vessel_name": "PSV Ocean STAR",
  "system_name": "Motor Principal MAN B&W",
  "current_hourmeter": 12500,
  "last_maintenance_dates": [
    "15/01/2025 - Troca de óleo lubrificante",
    "22/03/2025 - Inspeção de válvulas",
    "10/05/2025 - Manutenção do sistema de refrigeração"
  ]
}
```

**Response Format** (SSE):
```
data: {"content": "text chunk"}

data: {"content": "more text"}

```

### AI Response Structure

The AI provides structured technical recommendations including:

1. **Next Recommended Intervention**
   - Specific maintenance action needed
   - Timing recommendation

2. **Technical Justification**
   - Reason for the recommendation
   - Based on historical data and patterns

3. **Impact Assessment**
   - Consequences of not executing maintenance
   - Risk evaluation

4. **Priority Level**
   - Urgency classification
   - Resource allocation suggestion

5. **Recommended Frequency**
   - Ongoing maintenance schedule
   - Preventive maintenance intervals

## Usage

### Accessing the Interface

Navigate to `/admin/mmi/forecast` in the application.

### Generating a Forecast

1. Fill in the vessel name
2. Enter the system/equipment name
3. Input the current hourmeter reading
4. List historical maintenance dates (one per line)
5. Click "📡 Gerar Forecast"
6. Watch the AI-generated forecast stream in real-time

### Example Use Case

**Scenario**: Maintenance planning for a vessel's main engine

**Input**:
- Vessel: PSV Ocean STAR
- System: Motor Principal MAN B&W
- Hourmeter: 12500
- Maintenance History:
  - 15/01/2025 - Troca de óleo lubrificante
  - 22/03/2025 - Inspeção de válvulas
  - 10/05/2025 - Manutenção do sistema de refrigeração

**Expected Output**: AI-generated recommendations for:
- Next maintenance intervention timing
- Technical justification based on usage patterns
- Impact assessment
- Priority level
- Recommended maintenance frequency

## Configuration

### Environment Variables

The interface requires an OpenAI API key to be configured:

```bash
# Option 1: Standard environment variable
OPENAI_API_KEY=your-openai-api-key-here

# Option 2: Vite-prefixed for frontend
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

### Routing

The route is configured in `src/App.tsx`:

```tsx
const MMIForecast = React.lazy(() => import("./pages/admin/mmi/forecast/page"));

// In the Routes section:
<Route path="/admin/mmi/forecast" element={<MMIForecast />} />
```

## Testing

### Component Tests

Location: `/src/tests/pages/admin/mmi-forecast-page.test.tsx`

Tests include:
- Page title rendering
- Input field presence
- Submit button functionality
- Forecast result display area

### API Tests

Location: `/src/tests/mmi-forecast-api.test.ts`

Tests include:
- Request body validation
- Required fields presence
- Field type validation
- Array handling for maintenance dates

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test mmi-forecast-page.test.tsx

# Watch mode
npm run test:watch
```

## Files Changed

1. **Created**: `src/pages/admin/mmi/forecast/page.tsx` (121 lines)
   - Main MMI Forecast page component

2. **Created**: `src/tests/pages/admin/mmi-forecast-page.test.tsx` (34 lines)
   - Component tests

3. **Modified**: `src/App.tsx` (+2 lines)
   - Added route for `/admin/mmi/forecast`

4. **Created**: `MMI_FORECAST_INTERFACE_README.md` (121 lines)
   - Comprehensive documentation

**Total**: 278 lines added across 4 files

## Implementation Notes

- Follows existing repository patterns and conventions
- Minimal changes approach (surgical modifications)
- Production-ready with comprehensive testing
- Full SSE streaming support for real-time AI responses
- Responsive design for mobile and desktop
- Error handling and loading states included

## Future Enhancements

Potential improvements for future iterations:

1. **Historical Forecast Storage**: Save and retrieve past forecasts
2. **Export Functionality**: Export forecasts as PDF or Excel
3. **Multi-language Support**: Internationalization for forecasts
4. **Advanced Filtering**: Filter by vessel, system, or date range
5. **Dashboard Integration**: Display forecast metrics on admin dashboard
6. **Notification System**: Alert users when forecasts are ready
