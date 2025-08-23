# Complete Supabase Setup Guide

## 🏗️ **STEP 1: Database Schema Setup**

**Go to:** https://supabase.com/dashboard/project/tarohelkwuurakbxjyxm/sql

**Copy and paste this SQL** (creates all tables with security):

```sql
-- Director's Palette Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('story', 'music-video', 'commercial')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User templates table
CREATE TABLE user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  name TEXT NOT NULL,
  content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI usage tracking table
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  function_type TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Image storage references table
CREATE TABLE user_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view own and public templates" ON user_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own templates" ON user_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON user_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON user_templates
  FOR DELETE USING (auth.uid() = user_id);

-- AI usage policies  
CREATE POLICY "Users can view own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage tracking" ON ai_usage
  FOR INSERT WITH CHECK (true);

-- Images policies
CREATE POLICY "Users can view own images" ON user_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own images" ON user_images
  FOR ALL USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX idx_user_templates_type ON user_templates(template_type);
CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX idx_user_images_user_id ON user_images(user_id);
CREATE INDEX idx_user_images_project_id ON user_images(project_id);
```

**Click "Run" to execute**

---

## 🗂️ **STEP 2: Storage Buckets Setup**

**Go to:** https://supabase.com/dashboard/project/tarohelkwuurakbxjyxm/storage/buckets

**Create Bucket 1:**
- Click "New bucket"
- Name: `images`  
- Public: `true`
- Click "Create bucket"

**Create Bucket 2:**
- Click "New bucket"
- Name: `user-assets`
- Public: `false` (private)
- Click "Create bucket"

---

## 🔑 **STEP 3: Google OAuth Setup**

**Go to:** https://console.cloud.google.com/apis/credentials

**If no project exists:**
1. Click "Select a project" → "New Project"
2. Project name: `Directors Palette`
3. Click "Create"

**Create OAuth Credentials:**
1. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
2. If consent screen needed:
   - Click "CONFIGURE CONSENT SCREEN"
   - Choose "External" → Create
   - App name: `Director's Palette`
   - User support email: `taskmasterpeace@gmail.com`
   - Save and continue through steps
3. Application type: `Web application`
4. Name: `Directors Palette Web`
5. Authorized redirect URIs: `https://tarohelkwuurakbxjyxm.supabase.co/auth/v1/callback`
6. Click "Create"
7. **Copy the Client ID and Client Secret**

---

## 🔧 **STEP 4: Configure Google in Supabase**

**Go back to:** https://supabase.com/dashboard/project/tarohelkwuurakbxjyxm/auth/providers

1. Click on "Google" provider
2. Toggle "Enable Sign in with Google"
3. Paste your **Client ID**
4. Paste your **Client Secret**  
5. Click "Save"

---

## 🚀 **STEP 5: Environment Variables**

**Copy these to your Vercel environment variables:**

```bash
# Supabase (get from Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://tarohelkwuurakbxjyxm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase project settings]
SUPABASE_SERVICE_ROLE_KEY=[from Supabase project settings]

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=[your-client-id].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[your-client-secret]
```

**After completing these steps, tell me and I'll activate the Supabase integration in the code!**