
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

    if (!googleVisionApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Vision API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting image analysis with Google Vision API...');

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

    console.log('Vision API response status:', visionResponse.status);

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', visionResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Google Vision API error: ${visionResponse.status}`,
          details: errorText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionResponse.json();
    console.log('Vision API analysis complete');

    const annotations = visionData.responses[0];
    
    if (annotations.error) {
      console.error('Vision API returned error:', annotations.error);
      return new Response(
        JSON.stringify({ 
          error: 'Vision API analysis failed',
          details: annotations.error 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract information from Vision API response
    const labels = annotations.labelAnnotations?.map(label => label.description) || [];
    const texts = annotations.textAnnotations?.map(text => text.description) || [];
    const objects = annotations.localizedObjectAnnotations?.map(obj => obj.name) || [];

    const imageDescription = `Labels detected: ${labels.join(', ')}. Text found: ${texts.join(' ')}. Objects: ${objects.join(', ')}.`;
    
    console.log('Image description:', imageDescription);
    console.log('Generating quiz with OpenAI...');

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
            content: `You are a quiz generator. Create exactly ${questionCount} multiple choice questions based on the image analysis provided. You MUST respond with ONLY a valid JSON object, no markdown formatting, no code blocks, no additional text. The format should be: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..."}]}`
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
      const errorText = await quizResponse.text();
      console.error('OpenAI API error:', quizResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${quizResponse.status}`,
          details: errorText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quizData = await quizResponse.json();
    const content = quizData.choices[0].message.content;
    
    console.log('Quiz generation complete');
    console.log('Raw OpenAI response:', content);
    
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks (```json ... ```)
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned content for parsing:', cleanedContent);
      
      const quiz = JSON.parse(cleanedContent);
      
      // Validate the quiz structure
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Invalid quiz format: missing questions array');
      }
      
      return new Response(JSON.stringify(quiz), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      console.error('Parse error:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate valid quiz format',
          details: parseError.message,
          rawResponse: content
        }),
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
