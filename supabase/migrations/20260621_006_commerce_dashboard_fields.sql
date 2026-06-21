-- Migration: Commerce dashboard fields
-- Purpose: Add reusable service merchandising fields and direct-sale payment metadata.
-- Created: 2026-06-21

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS badge TEXT;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

CREATE INDEX IF NOT EXISTS idx_bookings_direct_sales
  ON public.bookings(app_id, organization_id, created_at DESC)
  WHERE source = 'direct';

COMMENT ON COLUMN public.bookings.payment_method IS
  'Payment rail used for dashboard-created direct sales, e.g. cash, card, bank_transfer, other.';
