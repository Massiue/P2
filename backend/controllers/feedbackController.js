import { query } from '../config/db.js';

// Citizen: Submit optional feedback
export const createFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const citizenId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Feedback message is required.' });
    }

    const cleanSubject = subject?.trim() || 'General Feedback';
    const cleanMessage = message.trim();

    const result = await query(
      'INSERT INTO Feedback (citizen_id, subject, message) VALUES (?, ?, ?)',
      [citizenId, cleanSubject, cleanMessage]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully. Thank you for sharing your thoughts.',
      feedbackId: result.insertId
    });
  } catch (error) {
    console.error('Create Feedback Error:', error);
    res.status(500).json({ message: 'Failed to submit feedback. ' + error.message });
  }
};

// Admin: View all citizen feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await query(
      `SELECT f.*,
              u.name as citizen_name, u.email as citizen_email, u.phone as citizen_phone
       FROM Feedback f
       JOIN Users u ON f.citizen_id = u.id
       ORDER BY f.created_at DESC`
    );

    res.status(200).json({ feedback });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback. ' + error.message });
  }
};
