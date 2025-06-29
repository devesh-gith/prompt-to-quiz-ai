
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved PDF text extraction function
function extractTextFromPDF(pdfData: string): string {
  try {
    // Decode base64 PDF data
    const binaryString = atob(pdfData);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    // Convert to string for processing
    const pdfString = new TextDecoder('latin1').decode(uint8Array);
    
    let extractedText = '';
    
    // Method 1: Extract text from BT...ET blocks (text objects)
    const textObjectMatches = pdfString.match(/BT\s+.*?ET/gs) || [];
    for (const match of textObjectMatches) {
      // Look for text in parentheses
      const textInParens = match.match(/\(([^)]*)\)/g) || [];
      for (const text of textInParens) {
        const cleanText = text.slice(1, -1) // Remove parentheses
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        if (cleanText.trim().length > 0) {
          extractedText += cleanText + ' ';
        }
      }
    }
    
    // Method 2: Extract text from Tj and TJ commands
    const tjMatches = pdfString.match(/\([^)]*\)\s*Tj/g) || [];
    for (const match of tjMatches) {
      const text = match.replace(/\(([^)]*)\)\s*Tj/, '$1')
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      if (text.trim().length > 0) {
        extractedText += text + ' ';
      }
    }
    
    // Method 3: Extract text from TJ array commands
    const tjArrayMatches = pdfString.match(/\[(.*?)\]\s*TJ/g) || [];
    for (const match of tjArrayMatches) {
      const arrayContent = match.replace(/\[(.*?)\]\s*TJ/, '$1');
      const textParts = arrayContent.match(/\([^)]*\)/g) || [];
      for (const part of textParts) {
        const text = part.slice(1, -1)
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        if (text.trim().length > 0) {
          extractedText += text + ' ';
        }
      }
    }
    
    // Method 4: Look for readable text patterns in the PDF
    const readableTextMatches = pdfString.match(/[A-Za-z\s]{10,}/g) || [];
    for (const match of readableTextMatches) {
      const cleanMatch = match.trim();
      if (cleanMatch.length > 10 && !cleanMatch.includes('obj') && !cleanMatch.includes('endobj')) {
        extractedText += cleanMatch + ' ';
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/[^\w\s.,!?;:()\-]/g, ' ') // Remove special characters except common punctuation
      .replace(/\s+/g, ' ') // Clean up spaces again
      .trim();
    
    console.log('Raw extracted text sample:', extractedText.substring(0, 500));
    
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
    console.log('First 200 chars of extracted text:', extractedText.substring(0, 200));
    
    if (!extractedText || extractedText.length < 50) {
      console.log('Could not extract meaningful text from PDF. Text length:', extractedText.length);
      
      return new Response(
        JSON.stringify({ error: 'Could not extract readable text from the PDF. Please try a different PDF file or ensure the PDF contains selectable text.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use extracted text to generate quiz with more specific instructions
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
            content: `You are an expert quiz generator. Your task is to create ${questionCount} multiple choice questions STRICTLY based on the specific content provided from a PDF document. 

IMPORTANT RULES:
1. Questions MUST be based ONLY on the information present in the provided text
2. Do NOT add general knowledge questions
3. Focus on key facts, concepts, and details mentioned in the document
4. Each question should test understanding of the specific content
5. Make questions specific to the document, not generic

Return ONLY a valid JSON object with a "questions" array. Each question must have:
- "question": The question text
- "options": Array of exactly 4 answer choices
- "correct": Index (0-3) of the correct answer
- "explanation": Brief explanation referencing the source material

Do not wrap the JSON in markdown code blocks.`
          },
          {
            role: 'user',
            content: `Based on the following document content, create ${questionCount} specific quiz questions that test understanding of the material presented. Focus on the main topics, key facts, and important details mentioned in this text:

DOCUMENT CONTENT:
${extractedText.substring(0, 6000)}

Create questions that are specific to this content and cannot be answered without reading this document.`
          }
        ],
        temperature: 0.3, // Lower temperature for more focused responses
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
    
    console.log('OpenAI response preview:', content.substring(0, 300));
    
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
        JSON.stringify({ error: 'Failed to generate valid quiz format. Please try again.' }),
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
