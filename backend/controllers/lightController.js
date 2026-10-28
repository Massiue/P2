import { query } from '../config/db.js';

const VALID_STATUSES = ['working', 'faulty', 'under_maintenance'];

// Get all street lights inventory
export const getStreetLights = async (req, res) => {
  try {
    const lights = await query('SELECT * FROM StreetLights ORDER BY pole_number ASC');
    res.status(200).json({ streetLights: lights });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch street lights.' });
  }
};

// Add new street light (Admin)
export const addStreetLight = async (req, res) => {
  try {
    const { pole_number, area, latitude, longitude } = req.body;
    if (!pole_number || !area) {
      return res.status(400).json({ message: 'Pole number and area are required.' });
    }

    await query(
      'INSERT INTO StreetLights (pole_number, area, status, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [pole_number, area, 'working', latitude || null, longitude || null]
    );

    res.status(201).json({ message: 'Street light pole added successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add street light pole. ' + error.message });
  }
};

// Update street light fields (Admin)
export const updateStreetLight = async (req, res) => {
  try {
    const { id } = req.params;
    const { area, status, latitude, longitude } = req.body;

    const existing = await query('SELECT * FROM StreetLights WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Street light not found.' });
    }

    const updates = [];
    const params = [];

    if (area) {
      updates.push('area = ?');
      params.push(area);
    }
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      updates.push('status = ?');
      params.push(status);
    }
    if (latitude !== undefined) {
      updates.push('latitude = ?');
      params.push(latitude || null);
    }
    if (longitude !== undefined) {
      updates.push('longitude = ?');
      params.push(longitude || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update.' });
    }

    params.push(id);
    await query(`UPDATE StreetLights SET ${updates.join(', ')} WHERE id = ?`, params);

    res.status(200).json({ message: 'Street light updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update street light. ' + error.message });
  }
};

// Remove faulty street light rows (Admin)
export const deleteStreetLight = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM StreetLights WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Street light not found.' });
    }

    await query('DELETE FROM StreetLights WHERE id = ?', [id]);
    res.status(200).json({ message: 'Street light removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove street light. ' + error.message });
  }
};
