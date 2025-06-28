
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

    // First, try to get video metadata from YouTube API to check if video exists and is accessible
    try {
      const youtubeApiResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyAU_fr9ubrOlmxMpun_AgV5VmYWZSNKlgc&part=snippet,contentDetails,status`);
      
      if (youtubeApiResponse.ok) {
        const youtubeData = await youtubeApiResponse.json();
        if (!youtubeData.items || youtubeData.items.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Video not found or is private. Please check the YouTube URL and try again.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const videoInfo = youtubeData.items[0];
        console.log('Video title:', videoInfo.snippet.title);
        console.log('Video duration:', videoInfo.contentDetails.duration);
        
        // Check if video is too long (over 2 hours)
        const duration = videoInfo.contentDetails.duration;
        const hours = duration.match(/(\d+)H/);
        if (hours && parseInt(hours[1]) > 2) {
          return new Response(
            JSON.stringify({ error: 'Video is too long. Please try with a video shorter than 2 hours.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (youtubeError) {
      console.log('YouTube API check failed, proceeding with transcription anyway:', youtubeError);
    }

    console.log('Starting transcription with AssemblyAI...');

    // Use AssemblyAI with the YouTube URL - try different URL formats
    const urlsToTry = [
      `https://www.youtube.com/watch?v=${videoId}`,
      `https://youtu.be/${videoId}`,
      youtubeUrl
    ];
    
    let transcriptionData;
    let transcriptionError;
    
    for (const urlToTry of urlsToTry) {
      console.log('Trying URL format:', urlToTry);
      
      try {
        const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: {
            'Authorization': assemblyAIApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_url: urlToTry,
            auto_chapters: false,
            language_detection: true,
            speech_model: 'best',
            punctuate: true,
            format_text: true,
          }),
        });

        if (transcriptionResponse.ok) {
          transcriptionData = await transcriptionResponse.json();
          console.log('Transcription request successful with URL:', urlToTry);
          break;
        } else {
          const errorText = await transcriptionResponse.text();
          transcriptionError = `${transcriptionResponse.status}: ${errorText}`;
          console.log('Failed with URL:', urlToTry, 'Error:', transcriptionError);
        }
      } catch (error) {
        transcriptionError = error.message;
        console.log('Exception with URL:', urlToTry, 'Error:', error.message);
      }
    }
    
    if (!transcriptionData) {
      console.error('All URL formats failed. Last error:', transcriptionError);
      return new Response(
        JSON.stringify({ 
          error: 'Unable to process this YouTube video. The video may be private, restricted, or not contain sufficient audio content. Please try with a different public YouTube video that has clear spoken content.',
          details: transcriptionError
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transcriptId = transcriptionData.id;
    console.log('Transcription started, ID:', transcriptId);

    // Poll for transcription completion
    let transcript;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes timeout (5 second intervals)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
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
      } catch (statusError) {
        console.error('Error checking status:', statusError);
        if (statusError.message.includes('Failed to transcribe')) {
          throw statusError;
        }
      }

      attempts++;
    }

    if (!transcript) {
      throw new Error('Transcription timeout - the video may be too long or the service is busy. Please try with a shorter video or try again later.');
    }

    if (transcript.length < 100) {
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
            content: `You are a quiz generator. Create exactly ${questionCount} multiple choice questions based on the YouTube video transcript. 

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object
2. Do NOT include markdown formatting, code blocks, or any other text
3. Do NOT wrap your response in \`\`\`json or any other formatting
4. Start your response directly with { and end with }

The JSON must have this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure each question tests understanding of key concepts from the video.`
          },
          {
            role: 'user',
            content: `Generate ${questionCount} quiz questions from this YouTube video transcript. Focus on key concepts, facts, and important information discussed in the video:\n\n${transcript.substring(0, 10000)}`
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
