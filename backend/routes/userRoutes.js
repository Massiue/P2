import express from 'express';
import { getUsers, createStaff, updateUserRole, deleteUser } from '../controllers/userController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, checkRole(['admin']), getUsers);
router.post('/staff', verifyToken, checkRole(['admin']), createStaff);
router.put('/:id/role', verifyToken, checkRole(['admin']), updateUserRole);
router.delete('/:id', verifyToken, checkRole(['admin']), deleteUser);

export default router;
