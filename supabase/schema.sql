-- ================================================================
-- IGREJA OLIVEIRA APP - SUPABASE DATABASE SCHEMA
-- ================================================================
-- This script creates all necessary tables, indexes, and RLS policies
-- for the Igreja Oliveira church management system
--
-- Execute this script in your Supabase SQL Editor
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- USERS TABLE (extends Supabase auth.users)
-- ================================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20), -- Formato: +5511999999999 (código país + DDD + número)
  country_code VARCHAR(5) DEFAULT '+55', -- Código internacional do país
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'deacon', 'leader', 'member')),
  lead_source VARCHAR(100), -- Origem do lead: 'organic', 'referral', 'social_media', 'event', etc.
  lead_medium VARCHAR(100), -- Meio: 'website', 'whatsapp', 'instagram', 'facebook', etc.
  lead_campaign VARCHAR(100), -- Campanha específica se aplicável
  utm_source VARCHAR(100), -- UTM tracking
  utm_medium VARCHAR(100), -- UTM tracking
  utm_campaign VARCHAR(100), -- UTM tracking
  utm_content VARCHAR(100), -- UTM tracking
  utm_term VARCHAR(100), -- UTM tracking
  referrer_url TEXT, -- URL de referência quando aplicável
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_country_code ON public.users(country_code);
CREATE INDEX idx_users_lead_source ON public.users(lead_source);
CREATE INDEX idx_users_lead_medium ON public.users(lead_medium);
CREATE INDEX idx_users_utm_source ON public.users(utm_source);
CREATE INDEX idx_users_utm_campaign ON public.users(utm_campaign);

-- ================================================================
-- ADDRESSES TABLE
-- ================================================================

CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  street VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2),
  zip_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'Brasil',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for addresses table
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_addresses_zip_code ON public.addresses(zip_code);
CREATE INDEX idx_addresses_is_default ON public.addresses(is_default);

-- ================================================================
-- DONATIONS TABLE
-- ================================================================

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  type VARCHAR(20) NOT NULL DEFAULT 'tithe' CHECK (type IN ('tithe', 'offering', 'special')),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for donations table
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_type ON public.donations(type);
CREATE INDEX idx_donations_date ON public.donations(date);
CREATE INDEX idx_donations_created_at ON public.donations(created_at);
CREATE INDEX idx_donations_amount ON public.donations(amount);

-- ================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at 
  BEFORE UPDATE ON public.addresses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at 
  BEFORE UPDATE ON public.donations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at 
  BEFORE UPDATE ON public.integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES FOR USERS TABLE
-- ================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins and pastors can view all users
CREATE POLICY "Admins and pastors can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- New users can be created during registration
CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================================================
-- RLS POLICIES FOR ADDRESSES TABLE
-- ================================================================

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own addresses
CREATE POLICY "Users can create own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Admins and pastors can view all addresses
CREATE POLICY "Admins and pastors can view all addresses" ON public.addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- ================================================================
-- RLS POLICIES FOR DONATIONS TABLE
-- ================================================================

-- Users can view their own donations
CREATE POLICY "Users can view own donations" ON public.donations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own donations
CREATE POLICY "Users can create own donations" ON public.donations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own donations
CREATE POLICY "Users can update own donations" ON public.donations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own donations
CREATE POLICY "Users can delete own donations" ON public.donations
  FOR DELETE USING (auth.uid() = user_id);

-- Admins and pastors can view all donations
CREATE POLICY "Admins and pastors can view all donations" ON public.donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- Admins and pastors can manage all donations
CREATE POLICY "Admins and pastors can manage all donations" ON public.donations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- ================================================================
-- RLS POLICIES FOR INTEGRATIONS TABLE
-- ================================================================

-- Only admins and pastors can create integrations
CREATE POLICY "Only admins and pastors can create integrations" ON public.integrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- Only admins and pastors can view integrations
CREATE POLICY "Only admins and pastors can view integrations" ON public.integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- Only admins and pastors can update integrations
CREATE POLICY "Only admins and pastors can update integrations" ON public.integrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- Only admins and pastors can delete integrations
CREATE POLICY "Only admins and pastors can delete integrations" ON public.integrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- ================================================================
-- RLS POLICIES FOR INTEGRATION_SYNC_LOGS TABLE
-- ================================================================

-- Only admins and pastors can view sync logs
CREATE POLICY "Only admins and pastors can view sync logs" ON public.integration_sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'pastor')
    )
  );

-- System can create sync logs (through service account)
CREATE POLICY "System can create sync logs" ON public.integration_sync_logs
  FOR INSERT WITH CHECK (true);

-- Only admins can delete sync logs (for cleanup)
CREATE POLICY "Only admins can delete sync logs" ON public.integration_sync_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ================================================================
-- FUNCTIONS FOR CHURCH HIERARCHY PERMISSIONS
-- ================================================================

