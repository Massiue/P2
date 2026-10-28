import { query } from '../config/db.js';

const notifyComplaintDecision = async (complaint, staffName, decision) => {
  const admins = await query('SELECT id FROM Users WHERE role = ?', ['admin']);
  const recipients = [...new Set([complaint.citizen_id, ...admins.map((admin) => admin.id)])];
  const title = decision === 'Accepted' ? 'Task accepted' : 'Task declined';
  const message = decision === 'Accepted'
    ? `${staffName} accepted complaint #${complaint.id} for pole ${complaint.pole_number}.`
    : `${staffName} declined complaint #${complaint.id} for pole ${complaint.pole_number}. It is available for reassignment.`;

  await Promise.all(recipients.map((userId) => query(
    'INSERT INTO Notifications (user_id, complaint_id, title, message) VALUES (?, ?, ?, ?)',
    [userId, complaint.id, title, message]
  )));
};

// Citizen: Report a Faulty Street Light
export const createComplaint = async (req, res) => {
  try {
    const { pole_number, area, description } = req.body;
    const citizen_id = req.user.id;

    if (!pole_number || !area || !description) {
      return res.status(400).json({ message: 'Pole number, area, and description are required.' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Create complaint
    const result = await query(
      'INSERT INTO Complaints (citizen_id, pole_number, area, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [citizen_id, pole_number, area, description, image_url, 'Pending']
    );

    // Also update StreetLight status to 'faulty' or insert light if new
    const existingLights = await query('SELECT * FROM StreetLights WHERE pole_number = ?', [pole_number]);
    if (existingLights.length > 0) {
      await query('UPDATE StreetLights SET status = ? WHERE pole_number = ?', ['faulty', pole_number]);
    } else {
      await query('INSERT INTO StreetLights (pole_number, area, status) VALUES (?, ?, ?)', [pole_number, area, 'faulty']);
    }

    res.status(201).json({
      message: 'Fault reported successfully! Your complaint is logged.',
      complaintId: result.insertId
    });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    res.status(500).json({ message: 'Failed to log fault complaint. ' + error.message });
  }
};

// Citizen: View Own Complaints
export const getMyComplaints = async (req, res) => {
  try {
    const citizen_id = req.user.id;

    // Exclude complaints that were completed more than 24 hours ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cutoffStr = cutoff.toISOString().slice(0, 19).replace('T', ' ');

    const complaints = await query(
      `SELECT c.*, 
              u.name as assigned_staff_name, u.phone as assigned_staff_phone,
              m.repair_notes, m.repair_image_url, m.completed_at
       FROM Complaints c
       LEFT JOIN Users u ON c.assigned_staff_id = u.id
       LEFT JOIN Maintenance m ON c.id = m.complaint_id
       WHERE c.citizen_id = ?
         AND NOT (c.status = 'Completed' AND m.completed_at IS NOT NULL AND m.completed_at <= ?)
       ORDER BY c.created_at DESC`,
      [citizen_id, cutoffStr]
    );

    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Get My Complaints Error:', error);
    res.status(500).json({ message: 'Failed to fetch complaints. ' + error.message });
  }
};

// Admin: View All Complaints (with optional filtering)
export const getAllComplaints = async (req, res) => {
  try {
    const { status, area, search } = req.query;

    let sql = `
      SELECT c.*, 
             citizen.name as citizen_name, citizen.email as citizen_email, citizen.phone as citizen_phone,
             staff.name as staff_name, staff.phone as staff_phone,
             m.repair_notes, m.repair_image_url, m.completed_at
      FROM Complaints c
      JOIN Users citizen ON c.citizen_id = citizen.id
      LEFT JOIN Users staff ON c.assigned_staff_id = staff.id
      LEFT JOIN Maintenance m ON c.id = m.complaint_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }
    if (area) {
      sql += ` AND c.area LIKE ?`;
      params.push(`%${area}%`);
    }
    if (search) {
      sql += ` AND (c.pole_number LIKE ? OR c.description LIKE ? OR citizen.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Exclude complaints that were completed more than 24 hours ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cutoffStr = cutoff.toISOString().slice(0, 19).replace('T', ' ');

    sql += ` AND NOT (c.status = 'Completed' AND m.completed_at IS NOT NULL AND m.completed_at <= ?)`;
    params.push(cutoffStr);

    sql += ` ORDER BY c.created_at DESC`;

    const complaints = await query(sql, params);
    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Get All Complaints Error:', error);
    res.status(500).json({ message: 'Failed to fetch all complaints. ' + error.message });
  }
};

// Admin: Assign Complaint to Staff
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id } = req.body;

    if (!staff_id) {
      return res.status(400).json({ message: 'Staff ID is required.' });
    }

    // Verify staff exists and is staff role
    const staff = await query('SELECT * FROM Users WHERE id = ? AND role = ?', [staff_id, 'staff']);
    if (staff.length === 0) {
      return res.status(404).json({ message: 'Maintenance staff member not found.' });
    }

    await query(
      'UPDATE Complaints SET assigned_staff_id = ?, status = ? WHERE id = ?',
      [staff_id, 'Pending', id]
    );

    // Get complaint pole number to set street light under maintenance
    const complaints = await query('SELECT pole_number FROM Complaints WHERE id = ?', [id]);
    if (complaints.length > 0) {
      await query('UPDATE StreetLights SET status = ? WHERE pole_number = ?', ['under_maintenance', complaints[0].pole_number]);
    }

    res.status(200).json({ message: `Complaint assigned to ${staff[0].name} successfully.` });
  } catch (error) {
    console.error('Assign Complaint Error:', error);
    res.status(500).json({ message: 'Failed to assign complaint. ' + error.message });
  }
};

// Staff: View Assigned Complaints
export const getAssignedComplaints = async (req, res) => {
  try {
    const staff_id = req.user.id;

    const complaints = await query(
      `SELECT c.*, 
              citizen.name as citizen_name, citizen.phone as citizen_phone, citizen.email as citizen_email,
              m.id as maintenance_id, m.repair_notes, m.repair_image_url, m.completed_at
       FROM Complaints c
       JOIN Users citizen ON c.citizen_id = citizen.id
       LEFT JOIN Maintenance m ON c.id = m.complaint_id
       WHERE c.assigned_staff_id = ?
         AND c.status != 'Completed'
       ORDER BY CASE c.status WHEN 'Accepted' THEN 1 WHEN 'Pending' THEN 2 WHEN 'In Progress' THEN 3 WHEN 'Declined' THEN 4 ELSE 5 END, c.created_at DESC`,
      [staff_id]
    );

    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Get Staff Complaints Error:', error);
    res.status(500).json({ message: 'Failed to fetch assigned tasks. ' + error.message });
  }
};

// Staff: Accept or decline assigned work
export const acceptAssignedComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const staff_id = req.user.id;

    const complaint = await query('SELECT * FROM Complaints WHERE id = ? AND assigned_staff_id = ?', [id, staff_id]);
    if (complaint.length === 0) {
      return res.status(404).json({ message: 'Assigned complaint not found.' });
    }

    await query('UPDATE Complaints SET status = ? WHERE id = ?', ['Accepted', id]);
    await query('UPDATE StreetLights SET status = ? WHERE pole_number = ?', ['under_maintenance', complaint[0].pole_number]);
    await notifyComplaintDecision(complaint[0], req.user.name || 'Assigned staff', 'Accepted');

    res.status(200).json({ message: 'Task accepted.' });
  } catch (error) {
    console.error('Accept Assigned Complaint Error:', error);
    res.status(500).json({ message: 'Failed to accept task. ' + error.message });
  }
};

