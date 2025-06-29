
export async function generateQuizFromText(extractedText: string, questionCount: number, openAIApiKey: string) {
  console.log('Generating quiz from extracted text...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
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
7. Make questions challenging but fair - they should test comprehension of the material

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

Do not use markdown formatting in your response.`
        },
        {
          role: 'user',
          content: `Based on the following document content, create ${questionCount} quiz questions that test understanding of the specific information provided. Make sure each question can only be answered by reading this document:

DOCUMENT CONTENT:
${extractedText}

Generate questions that focus on the key information, facts, and concepts discussed in this document.`
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI quiz generation error:', errorData);
    throw new Error(`Quiz generation failed: ${response.status}`);
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
    console.log('Sample question:', validQuestions[0].question);
    
    return { questions: validQuestions };
  } catch (parseError) {
    console.error('Failed to parse quiz response:', parseError);
    console.log('Raw response sample:', content.substring(0, 500));
    throw new Error('Failed to generate properly formatted quiz. Please try again.');
  }
}
