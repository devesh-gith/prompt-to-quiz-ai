
export async function extractTextFromPDF(pdfData: string, openAIApiKey: string): Promise<string> {
  try {
    console.log('Extracting text from PDF using document processing...');
    
    // First, try to extract text directly from the PDF using a document processing approach
    // Since we can't use OpenAI vision for PDFs, we'll use OpenAI to help process the content
    // after attempting basic PDF text extraction
    
    // Convert base64 PDF to binary
    const pdfBytes = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0));
    
    // Basic PDF text extraction attempt
    let extractedText = '';
    
    try {
      // Simple PDF text extraction - look for text content patterns
      const pdfString = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);
      
      // Extract text between common PDF text markers
      const textMatches = pdfString.match(/\((.*?)\)/g) || [];
      const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs) || [];
      
      // Combine and clean extracted text
      const combinedText = [...textMatches, ...streamMatches]
        .map(match => match.replace(/[()]/g, '').replace(/stream|endstream/g, ''))
        .join(' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep only printable ASCII + whitespace
        .replace(/\s+/g, ' ')
        .trim();
      
      if (combinedText.length > 100) {
        extractedText = combinedText;
      }
    } catch (e) {
      console.log('Basic PDF extraction failed, will use fallback approach');
    }
    
    // If basic extraction didn't work well, use OpenAI to help clean and structure the content
    if (extractedText.length < 200) {
      console.log('Using OpenAI to help process PDF content...');
      
      // Convert PDF to a readable format description for OpenAI
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
              content: 'You are a PDF content processor. The user will provide raw PDF content data, and you should help extract meaningful text from it. Focus on identifying readable text content and structuring it properly.'
            },
            {
              role: 'user',
              content: `Please help extract readable text content from this PDF data. Here's what I could extract so far: "${extractedText.substring(0, 1000)}". Please provide a clean, structured version of any readable content you can identify. If there's insufficient readable content, please indicate that.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiProcessedText = data.choices[0].message.content.trim();
      
      if (aiProcessedText.length > extractedText.length) {
        extractedText = aiProcessedText;
      }
    }
    
    console.log('PDF text extraction complete');
    console.log('Extracted text length:', extractedText.length);
    console.log('Extracted text sample (first 300 chars):', extractedText.substring(0, 300));
    
    if (extractedText.length < 100) {
      throw new Error('Could not extract sufficient text from the PDF. The document may be image-based or encrypted.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the PDF contains readable text content and is not password-protected or image-only.');
  }
}