export const declineAssignedComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const staff_id = req.user.id;

    const complaint = await query('SELECT * FROM Complaints WHERE id = ? AND assigned_staff_id = ?', [id, staff_id]);
    if (complaint.length === 0) {
      return res.status(404).json({ message: 'Assigned complaint not found.' });
    }

    await query('UPDATE Complaints SET assigned_staff_id = ?, status = ? WHERE id = ?', [null, 'Declined', id]);
    await query('UPDATE StreetLights SET status = ? WHERE pole_number = ?', ['faulty', complaint[0].pole_number]);
    await notifyComplaintDecision(complaint[0], req.user.name || 'Assigned staff', 'Declined');

    res.status(200).json({ message: 'Task declined and returned for reassignment.' });
  } catch (error) {
    console.error('Decline Assigned Complaint Error:', error);
    res.status(500).json({ message: 'Failed to decline task. ' + error.message });
  }
};

// Staff / Admin: Update Complaint Status & Log Repair Notes / Photo
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, repair_notes } = req.body;
    const staff_id = req.user.id;

    if (!['Pending', 'Accepted', 'Declined', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const complaint = await query('SELECT * FROM Complaints WHERE id = ?', [id]);
    if (complaint.length === 0) {
      return res.status(404).json({ message: 'Complaint record not found.' });
    }

    const repair_image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Update Complaint
    await query('UPDATE Complaints SET status = ? WHERE id = ?', [status, id]);

    // Update Street Light Status if completed
    if (status === 'Completed') {
      await query('UPDATE StreetLights SET status = ? WHERE pole_number = ?', ['working', complaint[0].pole_number]);
    } else if (status === 'In Progress') {
      await query('UPDATE StreetLights SET status = ? WHERE pole_number = ?', ['under_maintenance', complaint[0].pole_number]);
    }

    // Insert or update Maintenance log
    const existingMaint = await query('SELECT * FROM Maintenance WHERE complaint_id = ?', [id]);

    const completedAt = status === 'Completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    if (existingMaint.length > 0) {
      let updateSql = 'UPDATE Maintenance SET repair_notes = COALESCE(?, repair_notes)';
      const updateParams = [repair_notes];
      if (repair_image_url) {
        updateSql += ', repair_image_url = ?';
        updateParams.push(repair_image_url);
      }
      if (completedAt) {
        updateSql += ', completed_at = ?';
        updateParams.push(completedAt);
      }
      updateSql += ' WHERE complaint_id = ?';
      updateParams.push(id);
      await query(updateSql, updateParams);
    } else {
      await query(
        'INSERT INTO Maintenance (complaint_id, staff_id, repair_notes, repair_image_url, completed_at) VALUES (?, ?, ?, ?, ?)',
        [id, staff_id, repair_notes || 'Status updated', repair_image_url, completedAt]
      );
    }

    // The unique complaint_id in CreditHistory makes this award idempotent.
    if (status === 'Completed' && complaint[0].assigned_staff_id) {
      try {
        const creditResult = await query(
          'INSERT INTO CreditHistory (complaint_id, staff_id, points, completed_at) VALUES (?, ?, ?, ?)',
          [id, complaint[0].assigned_staff_id, 20, completedAt]
        );

        if (creditResult.affectedRows === 1) {
          await query(
            `UPDATE Users
             SET credit_points = (SELECT COALESCE(SUM(points), 0) FROM CreditHistory WHERE staff_id = ?)
             WHERE id = ? AND role = ?`,
            [complaint[0].assigned_staff_id, complaint[0].assigned_staff_id, 'staff']
          );
        }
      } catch (creditError) {
        const duplicateCredit = creditError.code === 'ER_DUP_ENTRY' || /UNIQUE constraint failed/i.test(creditError.message);
        if (!duplicateCredit) {
          throw creditError;
        }
        await query(
          `UPDATE Users
           SET credit_points = (SELECT COALESCE(SUM(points), 0) FROM CreditHistory WHERE staff_id = ?)
           WHERE id = ? AND role = ?`,
          [complaint[0].assigned_staff_id, complaint[0].assigned_staff_id, 'staff']
        );
      }
    }

    res.status(200).json({ message: `Complaint status updated to '${status}' successfully.` });
  } catch (error) {
    console.error('Update Complaint Error:', error);
    res.status(500).json({ message: 'Failed to update complaint status. ' + error.message });
  }
};

