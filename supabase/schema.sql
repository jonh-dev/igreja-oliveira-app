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
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'deacon', 'leader', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);

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

-- ================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

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

-- Grant permissions on views
GRANT SELECT ON donation_statistics TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;

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