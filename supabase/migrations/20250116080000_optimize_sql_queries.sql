-- Migration: Optimize SQL queries and add performance indexes
-- Created: 2025-01-16 08:00:00
-- Description: Add composite indexes and optimize queries for better performance

-- ============================================================================
-- COMPOSITE INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

-- Index for user_lead_tracking analytics queries (used in views)
-- Optimizes GROUP BY operations on lead_source, lead_medium, conversion_type
CREATE INDEX IF NOT EXISTS idx_user_lead_tracking_analytics 
ON user_lead_tracking (lead_source, lead_medium, conversion_type, tracked_at);

-- Index for user_lead_tracking time-based queries
-- Optimizes WHERE clauses with tracked_at filters
CREATE INDEX IF NOT EXISTS idx_user_lead_tracking_time_filters 
ON user_lead_tracking (tracked_at DESC, conversion_type);

-- Index for donations statistics queries
-- Optimizes GROUP BY operations on type and date
CREATE INDEX IF NOT EXISTS idx_donations_statistics 
ON donations (type, date, amount);

-- Index for donations time-based queries
-- Optimizes WHERE clauses with date filters
CREATE INDEX IF NOT EXISTS idx_donations_date_amount 
ON donations (date DESC, amount);

-- Index for users role-based queries (hierarchy access)
-- Optimizes WHERE clauses filtering by role
CREATE INDEX IF NOT EXISTS idx_users_role_created 
ON users (role, created_at DESC);

-- Index for addresses with zip_code queries
-- Optimizes WHERE clauses filtering by zip_code
CREATE INDEX IF NOT EXISTS idx_addresses_zip_user 
ON addresses (zip_code, user_id, created_at);

-- Index for integration_sync_logs performance
-- Optimizes queries filtering by integration_id and status
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_performance 
ON integration_sync_logs (integration_id, status, created_at DESC);

-- ============================================================================
-- OPTIMIZED FUNCTIONS FOR COMMON QUERIES
-- ============================================================================