// Admin Dashboard Summary Metrics
export const getDashboardStats = async (req, res) => {
  try {
    const totalComplaintsRes = await query('SELECT COUNT(*) as count FROM Complaints');
    const pendingRes = await query("SELECT COUNT(*) as count FROM Complaints WHERE status = 'Pending'");
    const inProgressRes = await query("SELECT COUNT(*) as count FROM Complaints WHERE status = 'In Progress'");
    const completedRes = await query("SELECT COUNT(*) as count FROM Complaints WHERE status = 'Completed'");
    
    const staffCountRes = await query("SELECT COUNT(*) as count FROM Users WHERE role = 'staff'");
    const citizenCountRes = await query("SELECT COUNT(*) as count FROM Users WHERE role = 'citizen'");
    const streetLightCountRes = await query('SELECT COUNT(*) as count FROM StreetLights');
    const faultyLightsRes = await query("SELECT COUNT(*) as count FROM StreetLights WHERE status != 'working'");
    const staffCreditsRes = await query(`
      SELECT u.id, u.name, u.credit_points,
             COUNT(ch.id) as completed_works
      FROM Users u
      LEFT JOIN CreditHistory ch ON ch.staff_id = u.id
      WHERE u.role = 'staff'
      GROUP BY u.id, u.name, u.credit_points
      ORDER BY u.name ASC
    `);

    res.status(200).json({
      stats: {
        totalComplaints: totalComplaintsRes[0]?.count || 0,
        pendingComplaints: pendingRes[0]?.count || 0,
        inProgressComplaints: inProgressRes[0]?.count || 0,
        completedComplaints: completedRes[0]?.count || 0,
        totalStaff: staffCountRes[0]?.count || 0,
        totalCitizens: citizenCountRes[0]?.count || 0,
        totalStreetLights: streetLightCountRes[0]?.count || 0,
        faultyStreetLights: faultyLightsRes[0]?.count || 0,
        staffCredits: staffCreditsRes
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard statistics. ' + error.message });
  }
};

// Staff / Admin: View credit points and the completed work history
export const getCreditHistory = async (req, res) => {
  try {
    const staffId = req.user.role === 'staff' ? req.user.id : req.query.staff_id;
    const params = [];
    let whereSql = '';

    if (staffId) {
      whereSql = 'WHERE h.staff_id = ?';
      params.push(staffId);
    }

    const history = await query(`
      SELECT h.id, h.complaint_id, h.staff_id, h.points, h.completed_at,
             u.name as staff_name, c.pole_number, c.area, c.description
      FROM CreditHistory h
      JOIN Users u ON u.id = h.staff_id
      JOIN Complaints c ON c.id = h.complaint_id
      ${whereSql}
      ORDER BY h.completed_at DESC
    `, params);

    const total = history.reduce((sum, item) => sum + Number(item.points), 0);
    res.status(200).json({ creditPoints: total, completedWorks: history.length, history });
  } catch (error) {
    console.error('Credit History Error:', error);
    res.status(500).json({ message: 'Failed to retrieve credit point history. ' + error.message });
  }
};
