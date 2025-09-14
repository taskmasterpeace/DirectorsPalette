-- API Keys and Security System
-- Migration: 004_api_keys_system.sql

-- API Keys table for authentication
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 hash of the actual key
    permissions TEXT[] DEFAULT '{}', -- Array of permission strings
    rate_limit INTEGER DEFAULT 60, -- Requests per minute
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT api_keys_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT api_keys_rate_limit_positive CHECK (rate_limit > 0 AND rate_limit <= 10000)
);

-- API Usage tracking for billing and analytics
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    request_size_bytes INTEGER DEFAULT 0,
    response_size_bytes INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Indexes for performance
    INDEX idx_api_usage_api_key_id ON public.api_usage(api_key_id),
    INDEX idx_api_usage_user_id ON public.api_usage(user_id),
    INDEX idx_api_usage_created_at ON public.api_usage(created_at),
    INDEX idx_api_usage_endpoint ON public.api_usage(endpoint)
);

-- Rate limiting tracking (in-memory alternative to Redis)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- API key ID or IP address
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(identifier, window_start),
    INDEX idx_rate_limits_identifier ON public.rate_limits(identifier),
    INDEX idx_rate_limits_window ON public.rate_limits(window_start, window_end)
);

-- Row Level Security (RLS) Policies

-- API Keys: Users can only manage their own keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- API Usage: Users can view their own usage
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Rate Limits: No direct user access (managed by API)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- UNSWITCHABLE ADMIN ACCESS - Machine King Labs Owner
CREATE POLICY "Admins have full access to api_keys" ON public.api_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.email = 'taskmasterpeace@gmail.com' OR -- HARDCODED: Cannot be changed
                auth.users.email = current_setting('app.admin_email', true) OR -- Environment backup
                (auth.users.raw_app_meta_data->>'role')::text = 'admin' -- Supabase role
            )
        )
    );

CREATE POLICY "Admins have full access to api_usage" ON public.api_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.email = 'taskmasterpeace@gmail.com' OR -- HARDCODED: Machine King Admin
                auth.users.email = current_setting('app.admin_email', true) OR
                (auth.users.raw_app_meta_data->>'role')::text = 'admin'
            )
        )
    );

CREATE POLICY "Admins have full access to rate_limits" ON public.rate_limits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.email = 'taskmasterpeace@gmail.com' OR -- HARDCODED: Machine King Admin
                auth.users.email = current_setting('app.admin_email', true) OR
                (auth.users.raw_app_meta_data->>'role')::text = 'admin'
            )
        )
    );

-- Functions for API key management

-- Function to clean up expired rate limit windows
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_end < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to get API usage statistics
CREATE OR REPLACE FUNCTION get_api_usage_stats(
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    endpoint VARCHAR(255),
    total_requests BIGINT,
    total_cost DECIMAL(10,4),
    avg_duration_ms DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        api_usage.endpoint,
        COUNT(*)::BIGINT as total_requests,
        SUM(api_usage.cost_usd) as total_cost,
        AVG(api_usage.duration_ms)::DECIMAL(10,2) as avg_duration_ms
    FROM public.api_usage
    WHERE
        (p_user_id IS NULL OR api_usage.user_id = p_user_id) AND
        (p_start_date IS NULL OR api_usage.created_at >= p_start_date) AND
        (p_end_date IS NULL OR api_usage.created_at <= p_end_date)
    GROUP BY api_usage.endpoint
    ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin API key for taskmasterpeace
INSERT INTO public.api_keys (
    user_id,
    name,
    key_hash,
    permissions,
    rate_limit,
    is_active
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'taskmasterpeace@gmail.com' LIMIT 1),
    'Admin Master Key',
    encode(digest('dp_admin_master_key_change_immediately', 'sha256'), 'hex'),
    ARRAY['*'],
    1000,
    true
) ON CONFLICT (key_hash) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.api_keys IS 'API keys for external application authentication';
COMMENT ON TABLE public.api_usage IS 'API usage tracking for billing and analytics';
COMMENT ON TABLE public.rate_limits IS 'Rate limiting data for API abuse prevention';

COMMENT ON COLUMN public.api_keys.key_hash IS 'SHA256 hash of the actual API key for secure storage';
COMMENT ON COLUMN public.api_keys.permissions IS 'Array of permission strings (e.g., story:generate, image:edit)';
COMMENT ON COLUMN public.api_keys.rate_limit IS 'Maximum requests per minute for this API key';

COMMENT ON COLUMN public.api_usage.cost_usd IS 'Cost in USD for this API request (for billing)';
COMMENT ON COLUMN public.api_usage.metadata IS 'Additional request metadata (model used, parameters, etc.)';
COMMENT ON COLUMN public.api_usage.duration_ms IS 'Request processing time in milliseconds';