-- 1. Extensions and Types
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TYPE subscription_tier AS ENUM ('freemium', 'pro', 'business');
CREATE TYPE transaction_type AS ENUM ('purchase', 'sale', 'adjustment');
-- 2. Tenant Management
CREATE TABLE tenant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tier subscription_tier DEFAULT 'freemium',
    admin_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tenant_tier ON tenant(tier);
CREATE UNIQUE INDEX idx_tenant_admin_email ON tenant(admin_email);
-- 3. Tenant Usage Tracking
CREATE TABLE tenant_usage (
    tenant_id UUID PRIMARY KEY REFERENCES tenant(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 4. Resource
CREATE TABLE resource (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_cost NUMERIC(12, 4) NOT NULL CHECK (unit_cost >= 0),
    current_stock NUMERIC(12, 4) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_resource_tenant ON resource(tenant_id);
-- 5. Finished Product
CREATE TABLE product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sale_price NUMERIC(12, 2) NOT NULL CHECK (sale_price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    is_pre_made BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_product_tenant ON product(tenant_id);
-- 6. Recipe (Bill of Materials)
CREATE TABLE recipe_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resource(id) ON DELETE RESTRICT,
    required_quantity NUMERIC(12, 4) NOT NULL CHECK (required_quantity > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(product_id, resource_id)
);
CREATE INDEX idx_recipe_tenant ON recipe_item(tenant_id);
-- 7. Production Batch
CREATE TABLE production_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
    quantity_produced INTEGER NOT NULL CHECK (quantity_produced > 0),
    total_batch_cost NUMERIC(12, 2),
    production_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_production_tenant ON production_batch(tenant_id);
-- 8. Transaction Log
CREATE TABLE transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    reference_id UUID NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transaction_tenant_date ON transaction_log(tenant_id, transaction_date);
-- 9. Limits and Logic
CREATE TABLE plan_limits (
    tier subscription_tier PRIMARY KEY,
    max_products INTEGER NOT NULL,
    max_resources INTEGER NOT NULL,
    max_sales INTEGER NOT NULL DEFAULT 100
);
INSERT INTO plan_limits (tier, max_products, max_resources, max_sales)
VALUES ('freemium', 15, 50, 100),
    ('pro', 50, 500, 1000),
    ('business', 999999, 999999, 999999);
-- (Functions and Triggers remain same as yours, just ensure they run last)
-- (Functions check_structure_limits())
CREATE OR REPLACE FUNCTION check_structure_limits() RETURNS TRIGGER AS $$DECLARE current_count INTEGER;
max_allowed INTEGER;
tier_name subscription_tier;
BEGIN
SELECT tier INTO tier_name
FROM tenant
WHERE id = NEW.tenant_id;
IF TG_TABLE_NAME = 'product' THEN
SELECT max_products INTO max_allowed
FROM plan_limits
WHERE tier = tier_name;
SELECT COUNT(*) INTO current_count
FROM product
WHERE tenant_id = NEW.tenant_id
    AND is_active = TRUE;
ELSIF TG_TABLE_NAME = 'resource' THEN
SELECT max_resources INTO max_allowed
FROM plan_limits
WHERE tier = tier_name;
SELECT COUNT(*) INTO current_count
FROM resource
WHERE tenant_id = NEW.tenant_id
    AND is_active = TRUE;
END IF;
IF current_count >= max_allowed THEN RAISE EXCEPTION 'LIMIT_EXCEEDED: %',
tier_name USING ERRCODE = 'check_violation';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- TRIGGER trg_limit_products
CREATE TRIGGER trg_limit_products BEFORE
INSERT ON product FOR EACH ROW EXECUTE FUNCTION check_structure_limits();
CREATE TRIGGER trg_limit_resources BEFORE
INSERT ON resource FOR EACH ROW EXECUTE FUNCTION check_structure_limits();
CREATE OR REPLACE FUNCTION check_usage_and_sales() RETURNS TRIGGER AS $$DECLARE current_sales INTEGER;
max_allowed INTEGER;
tier_name subscription_tier;
BEGIN -- Solo validamos si es una Venta (SALE)
IF NEW.type = 'sale' THEN
SELECT tier INTO tier_name
FROM tenant
WHERE id = NEW.tenant_id;
SELECT max_sales INTO max_allowed
FROM plan_limits
WHERE tier = tier_name;
SELECT COUNT(*) INTO current_sales
FROM transaction_log
WHERE tenant_id = NEW.tenant_id
    AND type = 'sale'
    AND transaction_date >= date_trunc('month', CURRENT_TIMESTAMP);
IF current_sales >= max_allowed THEN RAISE EXCEPTION 'LIMIT_EXCEEDED: %',
tier_name USING ERRCODE = 'check_violation';
END IF;
-- Incrementamos contador de uso
UPDATE tenant_usage
SET usage_count = usage_count + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = NEW.tenant_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_usage_sales BEFORE
INSERT ON transaction_log FOR EACH ROW EXECUTE FUNCTION check_usage_and_sales();