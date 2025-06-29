
export function extractTextFromPDF(pdfData: string): string {
  try {
    // Decode base64 PDF data
    const binaryString = atob(pdfData);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    // Convert to string for processing
    const pdfString = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    let extractedText = '';
    
    // Strategy 1: Extract text from parentheses with strict filtering
    const parenthesesMatches = pdfString.match(/\(([^)]+)\)/g) || [];
    for (const match of parenthesesMatches) {
      let text = match.slice(1, -1)
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .trim();
      
      // Only include text that contains actual words (not just random characters)
      if (text.length > 5 && 
          /[a-zA-Z]{3,}/.test(text) && // Contains words of 3+ letters
          text.split(/\s+/).length > 1 && // Multiple words
          !/^[A-Z0-9\s]{10,}$/.test(text) && // Not all caps/numbers
          !text.includes('obj') && 
          !text.includes('endobj') &&
          !/^[^a-zA-Z]*$/.test(text)) { // Contains letters
        extractedText += text + ' ';
      }
    }
    
    // Strategy 2: Look for text after BT (Begin Text) commands
    const btMatches = pdfString.match(/BT[^E]*?ET/g) || [];
    for (const block of btMatches) {
      const textMatches = block.match(/\(([^)]+)\)/g) || [];
      for (const match of textMatches) {
        let text = match.slice(1, -1).trim();
        if (text.length > 3 && /[a-zA-Z]/.test(text) && !/^[A-Z0-9\s]+$/.test(text)) {
          extractedText += text + ' ';
        }
      }
    }
    
    // Strategy 3: Look for text in show text operators (Tj, TJ)
    const showTextMatches = pdfString.match(/\(([^)]+)\)\s*T[jJ]/g) || [];
    for (const match of showTextMatches) {
      let text = match.replace(/\)\s*T[jJ]$/, '').slice(1).trim();
      if (text.length > 3 && /[a-zA-Z]{2,}/.test(text)) {
        extractedText += text + ' ';
      }
    }
    
    // Strategy 4: Extract text from array format [(text)]
    const arrayTextMatches = pdfString.match(/\[\s*\(([^)]+)\)\s*\]/g) || [];
    for (const match of arrayTextMatches) {
      let text = match.match(/\(([^)]+)\)/)?.[1]?.trim();
      if (text && text.length > 3 && /[a-zA-Z]/.test(text)) {
        extractedText += text + ' ';
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/\b[A-Z]{5,}\b/g, '') // Remove long sequences of capitals
      .replace(/\b\d+\s*\d+\s*\d+\b/g, '') // Remove number sequences
      .replace(/[^\w\s.,!?;:()\-'"]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Clean up spaces again
      .trim();
    
    // Remove common PDF artifacts
    const artifactPatterns = [
      /\b[A-Z]{2}\d+\b/g, // Font references like "F1", "TT2"
      /\b\d+\s+\d+\s+obj\b/g, // Object references
      /\bstream\b/g,
      /\bendstream\b/g,
      /\bxref\b/g,
      /\btrailer\b/g,
      /\bstartxref\b/g,
      /\b%%EOF\b/g,
    ];
    
    for (const pattern of artifactPatterns) {
      extractedText = extractedText.replace(pattern, ' ');
    }
    
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    
    console.log('Final extracted text length:', extractedText.length);
    console.log('Extracted text sample (first 500 chars):', extractedText.substring(0, 500));
    console.log('Word count:', extractedText.split(/\s+/).filter(word => word.length > 2).length);
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}
