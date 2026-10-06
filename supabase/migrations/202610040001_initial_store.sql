create extension if not exists pgcrypto;
create sequence if not exists public.order_number_seq;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text, last_name text, phone text, email text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  description text, image_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id),
  name text not null, slug text not null unique, sku text not null unique, brand text not null,
  description text not null, short_description text not null, price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0), warranty text,
  specifications jsonb not null default '{}'::jsonb, is_active boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null, alt_text text, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table public.carts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.cart_items (
  id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id), quantity integer not null check(quantity between 1 and 25),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(cart_id, product_id)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique, email text not null, phone text not null,
  first_name text not null, last_name text not null,
  status text not null default 'Pending' check(status in ('Pending','Confirmed','Processing','Ready for Delivery','Shipped','Delivered','Cancelled')),
  payment_status text not null default 'Pending' check(payment_status in ('Pending','Paid','Failed','Refunded')),
  subtotal integer not null check(subtotal >= 0), delivery_fee integer not null check(delivery_fee >= 0), total integer not null check(total = subtotal + delivery_fee),
  shipping_address text not null, city text not null, state text not null, postal_code text not null, country text not null default 'Nigeria',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, product_name text not null, sku text not null,
  unit_price integer not null, quantity integer not null check(quantity > 0), subtotal integer not null,
  created_at timestamptz not null default now()
);
create table public.addresses (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null, last_name text not null, phone text not null, address text not null, city text not null, state text not null, postal_code text not null, country text not null default 'Nigeria', is_default boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;
create policy "Public reads active categories" on public.categories for select using (exists(select 1 from public.products p where p.category_id = categories.id and p.is_active));
create policy "Public reads active products" on public.products for select using (is_active);
create policy "Public reads images of active products" on public.product_images for select using (exists(select 1 from public.products p where p.id = product_id and p.is_active));
create policy "Customers manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Customers manage own cart" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Customers manage own cart items" on public.cart_items for all using (exists(select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists(select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "Customers read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Customers read own order items" on public.order_items for select using (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Customers manage own addresses" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.create_customer_order(
  p_email text, p_phone text, p_first_name text, p_last_name text, p_address text, p_city text, p_state text,
  p_postal_code text, p_country text, p_delivery_fee integer, p_items jsonb, p_user_id uuid default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  item jsonb; product_row public.products%rowtype; new_order public.orders%rowtype;
  calculated_subtotal integer := 0; requested_qty integer; new_number text; order_lines jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 40 then raise exception 'invalid_items'; end if;
  if p_delivery_fee < 0 then raise exception 'invalid_delivery'; end if;
  new_number := 'ITE-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  insert into public.orders(user_id,order_number,email,phone,first_name,last_name,subtotal,delivery_fee,total,shipping_address,city,state,postal_code,country)
    values(p_user_id,new_number,p_email,p_phone,p_first_name,p_last_name,0,p_delivery_fee,p_delivery_fee,p_address,p_city,p_state,p_postal_code,p_country)
    returning * into new_order;
  for item in select value from jsonb_array_elements(p_items) loop
    requested_qty := (item->>'quantity')::integer;
    if requested_qty < 1 or requested_qty > 25 then raise exception 'invalid_quantity'; end if;
    select * into product_row from public.products where id = (item->>'product_id')::uuid and is_active for update;
    if not found or product_row.stock_quantity < requested_qty then raise exception 'insufficient_stock'; end if;
    calculated_subtotal := calculated_subtotal + product_row.price * requested_qty;
    insert into public.order_items(order_id,product_id,product_name,sku,unit_price,quantity,subtotal)
      values(new_order.id,product_row.id,product_row.name,product_row.sku,product_row.price,requested_qty,product_row.price * requested_qty);
    update public.products set stock_quantity = stock_quantity - requested_qty, updated_at = now() where id = product_row.id;
    order_lines := order_lines || jsonb_build_array(jsonb_build_object('name',product_row.name,'sku',product_row.sku,'unit_price',product_row.price,'quantity',requested_qty));
  end loop;
  update public.orders set subtotal=calculated_subtotal,total=calculated_subtotal+p_delivery_fee where id=new_order.id returning * into new_order;
  return jsonb_build_object('id',new_order.id,'order_number',new_order.order_number,'subtotal',new_order.subtotal,'delivery_fee',new_order.delivery_fee,'total',new_order.total,'items',order_lines);
end $$;
revoke all on function public.create_customer_order(text,text,text,text,text,text,text,text,text,integer,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.create_customer_order(text,text,text,text,text,text,text,text,text,integer,jsonb,uuid) to service_role;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id,email,first_name,last_name) values(new.id,new.email,new.raw_user_meta_data->>'given_name',new.raw_user_meta_data->>'family_name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
