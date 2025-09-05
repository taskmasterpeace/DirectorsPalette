# 🚀 Complete Supabase Integration Setup

## 📋 **STEP-BY-STEP CHECKLIST**

### ✅ **STEP 1: Google Cloud Console OAuth Setup**

**Go to:** https://console.cloud.google.com/apis/credentials

1. **Create Project** (if needed):
   - Click "Select a project" → "New Project"  
   - Name: `Directors Palette`
   - Click "Create"

2. **Configure OAuth Consent Screen** (if needed):
   - Click "OAuth consent screen" in left menu
   - Choose "External" → Create
   - App name: `Director's Palette`
   - User support email: `taskmasterpeace@gmail.com`
   - Developer contact: `taskmasterpeace@gmail.com`
   - Save and continue through all steps

3. **Create OAuth Credentials:**
   - Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
   - Application type: `Web application`
   - Name: `Directors Palette Web`
   - Authorized redirect URIs: `https://tarohelkwuurakbxjyxm.supabase.co/auth/v1/callback`
   - Click "Create"

4. **COPY THESE VALUES:**
   - Client ID: `123456789-abc123...apps.googleusercontent.com`
   - Client Secret: `ABC-123def...`

---

### ✅ **STEP 2: Supabase Database Setup**

**Go to:** https://supabase.com/dashboard/project/tarohelkwuurakbxjyxm/sql

**Copy and paste this entire SQL script:**

```sql
-- Director's Palette Database Schema
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own and public templates" ON user_templates FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can manage own templates" ON user_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON user_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON user_templates FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert usage tracking" ON ai_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own images" ON user_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own images" ON user_images FOR ALL USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX idx_user_images_user_id ON user_images(user_id);
```

**Click "Run" to execute all commands**

---

### ✅ **STEP 3: Storage Buckets Setup**

**Go to:** https://supabase.com/dashboard/project/tarohelkwuurakbxjyxm/storage/buckets

**Create Bucket 1:**
1. Click "New bucket"
2. Name: `images`
3. Public: `✅ checked` (for AI-generated images)
4. Click "Create bucket"

**Create Bucket 2:**
1. Click "New bucket"  
2. Name: `user-assets`
3. Public: `❌ unchecked` (for private user files)
4. Click "Create bucket"

---

### ✅ **STEP 4: Configure Google OAuth in Supabase**

**Go to:** https://supabase.com/dashboard/project/tarohelkwuurakbxjyxm/auth/providers

1. Click on "Google" (disabled)
2. Toggle "Enable Sign in with Google" to `ON`
3. **Client IDs:** Paste your Google Client ID
4. **Client Secret:** Paste your Google Client Secret
5. Click "Save"

---

### ✅ **STEP 5: Get Supabase API Keys**

**Go to:** https://supabase.com/dashboard/project/tarohelkwuurakbxjyxm/settings/api

**Copy these values:**
- **Project URL:** `https://tarohelkwuurakbxjyxm.supabase.co`
- **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (starts with eyJ)
- **service_role secret:** `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (starts with eyJ)

---

## 🔧 **FINAL STEP: Add Environment Variables**

**Add these to Vercel environment variables:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tarohelkwuurakbxjyxm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste anon key from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[paste service role key from Supabase]

# Google OAuth  
GOOGLE_CLIENT_ID=[paste from Google Cloud Console]
GOOGLE_CLIENT_SECRET=[paste from Google Cloud Console]
```

---

## 🎯 **WHAT HAPPENS AFTER SETUP:**

✅ **Google OAuth Login:** One-click sign-in with Google  
✅ **Database Storage:** All projects saved to Supabase  
✅ **Image Storage:** AI-generated images stored in Supabase buckets  
✅ **User Management:** Professional user system with roles  
✅ **Cost Tracking:** AI usage and costs tracked per user  
✅ **Security:** Row-level security protects user data  

**Current localStorage system will automatically migrate to Supabase once configured!**