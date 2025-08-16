-- Migration: Fix RLS infinite recursion in users table
-- Created: 2025-01-06

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins and pastors can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Admins and pastors can view all tracking data" ON user_lead_tracking;
DROP POLICY IF EXISTS "Only admins can manage tracking records" ON user_lead_tracking;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;  
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON users;

-- Create safe policies for users table without recursion
CREATE POLICY "Users can view own profile" ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup" ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Temporary policy for admin operations (will be replaced with service role)
CREATE POLICY "Service role can manage all users" ON users
FOR ALL
USING (auth.role() = 'service_role');

-- Simple policies for user_lead_tracking without user role checks
CREATE POLICY "Enable read access for authenticated users" ON user_lead_tracking
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    auth.role() = 'service_role' OR 
    auth.uid() = user_id
  )
);

CREATE POLICY "Enable insert for tracking system" ON user_lead_tracking
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Service role can update tracking records" ON user_lead_tracking
FOR UPDATE
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete tracking records" ON user_lead_tracking
FOR DELETE
USING (auth.role() = 'service_role');

-- Add comments for clarity
COMMENT ON POLICY "Users can view own profile" ON users IS 
'Allows users to view their own profile data only';

COMMENT ON POLICY "Service role can manage all users" ON users IS 
'Allows service role to manage all users for admin operations';

COMMENT ON POLICY "Enable read access for authenticated users" ON user_lead_tracking IS 
'Allows users to read their own tracking data, service role can read all';

COMMENT ON POLICY "Enable insert for tracking system" ON user_lead_tracking IS 
'Allows system to create tracking records for authenticated operations';