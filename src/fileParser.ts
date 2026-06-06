import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Use jsDelivr CDN for the worker — cdnjs doesn't host specific sub-versions or formats (returning 404).
// jsDelivr NPM integration works perfectly and reliably handles standard .min.mjs files.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Helper to convert a file to ArrayBuffer, falling back to FileReader
 * for older mobile browsers and in-app webviews lacking file.arrayBuffer()
 */
function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer.'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Helper to wrap a promise in a timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Extracts raw text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const parsePromise = (async () => {
    const arrayBuffer = await fileToArrayBuffer(file);
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Ensure textContent and textContent.items are valid
      if (!textContent || !Array.isArray(textContent.items)) continue;

      const items = textContent.items as any[];
      const lineMap: { [key: number]: any[] } = {};

      items.forEach((item) => {
        // Ensure item exists and has a valid transform array (MarkedContent doesn't have transform)
        if (!item || !Array.isArray(item.transform) || item.transform.length < 6) return;

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
  })();

  try {
    // 10 second timeout for the entire PDF parsing process
    return await withTimeout(
      parsePromise,
      10000,
      'PDF parsing timed out. The file might be too large or the library worker failed to load. Please try copy-pasting the text instead.'
    );
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw new Error(error.message || 'Failed to extract text from PDF. Please try copy-pasting instead.');
  }
}

/**
 * Extracts raw text from a Word (.docx) file
 */
export async function extractTextFromWord(file: File): Promise<string> {
  try {
    const arrayBuffer = await fileToArrayBuffer(file);
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
