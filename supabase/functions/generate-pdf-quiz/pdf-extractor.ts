
export async function extractTextFromPDF(pdfData: string, openAIApiKey: string): Promise<string> {
  try {
    console.log('Using OpenAI to extract text from PDF...');
    
    // Use OpenAI's vision model to extract text from PDF
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
            content: `You are a PDF text extraction expert. Extract all readable text content from the provided PDF image/document. 

IMPORTANT INSTRUCTIONS:
1. Extract ALL text content you can see in the document
2. Preserve the logical structure and flow of the text
3. Include headings, paragraphs, bullet points, and any other text elements
4. Do NOT summarize or paraphrase - extract the exact text as it appears
5. If there are multiple pages or sections, extract all of them
6. Focus on getting complete, accurate text extraction
7. Return only the extracted text content, no additional commentary

Your goal is to provide a complete, accurate transcription of all text visible in the PDF.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all text content from this PDF document. Return the complete text exactly as it appears in the document.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfData}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI PDF extraction error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content.trim();
    
    console.log('OpenAI text extraction complete');
    console.log('Extracted text length:', extractedText.length);
    console.log('Extracted text sample (first 300 chars):', extractedText.substring(0, 300));
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF with OpenAI:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the PDF contains readable text content.');
  }
}
