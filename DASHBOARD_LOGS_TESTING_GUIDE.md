# Dashboard Logs - Testing & Validation Guide

## 🧪 Testing Checklist

### Database Layer

#### Migration Testing
- [ ] Run migration: `supabase db reset` or `supabase migration up`
- [ ] Verify table exists:
  ```sql
  SELECT * FROM information_schema.tables 
  WHERE table_name = 'dashboard_report_logs';
  ```
- [ ] Check columns:
  ```sql
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'dashboard_report_logs';
  ```
- [ ] Verify indexes:
  ```sql
  SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename = 'dashboard_report_logs';
  ```

#### RLS Policy Testing
- [ ] Test admin can view logs (as admin user)
  ```sql
  SELECT * FROM dashboard_report_logs LIMIT 10;
  ```
- [ ] Test non-admin cannot view logs (as regular user)
  ```sql
  -- Should return no rows or error
  SELECT * FROM dashboard_report_logs LIMIT 10;
  ```
- [ ] Test service role can insert:
  ```sql
  INSERT INTO dashboard_report_logs (status, email, message)
  VALUES ('success', 'test@example.com', 'Test log');
  ```

### Frontend Component Testing

#### Page Access
- [ ] Navigate to `/admin/reports/dashboard-logs`
- [ ] Verify page loads without errors
- [ ] Check console for errors (should be clean)
- [ ] Verify admin-only access (non-admins redirected)

#### UI Components
- [ ] Header displays "📄 Logs de Envio de Dashboard"
- [ ] Back button appears and is clickable
- [ ] Export button appears
- [ ] Filter inputs render correctly
- [ ] Summary cards show correct counts
- [ ] Table displays with correct columns

#### Loading States
- [ ] Initial load shows spinner
- [ ] Spinner disappears after data loads
- [ ] No flickering or layout shifts

#### Empty State
- [ ] Clear all filters
- [ ] If no logs exist, "Nenhum log encontrado" appears
- [ ] Empty state is centered and clear

### Filtering Functionality

#### Status Filter
- [ ] Enter "success" → only success logs shown
- [ ] Enter "error" → only error logs shown
- [ ] Enter "invalid" → no logs shown
- [ ] Clear filter → all logs shown
- [ ] Filter applies automatically (no button needed)

#### Date Range Filter
- [ ] Set start date only → logs from that date forward
- [ ] Set end date only → logs up to that date
- [ ] Set both → logs within range
- [ ] Set start > end → should still work (no validation)
- [ ] Clear dates → all logs shown

#### Combined Filters
- [ ] Status + date range works correctly
- [ ] All three filters work together
- [ ] Clearing one filter updates results
- [ ] Summary cards update with filters

### Data Display

#### Table Rendering
- [ ] Logs sorted by date (most recent first)
- [ ] Dates formatted as DD/MM/YYYY HH:mm
- [ ] Status badges show correct colors
- [ ] Email addresses display correctly
- [ ] Messages truncated if too long
- [ ] Hover shows full message in tooltip

#### Summary Cards
- [ ] Total count matches visible logs
- [ ] Success count accurate (green)
- [ ] Error count accurate (red)
- [ ] Counts update with filters

### Export Functionality

#### CSV Export
- [ ] Click "Exportar CSV" button
- [ ] File downloads immediately
- [ ] Filename includes timestamp
- [ ] CSV contains correct headers
- [ ] CSV contains all filtered data
- [ ] UTF-8 encoding works (special characters display)
- [ ] Commas in data handled correctly
- [ ] Opens correctly in Excel/Google Sheets

#### Export Edge Cases
- [ ] Export with no data shows error toast
- [ ] Export with filters exports filtered data only
- [ ] Export with 100+ logs works
- [ ] Large messages don't break CSV format

### Backend Integration

#### Log Creation
- [ ] Trigger send-dashboard-report function
- [ ] Verify logs created in database
- [ ] Check success logs have correct status
- [ ] Check error logs have correct status
- [ ] Verify email field populated
- [ ] Verify message field populated
- [ ] Verify executed_at timestamp correct

#### Edge Function Testing
- [ ] Run function manually via Supabase dashboard
- [ ] Check function logs for errors
- [ ] Verify database inserts complete
- [ ] Test with multiple recipients
- [ ] Test with email failures

### Responsive Design

#### Desktop (> 1024px)
- [ ] Filters display in single row
- [ ] Summary cards in 3 columns
- [ ] Table fully visible without scroll
- [ ] Export button in header

#### Tablet (768px - 1024px)
- [ ] Filters may wrap but still functional
- [ ] Summary cards in 2-3 columns
- [ ] Table scrolls horizontally if needed

#### Mobile (< 768px)
- [ ] Filters stack vertically
- [ ] Summary cards stack (1 per row)
- [ ] Table scrolls horizontally
- [ ] All features remain accessible

### Error Handling

#### Network Errors
- [ ] Disconnect network → shows error toast
- [ ] Reconnect → can retry
- [ ] Error message is user-friendly

#### Database Errors
- [ ] Invalid query → shows error toast
- [ ] Permission denied → appropriate message
- [ ] No data → empty state displays

#### Edge Cases
- [ ] Very long email addresses display correctly
- [ ] Very long messages truncate properly
- [ ] Special characters in data render correctly
- [ ] Null values handled gracefully

