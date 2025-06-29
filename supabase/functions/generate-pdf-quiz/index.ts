
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved PDF text extraction focused on readable content
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
    
    // Strategy 1: Extract text from parentheses with strict filtering
    const parenthesesMatches = pdfString.match(/\(([^)]+)\)/g) || [];
    for (const match of parenthesesMatches) {
      let text = match.slice(1, -1)
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .trim();
      
      // Only include text that contains actual words (not just random characters)
      if (text.length > 5 && 
          /[a-zA-Z]{3,}/.test(text) && // Contains words of 3+ letters
          text.split(/\s+/).length > 1 && // Multiple words
          !/^[A-Z0-9\s]{10,}$/.test(text) && // Not all caps/numbers
          !text.includes('obj') && 
          !text.includes('endobj') &&
          !/^[^a-zA-Z]*$/.test(text)) { // Contains letters
        extractedText += text + ' ';
      }
    }
    
    // Strategy 2: Look for text after BT (Begin Text) commands
    const btMatches = pdfString.match(/BT[^E]*?ET/g) || [];
    for (const block of btMatches) {
      const textMatches = block.match(/\(([^)]+)\)/g) || [];
      for (const match of textMatches) {
        let text = match.slice(1, -1).trim();
        if (text.length > 3 && /[a-zA-Z]/.test(text) && !/^[A-Z0-9\s]+$/.test(text)) {
          extractedText += text + ' ';
        }
      }
    }
    
    // Strategy 3: Look for text in show text operators (Tj, TJ)
    const showTextMatches = pdfString.match(/\(([^)]+)\)\s*T[jJ]/g) || [];
    for (const match of showTextMatches) {
      let text = match.replace(/\)\s*T[jJ]$/, '').slice(1).trim();
      if (text.length > 3 && /[a-zA-Z]{2,}/.test(text)) {
        extractedText += text + ' ';
      }
    }
    
    // Strategy 4: Extract text from array format [(text)]
    const arrayTextMatches = pdfString.match(/\[\s*\(([^)]+)\)\s*\]/g) || [];
    for (const match of arrayTextMatches) {
      let text = match.match(/\(([^)]+)\)/)?.[1]?.trim();
      if (text && text.length > 3 && /[a-zA-Z]/.test(text)) {
        extractedText += text + ' ';
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/\b[A-Z]{5,}\b/g, '') // Remove long sequences of capitals
      .replace(/\b\d+\s*\d+\s*\d+\b/g, '') // Remove number sequences
      .replace(/[^\w\s.,!?;:()\-'"]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Clean up spaces again
      .trim();
    
    // Remove common PDF artifacts
    const artifactPatterns = [
      /\b[A-Z]{2}\d+\b/g, // Font references like "F1", "TT2"
      /\b\d+\s+\d+\s+obj\b/g, // Object references
      /\bstream\b/g,
      /\bendstream\b/g,
      /\bxref\b/g,
      /\btrailer\b/g,
      /\bstartxref\b/g,
      /\b%%EOF\b/g,
    ];
    
    for (const pattern of artifactPatterns) {
      extractedText = extractedText.replace(pattern, ' ');
    }
    
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    
    console.log('Final extracted text length:', extractedText.length);
    console.log('Extracted text sample (first 500 chars):', extractedText.substring(0, 500));
    console.log('Word count:', extractedText.split(/\s+/).filter(word => word.length > 2).length);
    
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
    
    if (!extractedText || extractedText.length < 50) {
      console.log('Insufficient text extracted. Length:', extractedText.length);
      console.log('Sample extracted text:', extractedText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract readable text from the PDF. This may be a scanned document, image-based PDF, or have a complex format. Please try a PDF with selectable text content.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the text contains meaningful words, not just random characters
    const meaningfulWords = extractedText.split(/\s+/).filter(word => 
      word.length > 2 && 
      /^[A-Za-z]/.test(word) && 
      !/^[A-Z]{3,}$/.test(word) && // Not all caps abbreviations
      word.toLowerCase() !== word.toUpperCase() // Has mixed case or lowercase
    );
    
    if (meaningfulWords.length < 10) {
      console.log('Text does not contain enough meaningful words. Meaningful word count:', meaningfulWords.length);
      console.log('Sample meaningful words:', meaningfulWords.slice(0, 10));
      
      return new Response(
        JSON.stringify({ 
          error: 'The PDF appears to contain mostly formatting codes or non-readable content. Please upload a PDF with clear, readable text content.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Meaningful words found:', meaningfulWords.length);
    console.log('Sample words:', meaningfulWords.slice(0, 20).join(', '));

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
            content: `You are a quiz generator that creates questions ONLY from the provided document content. 

STRICT REQUIREMENTS:
1. Questions MUST be based EXCLUSIVELY on the actual content provided
2. Do NOT create generic or general knowledge questions
3. Focus on specific information, facts, concepts, and details from the document
4. Questions should test comprehension of THIS specific document
5. Each question must reference specific content that appears in the text
6. If the text seems fragmented or unclear, create questions about whatever coherent information is available

Return a JSON object with a "questions" array. Each question needs:
- "question": Question about specific document content
- "options": Array of 4 answer choices
- "correct": Index (0-3) of correct answer  
- "explanation": Brief explanation with reference to the document

Do not use markdown formatting.`
          },
          {
            role: 'user',
            content: `Create ${questionCount} quiz questions based on the specific content from this document. Focus on actual information, facts, and concepts that appear in the text:

DOCUMENT TEXT:
${extractedText.substring(0, 6000)}

Generate questions that can only be answered by reading this specific document content.`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    console.log('OpenAI response received');
    
    // Clean response
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const quiz = JSON.parse(content);
      
      if (!quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error('Invalid quiz format');
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
      
      console.log(`Successfully generated ${validQuestions.length} questions`);
      console.log('Sample question:', validQuestions[0].question);
      
      return new Response(JSON.stringify({ questions: validQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse quiz response:', parseError);
      console.log('Raw response:', content.substring(0, 500));
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