-- Function to get user statistics by role with better performance
CREATE OR REPLACE FUNCTION get_user_statistics_optimized()
RETURNS TABLE (
    role_name TEXT,
    total_users BIGINT,
    recent_users BIGINT,
    percentage NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH role_stats AS (
        SELECT 
            u.role::TEXT as role_name,
            COUNT(*) as user_count,
            COUNT(CASE WHEN u.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_count
        FROM users u
        GROUP BY u.role
    ),
    total_count AS (
        SELECT SUM(user_count) as grand_total FROM role_stats
    )
    SELECT 
        rs.role_name,
        rs.user_count,
        rs.recent_count,
        ROUND((rs.user_count::NUMERIC * 100.0 / tc.grand_total::NUMERIC), 2) as percentage
    FROM role_stats rs
    CROSS JOIN total_count tc
    ORDER BY rs.user_count DESC;
END;
$$;

-- Function to get donation analytics with better performance
CREATE OR REPLACE FUNCTION get_donation_analytics_optimized(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    donation_type TEXT,
    total_donations BIGINT,
    total_amount NUMERIC,
    average_amount NUMERIC,
    month_year TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.type::TEXT as donation_type,
        COUNT(*) as total_donations,
        SUM(d.amount) as total_amount,
        AVG(d.amount) as average_amount,
        TO_CHAR(DATE_TRUNC('month', d.date), 'YYYY-MM') as month_year
    FROM donations d
    WHERE 
        (start_date IS NULL OR d.date >= start_date) AND
        (end_date IS NULL OR d.date <= end_date)
    GROUP BY d.type, DATE_TRUNC('month', d.date)
    ORDER BY DATE_TRUNC('month', d.date) DESC, d.type;
END;
$$;

-- Function to get lead conversion analytics with better performance
CREATE OR REPLACE FUNCTION get_lead_conversion_analytics_optimized(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    lead_source TEXT,
    lead_medium TEXT,
    registrations BIGINT,
    first_logins BIGINT,
    first_donations BIGINT,
    login_conversion_rate NUMERIC,
    donation_conversion_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lt.lead_source::TEXT,
        lt.lead_medium::TEXT,
        COUNT(CASE WHEN lt.conversion_type = 'registration' THEN 1 END) as registrations,
        COUNT(CASE WHEN lt.conversion_type = 'first_login' THEN 1 END) as first_logins,
        COUNT(CASE WHEN lt.conversion_type = 'first_donation' THEN 1 END) as first_donations,
        ROUND(
            (COUNT(CASE WHEN lt.conversion_type = 'first_login' THEN 1 END)::NUMERIC * 100.0) / 
            NULLIF(COUNT(CASE WHEN lt.conversion_type = 'registration' THEN 1 END), 0)::NUMERIC, 
            2
        ) as login_conversion_rate,
        ROUND(
            (COUNT(CASE WHEN lt.conversion_type = 'first_donation' THEN 1 END)::NUMERIC * 100.0) / 
            NULLIF(COUNT(CASE WHEN lt.conversion_type = 'registration' THEN 1 END), 0)::NUMERIC, 
            2
        ) as donation_conversion_rate
    FROM user_lead_tracking lt
    WHERE 
        lt.tracked_at > NOW() - (days_back || ' days')::INTERVAL AND
        lt.conversion_type IN ('registration', 'first_login', 'first_donation')
    GROUP BY lt.lead_source, lt.lead_medium
    ORDER BY registrations DESC;
END;
$$;

-- ============================================================================
-- OPTIMIZED VIEWS WITH BETTER INDEXES
-- ============================================================================

-- Drop and recreate conversion_analytics view with better performance
DROP VIEW IF EXISTS conversion_analytics;
CREATE VIEW conversion_analytics AS
SELECT 
    lead_source,
    lead_medium,
    COUNT(CASE WHEN conversion_type = 'registration' THEN 1 END) AS registrations,
    COUNT(CASE WHEN conversion_type = 'first_login' THEN 1 END) AS first_logins,
    COUNT(CASE WHEN conversion_type = 'first_donation' THEN 1 END) AS first_donations,
    ROUND(
        (COUNT(CASE WHEN conversion_type = 'first_login' THEN 1 END)::NUMERIC * 100.0) / 
        NULLIF(COUNT(CASE WHEN conversion_type = 'registration' THEN 1 END), 0)::NUMERIC, 
        2
    ) AS login_conversion_rate,
    ROUND(
        (COUNT(CASE WHEN conversion_type = 'first_donation' THEN 1 END)::NUMERIC * 100.0) / 
        NULLIF(COUNT(CASE WHEN conversion_type = 'registration' THEN 1 END), 0)::NUMERIC, 
        2
    ) AS donation_conversion_rate
FROM user_lead_tracking
WHERE conversion_type IN ('registration', 'first_login', 'first_donation')
GROUP BY lead_source, lead_medium
ORDER BY registrations DESC;

-- ============================================================================
-- QUERY OPTIMIZATION ANALYSIS FUNCTION
-- ============================================================================

-- Function to analyze query performance and suggest optimizations
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE (
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    table_size TEXT,
    recommendation TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        COALESCE(i.indexname, 'No indexes')::TEXT,
        CASE 
            WHEN i.indexname IS NOT NULL THEN 
                pg_size_pretty(pg_relation_size((t.schemaname||'.'||i.indexname)::regclass))::TEXT
            ELSE 'N/A'
        END as index_size,
        pg_size_pretty(pg_relation_size((t.schemaname||'.'||t.tablename)::regclass))::TEXT as table_size,
        CASE 
            WHEN i.indexname IS NOT NULL AND 
                 pg_relation_size((t.schemaname||'.'||i.indexname)::regclass) > 
                 pg_relation_size((t.schemaname||'.'||t.tablename)::regclass) * 0.5 
            THEN 'Index size is large relative to table - consider if all indexes are necessary'
            WHEN pg_relation_size((t.schemaname||'.'||t.tablename)::regclass) > 1024*1024*10 -- 10MB
            THEN 'Large table - ensure proper indexing for common queries'
            WHEN i.indexname IS NULL
            THEN 'Table has no indexes - consider adding indexes for frequently queried columns'
            ELSE 'Table and indexes appear well-sized'
        END::TEXT as recommendation
    FROM pg_tables t
    LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND t.schemaname = i.schemaname
    WHERE t.schemaname = 'public'
    ORDER BY pg_relation_size((t.schemaname||'.'||t.tablename)::regclass) DESC;
END;
$$;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION get_user_statistics_optimized() IS 'Optimized function to get user statistics by role with better performance using composite indexes';
COMMENT ON FUNCTION get_donation_analytics_optimized(DATE, DATE) IS 'Optimized function to get donation analytics with date filtering and better performance';
COMMENT ON FUNCTION get_lead_conversion_analytics_optimized(INTEGER) IS 'Optimized function to get lead conversion analytics with configurable time window';
COMMENT ON FUNCTION analyze_query_performance() IS 'Function to analyze query performance and provide optimization recommendations';

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_statistics_optimized() TO authenticated;
GRANT EXECUTE ON FUNCTION get_donation_analytics_optimized(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_lead_conversion_analytics_optimized(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_query_performance() TO authenticated;

-- Grant select permissions on optimized views
GRANT SELECT ON conversion_analytics TO authenticated;