### Performance Testing

#### Load Time
- [ ] Initial page load < 2 seconds
- [ ] Filter application < 500ms
- [ ] Table render smooth (no jank)

#### Large Datasets
- [ ] Test with 100 logs (current limit)
- [ ] Test with many filtered results
- [ ] Test with long messages
- [ ] Scroll performance smooth

#### Memory
- [ ] No memory leaks on repeated navigation
- [ ] No memory leaks on repeated filtering
- [ ] Browser console clean (no warnings)

### Accessibility

#### Keyboard Navigation
- [ ] Tab through all inputs
- [ ] Enter in input applies filter
- [ ] Export button accessible via keyboard
- [ ] Back button accessible via keyboard

#### Screen Readers
- [ ] Labels announced correctly
- [ ] Status badges announced
- [ ] Table structure understandable
- [ ] Loading states announced

#### Visual
- [ ] Color contrast meets WCAG AA
- [ ] Text readable at all sizes
- [ ] Icons have meaning without color

### Security Testing

#### Authentication
- [ ] Non-authenticated users redirected
- [ ] Regular users cannot access (if not admin)
- [ ] Admin users can access

#### Authorization
- [ ] RLS policies enforced at database level
- [ ] Cannot access other users' private data
- [ ] Service role required for inserts

#### Data Validation
- [ ] No SQL injection possible in filters
- [ ] No XSS in displayed data
- [ ] No sensitive data exposed in logs

## 🎯 Automated Testing

### Unit Tests
```typescript
describe('DashboardLogs', () => {
  it('renders without crashing', () => {
    render(<DashboardLogs />)
  })

  it('displays loading state initially', () => {
    render(<DashboardLogs />)
    expect(screen.getByText('Carregando logs...')).toBeInTheDocument()
  })

  it('applies status filter correctly', async () => {
    render(<DashboardLogs />)
    const input = screen.getByPlaceholderText('Status (success/error)')
    fireEvent.change(input, { target: { value: 'error' } })
    // Assert filtered results
  })

  it('exports CSV when button clicked', async () => {
    render(<DashboardLogs />)
    const button = screen.getByText('Exportar CSV')
    fireEvent.click(button)
    // Assert CSV download triggered
  })
})
```

### Integration Tests
```typescript
describe('DashboardLogs Integration', () => {
  it('fetches logs from Supabase', async () => {
    // Mock Supabase client
    // Render component
    // Wait for data to load
    // Assert data displayed
  })

  it('filters logs by date range', async () => {
    // Setup test data
    // Apply date filters
    // Assert correct logs shown
  })
})
```

### E2E Tests
```typescript
describe('DashboardLogs E2E', () => {
  it('complete user flow', async () => {
    // Navigate to page
    // Apply filters
    // Verify results
    // Export CSV
    // Verify download
  })
})
```

## 📊 Test Data Setup

### Sample SQL for Testing
```sql
-- Insert test success logs
INSERT INTO dashboard_report_logs (status, email, message)
VALUES 
  ('success', 'user1@example.com', 'Dashboard report sent successfully'),
  ('success', 'user2@example.com', 'Dashboard report sent successfully'),
  ('success', 'user3@example.com', 'Dashboard report sent successfully');

-- Insert test error logs
INSERT INTO dashboard_report_logs (status, email, message)
VALUES 
  ('error', 'invalid@example.com', 'Failed to send email: Invalid API key'),
  ('error', 'failed@example.com', 'Failed to send email: Network timeout');

-- Insert logs with various dates
INSERT INTO dashboard_report_logs (executed_at, status, email, message)
VALUES 
  (NOW() - INTERVAL '1 day', 'success', 'test1@example.com', 'Test log 1'),
  (NOW() - INTERVAL '7 days', 'success', 'test2@example.com', 'Test log 2'),
  (NOW() - INTERVAL '30 days', 'error', 'test3@example.com', 'Test error');
```

## 🔍 Common Issues & Solutions

### Issue: No logs showing
**Check:**
- [ ] User is admin
- [ ] RLS policies correct
- [ ] Database migration applied
- [ ] Edge function has run at least once

### Issue: Filter not working
**Check:**
- [ ] Network tab for API calls
- [ ] Console for errors
- [ ] Filter values correct format
- [ ] Date format YYYY-MM-DD

### Issue: CSV export fails
**Check:**
- [ ] Logs array not empty
- [ ] Browser allows downloads
- [ ] No popup blocker active
- [ ] Console for errors

### Issue: Permission denied
**Check:**
- [ ] User role in profiles table
- [ ] RLS policies enabled
- [ ] Service role key configured
- [ ] Auth session valid

## ✅ Final Validation

### Pre-deployment Checklist
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing complete
- [ ] Documentation reviewed
- [ ] Database migration tested
- [ ] RLS policies verified
- [ ] Edge function logs checked
- [ ] Performance acceptable
- [ ] Accessibility validated
- [ ] Security reviewed

### Post-deployment Checklist
- [ ] Page accessible in production
- [ ] Logs being created correctly
- [ ] Filters working in production
- [ ] Export working in production
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Monitor for errors (first 24h)

---

**Testing completed**: [ ]  
**Tested by**: ___________  
**Date**: ___________  
**Environment**: [ ] Local [ ] Staging [ ] Production  
**Issues found**: ___________
