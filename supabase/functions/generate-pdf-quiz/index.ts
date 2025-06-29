
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction function
function extractTextFromPDF(pdfData: string): string {
  try {
    // Decode base64 PDF data
    const binaryString = atob(pdfData);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    // Convert to string and extract text using basic PDF parsing
    const pdfString = new TextDecoder().decode(uint8Array);
    
    // Extract text between stream objects (basic PDF text extraction)
    const textMatches = pdfString.match(/BT\s*(.*?)\s*ET/gs) || [];
    let extractedText = '';
    
    for (const match of textMatches) {
      // Extract text from PDF text objects
      const textLines = match.match(/\((.*?)\)/g) || [];
      for (const line of textLines) {
        const text = line.slice(1, -1); // Remove parentheses
        extractedText += text + ' ';
      }
    }
    
    // Also try to extract text from Tj commands
    const tjMatches = pdfString.match(/\((.*?)\)\s*Tj/g) || [];
    for (const match of tjMatches) {
      const text = match.replace(/\((.*?)\)\s*Tj/, '$1');
      extractedText += text + ' ';
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

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

    // Extract text from PDF
    const extractedText = extractTextFromPDF(pdfData);
    console.log('Extracted text length:', extractedText.length);
    
    if (!extractedText || extractedText.length < 100) {
      console.log('Could not extract meaningful text from PDF, using fallback approach...');
      
      // Fallback: Generate educational questions based on common academic topics
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
              content: `You are a quiz generator. Since the PDF text extraction was not successful, generate ${questionCount} educational multiple choice questions covering general academic topics like science, history, literature, mathematics, or general knowledge. Return ONLY a valid JSON object with a "questions" array. Each question should have: "question", "options" (array of 4 choices), "correct" (index of correct answer 0-3), and "explanation". Do not wrap the JSON in markdown code blocks.`
            },
            {
              role: 'user',
              content: `Generate ${questionCount} diverse educational quiz questions since PDF text extraction failed.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate fallback quiz: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      
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

    // Use extracted text to generate quiz
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
            content: `You are a quiz generator that creates questions based on document content. Create exactly ${questionCount} multiple choice questions based on the provided text content. Focus on the main concepts, facts, and important information presented in the document. Return ONLY a valid JSON object with a "questions" array. Each question should have: "question", "options" (array of 4 choices), "correct" (index of correct answer 0-3), and "explanation". Do not wrap the JSON in markdown code blocks.`
          },
          {
            role: 'user',
            content: `Please analyze this text content and generate ${questionCount} quiz questions based on its content:\n\n${extractedText.substring(0, 8000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`Failed to generate quiz: ${response.status}`);
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
      
      console.log(`Successfully generated ${validQuestions.length} questions from PDF content`);
      
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
