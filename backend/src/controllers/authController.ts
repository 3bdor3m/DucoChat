import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateResetToken } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      throw new AppError('جميع الحقول مطلوبة', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('البريد الإلكتروني مستخدم بالفعل', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        isVerified: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في التسجيل', 500);
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('البريد الإلكتروني وكلمة المرور مطلوبان', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('بيانات الدخول غير صحيحة', 401);
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('بيانات الدخول غير صحيحة', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('الحساب غير نشط', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      accessToken: token,
      tokenType: 'bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionTier: user.subscriptionTier,
      },
    });
    const cookieOptions = {
      httpOnly: true, // يمنع الوصول للكوكيز من خلال الجافاسكريبت في المتصفح
      secure: process.env.NODE_ENV === 'production', // تفعيل HTTPS فقط في الإنتاج
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      maxAge: 3600 * 1000, // ساعة واحدة (يجب أن تطابق صلاحية التوكن)
    };

    // إرسال التوكن في الكوكيز
    res.cookie('jwt', token, cookieOptions);

    // إرسال رد النجاح (بدون التوكن في الـ body)
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionTier: user.subscriptionTier,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في تسجيل الدخول', 500);
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        isVerified: true,
        subscriptionTier: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    res.json(user);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في جلب بيانات المستخدم', 500);
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين' });
      return;
    }

    // Generate reset token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    // await sendResetEmail(user.email, token);

    res.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
  } catch (error) {
    throw new AppError('خطأ في إرسال رابط إعادة التعيين', 500);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Find valid reset token
    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new AppError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في إعادة تعيين كلمة المرور', 500);
  }
};
