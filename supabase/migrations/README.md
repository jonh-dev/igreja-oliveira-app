# Database Migrations

This folder contains database migration scripts for the Igreja Oliveira App.

## How to Apply Migrations

### 1. Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content of the migration file
4. Click **Run** to execute

### 2. Using Supabase CLI
```bash
# Apply a specific migration
supabase db push

# Or apply all pending migrations
supabase db reset
```

## Migration Files

### 001_add_phone_and_lead_tracking.sql
**Purpose**: Adds international phone format and lead tracking capabilities to existing users table.

**What it does**:
- Modifies `phone` field to support international format (`+5511999999999`)
- Adds `country_code` field with default `+55` (Brazil)
- Adds lead tracking fields: `lead_source`, `lead_medium`, `lead_campaign`
- Adds UTM tracking fields: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Adds `referrer_url` for tracking external referrers
- Creates optimized indexes for analytics queries
- Creates validation functions for Brazilian phone numbers
- Creates analytics views: `lead_analytics` and `phone_analytics`

**Safety**: 
- ✅ Safe to run multiple times (uses `IF NOT EXISTS` checks)
- ✅ Non-destructive (only adds new fields)
- ✅ Preserves existing data
- ✅ Includes verification queries

**Requirements**: 
- Existing `users` table must be present
- PostgreSQL database with UUID extension

## Migration Naming Convention

```
[NUMBER]_[DESCRIPTION].sql

Examples:
001_add_phone_and_lead_tracking.sql
002_create_integrations_table.sql
003_add_donations_categories.sql
```

## Safety Guidelines

1. **Always backup** before running migrations in production
2. **Test migrations** in development/staging first
3. **Use transactions** when possible for complex migrations
4. **Include rollback** instructions when applicable
5. **Document breaking changes** clearly

## Rollback Instructions

If you need to rollback migration 001:

```sql
-- WARNING: This will remove all phone and lead tracking data
ALTER TABLE public.users DROP COLUMN IF EXISTS country_code;
ALTER TABLE public.users DROP COLUMN IF EXISTS lead_source;
ALTER TABLE public.users DROP COLUMN IF EXISTS lead_medium;
ALTER TABLE public.users DROP COLUMN IF EXISTS lead_campaign;
ALTER TABLE public.users DROP COLUMN IF EXISTS utm_source;
ALTER TABLE public.users DROP COLUMN IF EXISTS utm_medium;
ALTER TABLE public.users DROP COLUMN IF EXISTS utm_campaign;
ALTER TABLE public.users DROP COLUMN IF EXISTS utm_content;
ALTER TABLE public.users DROP COLUMN IF EXISTS utm_term;
ALTER TABLE public.users DROP COLUMN IF EXISTS referrer_url;

-- Drop functions and views
DROP FUNCTION IF EXISTS validate_brazilian_phone(TEXT);
DROP FUNCTION IF EXISTS format_phone_international(TEXT, TEXT);
DROP VIEW IF EXISTS lead_analytics;
DROP VIEW IF EXISTS phone_analytics;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_country_code;
DROP INDEX IF EXISTS idx_users_lead_source;
DROP INDEX IF EXISTS idx_users_lead_medium;
DROP INDEX IF EXISTS idx_users_utm_source;
DROP INDEX IF EXISTS idx_users_utm_campaign;
```

## Verification Queries

After applying migrations, use these queries to verify:

```sql
-- Check new columns exist
SELECT column_name, data_type, character_maximum_length, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename = 'users' AND schemaname = 'public';

-- Check views work
SELECT * FROM lead_analytics LIMIT 5;
SELECT * FROM phone_analytics LIMIT 5;

-- Test phone validation function
SELECT validate_brazilian_phone('+5511999999999'); -- Should return true
SELECT validate_brazilian_phone('+551199999999');  -- Should return false
```