-- Function to check if user can access another user's data based on hierarchy
CREATE OR REPLACE FUNCTION can_access_user_data(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role VARCHAR(20);
  target_user_role VARCHAR(20);
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Get target user role
  SELECT role INTO target_user_role 
  FROM public.users 
  WHERE id = target_user_id;
  
  -- Admin can access everything
  IF current_user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Pastor can access deacon, leader, member
  IF current_user_role = 'pastor' AND target_user_role IN ('deacon', 'leader', 'member') THEN
    RETURN TRUE;
  END IF;
  
  -- Deacon can access leader and member
  IF current_user_role = 'deacon' AND target_user_role IN ('leader', 'member') THEN
    RETURN TRUE;
  END IF;
  
  -- Leader can access member
  IF current_user_role = 'leader' AND target_user_role = 'member' THEN
    RETURN TRUE;
  END IF;
  
  -- Users can always access their own data
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- INTEGRATIONS TABLE
-- ================================================================

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('banking', 'payment', 'members', 'events')),
  provider VARCHAR(100) NOT NULL, -- 'CREVISC', 'BB', 'Itau', etc.
  provider_account_id VARCHAR(255), -- Agência/Conta ou identificador externo
  status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
  encrypted_credentials TEXT, -- Tokens, refresh_tokens criptografados
  consent_id VARCHAR(255), -- ID do consentimento Open Finance
  consent_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency_hours INTEGER DEFAULT 24, -- Frequência de sincronização
  permissions JSON, -- Permissões específicas concedidas
  metadata JSON, -- Dados adicionais específicos do provider
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for integrations table
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_integrations_type ON public.integrations(integration_type);
CREATE INDEX idx_integrations_provider ON public.integrations(provider);
CREATE INDEX idx_integrations_status ON public.integrations(status);
CREATE INDEX idx_integrations_consent_expires ON public.integrations(consent_expires_at);
CREATE INDEX idx_integrations_last_sync ON public.integrations(last_sync_at);
CREATE INDEX idx_integrations_is_active ON public.integrations(is_active);

-- ================================================================
-- INTEGRATION SYNC LOGS TABLE
-- ================================================================

CREATE TABLE public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL, -- 'manual', 'automatic', 'consent_renewal'
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  records_processed INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSON, -- Detalhes específicos do sync
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for integration_sync_logs table
CREATE INDEX idx_sync_logs_integration_id ON public.integration_sync_logs(integration_id);
CREATE INDEX idx_sync_logs_status ON public.integration_sync_logs(status);
CREATE INDEX idx_sync_logs_sync_started ON public.integration_sync_logs(sync_started_at);
CREATE INDEX idx_sync_logs_created_at ON public.integration_sync_logs(created_at);

-- ================================================================
-- PHONE VALIDATION FUNCTIONS
-- ================================================================

-- Function to validate Brazilian phone format
CREATE OR REPLACE FUNCTION validate_brazilian_phone(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Brazilian phone format: +5511999999999 or +55(11)99999-9999
  -- Must start with +55, have 2-digit area code, and 8-9 digit number
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
-- LEAD ANALYTICS VIEWS
-- ================================================================

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

-- ================================================================
-- CHURCH STATISTICS VIEWS
-- ================================================================

-- View for donation statistics
CREATE VIEW donation_statistics AS
SELECT 
  type,
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  DATE_TRUNC('month', date) as month
FROM public.donations
GROUP BY type, DATE_TRUNC('month', date)
ORDER BY month DESC, type;

-- View for user statistics by role
CREATE VIEW user_statistics AS
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
FROM public.users
GROUP BY role
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'pastor' THEN 2
    WHEN 'deacon' THEN 3
    WHEN 'leader' THEN 4
    WHEN 'member' THEN 5
  END;

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on tables
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.addresses TO authenticated;
GRANT ALL ON public.donations TO authenticated;
GRANT ALL ON public.integrations TO authenticated;
GRANT ALL ON public.integration_sync_logs TO authenticated;

-- Grant permissions on views
GRANT SELECT ON donation_statistics TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;
GRANT SELECT ON lead_analytics TO authenticated;
GRANT SELECT ON phone_analytics TO authenticated;

-- Grant permissions on sequences (for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- INITIAL DATA (OPTIONAL)
-- ================================================================

-- Insert initial admin user (update with actual admin email)
-- This should be done after the first admin signs up through auth
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@igreja-oliveira.com.br';

-- ================================================================
-- SCHEMA VALIDATION QUERIES
-- ================================================================

-- Uncomment these queries to validate the schema after creation:

-- SELECT table_name, column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name, ordinal_position;

-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- ================================================================
-- END OF SCHEMA
-- ================================================================