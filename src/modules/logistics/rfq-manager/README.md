# RFX & RFQ Request Module

**PATCH 635** - Gestão de requisições técnicas e comerciais integrada

## Overview

The RFX & RFQ Request Module provides comprehensive management of procurement requests, quotations, and supplier relationships with integration to maintenance and supply chain systems.

## Features

### 📤 RFX Creation & Management
- Support for RFQ, RFP, RFI, and RFT types
- Detailed item specifications
- Technical and commercial requirements
- Budget estimation and tracking

### 🔄 Approval Workflow
- Multi-level approval process
- Role-based authorization
- Approval history tracking
- Automated notifications

### 🧾 Quotation Management
- Supplier quotation tracking
- Comparative analysis
- Evaluation criteria weighting
- Award recommendation

### 💬 Supplier Communication
- Communication history
- Email integration
- Meeting notes
- Document exchange

### 📦 Integration
- Maintenance system integration
- Inventory management
- Purchase order generation
- Delivery tracking

### 📄 Export Capabilities
- JSON export for data integration
- PDF report generation
- Quotation comparison reports
- Award documentation

## RFX Types

1. **RFQ (Request for Quotation)** - Price-focused procurement
2. **RFP (Request for Proposal)** - Comprehensive solution requests
3. **RFI (Request for Information)** - Market research and supplier capabilities
4. **RFT (Request for Tender)** - Formal bidding process

## Workflow

```
Draft → Approval → Published → Bidding → Review → Award → Closed
```

## Database Schema

### Tables
- `rfx_requests` - Main RFX records
- `rfx_items` - Line items per request
- `rfx_specifications` - Technical specifications
- `quotations` - Supplier quotations
- `quotation_items` - Quotation line items
- `suppliers` - Supplier directory
- `supplier_communications` - Communication history
- `approval_workflows` - Approval tracking
- `purchase_orders` - Generated POs

## File Structure

```
src/modules/logistics/rfq-manager/
├── types.ts              # Type definitions
├── rfx-service.ts        # RFX management (to be created)
├── quotation-service.ts  # Quotation management (to be created)
├── supplier-service.ts   # Supplier management (to be created)
├── export-service.ts     # Export functionality (to be created)
└── README.md             # This file
```

## Usage

### Creating an RFX

```typescript
import { RFXRequest } from '@/modules/logistics/rfq-manager/types';

const rfx: RFXRequest = {
  rfx_type: "RFQ",
  title: "Spare Parts for Main Engine",
  category: "spare_parts",
  priority: "high",
  items: [
    {
      item_number: "001",
      description: "Piston Ring Set",
      quantity: 4,
      unit: "set",
      part_number: "PRN-1234"
    }
  ],
  submission_deadline: "2025-12-01",
  // ...
};
```

## Evaluation Criteria

Quotations are evaluated based on weighted criteria:
- Price (customizable weight)
- Quality (customizable weight)
- Delivery Time (customizable weight)
- Supplier Reputation (customizable weight)
- Warranty (customizable weight)

Total weight must equal 100%

## Approval Levels

1. **Department Manager** - Initial approval
2. **Finance** - Budget verification
3. **Procurement** - Supplier validation
4. **Executive** - Final approval (high-value items)

## Integration Points

### Maintenance Module
- Create RFX from maintenance work orders
- Link spare parts to equipment
- Track procurement for planned maintenance

### Supply Chain
- Inventory levels
- Reorder points
- Stock allocation

### Financial System
- Budget tracking
- Purchase order generation
- Invoice matching

## References

- ISO 9001:2015 - Quality Management
- Procurement Best Practices
- Supply Chain Management Standards

---

**Version**: 1.0.0  
**Patch**: 635  
**Status**: 🚧 In Development  
**Last Updated**: 2025-11-04
