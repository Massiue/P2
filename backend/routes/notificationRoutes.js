import express from 'express';
import { getNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markNotificationRead);

export default router;