-- Seed Data for Smart LED Street Lighting Database
USE smart_light_db;

-- Passwords hashed with bcrypt for 'admin123', 'staff123', 'citizen123'
-- Hash for 'admin123': $2a$10$wN9F84sW.sCjD59l.k96/u.f5p.g/M5E7S7uX0m2E3e3.f9y1z7q2 (or handled programmatically in seed fallback)

INSERT INTO Users (name, email, password, role, phone) VALUES
('Admin User', 'admin@smartlight.com', '$2a$10$4.6c6fQ3/O/n.N2cT4F01.PjPj.3O1.1O1.1O1.1O1.1O1.1O1.1', 'admin', '9876543210'),
('John Repair', 'staff@smartlight.com', '$2a$10$4.6c6fQ3/O/n.N2cT4F01.PjPj.3O1.1O1.1O1.1O1.1O1.1O1.1', 'staff', '9876543211'),
('Sarah Tech', 'staff2@smartlight.com', '$2a$10$4.6c6fQ3/O/n.N2cT4F01.PjPj.3O1.1O1.1O1.1O1.1O1.1O1.1', 'staff', '9876543212'),
('Alice Citizen', 'citizen@smartlight.com', '$2a$10$4.6c6fQ3/O/n.N2cT4F01.PjPj.3O1.1O1.1O1.1O1.1O1.1O1.1', 'citizen', '9876543213');

INSERT INTO StreetLights (pole_number, area, status, latitude, longitude) VALUES
('SL-101', 'Downtown Sector 1', 'faulty', 12.9716, 77.5946),
('SL-102', 'Downtown Sector 1', 'working', 12.9720, 77.5950),
('SL-201', 'Green Park Colony', 'faulty', 12.9800, 77.6000),
('SL-202', 'Green Park Colony', 'under_maintenance', 12.9810, 77.6010),
('SL-301', 'Industrial Area Zone B', 'working', 12.9900, 77.6100),
('SL-401', 'North Market Road', 'working', 12.9650, 77.5850);

INSERT INTO Complaints (citizen_id, pole_number, area, description, status, assigned_staff_id) VALUES
(4, 'SL-101', 'Downtown Sector 1', 'LED panel flickering continuously at night causing visibility issues.', 'Pending', NULL),
(4, 'SL-201', 'Green Park Colony', 'Street light complete outage after heavy rains yesterday.', 'In Progress', 2);

INSERT INTO Maintenance (complaint_id, staff_id, repair_notes, completed_at) VALUES
(2, 2, 'Inspected light pole SL-201. Internal wire fuse blown due to power surge. Replacing fuse module.', NULL);
