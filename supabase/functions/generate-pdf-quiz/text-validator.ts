
export function validateExtractedText(extractedText: string): { isValid: boolean; error?: string } {
  if (!extractedText || extractedText.length < 100) {
    console.log('Insufficient text extracted. Length:', extractedText.length);
    console.log('Sample extracted text:', extractedText);
    
    return {
      isValid: false,
      error: 'Could not extract sufficient readable text from the PDF. Please ensure the PDF contains clear, readable text content and try again.'
    };
  }

  // Check for meaningful sentences and content
  const sentences = extractedText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length < 3) {
    console.log('Text does not contain enough meaningful sentences. Sentence count:', sentences.length);
    
    return {
      isValid: false,
      error: 'The extracted text does not contain enough meaningful content to generate questions. Please upload a PDF with more substantial text content.'
    };
  }

  // Check for reasonable word count
  const words = extractedText.split(/\s+/).filter(word => word.length > 2);
  
  if (words.length < 50) {
    console.log('Text does not contain enough words. Word count:', words.length);
    
    return {
      isValid: false,
      error: 'The PDF content is too brief to generate meaningful questions. Please upload a PDF with more comprehensive content.'
    };
  }

  console.log('Text validation successful');
  console.log('Sentence count:', sentences.length);
  console.log('Word count:', words.length);

  return {
    isValid: true
  };
}
