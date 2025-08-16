-- Migration: Cleanup Unactivated Accounts
-- Description: Creates automated cleanup process for unactivated user accounts
-- Date: 2025-01-16

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS cleanup_unactivated_accounts(INTEGER);

-- Function to cleanup unactivated accounts older than specified days
CREATE OR REPLACE FUNCTION cleanup_unactivated_accounts(
  days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE(
  deleted_count INTEGER,
  cleanup_summary JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_deleted_count INTEGER := 0;
  public_deleted_count INTEGER := 0;
  addresses_deleted_count INTEGER := 0;
  user_ids_to_delete UUID[];
  cleanup_log JSONB;
BEGIN
  -- Get list of unactivated user IDs older than threshold
  SELECT ARRAY_AGG(au.id)
  INTO user_ids_to_delete
  FROM auth.users au
  WHERE au.email_confirmed_at IS NULL 
    AND au.phone_confirmed_at IS NULL 
    AND au.confirmed_at IS NULL
    AND au.created_at < NOW() - (days_threshold || ' days')::INTERVAL;

  -- If no users to delete, return early
  IF user_ids_to_delete IS NULL OR array_length(user_ids_to_delete, 1) = 0 THEN
    RETURN QUERY SELECT 
      0 as deleted_count,
      jsonb_build_object(
        'timestamp', NOW(),
        'threshold_days', days_threshold,
        'auth_users_deleted', 0,
        'public_users_deleted', 0,
        'addresses_deleted', 0,
        'message', 'No unactivated accounts found to cleanup'
      ) as cleanup_summary;
    RETURN;
  END IF;

  -- Delete related addresses first (foreign key constraint)
  DELETE FROM public.addresses 
  WHERE user_id = ANY(user_ids_to_delete);
  GET DIAGNOSTICS addresses_deleted_count = ROW_COUNT;

  -- Delete from public.users table
  DELETE FROM public.users 
  WHERE id = ANY(user_ids_to_delete);
  GET DIAGNOSTICS public_deleted_count = ROW_COUNT;

  -- Delete from auth.users table (this will cascade to identities)
  DELETE FROM auth.users 
  WHERE id = ANY(user_ids_to_delete);
  GET DIAGNOSTICS auth_deleted_count = ROW_COUNT;

  -- Create cleanup summary
  cleanup_log := jsonb_build_object(
    'timestamp', NOW(),
    'threshold_days', days_threshold,
    'auth_users_deleted', auth_deleted_count,
    'public_users_deleted', public_deleted_count,
    'addresses_deleted', addresses_deleted_count,
    'deleted_user_ids', user_ids_to_delete
  );

  -- Log the cleanup operation
  INSERT INTO public.system_logs (event_type, details, created_at)
  VALUES ('account_cleanup', cleanup_log, NOW());

  RETURN QUERY SELECT 
    auth_deleted_count as deleted_count,
    cleanup_log as cleanup_summary;
END;
$$;

-- Create system_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for system_logs (admin only)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can access system logs" ON public.system_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Function to get cleanup statistics
CREATE OR REPLACE FUNCTION get_cleanup_statistics()
RETURNS TABLE(
  total_unactivated INTEGER,
  old_unactivated INTEGER,
  recent_cleanups JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (
      SELECT COUNT(*)::INTEGER 
      FROM auth.users 
      WHERE email_confirmed_at IS NULL 
        AND phone_confirmed_at IS NULL 
        AND confirmed_at IS NULL
    ) as total_unactivated,
    (
      SELECT COUNT(*)::INTEGER 
      FROM auth.users 
      WHERE email_confirmed_at IS NULL 
        AND phone_confirmed_at IS NULL 
        AND confirmed_at IS NULL
        AND created_at < NOW() - INTERVAL '7 days'
    ) as old_unactivated,
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'timestamp', created_at,
          'details', details
        ) ORDER BY created_at DESC
      ), '[]'::jsonb)
      FROM public.system_logs 
      WHERE event_type = 'account_cleanup'
        AND created_at > NOW() - INTERVAL '30 days'
      LIMIT 10
    ) as recent_cleanups;
END;
$$;

-- Grant execute permissions to authenticated users (with proper RLS)
GRANT EXECUTE ON FUNCTION get_cleanup_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_unactivated_accounts(INTEGER) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION cleanup_unactivated_accounts(INTEGER) IS 
'Automated cleanup function for unactivated user accounts. Removes accounts older than specified days that have not been confirmed via email, phone, or general confirmation.';

COMMENT ON FUNCTION get_cleanup_statistics() IS 
'Returns statistics about unactivated accounts and recent cleanup operations.';

COMMENT ON TABLE public.system_logs IS 
'System-wide logging table for administrative operations and cleanup activities.';