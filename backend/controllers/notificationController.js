import { query } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await query(
      'SELECT id, complaint_id, title, message, is_read, created_at FROM Notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 20',
      [req.user.id]
    );

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const result = await query(
      'UPDATE Notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ message: 'Failed to update notification.' });
  }
};