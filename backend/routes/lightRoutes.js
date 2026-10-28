import express from 'express';
import { getStreetLights, addStreetLight, updateStreetLight, deleteStreetLight } from '../controllers/lightController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getStreetLights);
router.post('/', verifyToken, checkRole(['admin']), addStreetLight);
router.put('/:id', verifyToken, checkRole(['admin']), updateStreetLight);
router.delete('/:id', verifyToken, checkRole(['admin']), deleteStreetLight);

export default router;
