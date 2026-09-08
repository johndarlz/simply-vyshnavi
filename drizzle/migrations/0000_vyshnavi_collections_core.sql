-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active categories" ON public.categories FOR SELECT TO anon USING (active);
CREATE POLICY "auth read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku text,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  cod_charge numeric(10,2) NOT NULL DEFAULT 0,
  stock int NOT NULL DEFAULT 0,
  low_stock_threshold int NOT NULL DEFAULT 5,
  material text,
  dimensions text,
  weight text,
  care_instructions text,
  delivery_info text,
  featured boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  bestseller boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  allow_website_order boolean NOT NULL DEFAULT true,
  allow_whatsapp_order boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  views int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT TO anon USING (active);
CREATE POLICY "auth read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Product media
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read images" ON public.product_images FOR SELECT TO anon USING (true);
CREATE POLICY "auth read images" ON public.product_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage images" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.product_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text
);
GRANT SELECT ON public.product_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_videos TO authenticated;
GRANT ALL ON public.product_videos TO service_role;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read videos" ON public.product_videos FOR SELECT TO anon USING (true);
CREATE POLICY "auth read videos" ON public.product_videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage videos" ON public.product_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL,
  price_adjustment numeric(10,2) NOT NULL DEFAULT 0,
  stock int,
  sku text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read variants" ON public.product_variants FOR SELECT TO anon USING (true);
CREATE POLICY "auth read variants" ON public.product_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage variants" ON public.product_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  email text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  landmark text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  cod_charge numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cod',
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'pending',
  payment_id text,
  tracking_number text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  sku text,
  variant text,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Settings
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.settings FOR SELECT TO anon USING (true);
CREATE POLICY "auth read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Order number sequence
CREATE SEQUENCE public.order_number_seq START 1;
GRANT USAGE ON SEQUENCE public.order_number_seq TO service_role;

-- Seed settings
INSERT INTO public.settings (key, value) VALUES
  ('store_name', 'Vyshnavi Collections'),
  ('store_tagline', 'Simple. Elegant. Yours.'),
  ('store_description', 'A small premium boutique offering carefully selected pieces for everyday elegance.'),
  ('store_phone', '+91 90000 00000'),
  ('store_email', 'hello@vyshnavicollections.in'),
  ('store_address', 'Hyderabad, Telangana, India'),
  ('whatsapp_number', '919000000000'),
  ('shipping_standard', '50'),
  ('free_shipping_threshold', '999'),
  ('cod_enabled', 'true'),
  ('cod_default_charge', '40'),
  ('announcement_enabled', 'true'),
  ('announcement_text', 'Free shipping on orders above ₹999 · COD available across India'),
  ('hero_banner_url', ''),
  ('instagram_url', ''),
  ('facebook_url', ''),
  ('youtube_url', ''),
  ('payment_mode', 'test'),
  ('online_payment_enabled', 'false');

-- Seed categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Kurtis', 'kurtis', 1),
  ('Sarees', 'sarees', 2),
  ('Jewellery', 'jewellery', 3),
  ('Accessories', 'accessories', 4);

-- Seed products
INSERT INTO public.products (name, slug, sku, description, category_id, price, original_price, cod_charge, stock, material, care_instructions, delivery_info, featured, new_arrival, bestseller)
VALUES
  ('Elegant Floral Kurti', 'elegant-floral-kurti', 'VC101', 'A soft cotton kurti with a delicate floral print, tailored for all-day comfort and quiet elegance.', (SELECT id FROM public.categories WHERE slug='kurtis'), 899, 1199, 40, 25, 'Pure cotton', 'Machine wash cold, dry in shade', 'Delivered in 3-6 working days across India', true, true, true),
  ('Rose Silk Blend Saree', 'rose-silk-blend-saree', 'VC102', 'A luminous silk-blend saree in muted rose, finished with a fine golden border.', (SELECT id FROM public.categories WHERE slug='sarees'), 2499, 3299, 50, 12, 'Silk blend', 'Dry clean only', 'Delivered in 4-7 working days', true, false, true),
  ('Pearl Drop Earrings', 'pearl-drop-earrings', 'VC103', 'Handcrafted pearl drop earrings with an antique gold finish. Light on the ear, striking in effect.', (SELECT id FROM public.categories WHERE slug='jewellery'), 649, 899, 20, 40, 'Brass with gold plating', 'Keep away from water and perfume', 'Delivered in 3-5 working days', true, true, false),
  ('Handwoven Cotton Dupatta', 'handwoven-cotton-dupatta', 'VC104', 'A breezy handwoven dupatta that finishes any outfit with understated grace.', (SELECT id FROM public.categories WHERE slug='accessories'), 599, 799, 30, 30, 'Handloom cotton', 'Gentle hand wash', 'Delivered in 3-6 working days', true, true, false),
  ('Mustard Anarkali Kurti', 'mustard-anarkali-kurti', 'VC105', 'A flowing anarkali silhouette in warm mustard, perfect for festive evenings.', (SELECT id FROM public.categories WHERE slug='kurtis'), 1299, 1699, 40, 18, 'Rayon', 'Hand wash separately', 'Delivered in 3-6 working days', false, true, false),
  ('Temple Gold Necklace', 'temple-gold-necklace', 'VC106', 'A classic temple-design necklace with intricate detailing and a matte gold finish.', (SELECT id FROM public.categories WHERE slug='jewellery'), 1899, 2499, 50, 8, 'Gold plated alloy', 'Store in a dry pouch', 'Delivered in 4-7 working days', false, false, true),
  ('Ivory Chikankari Kurti', 'ivory-chikankari-kurti', 'VC107', 'Fine chikankari embroidery on ivory cotton — an heirloom-feel everyday piece.', (SELECT id FROM public.categories WHERE slug='kurtis'), 1499, 1999, 40, 15, 'Cotton', 'Hand wash cold', 'Delivered in 3-6 working days', false, false, false),
  ('Beaded Potli Bag', 'beaded-potli-bag', 'VC108', 'A hand-beaded potli bag that carries the essentials and completes the look.', (SELECT id FROM public.categories WHERE slug='accessories'), 749, 999, 30, 22, 'Silk with glass beads', 'Spot clean only', 'Delivered in 3-5 working days', false, true, false);

-- Seed variants for a couple of products
INSERT INTO public.product_variants (product_id, type, name, stock, sort_order)
SELECT id, 'Size', s.name, 8, s.ord FROM public.products p,
  (VALUES ('S',1),('M',2),('L',3),('XL',4)) AS s(name, ord)
WHERE p.slug IN ('elegant-floral-kurti','mustard-anarkali-kurti','ivory-chikankari-kurti');

INSERT INTO public.product_variants (product_id, type, name, stock, sort_order)
SELECT id, 'Color', c.name, 10, c.ord FROM public.products p,
  (VALUES ('Pink',1),('Black',2),('Ivory',3)) AS c(name, ord)
WHERE p.slug IN ('elegant-floral-kurti','mustard-anarkali-kurti');