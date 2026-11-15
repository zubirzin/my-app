-- ============================================
-- Migration 002 — Add audit columns to items
-- ============================================

ALTER TABLE items
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_items_archived ON items (archived);
