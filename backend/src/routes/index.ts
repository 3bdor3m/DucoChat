import { Router } from 'express';
import authRoutes from './authRoutes';
import fileRoutes from './fileRoutes';
import chatRoutes from './chatRoutes';
import messageRoutes from './messageRoutes';
import notificationRoutes from './notificationRoutes';
import activationCodeRoutes from './activationCodeRoutes';
import userRoutes from './userRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/chats', chatRoutes);
router.use('/chats', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activation-codes', activationCodeRoutes);
router.use('/users', userRoutes);

export default router;
