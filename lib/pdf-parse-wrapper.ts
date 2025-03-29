// Fix for pdf-parse library that tries to access test files in debug mode
// Using dynamic import to avoid debug mode issues
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import path from 'path';

// Set up a CommonJS require in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Directly import the pdf-parse.js file to bypass the debug mode in index.js
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// Export a wrapper function
export default function parse(dataBuffer: Buffer): Promise<{
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  text: string;
  version: string;
}> {
  return pdfParse(dataBuffer);
}