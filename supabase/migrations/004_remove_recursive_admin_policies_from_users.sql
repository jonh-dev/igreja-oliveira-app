-- Migration: Remove recursive RLS policies that cause infinite recursion
-- Created to fix: "infinite recursion detected in policy for relation users"
-- Date: 2025-01-16

-- Remove the problematic recursive policies
DROP POLICY IF EXISTS "Admins can manage everything" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Ensure only safe minimal policies exist
-- These policies do not query the users table and therefore cannot cause recursion

-- Policy for users to view their own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.users 
    FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- Policy for users to update their own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Policy for authenticated users to insert during signup/upsert
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Enable insert for authenticated users during signup'
  ) THEN
    CREATE POLICY "Enable insert for authenticated users during signup" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Policy for service role to manage all users (for administrative operations)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Service role can manage all users'
  ) THEN
    CREATE POLICY "Service role can manage all users" ON public.users 
    FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Verify RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Comment: This migration removes recursive policies that query the users table 
-- from within RLS policies on the same table, which causes infinite recursion.
-- The remaining policies are safe as they only reference auth.uid() and auth.role().