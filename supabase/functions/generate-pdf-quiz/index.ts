
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Completely rewritten PDF text extraction with multiple strategies
function extractTextFromPDF(pdfData: string): string {
  try {
    // Decode base64 PDF data
    const binaryString = atob(pdfData);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    // Convert to string for processing
    const pdfString = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    let extractedText = '';
    
    // Strategy 1: Look for stream objects containing text
    const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs) || [];
    for (const stream of streamMatches) {
      const streamContent = stream.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
      
      // Try to find readable text patterns in streams
      const readableText = streamContent.match(/[A-Za-z][A-Za-z\s]{3,}/g) || [];
      for (const text of readableText) {
        if (text.length > 3 && !/^[A-Z]{4,}$/.test(text)) { // Skip all-caps abbreviations
          extractedText += text + ' ';
        }
      }
    }
    
    // Strategy 2: Look for text in parentheses with better filtering
    const parenthesesMatches = pdfString.match(/\(([^)]{4,})\)/g) || [];
    for (const match of parenthesesMatches) {
      const text = match.slice(1, -1)
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .trim();
      
      // Only include text that looks like real content
      if (text.length > 3 && 
          /[a-z]/.test(text) && // Contains lowercase letters
          !/^[^a-zA-Z]*$/.test(text) && // Not just symbols
          text.split(' ').length > 1) { // Multiple words
        extractedText += text + ' ';
      }
    }
    
    // Strategy 3: Look for text after font/size commands
    const fontTextMatches = pdfString.match(/\/F\d+\s+\d+\s+Tf[^(]*\(([^)]+)\)/g) || [];
    for (const match of fontTextMatches) {
      const text = match.match(/\(([^)]+)\)$/);
      if (text && text[1]) {
        const cleanText = text[1]
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .trim();
        
        if (cleanText.length > 3 && /[a-z]/.test(cleanText)) {
          extractedText += cleanText + ' ';
        }
      }
    }
    
    // Strategy 4: Look for text between TD and Tj commands
    const tdTjMatches = pdfString.match(/TD[^T]*\(([^)]+)\)\s*Tj/g) || [];
    for (const match of tdTjMatches) {
      const text = match.match(/\(([^)]+)\)/);
      if (text && text[1]) {
        const cleanText = text[1].trim();
        if (cleanText.length > 3 && /[a-z]/.test(cleanText)) {
          extractedText += cleanText + ' ';
        }
      }
    }
    
    // Strategy 5: Direct search for readable sentences
    const sentenceMatches = pdfString.match(/[A-Z][a-z]+[^.!?]*[.!?]/g) || [];
    for (const sentence of sentenceMatches) {
      if (sentence.length > 10 && sentence.split(' ').length > 2) {
        extractedText += sentence + ' ';
      }
    }
    
    // Strategy 6: Look for words separated by spaces
    const wordMatches = pdfString.match(/[A-Za-z]{3,}(?:\s+[A-Za-z]{3,}){2,}/g) || [];
    for (const phrase of wordMatches) {
      if (phrase.length > 10 && !phrase.includes('obj') && !phrase.includes('endobj')) {
        extractedText += phrase + ' ';
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Proper sentence spacing
      .replace(/\b[A-Z]{5,}\b/g, '') // Remove long sequences of capitals (likely formatting)
      .replace(/\b\d+\s*\d+\s*\d+\b/g, '') // Remove number sequences
      .replace(/[^\w\s.,!?;:()\-'"]/g, ' ') // Remove special characters except common punctuation
      .replace(/\s+/g, ' ') // Clean up spaces again
      .trim();
    
    console.log('Extracted text length:', extractedText.length);
    console.log('Extracted text sample:', extractedText.substring(0, 500));
    
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
    console.log('Final extracted text length:', extractedText.length);
    
    if (!extractedText || extractedText.length < 100) {
      console.log('Insufficient text extracted. Length:', extractedText.length);
      console.log('Sample extracted text:', extractedText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract meaningful text from the PDF. This may be a scanned document or have a complex format. Please try a different PDF with selectable text content.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the text contains actual words, not just random characters
    const wordCount = extractedText.split(/\s+/).filter(word => 
      word.length > 2 && /^[A-Za-z]/.test(word)
    ).length;
    
    if (wordCount < 20) {
      console.log('Text does not contain enough readable words. Word count:', wordCount);
      console.log('Sample text:', extractedText.substring(0, 200));
      
      return new Response(
        JSON.stringify({ 
          error: 'The PDF appears to contain mostly formatting or non-readable content. Please upload a PDF with clear text content.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
            content: `You are an expert quiz generator. You must create ${questionCount} multiple choice questions based EXCLUSIVELY on the content provided from a PDF document.

CRITICAL REQUIREMENTS:
1. Questions MUST be based ONLY on information explicitly stated in the provided text
2. Do NOT create generic or general knowledge questions
3. Focus on specific facts, concepts, names, dates, and details mentioned in the document
4. Each question should test comprehension of the actual document content
5. Make questions that can ONLY be answered by someone who has read this specific document

Return ONLY a valid JSON object with a "questions" array. Each question must have:
- "question": The question text (specific to the document)
- "options": Array of exactly 4 answer choices
- "correct": Index (0-3) of the correct answer
- "explanation": Brief explanation referencing the source material

Do not wrap the JSON in markdown code blocks.`
          },
          {
            role: 'user',
            content: `Create ${questionCount} quiz questions based on this specific document content. The questions should test understanding of the specific information contained in this text and should NOT be answerable without reading this document:

DOCUMENT CONTENT:
${extractedText.substring(0, 8000)}

Generate questions about specific details, facts, concepts, or information that appears in this document content.`
          }
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`Failed to generate quiz: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    console.log('OpenAI response received, length:', content.length);
    
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
      console.log('Sample question:', validQuestions[0].question);
      
      return new Response(JSON.stringify({ questions: validQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.log('Raw OpenAI response:', content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to generate valid quiz format. Please try again with a different PDF.' }),
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
