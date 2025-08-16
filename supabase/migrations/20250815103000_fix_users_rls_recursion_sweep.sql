-- Migration: Sweep recursive RLS policies on public.users and recreate safe ones
-- Date: 2025-08-15

-- Ensure RLS is enabled (idempotent)
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop any policy on users that references users again in its qualifier (recursive)
DO $$
DECLARE r record;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND (qual ILIKE '% from public.users %' OR qual ILIKE '% from users %')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
  END LOOP;
END $$;

-- Drop specific known-problematic policies if they exist (defensive)
DROP POLICY IF EXISTS "Admins and pastors can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Create minimal safe policies if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='users' AND policyname='Users can view own profile'
  ) THEN
    EXECUTE $$CREATE POLICY "Users can view own profile" ON public.users
      FOR SELECT USING (auth.uid() = id)$$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='users' AND policyname='Users can update own profile'
  ) THEN
    EXECUTE $$CREATE POLICY "Users can update own profile" ON public.users
      FOR UPDATE USING (auth.uid() = id)$$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='users' AND policyname='Enable insert for authenticated users during signup'
  ) THEN
    EXECUTE $$CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id)$$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='users' AND policyname='Service role can manage all users'
  ) THEN
    EXECUTE $$CREATE POLICY "Service role can manage all users" ON public.users
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role')$$;
  END IF;
END $$;

-- Notes:
-- - We intentionally avoid any policy that SELECTs from public.users inside the users policies
--   to prevent "infinite recursion detected in policy for relation 'users'" during INSERT/UPDATE/SELECT.
-- - Admin-wide access, when needed, should be done via service role or dedicated RPCs with SECURITY DEFINER.
