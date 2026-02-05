create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references categories(id) on delete set null,
  price_per_kg_cents int not null,
  cost_per_kg_cents int,
  margin_pct numeric,
  stock_grams int not null default 0,
  reorder_point_grams int,
  image_url text,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null default 'pending',
  subtotal_cents int not null,
  shipping_cents int not null default 0,
  total_cents int not null,
  address_json jsonb,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  weight_grams int not null,
  unit_price_cents int not null,
  line_total_cents int not null
);

create table if not exists finance_boxes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  box_key text not null,
  amount_cents int not null,
  created_at timestamptz default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_finance_boxes_order on finance_boxes(order_id);
