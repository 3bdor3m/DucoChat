import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

interface AIRequest {
  chatId: string;
  fileId: string | null;
  userMessage: string;
  chatHistory: any[];
  settings?: {
    creativity_level?: number;
    search_mode?: boolean;
  };
}

interface AIResponse {
  content: string;
  sources?: {
    fileContentId: string;
    relevanceScore: number;
  }[];
  metadata?: any;
}

export const generateAIResponse = async (request: AIRequest): Promise<AIResponse> => {
  try {
    const { fileId, userMessage, chatHistory, settings } = request;

    // Get relevant content from file if fileId exists
    let context = '';
    let sources: { fileContentId: string; relevanceScore: number }[] = [];

    if (fileId) {
      const relevantContent = await findRelevantContent(fileId, userMessage);
      context = relevantContent.map(c => c.content).join('\n\n');
      sources = relevantContent.map(c => ({
        fileContentId: c.id,
        relevanceScore: 0.8, // Simple scoring for now
      }));
    }

    // Build conversation history
    const conversationHistory = chatHistory
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.messageType === 'user' ? 'المستخدم' : 'المساعد'}: ${msg.content}`)
      .join('\n\n');

    // Build prompt
    const systemPrompt = `أنت مساعد ذكي متخصص في الإجابة على الأسئلة بناءً على المستندات المقدمة.
${context ? `\n\nالمحتوى المرجعي:\n${context}` : ''}
${conversationHistory ? `\n\nسياق المحادثة السابقة:\n${conversationHistory}` : ''}

قواعد الإجابة:
1. أجب باللغة العربية بشكل واضح ومفصل
2. إذا كان هناك محتوى مرجعي، استخدمه في إجابتك
3. إذا لم تجد الإجابة في المحتوى المرجعي، قل ذلك بوضوح
4. كن دقيقاً ومفيداً
5. مستوى الإبداع: ${settings?.creativity_level || 50}%

السؤال: ${userMessage}`;

    // Get AI model
    const model = genAI.getGenerativeModel({ 
      model: config.geminiModel,
      generationConfig: {
        temperature: (settings?.creativity_level || 50) / 100,
        maxOutputTokens: 2000,
      },
    });

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      sources: sources.length > 0 ? sources : undefined,
      metadata: {
        model: config.geminiModel,
        creativity_level: settings?.creativity_level || 50,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('فشل في توليد الرد من الذكاء الاصطناعي');
  }
};

// Find relevant content from file using simple keyword matching
// In production, you would use vector embeddings and similarity search
const findRelevantContent = async (fileId: string, query: string) => {
  // Get all content chunks for the file
  const contents = await prisma.fileContent.findMany({
    where: { fileId },
    orderBy: { pageNumber: 'asc' },
  });

  // Simple keyword matching (in production, use embeddings)
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);

  const scored = contents.map(content => {
    const contentLower = content.content.toLowerCase();
    const score = keywords.reduce((acc, keyword) => {
      return acc + (contentLower.includes(keyword) ? 1 : 0);
    }, 0);
    return { ...content, score };
  });

  // Return top 3 most relevant chunks
  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};
