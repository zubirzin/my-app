-- ============================================
-- Database Schema — PostgreSQL
-- ============================================
-- Applied automatically by the app on startup
-- ============================================

-- Table: items
CREATE TABLE IF NOT EXISTS items (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by name
CREATE INDEX IF NOT EXISTS idx_items_name ON items (name);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_items_updated_at ON items;
CREATE TRIGGER trigger_update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial data (only if table is empty)
INSERT INTO items (name, description)
SELECT 'Item 1', 'Sample item 1'
WHERE NOT EXISTS (SELECT 1 FROM items);

INSERT INTO items (name, description)
SELECT 'Item 2', 'Sample item 2'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Item 2');

INSERT INTO items (name, description)
SELECT 'Item 3', 'Sample item 3'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Item 3');
