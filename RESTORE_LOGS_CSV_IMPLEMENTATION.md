# Restore Logs Page - CSV Export and Direct Links Implementation

## 📋 Overview

This document describes the implementation of the Restore Logs page enhancements, including CSV export functionality and direct links to documents.

## ✅ Features Implemented

### 1. CSV Export Functionality
- **Export Button**: Added "📤 Exportar CSV" button with outline variant
- **CSV Format**: 
  - Headers: `Documento,Versão Restaurada,Restaurado por,Data`
  - Date format: `dd/MM/yyyy HH:mm`
  - Encoding: UTF-8
- **Client-side Generation**: Uses Blob API for instant downloads
- **Filtered Data**: Exports only the currently filtered logs

### 2. Direct Links to Documents
- **Clickable Document IDs**: Each document ID is now a link
- **Route**: Links to `/admin/documents/view/{document_id}`
- **Styling**: Blue underlined links (`underline text-blue-600 hover:text-blue-800`)
- **SPA Navigation**: Uses React Router's Link component

### 3. Improved Layout
- **Flex Layout**: Changed from `max-w-sm` to `flex gap-4 items-center`
- **Better Alignment**: Filter input and export button are now properly aligned

## 📁 Files Modified

### 1. Main Component
**File**: `src/pages/admin/documents/restore-logs.tsx`

**Changes**:
- Added Button and Link imports
- Implemented `exportCSV()` function
- Updated UI layout with flex styling
- Added clickable links for document IDs

### 2. Tests
**File**: `src/tests/pages/admin/documents/restore-logs.test.tsx`

**New Tests**:
- CSV export button rendering
- Document links rendering
- All tests passing (9/9)

## 🔌 Database Requirements

### RPC Function
The page depends on the `get_restore_logs_with_profiles` RPC function in Supabase.

**Migration File**: `supabase/migrations/20251011140958_create_document_restore_logs.sql`

**Function Definition**:
```sql
CREATE OR REPLACE FUNCTION public.get_restore_logs_with_profiles()
RETURNS TABLE (
  id UUID,
  document_id UUID,
  version_id UUID,
  restored_by UUID,
  restored_at TIMESTAMP WITH TIME ZONE,
  email TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    r.id,
    r.document_id,
    r.version_id,
    r.restored_by,
    r.restored_at,
    p.email
  FROM public.document_restore_logs r
  LEFT JOIN public.profiles p ON r.restored_by = p.id
  ORDER BY r.restored_at DESC;
$$;
```

**View Definition** (alternative approach mentioned in problem statement):
```sql
CREATE OR REPLACE VIEW get_restore_logs_with_profiles AS
SELECT
  r.*,
  p.email
FROM document_restore_logs r
LEFT JOIN profiles p ON r.restored_by = p.id;
```

## 🎯 Code Example

### CSV Export Function
```typescript
function exportCSV() {
  const csvContent =
    "Documento,Versão Restaurada,Restaurado por,Data\n" +
    filteredLogs
      .map((log) =>
        [
          log.document_id,
          log.version_id,
          log.email,
          format(new Date(log.restored_at), "dd/MM/yyyy HH:mm"),
        ].join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "restore-logs.csv";
  a.click();
  URL.revokeObjectURL(url);
}
```

### Document Link
```tsx
<Link
  to={`/admin/documents/view/${log.document_id}`}
  className="underline text-blue-600 hover:text-blue-800"
>
  {log.document_id}
</Link>
```

## 🧪 Testing

All tests passing:
```bash
npm test -- src/tests/pages/admin/documents/restore-logs.test.tsx
```

**Test Coverage**:
- Page title rendering
- Email filter input
- Restore logs display
- Email filtering functionality
- Date formatting
- All required fields display
- CSV export button rendering
- Document links rendering

## 🚀 Usage

1. **Access Page**: Navigate to `/admin/documents/restore-logs`
2. **Filter Logs**: Use email filter to narrow down results
3. **Export CSV**: Click "📤 Exportar CSV" button to download
4. **View Document**: Click on any document ID to view details

## 📝 Notes

- CSV export works entirely client-side (no server request)
- Document links use SPA navigation (no page reload)
- Filter is applied to CSV export (only filtered data is exported)
- Date formatting uses `date-fns` library
- All components use existing UI library (@/components/ui)

## ✨ Benefits

1. **Audit Trail Export**: Easy CSV export for compliance and auditing
2. **Quick Navigation**: Direct links save time when reviewing documents
3. **Responsive Design**: Improved layout works on all screen sizes
4. **Performance**: Client-side processing for instant results
5. **User Friendly**: Intuitive interface with clear visual feedback
