// Cache of script loading promises to avoid duplicate loading
const scriptCache = new Map<string, Promise<any>>();

/**
 * Dynamically loads a script from a CDN URL and resolves with the global variable it exports.
 * 
 * @param src The CDN URL of the script.
 * @param globalVar The name of the global variable exported by the script on window (e.g. 'JSZip').
 * @returns A promise that resolves to the loaded library global object.
 */
export function loadScript(src: string, globalVar: string): Promise<any> {
  // If the library is already available on window, resolve immediately
  if ((window as any)[globalVar] !== undefined) {
    return Promise.resolve((window as any)[globalVar]);
  }

  // If a loading promise for this script already exists, return it
  if (scriptCache.has(src)) {
    return scriptCache.get(src)!;
  }

  const promise = new Promise<any>((resolve, reject) => {
    // Double check just in case it got populated during task switching
    if ((window as any)[globalVar] !== undefined) {
      resolve((window as any)[globalVar]);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.type = 'text/javascript';

    script.onload = () => {
      // Small timeout to let global initialization complete if necessary
      setTimeout(() => {
        const result = (window as any)[globalVar];
        if (result !== undefined) {
          resolve(result);
        } else {
          // Some libraries place their exports inside UMD objects
          if (globalVar === 'jspdf' && (window as any).jspdf) {
            resolve((window as any).jspdf);
          } else if (globalVar === 'docx' && (window as any).docx) {
            resolve((window as any).docx);
          } else {
            reject(new Error(`Script loaded successfully, but global variable '${globalVar}' was not found.`));
          }
        }
      }, 0);
    };

    script.onerror = () => {
      scriptCache.delete(src);
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}
