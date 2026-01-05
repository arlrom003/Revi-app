import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

export async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

export async function parseUploadedFile(file) {
  const { path, mimetype } = file;
  
  let text = '';
  
  if (mimetype === 'application/pdf') {
    text = await extractTextFromPDF(path);
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await extractTextFromDocx(path);
  } else {
    throw new Error('Unsupported file type');
  }
  
  // Clean up uploaded file
  await fs.unlink(path);
  
  return text;
}
