-- Update credit system for beta testing with lower starting amounts
-- This ensures users must use promo codes to get substantial credits

-- Update default credit amounts for new users
ALTER TABLE public.user_credits
  ALTER COLUMN current_points SET DEFAULT 10,
  ALTER COLUMN monthly_allocation SET DEFAULT 10;

-- Update existing users to beta credit levels (except admin)
UPDATE public.user_credits
SET
  current_points = 10,
  monthly_allocation = 10,
  tier = 'beta'
WHERE user_id != '7cf1a35d-e572-4e39-b4cd-a38d8f10c6d2'; -- Keep admin user with existing credits

-- Add beta tier to check constraint
ALTER TABLE public.user_credits
  DROP CONSTRAINT IF EXISTS user_credits_tier_check,
  ADD CONSTRAINT user_credits_tier_check
  CHECK (tier IN ('free', 'beta', 'pro', 'studio'));

-- Initialize any new users with beta tier and 10 credits
INSERT INTO public.user_credits (user_id, current_points, monthly_allocation, tier, total_purchased_points)
SELECT id, 10, 10, 'beta', 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;