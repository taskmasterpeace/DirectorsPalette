import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured" },
        { status: 500 }
      );
    }

    // Test 1: Check if the model exists
    console.log('🔍 Testing model availability...');
    
    const modelResponse = await fetch(
      "https://api.replicate.com/v1/models/vaibhavs10/incredibly-fast-whisper",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`📊 Model check status: ${modelResponse.status}`);
    
    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      console.error('❌ Model check failed:', errorText);
      
      return NextResponse.json({
        error: "Model not found or inaccessible",
        status: modelResponse.status,
        details: errorText,
        suggestion: "Check model name and API token permissions"
      });
    }

    const modelInfo = await modelResponse.json();
    console.log('✅ Model found:', modelInfo.name);

    // Test 2: Try to create a simple prediction (without audio)
    const testBody = {
      input: {
        audio: "https://replicate.delivery/pbxt/IJrkMlBjdJllyQlxI2vINwLJgGrF4Hj3NPGR9LBYcfgSBwqUE/5AM%20In%20Enron.mp3", // Use a test URL
        task: "transcribe",
        language: "None",
        timestamp: "word"
      }
    };

    console.log('🔍 Testing prediction creation...');
    
    const predictionResponse = await fetch(
      "https://api.replicate.com/v1/models/vaibhavs10/incredibly-fast-whisper/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testBody)
      }
    );

    console.log(`📊 Prediction status: ${predictionResponse.status}`);

    if (!predictionResponse.ok) {
      const errorText = await predictionResponse.text();
      console.error('❌ Prediction failed:', errorText);
      
      return NextResponse.json({
        error: "Prediction creation failed",
        status: predictionResponse.status,
        details: errorText,
        modelInfo: modelInfo
      });
    }

    const predictionResult = await predictionResponse.json();
    console.log('✅ Prediction created:', predictionResult.id);

    return NextResponse.json({
      success: true,
      message: "Model is accessible and working",
      modelInfo: modelInfo,
      testPrediction: predictionResult
    });

  } catch (error) {
    console.error('💥 Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}