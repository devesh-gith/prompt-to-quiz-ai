
export function validateExtractedText(extractedText: string): { isValid: boolean; error?: string } {
  if (!extractedText || extractedText.length < 50) {
    console.log('Insufficient text extracted. Length:', extractedText.length);
    console.log('Sample extracted text:', extractedText);
    
    return {
      isValid: false,
      error: 'Could not extract sufficient readable text from the PDF. Please ensure the PDF contains clear, readable text content and try again.'
    };
  }

  // Check for meaningful content - look for readable words
  const words = extractedText.match(/\b[a-zA-Z]{3,}\b/g);
  const wordCount = words ? words.length : 0;
  
  if (wordCount < 20) {
    console.log('Text does not contain enough meaningful words. Word count:', wordCount);
    console.log('Sample text:', extractedText.substring(0, 200));
    
    return {
      isValid: false,
      error: 'The extracted text does not contain enough meaningful content to generate questions. Please upload a PDF with more substantial text content.'
    };
  }

  // Check for readable character ratio
  const readableChars = extractedText.match(/[a-zA-Z0-9\s.,!?;:'"()-]/g);
  const readableRatio = readableChars ? readableChars.length / extractedText.length : 0;
  
  if (readableRatio < 0.5) {
    console.log('Text contains too many non-readable characters. Readable ratio:', readableRatio);
    
    return {
      isValid: false,
      error: 'The PDF appears to contain mostly non-text content or corrupted data. Please ensure you upload a text-based PDF document.'
    };
  }

  console.log('Text validation successful');
  console.log('Word count:', wordCount);
  console.log('Readable ratio:', readableRatio);
  console.log('Text length:', extractedText.length);

  return {
    isValid: true
  };
}
