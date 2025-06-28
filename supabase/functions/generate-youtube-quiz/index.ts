
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { youtubeUrl } = await req.json();
    console.log('Processing YouTube video URL:', youtubeUrl);
    
    if (!youtubeUrl) {
      throw new Error('YouTube URL is required');
    }

    // Check if OpenAI API key is available
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured. Please add your OpenAI API key to the project secrets.');
    }

    // Validate if it's a proper URL
    try {
      new URL(youtubeUrl);
    } catch {
      throw new Error('Invalid video URL format');
    }

    // Check if it's a YouTube URL
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      throw new Error('Please provide a valid YouTube URL (youtube.com or youtu.be)');
    }

    // Extract video ID from YouTube URL
    let videoId = '';
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/embed/')) {
      videoId = youtubeUrl.split('embed/')[1]?.split('?')[0];
    }
    
    if (!videoId) {
      throw new Error('Could not extract YouTube video ID from URL. Please ensure the URL is in the format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID');
    }
    
    console.log('Extracted YouTube video ID:', videoId);

    // Try to get video metadata from YouTube's oEmbed API (public API, no key needed)
    let videoTitle = '';
    let videoDescription = '';
    
    try {
      const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`);
      if (oembedResponse.ok) {
        const oembedData = await oembedResponse.json();
        videoTitle = oembedData.title || '';
        console.log('Retrieved video title:', videoTitle);
      }
    } catch (e) {
      console.log('Could not retrieve video metadata, proceeding with URL analysis');
    }

    // Enhanced prompt with video metadata
    const videoContext = videoTitle 
      ? `Video Title: "${videoTitle}"\nVideo URL: ${youtubeUrl}`
      : `Video URL: ${youtubeUrl}`;

    console.log('Generating quiz content based on YouTube video...');
    
    const videoInfoResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert at creating educational quizzes from video content. You will analyze the provided video information and create specific, relevant quiz questions. Focus on creating questions that would test understanding of the actual video content, not generic questions. Base your questions on the title and context provided.'
          },
          {
            role: 'user',
            content: `Create a quiz based on this specific YouTube video:

${videoContext}

Please analyze what this video is likely about based on the title and URL, then create 5 multiple choice quiz questions that would specifically test someone's understanding of this video's content. Make the questions specific to what someone would learn from watching this particular video.

Format your response as JSON with this structure:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "..."
    }
  ]
}

The "correct" field should be the index (0-3) of the correct answer in the options array.`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!videoInfoResponse.ok) {
      const errorText = await videoInfoResponse.text();
      console.error('OpenAI API error:', videoInfoResponse.status, errorText);
      throw new Error(`Failed to generate quiz content: ${videoInfoResponse.status}`);
    }

    const videoInfoData = await videoInfoResponse.json();
    console.log('OpenAI response received for video analysis');
    
    if (videoInfoData.error) {
      console.error('OpenAI error:', videoInfoData.error);
      throw new Error(`Failed to analyze YouTube video: ${videoInfoData.error.message}`);
    }
    
    const result = JSON.parse(videoInfoData.choices[0].message.content);
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Failed to generate proper quiz from the YouTube video. Please try again.');
    }

    // Validate and format quiz questions to match the expected structure
    const validQuestions = result.questions.map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question format at index ${index}`);
      }
      
      return {
        question: q.question,
        options: q.options,
        correct: typeof q.correct === 'number' ? q.correct : 0,
        explanation: q.explanation || 'No explanation provided'
      };
    });

    if (validQuestions.length === 0) {
      throw new Error('Failed to generate valid quiz questions. Please try again.');
    }

    console.log(`Successfully generated ${validQuestions.length} quiz questions for video: ${videoTitle || 'Unknown'}`);

    return new Response(JSON.stringify({
      questions: validQuestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-youtube-quiz:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
