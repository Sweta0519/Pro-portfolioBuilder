import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Set up PDF.js worker using a robust URL resolution for Vite
const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extracts raw text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // More sophisticated text extraction that preserves layout/lines
      const items = textContent.items as any[];
      const lineMap: { [key: number]: any[] } = {};

      items.forEach((item) => {
        // Round Y coordinate to group items on the same visual line
        // We use a small threshold (5 units) to account for slight misalignments
        const y = Math.round(item.transform[5] / 5) * 5;
        if (!lineMap[y]) lineMap[y] = [];
        lineMap[y].push(item);
      });

      // Sort lines from top to bottom (PDF coordinates are bottom-up)
      const sortedY = Object.keys(lineMap)
        .map(Number)
        .sort((a, b) => b - a);

      sortedY.forEach((y) => {
        // Sort items in each line from left to right
        const lineItems = lineMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
        const lineText = lineItems
          .map((item) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim();

        if (lineText) {
          fullText += lineText + '\n';
        }
      });
    }

    return fullText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. Please try copy-pasting instead.');
  }
}

/**
 * Extracts raw text from a Word (.docx) file
 */
export async function extractTextFromWord(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document. Please try copy-pasting instead.');
  }
}

/**
 * Detects file type and extracts text accordingly
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  } else if (fileName.endsWith('.docx')) {
    return await extractTextFromWord(file);
  } else {
    // For .txt, .json, etc.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }
}
