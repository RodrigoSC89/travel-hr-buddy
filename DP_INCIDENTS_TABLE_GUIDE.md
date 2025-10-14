# DP Incidents Table - Implementation Guide

## Overview

The `dp_incidents` table has been successfully created to store Dynamic Positioning (DP) incidents from IMCA and other maritime safety sources.

## Table Structure

### Migration File
- **File**: `supabase/migrations/20251014195449_create_dp_incidents_table.sql`
- **Status**: ✅ Created and committed

### Schema

```sql
CREATE TABLE public.dp_incidents (
  id TEXT PRIMARY KEY,              -- Ex: 'imca-2025-014'
  title TEXT NOT NULL,              -- Incident title
  date DATE NOT NULL,               -- Incident date
  vessel TEXT,                      -- Vessel name/ID
  location TEXT,                    -- Geographic location
  root_cause TEXT,                  -- Root cause analysis
  class_dp TEXT,                    -- DP Classification (DP1/DP2/DP3)
  source TEXT,                      -- Data source (IMCA, etc)
  link TEXT,                        -- Link to original report
  summary TEXT,                     -- Detailed summary
  tags TEXT[],                      -- Keywords array
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Security (RLS)

Row Level Security is enabled with the following policy:
- **Policy**: "Allow read access to authenticated users"
- **Rule**: Only authenticated users can read incidents
- **Scope**: SELECT operations only

## Performance Indexes

Six indexes have been created for optimized queries:

1. **idx_dp_incidents_date** - Date queries (DESC order)
2. **idx_dp_incidents_vessel** - Filter by vessel
3. **idx_dp_incidents_tags** - GIN index for array searches
4. **idx_dp_incidents_created_at** - Recent incidents (DESC order)
5. **idx_dp_incidents_class_dp** - Filter by DP class
6. **idx_dp_incidents_source** - Filter by data source

## Usage Examples

### Insert a new incident
```typescript
const { data, error } = await supabase
  .from('dp_incidents')
  .insert({
    id: 'imca-2025-014',
    title: 'Loss of Position During Well Operations',
    date: '2025-01-15',
    vessel: 'MV Ocean Explorer',
    location: 'North Sea',
    root_cause: 'Thruster failure',
    class_dp: 'DP2',
    source: 'IMCA',
    link: 'https://www.imca-int.com/...',
    summary: 'Vessel experienced loss of position...',
    tags: ['thruster', 'loss-of-position', 'well-operations']
  });
```

### Query incidents by date range
```typescript
const { data, error } = await supabase
  .from('dp_incidents')
  .select('*')
  .gte('date', '2025-01-01')
  .lte('date', '2025-12-31')
  .order('date', { ascending: false });
```

### Filter by vessel
```typescript
const { data, error } = await supabase
  .from('dp_incidents')
  .select('*')
  .eq('vessel', 'MV Ocean Explorer');
```

### Search by tags
```typescript
const { data, error } = await supabase
  .from('dp_incidents')
  .select('*')
  .contains('tags', ['thruster']);
```

### Filter by DP class
```typescript
const { data, error } = await supabase
  .from('dp_incidents')
  .select('*')
  .eq('class_dp', 'DP2');
```

## Use Cases

This table enables the system to:

1. **Store incidents** obtained via API/crawler from IMCA and other sources
2. **Filter and query** by:
   - Date range
   - Vessel name
   - Location
   - DP classification
   - Root cause
   - Source
   - Tags/keywords
3. **AI Assistant integration** - Serve as knowledge base for incident explanations and learning
4. **Visualizations**:
   - Timeline of incidents
   - Dashboard with statistics
   - Geographic map of incident locations
   - Trend analysis by root cause
5. **Reporting** - Generate compliance and safety reports

## Next Steps

To fully utilize this table, consider implementing:

1. **API/Crawler Integration**
   - Create Supabase Edge Functions to fetch IMCA incidents
   - Schedule periodic data synchronization

2. **Frontend Components**
   - Incident list view with filters
   - Incident detail page
   - Timeline visualization
   - Map view for geographic distribution

3. **AI Assistant Features**
   - Query incidents by natural language
   - Explain root causes and prevention measures
   - Suggest similar incidents for learning

4. **Analytics Dashboard**
   - Incident trends over time
   - Most common root causes
   - Vessel safety scores
   - DP class comparison

## Testing

To test the migration locally with Supabase:

```bash
# Apply migration
supabase db push

# Or reset and reapply all migrations
supabase db reset
```

## Documentation

- Table and all columns have descriptive comments in Portuguese
- Comments are visible in Supabase Studio and via SQL queries
- Use `\d+ public.dp_incidents` in psql to view full table description

## Support

For questions or issues related to this table:
- Check Supabase documentation: https://supabase.com/docs
- Review IMCA guidelines: https://www.imca-int.com/
- Contact system administrator

---

**Migration Version**: 20251014195449  
**Created**: 2025-10-14  
**Status**: ✅ Ready for deployment
