-- 1. Extensions and Types
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TYPE subscription_tier AS ENUM ('freemium', 'pro', 'business');
CREATE TYPE transaction_type AS ENUM ('purchase', 'sale', 'adjustment');
-- 2. Tenant Management (SaaS Identity Multi-tenant)
CREATE TABLE tenant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Soft delete flag
    tier subscription_tier DEFAULT 'freemium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 3. Resource (Raw Materials / Inputs)
CREATE TABLE resource (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_cost NUMERIC(12, 4) NOT NULL CHECK (unit_cost >= 0),
    current_stock NUMERIC(12, 4) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Soft delete flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_resource_tenant ON resource(tenant_id);
-- 4. Finished Product (Includes physical stock tracking)
CREATE TABLE product (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sale_price NUMERIC(12, 2) NOT NULL CHECK (sale_price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    is_pre_made BOOLEAN NOT NULL DEFAULT FALSE,
    -- Integrado para soportar MTO/MTS
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Soft delete flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_product_tenant ON product(tenant_id);
-- 5. Recipe (Bill of Materials: Product -> Resources)
CREATE TABLE recipe_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resource(id) ON DELETE RESTRICT,
    required_quantity NUMERIC(12, 4) NOT NULL CHECK (required_quantity > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Soft delete flag
    UNIQUE(product_id, resource_id)
);
CREATE INDEX idx_recipe_tenant ON recipe_item(tenant_id);
-- 6. Production Batch (History of manufacturing)
CREATE TABLE production_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES product(id) ON DELETE RESTRICT,
    quantity_produced INTEGER NOT NULL CHECK (quantity_produced > 0),
    total_batch_cost NUMERIC(12, 2),
    production_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_production_tenant ON production_batch(tenant_id);
-- 7. Transaction Log (Audit trail of financial movements)
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