# Director's Palette - Credit System Design

## 💳 **CREDIT SYSTEM OVERVIEW**

**Philosophy:** Simple, transparent, and profitable credit system that encourages using our FREE models while providing premium options when needed.

**Credit Value:** 1 credit = $0.01 USD (easy mental math)

---

## 🎯 **CREDIT ALLOCATION TABLE**

### **Text Generation (Story, Character, Analysis)**
```
┌─────────────────────────────┬─────────────┬──────────────┬─────────────┐
│ Model Type                  │ Our Cost    │ Credit Cost  │ Profit      │
├─────────────────────────────┼─────────────┼──────────────┼─────────────┤
│ FREE Models (6 available)   │ $0.000      │ 0 credits   │ N/A         │
│ KIMI VL A3B (Cheapest)     │ $0.0008     │ 1 credit    │ 900%        │
│ Qwen Turbo                 │ $0.0017     │ 2 credits   │ 1100%       │
│ DeepSeek V3.1              │ $0.0084     │ 5 credits   │ 500%        │
│ GPT-4o Mini                │ $0.0063     │ 5 credits   │ 700%        │
│ GPT-4o (Premium)           │ $0.17       │ 20 credits  │ 18%         │
│ Claude 3.5 Sonnet          │ $0.15       │ 18 credits  │ 20%         │
└─────────────────────────────┴─────────────┴──────────────┴─────────────┘
```

### **Image Generation (Gen4, Character References)**
```
┌─────────────────────────────┬─────────────┬──────────────┬─────────────┐
│ Service                     │ Our Cost    │ Credit Cost  │ Profit      │
├─────────────────────────────┼─────────────┼──────────────┼─────────────┤
│ Replicate Gen4 Image        │ $0.20       │ 25 credits  │ 25%         │
│ Replicate Gen4 Turbo        │ $0.15       │ 20 credits  │ 33%         │
│ Stable Diffusion XL        │ $0.08       │ 12 credits  │ 50%         │
│ DALL-E 3 HD                │ $0.12       │ 15 credits  │ 25%         │
└─────────────────────────────┴─────────────┴──────────────┴─────────────┘
```

### **Video Generation (Expensive - Rate Limited)**
```
┌─────────────────────────────┬─────────────┬──────────────┬─────────────┐
│ Service                     │ Our Cost    │ Credit Cost  │ Profit      │
├─────────────────────────────┼─────────────┼──────────────┼─────────────┤
│ RunwayML Gen-4 (5 sec)     │ $0.25       │ 30 credits  │ 20%         │
│ RunwayML Gen-4 (10 sec)    │ $0.50       │ 60 credits  │ 20%         │
│ RunwayML Gen-3 (5 sec)     │ $0.50       │ 60 credits  │ 20%         │
│ Stable Video (4 sec)       │ $0.20       │ 25 credits  │ 25%         │
│ Google Veo 2 (1 sec)       │ $0.50       │ 60 credits  │ 20%         │
└─────────────────────────────┴─────────────┴──────────────┴─────────────┘
```

---

## 📊 **PRICING TIER DESIGN**

### **Creator Free: $0/month**
```
🆓 What's Included:
- 50 FREE generations/month (unlimited FREE models)
- 0 credits for premium features
- All workflow features (story, music video, commercial, children's books)
- Character consistency system
- Export capabilities

Monthly Cost to Us: $0.00
Monthly Revenue: $0.00
Purpose: User acquisition, product demonstration
```

### **Creator Pro: $25/month** ⭐ **RECOMMENDED**
```
💎 What's Included:
- Unlimited FREE model usage (our massive advantage)
- 1,500 credits for premium features
- All workflow features
- Priority processing
- No watermarks

Credit Allocation Examples:
- 75 premium text generations (1,500 ÷ 20 = 75)
- 60 image generations (1,500 ÷ 25 = 60)
- 25 video generations (1,500 ÷ 60 = 25)
- Mix and match based on needs

Monthly Cost to Us: $3-12 (depending on usage)
Monthly Revenue: $25.00
Profit: $13-22 (52-88% margin) ✅
```

### **Studio Pro: $75/month**
```
🏢 What's Included:
- Everything in Creator Pro
- 5,000 credits for heavy usage
- API access
- Custom model preferences
- Bulk operations

Credit Allocation Examples:
- 250 premium text generations
- 200 image generations  
- 80 video generations
- Heavy creative production

Monthly Cost to Us: $15-50
Monthly Revenue: $75.00
Profit: $25-60 (33-80% margin) ✅
```

### **Enterprise: $200/month**
```
🏭 What's Included:
- 20,000 credits
- Unlimited FREE models
- API access with higher rate limits
- Custom integrations
- Priority support
- White-label options

Handles extreme usage scenario:
- 5 stories + 90 images + 160 videos = ~10,000 credits
- Still profitable with room for growth

Monthly Cost to Us: $50-120
Monthly Revenue: $200.00  
Profit: $80-150 (40-75% margin) ✅
```

