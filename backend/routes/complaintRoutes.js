import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignComplaint,
  getAssignedComplaints,
  acceptAssignedComplaint,
  declineAssignedComplaint,
  updateComplaintStatus,
  getDashboardStats,
  getCreditHistory
} from '../controllers/complaintController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Admin Dashboard stats
router.get('/stats', verifyToken, checkRole(['admin']), getDashboardStats);
router.get('/credits', verifyToken, checkRole(['admin', 'staff']), getCreditHistory);

// Citizen routes
router.post('/', verifyToken, checkRole(['citizen', 'admin']), upload.single('image'), createComplaint);
router.get('/my', verifyToken, checkRole(['citizen']), getMyComplaints);

// Admin routes
router.get('/all', verifyToken, checkRole(['admin']), getAllComplaints);
router.put('/:id/assign', verifyToken, checkRole(['admin']), assignComplaint);

// Staff routes
router.get('/assigned', verifyToken, checkRole(['staff']), getAssignedComplaints);
router.put('/:id/accept', verifyToken, checkRole(['staff']), acceptAssignedComplaint);
router.put('/:id/decline', verifyToken, checkRole(['staff']), declineAssignedComplaint);
router.put('/:id/status', verifyToken, checkRole(['staff', 'admin']), upload.single('image'), updateComplaintStatus);

export default router;
