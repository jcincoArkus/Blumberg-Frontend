-- =============================================================================
-- Inventory Schema
-- PostgreSQL 15+
-- =============================================================================

-- Utility: auto-update updated_at on any table that has the column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- CATEGORIES
-- =============================================================================
CREATE TABLE categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(50)  NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- SITES  (warehouses / distribution centers)
-- =============================================================================
CREATE TABLE sites (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- SITE ZONES  (areas within a site: Cold Room A, Dock 3, etc.)
-- =============================================================================
CREATE TABLE site_zones (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    UUID         NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, name)
);

CREATE INDEX idx_site_zones_site_id ON site_zones (site_id);


-- =============================================================================
-- SUPPLIERS
-- =============================================================================
CREATE TABLE suppliers (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- PRODUCTS  (SKU catalog)
-- =============================================================================
CREATE TYPE product_unit AS ENUM ('kg', 'unit', 'box');

CREATE TABLE products (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sku              VARCHAR(50)  NOT NULL UNIQUE,
  name             VARCHAR(200) NOT NULL,
  category_id      UUID         NOT NULL REFERENCES categories(id),
  unit             product_unit NOT NULL,
  -- conversion factor when unit = 'box'
  kg_per_box       NUMERIC(10, 3) CHECK (kg_per_box > 0),
  -- expected shelf life in days from entry date
  shelf_life_days  INTEGER      NOT NULL CHECK (shelf_life_days > 0),
  price            NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_sku         ON products (sku);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- LOTS  (a batch of a product received on a specific date)
-- lot_code follows the pattern L-YYMMDD-NN, stored as the natural PK
-- =============================================================================
CREATE TYPE lot_unit AS ENUM ('kg', 'unit');

CREATE TABLE lots (
  lot_code        VARCHAR(50)    PRIMARY KEY,
  product_id      UUID           NOT NULL REFERENCES products(id),
  qty             NUMERIC(12, 3) NOT NULL CHECK (qty >= 0),
  unit            lot_unit       NOT NULL,
  entry_at        TIMESTAMPTZ    NOT NULL,
  expires_at      TIMESTAMPTZ    NOT NULL,
  site_id         UUID           NOT NULL REFERENCES sites(id),
  zone            VARCHAR(100)   NOT NULL,
  supplier_id     UUID           REFERENCES suppliers(id),
  cost_per_unit   NUMERIC(12, 4) NOT NULL CHECK (cost_per_unit >= 0),
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CHECK (expires_at > entry_at)
);

CREATE INDEX idx_lots_product_id  ON lots (product_id);
CREATE INDEX idx_lots_site_id     ON lots (site_id);
CREATE INDEX idx_lots_expires_at  ON lots (expires_at);
CREATE INDEX idx_lots_entry_at    ON lots (entry_at);

CREATE TRIGGER trg_lots_updated_at
  BEFORE UPDATE ON lots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- MOVEMENTS  (append-only audit trail of every stock change)
-- =============================================================================
CREATE TYPE movement_type AS ENUM ('intake', 'output', 'waste', 'adjustment', 'transfer');

CREATE TABLE movements (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  type         movement_type NOT NULL,
  occurred_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  product_id   UUID          NOT NULL REFERENCES products(id),
  -- positive = stock in, negative = stock out
  qty          NUMERIC(12, 3) NOT NULL,
  unit         lot_unit      NOT NULL,
  lot_code     VARCHAR(50)   REFERENCES lots(lot_code),
  site_id      UUID          NOT NULL REFERENCES sites(id),
  -- for transfers: destination site
  dest_site_id UUID          REFERENCES sites(id),
  performed_by VARCHAR(200)  NOT NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_product_id  ON movements (product_id);
CREATE INDEX idx_movements_lot_code    ON movements (lot_code);
CREATE INDEX idx_movements_site_id     ON movements (site_id);
CREATE INDEX idx_movements_type        ON movements (type);
CREATE INDEX idx_movements_occurred_at ON movements (occurred_at DESC);


-- =============================================================================
-- INTAKE SHIPMENTS  (receiving events — header record)
-- =============================================================================
CREATE TYPE shipment_status AS ENUM ('draft', 'received', 'cancelled');

CREATE TABLE intake_shipments (
  id                UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  po_reference      VARCHAR(100)     NOT NULL UNIQUE,
  supplier_id       UUID             NOT NULL REFERENCES suppliers(id),
  vehicle           VARCHAR(200),
  driver            VARCHAR(200),
  site_id           UUID             NOT NULL REFERENCES sites(id),
  receiving_zone    VARCHAR(100)     NOT NULL,
  -- cold-chain temperature recorded on arrival (°C)
  cold_chain_temp_c NUMERIC(5, 2),
  arrived_at        TIMESTAMPTZ      NOT NULL,
  received_by       VARCHAR(200)     NOT NULL,
  status            shipment_status  NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intake_shipments_supplier_id ON intake_shipments (supplier_id);
CREATE INDEX idx_intake_shipments_site_id     ON intake_shipments (site_id);
CREATE INDEX idx_intake_shipments_arrived_at  ON intake_shipments (arrived_at DESC);

CREATE TRIGGER trg_intake_shipments_updated_at
  BEFORE UPDATE ON intake_shipments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- INTAKE SHIPMENT LINES  (one row per product line in a shipment)
-- =============================================================================
CREATE TABLE intake_shipment_lines (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id  UUID           NOT NULL REFERENCES intake_shipments(id) ON DELETE CASCADE,
  product_id   UUID           NOT NULL REFERENCES products(id),
  -- lot_code is set once the shipment is confirmed and lots are created
  lot_code     VARCHAR(50)    REFERENCES lots(lot_code),
  qty          NUMERIC(12, 3) NOT NULL CHECK (qty > 0),
  unit         product_unit   NOT NULL,
  cost_per_unit NUMERIC(12, 4) NOT NULL CHECK (cost_per_unit >= 0),
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intake_lines_shipment_id ON intake_shipment_lines (shipment_id);
CREATE INDEX idx_intake_lines_product_id  ON intake_shipment_lines (product_id);


-- =============================================================================
-- SEED DATA  (mirrors the mock data in packages/views/inventory/data.ts)
-- =============================================================================

-- Categories
INSERT INTO categories (id, name, color) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Fruit',         'teal'),
  ('11111111-0001-0001-0001-000000000002', 'Vegetables',    'blue-gray'),
  ('11111111-0001-0001-0001-000000000003', 'Citrus',        'yellow'),
  ('11111111-0001-0001-0001-000000000004', 'Leafy Greens',  'teal'),
  ('11111111-0001-0001-0001-000000000005', 'Herbs',         'mint');

-- Sites
INSERT INTO sites (id, name) VALUES
  ('22222222-0002-0002-0002-000000000001', 'CDMX · Iztapalapa'),
  ('22222222-0002-0002-0002-000000000002', 'Guadalajara · Zapopan'),
  ('22222222-0002-0002-0002-000000000003', 'Monterrey · Apodaca');

-- Site zones
INSERT INTO site_zones (site_id, name) VALUES
  ('22222222-0002-0002-0002-000000000001', 'Cold Room A'),
  ('22222222-0002-0002-0002-000000000001', 'Cold Room B'),
  ('22222222-0002-0002-0002-000000000001', 'Dry Bay 1'),
  ('22222222-0002-0002-0002-000000000001', 'Dock 3'),
  ('22222222-0002-0002-0002-000000000002', 'Cold Room 1'),
  ('22222222-0002-0002-0002-000000000002', 'Cold Room 2'),
  ('22222222-0002-0002-0002-000000000002', 'Bay 4'),
  ('22222222-0002-0002-0002-000000000003', 'Refrig. 1'),
  ('22222222-0002-0002-0002-000000000003', 'Refrig. 2'),
  ('22222222-0002-0002-0002-000000000003', 'Dock 2');

-- Suppliers
INSERT INTO suppliers (id, name) VALUES
  ('33333333-0003-0003-0003-000000000001', 'Frutería Morales'),
  ('33333333-0003-0003-0003-000000000002', 'Verduras del Valle'),
  ('33333333-0003-0003-0003-000000000003', 'Cítricos del Sur'),
  ('33333333-0003-0003-0003-000000000004', 'Hojas Frescas S.A.');

-- Products
INSERT INTO products (id, sku, name, category_id, unit, kg_per_box, shelf_life_days, price) VALUES
  ('44444444-0004-0004-0004-000000000001', 'AVO-HASS',  'Avocado · Hass',         '11111111-0001-0001-0001-000000000001', 'kg',   NULL,  10, 35.00),
  ('44444444-0004-0004-0004-000000000002', 'TOM-ROMA',  'Tomato · Roma',           '11111111-0001-0001-0001-000000000002', 'kg',   NULL,   7, 18.50),
  ('44444444-0004-0004-0004-000000000003', 'TOM-SAL',   'Tomato · Saladette',      '11111111-0001-0001-0001-000000000002', 'kg',   NULL,   7, 16.00),
  ('44444444-0004-0004-0004-000000000004', 'LIM-MEX',   'Lime · Mexicano',         '11111111-0001-0001-0001-000000000003', 'kg',   NULL,  14, 22.00),
  ('44444444-0004-0004-0004-000000000005', 'LEM-AMA',   'Lemon · Amarillo',        '11111111-0001-0001-0001-000000000003', 'kg',   NULL,  14, 24.00),
  ('44444444-0004-0004-0004-000000000006', 'ORA-VAL',   'Orange · Valencia',       '11111111-0001-0001-0001-000000000003', 'box', 20.0,  21, 320.00),
  ('44444444-0004-0004-0004-000000000007', 'LET-ROM',   'Lettuce · Romaine',       '11111111-0001-0001-0001-000000000004', 'unit', NULL,   5, 12.00),
  ('44444444-0004-0004-0004-000000000008', 'SPI-BAB',   'Spinach · Baby',          '11111111-0001-0001-0001-000000000004', 'kg',   NULL,   4, 45.00),
  ('44444444-0004-0004-0004-000000000009', 'CIL-FRE',   'Cilantro',                '11111111-0001-0001-0001-000000000005', 'kg',   NULL,   5, 60.00),
  ('44444444-0004-0004-0004-000000000010', 'HIE-BAE',   'Hierbabuena (Mint)',       '11111111-0001-0001-0001-000000000005', 'kg',   NULL,   5, 80.00),
  ('44444444-0004-0004-0004-000000000011', 'CHI-JAL',   'Chile · Jalapeño',        '11111111-0001-0001-0001-000000000002', 'kg',   NULL,  10, 28.00),
  ('44444444-0004-0004-0004-000000000012', 'CHI-SER',   'Chile · Serrano',         '11111111-0001-0001-0001-000000000002', 'kg',   NULL,  10, 30.00),
  ('44444444-0004-0004-0004-000000000013', 'MAN-ATA',   'Mango · Ataulfo',         '11111111-0001-0001-0001-000000000001', 'kg',   NULL,   7, 25.00),
  ('44444444-0004-0004-0004-000000000014', 'PAP-MAR',   'Papaya · Maradol',        '11111111-0001-0001-0001-000000000001', 'kg',   NULL,  14, 20.00);
