-- Gallery Images Persistence System
-- Migration: 005_gallery_images_persistence.sql

-- Create storage bucket for gallery images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-gallery-images',
  'user-gallery-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- User Gallery Images table for permanent storage
CREATE TABLE IF NOT EXISTS public.user_gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,

    -- Image generation metadata
    metadata JSONB NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraints
    CONSTRAINT gallery_images_file_size_positive CHECK (file_size > 0),
    CONSTRAINT gallery_images_valid_mime CHECK (mime_type ~ '^image/(jpeg|png|webp|gif)$'),
    CONSTRAINT gallery_images_metadata_valid CHECK (jsonb_typeof(metadata) = 'object')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_user_id ON public.user_gallery_images(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON public.user_gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_model ON public.user_gallery_images USING GIN ((metadata->>'model'));
CREATE INDEX IF NOT EXISTS idx_gallery_images_source ON public.user_gallery_images USING GIN ((metadata->>'source'));

-- Row Level Security Policies
ALTER TABLE public.user_gallery_images ENABLE ROW LEVEL SECURITY;

-- Users can view their own gallery images
CREATE POLICY "Users can view their own gallery images" ON public.user_gallery_images
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own gallery images
CREATE POLICY "Users can create their own gallery images" ON public.user_gallery_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own gallery images
CREATE POLICY "Users can update their own gallery images" ON public.user_gallery_images
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own gallery images
CREATE POLICY "Users can delete their own gallery images" ON public.user_gallery_images
    FOR DELETE USING (auth.uid() = user_id);

-- Admin access for gallery management
CREATE POLICY "Admins have full access to gallery images" ON public.user_gallery_images
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

-- Storage policies for gallery bucket
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES
('user-gallery-images', '.emptyFolderPlaceholder', null, '{}') ON CONFLICT DO NOTHING;

-- Storage policy: Users can upload to their own folder
CREATE POLICY "Users can upload gallery images to own folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'user-gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can view their own gallery images
CREATE POLICY "Users can view own gallery images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'user-gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can delete their own gallery images
CREATE POLICY "Users can delete own gallery images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'user-gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Public read access for gallery images
CREATE POLICY "Public read access for gallery images" ON storage.objects
FOR SELECT USING (bucket_id = 'user-gallery-images');

-- Functions for gallery management

-- Function to get user gallery statistics
CREATE OR REPLACE FUNCTION get_user_gallery_stats(p_user_id UUID)
RETURNS TABLE (
    total_images BIGINT,
    total_size_mb DECIMAL(10,2),
    images_by_model JSONB,
    images_by_source JSONB,
    storage_used_mb DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_images,
        ROUND(SUM(COALESCE(file_size, 0))::DECIMAL / 1048576, 2) as total_size_mb,
        jsonb_object_agg(
            COALESCE(metadata->>'model', 'unknown'),
            COUNT(*)
        ) FILTER (WHERE metadata->>'model' IS NOT NULL) as images_by_model,
        jsonb_object_agg(
            COALESCE(metadata->>'source', 'unknown'),
            COUNT(*)
        ) FILTER (WHERE metadata->>'source' IS NOT NULL) as images_by_source,
        ROUND(SUM(COALESCE(file_size, 0))::DECIMAL / 1048576, 2) as storage_used_mb
    FROM public.user_gallery_images
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old gallery images (for storage management)
CREATE OR REPLACE FUNCTION cleanup_old_gallery_images(
    p_user_id UUID,
    p_days_old INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted_images AS (
        DELETE FROM public.user_gallery_images
        WHERE user_id = p_user_id
        AND created_at < NOW() - (p_days_old || ' days')::INTERVAL
        RETURNING storage_path
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted_images;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at timestamp
CREATE TRIGGER update_gallery_images_updated_at
    BEFORE UPDATE ON public.user_gallery_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.user_gallery_images IS 'Permanently stored gallery images with metadata';
COMMENT ON COLUMN public.user_gallery_images.storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN public.user_gallery_images.public_url IS 'Permanent public URL for image access';
COMMENT ON COLUMN public.user_gallery_images.metadata IS 'JSON metadata including prompt, model, settings, and generation details';

COMMENT ON FUNCTION get_user_gallery_stats(UUID) IS 'Get comprehensive gallery statistics for a user';
COMMENT ON FUNCTION cleanup_old_gallery_images(UUID, INTEGER) IS 'Clean up gallery images older than specified days';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_gallery_images TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_gallery_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_gallery_images(UUID, INTEGER) TO authenticated;