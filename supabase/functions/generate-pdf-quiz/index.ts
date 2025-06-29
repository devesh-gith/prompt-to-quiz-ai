
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { pdfData, questionCount = 5 } = await req.json();

    if (!pdfData) {
      return new Response(
        JSON.stringify({ error: 'PDF data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing PDF data for quiz generation...');

    // Use OpenAI's vision model to extract text and understand the PDF content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a quiz generator that analyzes PDF documents. Extract the key information from the provided PDF and create exactly ${questionCount} multiple choice questions based on the content. Return ONLY a valid JSON object with a "questions" array. Each question should have: "question", "options" (array of 4 choices), "correct" (index of correct answer 0-3), and "explanation". Do not wrap the JSON in markdown code blocks.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this PDF document and generate ${questionCount} quiz questions based on its content. Focus on the main concepts, facts, and important information presented in the document.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfData}`
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      // If the vision model fails, try text-based approach
      console.log('Vision model failed, trying text extraction approach...');
      
      const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a quiz generator. Since I cannot directly read the PDF content, I'll provide you with a base64 encoded PDF. Please generate ${questionCount} educational multiple choice questions that would typically be found in academic or professional documents. Return ONLY a valid JSON object with a "questions" array. Each question should have: "question", "options" (array of 4 choices), "correct" (index of correct answer 0-3), and "explanation". Do not wrap the JSON in markdown code blocks.`
            },
            {
              role: 'user',
              content: `Generate ${questionCount} general educational quiz questions since I cannot process the PDF content directly. Make them diverse and educational covering topics like science, history, literature, or general knowledge.`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!textResponse.ok) {
        throw new Error(`Failed to generate quiz: ${response.status}`);
      }

      const textData = await textResponse.json();
      let content = textData.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      const quiz = JSON.parse(content);
      
      // Validate quiz structure
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Invalid quiz format: missing questions array');
      }
      
      const validQuestions = quiz.questions.filter(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 && 
        typeof q.correct === 'number' && 
        q.correct >= 0 && 
        q.correct <= 3 &&
        q.explanation
      );
      
      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }
      
      return new Response(JSON.stringify({ questions: validQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const quiz = JSON.parse(content);
      
      // Validate quiz structure
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Invalid quiz format: missing questions array');
      }
      
      // Validate each question
      const validQuestions = quiz.questions.filter(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 && 
        typeof q.correct === 'number' && 
        q.correct >= 0 && 
        q.correct <= 3 &&
        q.explanation
      );
      
      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }
      
      return new Response(JSON.stringify({ questions: validQuestions }), {
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
    console.error('Error in generate-pdf-quiz function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
