# IMCA Technical Audit Module

## Overview
The IMCA Technical Audit Module generates detailed technical audit reports for vessels based on IMCA (International Marine Contractors Association) standards, IMO (International Maritime Organization) regulations, and MTS (Marine Technology Society) guidelines.

## Features
- **AI-Powered Report Generation**: Uses OpenAI GPT-4 to generate comprehensive audit reports
- **IMCA Standards Compliance**: Includes all major IMCA standards (M103, M117, M190, M166, M109, M220, M140)
- **User-Friendly Interface**: Built with React and shadcn/ui components
- **Error Handling**: Robust error handling with clear user feedback
- **Input Validation**: Validates ship name and operational context before generation

## Files Created

### 1. API Service (`/src/lib/api/imca-audit.ts`)
- Main service for generating IMCA audit reports
- Uses OpenAI GPT-4 API
- Includes comprehensive prompt with all IMCA standards
- Returns structured response with success/error handling

### 2. Page Component (`/src/pages/admin/auditoria-imca.tsx`)
- React component for the audit interface
- Input fields for ship name and operational context
- Loading states and error messages
- Display area for generated reports

### 3. Tests (`/src/tests/imca-audit.test.ts`)
- 5 comprehensive tests covering:
  - API key validation
  - Input parameter structure
  - Result structure validation
  - Error handling
  - IMCA standards inclusion

### 4. Routing (`/src/App.tsx`)
- Added lazy-loaded route at `/admin/auditoria-imca`
- Integrated with existing routing structure

## Usage

### Accessing the Module
Navigate to: `/admin/auditoria-imca`

### Using the Interface
1. Enter the **ship name** (e.g., "Aurora Explorer")
2. Enter the **operational context** (describe DP operations, sensor issues, failures, events)
3. Click **"Gerar Auditoria IMCA"** to generate the report
4. View the generated report in the text area below

### Required Configuration
Set the OpenAI API key in environment variables:
```bash
VITE_OPENAI_API_KEY=your-api-key-here
```

## IMCA Standards Included

The module evaluates vessels against the following standards:
- **IMCA M103**: Design and operation of DP systems
- **IMCA M117**: DP personnel qualification
- **IMCA M190**: Annual DP trials
- **IMCA M166**: Failure Mode and Effects Analysis (FMEA)
- **IMCA M109**: Documentation requirements
- **IMCA M220**: Operations planning
- **IMCA M140**: Capability plots
- **MSF 182**: Safe operation of DP-equipped OSVs
- **MTS and IMO MSC.1/Circ.1580**: International guidelines

## Report Structure

Generated reports include:
1. **Executive Summary**
2. **Systems and Sensors Evaluation**
3. **IMCA Standards Compliance**
4. **Personnel and Qualifications Analysis**
5. **Documentation Analysis**
6. **Identified Failures and Mitigations**
7. **Action Plan with Priorities and Timelines**

## Testing

Run tests with:
```bash
npm test src/tests/imca-audit.test.ts
```

All tests pass (5/5):
- ✓ API key validation
- ✓ Input parameter structure
- ✓ Result structure validation
- ✓ Error handling
- ✓ IMCA standards inclusion

## Build and Lint Status

✅ **Build**: Passing  
✅ **Lint**: No errors in module files  
✅ **Tests**: 5/5 passing (986 total tests passing)

## Implementation Details

- **Language**: TypeScript
- **Framework**: React 18.3.1
- **UI Library**: shadcn/ui (Radix UI components)
- **AI Provider**: OpenAI GPT-4
- **Testing**: Vitest

## Future Enhancements

Potential improvements:
- PDF export functionality
- Report history and storage
- Comparison with previous audits
- Integration with vessel management systems
- Multi-language support
- Offline report generation capabilities

## Support

For issues or questions, please refer to the main repository documentation or contact the development team.
