import { Router } from 'express';
import { activateCode, generateActivationCodes } from '../controllers/activationCodeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/activate', authenticate, activateCode);
router.post('/generate', generateActivationCodes);

export default router;