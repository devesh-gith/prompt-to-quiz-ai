
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, questionCount = 5 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, analyze the image with Google Vision API
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: imageBase64
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'TEXT_DETECTION', maxResults: 5 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
          ]
        }]
      }),
    });

    if (!visionResponse.ok) {
      throw new Error(`Google Vision API error: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    const annotations = visionData.responses[0];
    
    // Extract information from Vision API response
    const labels = annotations.labelAnnotations?.map(label => label.description) || [];
    const texts = annotations.textAnnotations?.map(text => text.description) || [];
    const objects = annotations.localizedObjectAnnotations?.map(obj => obj.name) || [];

    const imageDescription = `Labels detected: ${labels.join(', ')}. Text found: ${texts.join(' ')}. Objects: ${objects.join(', ')}.`;

    // Generate quiz questions using OpenAI based on the image analysis
    const quizResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a quiz generator. Create exactly ${questionCount} multiple choice questions based on the image analysis provided. Format your response as a JSON object with a "questions" array. Each question should have: "question", "options" (array of 4 choices), "correct" (index of correct answer 0-3), and "explanation".`
          },
          {
            role: 'user',
            content: `Generate ${questionCount} quiz questions based on this image analysis: ${imageDescription}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!quizResponse.ok) {
      throw new Error(`OpenAI API error: ${quizResponse.status}`);
    }

    const quizData = await quizResponse.json();
    const content = quizData.choices[0].message.content;
    
    try {
      const quiz = JSON.parse(content);
      return new Response(JSON.stringify(quiz), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to generate valid quiz format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in generate-image-quiz function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
