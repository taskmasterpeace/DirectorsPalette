-- Director's Palette Database Schema
-- User Credit & Usage Tracking System

-- User Credits Table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_points INTEGER NOT NULL DEFAULT 0,
  monthly_allocation INTEGER NOT NULL DEFAULT 2500,
  last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier VARCHAR(20) DEFAULT 'pro',
  total_purchased_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage Log Table
CREATE TABLE usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'story-breakdown', 'music-analysis', etc.
  model_id VARCHAR(100) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  points_consumed INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  function_name VARCHAR(50) NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boost Pack Purchases Table  
CREATE TABLE boost_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_type VARCHAR(20) NOT NULL, -- 'quick', 'power', 'mega'
  points_added INTEGER NOT NULL,
  cost_usd DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(100), -- Stripe payment ID
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Settings Table
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Health Monitoring Table
CREATE TABLE api_health_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_provider VARCHAR(50) NOT NULL, -- 'openrouter', 'replicate'
  endpoint VARCHAR(200) NOT NULL,
  model_id VARCHAR(100),
  response_time_ms INTEGER,
  status_code INTEGER,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_usage_log_user_date ON usage_log(user_id, created_at);
CREATE INDEX idx_usage_log_action_date ON usage_log(action_type, created_at);
CREATE INDEX idx_user_credits_user ON user_credits(user_id);
CREATE INDEX idx_boost_purchases_user ON boost_purchases(user_id);
CREATE INDEX idx_api_health_provider_date ON api_health_log(api_provider, created_at);

-- Row Level Security
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for user isolation
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own purchases" ON boost_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (full access)
CREATE POLICY "Admins can manage all credits" ON user_credits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'taskmasterpeace@gmail.com'
    )
  );

CREATE POLICY "Admins can view all usage" ON usage_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'taskmasterpeace@gmail.com'
    )
  );

-- Functions for credit management
CREATE OR REPLACE FUNCTION deduct_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type VARCHAR(50),
  p_model_id VARCHAR(100),
  p_model_name VARCHAR(100),
  p_cost_usd DECIMAL(10,4),
  p_function_name VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT current_points INTO current_balance 
  FROM user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough points
  IF current_balance < p_points THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct points
  UPDATE user_credits 
  SET current_points = current_points - p_points,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log usage
  INSERT INTO usage_log (
    user_id, action_type, model_id, model_name, 
    points_consumed, cost_usd, function_name
  ) VALUES (
    p_user_id, p_action_type, p_model_id, p_model_name,
    p_points, p_cost_usd, p_function_name
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly points
CREATE OR REPLACE FUNCTION reset_monthly_points() RETURNS void AS $$
BEGIN
  UPDATE user_credits 
  SET current_points = monthly_allocation,
      last_reset_date = NOW(),
      updated_at = NOW()
  WHERE last_reset_date < (NOW() - INTERVAL '1 month');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;