-- Create the site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    logo_url TEXT,
    gallery_images TEXT[]
);

-- Insert the default settings row if it doesn't exist
INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) for the table
-- This is crucial for allowing access from the web client
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy if it exists, to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to site settings" ON site_settings;

-- Create a new policy to allow anyone to read the site settings
-- This is safe because these settings are not sensitive
CREATE POLICY "Allow public read access to site settings"
ON site_settings
FOR SELECT
USING (true);


-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT CHECK (status IN ('نشط', 'مسودة', 'غير نشط')),
    price TEXT,
    total_sales INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    image_url TEXT
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT,
    customer_name TEXT,
    date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('تم التسليم', 'قيد التجهيز', 'تم الشحن', 'ملغي')),
    total TEXT
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    status TEXT CHECK (status IN ('نشط', 'غير نشط')),
    total_spent TEXT,
    city TEXT
);

-- Enable RLS for all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
DROP POLICY IF EXISTS "Allow public read for products" ON products;
CREATE POLICY "Allow public read for products" ON products FOR SELECT USING (true);

-- Allow authenticated users to manage their data (example policies)
-- These should be adjusted based on actual authentication requirements

-- For example, allow logged-in users to manage orders and customers
DROP POLICY IF EXISTS "Allow all access for authenticated users on orders" ON orders;
CREATE POLICY "Allow all access for authenticated users on orders" ON orders FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all access for authenticated users on customers" ON customers;
CREATE POLICY "Allow all access for authenticated users on customers" ON customers FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;
CREATE POLICY "Allow authenticated users to manage products" ON products FOR ALL USING (auth.role() = 'authenticated');
