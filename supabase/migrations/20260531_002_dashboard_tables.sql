-- Migration: Dashboard tables (leads, bookings, services, analytics_events, gallery_items, notifications, audit_logs)
-- Purpose: Provision all tables needed by the full DannFlow dashboard
-- Created: 2026-05-31
-- Depends on: 20260524_001_add_app_id_and_organizations.sql

-- Run AFTER /create-organization so organization row exists.
-- Replace 'business-template' with your NEXT_PUBLIC_APP_ID when adapting for a client project.

-- ── leads ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT 'business-template',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  message          TEXT,
  service_interest TEXT,
  source           TEXT NOT NULL DEFAULT 'contact-form',
  status           TEXT NOT NULL DEFAULT 'new',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_app_id          ON public.leads(app_id);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status          ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at      ON public.leads(created_at DESC);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant isolation" ON public.leads
  FOR ALL USING (app_id = current_setting('app.id', true)::text);

-- ── services ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT 'business-template',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL,
  description      TEXT,
  short_desc       TEXT,
  category         TEXT,
  price_from       NUMERIC(10,2),
  price_to         NUMERIC(10,2),
  price_label      TEXT,
  duration_minutes INTEGER,
  is_featured      BOOLEAN DEFAULT false,
  is_published     BOOLEAN DEFAULT true,
  display_order    INTEGER DEFAULT 0,
  icon             TEXT,
  image_url        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(app_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_services_app_id          ON public.services(app_id);
CREATE INDEX IF NOT EXISTS idx_services_organization_id ON public.services(organization_id);
CREATE INDEX IF NOT EXISTS idx_services_is_published    ON public.services(is_published);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published" ON public.services
  FOR SELECT USING (app_id = current_setting('app.id', true)::text AND is_published = true);
CREATE POLICY "admin manage" ON public.services
  FOR ALL USING (
    app_id = current_setting('app.id', true)::text
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
        AND app_id = current_setting('app.id', true)::text
    )
  );

-- ── bookings ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT 'business-template',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,
  service_id       UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name     TEXT NOT NULL,
  package          TEXT,
  vehicle_type     TEXT,
  vehicle_make     TEXT,
  vehicle_model    TEXT,
  vehicle_year     TEXT,
  notes            TEXT,
  preferred_date   DATE,
  preferred_time   TEXT,
  confirmed_date   DATE,
  confirmed_time   TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',
  price_quoted     NUMERIC(10,2),
  price_paid       NUMERIC(10,2),
  payment_status   TEXT NOT NULL DEFAULT 'unpaid',
  source           TEXT NOT NULL DEFAULT 'website',
  lead_id          UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_app_id          ON public.bookings(app_id);
CREATE INDEX IF NOT EXISTS idx_bookings_organization_id ON public.bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status          ON public.bookings(status);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant isolation" ON public.bookings
  FOR ALL USING (app_id = current_setting('app.id', true)::text);

-- ── analytics_events ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT 'business-template',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type       TEXT NOT NULL,
  page_path        TEXT,
  referrer         TEXT,
  user_agent       TEXT,
  ip_hash          TEXT,
  session_id       TEXT,
  properties       JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_app_id          ON public.analytics_events(app_id);
CREATE INDEX IF NOT EXISTS idx_analytics_organization_id ON public.analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type      ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at      ON public.analytics_events(created_at DESC);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant isolation" ON public.analytics_events
  FOR ALL USING (app_id = current_setting('app.id', true)::text);

-- ── gallery_items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT 'business-template',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title            TEXT,
  caption          TEXT,
  image_url        TEXT NOT NULL,
  before_image_url TEXT,
  service_tag      TEXT,
  display_order    INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_app_id          ON public.gallery_items(app_id);
CREATE INDEX IF NOT EXISTS idx_gallery_organization_id ON public.gallery_items(organization_id);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published" ON public.gallery_items
  FOR SELECT USING (app_id = current_setting('app.id', true)::text AND is_published = true);
CREATE POLICY "admin manage" ON public.gallery_items
  FOR ALL USING (
    app_id = current_setting('app.id', true)::text
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
        AND app_id = current_setting('app.id', true)::text
    )
  );

-- ── notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT 'business-template',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type             TEXT NOT NULL,
  title            TEXT NOT NULL,
  body             TEXT,
  link             TEXT,
  is_read          BOOLEAN NOT NULL DEFAULT false,
  metadata         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_app_id          ON public.notifications(app_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read         ON public.notifications(is_read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant isolation" ON public.notifications
  FOR ALL USING (app_id = current_setting('app.id', true)::text);

-- ── audit_logs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id           TEXT NOT NULL DEFAULT 'business-template',
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email      TEXT,
  action           TEXT NOT NULL,
  resource_type    TEXT NOT NULL,
  resource_id      TEXT,
  old_data         JSONB,
  new_data         JSONB,
  diff             JSONB,
  ip_address       TEXT,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_app_id          ON public.audit_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action          ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at      ON public.audit_logs(created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant isolation" ON public.audit_logs
  FOR ALL USING (app_id = current_setting('app.id', true)::text);

-- ── audit trigger on services ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_service_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_diff JSONB := '{}';
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.price_from IS DISTINCT FROM NEW.price_from THEN
      v_diff := v_diff || jsonb_build_object('price_from', jsonb_build_object('old', OLD.price_from, 'new', NEW.price_from));
    END IF;
    IF OLD.price_to IS DISTINCT FROM NEW.price_to THEN
      v_diff := v_diff || jsonb_build_object('price_to', jsonb_build_object('old', OLD.price_to, 'new', NEW.price_to));
    END IF;
    IF OLD.name IS DISTINCT FROM NEW.name THEN
      v_diff := v_diff || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name));
    END IF;
    IF OLD.is_published IS DISTINCT FROM NEW.is_published THEN
      v_diff := v_diff || jsonb_build_object('is_published', jsonb_build_object('old', OLD.is_published, 'new', NEW.is_published));
    END IF;
    IF v_diff != '{}' THEN
      INSERT INTO public.audit_logs (app_id, organization_id, actor_id, action, resource_type, resource_id, old_data, new_data, diff)
      VALUES (NEW.app_id, NEW.organization_id, auth.uid(), 'update.service', 'service', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW), v_diff);
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (app_id, organization_id, actor_id, action, resource_type, resource_id, new_data)
    VALUES (NEW.app_id, NEW.organization_id, auth.uid(), 'create.service', 'service', NEW.id::text, to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (app_id, organization_id, actor_id, action, resource_type, resource_id, old_data)
    VALUES (OLD.app_id, OLD.organization_id, auth.uid(), 'delete.service', 'service', OLD.id::text, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS services_audit_trigger ON public.services;
CREATE TRIGGER services_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.log_service_changes();
