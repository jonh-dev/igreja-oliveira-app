-- Migration: Auto-create user and address on email confirmation
-- Creates trigger to automatically create user profile and address when email is confirmed
-- This ensures users and addresses are created even before full activation

-- Function to handle email confirmation and create user profile with address
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_address JSONB;
  v_user_exists BOOLEAN;
BEGIN
  -- Only proceed if email_confirmed_at was just set (email confirmation)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Extract user metadata
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
    
    -- Check if user already exists in public.users
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = NEW.id) INTO v_user_exists;
    
    -- Create user in public.users if not exists
    IF NOT v_user_exists THEN
      INSERT INTO public.users (id, email, full_name, phone, country_code, role)
      VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(v_full_name, NEW.email), 
        v_phone, 
        '+55', 
        'member'
      )
      ON CONFLICT (id) DO NOTHING;
      
      RAISE LOG 'Created user profile for %: % (phone: %)', NEW.email, v_full_name, v_phone;
    END IF;
    
    -- Try to extract address from app_metadata (saved during registration)
    v_address := NEW.raw_app_meta_data->'pending_address';
    
    -- Create address if address data exists and no default address exists for user
    IF v_address IS NOT NULL AND NOT EXISTS(
      SELECT 1 FROM public.addresses WHERE user_id = NEW.id AND is_default = true
    ) THEN
      INSERT INTO public.addresses (
        user_id,
        street,
        number,
        neighborhood,
        city,
        state,
        zip_code,
        country,
        is_default
      )
      VALUES (
        NEW.id,
        v_address->>'street',
        v_address->>'number',
        v_address->>'neighborhood',
        v_address->>'city',
        v_address->>'state',
        v_address->>'zipCode',
        COALESCE(v_address->>'country', 'Brasil'),
        true
      )
      ON CONFLICT DO NOTHING;
      
      RAISE LOG 'Created address for user %: %, % - %, %', 
        NEW.email, 
        v_address->>'street', 
        v_address->>'number',
        v_address->>'neighborhood',
        v_address->>'city';
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Function to save pending address data during signup
CREATE OR REPLACE FUNCTION public.save_pending_address_data(
  user_id UUID,
  address_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's app_metadata with pending address data
  UPDATE auth.users 
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('pending_address', address_data)
  WHERE id = user_id;
  
  RAISE LOG 'Saved pending address data for user %', user_id;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.save_pending_address_data(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_pending_address_data(UUID, JSONB) TO authenticated, service_role;

-- Function to create user and address immediately (for pre-activation creation)
CREATE OR REPLACE FUNCTION public.create_user_with_address(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_address JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user in public.users
  INSERT INTO public.users (id, email, full_name, phone, country_code, role)
  VALUES (
    p_user_id, 
    p_email, 
    p_full_name, 
    p_phone, 
    CASE WHEN p_phone IS NOT NULL THEN '+55' ELSE NULL END, 
    'member'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  
  -- Create address if provided
  IF p_address IS NOT NULL THEN
    INSERT INTO public.addresses (
      user_id,
      street,
      number,
      neighborhood,
      city,
      state,
      zip_code,
      country,
      is_default
    )
    VALUES (
      p_user_id,
      p_address->>'street',
      p_address->>'number',
      p_address->>'neighborhood',
      p_address->>'city',
      p_address->>'state',
      p_address->>'zipCode',
      COALESCE(p_address->>'country', 'Brasil'),
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RAISE LOG 'Created user % with address immediately', p_email;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.create_user_with_address(UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_user_with_address(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;

-- Function for automated cleanup of unactivated accounts
CREATE OR REPLACE FUNCTION public.cleanup_unactivated_accounts(
  days_threshold INTEGER DEFAULT 7
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Find and delete unactivated users older than threshold
  FOR user_record IN
    SELECT id, email, created_at
    FROM auth.users
    WHERE email_confirmed_at IS NULL
      AND created_at < NOW() - (days_threshold || ' days')::INTERVAL
  LOOP
    -- Delete from auth.users (cascade will handle public.users and addresses)
    DELETE FROM auth.users WHERE id = user_record.id;
    deleted_count := deleted_count + 1;
    
    RAISE LOG 'Deleted unactivated account: % (created: %)', 
      user_record.email, user_record.created_at;
  END LOOP;
  
  RAISE LOG 'Cleanup completed: % unactivated accounts deleted', deleted_count;
  RETURN deleted_count;
END;
$$;

-- Grant permissions for cleanup function
REVOKE ALL ON FUNCTION public.cleanup_unactivated_accounts(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_unactivated_accounts(INTEGER) TO service_role;

-- Create a scheduled job for cleanup (requires pg_cron extension)
-- This will run daily at 2 AM to clean up accounts older than 7 days
-- Uncomment the following lines if pg_cron is available:
-- SELECT cron.schedule('cleanup-unactivated-accounts', '0 2 * * *', 'SELECT public.cleanup_unactivated_accounts(7);');

COMMENT ON FUNCTION public.handle_email_confirmation() IS 'Automatically creates user profile and address when email is confirmed';
COMMENT ON FUNCTION public.save_pending_address_data(UUID, JSONB) IS 'Saves address data in user metadata for later creation';
COMMENT ON FUNCTION public.create_user_with_address(UUID, TEXT, TEXT, TEXT, JSONB) IS 'Creates user and address immediately, even before email confirmation';
COMMENT ON FUNCTION public.cleanup_unactivated_accounts(INTEGER) IS 'Removes unactivated user accounts older than specified days';