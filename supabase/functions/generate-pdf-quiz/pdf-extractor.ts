
export async function extractTextFromPDF(pdfData: string, openAIApiKey: string): Promise<string> {
  try {
    console.log('Extracting text from PDF...');
    
    // Convert base64 PDF to binary
    const pdfBytes = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0));
    
    // Enhanced PDF text extraction with multiple strategies
    let extractedText = '';
    
    try {
      // Strategy 1: Improved basic PDF text extraction
      const pdfString = new TextDecoder('latin1').decode(pdfBytes);
      
      // Enhanced regex patterns for better text extraction
      const textPatterns = [
        // Text between parentheses in text show operations
        /\(([^)]+)\)\s*(?:Tj|TJ)/g,
        // Text in array format
        /\[\s*\(([^)]+)\)\s*\]\s*TJ/g,
        // Hexadecimal encoded text
        /<([0-9A-Fa-f]+)>\s*(?:Tj|TJ)/g,
        // Text between BT and ET blocks with improved parsing
        /BT[^E]*?\(([^)]+)\)[^E]*?ET/g,
        // Direct text content in streams
        /stream[^e]*?([A-Za-z\s]{10,})[^e]*?endstream/g
      ];
      
      const textMatches = new Set<string>();
      
      // Apply all patterns to extract text
      textPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(pdfString)) !== null) {
          let text = match[1];
          
          // Handle hexadecimal encoded text
          if (pattern.source.includes('0-9A-Fa-f')) {
            try {
              text = text.match(/.{2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join('') || text;
            } catch (e) {
              // Keep original if hex decoding fails
            }
          }
          
          // Clean and validate text
          text = text
            .replace(/\\[nrt]/g, ' ')
            .replace(/[^\x20-\x7E\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (text.length > 2 && /[a-zA-Z]/.test(text)) {
            textMatches.add(text);
          }
        }
      });
      
      // Join extracted text pieces
      extractedText = Array.from(textMatches).join(' ').trim();
      
      console.log('Basic extraction result length:', extractedText.length);
      console.log('Sample text:', extractedText.substring(0, 200));
      
    } catch (e) {
      console.log('Basic PDF extraction failed:', e.message);
    }
    
    // Strategy 2: Use OpenAI for enhanced extraction
    if (extractedText.length < 300 || !isReadableText(extractedText)) {
      console.log('Using OpenAI for enhanced text extraction...');
      
      // Create a more structured prompt with the entire PDF data
      const pdfBase64Sample = pdfData.substring(0, 4000); // Use first part of base64 data
      
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
              content: `You are an expert PDF text extraction system. Your task is to extract meaningful, readable text content from PDF data that can be used for educational quiz generation. 

CRITICAL INSTRUCTIONS:
1. Extract ONLY the actual readable text content from the PDF
2. Ignore formatting codes, metadata, and binary data
3. Focus on educational content like paragraphs, sentences, facts, and information
4. If the PDF contains no readable text, clearly state that
5. Provide the extracted text in a clean, readable format
6. Aim to extract at least 200-500 words if available in the document`
            },
            {
              role: 'user',
              content: `Please extract all readable text content from this PDF data. Focus on meaningful educational content that could be used for quiz generation:\n\nPDF Data (base64): ${pdfBase64Sample}\n\nPlease return only the extracted readable text content, formatted cleanly without any metadata or formatting codes.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiExtractedText = data.choices[0].message.content.trim();
        
        console.log('AI extraction result length:', aiExtractedText.length);
        console.log('AI extraction sample:', aiExtractedText.substring(0, 200));
        
        // Use AI extracted text if it's better
        if (aiExtractedText.length > 50 && isReadableText(aiExtractedText) && 
            !aiExtractedText.toLowerCase().includes('does not contain any readable text') &&
            !aiExtractedText.toLowerCase().includes('cannot be interpreted as meaningful text')) {
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
