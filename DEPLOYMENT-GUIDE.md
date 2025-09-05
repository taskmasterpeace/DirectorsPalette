# Director's Palette - Deployment Guide

**Status**: Ready for Production Deployment  
**Stack**: Next.js 15 + Vercel + Supabase + OpenRouter  
**Admin**: taskmasterpeace@gmail.com  

## 🚀 **DEPLOYMENT CHECKLIST**

### **Phase 1: Vercel Setup (In Progress)**
- [ ] **Log into Vercel Dashboard** (User is completing)
- [ ] **Connect GitHub Repository** 
- [ ] **Configure Build Settings**
- [ ] **Set Environment Variables**
- [ ] **Configure Custom Domain**
- [ ] **Enable Analytics & Monitoring**

### **Phase 2: Supabase Configuration (Ready)**
- [ ] **Create Supabase Project** (User logged in)
- [ ] **Set up Authentication** (Google OAuth)
- [ ] **Configure Database Schema** (User profiles, projects)
- [ ] **Set Row Level Security (RLS) Policies**
- [ ] **Configure Environment Variables**

### **Phase 3: Domain & SSL**
- [ ] **Purchase Custom Domain** (Required for OAuth)
- [ ] **Configure DNS Settings**
- [ ] **Set up SSL Certificate** (Automatic with Vercel)
- [ ] **Update OAuth Callback URLs**

## 🔧 **ENVIRONMENT VARIABLES NEEDED**

### **Current Production Variables**
```bash
# AI API Keys
OPENAI_API_KEY="sk-proj-..."
REPLICATE_API_TOKEN="r8_..."
OPENROUTER_API_KEY="sk-or-..." # NEW

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Authentication
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"

# Admin Configuration
ADMIN_EMAIL="taskmasterpeace@gmail.com"
```

## 🗄️ **SUPABASE DATABASE SCHEMA**

### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Projects Table**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'story', 'music-video', 'commercial'
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **User Templates Table**
```sql
CREATE TABLE user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL, -- 'story', 'music-video', 'commercial', 'image-edit'
  name TEXT NOT NULL,
  content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **AI Usage Tracking**
```sql
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  function_type TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 **ROW LEVEL SECURITY POLICIES**

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Projects are private to users
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Templates can be public or private
CREATE POLICY "Users can view own templates" ON user_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Usage tracking for cost monitoring
CREATE POLICY "Users can view own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);
```

## 🎯 **VERCEL DEPLOYMENT CONFIGURATION**

### **Build Configuration** (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_APP_ENV": "production"
  },
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### **Next.js Configuration Updates**
```javascript
// next.config.mjs
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix for production
  },
  eslint: {
    ignoreDuringBuilds: false, // Fix for production
  },
  images: {
    domains: ['replicate.delivery', 'supabase.co'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}
```

## 📊 **ADMIN MODEL MANAGEMENT FEATURES**

### **Implemented Features**
- ✅ **Admin Authentication**: taskmasterpeace@gmail.com only
- ✅ **Function-Based Model Selection**: Story, Music, Director, Entity, Commercial
- ✅ **Model Categories**: Current defaults, Suggested alternatives, Free options
- ✅ **Cost Monitoring**: Track spending per model per function
- ✅ **Test Functionality**: Verify model performance
- ✅ **Real-time Updates**: Changes apply immediately system-wide

### **Model Configuration Ready**
- **Story Breakdown**: GPT-4o → Claude 3.5 Sonnet, Llama 3.3 70B, Free alternatives
- **Music Analysis**: GPT-4o Mini → Gemini Pro 1.5, Free Gemini Flash
- **Director Creation**: GPT-4o → Claude 3.5 Sonnet, Free Llama 3.3
- **Entity Extraction**: GPT-4o Mini → Gemini Pro 1.5, Free Gemini Flash
- **Commercial Generation**: GPT-4o → Claude 3.5 Sonnet, Free Llama 3.3

## 🎯 **NEXT STEPS**

1. **Complete Vercel Authentication** (In Progress)
2. **Create Vercel Project** from GitHub repository
3. **Configure Environment Variables** in Vercel dashboard
4. **Set up Supabase Project** and database schema
5. **Configure Google OAuth** with production domains
6. **Deploy and Test** production environment

## 🔒 **SECURITY NOTES**

- **Admin Access**: Only you can configure models system-wide
- **API Keys**: All secured server-side, never exposed to client
- **User Data**: Protected with Supabase RLS policies  
- **Cost Control**: Per-user rate limiting and budget monitoring
- **Model Testing**: Built-in verification before switching models

**Ready for production deployment with comprehensive model management and admin controls!**