-- Create user_image_references table
CREATE TABLE user_image_references (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_quick_access BOOLEAN DEFAULT FALSE,
  reference TEXT,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_size BIGINT,
  dimensions JSONB,
  format TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_image_reference_categories table
CREATE TABLE user_image_reference_categories (
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
CREATE INDEX idx_user_image_references_user_id ON user_image_references(user_id);
CREATE INDEX idx_user_image_references_category_id ON user_image_references(category_id);
CREATE INDEX idx_user_image_references_quick_access ON user_image_references(is_quick_access) WHERE is_quick_access = TRUE;
CREATE INDEX idx_user_image_references_reference ON user_image_references(reference) WHERE reference IS NOT NULL;
CREATE INDEX idx_user_image_references_created_at ON user_image_references(created_at DESC);

CREATE INDEX idx_user_image_reference_categories_user_id ON user_image_reference_categories(user_id);
CREATE INDEX idx_user_image_reference_categories_order ON user_image_reference_categories("order");

-- Enable Row Level Security (RLS)
ALTER TABLE user_image_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_image_reference_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own image references" ON user_image_references
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image references" ON user_image_references
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image references" ON user_image_references
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image references" ON user_image_references
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own image reference categories" ON user_image_reference_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image reference categories" ON user_image_reference_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image reference categories" ON user_image_reference_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image reference categories" ON user_image_reference_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for image references
INSERT INTO storage.buckets (id, name, public) VALUES ('image-references', 'image-references', true);

-- Create RLS policies for storage
CREATE POLICY "Users can upload their own image references"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'image-references' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own image references"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'image-references' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own image references"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'image-references' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own image references"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'image-references' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable public access to the storage bucket (with RLS policies controlling access)
CREATE POLICY "Public read access for image references"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'image-references');