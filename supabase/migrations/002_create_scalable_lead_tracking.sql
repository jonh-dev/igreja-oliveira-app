-- ================================================================
-- MIGRATION: Create Scalable Lead Tracking System
-- ================================================================
-- This migration creates a separate table for lead tracking to keep
-- the users table clean and scalable
-- 
-- IMPORTANT: Run this INSTEAD of migration 001 for a clean architecture
-- ================================================================

-- ================================================================
-- STEP 1: Add only essential phone fields to users table
-- ================================================================

-- Add country_code field if it doesn't exist (essential user data)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'country_code'
    ) THEN
        ALTER TABLE public.users ADD COLUMN country_code VARCHAR(5) DEFAULT '+55';
    END IF;
END $$;

-- Ensure phone field supports international format (essential user data)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone' 
        AND character_maximum_length >= 20
    ) THEN
        ALTER TABLE public.users ALTER COLUMN phone TYPE VARCHAR(20);
    END IF;
END $$;

-- Add essential indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_country_code ON public.users(country_code);

-- ================================================================
-- STEP 2: Create dedicated lead tracking table
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_lead_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Primary tracking fields
    lead_source VARCHAR(100), -- 'organic', 'referral', 'social_media', 'event', 'paid_ads'
    lead_medium VARCHAR(100), -- 'website', 'whatsapp', 'instagram', 'facebook', 'google'
    lead_campaign VARCHAR(100), -- Specific campaign name
    
    -- UTM parameters (for detailed campaign tracking)
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100), 
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Additional tracking data
    referrer_url TEXT,
    landing_page VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45), -- IPv6 compatible
    device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
    browser VARCHAR(100),
    platform VARCHAR(100), -- 'ios', 'android', 'web'
    
    -- Conversion tracking
    conversion_type VARCHAR(100), -- 'registration', 'first_login', 'first_donation', etc.
    conversion_value DECIMAL(10,2), -- For tracking monetary conversions
    
    -- Metadata
    tracking_data JSONB, -- Flexible field for additional tracking data
    is_primary BOOLEAN DEFAULT false, -- Mark the primary/first tracking record
    
    -- Timestamps
    tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- STEP 3: Create indexes for performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_lead_tracking_user_id ON public.user_lead_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_source ON public.user_lead_tracking(lead_source);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_medium ON public.user_lead_tracking(lead_medium);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_campaign ON public.user_lead_tracking(lead_campaign);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_utm_source ON public.user_lead_tracking(utm_source);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_utm_campaign ON public.user_lead_tracking(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_conversion_type ON public.user_lead_tracking(conversion_type);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_tracked_at ON public.user_lead_tracking(tracked_at);
CREATE INDEX IF NOT EXISTS idx_lead_tracking_is_primary ON public.user_lead_tracking(is_primary);

-- JSONB index for flexible querying
CREATE INDEX IF NOT EXISTS idx_lead_tracking_data ON public.user_lead_tracking USING GIN (tracking_data);

-- ================================================================
-- STEP 4: Create updated_at trigger
-- ================================================================

CREATE TRIGGER update_user_lead_tracking_updated_at 
    BEFORE UPDATE ON public.user_lead_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- STEP 5: Row Level Security (RLS)
-- ================================================================

ALTER TABLE public.user_lead_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own tracking data
CREATE POLICY "Users can view own tracking data" ON public.user_lead_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Only admins and pastors can view all tracking data (for analytics)
CREATE POLICY "Admins and pastors can view all tracking data" ON public.user_lead_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor')
        )
    );

-- System can create tracking records (usually via backend/API)
CREATE POLICY "System can create tracking records" ON public.user_lead_tracking
    FOR INSERT WITH CHECK (true);

-- Only admins can update/delete tracking records
CREATE POLICY "Only admins can manage tracking records" ON public.user_lead_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ================================================================
-- STEP 6: Enhanced analytics views
-- ================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS lead_analytics;
DROP VIEW IF EXISTS phone_analytics;
DROP VIEW IF EXISTS conversion_analytics;

-- Enhanced lead analytics view
CREATE VIEW lead_analytics AS
SELECT 
    lt.lead_source,
    lt.lead_medium,
    lt.utm_source,
    lt.utm_campaign,
    lt.conversion_type,
    COUNT(DISTINCT lt.user_id) as unique_users,
    COUNT(*) as total_events,
    COUNT(CASE WHEN lt.tracked_at >= NOW() - INTERVAL '30 days' THEN 1 END) as events_last_30_days,
    COUNT(CASE WHEN lt.tracked_at >= NOW() - INTERVAL '7 days' THEN 1 END) as events_last_7_days,
    SUM(lt.conversion_value) as total_conversion_value,
    MIN(lt.tracked_at) as first_event_date,
    MAX(lt.tracked_at) as last_event_date
FROM public.user_lead_tracking lt
GROUP BY lt.lead_source, lt.lead_medium, lt.utm_source, lt.utm_campaign, lt.conversion_type
ORDER BY unique_users DESC;

