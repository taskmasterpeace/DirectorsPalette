import { extractStoryReferences, generateStoryBreakdownWithReferences } from '@/app/actions/story';

export async function POST(request: Request) {
  try {
    const { story, action, references } = await request.json();
    
    if (action === 'generate' && references) {
      const result = await generateStoryBreakdownWithReferences(
        story,
        'tarantino',
        'Test generation with constrained references',
        references,
        { enabled: false, format: 'full', approaches: [] },
        { includeCameraStyle: true, includeColorPalette: true },
        'ai-suggested',
        3
      );
      return Response.json(result);
    } else {
      const result = await extractStoryReferences(story, 'tarantino', '');
      return Response.json(result);
    }
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Test failed' 
    }, { status: 500 });
  }
}