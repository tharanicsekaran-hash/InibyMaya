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

-- Enable Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.reels enable row level security;
alter table public.promos enable row level security;
alter table public.orders enable row level security;

-- Setup RLS Policies

-- Customers Profiles Policies
create policy "Allow public read access to customers" on public.customers 
  for select using (true);
create policy "Allow users to update their own customer profile" on public.customers 
  for update using (auth.uid() = id);

-- Products Catalog Policies
create policy "Allow public read access to products" on public.products 
  for select using (true);
create policy "Allow write access to products for administrators" on public.products 
  for all using (auth.jwt() ->> 'email' = 'tharanichandrasekaran2000@gmail.com');

-- Reels Banner Policies
create policy "Allow public read access to reels" on public.reels 
  for select using (true);
create policy "Allow write access to reels for administrators" on public.reels 
  for all using (auth.jwt() ->> 'email' = 'tharanichandrasekaran2000@gmail.com');

-- Promo Coupon Policies
create policy "Allow public read access to promos" on public.promos 
  for select using (true);
create policy "Allow write access to promos for administrators" on public.promos 
  for all using (auth.jwt() ->> 'email' = 'tharanichandrasekaran2000@gmail.com');

-- Orders Transactions Policies
create policy "Allow users to read their own orders" on public.orders 
  for select using (auth.uid() = user_id or auth.jwt() ->> 'email' = 'tharanichandrasekaran2000@gmail.com');
create policy "Allow authenticated users to insert orders" on public.orders 
  for insert with check (auth.uid() = user_id);
create policy "Allow write access to orders for administrators" on public.orders 
  for update using (auth.jwt() ->> 'email' = 'tharanichandrasekaran2000@gmail.com');

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

-- Enable RLS for Testimonials
alter table public.testimonials enable row level security;

-- Testimonials RLS Policies
create policy "Allow public read access to testimonials" on public.testimonials 
  for select using (true);
create policy "Allow write access to testimonials for administrators" on public.testimonials 
  for all using (auth.jwt() ->> 'email' = 'tharanichandrasekaran2000@gmail.com');

-- 7. Create Settings Table (Boutique Configs)
create table public.settings (
  key text primary key,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Settings
alter table public.settings enable row level security;

-- Settings RLS Policies
create policy "Allow public read access to settings" on public.settings 
  for select using (true);
create policy "Allow write access to settings for administrators" on public.settings 
  for all using (auth.jwt() ->> 'email' = 'tharanichandrasekaran2000@gmail.com');

-- Seed Initial Boutique Settings
insert into public.settings (key, value) values 
('description', 'High-end Indian traditional wear and bespoke custom-tailored apparel for special celebrations and elegant daily comfort.'),
('email', 'care@inibymaya.com'),
('phone', '+91 98765 43210'),
('address', '14, Ground Floor, Linen Road, Jubilee Hills, Hyderabad - 500033'),
('hours', 'Mon - Sat: 10:00 AM - 07:00 PM IST')
on conflict (key) do update set value = excluded.value;
