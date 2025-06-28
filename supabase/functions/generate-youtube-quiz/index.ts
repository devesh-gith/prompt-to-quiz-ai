
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

    const videoId = videoIdMatch[1];
    console.log('Extracted video ID:', videoId);

    // Convert YouTube URL to a format that AssemblyAI can process
    // Using the full YouTube URL but with proper formatting
    const processableUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log('Starting transcription with AssemblyAI...');

    // Use AssemblyAI to transcribe the YouTube video
    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAIApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: processableUrl,
        auto_chapters: false,
        language_detection: true,
        speech_model: 'best',
      }),
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('AssemblyAI API error:', transcriptionResponse.status, errorText);
      
      // More specific error handling
      if (transcriptionResponse.status === 400) {
        return new Response(
          JSON.stringify({ error: 'The YouTube URL provided is not accessible or does not contain audio content. Please try a different video or check if the video is publicly available.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Transcription service error: ${transcriptionResponse.status}. Please try again or use a different YouTube video.` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcriptId = transcriptionData.id;

    console.log('Transcription started, ID:', transcriptId);

    // Poll for transcription completion with better error handling
    let transcript;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes timeout (5 second intervals)

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
        
        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to transcribe the video. ';
        if (statusData.error && statusData.error.includes('audio')) {
          errorMessage += 'The video may not contain clear audio content or may be too short.';
        } else if (statusData.error && statusData.error.includes('access')) {
          errorMessage += 'The video may be private or restricted.';
        } else {
          errorMessage += 'Please try with a different YouTube video.';
        }
        
        throw new Error(errorMessage);
      }

      attempts++;
    }

    if (!transcript) {
      throw new Error('Transcription timeout - the video may be too long or the service is busy. Please try with a shorter video or try again later.');
    }

    if (transcript.length < 50) {
      throw new Error('The transcript is too short to generate meaningful questions. Please try with a video that has more spoken content.');
    }

    console.log('Transcript length:', transcript.length, 'characters');
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
            content: `You are a quiz generator. Create exactly ${questionCount} multiple choice questions based on the YouTube video transcript. CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include markdown formatting, code blocks, or any other text. The JSON should have this exact structure: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..."}]}`
          },
          {
            role: 'user',
            content: `Generate ${questionCount} quiz questions from this YouTube video transcript. Focus on key concepts, facts, and important information discussed in the video:\n\n${transcript.substring(0, 8000)}`
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
      // Clean the response by removing any potential markdown formatting
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Remove any leading/trailing whitespace or newlines
      cleanedContent = cleanedContent.trim();
      
      console.log('Cleaned content for parsing:', cleanedContent);
      
      const quiz = JSON.parse(cleanedContent);
      
      // Validate the quiz structure
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Invalid quiz format: missing questions array');
      }
      
      if (quiz.questions.length === 0) {
        throw new Error('No questions were generated from the video content');
      }
      
      // Validate each question
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${i}`);
        }
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= 4) {
          throw new Error(`Invalid correct answer index at question ${i}`);
        }
      }
      
      console.log('Quiz validation successful, returning quiz with', quiz.questions.length, 'questions');
      
      return new Response(JSON.stringify(quiz), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      console.error('Parse error:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate valid quiz format. Please try again.',
          details: parseError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in generate-youtube-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred while processing the video',
        type: 'function_error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
