# SGSO History Panel - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Apply Database Migrations

```bash
# Connect to your Supabase project
supabase migration up 20251018000000_create_sgso_action_plans
supabase migration up 20251018000001_insert_sample_sgso_data
```

### 2. Access the Admin Panel

Navigate to:
```
/admin/sgso/history/DP Shuttle Tanker X
```

Or programmatically:
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate(`/admin/sgso/history/${vesselId}`);
```

### 3. Use the API

```javascript
// Fetch action plans for a vessel
const response = await fetch('/api/sgso/history/DP Shuttle Tanker X');
const result = await response.json();

if (result.success) {
  console.log('Action Plans:', result.data);
}
```

### 4. Use the Component

```tsx
import { SGSOHistoryTable } from '@/components/sgso';

function MyPage() {
  const [actionPlans, setActionPlans] = useState([]);

  useEffect(() => {
    fetch('/api/sgso/history/MY_VESSEL')
      .then(res => res.json())
      .then(data => {
        if (data.success) setActionPlans(data.data);
      });
  }, []);

  return (
    <SGSOHistoryTable 
      actionPlans={actionPlans}
      onEdit={(id) => console.log('Edit:', id)}
    />
  );
}
```

## 📊 Understanding the Status Flow

```
🔴 Aberto (Open)
   ↓
🟡 Em Andamento (In Progress)
   ↓
🟢 Resolvido (Resolved)
```

## 🎯 Key Features

### For Users
- ✅ View all action plans by vessel
- ✅ Expand rows to see details
- ✅ Filter by status
- ✅ See approval information

### For Developers
- ✅ RESTful API endpoint
- ✅ TypeScript types included
- ✅ Comprehensive test coverage
- ✅ Easy to integrate

### For Auditors
- ✅ Complete audit trail
- ✅ Timestamped records
- ✅ Documented approvals
- ✅ Risk level tracking

## 🔧 Common Tasks

### Create a New Action Plan

```javascript
const newPlan = {
  incident_id: 'uuid-of-incident',
  vessel_id: 'DP Shuttle Tanker X',
  correction_action: 'Immediate corrective action...',
  prevention_action: 'Preventive measures...',
  recommendation_action: 'Recommendations...',
  status: 'aberto',
  approved_by: null,
  approved_at: null
};

const { data, error } = await supabase
  .from('sgso_action_plans')
  .insert([newPlan]);
```

### Update Status

```javascript
const { data, error } = await supabase
  .from('sgso_action_plans')
  .update({ 
    status: 'em_andamento',
    approved_by: 'João Silva - Safety Manager',
    approved_at: new Date().toISOString()
  })
  .eq('id', planId);
```

### Query by Vessel

```javascript
const { data, error } = await supabase
  .from('sgso_action_plans')
  .select(`
    *,
    incident:dp_incidents(*)
  `)
  .eq('vessel_id', vesselId)
  .order('created_at', { ascending: false });
```

## 📈 Sample Data

The system includes 3 sample action plans:

1. **Open Plan** - Critical gyro drift incident
2. **In Progress Plan** - Software failure being fixed
3. **Resolved Plan** - PMS configuration corrected

## 🧪 Testing

### Run Tests
```bash
# All SGSO history tests
npm test -- sgso-history

# API tests only
npm test -- sgso-history-api

# Component tests only
npm test -- SGSOHistoryTable

# All tests
npm test
```

## 📝 Common Patterns

### Loading State
```tsx
const [loading, setLoading] = useState(true);
const [plans, setPlans] = useState([]);

useEffect(() => {
  setLoading(true);
  fetch(`/api/sgso/history/${vesselId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) setPlans(data.data);
    })
    .finally(() => setLoading(false));
}, [vesselId]);

return loading ? <Spinner /> : <SGSOHistoryTable actionPlans={plans} />;
```

### Error Handling
```tsx
const [error, setError] = useState(null);

try {
  const res = await fetch(`/api/sgso/history/${vesselId}`);
  const data = await res.json();
  
  if (!data.success) {
    setError(data.error);
  }
} catch (err) {
  setError('Failed to fetch action plans');
}
```

### Filtering by Status
```tsx
const openPlans = plans.filter(p => p.status === 'aberto');
const inProgressPlans = plans.filter(p => p.status === 'em_andamento');
const resolvedPlans = plans.filter(p => p.status === 'resolvido');
```

## 🎨 Customization

### Custom Status Colors
```tsx
// Modify in SGSOHistoryTable.tsx
const getStatusBadge = (status: string) => {
  switch (status) {
    case "aberto":
      return <Badge variant="destructive">Custom Open</Badge>;
    // ... customize others
  }
};
```

### Custom Empty State
```tsx
<SGSOHistoryTable 
  actionPlans={plans}
  renderEmpty={() => (
    <div>Custom empty state message</div>
  )}
/>
```

## 🔍 Troubleshooting

### "No action plans found"
- ✅ Check vessel ID spelling
- ✅ Verify vessel has incidents
- ✅ Check RLS policies are enabled

### API returns 400
- ✅ Verify vessel ID is not empty
- ✅ Check URL encoding for spaces
- ✅ Validate request format

### Component not rendering
- ✅ Check actionPlans prop is array
- ✅ Verify imports are correct
- ✅ Check console for errors

## 📚 More Information

- **Full Documentation:** [SGSO_HISTORY_PANEL_IMPLEMENTATION.md](./SGSO_HISTORY_PANEL_IMPLEMENTATION.md)
- **Visual Guide:** [SGSO_HISTORY_VISUAL_SUMMARY.md](./SGSO_HISTORY_VISUAL_SUMMARY.md)
- **API Tests:** [src/tests/sgso-history-api.test.ts](./src/tests/sgso-history-api.test.ts)
- **Component Tests:** [src/tests/components/sgso/SGSOHistoryTable.test.tsx](./src/tests/components/sgso/SGSOHistoryTable.test.tsx)

## 🤝 Need Help?

1. Check the documentation
2. Review test files for examples
3. Examine API response structure
4. Test with sample data

---

**Happy Coding!** 🚀
