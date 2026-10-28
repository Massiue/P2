import express from 'express';
import { createFeedback, getAllFeedback } from '../controllers/feedbackController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, checkRole(['citizen']), createFeedback);
router.get('/', verifyToken, checkRole(['admin']), getAllFeedback);

export default router;
