
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractTextFromPDF } from './pdf-extractor.ts';
import { validateExtractedText } from './text-validator.ts';
import { generateQuizFromText } from './quiz-generator.ts';
import { corsHeaders, handleCorsPreflightRequest, createErrorResponse, createSuccessResponse } from './cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    const { pdfData, questionCount = 5 } = await req.json();

    if (!pdfData) {
      return createErrorResponse('PDF data is required', 400);
    }

    if (!openAIApiKey) {
      return createErrorResponse('OpenAI API key not configured', 500);
    }

    console.log('Processing PDF for quiz generation with OpenAI...');

    // Extract text from PDF using OpenAI
    const extractedText = await extractTextFromPDF(pdfData, openAIApiKey);
    
    // Validate extracted text
    const validation = validateExtractedText(extractedText);
    if (!validation.isValid) {
      return createErrorResponse(validation.error!, 400);
    }

    // Generate quiz from extracted text
    const quizData = await generateQuizFromText(extractedText, questionCount, openAIApiKey);
    
    console.log('Quiz generation completed successfully');
    return createSuccessResponse(quizData);

  } catch (error) {
    console.error('Error in generate-pdf-quiz function:', error);
    return createErrorResponse(
      error.message || 'Failed to generate quiz from PDF. Please try again.',
      500
    );
  }
});
