import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const prisma = new PrismaClient();

// Process uploaded file
export const processFile = async (fileId: string): Promise<void> => {
  try {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) return;

    // Update status to processing
    await prisma.file.update({
      where: { id: fileId },
      data: { status: 'processing' },
    });

    // Read file content based on type
    let textContent: string;
    let metadata: any = {};

    switch (file.fileType) {
      case '.pdf':
        textContent = await extractPdfText(file.storagePath);
        break;
      case '.docx':
      case '.doc':
        textContent = await extractDocxText(file.storagePath);
        break;
      case '.txt':
      case '.md':
        textContent = await extractTextFile(file.storagePath);
        break;
      default:
        throw new Error('نوع ملف غير مدعوم');
    }

    // Split content into chunks (pages/paragraphs)
    const chunks = splitTextIntoChunks(textContent);
    metadata.totalChunks = chunks.length;

    // Save chunks to database
    for (const chunk of chunks) {
      await prisma.fileContent.create({
        data: {
          fileId: file.id,
          pageNumber: chunk.page,
          paragraphNumber: chunk.paragraph,
          content: chunk.text,
          metadata: chunk.metadata,
        },
      });
    }

    // Update file status to completed
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'completed',
        metadata,
      },
    });
  } catch (error) {
    console.error('Error processing file:', error);
    await prisma.file.update({
      where: { id: fileId },
      data: {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'خطأ غير معروف',
      },
    });
  }
};

// Extract text from PDF
const extractPdfText = async (filePath: string): Promise<string> => {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

// Extract text from DOCX
const extractDocxText = async (filePath: string): Promise<string> => {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

// Extract text from TXT/MD
const extractTextFile = async (filePath: string): Promise<string> => {
  return fs.readFile(filePath, 'utf-8');
};

// Split text into chunks for RAG
interface TextChunk {
  page: number;
  paragraph: number;
  text: string;
  metadata?: any;
}

const splitTextIntoChunks = (text: string): TextChunk[] => {
  const chunks: TextChunk[] = [];
  
  // Split by paragraphs (double newline)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentPage = 1;
  let currentParagraph = 1;
  let currentChunk = '';
  const maxChunkSize = 1000; // characters

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    
    if (currentChunk.length + trimmed.length > maxChunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        page: currentPage,
        paragraph: currentParagraph,
        text: currentChunk.trim(),
      });
      
      currentChunk = trimmed;
      currentParagraph++;
      
      // Estimate page breaks (rough approximation)
      if (currentParagraph > 10) {
        currentPage++;
        currentParagraph = 1;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    }
  }

  // Add last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      page: currentPage,
      paragraph: currentParagraph,
      text: currentChunk.trim(),
    });
  }

  return chunks;
};
