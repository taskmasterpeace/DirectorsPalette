-- API Monitoring and Usage Tracking System
-- Tracks all API calls for admin monitoring and abuse detection

-- API Call Logs table
CREATE TABLE IF NOT EXISTS public.api_call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- API key tracking
  api_key_used BOOLEAN NOT NULL DEFAULT false,
  api_key_valid BOOLEAN DEFAULT NULL,
  call_source TEXT NOT NULL DEFAULT 'internal', -- 'internal', 'external', 'unknown'

  -- Request metadata
  origin TEXT,
  user_agent TEXT,
  ip_address INET,
  referer TEXT,

  -- Response details
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  credits_consumed INTEGER DEFAULT 0,

  -- Content details
  model_used TEXT,
  operation_type TEXT, -- 'video_generation', 'image_generation', 'credit_redemption', etc.
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,

  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Rate limiting tracking
  calls_in_hour INTEGER DEFAULT 1,
  calls_in_day INTEGER DEFAULT 1
);

-- API Key Usage Stats (aggregated view)
CREATE TABLE IF NOT EXISTS public.api_key_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  api_key_hash TEXT, -- Hashed version for privacy

  -- Daily stats
  total_calls INTEGER NOT NULL DEFAULT 0,
  successful_calls INTEGER NOT NULL DEFAULT 0,
  failed_calls INTEGER NOT NULL DEFAULT 0,
  credits_consumed INTEGER NOT NULL DEFAULT 0,

  -- Breakdown by operation
  video_generations INTEGER NOT NULL DEFAULT 0,
  image_generations INTEGER NOT NULL DEFAULT 0,
  other_operations INTEGER NOT NULL DEFAULT 0,

  -- Performance stats
  avg_response_time_ms DECIMAL(10,2),
  slowest_call_ms INTEGER,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date, api_key_hash)
);

-- Suspicious Activity Alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'rate_limit_exceeded', 'invalid_api_key_attempts', 'unusual_usage_pattern'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

  -- Alert details
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  api_endpoint TEXT,

  -- Metrics that triggered alert
  calls_per_minute INTEGER,
  failed_attempts INTEGER,
  credits_attempted INTEGER,

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'investigating', 'resolved', 'false_positive'
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_call_logs_endpoint ON public.api_call_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_user_id ON public.api_call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_created_at ON public.api_call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_status_code ON public.api_call_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_api_key_used ON public.api_call_logs(api_key_used);
CREATE INDEX IF NOT EXISTS idx_api_call_logs_call_source ON public.api_call_logs(call_source);

CREATE INDEX IF NOT EXISTS idx_api_key_usage_stats_date ON public.api_key_usage_stats(date);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_stats_api_key_hash ON public.api_key_usage_stats(api_key_hash);

CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.api_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin-only access
CREATE POLICY "Admins can view all API logs" ON public.api_call_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('taskmasterpeace@gmail.com', 'admin@machinekinglabs.com')
    )
  );

CREATE POLICY "Admins can view API usage stats" ON public.api_key_usage_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('taskmasterpeace@gmail.com', 'admin@machinekinglabs.com')
    )
  );

CREATE POLICY "Admins can manage security alerts" ON public.security_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('taskmasterpeace@gmail.com', 'admin@machinekinglabs.com')
    )
  );

-- Users can only see their own API calls
CREATE POLICY "Users can view own API calls" ON public.api_call_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to update usage stats
CREATE OR REPLACE FUNCTION update_api_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily usage stats
  INSERT INTO public.api_key_usage_stats (
    date,
    api_key_hash,
    total_calls,
    successful_calls,
    failed_calls,
    credits_consumed,
    video_generations,
    image_generations,
    other_operations,
    avg_response_time_ms,
    slowest_call_ms
  ) VALUES (
    CURRENT_DATE,
    CASE WHEN NEW.api_key_used THEN 'external_key_hash' ELSE 'internal_calls' END,
    1,
    CASE WHEN NEW.success THEN 1 ELSE 0 END,
    CASE WHEN NEW.success THEN 0 ELSE 1 END,
    COALESCE(NEW.credits_consumed, 0),
    CASE WHEN NEW.operation_type = 'video_generation' THEN 1 ELSE 0 END,
    CASE WHEN NEW.operation_type = 'image_generation' THEN 1 ELSE 0 END,
    CASE WHEN NEW.operation_type NOT IN ('video_generation', 'image_generation') THEN 1 ELSE 0 END,
    NEW.response_time_ms,
    NEW.response_time_ms
  )
  ON CONFLICT (date, api_key_hash) DO UPDATE SET
    total_calls = api_key_usage_stats.total_calls + 1,
    successful_calls = api_key_usage_stats.successful_calls + CASE WHEN NEW.success THEN 1 ELSE 0 END,
    failed_calls = api_key_usage_stats.failed_calls + CASE WHEN NEW.success THEN 0 ELSE 1 END,
    credits_consumed = api_key_usage_stats.credits_consumed + COALESCE(NEW.credits_consumed, 0),
    video_generations = api_key_usage_stats.video_generations + CASE WHEN NEW.operation_type = 'video_generation' THEN 1 ELSE 0 END,
    image_generations = api_key_usage_stats.image_generations + CASE WHEN NEW.operation_type = 'image_generation' THEN 1 ELSE 0 END,
    other_operations = api_key_usage_stats.other_operations + CASE WHEN NEW.operation_type NOT IN ('video_generation', 'image_generation') THEN 1 ELSE 0 END,
    avg_response_time_ms = (api_key_usage_stats.avg_response_time_ms * api_key_usage_stats.total_calls + NEW.response_time_ms) / (api_key_usage_stats.total_calls + 1),
    slowest_call_ms = GREATEST(api_key_usage_stats.slowest_call_ms, NEW.response_time_ms),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update usage stats
CREATE TRIGGER api_usage_stats_trigger
  AFTER INSERT ON public.api_call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_api_usage_stats();