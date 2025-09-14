# Directors Palette - Security Implementation Guide

## 🔐 **SECURITY SYSTEM OVERVIEW**

Directors Palette now includes comprehensive security measures to protect against common vulnerabilities and enable safe API monetization.

---

## 🚨 **IMMEDIATE SECURITY REQUIREMENTS**

### **1. Environment Variable Setup**
Copy `.env.example` to `.env.local` and configure:

```bash
# CRITICAL: Set these immediately
API_RATE_LIMIT_ENABLED=true
API_AUTH_REQUIRED=true
CORS_ORIGIN=https://directorspal.com

# REQUIRED: Add your API keys (never commit these!)
OPENAI_API_KEY=sk-proj-your-actual-key
REPLICATE_API_TOKEN=r8_your-actual-token
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

### **2. Database Migration**
Run the API keys migration:
```bash
# Apply security database schema
supabase migration up
```

### **3. Generate Admin API Key**
First API key for testing:
```bash
# This creates your master API key (change immediately after testing)
# Key: dp_admin_master_key_change_immediately
```

---

## 🛡️ **SECURITY FEATURES IMPLEMENTED**

### **API Authentication System**
- ✅ **API Key Format**: `dp_[64-character-hex]` format
- ✅ **Multiple Auth Methods**: Bearer token, X-API-Key header, query param (dev only)
- ✅ **Secure Storage**: SHA256 hashed keys in database
- ✅ **Permission System**: Granular permissions per API key

### **Rate Limiting Protection**
- ✅ **Per-API-Key Limits**: Configurable requests per minute
- ✅ **Free Tier**: 10 req/min, Pro Tier: 60 req/min, Enterprise: 600 req/min
- ✅ **Automatic Reset**: 1-minute rolling windows
- ✅ **Headers**: Standard rate limit headers in responses

### **Input Validation & Sanitization**
- ✅ **Zod Schemas**: Type-safe validation for all inputs
- ✅ **XSS Prevention**: HTML sanitization with DOMPurify
- ✅ **Prompt Injection Protection**: AI prompt sanitization
- ✅ **File Upload Security**: MIME type, size, content validation

### **Security Headers**
- ✅ **CORS Protection**: Configurable origin restrictions
- ✅ **XSS Protection**: Content-Security-Policy headers
- ✅ **Click-jacking Protection**: X-Frame-Options
- ✅ **HTTPS Enforcement**: Strict-Transport-Security

---

## 🔑 **API AUTHENTICATION USAGE**

### **For External Developers**
```javascript
// Using Authorization header (recommended)
fetch('https://directorspal.com/api/v1/generate/story', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer dp_your-api-key-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    story: "A detective enters a warehouse...",
    director: "christopher-nolan"
  })
})

// Using X-API-Key header (alternative)
fetch('https://directorspal.com/api/v1/generate/story', {
  headers: {
    'X-API-Key': 'dp_your-api-key-here'
  }
})
```

### **API Key Management**
```typescript
// Generate new API key
const newKey = generateApiKey() // Returns: dp_[64-chars]

// Store in database (hashed)
const hashedKey = hashApiKey(newKey)
await supabase.from('api_keys').insert({
  user_id: userId,
  name: 'My App Integration',
  key_hash: hashedKey,
  permissions: ['story:generate', 'image:generate:basic'],
  rate_limit: 60
})
```

---

## 🎯 **PROTECTED ENDPOINTS**

### **Image Generation** - `image:generate` permission
- `POST /post-production/api/gen4` - AI image generation
- Cost: $0.01-0.05 per image (based on model)

### **Story Generation** - `story:generate` permission
- `POST /api/v1/story/generate` - Story breakdown
- Cost: $0.05 per story generation

### **Music Video Generation** - `music-video:generate` permission
- `POST /api/v1/music-video/generate` - Music video concepts
- Cost: $0.10 per music video generation

### **File Uploads** - `upload:media` permission
- `POST /api/upload-media` - Secure file uploads
- Limits: 10MB images, 25MB audio

---

## ⚠️ **SECURITY WARNINGS & COMPLIANCE**

### **Environment Security**
- 🚨 **NEVER commit .env.local** - Already in .gitignore
- 🚨 **Rotate API keys regularly** - Every 90 days minimum
- 🚨 **Monitor usage** - Watch for unusual API patterns
- 🚨 **Use HTTPS only** - No HTTP in production

### **Production Checklist**
- [ ] All API keys rotated and secured
- [ ] Rate limiting enabled (`API_RATE_LIMIT_ENABLED=true`)
- [ ] CORS origin restricted (`CORS_ORIGIN=https://directorspal.com`)
- [ ] Error details disabled in production
- [ ] Security headers active
- [ ] Database RLS policies enabled

### **Compliance Considerations**
- **GDPR**: User data protection, right to deletion
- **CCPA**: California privacy compliance
- **SOC 2**: Enterprise customer requirements
- **OWASP Top 10**: Protection against common vulnerabilities

---

## 🔍 **SECURITY MONITORING**

### **API Usage Tracking**
```sql
-- Monitor API usage patterns
SELECT
  endpoint,
  COUNT(*) as requests,
  SUM(cost_usd) as total_cost,
  AVG(duration_ms) as avg_response_time
FROM api_usage
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint;
```

### **Security Alerts**
- **Rate Limit Exceeded**: Monitor for abuse patterns
- **Failed Authentication**: Track invalid API key attempts
- **Large File Uploads**: Monitor for potential attacks
- **Unusual Usage Patterns**: AI generation spikes

---

## 🚀 **MONETIZATION SECURITY**

### **API Billing Protection**
- ✅ **Usage Tracking**: Every API call logged with cost
- ✅ **Credit System**: Pre-paid credit deduction
- ✅ **Overage Protection**: Automatic limiting when credits exhausted
- ✅ **Billing Analytics**: Revenue tracking per customer

### **Enterprise Features**
- **Custom Rate Limits**: Higher limits for enterprise customers
- **Dedicated API Keys**: Multiple keys per organization
- **Usage Analytics**: Detailed reporting dashboards
- **SLA Guarantees**: Contractual uptime commitments

---

## 🛠️ **IMPLEMENTATION STATUS**

- ✅ **API Authentication**: Implemented with middleware
- ✅ **Rate Limiting**: In-memory (upgrade to Redis for scale)
- ✅ **Input Validation**: Zod schemas for all endpoints
- ✅ **File Security**: Upload validation and sanitization
- ✅ **Security Headers**: CORS, XSS, clickjacking protection
- ✅ **Environment Protection**: Secure configuration management

**Next Steps for Production:**
1. Generate and configure production API keys
2. Enable security features in environment variables
3. Test API endpoints with authentication
4. Monitor security logs and usage patterns

---

*Security implementation ready for enterprise customers and API monetization.*