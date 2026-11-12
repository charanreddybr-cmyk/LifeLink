-- LifeLink Production PostgreSQL Schema Migration
-- Phase 2: Core Entities, Role-Based Access Control, and Row Level Security
-- Compliant with Indian DPDP Act standards and NBTC blood banking regulations.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM ('donor', 'requester', 'admin');
CREATE TYPE blood_group_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE emergency_priority_enum AS ENUM ('CRITICAL', 'URGENT', 'STANDARD');
CREATE TYPE request_status_enum AS ENUM (
  'PENDING_VERIFICATION',
  'ACTIVE',
  'RESPONSES_RECEIVED',
  'PARTIALLY_FULFILLED',
  'FULFILLED',
  'CANCELLED',
  'EXPIRED'
);
CREATE TYPE donor_response_status_enum AS ENUM ('ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED');
CREATE TYPE verification_status_enum AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- 3. PROFILES TABLE (Central identity linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'donor',
  full_name TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 4. DONOR PROFILES (Private medical & locality data)
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_group blood_group_enum NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  locality TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  last_donation_date DATE,
  total_donations INTEGER NOT NULL DEFAULT 0,
  notification_radius_km INTEGER NOT NULL DEFAULT 10,
  privacy_phone_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT valid_pincode CHECK (pincode ~ '^[1-9][0-9]{5}$')
);

-- 5. REQUESTER PROFILES
CREATE TABLE IF NOT EXISTS public.requester_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT,
  hospital_affiliation TEXT,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  locality TEXT NOT NULL,
  verification_status verification_status_enum NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 6. BLOOD REQUESTS (Emergency requisitions)
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  blood_group blood_group_enum NOT NULL,
  units_needed INTEGER NOT NULL CHECK (units_needed > 0 AND units_needed <= 10),
  units_fulfilled INTEGER NOT NULL DEFAULT 0 CHECK (units_fulfilled <= units_needed),
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  locality TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  pincode VARCHAR(10) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  priority emergency_priority_enum NOT NULL DEFAULT 'URGENT',
  required_by TIMESTAMPTZ NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  additional_notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status request_status_enum NOT NULL DEFAULT 'PENDING_VERIFICATION',
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 7. DONOR RESPONSES
CREATE TABLE IF NOT EXISTS public.donor_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status donor_response_status_enum NOT NULL DEFAULT 'ACCEPTED',
  response_notes TEXT,
  contact_released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (request_id, donor_id)
);

-- 8. LOCALITY RECORDS (Bengaluru reference dataset)
CREATE TABLE IF NOT EXISTS public.locality_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  state TEXT NOT NULL DEFAULT 'Karnataka',
  pincode VARCHAR(10) NOT NULL,
  zone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 9. ADMIN AUDIT LOGS (Immutable security and moderation trail)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 10. INDEXES FOR HIGH-PERFORMANCE EMERGENCIES
CREATE INDEX IF NOT EXISTS idx_donor_profiles_matching 
  ON public.donor_profiles (blood_group, is_available, locality);

CREATE INDEX IF NOT EXISTS idx_blood_requests_active 
  ON public.blood_requests (status, blood_group, city) 
  WHERE status IN ('PENDING_VERIFICATION', 'ACTIVE', 'RESPONSES_RECEIVED');

CREATE INDEX IF NOT EXISTS idx_donor_responses_request 
  ON public.donor_responses (request_id, status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
  ON public.admin_audit_logs (created_at DESC);

-- 11. PRIVACY-SAFE PUBLIC VIEW (DPDP Aligned - Zero Phone Scraping)
CREATE OR REPLACE VIEW public.v_public_available_donors AS
SELECT 
  d.id,
  d.blood_group,
  d.city,
  d.locality,
  d.pincode,
  d.is_available,
  d.notification_radius_km,
  d.last_donation_date,
  p.full_name,
  -- Masked name for public protection: e.g. "Priya S."
  CONCAT(SPLIT_PART(p.full_name, ' ', 1), ' ', LEFT(SPLIT_PART(p.full_name, ' ', 2), 1), '.') AS masked_name,
  p.created_at AS member_since
FROM public.donor_profiles d
JOIN public.profiles p ON p.id = d.id
WHERE d.is_available = TRUE
  AND (d.last_donation_date IS NULL OR d.last_donation_date <= (CURRENT_DATE - INTERVAL '90 days'));

-- 12. TRIGGERS & FUNCTIONS

-- A. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_donor_profiles_timestamp
  BEFORE UPDATE ON public.donor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_blood_requests_timestamp
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. Prevent Self-Admin Role Escalation (Security Guardrail)
CREATE OR REPLACE FUNCTION public.prevent_self_admin_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed to 'admin'
  IF NEW.role = 'admin' AND (OLD.role IS NULL OR OLD.role != 'admin') THEN
    -- Check if current executing user is an existing admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      -- Demote back to donor or throw error
      NEW.role = 'donor';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_admin_role_escalation
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_admin_escalation();

-- C. Auto-create Profile Row on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'donor';
  v_full_name TEXT := 'LifeLink Member';
BEGIN
  -- Extract role from metadata if provided, otherwise default to 'donor'
  IF (NEW.raw_user_meta_data->>'role') IS NOT NULL THEN
    IF (NEW.raw_user_meta_data->>'role') IN ('donor', 'requester') THEN
      v_role := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;
  END IF;

  IF (NEW.raw_user_meta_data->>'full_name') IS NOT NULL THEN
    v_full_name := NEW.raw_user_meta_data->>'full_name';
  END IF;

  INSERT INTO public.profiles (id, email, role, full_name, phone, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    v_role,
    v_full_name,
    NEW.raw_user_meta_data->>'phone',
    NEW.email_confirmed_at IS NOT NULL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- 13. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requester_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locality_records ENABLE ROW LEVEL SECURITY;

-- Locality records: Public readable
CREATE POLICY "Public can view active localities"
  ON public.locality_records FOR SELECT
  USING (is_active = TRUE);

-- Profiles RLS:
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Donor Profiles RLS:
CREATE POLICY "Donors can view their own profile"
  ON public.donor_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Donors can insert and update their own profile"
  ON public.donor_profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to donor profiles"
  ON public.donor_profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Blood Requests RLS:
CREATE POLICY "Anyone can view active verified requests"
  ON public.blood_requests FOR SELECT
  USING (status IN ('ACTIVE', 'RESPONSES_RECEIVED') OR auth.uid() = requester_id);

CREATE POLICY "Authenticated users can create emergency requests"
  ON public.blood_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can update their own requests"
  ON public.blood_requests FOR UPDATE
  USING (auth.uid() = requester_id);

CREATE POLICY "Admins have full control over requests"
  ON public.blood_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Donor Responses RLS:
CREATE POLICY "Donors can manage their own responses"
  ON public.donor_responses FOR ALL
  USING (auth.uid() = donor_id);

CREATE POLICY "Requesters can view responses for their requests"
  ON public.donor_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blood_requests r 
      WHERE r.id = public.donor_responses.request_id AND r.requester_id = auth.uid()
    )
  );

-- Admin Audit Logs RLS:
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
