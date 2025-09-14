-- Wild Card System Migration
-- Adds user wild cards and sharing functionality

-- User Wild Cards table
CREATE TABLE IF NOT EXISTS user_wildcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL, -- newline-separated entries
  description TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  entry_count INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN content = '' THEN 0
      ELSE array_length(string_to_array(content, E'\n'), 1)
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name) -- Ensure unique wild card names per user
);

-- Wild Card Shares table for import/export
CREATE TABLE IF NOT EXISTS wildcard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wildcard_id UUID NOT NULL REFERENCES user_wildcards(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wild Card Categories lookup table
CREATE TABLE IF NOT EXISTS wildcard_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false
);

-- Insert default categories
INSERT INTO wildcard_categories (name, description, icon, sort_order, is_system) VALUES
  ('characters', 'Character descriptions and personas', '👤', 1, true),
  ('locations', 'Places, settings, and environments', '📍', 2, true),
  ('moods', 'Emotional tones and atmospheres', '🎭', 3, true),
  ('lighting', 'Lighting conditions and styles', '💡', 4, true),
  ('styles', 'Art styles and visual approaches', '🎨', 5, true),
  ('objects', 'Props, items, and objects', '📦', 6, true),
  ('actions', 'Activities and movements', '🏃', 7, true),
  ('general', 'Uncategorized wild cards', '📝', 8, true)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on wild card tables
ALTER TABLE user_wildcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wildcard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE wildcard_categories ENABLE ROW LEVEL SECURITY;

-- Wild Cards RLS Policies
CREATE POLICY "Users can view own wild cards" ON user_wildcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wild cards" ON user_wildcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wild cards" ON user_wildcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wild cards" ON user_wildcards
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared wild cards" ON user_wildcards
  FOR SELECT USING (is_shared = true OR auth.uid() = user_id);

-- Wild Card Shares RLS Policies
CREATE POLICY "Users can view all shares" ON wildcard_shares
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create shares for own wild cards" ON wildcard_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_wildcards 
      WHERE id = wildcard_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shares" ON wildcard_shares
  FOR UPDATE USING (shared_by = auth.uid());

CREATE POLICY "Users can delete own shares" ON wildcard_shares
  FOR DELETE USING (shared_by = auth.uid());

-- Categories RLS Policies
CREATE POLICY "Anyone can view categories" ON wildcard_categories
  FOR SELECT USING (true);

-- Add updated_at trigger for wildcards
CREATE TRIGGER update_user_wildcards_updated_at BEFORE UPDATE ON user_wildcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_wildcards_user_id ON user_wildcards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wildcards_category ON user_wildcards(category);
CREATE INDEX IF NOT EXISTS idx_user_wildcards_name ON user_wildcards(user_id, name);
CREATE INDEX IF NOT EXISTS idx_user_wildcards_shared ON user_wildcards(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_wildcard_shares_code ON wildcard_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_wildcard_shares_active ON wildcard_shares(is_active) WHERE is_active = true;