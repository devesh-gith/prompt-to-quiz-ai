
export async function extractTextFromPDF(pdfData: string, openAIApiKey: string): Promise<string> {
  try {
    console.log('Extracting text from PDF...');
    
    // Convert base64 PDF to binary
    const pdfBytes = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0));
    
    // Basic PDF text extraction with improved parsing
    let extractedText = '';
    
    try {
      // Convert to string and look for text content
      const pdfString = new TextDecoder('latin1').decode(pdfBytes);
      
      // Look for text streams and content
      const textRegex = /BT\s*(.*?)\s*ET/gs;
      const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
      const textShowRegex = /\((.*?)\)\s*Tj/g;
      const textArrayRegex = /\[(.*?)\]\s*TJ/g;
      
      const textMatches = [];
      
      // Extract text from BT...ET blocks
      let match;
      while ((match = textRegex.exec(pdfString)) !== null) {
        const content = match[1];
        const textShows = content.match(textShowRegex);
        if (textShows) {
          textShows.forEach(show => {
            const text = show.match(/\((.*?)\)/);
            if (text && text[1]) {
              textMatches.push(text[1]);
            }
          });
        }
      }
      
      // Extract text from TJ arrays
      while ((match = textArrayRegex.exec(pdfString)) !== null) {
        const arrayContent = match[1];
        const strings = arrayContent.match(/\((.*?)\)/g);
        if (strings) {
          strings.forEach(str => {
            const text = str.match(/\((.*?)\)/);
            if (text && text[1]) {
              textMatches.push(text[1]);
            }
          });
        }
      }
      
      // Join and clean extracted text
      extractedText = textMatches
        .join(' ')
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('Basic extraction result length:', extractedText.length);
      console.log('Sample text:', extractedText.substring(0, 200));
      
    } catch (e) {
      console.log('Basic PDF extraction failed:', e.message);
    }
    
    // If basic extraction failed or produced poor results, use OpenAI to help
    if (extractedText.length < 500 || !isReadableText(extractedText)) {
      console.log('Using OpenAI to improve text extraction...');
      
      // Convert first few pages worth of PDF data for OpenAI processing
      const sampleSize = Math.min(pdfBytes.length, 50000); // Limit sample size
      const pdfSample = Array.from(pdfBytes.slice(0, sampleSize))
        .map(byte => String.fromCharCode(byte))
        .join('')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
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
              content: 'You are a PDF text extraction assistant. Extract readable text content from the provided PDF data. Focus on finding actual text content, not formatting codes or metadata. Return only the readable text content you can identify.'
            },
            {
              role: 'user',
              content: `Extract readable text from this PDF data sample. Focus on meaningful content that could be used for quiz generation: ${pdfSample.substring(0, 2000)}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiExtractedText = data.choices[0].message.content.trim();
        
        if (aiExtractedText.length > extractedText.length && isReadableText(aiExtractedText)) {
          extractedText = aiExtractedText;
        }
      }
    }
    
    console.log('Final extracted text length:', extractedText.length);
    console.log('Final text sample:', extractedText.substring(0, 300));
    
    if (extractedText.length < 100) {
      throw new Error('Could not extract sufficient readable text from the PDF. The document may be image-based, encrypted, or contain non-standard formatting.');
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the PDF contains readable text content and try again.');
  }
}

function isReadableText(text: string): boolean {
  // Check if text contains a reasonable amount of readable characters
  const readableChars = text.match(/[a-zA-Z0-9\s.,!?;:'"()-]/g);
  const readableRatio = readableChars ? readableChars.length / text.length : 0;
  
  // Should be at least 70% readable characters and contain some words
  const hasWords = /\b[a-zA-Z]{3,}\b/.test(text);
  
  return readableRatio > 0.7 && hasWords;
}
