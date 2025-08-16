-- Migration: User signup trigger, phone uniqueness, and RPC for phone availability
-- Creates AFTER INSERT trigger on auth.users to populate public.users
-- Adds unique constraint on phone and RPC to check phone availability

-- Function to handle new auth users and insert into public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');

  INSERT INTO public.users (id, email, full_name, phone, country_code, role)
  VALUES (NEW.id, NEW.email, COALESCE(v_full_name, NEW.email), v_phone, '+55', 'member')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

-- Unique index for phone when not null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uniq_users_phone_not_null'
  ) THEN
    -- Deduplicate phone values keeping the smallest id per phone
    WITH d AS (
      SELECT phone, MIN(id) AS keep_id
      FROM public.users
      WHERE phone IS NOT NULL
      GROUP BY phone
      HAVING COUNT(*) > 1
    )
    UPDATE public.users u
    SET phone = NULL
    FROM d
    WHERE u.phone = d.phone AND u.id <> d.keep_id;

    CREATE UNIQUE INDEX uniq_users_phone_not_null ON public.users (phone) WHERE phone IS NOT NULL;
  END IF;
END$$;

-- Ensure email uniqueness is case-insensitive by creating a unique index on lower(email)
DO $$
DECLARE
  has_case_insensitive_dups BOOLEAN;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uniq_users_lower_email'
  ) THEN
    SELECT EXISTS (
      SELECT 1
      FROM (
        SELECT LOWER(email) AS lower_email, COUNT(*)
        FROM public.users
        GROUP BY LOWER(email)
        HAVING COUNT(*) > 1
      ) t
    ) INTO has_case_insensitive_dups;

    IF has_case_insensitive_dups THEN
      RAISE NOTICE 'Not creating uniq_users_lower_email because case-insensitive duplicates exist. Please resolve duplicates first.';
    ELSE
      CREATE UNIQUE INDEX uniq_users_lower_email ON public.users (LOWER(email));
    END IF;
  END IF;
END$$;

-- RPC: check if phone is available (returns true when not used)
CREATE OR REPLACE FUNCTION public.is_phone_available(phone_in TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF phone_in IS NULL OR length(phone_in) = 0 THEN
    RETURN TRUE;
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.users WHERE phone = phone_in) INTO v_exists;
  RETURN NOT v_exists;
END;
$$;

REVOKE ALL ON FUNCTION public.is_phone_available(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_phone_available(TEXT) TO anon, authenticated;
