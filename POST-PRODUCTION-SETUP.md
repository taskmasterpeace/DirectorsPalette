# Post Production Setup Guide

## ✅ What's Already Done

1. **Integration Structure Created**
   - Post Production module at `/post-production`
   - Shot transfer system from Story/Music Video modes
   - Zustand store for state management
   - API endpoint for Replicate integration

2. **UI Components Ready**
   - "Send to Post Production" buttons in Story and Music Video modes
   - Post Production page with shot queue
   - Navigation link in sidebar
   - Progress tracking and status display

3. **Core Functionality**
   - Shot transfer via sessionStorage
   - Queue management system
   - Basic Replicate client implementation
   - Generation API endpoint

## 🔧 What You Need to Do

### Step 1: Add Replicate API Key
Create or update `.env.local` file:
```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

Get your token from: https://replicate.com/account/api-tokens

### Step 2: Install Replicate (Manual)
Since npm is having issues, manually add to `package.json`:
```json
"dependencies": {
  ...
  "replicate": "^0.25.1",
  ...
}
```

Then delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

Or try with yarn:
```bash
yarn add replicate
```

### Step 3: Test the Flow

1. **Start the dev server**
   ```bash
   npm run dev
   ```

2. **Generate shots in Story Mode**
   - Go to Story Mode
   - Enter a story
   - Click "Extract Story References"
   - Wait for generation
   - Click "Send to Post Production" button

3. **Check Post Production**
   - Navigate to Post Production in sidebar
   - You should see your shots in the queue
   - Click "Generate All" to test image generation

## 📁 File Structure

```
app/post-production/
├── page.tsx                    # Main Post Production interface
└── api/
    └── generate/
        └── route.ts            # Replicate API endpoint

lib/post-production/
├── types.ts                    # TypeScript types
├── transfer.ts                 # Shot transfer utilities
└── replicate-client.ts        # Replicate API wrapper

stores/
└── post-production-store.ts    # Zustand state management
```

## 🎯 How It Works

1. **Shot Transfer**
   - User generates shots in Story/Music Video mode
   - Clicks "Send to Post Production"
   - Shots are stored in sessionStorage
   - User is navigated to Post Production page
   - Shots are automatically imported

2. **Image Generation**
   - Post Production page displays shot queue
   - User clicks "Generate All"
   - Each shot is sent to Replicate API
   - Images are generated and displayed
   - Results can be downloaded

## 🚀 Next Steps (Optional)

If you want more ImageMax features:

1. **Copy more components** from `imagemax/` folder:
   - Template system
   - Advanced settings
   - Batch controls

2. **Add more Replicate models**:
   - Edit `lib/post-production/replicate-client.ts`
   - Add model selection dropdown

3. **Enhance UI**:
   - Add image preview gallery
   - Implement drag-and-drop reordering
   - Add bulk operations

## ⚠️ Troubleshooting

### If Replicate doesn't work:
1. Check API key is in `.env.local`
2. Restart dev server after adding env vars
3. Check browser console for errors
4. Verify Replicate account has credits

### If shots don't transfer:
1. Make sure you click "Send to Post Production" button
2. Check browser console for errors
3. Verify sessionStorage is enabled

### If npm install fails:
1. Clear npm cache: `npm cache clean --force`
2. Try yarn instead: `yarn install`
3. Or manually install: Copy `node_modules/replicate` from ImageMax

## 📞 Support

The integration is ready to use! Just add your Replicate API key and you're good to go.

For any issues:
1. Check the browser console for errors
2. Verify all files are in place
3. Make sure environment variables are set

---

**Status: Ready for Testing**
*Last Updated: Current*