
export function validateExtractedText(extractedText: string): { isValid: boolean; error?: string } {
  // More lenient initial length check
  if (!extractedText || extractedText.length < 30) {
    console.log('Insufficient text extracted. Length:', extractedText.length);
    console.log('Sample extracted text:', extractedText);
    
    return {
      isValid: false,
      error: 'Could not extract sufficient readable text from the PDF. Please ensure the PDF contains clear, readable text content and try again.'
    };
  }

  // Check for meaningful content - look for readable words (more lenient)
  const words = extractedText.match(/\b[a-zA-Z]{2,}\b/g);
  const wordCount = words ? words.length : 0;
  
  // More lenient word count requirement
  if (wordCount < 10) {
    console.log('Text does not contain enough meaningful words. Word count:', wordCount);
    console.log('Sample text:', extractedText.substring(0, 200));
    
    return {
      isValid: false,
      error: 'The extracted text does not contain enough meaningful content to generate questions. Please upload a PDF with more substantial text content.'
    };
  }

  // More lenient readable character ratio
  const readableChars = extractedText.match(/[a-zA-Z0-9\s.,!?;:'"()\-]/g);
  const readableRatio = readableChars ? readableChars.length / extractedText.length : 0;
  
  if (readableRatio < 0.3) {
    console.log('Text contains too many non-readable characters. Readable ratio:', readableRatio);
    
    return {
      isValid: false,
      error: 'The PDF appears to contain mostly non-text content or corrupted data. Please ensure you upload a text-based PDF document.'
    };
  }

  // Additional check: ensure it's not just error messages from extraction
  const errorIndicators = [
    'does not contain any readable text',
    'cannot be interpreted as meaningful text',
    'formatting codes and metadata',
    'provide a different sample'
  ];
  
  const lowerText = extractedText.toLowerCase();
  const hasErrorIndicators = errorIndicators.some(indicator => lowerText.includes(indicator));
  
  if (hasErrorIndicators) {
    console.log('Text appears to be an error message rather than content');
    
    return {
      isValid: false,
      error: 'The PDF could not be properly processed. Please try uploading a different PDF with clear text content.'
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
