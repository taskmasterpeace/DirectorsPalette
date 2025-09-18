-- Create user_prompts table
CREATE TABLE IF NOT EXISTS user_prompts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  title TEXT NOT NULL,
  category_id TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_quick_access BOOLEAN DEFAULT FALSE,
  reference TEXT,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_prompt_categories table
CREATE TABLE IF NOT EXISTS user_prompt_categories (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_prompts_user_id ON user_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompts_category_id ON user_prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_user_prompts_quick_access ON user_prompts(is_quick_access) WHERE is_quick_access = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_prompts_reference ON user_prompts(reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_prompts_created_at ON user_prompts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_prompt_categories_user_id ON user_prompt_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompt_categories_order ON user_prompt_categories("order");

-- Enable Row Level Security (RLS)
ALTER TABLE user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prompt_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_prompts
CREATE POLICY "Users can view their own prompts" ON user_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts" ON user_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON user_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON user_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_prompt_categories
CREATE POLICY "Users can view their own prompt categories" ON user_prompt_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompt categories" ON user_prompt_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt categories" ON user_prompt_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompt categories" ON user_prompt_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_user_prompts_updated_at BEFORE UPDATE ON user_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_prompt_categories_updated_at BEFORE UPDATE ON user_prompt_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();