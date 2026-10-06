-- Replace the development inverter with an initial NASKAM itel catalogue.
-- Price 0 is a deliberate "contact for price" sentinel; all inventory remains 0
-- until NASKAM enters confirmed stock. Never treat reference-shop prices as ours.
insert into public.categories(name,slug,description) values
  ('Complete solar systems','solar-systems','Packaged itel solar power systems'),
  ('Solar inverters','solar-inverters','itel Energy solar inverters'),
  ('Lithium batteries','lithium-batteries','itel Energy lithium energy storage'),
  ('Solar panels','solar-panels','itel Energy solar panels')
on conflict(slug) do update set name=excluded.name,description=excluded.description,updated_at=now();

with catalog(category_slug,name,slug,sku,description,short_description,warranty,specifications,image_url) as (values
 ('solar-systems','itel 1.5kW Complete Off-Grid Solar System Setup','itel-15kw-complete-off-grid-solar-system','NASKAM-ITEL-1500-KIT','Customizable itel Energy 1.5kW off-grid starter system. Published configurations include a 12V system with 1.28kWh battery and optional solar panel choices. Confirm the exact package contents before purchase.','Customizable 1.5kW off-grid system; confirm selected package contents with NASKAM.',null,'{"Inverter rated power":"1.5kW","System voltage":"12V","Published battery configuration":"1.28kWh","Panel options":"410W or 620W options shown by manufacturer"}'::jsonb,'https://i0.wp.com/itelsolar.com/wp-content/uploads/2026/04/itel-1500w-complete-off-grid-solar-system-setup-customizable-12v-starter-kit-1-5kva.webp?fit=476%2C476&ssl=1'),
 ('solar-systems','itel 4kW Hybrid Solar System with 10kWh Battery','itel-4kw-hybrid-solar-system-10kwh','NASKAM-ITEL-4KW-SYSTEM','itel hybrid system bundle listing includes a 4kW inverter, two 5kWh lithium batteries and eight 620W solar panels. Confirm package and installation requirements before purchase.','4kW hybrid system with listed 10kWh battery and 8 × 620W panels.',null,'{"Inverter rated power":"4kW","Listed battery capacity":"10kWh (2 × 5kWh)","Solar panels":"8 × 620W","Listed array capacity":"4,960W"}'::jsonb,'https://i0.wp.com/itelsolar.com/wp-content/uploads/2026/07/Complete-4kW-Hybrid-Solar-System-2x-5kWh-Lithium-Battery-8x-620W-Panels.png?fit=1600%2C2111&ssl=1'),
 ('solar-systems','itel 6kW Hybrid Solar System with 16kWh Battery','itel-6kw-hybrid-solar-system-16kwh','NASKAM-ITEL-6KW-SYSTEM','itel hybrid system bundle listing includes a 6kW inverter, 16kWh LiFePO4 storage and twelve 620W solar panels. Confirm package and installation requirements before purchase.','6kW hybrid system with listed 16kWh battery and 12 × 620W panels.',null,'{"Inverter rated power":"6kW","Listed battery capacity":"16kWh LiFePO4","Solar panels":"12 × 620W","Listed array capacity":"7,440W"}'::jsonb,'https://i0.wp.com/itelsolar.com/wp-content/uploads/2026/07/Complete-6kW-Hybrid-Solar-System-16kWh-Lithium-LiFePO4-Battery-12x-620W-Panels.png?fit=1600%2C2114&ssl=1'),
 ('solar-inverters','itel 4kW Hybrid Inverter IPV-4K24U','itel-4kw-hybrid-inverter-ipv-4k24u','IPV-4K24U','itel Energy hybrid solar inverter model IPV-4K24U. Refer to the exact manufacturer documentation and NASKAM for compatibility and installation details.','4kW itel Energy hybrid inverter, 24V model.',null,'{"Model":"IPV-4K24U","Rated power":"4kW","System voltage":"24V"}'::jsonb,'/images/product-placeholder.svg'),
 ('solar-inverters','itel 6kW Hybrid Inverter IPV-6K48U','itel-6kw-hybrid-inverter-ipv-6k48u','IPV-6K48U','itel Energy hybrid solar inverter model IPV-6K48U. Refer to the exact manufacturer documentation and NASKAM for compatibility and installation details.','6kW itel Energy hybrid inverter, 48V, IP54.',null,'{"Model":"IPV-6K48U","Rated power":"6kW","System voltage":"48V","Protection rating":"IP54"}'::jsonb,'https://i0.wp.com/itelsolar.com/wp-content/uploads/2025/07/itel-6kW-Hybrid-Solar-Inverter-%E2%80%93-Dual-AC-Output-for-Homes-Clinics-48V-IP54-Rated-2.jpg?fit=500%2C500&ssl=1'),
 ('solar-inverters','itel 12kW Hybrid Inverter IPV-12K48U','itel-12kw-hybrid-inverter-ipv-12k48u','IPV-12K48U','itel Energy hybrid solar inverter model IPV-12K48U. Refer to the exact manufacturer documentation and NASKAM for compatibility and installation details.','12kW itel Energy hybrid inverter, 48V, IP54.',null,'{"Model":"IPV-12K48U","Rated power":"12kW","System voltage":"48V","Protection rating":"IP54"}'::jsonb,'/images/product-placeholder.svg'),
 ('lithium-batteries','itel Energy 1280Wh 12V Lithium Battery IPB-12100','itel-1280wh-12v-lithium-battery-ipb-12100','IPB-12100','itel Energy LiFePO4 battery listed as a 12V, 1280Wh smart solar storage unit. Confirm compatibility with the selected inverter before purchase.','12V 1280Wh LiFePO4 battery with smart BMS.',null,'{"Model":"IPB-12100","Chemistry":"LiFePO4","Nominal voltage":"12V","Energy capacity":"1280Wh"}'::jsonb,'https://i0.wp.com/itelsolar.com/wp-content/uploads/2026/01/itel-Energy-1280Wh-12V-Lithium-Battery-LiFePO%E2%82%84-%E2%80%93-Smart-Solar-Storage-Solution.webp?fit=680%2C680&ssl=1'),
 ('lithium-batteries','itel Energy 2.56kWh 24V Lithium Battery IPW-25100','itel-2560wh-24v-lithium-battery-ipw-25100','IPW-25100','itel Energy lithium battery listed as a 24V 100Ah 2.56kWh unit. Confirm compatibility with the selected inverter before purchase.','24V 100Ah 2.56kWh itel Energy lithium battery.',null,'{"Model":"IPW-25100","Nominal voltage":"24V","Rated capacity":"100Ah","Energy capacity":"2.56kWh"}'::jsonb,'https://i0.wp.com/itelsolar.com/wp-content/uploads/2025/04/itel-2.56kWh-Lithium-Battery-Wall-Mounted-Backup-for-Homes-Shops-25.6V-LiFePO4-2-1.jpg?fit=680%2C680&ssl=1'),
 ('lithium-batteries','itel Energy 5.12kWh 48V Lithium Battery IPL-51100','itel-5120wh-48v-lithium-battery-ipl-51100','IPL-51100','itel Energy LiFePO4 battery listed as a 48V 100Ah 5.12kWh unit. Confirm compatibility with the selected inverter before purchase.','48V 100Ah 5.12kWh LiFePO4 battery.',null,'{"Model":"IPL-51100","Chemistry":"LiFePO4","Nominal voltage":"48V","Rated capacity":"100Ah","Energy capacity":"5.12kWh"}'::jsonb,'https://itelsolar.com/wp-content/uploads/2025/04/itel-5.12kWh-Lithium-Battery-%E2%80%93-Long-Backup-for-Homes-Clinics-Offices-48V-LiFePO4-2.jpg'),
 ('solar-panels','itel 410W Monocrystalline Solar Panel','itel-410w-monocrystalline-solar-panel','ISP-410W','itel Energy monocrystalline solar panel. Confirm mounting, electrical compatibility and delivery dimensions before purchase.','410W monocrystalline panel, 108 cells, 20.97% listed module efficiency.',null,'{"Rated power":"410W","Cell type":"Monocrystalline","Cell count":"108","Module efficiency":"20.97%"}'::jsonb,'https://i0.wp.com/itelsolar.com/wp-content/uploads/2025/04/itel-410W-Monocrystalline-Solar-Panel-%E2%80%93-Rooftop-Solar-for-Homes-Shops-Offices-High-Efficiency-IP68-Rated-2.jpg?fit=680%2C680&ssl=1'),
 ('solar-panels','itel 620W N-Type Bifacial Solar Panel ISP-620W-G1','itel-620w-n-type-bifacial-solar-panel','ISP-620W-G1','itel Energy N-type bifacial monocrystalline solar panel. Confirm mounting, electrical compatibility and delivery dimensions before purchase.','620W N-type bifacial panel, 132 half-cut cells, 22.95% listed module efficiency.',null,'{"Model":"ISP-620W-G1","Rated power":"620W","Cell type":"N-type bifacial monocrystalline","Cell layout":"132 half-cut cells","Module efficiency":"22.95%","Maximum system voltage":"1500V"}'::jsonb,'/images/product-placeholder.svg')
), upserted as (
 insert into public.products(category_id,name,slug,sku,brand,description,short_description,price,compare_at_price,stock_quantity,warranty,specifications,is_active)
 select c.id,d.name,d.slug,d.sku,'itel Energy',d.description,d.short_description,0,null,0,d.warranty,d.specifications,true
 from catalog d join public.categories c on c.slug=d.category_slug
 on conflict(slug) do update set category_id=excluded.category_id,name=excluded.name,sku=excluded.sku,brand=excluded.brand,description=excluded.description,short_description=excluded.short_description,price=0,compare_at_price=null,stock_quantity=0,warranty=excluded.warranty,specifications=excluded.specifications,is_active=true,updated_at=now()
 returning id,slug
)
insert into public.product_images(product_id,image_url,alt_text,sort_order)
select p.id,d.image_url,d.name || ' product image',0 from catalog d join upserted p on p.slug=d.slug
where not exists(select 1 from public.product_images i where i.product_id=p.id);

-- Historical order_items retain their name, SKU, price and quantity snapshots.
delete from public.products where slug='itel-energy-1-5kw-solar-inverter';

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
    if product_row.price <= 0 then raise exception 'price_unavailable'; end if;
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
