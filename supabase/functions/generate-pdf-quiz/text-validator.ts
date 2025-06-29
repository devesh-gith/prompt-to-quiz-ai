
export function validateExtractedText(extractedText: string): { isValid: boolean; error?: string; meaningfulWords?: string[] } {
  if (!extractedText || extractedText.length < 50) {
    console.log('Insufficient text extracted. Length:', extractedText.length);
    console.log('Sample extracted text:', extractedText);
    
    return {
      isValid: false,
      error: 'Could not extract readable text from the PDF. This may be a scanned document, image-based PDF, or have a complex format. Please try a PDF with selectable text content.'
    };
  }

  // Verify the text contains meaningful words, not just random characters
  const meaningfulWords = extractedText.split(/\s+/).filter(word => 
    word.length > 2 && 
    /^[A-Za-z]/.test(word) && 
    !/^[A-Z]{3,}$/.test(word) && // Not all caps abbreviations
    word.toLowerCase() !== word.toUpperCase() // Has mixed case or lowercase
  );
  
  if (meaningfulWords.length < 10) {
    console.log('Text does not contain enough meaningful words. Meaningful word count:', meaningfulWords.length);
    console.log('Sample meaningful words:', meaningfulWords.slice(0, 10));
    
    return {
      isValid: false,
      error: 'The PDF appears to contain mostly formatting codes or non-readable content. Please upload a PDF with clear, readable text content.'
    };
  }

  console.log('Meaningful words found:', meaningfulWords.length);
  console.log('Sample words:', meaningfulWords.slice(0, 20).join(', '));

  return {
    isValid: true,
    meaningfulWords
  };
}
