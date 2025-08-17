# Replicate API Integration Questions

## Critical Model Information Needed

### 1. Seedance Models (ByteDance)
- **What is the exact model ID for seedance-1-lite?**
  - Is it `bytedance/seedance-1-lite` or something else?
  - What are the exact input parameters it accepts?
  - What resolutions does it support? (480p, 720p, 1080p?)
  - What duration options are available? (5 seconds, 10 seconds?)
  - Does it support a `camera_fixed` parameter?
  - Does it support a `last_frame_image` parameter for continuity?

- **What is the exact model ID for seedance-1-pro?**
  - Is it `bytedance/seedance-1-pro`?
  - What are the differences in capabilities from lite?
  - Does it support higher resolutions than lite?
  - What are the cost differences?

### 2. Kontext Model (Black Forest Labs)
- **What is the exact model ID for Kontext?**
  - Is it `black-forest-labs/flux-kontext-pro`?
  - Or is it `black-forest-labs/flux-1.1-pro-kontext`?
  - What input parameters does it accept?
  - Does it use `input_image` or `image` as the parameter name?
  - What is the `safety_tolerance` parameter range?
  - Does it have a dev/max model variant or is that just pricing tiers?

### 3. Gen4 Model (RunwayML)
- **What is the exact model ID for Gen4 image generation?**
  - Is it `runwayml/gen4-image`?
  - Or is it `runwayml/gen-4`?
  - How many reference images can it accept? (Maximum 3?)
  - What format should reference_images be in? (URLs? Base64?)
  - What are the `reference_tags` and how should they be formatted?
  - What aspect ratios are supported? (16:9, 9:16, 1:1, 4:3, 3:4?)
  - What resolutions are supported? (720p, 1080p, 4K?)

### 4. Flux Models for Image Generation
- **Which Flux model should be used for standard image generation?**
  - `black-forest-labs/flux-1.1-pro`?
  - `black-forest-labs/flux-dev`?
  - `black-forest-labs/flux-schnell`?
  - What are the differences between these models?
  - Which one supports reference images?
  - What are the cost differences?

## API Implementation Questions

### 5. Authentication & Headers
- **What headers are required for Replicate API calls?**
  - Is it just `Authorization: Token ${API_KEY}`?
  - Should we use `Prefer: wait` for synchronous responses?
  - Are there any rate limiting headers we should be aware of?

### 6. Prediction Workflow
- **What's the correct workflow for long-running predictions?**
  - Should we use webhooks or polling?
  - If polling, what's the recommended interval?
  - How long do predictions typically take for each model?
  - What are the timeout limits?

### 7. File Upload & URLs
- **How should media files be provided to the models?**
  - Do we need to upload files to Replicate first?
  - Can we use external URLs directly?
  - What's the maximum file size accepted?
  - How long do uploaded files persist?
  - Should we use the `/v1/files` endpoint for uploads?

### 8. Error Handling
- **What error codes should we handle?**
  - What does error 422 mean specifically?
  - How should we handle rate limiting (429)?
  - What are the quota limits?
  - How to handle model unavailability?

## Specific Parameter Questions

### 9. Video Generation Parameters
- **For Seedance models:**
  - What FPS options are available? (24fps default?)
  - What's the format of the `resolution` parameter? ("480p" or "480x640"?)
  - What video codecs are supported for output?
  - Can we specify output format (mp4, webm, etc.)?

### 10. Image Editing Parameters
- **For Kontext models:**
  - What's the difference between "dev" and "max" models?
  - Is it actually different model IDs or just different parameters?
  - What image formats are accepted as input?
  - What's the maximum resolution supported?

### 11. Cost & Performance
- **What are the exact costs for each model?**
  - Seedance-1-lite: Cost per second of video?
  - Seedance-1-pro: Cost per second of video?
  - Kontext dev: $0.003 per image - is this accurate?
  - Kontext max: $0.055 per image - is this accurate?
  - Gen4: Cost per generation with reference images?

### 12. Model Availability
- **Are all these models publicly available on Replicate?**
  - Do any require special access or waitlist?
  - Are there any geographic restrictions?
  - Do any require enterprise accounts?

## Code Examples Needed

### 13. Working Examples
Please provide working curl/JavaScript examples for:
1. **Seedance video generation** with an input image and prompt
2. **Kontext image editing** with an input image and edit prompt
3. **Gen4 generation** with multiple reference images
4. **File upload** to Replicate and using the URL in a prediction

### 14. Response Formats
- What's the exact JSON structure returned by each model?
- Where is the output URL in the response?
- How do we know if a prediction succeeded vs failed?
- What metadata is included in the response?

## Current Issues to Debug

### 15. Specific Error Cases
The current implementation is trying to use:
- `stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf`

This seems wrong. What model should we actually be using for basic image generation in the workspace?

### 16. ImageMax Reference
The ImageMax app seems to be successfully using these endpoints:
- `/api/generate-media` for Seedance and Kontext
- `/api/gen4` for Gen4 generation

Can you confirm these models and parameters are correct by testing them with the Replicate API?

## Additional Information Needed

### 17. Best Practices
- Should we implement retry logic? How many retries?
- Should we cache predictions? For how long?
- How should we handle partial failures in batch operations?
- What's the best way to cancel in-progress predictions?

### 18. Alternative Models
If the above models aren't available or working:
- What are the best alternatives for video generation?
- What are the best alternatives for image editing?
- What are the best alternatives for image generation with style references?

Please provide specific, tested answers with actual API responses where possible. Include any model IDs, parameter names, and example payloads that have been verified to work with the current Replicate API.