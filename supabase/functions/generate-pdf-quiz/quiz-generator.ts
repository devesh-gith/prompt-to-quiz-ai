
export async function generateQuizFromText(extractedText: string, questionCount: number, openAIApiKey: string) {
  console.log('Generating quiz from extracted text...');
  console.log('Original text length:', extractedText.length);
  
  // Chunk the text if it's too long to avoid token limits
  const maxTextLength = 8000; // Conservative limit to stay well under token limits
  let processedText = extractedText;
  
  if (extractedText.length > maxTextLength) {
    console.log('Text too long, chunking and summarizing...');
    
    // Split into chunks and get key content from each
    const chunkSize = 3000;
    const chunks = [];
    
    for (let i = 0; i < extractedText.length; i += chunkSize) {
      chunks.push(extractedText.slice(i, i + chunkSize));
    }
    
    console.log(`Split into ${chunks.length} chunks`);
    
    // Process chunks to extract key information
    const keyPoints = [];
    
    for (let i = 0; i < Math.min(chunks.length, 3); i++) { // Limit to first 3 chunks
      const chunk = chunks[i];
      
      try {
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
                content: 'Extract the key facts, concepts, and important information from this text that would be suitable for quiz questions. Focus on specific details, definitions, processes, and factual content.'
              },
              {
                role: 'user',
                content: `Extract key information from this text for quiz generation: ${chunk}`
              }
            ],
            max_tokens: 800,
            temperature: 0.1
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const keyInfo = data.choices[0].message.content.trim();
          keyPoints.push(keyInfo);
        }
      } catch (e) {
        console.log(`Failed to process chunk ${i + 1}:`, e.message);
      }
    }
    
    processedText = keyPoints.join('\n\n');
    console.log('Processed text length:', processedText.length);
  }
  
  // Generate quiz from processed text
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
          content: `You are an expert quiz generator. Create comprehensive quiz questions based EXCLUSIVELY on the provided document content.

CRITICAL REQUIREMENTS:
1. Questions MUST be based ONLY on information explicitly stated in the document
2. DO NOT create general knowledge questions or add external information
3. Each question must test understanding of specific content from the document
4. Questions should cover different sections/topics from the document
5. Ensure questions are answerable only by someone who has read this specific document
6. Focus on key facts, concepts, definitions, and important details mentioned in the text

QUESTION TYPES TO INCLUDE:
- Factual questions about specific information mentioned
- Conceptual questions about ideas explained in the document
- Detail questions about processes, numbers, or specifications mentioned
- Relationship questions about how concepts connect in the document

Return a JSON object with a "questions" array. Each question must have:
- "question": A clear question about specific document content
- "options": Array of 4 plausible answer choices (only one correct)
- "correct": Index (0-3) of the correct answer
- "explanation": Brief explanation referencing the document content

Do not use markdown formatting in your response. Return only valid JSON.`
        },
        {
          role: 'user',
          content: `Based on the following document content, create ${questionCount} quiz questions that test understanding of the specific information provided. Make sure each question can only be answered by reading this document:

DOCUMENT CONTENT:
${processedText}

Generate questions that focus on the key information, facts, and concepts discussed in this document. Return only the JSON object with the questions array.`
        }
      ],
      temperature: 0.2,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI quiz generation error:', errorData);
    throw new Error(`Quiz generation failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();
  
  console.log('Quiz generation response received');
  
  // Clean response format
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  
  try {
    const quiz = JSON.parse(content);
    
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Invalid quiz format - missing questions array');
    }
    
    // Validate each question
    const validQuestions = quiz.questions.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length === 4 && 
      typeof q.correct === 'number' && 
      q.correct >= 0 && 
      q.correct <= 3 &&
      q.explanation &&
      q.options.every(option => typeof option === 'string' && option.length > 0)
    );
    
    if (validQuestions.length === 0) {
      throw new Error('No valid questions could be generated from the document content');
    }
    
    console.log(`Successfully generated ${validQuestions.length} valid questions`);
    console.log('Sample question:', validQuestions[0]?.question);
    
    return { questions: validQuestions };
  } catch (parseError) {
    console.error('Failed to parse quiz response:', parseError);
    console.log('Raw response sample:', content.substring(0, 500));
    throw new Error('Failed to generate properly formatted quiz. Please try again.');
  }
}
