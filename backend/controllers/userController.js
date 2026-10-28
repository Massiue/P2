import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

const getStaffEmailFromName = (name) => {
  const normalizedName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${normalizedName}@staff.com`;
};

// Get list of users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, email, role, phone, credit_points, created_at FROM Users';
    const params = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }
    sql += ' ORDER BY created_at DESC';

    const users = await query(sql, params);
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// Create new Maintenance Staff member (Admin only)
export const createStaff = async (req, res) => {
  try {
    const { name, password, phone } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password are required for staff.' });
    }

    const email = getStaffEmailFromName(name);
    if (email === '@staff.com') {
      return res.status(400).json({ message: 'Staff name must include letters or numbers.' });
    }

    const existingUsers = await query('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO Users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'staff', phone || null]
    );

    res.status(201).json({
      message: 'Maintenance Staff member created successfully!',
      staff: {
        id: result.insertId,
        name,
        email,
        role: 'staff',
        phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create staff account. ' + error.message });
  }
};

// Update User Role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'staff', 'citizen'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, staff, or citizen.' });
    }

    const users = await query('SELECT * FROM Users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await query('UPDATE Users SET role = ? WHERE id = ?', [role, id]);

    res.status(200).json({ message: `Role updated to '${role}' successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role. ' + error.message });
  }
};

// Delete User (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await query('SELECT * FROM Users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await query('DELETE FROM Users WHERE id = ?', [id]);

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user. ' + error.message });
  }
};
