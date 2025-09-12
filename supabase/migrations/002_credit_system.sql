-- Credit System Migration
-- Adds user credits, usage tracking, and boost purchases tables

-- User Credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_points INTEGER NOT NULL DEFAULT 2500,
  monthly_allocation INTEGER NOT NULL DEFAULT 2500,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  tier TEXT NOT NULL DEFAULT 'pro' CHECK (tier IN ('free', 'pro', 'studio')),
  total_purchased_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Log table for tracking credit consumption
CREATE TABLE usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  points_consumed INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  function_name TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boost Purchases table for tracking credit purchases
CREATE TABLE boost_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('quick', 'power', 'mega')),
  points_added INTEGER NOT NULL,
  cost_usd DECIMAL(10,2) NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on credit system tables
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_purchases ENABLE ROW LEVEL SECURITY;

-- User Credits RLS Policies
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create user credits" ON user_credits
  FOR INSERT WITH CHECK (true);

-- Usage Log RLS Policies
CREATE POLICY "Users can view own usage log" ON usage_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage tracking" ON usage_log
  FOR INSERT WITH CHECK (true);

-- Boost Purchases RLS Policies
CREATE POLICY "Users can view own boost purchases" ON boost_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create boost purchases" ON boost_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update boost purchases" ON boost_purchases
  FOR UPDATE WITH CHECK (true);

-- Add updated_at trigger for user_credits
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_usage_log_user_id ON usage_log(user_id);
CREATE INDEX idx_usage_log_created_at ON usage_log(created_at);
CREATE INDEX idx_boost_purchases_user_id ON boost_purchases(user_id);
CREATE INDEX idx_boost_purchases_status ON boost_purchases(status);

-- Initialize credits for existing users who have authenticated
-- This will run once to set up existing users with default pro tier credits
INSERT INTO user_credits (user_id, current_points, monthly_allocation, tier, total_purchased_points)
SELECT id, 2500, 2500, 'pro', 0
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_credits);