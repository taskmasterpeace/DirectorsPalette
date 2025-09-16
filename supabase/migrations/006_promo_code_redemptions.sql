-- Create promo code redemptions table for beta testing credit distribution
CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  promo_code TEXT NOT NULL,
  credits_granted INTEGER NOT NULL,
  description TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate redemptions
  UNIQUE(user_id, promo_code)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_user_id ON public.promo_code_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_promo_code ON public.promo_code_redemptions(promo_code);
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_redeemed_at ON public.promo_code_redemptions(redeemed_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own promo code redemptions" ON public.promo_code_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own promo code redemptions" ON public.promo_code_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy for viewing all redemptions
CREATE POLICY "Admins can view all promo code redemptions" ON public.promo_code_redemptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN ('taskmasterpeace@gmail.com', 'admin@machinekinglabs.com')
    )
  );

-- Insert some initial promo codes for tracking (optional)
INSERT INTO public.promo_code_redemptions (user_id, promo_code, credits_granted, description, redeemed_at)
VALUES
  -- Example entries for testing/demonstration
  ('7cf1a35d-e572-4e39-b4cd-a38d8f10c6d2', 'BETA1000', 1000, 'Beta Testing Credits', NOW() - INTERVAL '1 day')
ON CONFLICT (user_id, promo_code) DO NOTHING;