import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateAIResponse } from '../services/aiService';

const prisma = new PrismaClient();

// Send message and get AI response
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    if (!content || !content.trim()) {
      throw new AppError('محتوى الرسالة مطلوب', 400);
    }

    // Verify chat ownership
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { file: true },
    });

    if (!chat) {
      throw new AppError('المحادثة غير موجودة', 404);
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        messageType: 'user',
        content: content.trim(),
      },
    });

    // Get chat history for context
    const previousMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 10, // Last 10 messages for context
    });

    // Generate AI response
    const aiResponse = await generateAIResponse({
      chatId,
      fileId: chat.fileId,
      userMessage: content.trim(),
      chatHistory: previousMessages,
      settings: chat.settings as any,
    });

    // Save bot message
    const botMessage = await prisma.message.create({
      data: {
        chatId,
        messageType: 'bot',
        content: aiResponse.content,
        metadata: aiResponse.metadata,
      },
    });

    // Save sources if any
    if (aiResponse.sources && aiResponse.sources.length > 0) {
      await Promise.all(
        aiResponse.sources.map(source =>
          prisma.messageSource.create({
            data: {
              messageId: botMessage.id,
              fileContentId: source.fileContentId,
              relevanceScore: source.relevanceScore,
            },
          })
        )
      );
    }

    // Get bot message with sources
    const botMessageWithSources = await prisma.message.findUnique({
      where: { id: botMessage.id },
      include: {
        sources: {
          include: {
            fileContent: {
              select: {
                pageNumber: true,
                paragraphNumber: true,
                file: {
                  select: {
                    originalFilename: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Format response
    const formattedSources = botMessageWithSources?.sources.map(s => ({
      file: s.fileContent.file.originalFilename,
      page: s.fileContent.pageNumber,
      paragraph: s.fileContent.paragraphNumber,
      relevanceScore: s.relevanceScore,
    }));

    res.status(201).json({
      userMessage: {
        id: userMessage.id,
        chatId: userMessage.chatId,
        messageType: userMessage.messageType,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      botMessage: {
        id: botMessage.id,
        chatId: botMessage.chatId,
        messageType: botMessage.messageType,
        content: botMessage.content,
        sources: formattedSources,
        createdAt: botMessage.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error sending message:', error);
    throw new AppError('خطأ في إرسال الرسالة', 500);
  }
};

// Get messages for a chat
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify chat ownership
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new AppError('المحادثة غير موجودة', 404);
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        include: {
          sources: {
            include: {
              fileContent: {
                select: {
                  pageNumber: true,
                  paragraphNumber: true,
                  file: {
                    select: {
                      originalFilename: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    const items = messages.map(msg => ({
      id: msg.id,
      messageType: msg.messageType,
      content: msg.content,
      sources: msg.sources.map(s => ({
        file: s.fileContent.file.originalFilename,
        page: s.fileContent.pageNumber,
        paragraph: s.fileContent.paragraphNumber,
        relevanceScore: s.relevanceScore,
      })),
      createdAt: msg.createdAt,
    }));

    res.json({
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في جلب الرسائل', 500);
  }
};
