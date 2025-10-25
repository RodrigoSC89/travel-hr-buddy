-- PATCH 111.0: Inventory & Supply Management
-- Create inventory_items table for stock, supplies, and logistics tracking

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity integer not null default 0,
  unit text not null,
  category text,
  vessel_id uuid references vessels(id) on delete cascade,
  last_updated timestamptz default now(),
  critical boolean default false,
  min_threshold integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_inventory_items_vessel_id on inventory_items(vessel_id);
create index if not exists idx_inventory_items_category on inventory_items(category);
create index if not exists idx_inventory_items_critical on inventory_items(critical);

-- Enable Row Level Security
alter table inventory_items enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read inventory items"
  on inventory_items for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert inventory items"
  on inventory_items for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update inventory items"
  on inventory_items for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete inventory items"
  on inventory_items for delete
  to authenticated
  using (true);

-- Create function to update updated_at timestamp
create or replace function update_inventory_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for automatic timestamp update
create trigger inventory_items_updated_at
  before update on inventory_items
  for each row
  execute function update_inventory_items_updated_at();

-- Insert sample data for testing
insert into inventory_items (name, quantity, unit, category, vessel_id, critical, min_threshold, notes)
select
  'Diesel Fuel',
  45000,
  'liters',
  'Fuel',
  v.id,
  true,
  10000,
  'Primary fuel supply'
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into inventory_items (name, quantity, unit, category, vessel_id, critical, min_threshold, notes)
select
  'Safety Vests',
  120,
  'units',
  'Safety Equipment',
  v.id,
  true,
  50,
  'Life-saving equipment'
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into inventory_items (name, quantity, unit, category, vessel_id, critical, min_threshold, notes)
select
  'Hydraulic Oil',
  850,
  'liters',
  'Maintenance',
  v.id,
  false,
  200,
  'Engine maintenance supply'
from vessels v
where v.imo_code = 'IMO9234567'
limit 1
on conflict do nothing;

insert into inventory_items (name, quantity, unit, category, critical, min_threshold)
values
  ('Emergency Flares', 24, 'units', 'Safety Equipment', null, true, 12),
  ('Rope (Various)', 500, 'meters', 'Deck Supplies', null, false, 100),
  ('Medical Supplies - First Aid', 15, 'kits', 'Medical', null, true, 5),
  ('Cleaning Supplies', 80, 'units', 'General', null, false, 20)
on conflict do nothing;

-- Create view for critical inventory status
create or replace view inventory_critical_status as
select 
  ii.id,
  ii.name,
  ii.quantity,
  ii.unit,
  ii.category,
  ii.min_threshold,
  ii.critical,
  v.name as vessel_name,
  v.imo_code,
  case 
    when ii.quantity <= ii.min_threshold then 'critical_low'
    when ii.quantity <= (ii.min_threshold * 1.5) then 'low'
    else 'sufficient'
  end as stock_status,
  ii.last_updated
from inventory_items ii
left join vessels v on ii.vessel_id = v.id
where ii.critical = true or ii.quantity <= ii.min_threshold
order by 
  case 
    when ii.quantity <= ii.min_threshold then 1
    when ii.quantity <= (ii.min_threshold * 1.5) then 2
    else 3
  end;
