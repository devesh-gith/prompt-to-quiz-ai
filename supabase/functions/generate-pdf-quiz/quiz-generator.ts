
export async function generateQuizFromText(extractedText: string, questionCount: number, openAIApiKey: string) {
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
    
    return { questions: validQuestions };
  } catch (parseError) {
    console.error('Failed to parse quiz response:', parseError);
    console.log('Raw response:', content.substring(0, 500));
    throw new Error('Failed to generate valid quiz format. Please try again.');
  }
}
