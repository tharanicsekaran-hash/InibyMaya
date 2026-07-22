-- INIBYMAYA COUTURE - SUPABASE DATABASE SCHEMA SETUP
-- Copy and paste this complete script in the SQL Editor of your Supabase dashboard.

-- 1. Create Customers Profile Table
create table public.customers (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Products Table (Couture Inventory)
create table public.products (
  id text primary key,
  title text not null,
  category text not null,
  price numeric not null,
  rating numeric default 5.0,
  reviews_count integer default 1,
  description text not null,
  details jsonb default '[]'::jsonb,
  images jsonb not null,
  variants jsonb not null,
  customizable boolean default true,
  best_seller boolean default false,
  occasion text default 'Daily Elegance',
  highlights jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Reels Table (Homepage Fashion Loops)
create table public.reels (
  id text primary key,
  title text not null,
  video_url text not null,
  product_id text references public.products(id) on delete set null,
  product_title text,
  product_price numeric,
  product_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Coupons Table (Store Promo Codes)
create table public.promos (
  code text primary key,
  type text not null,
  value numeric not null,
  min_purchase numeric default 0,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Orders Table (Couture Transactions)
create table public.orders (
  id text primary key,
  user_id uuid references auth.users on delete set null,
  items jsonb not null,
  shipping_details jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  shipping numeric default 0,
  total numeric not null,
  payment_id text,
  status text default 'Placed',
  tracking_number text,
  notes text default '',
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable Row Level Security (RLS) to ensure fully interactive public database connectivity
-- (Lets users place orders, tracks custom coordinates, and updates statistics synchronously)
alter table public.customers disable row level security;
alter table public.products disable row level security;
alter table public.reels disable row level security;
alter table public.promos disable row level security;
alter table public.orders disable row level security;

-- Automatic Customer Profile Creation Trigger
-- This function automatically creates a record in public.customers when a new user registers through Supabase auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.customers (id, email, name)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Create Testimonials Table (Customer Showcase Reviews)
create table public.testimonials (
  id text primary key,
  name text not null,
  image_url text,
  quote text not null,
  rating integer default 5,
  tag text default 'HAY!',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS for Testimonials to support local admin additions
alter table public.testimonials disable row level security;

-- Enable Realtime for orders, testimonials, and products tables
-- REPLICA IDENTITY FULL is required so DELETE events include the full old row.
-- The supabase_realtime publication tells Supabase to broadcast changes for these tables.
alter table public.orders replica identity full;
alter table public.testimonials replica identity full;
alter table public.products replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'testimonials'
  ) then
    alter publication supabase_realtime add table public.testimonials;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end $$;

-- 7. Create Settings Table (Boutique Configs)
create table public.settings (
  key text primary key,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS for Settings
alter table public.settings disable row level security;

-- Seed Initial Boutique Settings
insert into public.settings (key, value) values 
('description', 'High-end Indian traditional wear and bespoke custom-tailored apparel for special celebrations and elegant daily comfort.'),
('email', 'care@inibymaya.com'),
('phone', '+91 98765 43210'),
('address', '14, Ground Floor, Linen Road, Jubilee Hills, Hyderabad - 500033'),
('hours', 'Mon - Sat: 10:00 AM - 07:00 PM IST')
on conflict (key) do update set value = excluded.value;
