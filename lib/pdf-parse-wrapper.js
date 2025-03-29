// Fix for pdf-parse library that tries to access test files in debug mode
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
export default pdfParse;