-- Phone analytics (from users table)
CREATE VIEW phone_analytics AS
SELECT 
    u.country_code,
    COUNT(*) as total_users,
    COUNT(CASE WHEN u.phone IS NOT NULL THEN 1 END) as users_with_phone,
    ROUND(
        (COUNT(CASE WHEN u.phone IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as phone_completion_rate
FROM public.users u
GROUP BY u.country_code
ORDER BY total_users DESC;

-- New: Conversion funnel analytics (focused on leads only)
CREATE VIEW conversion_analytics AS
SELECT 
    lt.lead_source,
    lt.lead_medium,
    COUNT(CASE WHEN lt.conversion_type = 'registration' THEN 1 END) as registrations,
    COUNT(CASE WHEN lt.conversion_type = 'first_login' THEN 1 END) as first_logins,
    ROUND(
        COUNT(CASE WHEN lt.conversion_type = 'first_login' THEN 1 END) * 100.0 
        / NULLIF(COUNT(CASE WHEN lt.conversion_type = 'registration' THEN 1 END), 0), 2
    ) as login_conversion_rate
FROM public.user_lead_tracking lt
WHERE lt.conversion_type IN ('registration', 'first_login')
GROUP BY lt.lead_source, lt.lead_medium
ORDER BY registrations DESC;

-- ================================================================
-- STEP 7: Helper functions
-- ================================================================

-- Function to get primary tracking record for a user
CREATE OR REPLACE FUNCTION get_user_primary_tracking(user_uuid UUID)
RETURNS public.user_lead_tracking AS $$
DECLARE
    tracking_record public.user_lead_tracking;
BEGIN
    SELECT * INTO tracking_record
    FROM public.user_lead_tracking
    WHERE user_id = user_uuid AND is_primary = true
    ORDER BY tracked_at ASC
    LIMIT 1;
    
    -- If no primary record, get the first one
    IF tracking_record IS NULL THEN
        SELECT * INTO tracking_record
        FROM public.user_lead_tracking
        WHERE user_id = user_uuid
        ORDER BY tracked_at ASC
        LIMIT 1;
    END IF;
    
    RETURN tracking_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create tracking record
CREATE OR REPLACE FUNCTION create_lead_tracking_record(
    p_user_id UUID,
    p_lead_source VARCHAR DEFAULT NULL,
    p_lead_medium VARCHAR DEFAULT NULL,
    p_utm_source VARCHAR DEFAULT NULL,
    p_utm_campaign VARCHAR DEFAULT NULL,
    p_conversion_type VARCHAR DEFAULT 'registration',
    p_is_primary BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    tracking_id UUID;
BEGIN
    INSERT INTO public.user_lead_tracking (
        user_id, lead_source, lead_medium, utm_source, utm_campaign, 
        conversion_type, is_primary
    ) VALUES (
        p_user_id, p_lead_source, p_lead_medium, p_utm_source, p_utm_campaign,
        p_conversion_type, p_is_primary
    ) RETURNING id INTO tracking_id;
    
    RETURN tracking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- STEP 8: Phone validation functions (from previous migration)
-- ================================================================

CREATE OR REPLACE FUNCTION validate_brazilian_phone(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN phone_number ~ '^\+55[1-9][0-9][0-9]{8,9}$';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION format_phone_international(country_code TEXT, phone_local TEXT)
RETURNS TEXT AS $$
BEGIN
    phone_local := regexp_replace(phone_local, '\D', '', 'g');
    
    IF NOT country_code ~ '^\+' THEN
        country_code := '+' || country_code;
    END IF;
    
    RETURN country_code || phone_local;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- STEP 9: Grant permissions
-- ================================================================

GRANT ALL ON public.user_lead_tracking TO authenticated;
GRANT SELECT ON lead_analytics TO authenticated;
GRANT SELECT ON phone_analytics TO authenticated;
GRANT SELECT ON conversion_analytics TO authenticated;

-- ================================================================
-- STEP 10: Comments for documentation
-- ================================================================

COMMENT ON TABLE public.user_lead_tracking IS 'Scalable lead tracking system - separate from users table for better performance and flexibility';
COMMENT ON COLUMN public.user_lead_tracking.lead_source IS 'Primary source: organic, referral, social_media, event, paid_ads, etc.';
COMMENT ON COLUMN public.user_lead_tracking.lead_medium IS 'Traffic medium: website, whatsapp, instagram, facebook, google, etc.';
COMMENT ON COLUMN public.user_lead_tracking.conversion_type IS 'Type of conversion: registration, first_login, first_donation, etc.';
COMMENT ON COLUMN public.user_lead_tracking.is_primary IS 'Marks the primary/first tracking record for the user';
COMMENT ON COLUMN public.user_lead_tracking.tracking_data IS 'JSONB field for flexible additional tracking data';

COMMENT ON COLUMN public.users.phone IS 'International phone format: +5511999999999 (country code + area code + number)';
COMMENT ON COLUMN public.users.country_code IS 'International country code with + prefix, defaults to +55 (Brazil)';

-- ================================================================
-- VERIFICATION QUERIES (uncomment to test)
-- ================================================================

-- SELECT * FROM lead_analytics LIMIT 5;
-- SELECT * FROM phone_analytics LIMIT 5;
-- SELECT * FROM conversion_analytics LIMIT 5;

-- Test tracking record creation:
-- SELECT create_lead_tracking_record(
--     '550e8400-e29b-41d4-a716-446655440000'::UUID,
--     'social_media',
--     'instagram',
--     'instagram_story',
--     'christmas_campaign_2025',
--     'registration',
--     true
-- );

-- ================================================================
-- END OF MIGRATION
-- ================================================================