---

## ⚠️ **RATE LIMITING STRATEGY**

### **Video Generation Limits (Most Expensive)**
```
Free Tier:
- 0 video generations/month
- Demo only with watermarks

Creator Pro ($25):
- 25 video generations/month (1,500 credits ÷ 60)
- Rate limit: 5 videos per day
- Warning at 20 videos: "5 remaining this month"

Studio Pro ($75):
- 80 video generations/month  
- Rate limit: 15 videos per day
- Burst allowance: Up to 25 videos in one day

Enterprise ($200):
- 300+ video generations/month
- Higher rate limits
- Burst allowances for production deadlines
```

### **Smart Rate Limiting Features:**
```javascript
// Progressive warnings
if (usage.credits > tierLimit * 0.8) {
  showWarning("You've used 80% of your credits");
}

if (usage.credits > tierLimit * 0.95) {
  showWarning("5% credits remaining - consider upgrading");
}

// Suggest alternatives
if (requestingExpensiveModel && cheapAlternativeAvailable) {
  showSuggestion("Try KIMI K2 (FREE) for similar quality?");
}
```

---

## 🎨 **USER INTERFACE INTEGRATION**

### **Credit Display Components:**
```javascript
// Credit meter in header
<CreditMeter 
  current={user.creditsUsed} 
  total={user.creditLimit}
  tier={user.tier}
  showWarnings={true}
/>

// Pre-generation cost preview
<CostPreview 
  model={selectedModel}
  estimatedTokens={estimatedUsage}
  creditsRequired={calculateCredits()}
  alternatives={suggestCheaperModels()}
/>

// Post-generation receipt
<GenerationReceipt
  creditsUsed={actualCredits}
  creditsRemaining={remainingCredits}
  costBreakdown={detailedCosts}
  suggestions={optimizationTips}
/>
```

### **Mobile Credit Management:**
```javascript
// Bottom sheet for mobile credit info
<Sheet>
  <SheetTrigger>
    <Button className="fixed bottom-4 right-4">
      {creditsRemaining} credits
    </Button>
  </SheetTrigger>
  <SheetContent>
    <CreditHistory />
    <UsageProjections />
    <UpgradeOptions />
  </SheetContent>
</Sheet>
```

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Credit System Backend (Week 1)**
```
✅ Credit tracking in user database
✅ Usage monitoring per model
✅ Rate limiting implementation
✅ Cost calculation functions
```

### **Phase 2: UI Integration (Week 2)**
```
✅ Credit meter in interface
✅ Pre-generation cost preview
✅ Post-generation receipts
✅ Mobile credit management
```

### **Phase 3: Three.js Landing Page (Weeks 3-6)**
```
✅ Hero section with particle animations
✅ Interactive model showcase
✅ Pricing calculator with 3D visualizations
✅ Video content integration
```

### **Phase 4: Advanced Features (Weeks 7-8)**
```
✅ Smart model suggestions
✅ Usage analytics dashboard
✅ Bulk operation pricing
✅ API credit management
```

---

## 💡 **KEY STRATEGIC INSIGHTS**

### **Why This Credit System Works:**

**1. FREE Model Advantage:**
- Users get unlimited value from FREE models
- Credits only needed for premium features
- Massive differentiation from competitors

**2. Transparent Pricing:**
- 1 credit = 1 cent (easy math)
- Real-time cost display
- No surprises or hidden fees

**3. Profitable Margins:**
- Text generation: 500-900% markup on cheap models
- Image generation: 25-50% markup (reasonable)
- Video generation: 20-25% markup (covers infrastructure)

**4. Smart Defaults:**
- Route to FREE models first
- Suggest cheap alternatives
- Premium only when quality demanded

### **Competitive Advantage:**
```
Competitor Model:
- Midjourney: $60/month for ~1,800 images
- RunwayML: $95/month for unlimited (throttled) video
- LTX Studio: $125/month for 25 hours computing

Our Model:
- $25/month for complete creative workflow
- FREE models for most use cases
- Transparent credit system
- Multiple creative formats

Value Proposition: 3-5x cheaper with better features
```

---

## 🎯 **FINAL RECOMMENDATION**

**Implement $25/month Creator Pro tier with 1,500 credits:**
- **Handles typical users** comfortably (text + some images/videos)
- **Profitable margins** (52-88% depending on usage)
- **Competitive positioning** (much cheaper than alternatives)
- **Growth path** to Studio ($75) and Enterprise ($200)

**The credit system encourages smart usage while providing premium options when needed. Your FREE model advantage creates a massive moat that competitors can't match!**