-- ================================================================
-- MIGRATION: Add Phone International Format and Lead Tracking
-- ================================================================
-- This migration adds phone international format and lead tracking
-- fields to the existing users table
-- 
-- Execute in Supabase SQL Editor ONLY if these fields don't exist yet
-- ================================================================

-- Check if phone field needs to be modified (only if it's currently shorter)
-- This is safe to run multiple times
DO $$
BEGIN
    -- Update phone field size if needed (from VARCHAR(20) to ensure international format)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone' 
        AND character_maximum_length >= 20
    ) THEN
        ALTER TABLE public.users ALTER COLUMN phone TYPE VARCHAR(20);
    END IF;
END $$;

-- Add country_code field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'country_code'
    ) THEN
        ALTER TABLE public.users ADD COLUMN country_code VARCHAR(5) DEFAULT '+55';
    END IF;
END $$;

-- Add lead tracking fields if they don't exist
DO $$
BEGIN
    -- Lead source
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'lead_source'
    ) THEN
        ALTER TABLE public.users ADD COLUMN lead_source VARCHAR(100);
    END IF;

    -- Lead medium
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'lead_medium'
    ) THEN
        ALTER TABLE public.users ADD COLUMN lead_medium VARCHAR(100);
    END IF;

    -- Lead campaign
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'lead_campaign'
    ) THEN
        ALTER TABLE public.users ADD COLUMN lead_campaign VARCHAR(100);
    END IF;

    -- UTM Source
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'utm_source'
    ) THEN
        ALTER TABLE public.users ADD COLUMN utm_source VARCHAR(100);
    END IF;

    -- UTM Medium
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'utm_medium'
    ) THEN
        ALTER TABLE public.users ADD COLUMN utm_medium VARCHAR(100);
    END IF;

    -- UTM Campaign
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'utm_campaign'
    ) THEN
        ALTER TABLE public.users ADD COLUMN utm_campaign VARCHAR(100);
    END IF;

    -- UTM Content
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'utm_content'
    ) THEN
        ALTER TABLE public.users ADD COLUMN utm_content VARCHAR(100);
    END IF;

    -- UTM Term
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'utm_term'
    ) THEN
        ALTER TABLE public.users ADD COLUMN utm_term VARCHAR(100);
    END IF;

    -- Referrer URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'referrer_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN referrer_url TEXT;
    END IF;
END $$;

-- Add indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_country_code ON public.users(country_code);
CREATE INDEX IF NOT EXISTS idx_users_lead_source ON public.users(lead_source);
CREATE INDEX IF NOT EXISTS idx_users_lead_medium ON public.users(lead_medium);
CREATE INDEX IF NOT EXISTS idx_users_utm_source ON public.users(utm_source);
CREATE INDEX IF NOT EXISTS idx_users_utm_campaign ON public.users(utm_campaign);

-- Add comments to document the new fields
COMMENT ON COLUMN public.users.phone IS 'International phone format: +5511999999999 (country code + area code + number)';
COMMENT ON COLUMN public.users.country_code IS 'International country code with + prefix, defaults to +55 (Brazil)';
COMMENT ON COLUMN public.users.lead_source IS 'Lead source: organic, referral, social_media, event, paid_ads, etc.';
COMMENT ON COLUMN public.users.lead_medium IS 'Lead medium: website, whatsapp, instagram, facebook, google, etc.';
COMMENT ON COLUMN public.users.lead_campaign IS 'Specific campaign name if applicable';
COMMENT ON COLUMN public.users.utm_source IS 'UTM source parameter for tracking';
COMMENT ON COLUMN public.users.utm_medium IS 'UTM medium parameter for tracking';
COMMENT ON COLUMN public.users.utm_campaign IS 'UTM campaign parameter for tracking';
COMMENT ON COLUMN public.users.utm_content IS 'UTM content parameter for tracking';
COMMENT ON COLUMN public.users.utm_term IS 'UTM term parameter for tracking';
COMMENT ON COLUMN public.users.referrer_url IS 'Referrer URL when user came from external source';

-- ================================================================
-- PHONE VALIDATION FUNCTIONS (safe to run multiple times)
-- ================================================================

-- Function to validate Brazilian phone format
CREATE OR REPLACE FUNCTION validate_brazilian_phone(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Brazilian phone format: +5511999999999
  -- Must start with +55, have 2-digit area code (11-99), and 8-9 digit number
  RETURN phone_number ~ '^\+55[1-9][0-9][0-9]{8,9}$';
END;
$$ LANGUAGE plpgsql;

-- Function to format phone number to international standard
CREATE OR REPLACE FUNCTION format_phone_international(country_code TEXT, phone_local TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove all non-digits from local phone
  phone_local := regexp_replace(phone_local, '\D', '', 'g');
  
  -- Ensure country code starts with +
  IF NOT country_code ~ '^\+' THEN
    country_code := '+' || country_code;
  END IF;
  
  -- Return formatted international number
  RETURN country_code || phone_local;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ANALYTICS VIEWS (safe to run multiple times)
-- ================================================================

-- Drop existing views if they exist, then recreate
DROP VIEW IF EXISTS lead_analytics;
DROP VIEW IF EXISTS phone_analytics;

-- View for lead source analysis
CREATE VIEW lead_analytics AS
SELECT 
  lead_source,
  lead_medium,
  utm_source,
  utm_campaign,
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as users_last_30_days,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7_days,
  MIN(created_at) as first_user_date,
  MAX(created_at) as last_user_date
FROM public.users
WHERE lead_source IS NOT NULL
GROUP BY lead_source, lead_medium, utm_source, utm_campaign
ORDER BY total_users DESC;

-- View for country/phone analytics
CREATE VIEW phone_analytics AS
SELECT 
  country_code,
  COUNT(*) as total_users,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as users_with_phone,
  ROUND(
    (COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2
  ) as phone_completion_rate
FROM public.users
GROUP BY country_code
ORDER BY total_users DESC;

-- Grant permissions on new views
GRANT SELECT ON lead_analytics TO authenticated;
GRANT SELECT ON phone_analytics TO authenticated;

-- ================================================================
-- VERIFICATION QUERIES (optional - uncomment to check results)
-- ================================================================

-- Uncomment these to verify the migration worked:

-- SELECT column_name, data_type, character_maximum_length, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- SELECT indexname FROM pg_indexes WHERE tablename = 'users' AND schemaname = 'public';

-- SELECT * FROM lead_analytics LIMIT 5;
-- SELECT * FROM phone_analytics LIMIT 5;

-- ================================================================
-- END OF MIGRATION
-- ================================================================