
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const assemblyAIApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
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
    const { youtubeUrl, questionCount = 5 } = await req.json();

    console.log('Processing YouTube URL:', youtubeUrl);

    if (!youtubeUrl) {
      return new Response(
        JSON.stringify({ error: 'YouTube URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!assemblyAIApiKey || !openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required API keys. Please configure AssemblyAI and OpenAI API keys.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract video ID from YouTube URL
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting transcription with AssemblyAI...');

    // Use AssemblyAI to transcribe the YouTube video
    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAIApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: youtubeUrl,
        auto_chapters: false,
        language_detection: true,
      }),
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('AssemblyAI API error:', transcriptionResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Transcription service error: ${transcriptionResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcriptId = transcriptionData.id;

    console.log('Transcription started, ID:', transcriptId);

    // Poll for transcription completion
    let transcript;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes timeout (5 second intervals)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': assemblyAIApiKey,
        },
      });

      if (!statusResponse.ok) {
        console.error('Error checking transcription status:', statusResponse.status);
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log('Transcription status:', statusData.status);
      
      if (statusData.status === 'completed') {
        transcript = statusData.text;
        console.log('Transcription completed successfully');
        break;
      } else if (statusData.status === 'error') {
        console.error('Transcription error:', statusData.error);
        throw new Error(`Transcription failed: ${statusData.error || 'Unknown error'}`);
      }

      attempts++;
    }

    if (!transcript) {
      throw new Error('Transcription timeout - the video may be too long or the service is busy');
    }

    if (transcript.length < 50) {
      throw new Error('Transcript too short - the video may not contain enough speech content');
    }

    console.log('Generating quiz with OpenAI...');

    // Generate quiz questions using OpenAI based on the transcript
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
            content: `You are a quiz generator. Create exactly ${questionCount} multiple choice questions based on the YouTube video transcript. You MUST respond with ONLY a valid JSON object, no markdown formatting, no code blocks, no additional text. The format should be: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..."}]}`
          },
          {
            role: 'user',
            content: `Generate ${questionCount} quiz questions from this YouTube video transcript. Focus on the main topics and key information:\n\n${transcript.substring(0, 8000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!quizResponse.ok) {
      const errorText = await quizResponse.text();
      console.error('OpenAI API error:', quizResponse.status, errorText);
      throw new Error(`Quiz generation failed: ${quizResponse.status}`);
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
    console.error('Error in generate-youtube-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        type: 'function_error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
